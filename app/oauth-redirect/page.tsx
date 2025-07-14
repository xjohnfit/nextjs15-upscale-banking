'use client';

import { useEffect } from 'react';

export default function OAuthRedirect() {
    useEffect(() => {
        // This page handles OAuth redirects for Plaid
        // The Plaid Link will automatically handle the redirect
        // and continue the flow within the modal

        // Close this window/tab if it opened in a popup
        if (window.opener) {
            window.close();
        } else {
            // If not in a popup, redirect back to the main page
            window.location.href = '/';
        }
    }, []);

    return (
        <div className='flex items-center justify-center min-h-screen'>
            <div className='text-center'>
                <h1 className='text-xl font-semibold mb-2'>Processing...</h1>
                <p className='text-gray-600'>Completing bank connection...</p>
            </div>
        </div>
    );
}
