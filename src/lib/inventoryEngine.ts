import dbConnect from './db';
import Material from '@/models/Material';
import { sendLowStockAlert } from './whatsapp';

export async function applyDeduction(materialsList: any[], adminId: string) {
    if (!materialsList || materialsList.length === 0) return;
    await dbConnect();

    for (const item of materialsList) {
        if (!item.materialId) continue;
        
        const mat = await Material.findById(item.materialId);
        if (!mat) continue;

        // "manual" materials do not deduct stock
        if (mat.usageType === 'manual') continue;

        // Just deduct the calculated quantityUsed (sheets, pieces, etc.) 
        // as calculated by the frontend Order Material Engine.
        mat.currentStock -= (item.quantityUsed || 0);
        await mat.save();

        if (mat.currentStock < mat.lowStockThreshold) {
             await sendLowStockAlert(mat.name, mat.currentStock, mat.adminName || 'Admin');
        }
    }
}

export async function reverseDeduction(materialsList: any[], adminId: string) {
    if (!materialsList || materialsList.length === 0) return;
    await dbConnect();

    for (const item of materialsList) {
        if (!item.materialId) continue;
        
        const mat = await Material.findById(item.materialId);
        if (!mat) continue;

        if (mat.usageType === 'manual') continue;

        mat.currentStock += (item.quantityUsed || 0);
        await mat.save();
    }
}
