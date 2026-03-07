import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HomePageSection from '@/models/HomePageSection';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await req.json();
        const updated = await HomePageSection.findByIdAndUpdate(id, body, { new: true });
        if (!updated) {
            return NextResponse.json({ message: "Section not found" }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ message: "Failed to update section" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    const { id } = await params;
    try {
        const deleted = await HomePageSection.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ message: "Section not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Section deleted successfully" });
    } catch (error) {
        return NextResponse.json({ message: "Failed to delete section" }, { status: 500 });
    }
}
