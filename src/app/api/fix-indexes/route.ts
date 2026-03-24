import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';

export async function GET() {
    try {
        await dbConnect();
        
        const results = [];
        
        try {
            await Design.collection.dropIndex('sku_1');
            results.push('Dropped old sku_1 index');
        } catch (e: any) {
            results.push('sku_1 index issue: ' + e.message);
        }

        try {
            await Design.collection.dropIndex('slug_1');
            results.push('Dropped old slug_1 index');
        } catch (e: any) {
            results.push('slug_1 index issue: ' + e.message);
        }

        // Now rebuild them with the correct partial filter expression
        const syncResult = await Design.syncIndexes({ background: false });
        
        return NextResponse.json({
            success: true,
            message: "Database indexes forcefully dropped and rebuilt successfully. The soft-delete SKU issue is fixed!",
            results,
            syncResult
        });
    } catch (error: any) {
        console.error("Failed to sync indexes:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
