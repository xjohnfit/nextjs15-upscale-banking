import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Basic health check - you can expand this to check database connectivity, external APIs, etc.
        const healthCheck = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: 'connected', // You can add actual database health check here
                external_apis: 'operational', // Add checks for Plaid, Dwolla, Appwrite
            },
        };

        return NextResponse.json(healthCheck, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Health check failed',
            },
            { status: 503 }
        );
    }
}
