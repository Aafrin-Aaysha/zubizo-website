const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo');
    require('./src/models/Category');
    const Category = mongoose.model('Category');
    
    const DEFAULT_CATEGORIES = [
        'Envelopes', 'Chart Sheets', 'Vellum Paper', 'Add-ons', 
        'Core Materials', 'Card Types', 'Packaging'
    ];
    
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        await Category.findOneAndUpdate(
            { name: DEFAULT_CATEGORIES[i] },
            { $setOnInsert: { name: DEFAULT_CATEGORIES[i], order: i } },
            { upsert: true, new: true }
        );
    }
    console.log("Categories seeded!");
    process.exit();
}
seed();
