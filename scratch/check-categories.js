require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const categories = await db.collection('categories').find({ isDeleted: false }).toArray();
        console.log('--- CATEGORIES ---');
        categories.forEach(c => {
            console.log(`- Name: "${c.name}" | Slug: "${c.slug}" | Image: "${c.imageUrl || c.image || ''}"`);
        });
        console.log('------------------');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
