const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seedAdmin() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not found');
        return;
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const admins = db.collection('admins');

        const email = 'admin@zubizo.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await admins.updateOne(
            { email },
            {
                $set: {
                    email,
                    password: hashedPassword,
                    role: 'super-admin',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        console.log('Admin seeded successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await client.close();
    }
}

seedAdmin();
