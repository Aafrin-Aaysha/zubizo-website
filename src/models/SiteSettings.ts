import mongoose from 'mongoose';

const HeroSlideSchema = new mongoose.Schema({
    image: String,
    tag: String,
    title: String,
    subtitle: String,
});

const SiteSettingsSchema = new mongoose.Schema({
    about: String,
    terms: String,
    policyContent: String,
    termsContent: String,
    shippingPolicyContent: String,
    refundPolicyContent: String,
    printingPolicyContent: String,
    address: String,
    phone: String,
    email: String,
    whatsappNumber: {
        type: String,
        default: '8124548133'
    },
    logoUrl: String,
    faviconUrl: String,
    aboutImageUrl: String,
    // Hero carousel slides — editable from admin
    heroSlides: {
        type: [HeroSlideSchema],
        default: []
    },
    // Social links
    instagramUrl: String,
    facebookUrl: String,
    // Business hours
    businessHours: String,
    // Home page tagline / headline
    homeTagline: String,
    // Global Material Costs
    defaultMaterials: [{
        name: String,
        cost: Number
    }]
}, { timestamps: true });

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
