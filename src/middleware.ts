import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const adminToken = request.cookies.get('admin-token')?.value;
    const employeeToken = request.cookies.get('employee-token')?.value;

    // Admin Route Protection
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!adminToken) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }
    }

    // Employee Route Protection
    if (pathname.startsWith('/employee') && pathname !== '/employee/login') {
        if (!employeeToken) {
            const url = request.nextUrl.clone();
            url.pathname = '/employee/login';
            return NextResponse.redirect(url);
        }
    }

    // Prevent logged in admins from visiting admin login
    if (pathname === '/admin/login' && adminToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
    }

    // Prevent logged in employees from visiting employee login
    if (pathname === '/employee/login' && employeeToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/employee/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/employee/:path*'],
};
