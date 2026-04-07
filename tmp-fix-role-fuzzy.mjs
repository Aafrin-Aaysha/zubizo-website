import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function fix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = await mongoose.connection.db.collection('admins').findOne({ email: /afrose/i });
        if (admin) {
            const result = await mongoose.connection.db.collection('admins').updateOne(
                { _id: admin._id },
                { $set: { role: 'super-admin' } }
            );
            console.log(`Updated ${admin.email} (ID: ${admin._id}) to super-admin. Modified: ${result.modifiedCount}`);
        } else {
            console.log('Afrose not found');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fix();
