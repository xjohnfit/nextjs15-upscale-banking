'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AuthDebugProps {
    isProduction?: boolean;
}

export default function AuthDebug({ isProduction = false }: AuthDebugProps) {
    const [authStatus, setAuthStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const checkAuthStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth-status');
            const data = await response.json();
            setAuthStatus(data);
        } catch (error) {
            console.error('Failed to check auth status:', error);
            setAuthStatus({ error: 'Failed to check auth status' });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!isProduction) {
            checkAuthStatus();
        }
    }, [isProduction]);

    if (isProduction) {
        return null; // Don't show debug info in production
    }

    return (
        <div className='fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm'>
            <h3 className='font-bold text-sm mb-2'>Auth Debug</h3>
            <Button
                onClick={checkAuthStatus}
                disabled={loading}
                className='mb-2 text-xs'>
                {loading ? 'Checking...' : 'Check Auth Status'}
            </Button>
            {authStatus && (
                <div className='text-xs space-y-1'>
                    <div>
                        Cookie: {authStatus.hasSessionCookie ? '✅' : '❌'}
                    </div>
                    <div>
                        User Auth: {authStatus.userAuthenticated ? '✅' : '❌'}
                    </div>
                    <div>Env: {authStatus.environment}</div>
                    {authStatus.authError && (
                        <div className='text-red-500'>
                            Error: {authStatus.authError}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
