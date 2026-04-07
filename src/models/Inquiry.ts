import mongoose from 'mongoose';

const QuotationSchema = new mongoose.Schema({
    name: { type: String, default: 'Default Quotation' },
    design: {
        designId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
        name: String,
        sku: String,
        image: String
    },
    quantity: { type: Number, default: 0 },
    costing: {
        materials: [{
            materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
            name: String,
            quantityUsed: { type: Number, default: 0 },
            costPerUnit: { type: Number, default: 0 },
            totalCost: { type: Number, default: 0 },
            usageType: String,
            isDeducted: { type: Boolean, default: false },
            isSelected: { type: Boolean, default: true }
        }],
        printingCost: { type: Number, default: 0 },
        totalMaterialCost: { type: Number, default: 0 },
        totalCost: { type: Number, default: 0 },
        profit: { type: Number, default: 0 }
    },
    billing: {
        designingCharge: { type: Number, default: 0 },
        shippingCharge: { type: Number, default: 0 },
        languageCharge: { type: Number, default: 0 },
        customizationCharge: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
        totalBill: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Confirmed'],
        default: 'Draft'
    },
    isConvertedToOrder: { type: Boolean, default: false },
    confirmedAt: Date
}, { timestamps: true });

const InquirySchema = new mongoose.Schema({
    customerName: String,
    email: String,
    phone: String,
    source: {
        type: String,
        enum: ['catalog', 'detail', 'home', 'design_page', 'contact_page'],
        default: 'detail',
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Confirmed', 'Designing', 'Design Confirmed', 'Printing', 'Delivered', 'Completed', 'Closed', 'Invoiced', 'FOLLOW_UP', 'NEW', 'CONTACTED', 'CONFIRMED', 'CLOSED'],
        default: 'New',
    },
    
    // Inquiry Stage (Flexible)
    interestedDesigns: [{
        designId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
        name: String,
        sku: String,
        image: String
    }],
    approxQuantity: Number,
    notes: String,

    // Quotation Stage (Pricing Layer)
    quotations: [QuotationSchema],
    confirmedQuotationId: mongoose.Schema.Types.ObjectId,

    // Order Stage (Finalized)
    orderId: String, // Manual Entry
    finalPricingLocked: { type: Boolean, default: false },
    isInvoiced: { type: Boolean, default: false },
    isInventoryDeducted: { type: Boolean, default: false },

    // Metadata
    followUpDate: Date,
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

    // LEGACY / BACKWARD COMPAT (For Migration & Metrics)
    // These will be used for display until fully migrated, or to store the top-level "Active" data.
    designId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design' },
    designName: String,
    sku: String,
    selectedPackage: String,
    quantity: Number,
    estimatedTotal: Number,
    costing: {
        materials: Array,
        printingCost: Number,
        totalMaterialCost: Number,
        totalCost: Number,
        profit: Number
    },
    billing: {
        designingCharge: Number,
        shippingCharge: Number,
        totalBill: Number,
        discount: Number,
        discountType: String,
        invoiceDate: Date,
        invoiceNumber: String
    }
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
