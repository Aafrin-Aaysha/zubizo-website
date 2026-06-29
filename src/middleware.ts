import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const adminToken = request.cookies.get('admin-token')?.value;
    const employeeToken = request.cookies.get('employee-token')?.value;

    // Redirect /terms to /policies
    if (pathname === '/terms') {
        const url = request.nextUrl.clone();
        url.pathname = '/policies';
        return NextResponse.redirect(url);
    }

    // 1. Admin Route Protection
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        if (!adminToken) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }
    }

    // 2. Employee Route Protection
    if (pathname.startsWith('/employee') && pathname !== '/employee/login') {
        if (!employeeToken) {
            const url = request.nextUrl.clone();
            url.pathname = '/employee/login';
            return NextResponse.redirect(url);
        }
    }

    // 3. Prevent logged in admins from visiting admin login
    if (pathname === '/admin/login' && adminToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin/dashboard';
        return NextResponse.redirect(url);
    }

    // 4. Prevent logged in employees from visiting employee login
    if (pathname === '/employee/login' && employeeToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/employee/dashboard';
        return NextResponse.redirect(url);
    }

    // 5. Coming Soon / Developing Stage Maintenance Mode for Public Pages
    const isPublicPage = 
        !pathname.startsWith('/admin') &&
        !pathname.startsWith('/employee') &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/coming-soon') &&
        !pathname.startsWith('/policies') &&
        !pathname.includes('.') && 
        !pathname.startsWith('/_next');

    // MAINTENANCE_MODE defaults to true on master branch unless explicitly configured as 'false'
    const isMaintenanceMode = process.env.MAINTENANCE_MODE !== 'false';

    if (isMaintenanceMode && isPublicPage) {
        const url = request.nextUrl.clone();
        url.pathname = '/coming-soon';
        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
