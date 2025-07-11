'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProductionDebug() {
    const [result, setResult] = useState<string>('');
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password123');

    const checkDebugInfo = async () => {
        try {
            const response = await fetch('/api/debug-production');
            const data = await response.json();
            setResult('Debug Info:\n' + JSON.stringify(data, null, 2));
        } catch (error) {
            setResult('Debug Error: ' + error);
        }
    };

    const testProductionAuth = async () => {
        try {
            const response = await fetch('/api/test-production-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    testType: 'production-test',
                }),
            });
            const data = await response.json();
            setResult(
                'Production Auth Test:\n' + JSON.stringify(data, null, 2)
            );
        } catch (error) {
            setResult('Production Auth Error: ' + error);
        }
    };

    const testAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth-status');
            const data = await response.json();
            setResult('Auth Status:\n' + JSON.stringify(data, null, 2));
        } catch (error) {
            setResult('Auth Status Error: ' + error);
        }
    };

    const testAlternativeAuth = async (method: string) => {
        try {
            const response = await fetch('/api/alt-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, method })
            });
            const data = await response.json();
            setResult(`Alternative Auth (${method}):\n` + JSON.stringify(data, null, 2));
            
            // If successful, try to reload the page to see if auth worked
            if (data.success) {
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            setResult(`Alternative Auth Error: ${error}`);
        }
    };

    const testAggressiveCookies = async () => {
        try {
            const response = await fetch('/api/aggressive-cookie-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testType: 'production-cookies' })
            });
            const data = await response.json();
            setResult('Aggressive Cookie Test:\n' + JSON.stringify(data, null, 2));
        } catch (error) {
            setResult('Aggressive Cookie Error: ' + error);
        }
    };

    const testClientSideAuth = async () => {
        try {
            const response = await fetch('/api/client-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (data.success) {
                // Try to set cookie via JavaScript (not ideal but may work)
                try {
                    // Note: HttpOnly cookies can't be set via JavaScript, so we'll set a different one
                    document.cookie = `client-session=${data.sessionSecret}; Path=/; SameSite=Lax; Max-Age=2592000${window.location.protocol === 'https:' ? '; Secure' : ''}`;
                    setResult(`Client Auth Success:\n${JSON.stringify(data, null, 2)}\n\nCookie set via JavaScript. Reloading in 2 seconds...`);
                    
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } catch (cookieError) {
                    setResult(`Client Auth Success but cookie failed:\n${JSON.stringify(data, null, 2)}\n\nCookie Error: ${cookieError}`);
                }
            } else {
                setResult(`Client Auth Failed:\n${JSON.stringify(data, null, 2)}`);
            }
        } catch (error) {
            setResult(`Client Auth Error: ${error}`);
        }
    };

    const testHttpFix = async () => {
        try {
            const response = await fetch('/api/http-fix-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            setResult(`HTTP Fix Test:\n${JSON.stringify(data, null, 2)}`);
            
            if (data.success) {
                setResult(prev => prev + '\n\n✅ Authentication successful! Redirecting in 3 seconds...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            }
        } catch (error) {
            setResult(`HTTP Fix Error: ${error}`);
        }
    };

    const runAllTests = async () => {
        setResult('Running all tests...\n\n');
        
        // Test 1: Environment
        try {
            const envResponse = await fetch('/api/debug-production');
            const envData = await envResponse.json();
            setResult(prev => prev + '=== ENVIRONMENT ===\n' + JSON.stringify(envData, null, 2) + '\n\n');
        } catch (error) {
            setResult(prev => prev + '=== ENVIRONMENT ERROR ===\n' + error + '\n\n');
        }
        
        // Test 2: Cookie setting
        try {
            const cookieResponse = await fetch('/api/test-production-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, testType: 'comprehensive' })
            });
            const cookieData = await cookieResponse.json();
            setResult(prev => prev + '=== COOKIE TEST ===\n' + JSON.stringify(cookieData, null, 2) + '\n\n');
        } catch (error) {
            setResult(prev => prev + '=== COOKIE TEST ERROR ===\n' + error + '\n\n');
        }
        
        // Test 3: Alternative auth
        try {
            const altResponse = await fetch('/api/alt-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, method: 'headers' })
            });
            const altData = await altResponse.json();
            setResult(prev => prev + '=== ALTERNATIVE AUTH ===\n' + JSON.stringify(altData, null, 2) + '\n\n');
        } catch (error) {
            setResult(prev => prev + '=== ALTERNATIVE AUTH ERROR ===\n' + error + '\n\n');
        }
        
        setResult(prev => prev + '=== ALL TESTS COMPLETE ===');
    };

    return (
        <div className='p-4 border rounded-lg bg-white shadow-lg max-w-md'>
            <h3 className='font-bold mb-3'>Production Debug Tools</h3>

            <div className='space-y-2 mb-4'>
                <Input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='text-sm'
                />
                <Input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='text-sm'
                />
            </div>

            <div className='space-y-2'>
                <Button
                    onClick={checkDebugInfo}
                    className='w-full text-xs'>
                    Check Environment
                </Button>
                <Button
                    onClick={testProductionAuth}
                    className='w-full text-xs'>
                    Test Production Auth
                </Button>
                <Button
                    onClick={testAuthStatus}
                    className='w-full text-xs'>
                    Check Auth Status
                </Button>
                <Button
                    onClick={testAggressiveCookies}
                    className='w-full text-xs'>
                    Test Aggressive Cookies
                </Button>
                <Button
                    onClick={() => testAlternativeAuth('headers')}
                    className='w-full text-xs'>
                    Try Header Auth
                </Button>
                <Button
                    onClick={() => testAlternativeAuth('both')}
                    className='w-full text-xs'>
                    Try Both Methods
                </Button>
                <Button
                    onClick={testClientSideAuth}
                    className='w-full text-xs'>
                    Try Client-Side Auth
                </Button>
                <Button
                    onClick={runAllTests}
                    className='w-full text-xs bg-red-600 hover:bg-red-700'>
                    🚨 Run All Tests
                </Button>
                <Button
                    onClick={testHttpFix}
                    className='w-full text-xs bg-green-600 hover:bg-green-700'>
                    🔧 HTTP Fix Test
                </Button>
                <Button
                    onClick={testClientSideAuth}
                    className='w-full text-xs'>
                    Test Client-Side Auth
                </Button>
                <Button
                    onClick={runAllTests}
                    className='w-full text-xs'>
                    Run All Tests
                </Button>
            </div>

            {result && (
                <div className='mt-3'>
                    <Button
                        onClick={() => setResult('')}
                        className='text-xs mb-2'
                        variant='outline'>
                        Clear
                    </Button>
                    <pre className='text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64 whitespace-pre-wrap'>
                        {result}
                    </pre>
                </div>
            )}
        </div>
    );
}
