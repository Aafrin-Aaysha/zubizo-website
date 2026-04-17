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
        
        // Super admins always see ALL materials (they have filter UI on the frontend)
        if (admin.role === 'super-admin') {
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
        const { 
            name, category, usageType, usageValue, currentStock, unit, 
            defaultPrice, lowStockThreshold, targetAdminId, targetAdminName, 
            applyToAll, size, gsm, trackInventory 
        } = body;

        await dbConnect();
        
        // Global Create Logic for Super Admins
        if (admin.role === 'super-admin' && applyToAll) {
            const allAdmins = await Admin.find({ role: { $in: ['admin', 'super-admin'] }});
            const createdMaterials = [];
            const sanitizedName = name.trim();

            for (const targetAdmin of allAdmins) {
                try {
                    const existing = await Material.findOne({ adminId: targetAdmin._id, name: sanitizedName });
                    if (!existing) {
                        const material = await Material.create({
                            adminId: targetAdmin._id,
                            adminName: targetAdmin.name,
                            name: sanitizedName,
                            category: (category || 'Core Materials').trim(),
                            usageType: usageType || 'manual',
                            usageValue: Number(usageValue) || 1,
                            currentStock: targetAdmin._id.toString() === admin.id ? (Number(currentStock) || 0) : 0,
                            unit: (unit || 'pcs').trim(),
                            defaultPrice: Number(defaultPrice) || 0,
                            lowStockThreshold: Number(lowStockThreshold) || 10,
                            size: size || '',
                            gsm: gsm || '',
                            trackInventory: trackInventory !== undefined ? trackInventory : true
                        });
                        createdMaterials.push(material);
                    }
                } catch (err) {
                    console.error(`Failed to create material for admin ${targetAdmin.name}:`, err);
                    // Continue to next admin instead of failing the whole request
                }
            }
            return NextResponse.json(
                createdMaterials.length > 0 ? createdMaterials[0] : { message: 'Processed successfully' }, 
                { status: 201 }
            );
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
            lowStockThreshold: lowStockThreshold || 10,
            size: size || '',
            gsm: gsm || '',
            trackInventory: trackInventory !== undefined ? trackInventory : true
        });

        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Error creating material' }, { status: 500 });
    }
}
