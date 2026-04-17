import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 60;
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import Category from '@/models/Category';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

// Explicitly register models to avoid MissingSchemaError
const _Design = Design;
const _Category = Category;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const design = await Design.findById(id).populate('categoryId').populate('materials.materialId');

        if (!design) {
            return NextResponse.json({ message: 'Design not found' }, { status: 404 });
        }

        return NextResponse.json(design);
    } catch (error) {
        console.error("GET /api/designs/[id] error:", error);
        return NextResponse.json({ message: 'Error fetching design' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const { id } = await params;
        const body = await req.json();

        await dbConnect();
        const updatedDesign = await Design.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        });

        if (!updatedDesign) {
            return NextResponse.json({ message: 'Design not found' }, { status: 404 });
        }

        return NextResponse.json(updatedDesign);
    } catch (error: any) {
        console.error("PUT /api/designs/[id] error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'SKU or Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error updating design' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const { id } = await params;
        await dbConnect();

        // Soft delete
        const deletedDesign = await Design.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

        if (!deletedDesign) {
            return NextResponse.json({ message: 'Design not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Design deleted (Soft)' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting design' }, { status: 500 });
    }
}
