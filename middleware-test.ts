import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Simple test to see if middleware runs at all
  console.log('[MIDDLEWARE TEST] RUNNING ON:', request.nextUrl.pathname);
  
  const path = request.nextUrl.pathname;
  
  // Skip API routes and static files
  if (path.startsWith('/api/') || 
      path.startsWith('/_next/') || 
      path.includes('.') ||
      path === '/' ||
      path === '/about' ||
      path === '/services' ||
      path === '/contact' ||
      path === '/auth/login' ||
      path === '/auth/register' ||
      path === '/pharmacy-info' ||
      path.startsWith('/legal/')) {
    console.log('[MIDDLEWARE TEST] ALLOWING PUBLIC:', path);
    return NextResponse.next();
  }
  
  // For any protected route, check for auth
  const token = request.cookies.get("pharmacy_auth")?.value;
  console.log('[MIDDLEWARE TEST] PROTECTED ROUTE:', path, 'HAS TOKEN:', !!token);
  
  if (!token) {
    console.log('[MIDDLEWARE TEST] REDIRECTING TO LOGIN');
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  
  console.log('[MIDDLEWARE TEST] ALLOWING AUTHENTICATED ACCESS');
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
