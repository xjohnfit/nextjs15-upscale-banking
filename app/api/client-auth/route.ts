import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;
        
        console.log('[CLIENT-SIDE-AUTH] Auth attempt for:', email);
        
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }
        
        // Create Appwrite session
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(email, password);
        
        console.log('[CLIENT-SIDE-AUTH] Session created:', session.$id);
        
        // Return session data to client to set cookie via JavaScript
        return NextResponse.json({
            success: true,
            sessionSecret: session.secret,
            userId: session.userId,
            sessionId: session.$id,
            expires: session.expire,
            cookieString: `appwrite-session=${session.secret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error: any) {
        console.error('[CLIENT-SIDE-AUTH] Error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error?.message || 'Authentication failed',
                code: error?.code,
                type: error?.type
            },
            { status: 401 }
        );
    }
}
