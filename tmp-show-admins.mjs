import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { collection: 'admins' });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admins = await Admin.find({});
        console.log('Admins list:');
        admins.forEach(a => console.log(`- ${a.name} (${a.email}) [${a.role}]`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
