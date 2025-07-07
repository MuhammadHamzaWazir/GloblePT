import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Force console log to appear in production logs
  console.log('[MIDDLEWARE] Processing:', request.nextUrl.pathname, 'URL:', request.url);
  console.log('[MIDDLEWARE] User-Agent:', request.headers.get('user-agent'));
  console.log('[MIDDLEWARE] Host:', request.headers.get('host'));
  
  const path = request.nextUrl.pathname;
  const { searchParams } = request.nextUrl;
  
  // Check if this is a logout redirect
  const isLogoutRedirect = searchParams.get('logout') === 'true';
  
  console.log('[MIDDLEWARE] Path:', path, 'IsLogout:', isLogoutRedirect);
  
  // Define public paths that don't require authentication
  const publicPaths = [
    "/", 
    "/about",
    "/services", 
    "/contact",
    "/pharmacy-info",
    "/legal/privacy",
    "/legal/terms",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/test-login"
  ];
  
  // Check if the path is public or an API/asset route
  const isPublicPath = publicPaths.includes(path) || 
                       path.startsWith("/api/") || 
                       path.startsWith("/_next") || 
                       path.startsWith("/public") ||
                       path.startsWith("/images") ||
                       path.startsWith("/assets") ||
                       path.includes(".");
  
  // Get the token from cookies
  const token = request.cookies.get("pharmacy_auth")?.value;
  
  console.log('[MIDDLEWARE] Path:', path, 'IsPublic:', isPublicPath, 'HasToken:', !!token, 'IsLogout:', isLogoutRedirect);
  
  // If this is a logout redirect to login page, allow it and clear cookies
  if (isLogoutRedirect && path === "/auth/login") {
    console.log('[MIDDLEWARE] Logout redirect - allowing access to login');
    const response = NextResponse.next();
    response.cookies.delete("pharmacy_auth");
    return response;
  }
  
  // If the path is public, allow access
  if (isPublicPath) {
    console.log('[MIDDLEWARE] Public path - allowing access');
    return NextResponse.next();
  }
  
  // PROTECTED ROUTE LOGIC - This is the critical part
  console.log('[MIDDLEWARE] Processing protected route:', path);
  
  // If no token for protected route, redirect to login
  if (!token) {
    console.log('[MIDDLEWARE] No token for protected route - redirecting to login');
    const loginUrl = new URL("/auth/login", request.url);
    console.log('[MIDDLEWARE] Redirect URL:', loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }
  
  // If user has token and tries to access auth pages (except logout), redirect to dashboard
  if (token && path.startsWith("/auth/") && !isLogoutRedirect) {
    console.log('[MIDDLEWARE] Authenticated user accessing auth page - redirecting to dashboard');
    const dashboardUrl = new URL("/dashboard", request.url);
    console.log('[MIDDLEWARE] Dashboard redirect URL:', dashboardUrl.toString());
    return NextResponse.redirect(dashboardUrl);
  }
  
  console.log('[MIDDLEWARE] Allowing access to protected route with token');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     * - images (image assets)
     * - assets (asset files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|images|assets|robots.txt|sitemap.xml).*)",
  ],
};
