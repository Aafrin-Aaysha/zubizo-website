import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Material from '@/models/Material';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        await dbConnect();
        const invoice = await Invoice.findById(params.id).lean();
        
        if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

        return NextResponse.json(invoice);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json({ message: 'Error fetching invoice' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
            customCharges = [],
            status
        } = body;

        await dbConnect();

        const oldInvoice = await Invoice.findById(params.id);
        if (!oldInvoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

        // 1. REVERSE PREVIOUS STOCK DEDUCTIONS
        for (const mat of oldInvoice.materialsUsed) {
            if (mat.materialId) {
                const material = await Material.findById(mat.materialId);
                if (material && material.trackInventory !== false) {
                    material.currentStock += mat.quantityUsed;
                    await material.save();
                }
            }
        }

        // 2. COMPUTE NEW TOTALS AND APPLY NEW DEDUCTIONS
        let totalMaterialCost = 0;
        const validMaterialsUsed = [];

        for (const mat of materialsUsed) {
            if (mat.materialId) {
                const material = await Material.findById(mat.materialId);
                if (material) {
                    if (material.trackInventory !== false) {
                        material.currentStock -= mat.quantityUsed;
                        await material.save();
                    }

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

        // 3. UPDATE INVOICE
        const updatedInvoice = await Invoice.findByIdAndUpdate(params.id, {
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
            status: status || oldInvoice.status
        }, { new: true });

        return NextResponse.json(updatedInvoice);
    } catch (error: any) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ message: error.message || 'Error updating invoice' }, { status: 500 });
    }
}
