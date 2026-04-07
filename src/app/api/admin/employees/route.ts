import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse('Admin access required');

        await dbConnect();
        const employees = await Employee.find({ adminId: admin.id }).select('-password').sort({ createdAt: -1 });
        return NextResponse.json(employees);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching employees' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse('Admin access required');

        const body = await req.json();
        const { empId, name, password } = body;

        if (!empId || !name || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        
        // Check if empId exists globally
        const exists = await Employee.findOne({ empId });
        if (exists) {
            return NextResponse.json({ message: 'Employee ID already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);
        const employee = await Employee.create({
            adminId: admin.id,
            empId,
            name,
            password: hashedPassword,
        });

        const employeeObj = employee.toObject();
        delete employeeObj.password;

        return NextResponse.json(employeeObj, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Error creating employee' }, { status: 500 });
    }
}
