import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g. "Envelope Shape", "Envelope Color", "Wax Seal"
    imageUrl: { type: String, required: false },
    parentMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', default: null }, // for sub-categories like colors belonging to a shape
    isActive: { type: Boolean, default: true },
    
    // Inventory Tracking Fields
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    adminName: { type: String },
    usageType: { type: String, default: 'manual' },
    usageValue: { type: Number, default: 1 },
    currentStock: { type: Number, default: 0 },
    unit: { type: String, default: 'pcs' },
    defaultPrice: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    size: { type: String },
    gsm: { type: String },
    trackInventory: { type: Boolean, default: true },
    lastRestockedAt: { type: Date }
}, { timestamps: true });

// Prevent mongoose from compiling the model multiple times in development
export default mongoose.models.Material || mongoose.model('Material', MaterialSchema);
