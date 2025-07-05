import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'upscale-banking',
            version: '1.0.0',
        },
        { status: 200 }
    );
}
