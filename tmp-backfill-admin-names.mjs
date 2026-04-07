import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function backfill() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const MaterialSchema = new mongoose.Schema({ adminId: mongoose.Schema.Types.ObjectId, adminName: String }, { collection: 'materials' });
        const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
        
        const AdminSchema = new mongoose.Schema({ name: String }, { collection: 'admins' });
        const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

        const materials = await Material.find({});
        console.log(`Checking ${materials.length} materials...`);

        let updated = 0;
        for (const mat of materials) {
            const admin = await Admin.findById(mat.adminId);
            if (admin && (!mat.adminName || mat.adminName !== admin.name)) {
                mat.adminName = admin.name;
                await mat.save();
                updated++;
            }
        }

        console.log(`Backfilled adminName for ${updated} materials.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

backfill();
