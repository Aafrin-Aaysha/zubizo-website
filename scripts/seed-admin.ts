import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env or .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(process.cwd(), '.env') });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

// Admin Schema (Simplified for script)
const AdminSchema = new mongoose.Schema({
    name: { type: String, default: 'Admin' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'super-admin'], default: 'admin' },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@zubizo.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Zubizo@2024';
        const adminName = process.env.ADMIN_NAME || 'Zubizo Admin';

        // Check if admin exists
        const existingAdmin = await Admin.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(`Admin with email ${adminEmail} already exists. Skipping seed.`);
            process.exit(0);
        }

        console.log(`Creating admin: ${adminName} (${adminEmail})...`);
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        await Admin.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'super-admin'
        });

        console.log('✅ Admin account created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword} (Please change this after first login)`);

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedAdmin();
