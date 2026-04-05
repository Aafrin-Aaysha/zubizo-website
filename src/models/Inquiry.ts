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
        enum: ['New', 'Contacted', 'Confirmed', 'Designing', 'Design Confirmed', 'Printing', 'Delivered', 'Completed', 'Closed', 'Invoiced'],
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
    // Calculator & Billing Data
    costing: {
        materials: [{
            materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
            name: String,
            quantityUsed: { type: Number, default: 0 },
            costPerUnit: { type: Number, default: 0 },
            totalCost: { type: Number, default: 0 },
            usageType: String,
            isDeducted: { type: Boolean, default: false }
        }],
        printingCost: { type: Number, default: 0 },
        totalMaterialCost: { type: Number, default: 0 },
        totalCost: { type: Number, default: 0 },
        profit: { type: Number, default: 0 }
    },
    billing: {
        designingCharge: { type: Number, default: 0 },
        shippingCharge: { type: Number, default: 0 },
        totalBill: { type: Number, default: 0 },
        invoiceDate: Date,
        invoiceNumber: String
    },
    isInvoiced: {
        type: Boolean,
        default: false
    },
    isInventoryDeducted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
