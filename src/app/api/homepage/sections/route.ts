import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HomePageSection from '@/models/HomePageSection';
import { bootstrapSections } from '@/lib/bootstrap-homepage';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

// GET all sections ordered
export async function GET() {
    await dbConnect();
    try {
        let sections = await HomePageSection.find({}).sort({ order: 1 });

        // Auto-bootstrap if empty
        if (sections.length === 0) {
            await HomePageSection.insertMany(bootstrapSections);
            sections = await HomePageSection.find({}).sort({ order: 1 });
        }

        return NextResponse.json(sections);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch sections" }, { status: 500 });
    }
}

// POST create a new section (Bootstrap or Add)
export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();
        const body = await req.json();
        const section = await HomePageSection.create(body);
        return NextResponse.json(section, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to create section" }, { status: 500 });
    }
}

// PUT bulk update (useful for reordering)
export async function PUT(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();
        const body = await req.json(); // Expected: array of sections with _id and order
        if (!Array.isArray(body)) {
            return NextResponse.json({ message: "Invalid data format" }, { status: 400 });
        }

        const updates = body.map(s =>
            HomePageSection.findByIdAndUpdate(s._id, { order: s.order, isVisible: s.isVisible }, { new: true })
        );

        await Promise.all(updates);
        return NextResponse.json({ message: "Sections updated successfully" });
    } catch (error) {
        return NextResponse.json({ message: "Failed to update sections" }, { status: 500 });
    }
}
