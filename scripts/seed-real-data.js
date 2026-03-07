import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

const CategorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    description: String,
    displayOrder: Number,
    isActive: { type: Boolean, default: true }
});

const DesignSchema = new mongoose.Schema({
    name: String,
    sku: String,
    categoryId: mongoose.Schema.Types.ObjectId,
    images: [String],
    description: String,
    basePrice: Number,
    isTrending: { type: Boolean, default: false },
    isNewCollection: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Design = mongoose.models.Design || mongoose.model('Design', DesignSchema);

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Design.deleteMany({});
    console.log('Cleared existing categories and designs');

    const categories = [
        { name: 'Wedding Collection', slug: 'wedding', description: 'Timeless elegance for your special day.', displayOrder: 1 },
        { name: 'Floral Designs', slug: 'floral', description: 'Nature-inspired artisanal stationery.', displayOrder: 2 },
        { name: 'Minimal Modern', slug: 'minimal', description: 'Clean lines and sophisticated simplicity.', displayOrder: 3 },
        { name: 'Traditional Art', slug: 'traditional', description: 'Rich heritage and intricate craftsmanship.', displayOrder: 4 }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('Created categories');

    const designs = [];
    const imageFiles = [
        '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '9.jpeg', '10.jpeg',
        '19.jpeg', '20.jpeg', '24.jpeg', '25.jpeg', '26.jpeg', '27.jpeg', '28.jpeg', '30.jpeg', '31.jpeg', '33.jpeg'
    ];

    for (let i = 0; i < imageFiles.length; i++) {
        const catIndex = i % createdCategories.length;
        designs.push({
            name: `Design ${i + 1}`,
            sku: `ZB-${1000 + i}`,
            categoryId: createdCategories[catIndex]._id,
            images: [`/zubizo_invites/${imageFiles[i]}`],
            description: `A beautiful ${categories[catIndex].name.toLowerCase()} design crafted with premium materials.`,
            basePrice: 50 + (i * 10),
            isTrending: i < 6,
            isNewCollection: i % 3 === 0,
            isActive: true,
            isDeleted: false
        });
    }

    await Design.insertMany(designs);
    console.log('Created designs with local images');

    await mongoose.disconnect();
    console.log('Seeding complete');
}

seed().catch(console.error);
