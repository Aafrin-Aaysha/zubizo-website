import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Material from '@/models/Material';

export async function PUT(request: Request, context: { params: any }) {
    try {
        await connectDB();
        const params = await context.params;
        const data = await request.json();
        
        const material = await Material.findByIdAndUpdate(params.id, data, { new: true });
        if (!material) {
            return NextResponse.json({ error: 'Material not found' }, { status: 404 });
        }

        return NextResponse.json(material);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: { params: any }) {
    try {
        await connectDB();
        const params = await context.params;
        
        const material = await Material.findByIdAndDelete(params.id);
        if (!material) {
            return NextResponse.json({ error: 'Material not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Material deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
    }
}
