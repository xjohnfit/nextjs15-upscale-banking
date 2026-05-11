import { NextRequest } from 'next/server';
import { jsonNoStore } from '@/lib/security';

export async function GET(_request: NextRequest) {
    try {
        return jsonNoStore(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
            },
            200
        );
    } catch (error) {
        return jsonNoStore(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: 'Health check failed',
            },
            503
        );
    }
}
