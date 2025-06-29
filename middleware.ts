import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./src/lib/auth";
import { getDashboardRoute } from "./src/lib/utils";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = [
    "/", 
    "/admin-hide-like",
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
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith("/api/auth") || 
    path.startsWith("/api/seed-production") ||
    path.startsWith("/api/setup-production") ||
    path.startsWith("/api/contact") ||
    path.startsWith("/_next") || 
    path.startsWith("/public") ||
    path.startsWith("/images") ||
    path.startsWith("/assets")
  );
  
  // Get the token from cookies
  const token = request.cookies.get("pharmacy_auth")?.value;
  
  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/admin-hide-like", request.url));
  }
  
  // If user is logged in, verify token and handle role-based access
  if (token) {
    const user = verifyToken(token);
    
    if (!user) {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL("/admin-hide-like", request.url));
      response.cookies.delete("pharmacy_auth");
      return response;
    }
    
    // If user tries to access auth pages while logged in, redirect to appropriate dashboard
    if (path.startsWith("/auth/") || path === "/admin-hide-like") {
      const dashboardRoute = getDashboardRoute(user.role);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
    
    // Role-based access control for dashboard routes
    const userRole = user.role.toUpperCase();
    
    // Admin access control
    if (path.startsWith("/admin/") && userRole !== "ADMIN") {
      const dashboardRoute = getDashboardRoute(user.role);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
    
    // Staff dashboard access control
    if (path.startsWith("/staff-dashboard") && !["ADMIN", "STAFF"].includes(userRole)) {
      const dashboardRoute = getDashboardRoute(user.role);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
    
    // Assistant portal access control
    if (path.startsWith("/assistant-portal") && !["ADMIN", "ASSISTANT"].includes(userRole)) {
      const dashboardRoute = getDashboardRoute(user.role);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
    
    // Customer dashboard - accessible by all authenticated users as fallback
    // No additional restrictions needed
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/seed-production (database seeding)
     * - api/setup-production (database setup)
     * - api/auth (authentication)
     * - api/contact (contact form)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/seed-production|api/setup-production|api/auth|api/contact|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
