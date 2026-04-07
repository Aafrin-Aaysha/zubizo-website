import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('e:/zubizo_website', '.env.local') });
const MONGODB_URI = process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

const EmployeeSchema = new mongoose.Schema({
    adminId: mongoose.Schema.Types.ObjectId,
    name: String
}, { strict: false });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        const oldAdmin = await Admin.findOne({ email: 'admin@zubizo.com' });
        if (oldAdmin) {
            const empCount = await Employee.countDocuments({ adminId: oldAdmin._id });
            console.log(`Employees linked to admin@zubizo.com: ${empCount}`);
        } else {
            console.log('Old admin not found');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

checkData();
