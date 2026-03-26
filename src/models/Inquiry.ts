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
    customerName: String,
    email: String,
    phone: String,
    source: {
        type: String,
        enum: ['catalog', 'detail', 'home'],
        default: 'detail',
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Confirmed', 'Designing', 'Design Confirmed', 'Printing', 'Delivered', 'Completed', 'Closed'],
        default: 'New',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    assignedAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    timeline: {
        confirmedAt: Date,
        designStartedAt: Date,
        designConfirmedAt: Date,
        printingStartedAt: Date,
        deliveredAt: Date,
    },
    deliveryDeadline: Date,
    isFixedDate: {
        type: Boolean,
        default: false,
    },
    designException: {
        type: Boolean,
        default: false,
    },
    notes: String,
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
