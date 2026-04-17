import mongoose from 'mongoose';

const MaterialUsedSchema = new mongoose.Schema({
    materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
    },
    name: { type: String, required: true },
    quantityUsed: { type: Number, required: true },
    costPerUnit: { type: Number, required: true },
    totalCost: { type: Number, required: true }
}, { _id: false });

const CustomChargeSchema = new mongoose.Schema({
    label: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        default: ''
    },
    customerAddress: {
        type: String,
        default: ''
    },
    designId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Design',
        required: true
    },
    designCode: {
        type: String,
        required: true
    },
    designName: {
        type: String,
        default: 'Custom Design'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerCard: {
        type: Number,
        required: true,
        min: 0
    },
    materialsUsed: {
        type: [MaterialUsedSchema],
        default: []
    },
    shippingCharge: {
        type: Number,
        default: 0
    },
    designingCharge: {
        type: Number,
        default: 0
    },
    customCharges: {
        type: [CustomChargeSchema],
        default: []
    },
    subtotal: {
        type: Number,
        required: true
    },
    totalMaterialCost: {
        type: Number,
        required: true
    },
    grandTotal: {
        type: Number,
        required: true
    },
    profit: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Generated', 'Paid', 'Cancelled'],
        default: 'Generated'
    }
}, { timestamps: true });

// Auto-generate orderId if not provided (fallback)
InvoiceSchema.pre("validate", async function (this: any) {
    if (!this.orderId) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        const InvoiceModel = this.constructor as mongoose.Model<any>;
        // Get count to append a sequential number
        const count = await InvoiceModel.countDocuments();
        this.orderId = `ZB-INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
