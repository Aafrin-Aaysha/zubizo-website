import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import Design from '@/models/Design'; 
import Admin from '@/models/Admin';
import { getAdminFromRequest, getEmployeeFromRequest, unauthorizedResponse } from '@/lib/api-auth';

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

        if (!designName) {
            return NextResponse.json({ message: 'designName is required' }, { status: 400 });
        }

        await dbConnect();

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
            designId: designId || null,
            designName,
            sku: sku || '',
            selectedPackage: selectedPackage || '',
            quantity: quantity || 0,
            estimatedTotal: estimatedTotal || 0,
            source: source || 'detail',
            customerName: customerName || '',
            email: email || '',
            phone: phone || '',
            status: 'New',
            assignedAdmin: assignedAdminId,
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

        const updatedInquiry = await Inquiry.findByIdAndUpdate(id, { $set: updates }, { new: true })
            .populate('designId')
            .populate('assignedTo', 'name empId');

        return NextResponse.json(updatedInquiry);
    } catch (error) {
        console.error("PUT /api/inquiries error:", error);
        return NextResponse.json({ message: 'Error updating inquiry' }, { status: 500 });
    }
}
