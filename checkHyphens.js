const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo');
        const db = mongoose.connection.db;
        const materials = await db.collection('materials').find({ parentMaterialId: null }).toArray();
        const categories = {};
        for (const m of materials) {
            if (m.name.includes(' - ')) {
                if (!categories[m.category]) categories[m.category] = [];
                categories[m.category].push(m.name);
            }
        }
        console.log("Materials with hyphens to migrate:");
        console.log(categories);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
check();
