import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Material from '@/models/Material';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();
        
        // Super admins can fetch all, regular admins fetch their own or all?
        // Let's allow all for now, or match existing logic.
        const filter = admin.role === 'super-admin' ? {} : { adminId: admin.id };

        const invoices = await Invoice.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json({ message: 'Error fetching invoices' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const body = await req.json();
        const {
            customerName, customerPhone, customerAddress,
            designId, designCode, designName,
            quantity, pricePerCard,
            materialsUsed = [],
            shippingCharge = 0,
            designingCharge = 0,
            customCharges = []
        } = body;

        await dbConnect();

        // Validate basic fields
        if (!customerName || !designId || !designCode || quantity <= 0) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        let totalMaterialCost = 0;
        const validMaterialsUsed = [];

        // Deduct Inventory and Compute material cost
        for (const mat of materialsUsed) {
            if (mat.materialId) {
                const material = await Material.findById(mat.materialId);
                if (material) {
                    // Only deduct stock if tracking is enabled
                    if (material.trackInventory !== false) {
                        material.currentStock -= mat.quantityUsed;
                        await material.save();
                    }

                    // Use the rate from the request (allows manual overrides)
                    // Fallback to defaultPrice if not provided
                    const costPerUnit = mat.costPerUnit !== undefined ? mat.costPerUnit : (material.defaultPrice || 0);
                    const totalCost = costPerUnit * mat.quantityUsed;
                    totalMaterialCost += totalCost;

                    validMaterialsUsed.push({
                        materialId: material._id,
                        name: material.name,
                        quantityUsed: mat.quantityUsed,
                        costPerUnit,
                        totalCost
                    });
                }
            } else {
                // Handle custom line items (one-off outsourced costs)
                const costPerUnit = Number(mat.costPerUnit) || 0;
                const totalCost = costPerUnit * (mat.quantityUsed || 0);
                totalMaterialCost += totalCost;

                validMaterialsUsed.push({
                    name: mat.name || 'Custom Item',
                    quantityUsed: mat.quantityUsed || 0,
                    costPerUnit,
                    totalCost
                });
            }
        }

        const subtotal = quantity * pricePerCard;
        const additionalCustomTotal = customCharges.reduce((acc: number, charge: any) => acc + (Number(charge.amount) || 0), 0);
        const grandTotal = subtotal + Number(shippingCharge) + Number(designingCharge) + additionalCustomTotal;
        const profit = grandTotal - totalMaterialCost;

        const newInvoice = await Invoice.create({
            adminId: admin.id,
            customerName,
            customerPhone,
            customerAddress,
            designId,
            designCode,
            designName,
            quantity,
            pricePerCard,
            materialsUsed: validMaterialsUsed,
            shippingCharge,
            designingCharge,
            customCharges,
            subtotal,
            totalMaterialCost,
            grandTotal,
            profit,
            status: 'Generated'
        });

        return NextResponse.json(newInvoice, { status: 201 });
    } catch (error: any) {
        console.error('Error creating invoice:', error);
        return NextResponse.json({ message: error.message || 'Error creating invoice' }, { status: 500 });
    }
}
