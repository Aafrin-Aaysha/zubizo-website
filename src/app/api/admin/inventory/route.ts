import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();
        const materials = await Material.find({ adminId: admin.id }).sort({ name: 1 });
        return NextResponse.json(materials);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching inventory' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const body = await req.json();
        const { name, currentStock, unit, costPerUnit, lowStockThreshold } = body;

        await dbConnect();
        
        // Ensure name is unique PER ADMIN
        const existing = await Material.findOne({ adminId: admin.id, name });
        if (existing) {
            return NextResponse.json({ message: 'Material with this name already exists in your inventory' }, { status: 400 });
        }

        const material = await Material.create({
            adminId: admin.id,
            name,
            currentStock: currentStock || 0,
            unit: unit || 'pcs',
            costPerUnit: costPerUnit || 0,
            lowStockThreshold: lowStockThreshold || 10
        });

        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating material' }, { status: 500 });
    }
}
