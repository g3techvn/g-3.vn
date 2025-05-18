import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export function middleware(request: NextRequest) {
  // Get the hostname (domain or subdomain) - for info only
  const host = request.headers.get('host') || '';
  const domain = host.split(':')[0]; // Remove port if present
  
  // Use environment variable for domain instead of actual request domain
  const g3Domain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
  
  // You can log domain information for debugging
  console.log('Middleware - Using domain:', g3Domain);
  
  // Get the current URL
  const url = new URL(request.url);
  
  // For API calls that should include domain information
  // but don't already have it, add it as a query parameter
  if (url.pathname.startsWith('/api/') && 
      !url.searchParams.has('domain') &&
      !url.searchParams.has('use_domain')) {
    // Clone the URL to modify it
    const newUrl = new URL(url);
    
    // Add domain as a query parameter - using the environment variable
    newUrl.searchParams.set('domain', g3Domain);
    
    // If it's a direct product API call, enable domain-based filtering
    if (url.pathname === '/api/products' && !url.searchParams.has('sector_id')) {
      newUrl.searchParams.set('use_domain', 'true');
    }
    
    // Rewrite the URL with the new params
    return NextResponse.rewrite(newUrl);
  }
  
  // Continue with the request without modification
  return NextResponse.next();
} 