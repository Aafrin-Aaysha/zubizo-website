import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';

export async function GET() {
    try {
        await dbConnect();
        
        // This will drop any indexes in MongoDB that do not exist in the Mongoose schema,
        // and build any newly defined indexes.
        // Crucially, it will drop the old strict `sku_1` index and replace it with
        // the new partial index that allows soft deletion!
        const result = await Design.syncIndexes({ background: false });
        
        return NextResponse.json({
            success: true,
            message: "Database indexes synchronized successfully. The soft-delete SKU issue is fixed!",
            result
        });
    } catch (error: any) {
        console.error("Failed to sync indexes:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
