import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Material from '@/models/Material';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let query: any = {};
        if (category) {
            query.category = category;
        }

        const materials = await Material.find(query).populate('parentMaterialId').sort({ createdAt: -1 });
        return NextResponse.json(materials);
    } catch (error) {
        console.error("GET /api/admin/materials error:", error);
        return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();
        
        const material = new Material(data);
        await material.save();

        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
    }
}
