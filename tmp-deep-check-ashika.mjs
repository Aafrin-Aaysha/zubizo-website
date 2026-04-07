import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Check Admins
        const admins = await mongoose.connection.db.collection('admins').find({}).toArray();
        console.log('--- ADMINS ---');
        console.log(JSON.stringify(admins.map(a => ({ name: a.name, email: a.email, role: a.role, id: a._id })), null, 2));

        // 2. Check Materials
        const materials = await mongoose.connection.db.collection('materials').find({}).toArray();
        console.log('\n--- MATERIALS ---');
        const counts = materials.reduce((acc, m) => {
            const admin = m.adminName || 'Unknown';
            acc[admin] = (acc[admin] || 0) + 1;
            return acc;
        }, {});
        console.log('Counts:', JSON.stringify(counts, null, 2));

        // 3. Specifically look for Ashika materials
        const ashika = admins.find(a => /ashika/i.test(a.name));
        if (ashika) {
            const ashikaItems = materials.filter(m => m.adminId.toString() === ashika._id.toString());
            console.log(`\nItems for Ashika ID (${ashika._id}): ${ashikaItems.length}`);
            ashikaItems.forEach(i => console.log(`- ${i.name}`));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
