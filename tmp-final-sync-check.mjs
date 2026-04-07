import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
        
        let output = 'Material Counts:\n' + JSON.stringify(counts, null, 2) + '\n\n';
        
        const ashikaMaterials = materials.filter(m => /Ashika/i.test(m.adminName));
        output += 'Ashika Materials:\n' + ashikaMaterials.map(m => `- ${m.name}`).join('\n');
        
        fs.writeFileSync('sync-report.txt', output);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
