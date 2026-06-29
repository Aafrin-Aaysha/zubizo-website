import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("No MONGODB_URI found");
        return;
    }
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    // Update ZB-DW-001 to Starter and 2499
    const res = await db.collection('designs').updateOne(
        { sku: "ZB-DW-001" },
        { $set: { packageName: "Starter", basePrice: 2499 } }
    );
    console.log("Update result for ZB-DW-001:", res);
    
    // Verify
    const updated = await db.collection('designs').findOne({ sku: "ZB-DW-001" });
    console.log("Updated document:", {
        name: updated.name,
        sku: updated.sku,
        packageName: updated.packageName,
        basePrice: updated.basePrice
    });
    
    await client.close();
}

run().catch(console.error);
