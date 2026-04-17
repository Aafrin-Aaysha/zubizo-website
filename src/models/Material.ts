import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    adminName: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        default: 'Core Materials'
    },
    usageType: {
        type: String,
        enum: ['per_card', 'ratio', 'manual'],
        default: 'manual'
    },
    usageValue: {
        type: Number,
        default: 1
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        default: 'pcs' // e.g., 'pcs', 'kg', 'meters', 'sheets'
    },
    size: {
        type: String,
        trim: true
    },
    gsm: {
        type: String,
        trim: true
    },
    trackInventory: {
        type: Boolean,
        default: true
    },
    defaultPrice: {
        type: Number,
        required: true,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        required: true,
        default: 10
    },
    lastRestockedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure material names are unique per admin, allowing different admins 
// to have their own stock of the same material (e.g., "Wax Seal").
MaterialSchema.index({ adminId: 1, name: 1 }, { unique: true });

export default mongoose.models.Material || mongoose.model('Material', MaterialSchema);
