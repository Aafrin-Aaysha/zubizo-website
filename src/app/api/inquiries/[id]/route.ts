import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();
        const inquiry = await Inquiry.findById(id)
            .populate('designId')
            .populate('assignedTo', 'name empId');

        if (!inquiry) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

        return NextResponse.json(inquiry);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching order' }, { status: 500 });
    }
}
