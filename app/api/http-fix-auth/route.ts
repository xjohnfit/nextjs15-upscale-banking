import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;
        
        console.log('[HTTP-FIX] Auth attempt for:', email);
        
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }
        
        // Create Appwrite session
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(email, password);
        
        console.log('[HTTP-FIX] Session created successfully:', session.$id);
        
        // Create response with cookie set via header (no secure flag)
        const response = NextResponse.json({
            success: true,
            userId: session.userId,
            sessionId: session.$id,
            message: 'Authentication successful - HTTP fix applied',
            timestamp: new Date().toISOString()
        });
        
        // Set cookie via header without secure flag for HTTP
        const cookieValue = `appwrite-session=${session.secret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
        response.headers.set('Set-Cookie', cookieValue);
        
        console.log('[HTTP-FIX] Cookie set:', cookieValue);
        
        return response;
        
    } catch (error: any) {
        console.error('[HTTP-FIX] Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error?.message || 'Authentication failed',
                fix: 'HTTP cookie fix attempted'
            },
            { status: 401 }
        );
    }
}
