const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const Material = require('./src/models/Material').default;

async function testCreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo');
        
        await Material.create({
            adminId: new mongoose.Types.ObjectId(),
            adminName: "Test Admin",
            name: "Test Material",
            category: "Core Materials",
            usageType: "manual",
            usageValue: 1,
            currentStock: 0,
            unit: "pcs",
            defaultPrice: 0,
            lowStockThreshold: 10,
            size: "",
            gsm: "",
            trackInventory: true,
            parentMaterialId: null
        });
        console.log("Created successfully!");
    } catch (e) {
        console.error("Mongoose Error:", e);
    } finally {
        mongoose.disconnect();
    }
}
testCreate();
