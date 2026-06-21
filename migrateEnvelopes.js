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
        
        const materials = await Material.find({ category: { $in: ['Envelope Shape', 'Envelopes'] }, parentMaterialId: null });
        
        for (const mat of materials) {
            if (mat.name.includes(' - ')) {
                const [shapeName, colorName] = mat.name.split(' - ').map(s => s.trim());
                
                // Find or create parent
                let parent = await Material.findOne({ name: shapeName, category: 'Envelopes', parentMaterialId: null });
                if (!parent) {
                    parent = await Material.create({
                        name: shapeName,
                        category: 'Envelopes',
                        imageUrl: mat.imageUrl, // Inherit first image just in case
                        isActive: true
                    });
                    console.log("Created parent:", shapeName);
                }

                // Update the current material to be a child
                mat.name = colorName;
                mat.category = 'Envelopes';
                mat.parentMaterialId = parent._id;
                await mat.save();
                
                console.log(`Migrated variant: ${colorName} under ${shapeName}`);
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
