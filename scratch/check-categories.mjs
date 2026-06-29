import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        const categories = await db.collection('categories').find({ isDeleted: false }).toArray();
        console.log('CATEGORIES IN DB:', categories.map(c => ({ name: c.name, slug: c.slug, id: c._id })));
    } finally {
        await client.close();
    }
}
run();
