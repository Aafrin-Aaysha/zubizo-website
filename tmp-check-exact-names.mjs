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
        
        console.log('--- ADMINS IN DB ---');
        admins.forEach(a => {
            console.log(`- ID: ${a._id}, NAME: [${a.name}], ROLE: ${a.role}`);
        });

        console.log('\n--- MATERIALS IN DB ---');
        materials.forEach(m => {
            console.log(`- NAME: ${m.name}, ADMIN_ID: ${m.adminId}, ADMIN_NAME: [${m.adminName}]`);
        });

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
