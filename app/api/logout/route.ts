import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { logoutAccount } from '@/lib/actions/user.actions';
import { isSameOrigin, jsonNoStore, SESSION_COOKIE_NAME } from '@/lib/security';

const normalizeCookieDomain = (domain: string | undefined) => {
    if (!domain) {
        return undefined;
    }

    let normalized = domain.trim().toLowerCase();

    if (!normalized) {
        return undefined;
    }

    try {
        if (normalized.includes('://')) {
            normalized = new URL(normalized).hostname.toLowerCase();
        }
    } catch {
        return undefined;
    }

    if (normalized.includes('/')) {
        normalized = normalized.split('/')[0];
    }

    if (normalized.includes(':')) {
        normalized = normalized.split(':')[0];
    }

    if (normalized.startsWith('.')) {
        normalized = normalized.slice(1);
    }

    const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(normalized);

    if (!normalized || normalized === 'localhost' || isIpAddress) {
        return undefined;
    }

    if (!normalized.includes('.')) {
        return undefined;
    }

    return normalized;
};

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
    const configuredDomain = normalizeCookieDomain(
        process.env.APP_COOKIE_DOMAIN,
    );

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

    try {
        await logoutAccount();
        await clearSessionCookie();

        return jsonNoStore(
            { success: true, message: 'Logged out successfully' },
            200,
        );
    } catch (error: any) {
        try {
            await clearSessionCookie();
        } catch (cookieError) {
            console.error('Unable to clear session cookie during logout');
        }

        return jsonNoStore({ success: true, message: 'Session cleared' }, 200);
    }
}
