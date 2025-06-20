import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';

// This would clear cache in production - for development only
export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Simple auth check - in production use proper authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-key') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real application, you would clear Redis or your actual cache
    // For now, we'll just log that cache would be cleared
    securityLogger.logInfo('Cache clear request', {
      ip,
      timestamp: new Date().toISOString(),
      endpoint: '/api/cache/clear'
    });

    // Clear in-memory caches by restarting the process would be needed
    // Or if using Redis: await redis.flushall()
    
    return NextResponse.json({
      success: true,
      message: 'Cache clear request logged. In production, this would clear Redis cache.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    securityLogger.logError('Error clearing cache', error as Error, {
      ip,
      endpoint: '/api/cache/clear'
    });

    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to clear cache',
    usage: 'POST /api/cache/clear with Authorization: Bearer admin-key'
  });
} 