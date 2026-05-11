import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { isSameOrigin, jsonNoStore, SESSION_COOKIE_NAME } from '@/lib/security';

const getLegacyCookieDomain = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
        return undefined;
    }

    try {
        const hostname = new URL(siteUrl).hostname.toLowerCase();
        const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

        if (
            hostname === 'localhost' ||
            isIpAddress ||
            !hostname.includes('.')
        ) {
            return undefined;
        }

        if (hostname.startsWith('www.')) {
            return hostname.slice(4);
        }

        return hostname;
    } catch {
        return undefined;
    }
};

const clearSessionCookie = async () => {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    const configuredDomain = process.env.APP_COOKIE_DOMAIN?.trim();

    cookieStore.set(SESSION_COOKIE_NAME, '', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        maxAge: 0,
        ...(configuredDomain && isProd ? { domain: configuredDomain } : {}),
    });

    const legacyDomain = getLegacyCookieDomain();
    if (legacyDomain && isProd) {
        cookieStore.set(SESSION_COOKIE_NAME, '', {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
            domain: legacyDomain,
            maxAge: 0,
        });
    }
};

export async function POST(request: NextRequest) {
    if (!isSameOrigin(request)) {
        return jsonNoStore(
            { success: false, message: 'Forbidden origin' },
            403,
        );
    }

    await clearSessionCookie();

    return jsonNoStore({ success: true, message: 'Session cleared' }, 200);
}
