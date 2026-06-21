const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MaterialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
    parentMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', default: null },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zubizo');
        
        const materials = await Material.find({ parentMaterialId: null });
        
        for (const mat of materials) {
            if (mat.name.includes(' - ')) {
                // Handle arbitrary whitespace around hyphen
                const parts = mat.name.split(/\s*-\s*/);
                if (parts.length < 2) continue;

                const shapeName = parts[0].trim();
                const variantName = parts.slice(1).join(' - ').trim();
                const category = mat.category;
                
                // Find or create parent
                let parent = await Material.findOne({ name: shapeName, category: category, parentMaterialId: null });
                if (!parent) {
                    parent = await Material.create({
                        name: shapeName,
                        category: category,
                        imageUrl: mat.imageUrl, // Inherit first image
                        isActive: true
                    });
                    console.log("Created parent:", shapeName, "in", category);
                }

                // Update the current material to be a child
                mat.name = variantName;
                mat.parentMaterialId = parent._id;
                await mat.save();
                
                console.log(`Migrated variant: ${variantName} under ${shapeName}`);
            }
        }
        
        console.log("Migration complete!");
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
run();
