import mongoose from 'mongoose';

const MaterialCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

export default mongoose.models.MaterialCategory || mongoose.model('MaterialCategory', MaterialCategorySchema);
