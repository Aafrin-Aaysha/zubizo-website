const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo');
        const db = mongoose.connection.db;
        const materials = await db.collection('materials').find({ category: { $in: ['Envelope Shape', 'Envelopes', 'Envelope Color'] } }).toArray();
        console.log("Envelopes in DB:");
        materials.forEach(m => console.log("- " + m.name + (m.parentMaterialId ? ' (Color/Variant)' : ' (Shape/Parent)')));
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
run();
