import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function sync() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const MaterialSchema = new mongoose.Schema({ 
            adminId: mongoose.Schema.Types.ObjectId,
            name: String,
            adminName: String,
            category: String,
            usageType: String,
            usageValue: Number,
            currentStock: Number,
            unit: String,
            defaultPrice: Number,
            lowStockThreshold: Number
        }, { collection: 'materials' });
        const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);

        const AdminSchema = new mongoose.Schema({ name: String, role: String, email: String }, { collection: 'admins' });
        const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

        const afrose = await Admin.findOne({ email: 'afrose@zubizo.com' });
        const ashika = await Admin.findOne({ email: 'ashika@zubizo.com' });

        if (!afrose || !ashika) {
            console.error('Missing Afrose or Ashika Admin');
            process.exit(1);
        }

        const afroseMaterials = await Material.find({ adminId: afrose._id });
        console.log(`Afrose has ${afroseMaterials.length} materials.`);

        let added = 0;
        for (const mat of afroseMaterials) {
            const existing = await Material.findOne({ adminId: ashika._id, name: mat.name });
            if (!existing) {
                await Material.create({
                    adminId: ashika._id,
                    adminName: ashika.name,
                    name: mat.name,
                    category: mat.category,
                    usageType: mat.usageType,
                    usageValue: mat.usageValue,
                    currentStock: 0,
                    unit: mat.unit,
                    defaultPrice: mat.defaultPrice,
                    lowStockThreshold: mat.lowStockThreshold
                });
                added++;
            }
        }

        console.log(`Synced ${added} materials to Ashika.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
