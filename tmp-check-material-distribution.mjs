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
        const materials = await mongoose.connection.db.collection('materials').find({}).toArray();
        const admins = await mongoose.connection.db.collection('admins').find({}).toArray();
        
        console.log('--- ADMINS ---');
        admins.forEach(a => console.log(`- ${a.name} (${a.role}) [_id: ${a._id}]`));

        console.log('\n--- MATERIALS BY ADMIN NAME ---');
        const byName = materials.reduce((acc, m) => {
            acc[m.adminName] = (acc[m.adminName] || 0) + 1;
            return acc;
        }, {});
        console.log(JSON.stringify(byName, null, 2));

        console.log('\n--- MATERIALS BY ADMIN ID (STRING) ---');
        const byId = materials.reduce((acc, m) => {
            const id = m.adminId.toString();
            acc[id] = (acc[id] || 0) + 1;
            return acc;
        }, {});
        console.log(JSON.stringify(byId, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
