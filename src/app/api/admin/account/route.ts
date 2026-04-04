import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { verifyToken, hashPassword, comparePasswords } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin-token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token) as any;
        if (!decoded) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();
        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin) {
            return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
        }

        return NextResponse.json(admin);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching account' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin-token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token) as any;
        if (!decoded) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const { name, email, currentPassword, newPassword, showGlobalData } = await req.json();

        await dbConnect();
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
        }

        // Handle Profile Update
        if (name) admin.name = name;
        if (email) admin.email = email;
        
        // Handle Global View Toggle (Super Admin Only)
        if (showGlobalData !== undefined && admin.role === 'super-admin') {
            admin.showGlobalData = showGlobalData;
        }

        // Handle Password Change
        if (currentPassword && newPassword) {
            const isMatch = await comparePasswords(currentPassword, admin.password);
            if (!isMatch) {
                return NextResponse.json({ message: 'Current password incorrect' }, { status: 400 });
            }
            admin.password = await hashPassword(newPassword);
        }

        await admin.save();

        return NextResponse.json({ message: 'Account updated successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error updating account' }, { status: 500 });
    }
}
