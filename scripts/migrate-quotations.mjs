import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

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
        materials: Array,
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
    status: String,
    designId: mongoose.Schema.Types.ObjectId,
    designName: String,
    sku: String,
    quantity: Number,
    estimatedTotal: Number,
    costing: Object,
    billing: Object,
    interestedDesigns: Array,
    approxQuantity: Number,
    quotations: [QuotationSchema],
    confirmedQuotationId: mongoose.Schema.Types.ObjectId,
    orderId: String,
    isInvoiced: Boolean
}, { timestamps: true });

const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const inquiries = await Inquiry.find({});
        console.log(`Found ${inquiries.length} inquiries to process.`);

        let count = 0;
        for (const inv of inquiries) {
            let changed = false;

            // 1. Migrate to Interested Designs
            if ((!inv.interestedDesigns || inv.interestedDesigns.length === 0) && inv.designName) {
                inv.interestedDesigns = [{
                    designId: inv.designId,
                    name: inv.designName,
                    sku: inv.sku
                }];
                inv.approxQuantity = inv.quantity || 0;
                changed = true;
            }

            // 2. Create Default Quotation
            if (!inv.quotations || inv.quotations.length === 0) {
                const isConfirmedStatus = ['Confirmed', 'Designing', 'Design Confirmed', 'Printing', 'Delivered', 'Completed'].includes(inv.status);
                
                const defaultQuo = {
                    name: 'Initial Quotation',
                    design: {
                        designId: inv.designId,
                        name: inv.designName,
                        sku: inv.sku
                    },
                    quantity: inv.quantity || 0,
                    costing: {
                        materials: inv.costing?.materials || [],
                        printingCost: inv.costing?.printingCost || 0,
                        totalMaterialCost: inv.costing?.totalMaterialCost || 0,
                        totalCost: inv.costing?.totalCost || 0,
                        profit: inv.costing?.profit || 0
                    },
                    billing: {
                        designingCharge: inv.billing?.designingCharge || 0,
                        shippingCharge: inv.billing?.shippingCharge || 0,
                        discount: inv.billing?.discount || 0,
                        discountType: inv.billing?.discountType || 'fixed',
                        totalBill: inv.billing?.totalBill || 0
                    },
                    status: isConfirmedStatus ? 'Confirmed' : 'Draft',
                    confirmedAt: isConfirmedStatus ? (inv.createdAt) : null
                };

                inv.quotations = [defaultQuo];
                
                if (isConfirmedStatus) {
                    inv.confirmedQuotationId = inv.quotations[0]._id;
                    inv.orderId = inv.billing?.invoiceNumber || inv.sku || 'ORD-' + Math.random().toString(36).substr(2, 5).toUpperCase();
                }
                
                changed = true;
            }

            if (changed) {
                await inv.save();
                count++;
            }
        }

        console.log(`Successfully migrated ${count} inquiries.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
