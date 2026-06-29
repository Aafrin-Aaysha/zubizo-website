import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import MaterialCategory from '@/models/MaterialCategory';

export const dynamic = 'force-dynamic';

// Ensure DB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo';
if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGODB_URI);
}

export async function GET() {
    try {
        const categories = await MaterialCategory.find().sort({ order: 1, createdAt: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("GET /api/admin/categories error:", error);
        return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;
        
        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }
        
        // Count existing to set order
        const count = await MaterialCategory.countDocuments();
        
        const category = await MaterialCategory.create({ 
            name,
            order: count
        });
        
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        console.error("POST /api/admin/categories error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Category already exists' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error creating category' }, { status: 500 });
    }
}
