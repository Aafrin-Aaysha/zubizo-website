import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const { id } = await params;
        const { name, description, displayOrder, isActive } = await req.json();

        await dbConnect();

        // Manual slug update in API because model pre-validate might not trigger correctly on updateOne/findByIdAndUpdate if not careful
        const slug = name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, slug, description, displayOrder, isActive },
            { new: true }
        );

        if (!updatedCategory) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("PUT /api/categories/[id] error:", error);
        return NextResponse.json({ message: 'Error updating category' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const { id } = await params;
        await dbConnect();

        // Soft Delete
        const deletedCategory = await Category.findByIdAndUpdate(id, { isDeleted: true });

        if (!deletedCategory) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error("DELETE /api/categories/[id] error:", error);
        return NextResponse.json({ message: 'Error deleting category' }, { status: 500 });
    }
}
