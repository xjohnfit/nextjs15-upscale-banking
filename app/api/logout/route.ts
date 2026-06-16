import { NextRequest } from 'next/server';
import { logoutAccount } from '@/lib/actions/user.actions';
import { isSameOrigin, jsonNoStore } from '@/lib/security';

export async function POST(request: NextRequest) {
    if (!isSameOrigin(request)) {
        return jsonNoStore({ success: false, message: 'Forbidden origin' }, 403);
    }

    try {
        await logoutAccount();
        return jsonNoStore({ success: true, message: 'Logged out successfully' }, 200);
    } catch {
        return jsonNoStore({ success: true, message: 'Session cleared' }, 200);
    }
}
