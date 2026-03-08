import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://Aafrin:Afrose20041979@zubizo.3pyl2.mongodb.net/zubizo?retryWrites=true&w=majority&appName=zubizo";

const AdminSchema = new mongoose.Schema({
    name: { type: String, default: 'Admin' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'super-admin' },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        const email = "admin@zubizo.com";
        const password = "zubizo_art_admin";

        const existing = await Admin.findOne({ email });
        if (existing) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await Admin.create({
            email,
            password: hashedPassword,
            name: "Zubizo Admin",
            role: "super-admin"
        });

        console.log("SUCCESS: Initial admin user created!");
        console.log("Email: " + email);
        console.log("You can now log in at zubizoart.com/admin/login");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
}

seed();
