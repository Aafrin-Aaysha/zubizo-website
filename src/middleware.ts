import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('admin-token')?.value;

    // Paths that require authentication
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!token) {
            // Redirect to login if no token
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }
    }

    // Prevent logged in users from visiting login page
    if (pathname === '/admin/login' && token) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
