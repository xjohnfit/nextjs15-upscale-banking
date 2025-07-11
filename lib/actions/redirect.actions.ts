'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function redirectToDashboard() {
    // Check if user has session
    const cookieStore = await cookies();
    const session = cookieStore.get('appwrite-session');

    if (session) {
        redirect('/');
    } else {
        redirect('/sign-in');
    }
}

export async function redirectToSignIn() {
    redirect('/sign-in');
}
