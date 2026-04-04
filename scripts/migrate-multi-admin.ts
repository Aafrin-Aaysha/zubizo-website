import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(process.cwd(), '.env') });
}

const MONGODB_URI = process.env.MONGODB_URI;

// Define Schemas Locally to avoid path issues
const AdminSchema = new mongoose.Schema({ name: String, email: String });
const InquirySchema = new mongoose.Schema({ assignedAdmin: mongoose.Schema.Types.ObjectId });
const MaterialSchema = new mongoose.Schema({ adminId: mongoose.Schema.Types.ObjectId });
const EmployeeSchema = new mongoose.Schema({ adminId: mongoose.Schema.Types.ObjectId });

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

async function migrateData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        const superAdmin = await Admin.findOne({ email: 'afrose@zubizo.com' });
        if (!superAdmin) {
            console.error('Super Admin not found! Please run seed-multi-admin.ts first.');
            process.exit(1);
        }

        const adminId = superAdmin._id;

        // 1. Migrate Inquiries
        console.log('Migrating Inquiries...');
        const inquiryResult = await Inquiry.updateMany(
            { assignedAdmin: { $exists: false } },
            { $set: { assignedAdmin: adminId } }
        );
        console.log(`Updated ${inquiryResult.modifiedCount} inquiries.`);

        // 2. Migrate Materials (Inventory)
        console.log('Migrating Materials...');
        const materialResult = await Material.updateMany(
            { adminId: { $exists: false } },
            { $set: { adminId: adminId } }
        );
        console.log(`Updated ${materialResult.modifiedCount} materials.`);

        // 3. Migrate Employees (Designers)
        console.log('Migrating Employees...');
        const employeeResult = await Employee.updateMany(
            { adminId: { $exists: false } },
            { $set: { adminId: adminId } }
        );
        console.log(`Updated ${employeeResult.modifiedCount} employees.`);

        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrateData();
