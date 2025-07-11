import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes and static assets
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/icons/') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    console.log('[MIDDLEWARE] Request for:', pathname);

    // Get the session cookie
    const session = request.cookies.get('appwrite-session');
    console.log(
        '[MIDDLEWARE] Session cookie:',
        session ? 'present' : 'missing'
    );

    // Define protected routes
    const protectedRoutes = [
        '/',
        '/my-banks',
        '/payment-transfer',
        '/transaction-history',
    ];
    const authRoutes = ['/sign-in', '/sign-up'];

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    );

    // Check if the current path is an auth route
    const isAuthRoute = authRoutes.includes(pathname);

    console.log(
        '[MIDDLEWARE] Protected route:',
        isProtectedRoute,
        'Auth route:',
        isAuthRoute
    );

    // If user is not authenticated and trying to access protected route
    if (isProtectedRoute && !session) {
        console.log('[MIDDLEWARE] Redirecting to sign-in (no session)');
        const url = request.nextUrl.clone();
        url.pathname = '/sign-in';
        return NextResponse.redirect(url);
    }

    // If user is authenticated and trying to access auth routes, redirect to dashboard
    if (isAuthRoute && session) {
        console.log('[MIDDLEWARE] Redirecting to dashboard (has session)');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    console.log('[MIDDLEWARE] Allowing request to proceed');
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
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public|icons).*)',
    ],
};
