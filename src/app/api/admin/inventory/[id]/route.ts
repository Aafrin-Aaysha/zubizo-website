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
        const { name, category, usageType, usageValue, currentStock, unit, defaultPrice, lowStockThreshold, isActive, restockAmount } = body;

        await dbConnect();

        const material = await Material.findById(id);
        if (!material) return NextResponse.json({ message: 'Material not found' }, { status: 404 });

        // Access Control: Ensure the material belongs to the logged-in admin OR user is super-admin
        if (material.adminId?.toString() !== admin.id && admin.role !== 'super-admin') {
            return unauthorizedResponse('You do not have permission to update this material');
        }

        // Check if name change causes duplicate PER ADMIN
        if (name && name !== material.name) {
            const existing = await Material.findOne({ adminId: material.adminId, name, _id: { $ne: id } });
            if (existing) return NextResponse.json({ message: 'Material with this name already exists in your inventory' }, { status: 400 });
        }

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (category !== undefined) updates.category = category;
        if (usageType !== undefined) updates.usageType = usageType;
        if (usageValue !== undefined) updates.usageValue = usageValue;
        if (unit !== undefined) updates.unit = unit;
        if (defaultPrice !== undefined) updates.defaultPrice = defaultPrice;
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

        const material = await Material.findById(id);
        if (!material) return NextResponse.json({ message: 'Material not found' }, { status: 404 });

        // Access Control: Ensure the material belongs to the logged-in admin OR user is super-admin
        if (material.adminId?.toString() !== admin.id && admin.role !== 'super-admin') {
            return unauthorizedResponse('You do not have permission to delete this material');
        }

        await Material.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Material deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting material' }, { status: 500 });
    }
}
