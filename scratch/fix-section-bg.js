require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function update() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        // Update Trending section background to white
        const r1 = await db.collection('homepagesections').updateOne(
            { sectionType: 'trending' },
            { $set: { 'styling.backgroundColor': '#FAF8F5' } }
        );
        console.log(`Trending: matched=${r1.matchedCount}, modified=${r1.modifiedCount}`);

        // Update Contact section background to white
        const r2 = await db.collection('homepagesections').updateOne(
            { sectionType: 'contact' },
            { $set: { 'styling.backgroundColor': '#FAF8F5' } }
        );
        console.log(`Contact: matched=${r2.matchedCount}, modified=${r2.modifiedCount}`);

        // Also check Testimonials — should be light lavender per spec
        const r3 = await db.collection('homepagesections').updateOne(
            { sectionType: 'testimonials' },
            { $set: { 'styling.backgroundColor': '#EDE8F6' } }
        );
        console.log(`Testimonials: matched=${r3.matchedCount}, modified=${r3.modifiedCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

update();
