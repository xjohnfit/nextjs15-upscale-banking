import { NextRequest, NextResponse } from 'next/server';

function getCanonicalUrl() {
    const raw = process.env.NEXT_PUBLIC_SITE_URL;

    if (!raw) {
        return null;
    }

    try {
        return new URL(raw);
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const requestUrl = request.nextUrl;
    const pathname = requestUrl.pathname;

    if (
        pathname === '/api/health' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/icons')
    ) {
        return NextResponse.next();
    }

    const canonical = getCanonicalUrl();
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const currentProto = forwardedProto ?? requestUrl.protocol.replace(':', '');

    // In production, force HTTPS so secure cookies can be persisted by browsers.
    if (process.env.NODE_ENV === 'production' && currentProto !== 'https') {
        const redirectUrl = requestUrl.clone();
        redirectUrl.protocol = 'https:';
        return NextResponse.redirect(redirectUrl, 308);
    }

    if (!canonical) {
        return NextResponse.next();
    }

    const canonicalHost = canonical.host.toLowerCase();
    const currentHost = request.headers.get('host')?.toLowerCase();

    if (currentHost && currentHost !== canonicalHost) {
        const redirectUrl = requestUrl.clone();
        redirectUrl.protocol = canonical.protocol;
        redirectUrl.host = canonical.host;
        return NextResponse.redirect(redirectUrl, 308);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
