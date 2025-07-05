import { describe, it, expect } from 'vitest';
import { GET, POST } from './route';

// Mock NextRequest and NextResponse for API route testing
import { NextRequest } from 'next/server';

// TODO: Add more advanced mocks for Supabase and auth if needed

describe('API /api/user/rewards', () => {
  it('should return 401 if not authenticated (GET)', async () => {
    // Mock unauthenticated request
    const req = {
      headers: new Headers(),
      url: 'http://localhost/api/user/rewards',
      method: 'GET',
    } as unknown as NextRequest;

    const res = await GET(req);
    // @ts-ignore
    expect(res.status).toBe(401);
  });

  it('should return 401 if not authenticated (POST)', async () => {
    const req = {
      headers: new Headers(),
      url: 'http://localhost/api/user/rewards',
      method: 'POST',
      json: async () => ({ points: 100, type: 'earn', reason: 'test' }),
    } as unknown as NextRequest;

    const res = await POST(req);
    // @ts-ignore
    expect(res.status).toBe(401);
  });

  // More tests can be added for authenticated, validation, etc.
});
