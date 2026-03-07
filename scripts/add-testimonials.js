import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

const HomePageSectionSchema = new mongoose.Schema({
    sectionId: { type: String, required: true, unique: true },
    sectionType: { type: String, required: true },
    title: String,
    subtitle: String,
    description: String,
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    layoutType: { type: String, default: 'default' },
    styling: {
        backgroundColor: { type: String, default: '#ffffff' },
        textColor: { type: String, default: '#2e2e2e' },
        accentColor: { type: String, default: '#ae7fcb' },
        padding: { type: String, default: 'py-24' },
        alignment: { type: String, default: 'center' },
        containerWidth: { type: String, default: 'max-w-7xl' },
        overlayOpacity: { type: Number, default: 0.3 },
        borderRadius: { type: String, default: 'rounded-none' }
    },
    content: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const HomePageSection = mongoose.models.HomePageSection || mongoose.model('HomePageSection', HomePageSectionSchema);

async function addTestimonials() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    try {
        const existing = await HomePageSection.findOne({ sectionType: 'testimonials' });

        if (existing) {
            console.log('Testimonials section already exists. Ensuring it is visible...');
            existing.isVisible = true;
            await existing.save();
        } else {
            console.log('Adding new testimonials section...');

            // First update the order of 'contact' if needed
            await HomePageSection.updateOne(
                { sectionType: 'contact' },
                { $set: { order: 6 } }
            );

            await HomePageSection.create({
                sectionId: 'testimonials-main',
                sectionType: 'testimonials',
                order: 5,
                isVisible: true,
                title: 'Loved by Our Clients',
                subtitle: 'Client Love',
                styling: {
                    backgroundColor: '#faf9f7',
                    padding: '120px 0'
                }
            });
            console.log('Added testimonials section');
        }
    } catch (e) {
        console.error('Error adding testimonials section:', e);
    }

    await mongoose.disconnect();
    console.log('Done');
}

addTestimonials();
