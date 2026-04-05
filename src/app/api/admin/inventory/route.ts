import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Material from '@/models/Material';
import Admin from '@/models/Admin';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();
        let query: any = { adminId: admin.id };
        if (admin.role === 'super-admin' && admin.showGlobalData) {
            query = {}; 
        }

        const materials = await Material.find(query).sort({ adminName: 1, name: 1 });
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
        const { name, category, usageType, usageValue, currentStock, unit, defaultPrice, lowStockThreshold, targetAdminId, targetAdminName, applyToAll } = body;

        await dbConnect();
        
        // Global Create Logic for Super Admins
        if (admin.role === 'super-admin' && applyToAll) {
            const allAdmins = await Admin.find({ role: { $in: ['admin', 'super-admin'] }});
            const createdMaterials = [];

            for (const targetAdmin of allAdmins) {
                const existing = await Material.findOne({ adminId: targetAdmin._id, name });
                if (!existing) {
                    const material = await Material.create({
                        adminId: targetAdmin._id,
                        adminName: targetAdmin.name,
                        name,
                        category: category || 'Core Materials',
                        usageType: usageType || 'manual',
                        usageValue: usageValue || 1,
                        currentStock: targetAdmin._id.toString() === admin.id ? (currentStock || 0) : 0, // only give stock to the creator by default
                        unit: unit || 'pcs',
                        defaultPrice: defaultPrice || 0,
                        lowStockThreshold: lowStockThreshold || 10
                    });
                    createdMaterials.push(material);
                }
            }
            return NextResponse.json(createdMaterials[0] || { message: 'All already exist' }, { status: 201 });
        }

        // Target admin is the current admin unless super admin specifies otherwise
        const finalAdminId = (admin.role === 'super-admin' && targetAdminId) ? targetAdminId : admin.id;
        const finalAdminName = (admin.role === 'super-admin' && targetAdminName) ? targetAdminName : admin.name;

        // Ensure name is unique PER ADMIN
        const existing = await Material.findOne({ adminId: finalAdminId, name });
        if (existing) {
            return NextResponse.json({ message: 'Material with this name already exists in your inventory' }, { status: 400 });
        }

        const material = await Material.create({
            adminId: finalAdminId,
            adminName: finalAdminName,
            name,
            category: category || 'Core Materials',
            usageType: usageType || 'manual',
            usageValue: usageValue || 1,
            currentStock: currentStock || 0,
            unit: unit || 'pcs',
            defaultPrice: defaultPrice || 0,
            lowStockThreshold: lowStockThreshold || 10
        });

        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating material' }, { status: 500 });
    }
}
