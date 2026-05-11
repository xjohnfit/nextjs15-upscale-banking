import { NextRequest, NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'appwrite-session';

export function isSameOrigin(request: NextRequest) {
    const origin = request.headers.get('origin');

    if (!origin) {
        return false;
    }

    const proto = request.headers.get('x-forwarded-proto') ?? 'http';
    const host =
        request.headers.get('x-forwarded-host') ?? request.headers.get('host');

    if (!host) {
        return false;
    }

    const expectedOrigin = `${proto}://${host}`;

    return origin === expectedOrigin;
}

export function jsonNoStore(data: unknown, status = 200) {
    return NextResponse.json(data, {
        status,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            Pragma: 'no-cache',
        },
    });
}
