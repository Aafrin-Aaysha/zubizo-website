import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

/**
 * Validates the admin-token cookie and returns the decoded payload.
 * Throws an error or returns null if invalid.
 */
export async function getAdminFromRequest(req: NextRequest) {
    const token = req.cookies.get('admin-token')?.value;
    if (!token) return null;
    try {
        const decoded = verifyToken(token) as any;
        if (decoded?.role !== 'admin' && decoded?.role !== 'super-admin') return null;
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function getEmployeeFromRequest(req: NextRequest) {
    const token = req.cookies.get('employee-token')?.value;
    if (!token) return null;
    try {
        const decoded = verifyToken(token) as any;
        if (decoded?.role !== 'employee') return null;
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Standard unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized. Access required.') {
    return new Response(JSON.stringify({ message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    });
}
