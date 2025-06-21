import { NextRequest, NextResponse } from 'next/server';
import { RedisHealthChecker } from '@/lib/security/redis-fallback';
import { getEnhancedSecurityStatus } from '@/lib/security/enhanced-rate-limit';

// GET /api/security/fallback-status
export async function GET(request: NextRequest) {
  try {
    const status = await getEnhancedSecurityStatus();
    
    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get fallback status:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve fallback status',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// POST /api/security/fallback-status - Admin actions
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'reconnect-redis':
        const reconnected = await RedisHealthChecker.forceRedisReconnect();
        return NextResponse.json({
          success: true,
          data: { reconnected },
          message: reconnected ? 'Redis reconnected successfully' : 'Redis connection failed',
        });
        
      case 'clear-memory':
        RedisHealthChecker.clearMemoryFallback();
        return NextResponse.json({
          success: true,
          message: 'Memory fallback cleared',
        });
        
      case 'status':
        const status = await RedisHealthChecker.getStatus();
        return NextResponse.json({
          success: true,
          data: status,
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to execute fallback action:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute action',
    }, { status: 500 });
  }
} 