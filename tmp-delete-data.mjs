import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('e:/zubizo_website', '.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

async function runDelete() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        // 1. Delete all employees
        const empDeleteResult = await mongoose.connection.db.collection('employees').deleteMany({});
        console.log(`Deleted ${empDeleteResult.deletedCount} employees.`);
        
        // 2. Delete E-Invite categories
        const catDeleteResult = await mongoose.connection.db.collection('categories').deleteMany({
            slug: { $in: ['digital-e-invite', 'premium-e-website'] }
        });
        console.log(`Deleted ${catDeleteResult.deletedCount} categories.`);
        
        // 3. Delete site settings
        const settingsDeleteResult = await mongoose.connection.db.collection('sitesettings').deleteMany({});
        console.log(`Deleted ${settingsDeleteResult.deletedCount} site settings.`);
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
runDelete();
