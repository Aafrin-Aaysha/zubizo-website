import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Design from '@/models/Design';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Fetch categories
        const categories = await Category.find({ isDeleted: false }).sort({ displayOrder: 1 }).lean();

        // Augment with design count for each category
        const augmentedCategories = await Promise.all(
            categories.map(async (cat: any) => {
                const count = await Design.countDocuments({
                    categoryId: cat._id,
                    isDeleted: false,
                    isActive: true
                });
                return { ...cat, designCount: count };
            })
        );

        return NextResponse.json(augmentedCategories);
    } catch (error) {
        console.error("GET /api/categories error:", error);
        return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const body = await req.json();

        // Slug generation handled by model pre-validate hook if missing
        await dbConnect();
        const newCategory = await Category.create(body);
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/categories error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Category name or slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ message: error.message || 'Error creating category' }, { status: 500 });
    }
}
