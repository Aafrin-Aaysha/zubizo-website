import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(process.cwd(), '.env') });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

// Admin Schema
const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'super-admin'], default: 'admin' },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedMultiAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        const password = 'ashika.admin';
        const hashedPassword = await bcrypt.hash(password, 12);

        const admins = [
            {
                name: 'Afrose S',
                email: 'afrose@zubizo.com',
                password: hashedPassword,
                role: 'super-admin'
            },
            {
                name: 'Ashika Parveen K',
                email: 'ashika@zubizo.com',
                password: hashedPassword,
                role: 'admin'
            }
        ];

        for (const adminData of admins) {
            const existing = await Admin.findOne({ email: adminData.email });
            if (existing) {
                console.log(`Updating existing admin: ${adminData.name} (${adminData.email})...`);
                await Admin.updateOne({ email: adminData.email }, adminData);
            } else {
                console.log(`Creating new admin: ${adminData.name} (${adminData.email})...`);
                await Admin.create(adminData);
            }
        }

        console.log('✅ Multi-Admin accounts seeded successfully!');
        console.log('Afrose S (Super Admin) - Ph: 8124548133');
        console.log('Ashika Parveen K (Admin)');
        console.log(`Shared Password: ${password}`);

    } catch (error) {
        console.error('❌ Error seeding multi-admins:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedMultiAdmin();
