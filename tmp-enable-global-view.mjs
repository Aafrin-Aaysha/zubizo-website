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
        const admin = await mongoose.connection.db.collection('admins').findOne({ email: 'afrose@zubizo.com' });
        if (admin) {
            console.log(`Afrose Current Status: role=${admin.role}, showGlobalData=${admin.showGlobalData}`);
            // If it's false, the super-admin only sees THEIR items.
            // We should enable it so they see EVERYTHING by default if that's what they want.
            await mongoose.connection.db.collection('admins').updateOne(
                { _id: admin._id },
                { $set: { showGlobalData: true } }
            );
            console.log('Global View ENABLED for Afrose. She should now see Ashika\'s items.');
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
