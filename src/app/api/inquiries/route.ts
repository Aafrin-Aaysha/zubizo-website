import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import Design from '@/models/Design'; // Register Design model for population
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();
        const inquiries = await Inquiry.find()
            .populate('designId')
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
        if (!admin) return unauthorizedResponse();

        const { id, status } = await req.json();
        await dbConnect();
        const updatedInquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedInquiry) {
            return NextResponse.json({ message: 'Inquiry not found' }, { status: 404 });
        }
        return NextResponse.json(updatedInquiry);
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ message: 'Error fetching stats' }, { status: 500 });
    }
}
