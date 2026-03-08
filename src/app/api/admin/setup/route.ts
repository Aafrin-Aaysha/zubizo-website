import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();

        const email = "admin@zubizo.com";
        const password = "zubizo_art_admin";

        const existing = await Admin.findOne({ email });
        if (existing) {
            return NextResponse.json({ message: "Admin user already exists." }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        await Admin.create({
            email,
            password: hashedPassword,
            name: "Zubizo Admin",
            role: "super-admin"
        });

        return NextResponse.json({ message: "Initial admin account created successfully!" });
    } catch (error: any) {
        console.error('Setup Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
