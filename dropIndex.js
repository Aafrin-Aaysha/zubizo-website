const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function dropIndex() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo');
        const db = mongoose.connection.db;
        
        try {
            await db.collection('materials').dropIndex('name_1');
            console.log("Dropped name_1 index");
        } catch (e) {
            console.log("name_1 index not found or already dropped", e.message);
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
dropIndex();
