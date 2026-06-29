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
    
    // Find digital categories
    const categories = await db.collection('categories').find({
        name: { $in: ["Digital E-Invite", "Premium E-Website"] }
    }).toArray();
    
    console.log("Categories found:", categories.map(c => ({ id: c._id.toString(), name: c.name })));
    const catIds = categories.map(c => c._id);
    
    const designs = await db.collection('designs').find({
        categoryId: { $in: catIds },
        isDeleted: false
    }).toArray();
    await client.db().collection('designs').updateMany({}, { $set: { isNewArrival: true } });
    
    console.log("Designs found:");
    designs.forEach(d => {
        console.log(`- Name: ${d.name}, SKU: ${d.sku}, isNewArrival: ${d.isNewArrival}, isTrending: ${d.isTrending}, isFeatured: ${d.isFeatured}`);
    });
    
    await client.close();
}

run().catch(console.error);
