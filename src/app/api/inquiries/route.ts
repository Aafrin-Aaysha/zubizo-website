import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import Design from '@/models/Design'; // Register Design model for population
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
            const { searchParams } = new URL(req.url);
            const adminId = searchParams.get('adminId');
            if (adminId) query.assignedAdmin = adminId;
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
            source
        } = body;

        if (!designName) {
            return NextResponse.json({ message: 'designName is required' }, { status: 400 });
        }

        await dbConnect();
        const inquiry = await Inquiry.create({
            designId: designId || null,
            designName,
            sku: sku || '',
            selectedPackage: selectedPackage || '',
            quantity: quantity || 0,
            estimatedTotal: estimatedTotal || 0,
            source: source || 'detail',
            status: 'New',
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
