import mongoose from 'mongoose';

const HomePageSectionSchema = new mongoose.Schema({
    sectionId: {
        type: String,
        required: true,
        unique: true,
        description: "Unique identifier for the section, e.g., 'hero-primary'"
    },
    sectionType: {
        type: String,
        required: true,
        enum: ['hero', 'shopByPrice', 'trending', 'ourStory', 'instagram', 'testimonials', 'contact', 'cta', 'gallery', 'custom', 'featuredCollections', 'craftProcess'],
        description: "Type of section to render on the home page"
    },
    title: String,
    subtitle: String,
    description: String,
    order: {
        type: Number,
        default: 0,
        description: "Display order of the section on the home page"
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    layoutType: {
        type: String,
        default: 'default',
        description: "Layout variant (e.g., 'split', 'carousel', 'grid')"
    },
    styling: {
        backgroundColor: { type: String, default: '#ffffff' },
        textColor: { type: String, default: '#2e2e2e' },
        accentColor: { type: String, default: '#ae7fcb' },
        padding: { type: String, default: 'py-24' },
        alignment: { type: String, enum: ['left', 'center', 'right'], default: 'center' },
        containerWidth: { type: String, default: 'max-w-7xl' },
        overlayOpacity: { type: Number, default: 0.3 },
        borderRadius: { type: String, default: 'rounded-none' }
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
        description: "Polymorphic content object (images, links, button text, etc.)"
    }
}, { timestamps: true });

export default mongoose.models.HomePageSection || mongoose.model('HomePageSection', HomePageSectionSchema);
