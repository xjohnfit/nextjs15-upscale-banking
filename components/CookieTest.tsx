'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function CookieTest() {
    const [result, setResult] = useState<string>('');

    const testCookies = async () => {
        try {
            // Test setting a cookie
            const response = await fetch('/api/test-cookies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setResult('Set cookie: ' + JSON.stringify(data, null, 2));

            // Then test reading cookies
            setTimeout(async () => {
                const readResponse = await fetch('/api/test-cookies');
                const readData = await readResponse.json();
                setResult(
                    (prev) =>
                        prev +
                        '\n\nRead cookies: ' +
                        JSON.stringify(readData, null, 2)
                );
            }, 1000);
        } catch (error) {
            setResult('Error: ' + error);
        }
    };

    const testSimpleAuth = async () => {
        try {
            const response = await fetch('/api/simple-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@test.com',
                    password: 'test123',
                }),
            });
            const data = await response.json();
            setResult('Simple auth: ' + JSON.stringify(data, null, 2));
        } catch (error) {
            setResult('Simple auth error: ' + error);
        }
    };

    return (
        <div className='p-4 border rounded-lg bg-white'>
            <h3 className='font-bold mb-2'>Cookie Test</h3>
            <div className='space-y-2'>
                <Button
                    onClick={testCookies}
                    className='block w-full'>
                    Test Basic Cookies
                </Button>
                <Button
                    onClick={testSimpleAuth}
                    className='block w-full'>
                    Test Simple Auth
                </Button>
            </div>
            {result && (
                <pre className='text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64 mt-2'>
                    {result}
                </pre>
            )}
        </div>
    );
}
