require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // List all categories
    const allCats = await db.collection('categories').find({}).toArray();
    console.log("All categories:", allCats.map(c => c.name));

    const cat = allCats.find(c => c.name.toLowerCase().includes('south indian'));
    if (!cat) {
        console.error("Category not found!");
        process.exit(1);
    }
    console.log("Found correct category:", cat.name, cat._id);

    // Update the two designs
    const res = await db.collection('designs').updateMany(
        { sku: { $in: ['ZB-1001', 'ZB_1002'] } },
        { $set: { categoryId: cat._id } }
    );
    console.log("Matched:", res.matchedCount, "Modified:", res.modifiedCount);

    process.exit(0);
}

fix().catch(console.error);
