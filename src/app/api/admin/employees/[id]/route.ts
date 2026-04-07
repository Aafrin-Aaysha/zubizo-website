import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse('Admin access required');

        const { id } = await params;
        const body = await req.json();
        const { name, empId, password, isActive } = body;

        await dbConnect();
        
        const employee = await Employee.findById(id);
        if (!employee) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        // Access Control: In shared mode, any valid admin can update any employee.

        const updateData: any = {};
        if (name) updateData.name = name;
        if (empId) updateData.empId = empId;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        if (password) {
            updateData.password = await hashPassword(password);
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        
        return NextResponse.json(updatedEmployee);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Error updating employee' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse('Admin access required');

        const { id } = await params;
        await dbConnect();
        
        const employee = await Employee.findById(id);
        if (!employee) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        // Access Control: In shared mode, any valid admin can delete any employee.

        await Employee.findByIdAndDelete(id);
        
        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting employee' }, { status: 500 });
    }
}
