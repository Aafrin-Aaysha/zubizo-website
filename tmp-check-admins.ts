import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('e:/zubizo_website', '.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function checkAdmins() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        const admins = await Admin.find({});
        console.log('Admins in DB:');
        admins.forEach(a => console.log(`- ${a.name} (${a.email}) [${a.role}]`));
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkAdmins();
