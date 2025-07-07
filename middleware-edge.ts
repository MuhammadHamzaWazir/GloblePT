import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = 'edge';

export function middleware(request: NextRequest) {
  console.log('[MIDDLEWARE] EDGE RUNTIME - Processing:', request.nextUrl.pathname);
  
  const path = request.nextUrl.pathname;
  
  // Handle static assets and API routes first
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.includes('.') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/about',
    '/services',
    '/contact',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/pharmacy-info',
    '/legal/privacy',
    '/legal/terms'
  ];
  
  // If it's a public path, allow it
  if (publicPaths.includes(path)) {
    console.log('[MIDDLEWARE] PUBLIC PATH:', path);
    return NextResponse.next();
  }
  
  // For all other paths, check authentication
  const token = request.cookies.get("pharmacy_auth")?.value;
  console.log('[MIDDLEWARE] PROTECTED PATH:', path, 'TOKEN:', !!token);
  
  if (!token) {
    console.log('[MIDDLEWARE] REDIRECTING TO LOGIN');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Handle special case: authenticated users trying to access auth pages
  if (token && path.startsWith('/auth/')) {
    const logout = request.nextUrl.searchParams.get('logout');
    if (logout === 'true') {
      // Clear cookie and allow access to login page
      const response = NextResponse.next();
      response.cookies.delete("pharmacy_auth");
      return response;
    } else {
      // Redirect to dashboard
      console.log('[MIDDLEWARE] REDIRECTING AUTH USER TO DASHBOARD');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  console.log('[MIDDLEWARE] ALLOWING AUTHENTICATED ACCESS');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
