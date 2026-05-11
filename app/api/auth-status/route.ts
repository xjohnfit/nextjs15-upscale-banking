import { NextRequest } from 'next/server';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { jsonNoStore } from '@/lib/security';

export async function GET(_request: NextRequest) {
    try {
        const user = await getLoggedInUser();

        if (!user) {
            return jsonNoStore({ authenticated: false, user: null }, 200);
        }

        return jsonNoStore(
            {
                authenticated: true,
                user: {
                    id: user.$id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            },
            200,
        );
    } catch (error) {
        return jsonNoStore({ authenticated: false, user: null }, 200);
    }
}
