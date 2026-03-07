const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const CATEGORIES = [
    { name: 'Traditional Wedding Invites', slug: 'traditional-wedding-invites', displayOrder: 1, description: 'Classic and timeless wedding invitation designs rooted in tradition.' },
    { name: 'Engagement Invites', slug: 'engagement-invites', displayOrder: 2, description: 'Beautiful invitations to celebrate your engagement ceremony.' },
    { name: 'Reception Invites', slug: 'reception-invites', displayOrder: 3, description: 'Elegant reception party invitation cards for your guests.' },
    { name: 'Religious Theme Invitation', slug: 'religious-theme-invitation', displayOrder: 4, description: 'Spiritually themed invites for Nikah, Baptism, Pooja and other religious events.' },
    { name: 'Baby Shower', slug: 'baby-shower', displayOrder: 5, description: 'Adorable and cheerful invitations for baby shower celebrations.' },
    { name: 'Birthday Celebration', slug: 'birthday-celebration', displayOrder: 6, description: 'Fun and vibrant birthday invitation cards for all ages.' },
    { name: 'House Warming', slug: 'house-warming', displayOrder: 7, description: 'Warm and welcoming invitations for your new home celebration.' },
    { name: 'Minimal Style Invites', slug: 'minimal-style-invites', displayOrder: 8, description: 'Clean, modern, and minimal design invitations for contemporary aesthetics.' },
    { name: 'Other Ceremonial Events / Inaugurations', slug: 'other-ceremonial-events-inaugurations', displayOrder: 9, description: 'Invitations for shop openings, corporate events, and other special ceremonies.' },
];

async function seedCategories() {
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

        let inserted = 0, updated = 0;

        for (const cat of CATEGORIES) {
            const result = await categories.updateOne(
                { slug: cat.slug },
                {
                    $setOnInsert: { createdAt: new Date() },
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
            if (result.upsertedCount > 0) {
                inserted++;
                console.log(`  ✅ Inserted: ${cat.name}`);
            } else if (result.modifiedCount > 0) {
                updated++;
                console.log(`  🔄 Updated: ${cat.name}`);
            } else {
                console.log(`  ⏭  Unchanged: ${cat.name}`);
            }
        }

        console.log(`\nDone! ${inserted} inserted, ${updated} updated.`);
    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await client.close();
    }
}

seedCategories();
