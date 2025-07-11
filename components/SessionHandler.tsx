'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SessionHandlerProps {
    children: React.ReactNode;
    showLogout?: boolean;
}

export default function SessionHandler({
    children,
    showLogout = false,
}: SessionHandlerProps) {
    const router = useRouter();
    const [isClearing, setIsClearing] = useState(false);

    const clearSessionAndRedirect = async () => {
        setIsClearing(true);

        try {
            // Clear session cookie by calling clear-session endpoint
            await fetch('/api/clear-session', {
                method: 'POST',
                credentials: 'include',
            });

            // Also try logout endpoint
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });

            // Clear any local storage
            localStorage.clear();
            sessionStorage.clear();

            // Force page reload to clear any cached state
            window.location.href = '/sign-in';
        } catch (error) {
            console.error('Error clearing session:', error);
            // Force redirect anyway
            window.location.href = '/sign-in';
        }
    };

    return (
        <div className='session-handler'>
            {children}

            {showLogout && (
                <div className='mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
                    <p className='text-yellow-800 text-sm mb-2'>
                        Having trouble accessing your account?
                    </p>
                    <button
                        onClick={clearSessionAndRedirect}
                        disabled={isClearing}
                        className='text-yellow-700 underline text-sm hover:text-yellow-900 disabled:opacity-50'>
                        {isClearing
                            ? 'Clearing session...'
                            : 'Clear session and try again'}
                    </button>
                </div>
            )}
        </div>
    );
}
