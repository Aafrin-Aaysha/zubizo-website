import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

const defaultMaterials = [
    { name: 'Wax Seal', category: 'Core Materials', usageType: 'per_card', usageValue: 1, unit: 'pcs', defaultPrice: 5 },
    { name: 'Ribbon - Satin', category: 'Core Materials', usageType: 'ratio', usageValue: 0.066667, unit: 'rolls', defaultPrice: 150 }, // 1/15
    { name: 'Ribbon - Organza', category: 'Core Materials', usageType: 'ratio', usageValue: 0.02, unit: 'rolls', defaultPrice: 200 }, // 1/50
    { name: 'Envelope - Landscape (Blue)', category: 'Envelopes', usageType: 'per_card', usageValue: 1, unit: 'pcs', defaultPrice: 15 },
    { name: 'Envelope - Landscape (Ivory)', category: 'Envelopes', usageType: 'per_card', usageValue: 1, unit: 'pcs', defaultPrice: 15 },
    { name: 'Envelope - Portrait (Ivory)', category: 'Envelopes', usageType: 'per_card', usageValue: 1, unit: 'pcs', defaultPrice: 15 },
    { name: 'Chart Sheet - White', category: 'Chart Sheets', usageType: 'per_card', usageValue: 1, unit: 'pcs', defaultPrice: 10 },
    { name: 'Chart Sheet - Ivory', category: 'Chart Sheets', usageType: 'per_card', usageValue: 1, unit: 'pcs', defaultPrice: 12 },
    { name: 'Pouch - Square (8x8 cm)', category: 'Packaging', usageType: 'manual', usageValue: 1, unit: 'pcs', defaultPrice: 8 },
    { name: 'Foil Print - Gold', category: 'Add-ons', usageType: 'manual', usageValue: 1, unit: 'pcs', defaultPrice: 5 },
    { name: 'Card - Matte (Front)', category: 'Card Types', usageType: 'manual', usageValue: 1, unit: 'pcs', defaultPrice: 20 },
    { name: 'Card - Linen (Front & Back)', category: 'Card Types', usageType: 'manual', usageValue: 1, unit: 'pcs', defaultPrice: 30 },
    { name: 'Vellum Paper Box (250 sheets)', category: 'Vellum Paper', usageType: 'per_card', usageValue: 1, unit: 'sheets', defaultPrice: 3 } // tracked in sheets internally
];

export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();

        const results = [];
        for (const mat of defaultMaterials) {
            const existing = await Material.findOne({ adminId: admin.id, name: mat.name });
            if (!existing) {
                const created = await Material.create({
                    ...mat,
                    adminId: admin.id,
                    adminName: admin.name || 'Admin',
                    currentStock: 0,
                    lowStockThreshold: 10
                });
                results.push(created);
            }
        }

        return NextResponse.json({ message: 'Preloaded successfully', results }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error preloading materials' }, { status: 500 });
    }
}
