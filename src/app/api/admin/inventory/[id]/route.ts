import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const body = await req.json();
        const { name, currentStock, unit, costPerUnit, lowStockThreshold, isActive, restockAmount } = body;

        await dbConnect();

        const material = await Material.findById(id);
        if (!material) return NextResponse.json({ message: 'Material not found' }, { status: 404 });

        // Check if name change causes duplicate
        if (name && name !== material.name) {
            const existing = await Material.findOne({ name, _id: { $ne: id } });
            if (existing) return NextResponse.json({ message: 'Material with this name already exists' }, { status: 400 });
        }

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (unit !== undefined) updates.unit = unit;
        if (costPerUnit !== undefined) updates.costPerUnit = costPerUnit;
        if (lowStockThreshold !== undefined) updates.lowStockThreshold = lowStockThreshold;
        if (isActive !== undefined) updates.isActive = isActive;

        // Special handling for restocking or stock adjustment
        if (restockAmount !== undefined) {
             updates.currentStock = material.currentStock + restockAmount;
             updates.lastRestockedAt = new Date();
        } else if (currentStock !== undefined) {
             updates.currentStock = currentStock;
        }

        const updatedMaterial = await Material.findByIdAndUpdate(id, { $set: updates }, { new: true });
        return NextResponse.json(updatedMaterial);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating inventory' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();

        // Soft delete (or full delete depending on preference)
        const deletedMaterial = await Material.findByIdAndDelete(id);
        if (!deletedMaterial) return NextResponse.json({ message: 'Material not found' }, { status: 404 });

        return NextResponse.json({ message: 'Material deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting material' }, { status: 500 });
    }
}
