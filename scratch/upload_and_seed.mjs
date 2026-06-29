import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

const DesignSchema = new mongoose.Schema({
    sku: String,
    name: String,
    slug: String,
    description: String,
    minQuantity: Number,
    basePrice: Number,
    packages: Array,
    addOns: Array,
    materials: Array,
    images: [String],
    categoryId: mongoose.Schema.Types.ObjectId,
    isActive: Boolean,
    isDeleted: Boolean
}, { timestamps: true, strict: false });

const CategorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    isDeleted: Boolean
}, { strict: false });

const Design = mongoose.models.Design || mongoose.model('Design', DesignSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const imageFiles = [
    {
        filename: 'media__1781678203711.jpg',
        name: 'Matt & Rosa Sketch',
        sku: 'DI-MR-001',
        price: 1499,
        description: 'A minimalist, hand-drawn black and white wedding invitation sketch featuring charming illustrations, elegant typography, and a modern aesthetic.'
    },
    {
        filename: 'media__1781678204019.jpg',
        name: 'Samira & Jonathan Garden',
        sku: 'DI-SJ-002',
        price: 1999,
        description: 'A dreamlike floral watercolor wedding invitation depicting a beautiful blooming garden landscape under a pastel sky.'
    },
    {
        filename: 'media__1781678204297.jpg',
        name: 'Pedro & Olivia Indigo',
        sku: 'DI-PO-003',
        price: 1899,
        description: 'An elegant, sophisticated wedding invitation decorated with hand-painted indigo watercolor peonies and clean modern serif typography.'
    },
    {
        filename: 'media__1781678204786.jpg',
        name: 'Taylor & Estelle Eternal',
        sku: 'DI-TE-004',
        price: 2499,
        description: 'A premium photo-centered wedding invitation showcasing a timeless close-up of wedding bands with luxury serif lettering.'
    },
    {
        filename: 'media__1781678204796.jpg',
        name: 'Dewi & Ketut Engagement',
        sku: 'DI-DK-005',
        price: 1699,
        description: 'A classic engagement ceremony invitation adorned with clean silver botanical illustrations and a elegant dark wedding backdrop.'
    }
];

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const categoryDoc = await Category.findOne({ name: 'Digital E-Invite', isDeleted: false });
        if (!categoryDoc) {
            console.error('Digital E-Invite category not found in DB!');
            process.exit(1);
        }
        console.log('Using category:', categoryDoc.name, 'ID:', categoryDoc._id);

        const brainDir = 'C:\\Users\\Aafrin Aaysha\\.gemini\\antigravity\\brain\\998bc80a-7b0e-412f-8276-8e2770077aa4';

        for (const item of imageFiles) {
            const filePath = path.join(brainDir, item.filename);
            if (!fs.existsSync(filePath)) {
                console.error('File not found:', filePath);
                continue;
            }

            console.log(`Uploading ${item.name} image to Cloudinary...`);
            const fileBuffer = fs.readFileSync(filePath);
            const fileBlob = new Blob([fileBuffer], { type: 'image/jpeg' });
            
            const formData = new FormData();
            formData.append('file', fileBlob, item.filename);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const result = await res.json();
            if (!res.ok) {
                console.error('Upload failed:', result);
                continue;
            }

            console.log('Uploaded successfully! URL:', result.secure_url);

            const slug = `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.sku.toLowerCase()}`;

            // Clean up existing design with same SKU to prevent duplicate keys
            await Design.deleteOne({ sku: item.sku, isDeleted: false });

            console.log('Creating design in database...');
            const newDesign = await Design.create({
                sku: item.sku,
                name: item.name,
                slug: slug,
                description: item.description,
                minQuantity: 1,
                basePrice: item.price,
                packages: [{
                    title: 'Digital Delivery',
                    inclusions: ['JPEG/PNG/PDF Bundle'],
                    priceTiers: [{ minQty: 1, maxQty: null, pricePerCard: 1 }]
                }],
                addOns: [],
                materials: [],
                images: [result.secure_url],
                categoryId: categoryDoc._id,
                isActive: true,
                isDeleted: false
            });

            console.log(`Successfully created design ${newDesign.name} with SKU ${newDesign.sku}!`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected!');
        process.exit(0);
    }
}

run();
