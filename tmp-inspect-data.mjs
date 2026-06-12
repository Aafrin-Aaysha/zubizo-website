import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('e:/zubizo_website', '.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
        console.log("=== CATEGORIES ===");
        console.log(categories.map(c => ({ id: c._id, name: c.name, slug: c.slug, order: c.displayOrder })));
        
        const employees = await mongoose.connection.db.collection('employees').find({}).toArray();
        console.log("=== EMPLOYEES ===");
        console.log(employees.map(e => ({ id: e._id, name: e.name, empId: e.empId, role: e.role })));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
check();
