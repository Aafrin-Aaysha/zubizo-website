import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    pricePerCard: {
        type: Number,
        required: true,
        min: 0
    },
    inclusions: {
        type: [String],
        validate: {
            validator: (arr: string[]) => arr.length > 0,
            message: "Each package must have at least one inclusion."
        }
    }
});

const DesignSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: true,
        unique: true,
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
        unique: true,
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

        while (await DesignModel.exists({ slug, _id: { $ne: this._id } })) {
            slug = `${base}-${counter}`;
            counter++;
        }
        this.slug = slug;
    }
});

export default mongoose.models.Design || mongoose.model('Design', DesignSchema);
