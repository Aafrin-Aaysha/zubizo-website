import { NextResponse } from 'next/server';

export const revalidate = 60;
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        await dbConnect();

        const category = await Category.findOne({ slug, isDeleted: false });

        if (!category) {
            return NextResponse.json({ message: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("GET /api/categories/slug/[slug] error:", error);
        return NextResponse.json({ message: 'Error fetching category' }, { status: 500 });
    }
}
