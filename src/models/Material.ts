import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
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
    costPerUnit: {
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

export default mongoose.models.Material || mongoose.model('Material', MaterialSchema);
