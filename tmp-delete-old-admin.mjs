import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('e:/zubizo_website', '.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema({
    name: String, email: String, role: String
}, { strict: false });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function deleteOldAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        const result = await Admin.deleteOne({ email: 'admin@zubizo.com' });
        console.log(`Deleted ${result.deletedCount} old admin account(s).`);
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

deleteOldAdmin();
