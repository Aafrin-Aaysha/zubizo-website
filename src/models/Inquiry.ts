import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
    designId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Design',
    },
    designName: String,
    sku: String,
    selectedPackage: String,
    quantity: Number,
    estimatedTotal: Number,
    source: {
        type: String,
        enum: ['catalog', 'detail', 'home'],
        default: 'detail',
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Closed'],
        default: 'New',
    },
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
