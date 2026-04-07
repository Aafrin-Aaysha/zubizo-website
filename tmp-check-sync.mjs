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
        const counts = materials.reduce((acc, m) => {
            const name = m.adminName || 'Unknown';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});
        
        console.log('Material Counts per Admin:');
        console.log(JSON.stringify(counts, null, 2));

        const ashikaMaterials = materials.filter(m => /ashika/i.test(m.adminName));
        if (ashikaMaterials.length > 0) {
            console.log('\nAshika\'s Materials:');
            ashikaMaterials.forEach(m => console.log(`- ${m.name} (${m.category})`));
        } else {
            console.log('\nNo materials found for Ashika.');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
