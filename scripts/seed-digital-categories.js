
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const DIGITAL_CATEGORIES = [
    { 
        name: 'Digital E-Invite', 
        slug: 'digital-e-invite', 
        displayOrder: 10, 
        description: 'High-quality digital image and video invitations for quick sharing.' 
    },
    { 
        name: 'Premium E-Website', 
        slug: 'premium-e-website', 
        displayOrder: 11, 
        description: 'Interactive and premium digital wedding invitation websites.' 
    },
];

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not found in .env.local');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const categories = db.collection('categories');

        for (const cat of DIGITAL_CATEGORIES) {
            await categories.updateOne(
                { slug: cat.slug },
                {
                    $setOnInsert: { createdAt: new Date(), isDeleted: false },
                    $set: {
                        name: cat.name,
                        slug: cat.slug,
                        displayOrder: cat.displayOrder,
                        description: cat.description,
                        isActive: true,
                        updatedAt: new Date(),
                    }
                },
                { upsert: true }
            );
            console.log(`✅ Seeded category: ${cat.name}`);
        }

        console.log('Done!');
    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

seed();
