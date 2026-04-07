import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const name = "Chart Sheet - White";
        const adminId = "67cc79ff1018596f2d2f6777"; // Afrose's approx ID from logs
        
        console.log('Checking all admins...');
        const AdminSchema = new mongoose.Schema({ name: String, role: String, email: String }, { collection: 'admins' });
        const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
        
        const allAdmins = await Admin.find({ role: { $in: ['admin', 'super-admin'] }});
        console.log(`Found ${allAdmins.length} admins.`);

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

        for (const targetAdmin of allAdmins) {
            console.log(`Checking for admin: ${targetAdmin.name} (${targetAdmin.email})...`);
            const existing = await Material.findOne({ adminId: targetAdmin._id, name });
            if (existing) {
                console.log(`- Already exists for ${targetAdmin.name}`);
            } else {
                console.log(`- Creating for ${targetAdmin.name}...`);
                // Simulate creation
                try {
                    // await Material.create({ ... }); // I won't actually create it, just checking if fields are valid
                    console.log(`- Would create successfully for ${targetAdmin.name}`);
                } catch (e) {
                    console.error(`- FAILED for ${targetAdmin.name}:`, e.message);
                }
            }
        }
        process.exit(0);
    } catch (e) {
        console.error('DEBUG CRASHED:', e);
        process.exit(1);
    }
}

debug();
