import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const admins = await mongoose.connection.db.collection('admins').find({}).toArray();
        console.log(`Found ${admins.length} admins:`);
        admins.forEach(a => console.log(`  - ${a._id} => "${a.name}"`));

        const materials = await mongoose.connection.db.collection('materials').find({}).toArray();
        console.log(`\nFound ${materials.length} materials to check.\n`);

        let fixed = 0;
        for (const mat of materials) {
            const matchingAdmin = admins.find(a => a._id.toString() === mat.adminId.toString());
            if (matchingAdmin) {
                const correctName = matchingAdmin.name;
                if (mat.adminName !== correctName) {
                    await mongoose.connection.db.collection('materials').updateOne(
                        { _id: mat._id },
                        { $set: { adminName: correctName } }
                    );
                    console.log(`  FIXED: "${mat.name}" -> adminName set to "${correctName}" (was: "${mat.adminName}")`);
                    fixed++;
                }
            } else {
                console.log(`  WARNING: No admin found for material "${mat.name}" (adminId: ${mat.adminId})`);
            }
        }

        console.log(`\n✅ Migration complete. Fixed ${fixed} / ${materials.length} materials.`);
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
