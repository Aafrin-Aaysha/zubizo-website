import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin || admin.role !== 'super-admin') {
            return unauthorizedResponse('Super Admin access required');
        }

        await dbConnect();
        const admins = await Admin.find({ role: { $in: ['admin', 'super-admin'] } }).select('name email role');
        return NextResponse.json(admins);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching admins' }, { status: 500 });
    }
}
