import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('e:/zubizo_website', '.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

async function runDelete() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        const deleteResult = await mongoose.connection.db.collection('homepagesections').deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} homepage sections.`);
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
runDelete();
