import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple session validation function
async function isValidSession(
    sessionValue: string,
    endpoint: string,
    project: string
): Promise<boolean> {
    try {
        // Create a minimal Appwrite client to test the session
        const response = await fetch(`${endpoint}/account`, {
            method: 'GET',
            headers: {
                'X-Appwrite-Project': project,
                'X-Appwrite-Session': sessionValue,
                'Content-Type': 'application/json',
            },
        });

        return response.ok;
    } catch (error) {
        console.log('[MIDDLEWARE] Session validation failed:', error);
        return false;
    }
}

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

    // If user has a session but is trying to access auth routes
    // Let it pass - the auth route will handle the redirect if session is valid
    if (isAuthRoute && session) {
        console.log(
            '[MIDDLEWARE] Has session but accessing auth route - allowing (auth route will handle redirect)'
        );
        return NextResponse.next();
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
