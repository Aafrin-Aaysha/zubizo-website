import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { comparePasswords, signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { empId, password } = await req.json();

        if (!empId || !password) {
            return NextResponse.json(
                { message: 'Employee ID and password are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const employee = await Employee.findOne({ empId, isActive: true });

        if (!employee) {
            return NextResponse.json(
                { message: 'Invalid credentials or account disabled' },
                { status: 401 }
            );
        }

        const isMatch = await comparePasswords(password, employee.password);

        if (!isMatch) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = signToken({ 
            id: employee._id, 
            empId: employee.empId, 
            name: employee.name,
            role: 'employee' 
        });

        const response = NextResponse.json(
            { 
                message: 'Login successful', 
                role: 'employee',
                name: employee.name 
            },
            { status: 200 }
        );

        response.cookies.set('employee-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('Employee Login Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
