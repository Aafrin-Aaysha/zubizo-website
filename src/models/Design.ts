import mongoose from 'mongoose';

const PriceTierSchema = new mongoose.Schema({
    minQty: { type: Number, required: true, min: 1 },
    maxQty: { type: Number, default: null }, // null = unlimited (last tier)
    pricePerCard: { type: Number, required: true, min: 0 }
}, { _id: false });

const AddOnSchema = new mongoose.Schema({
    label: { type: String, required: true },
    pricePerCard: { type: Number, required: true, default: 0 },
    note: { type: String, default: '' } // e.g. "Free", "₹6 extra"
}, { _id: false });

const PackageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    inclusions: {
        type: [String],
        default: []
    },
    priceTiers: {
        type: [PriceTierSchema],
        default: []
    },
    // Legacy field - kept for backwards compat, not used in UI
    pricePerCard: { type: Number, default: 0 }
});

const DesignSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ""
    },
    minQuantity: {
        type: Number,
        default: 50,
        min: 1
    },
    packages: {
        type: [PackageSchema],
        validate: {
            validator: (arr: any[]) => arr.length > 0,
            message: "At least one package is required."
        }
    },
    addOns: {
        type: [AddOnSchema],
        default: []
    },
    images: [String],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    isTrending: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    videoUrl: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Unique indexes that only apply to non-deleted documents.
// This allows re-using a SKU or slug after soft-deleting a design.
DesignSchema.index({ sku: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
DesignSchema.index({ slug: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

// Slug auto-generation logic
DesignSchema.pre("validate", async function (this: any) {
    if (!this.slug && this.name && this.sku) {
        let base = `${this.name}-${this.sku}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        let slug = base;
        let counter = 1;

        // Use the constructor to access the model for uniqueness check
        const DesignModel = this.constructor as mongoose.Model<any>;

        while (await DesignModel.exists({ slug, isDeleted: false, _id: { $ne: this._id } })) {
            slug = `${base}-${counter}`;
            counter++;
        }
        this.slug = slug;
    }
});

export default mongoose.models.Design || mongoose.model('Design', DesignSchema);
