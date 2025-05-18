import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export function middleware(request: NextRequest) {
  // Get the hostname (domain or subdomain)
  const host = request.headers.get('host') || '';
  const domain = host.split(':')[0]; // Remove port if present
  
  // Check if we're on localhost - skip domain filtering
  const isLocalhost = domain === 'localhost' || domain === '127.0.0.1';
  
  // You can log domain information for debugging
  console.log('Middleware - Processing domain:', domain, isLocalhost ? '(localhost - no filtering)' : '');
  
  // Get the current URL
  const url = new URL(request.url);
  
  // If not localhost and the URL is for an API call that should include domain information
  // but doesn't already have it, add it as a query parameter
  if (!isLocalhost && 
      url.pathname.startsWith('/api/') && 
      !url.searchParams.has('domain') &&
      !url.searchParams.has('use_domain')) {
    // Clone the URL to modify it
    const newUrl = new URL(url);
    
    // Add domain as a query parameter
    newUrl.searchParams.set('domain', domain);
    
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