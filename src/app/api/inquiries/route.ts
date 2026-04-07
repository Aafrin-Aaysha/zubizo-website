import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import Design from '@/models/Design'; 
import Admin from '@/models/Admin';
import { getAdminFromRequest, getEmployeeFromRequest, unauthorizedResponse } from '@/lib/api-auth';
import { applyDeduction, reverseDeduction } from '@/lib/inventoryEngine';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        const employee = await getEmployeeFromRequest(req);
        
        if (!admin && !employee) return unauthorizedResponse();

        await dbConnect();
        
        let query: any = {};
        if (employee) {
            query.assignedTo = employee.id;
        } else if (admin) {
            const adminDoc = await Admin.findById(admin.id);
            if (!adminDoc || (!adminDoc.showGlobalData)) {
                query.assignedAdmin = admin.id;
            }
        }

        const inquiries = await Inquiry.find(query)
            .populate('designId')
            .populate('assignedTo', 'name empId')
            .sort({ createdAt: -1 });
        return NextResponse.json(inquiries);
    } catch (error) {
        console.error("GET /api/inquiries error:", error);
        return NextResponse.json({ message: 'Error fetching inquiries' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            designId,
            designName,
            sku,
            selectedPackage,
            quantity,
            estimatedTotal,
            source,
            customerName,
            email,
            phone
        } = body;

        if (!designName && source !== 'contact_page' && source !== 'contact') {
            return NextResponse.json({ message: 'designName is required' }, { status: 400 });
        }

        await dbConnect();

        // Prevent Duplicate Inquiries (24-hour window)
        if (phone && phone.length > 5) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const duplicateQuery: any = { phone, createdAt: { $gte: twentyFourHoursAgo } };
            
            if (sku) {
                duplicateQuery.sku = sku;
            } else if (source === 'contact_page' || source === 'contact') {
                duplicateQuery.source = source;
            }

            const existingInquiry = await Inquiry.findOne(duplicateQuery);
            if (existingInquiry) {
                console.log(`Duplicate inquiry skipped for phone: ${phone}`);
                return NextResponse.json({ message: 'Duplicate skipped', duplicate: true, inquiry: existingInquiry }, { status: 200 });
            }
        }

        // 1. Fetch available admins for assignment
        const admins = await Admin.find({ role: { $in: ['admin', 'super-admin'] } });
        let assignedAdminId = null;

        if (admins.length > 0) {
            // 2. Random 50/50 assignment logic as requested
            const randomIndex = Math.floor(Math.random() * admins.length);
            assignedAdminId = admins[randomIndex]._id;
            console.log(`Assigned inquiry to admin: ${admins[randomIndex].name}`);
        }

        const inquiry = await Inquiry.create({
            customerName: customerName || '',
            email: email || '',
            phone: phone || '',
            status: 'New',
            assignedAdmin: assignedAdminId,
            source: source || 'detail',
            // Inquiry Stage Init
            interestedDesigns: designName ? [{
                designId: designId || null,
                name: designName,
                sku: sku || ''
            }] : [],
            approxQuantity: quantity || 0,
            // Quotation Stage Init (Auto-create first draft if design exists)
            quotations: designName ? [{
                name: 'Initial Quotation',
                design: {
                    designId: designId || null,
                    name: designName,
                    sku: sku || ''
                },
                quantity: quantity || 0,
                status: 'Draft'
            }] : [],
            // Legacy Fields for compatibility
            designId: designId || null,
            designName: designName || 'General Inquiry',
            sku: sku || '',
            quantity: quantity || 0,
            estimatedTotal: estimatedTotal || 0,
        });

        return NextResponse.json(inquiry, { status: 201 });
    } catch (error) {
        console.error("POST /api/inquiries error:", error);
        return NextResponse.json({ message: 'Error creating inquiry' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        const employee = await getEmployeeFromRequest(req);
        
        if (!admin && !employee) return unauthorizedResponse();

        const body = await req.json();
        const { id, ...updates } = body;

        await dbConnect();
        
        const inquiry = await Inquiry.findById(id);
        if (!inquiry) return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });

        // Authorization: Employee can only update assigned inquiries
        if (employee && inquiry.assignedTo?.toString() !== employee.id) {
            return unauthorizedResponse('Not assigned to this order');
        }

        // Handle specific business logic for transitions
        if (updates.status) {
            const now = new Date();
            if (updates.status === 'Confirmed' && inquiry.status !== 'Confirmed') {
                updates['timeline.confirmedAt'] = now;
            } else if (updates.status === 'Designing' && !inquiry.timeline?.designStartedAt) {
                updates['timeline.designStartedAt'] = now;
            } else if (updates.status === 'Design Confirmed' && !inquiry.timeline?.designConfirmedAt) {
                updates['timeline.designConfirmedAt'] = now;
            } else if (updates.status === 'Printing' && !inquiry.timeline?.printingStartedAt) {
                updates['timeline.printingStartedAt'] = now;
            } else if (updates.status === 'Delivered' && !inquiry.timeline?.deliveredAt) {
                updates['timeline.deliveredAt'] = now;
            }
        }

        // --- NEW: Handle Quotation Confirmation Logic ---
        if (updates.confirmedQuotationId) {
            const confirmedQuo = inquiry.quotations.id(updates.confirmedQuotationId);
            if (confirmedQuo) {
                // Unconfirm others
                inquiry.quotations.forEach((q: any) => {
                    q.status = q._id.toString() === updates.confirmedQuotationId ? 'Confirmed' : 'Draft';
                });
                // Sync legacy top-level fields for analytics/compat
                updates.designId = confirmedQuo.design.designId;
                updates.designName = confirmedQuo.design.name;
                updates.sku = confirmedQuo.design.sku;
                updates.quantity = confirmedQuo.quantity;
                updates.costing = confirmedQuo.costing;
                updates.billing = confirmedQuo.billing;
                updates.estimatedTotal = confirmedQuo.billing.totalBill;
            }
        }

        // --- INVENTORY DEDUCTION ENGINE ---
        // Now uses materials from the confirmed quotation
        const activeMaterials = inquiry.quotations.find((q: any) => q.status === 'Confirmed')?.costing?.materials 
                             || updates.costing?.materials 
                             || inquiry.costing?.materials;

        if (updates.hasOwnProperty('isInvoiced')) {
            const wasInvoiced = inquiry.isInvoiced || false;
            const willBeInvoiced = updates.isInvoiced;

            if (!wasInvoiced && willBeInvoiced && !inquiry.isInventoryDeducted) {
                await applyDeduction(activeMaterials, inquiry.assignedAdmin?.toString());
                updates.isInventoryDeducted = true;
            } else if (wasInvoiced && !willBeInvoiced && inquiry.isInventoryDeducted) {
                await reverseDeduction(activeMaterials, inquiry.assignedAdmin?.toString());
                updates.isInventoryDeducted = false;
            }
        } else if (inquiry.isInvoiced && inquiry.isInventoryDeducted && (updates.costing || updates.confirmedQuotationId)) {
            // Editing Order or Changing Quotation After Invoice
            await reverseDeduction(inquiry.costing?.materials, inquiry.assignedAdmin?.toString());
            await applyDeduction(activeMaterials, inquiry.assignedAdmin?.toString());
        }

        const updatedInquiry = await Inquiry.findByIdAndUpdate(id, { $set: updates }, { new: true })
            .populate('designId')
            .populate('assignedTo', 'name empId');

        return NextResponse.json(updatedInquiry);
    } catch (error) {
        console.error("PUT /api/inquiries error:", error);
        return NextResponse.json({ message: 'Error updating inquiry' }, { status: 500 });
    }
}
