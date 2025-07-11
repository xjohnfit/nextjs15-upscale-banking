import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/actions/user.actions';

export async function POST(request: NextRequest) {
    try {
        console.log('=== AUTH FLOW TEST START ===');
        
        const testUserData = {
            firstName: 'Test',
            lastName: 'User',
            address1: '123 Test St',
            city: 'Test City',
            state: 'CA',
            postalCode: '12345',
            dateOfBirth: '1990-01-01',
            ssn: '123-45-6789',
            email: `test+${Date.now()}@example.com`,
            password: 'TestPassword123!',
        };
        
        console.log('Creating test user with email:', testUserData.email);
        
        const result = await signUp(testUserData);
        
        if (result) {
            console.log('User created successfully:', result.$id);
            return NextResponse.json({
                success: true,
                message: 'Test user created successfully',
                userId: result.$id,
                email: testUserData.email,
                timestamp: new Date().toISOString(),
            });
        } else {
            console.log('User creation failed');
            return NextResponse.json({
                success: false,
                message: 'User creation failed',
                timestamp: new Date().toISOString(),
            });
        }
        
    } catch (error: any) {
        console.error('=== AUTH FLOW TEST ERROR ===');
        console.error('Error:', error);
        
        return NextResponse.json({
            success: false,
            error: error?.message || 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
}
