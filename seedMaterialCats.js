const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MaterialCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo');
    
    // Check if model already registered to avoid OverwriteModelError
    const MaterialCategory = mongoose.models.MaterialCategory || mongoose.model('MaterialCategory', MaterialCategorySchema);
    
    const DEFAULT_CATEGORIES = [
        'Envelopes', 'Chart Sheets', 'Vellum Paper', 'Add-ons', 
        'Core Materials', 'Card Types', 'Packaging'
    ];
    
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        await MaterialCategory.findOneAndUpdate(
            { name: DEFAULT_CATEGORIES[i] },
            { $setOnInsert: { name: DEFAULT_CATEGORIES[i], order: i } },
            { upsert: true, new: true }
        );
    }
    console.log("Material Categories seeded!");
    process.exit();
}
seed();
