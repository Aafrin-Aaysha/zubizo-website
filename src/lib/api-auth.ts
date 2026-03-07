import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

/**
 * Validates the admin-token cookie and returns the decoded payload.
 * Throws an error or returns null if invalid.
 */
export async function getAdminFromRequest(req: NextRequest) {
    const token = req.cookies.get('admin-token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = verifyToken(token);
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Standard unauthorized response
 */
export function unauthorizedResponse() {
    return new Response(JSON.stringify({ message: 'Unauthorized. Admin access required.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
    });
}
