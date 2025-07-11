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
