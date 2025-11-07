import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request) {
    // Get the pathname of the request (e.g. /, /admin, /login)
    const path = request.nextUrl.pathname;

    // If it's the login page and we're already logged in,
    // redirect to admin dashboard
    if (path === '/login') {
        const token = request.cookies.get('admin_token');
        if (token) {
            return NextResponse.redirect(new URL('/admin/quizzes', request.url));
        }
    }

    // If it's an admin page and we're not logged in,
    // redirect to login page
    if (path.startsWith('/admin')) {
        const token = request.cookies.get('admin_token');
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/login'
    ]
};