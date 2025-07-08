import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    console.log("🔥 NUCLEAR LOGOUT: FORCE DELETING ALL COOKIES 🔥");
    
    // Create response with redirect to login
    const response = NextResponse.json({ 
      message: "Logged out successfully",
      success: true,
      redirectTo: "/auth/login"
    });

    // NUCLEAR APPROACH: List ALL possible cookies that could exist
    const cookiesToClear = [
      // Primary auth cookies
      "pharmacy_auth",
      "token", 
      "session",
      "auth_token",
      "user_session",
      "remember_token",
      "csrf_token",
      
      // Next.js auth cookies
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token",
      
      // Additional possible cookies
      "user",
      "user_id",
      "userid",
      "user_token",
      "access_token",
      "refresh_token",
      "jwt",
      "jwt_token",
      "bearer_token",
      "api_token",
      "login_token",
      "auth",
      "authentication",
      "pharmacy_session",
      "pharmacy_user",
      "pharmacy_token",
      "global_pharma_auth",
      "globalpharma_auth",
      "pharmacy_remember",
      "user_preferences",
      "cart",
      "shopping_cart",
      "temp_user",
      "guest_user",
      "visitor_id",
      
      // Framework and library cookies
      "connect.sid",
      "express:sess",
      "session_id",
      "sessionId",
      "JSESSIONID",
      "PHPSESSID",
      "ASP.NET_SessionId",
      "laravel_session",
      
      // Security cookies
      "X-CSRF-TOKEN",
      "XSRF-TOKEN",
      "_token",
      "_csrf",
      
      // Analytics and tracking (clear these too)
      "_ga",
      "_gid",
      "_gat",
      "_gtag",
      "_fbp",
      "_fbc",
      "GTM-",
      
      // Any cookie that starts with common prefixes
      "__Secure-",
      "__Host-"
    ];

    // NUCLEAR DELETION STRATEGIES - Every possible combination
    const nuclearStrategies = [
      // Basic strategies
      { httpOnly: true, secure: false, sameSite: "lax" as const, maxAge: 0, expires: new Date(0) },
      { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: false, sameSite: "lax" as const, maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "lax" as const, maxAge: 0, expires: new Date(0) },
      
      // With path variations
      { httpOnly: true, secure: false, sameSite: "lax" as const, path: "/", maxAge: 0, expires: new Date(0) },
      { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: false, sameSite: "lax" as const, path: "/", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "lax" as const, path: "/", maxAge: 0, expires: new Date(0) },
      
      // Different SameSite values
      { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/", maxAge: 0, expires: new Date(0) },
      { httpOnly: true, secure: true, sameSite: "none" as const, path: "/", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "strict" as const, path: "/", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "none" as const, path: "/", maxAge: 0, expires: new Date(0) },
    ];

    // PRODUCTION DOMAIN NUCLEAR STRATEGIES
    const domainStrategies = process.env.NODE_ENV === 'production' ? [
      // .globalpharmatrading.co.uk domain variations
      { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "lax" as const, path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "strict" as const, path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: true, secure: true, sameSite: "none" as const, path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "none" as const, path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      
      // globalpharmatrading.co.uk domain variations
      { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "lax" as const, path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: true, secure: true, sameSite: "strict" as const, path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "strict" as const, path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: true, secure: true, sameSite: "none" as const, path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "none" as const, path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      
      // www.globalpharmatrading.co.uk domain variations
      { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", domain: "www.globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
      { httpOnly: false, secure: true, sameSite: "lax" as const, path: "/", domain: "www.globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
    ] : [];

    // COMBINE ALL NUCLEAR STRATEGIES
    const allNuclearStrategies = [...nuclearStrategies, ...domainStrategies];

    // NUCLEAR COOKIE DELETION: Try every possible combination
    console.log(`🔥 Starting NUCLEAR deletion of ${cookiesToClear.length} cookies with ${allNuclearStrategies.length} strategies each`);
    
    for (const cookieName of cookiesToClear) {
      for (const strategy of allNuclearStrategies) {
        try {
          response.cookies.set(cookieName, "", strategy);
        } catch (error) {
          // Ignore errors, keep trying other strategies
          console.warn(`Failed to clear cookie ${cookieName} with strategy:`, error);
        }
      }
    }

    // ADDITIONAL NUCLEAR APPROACH: Try manual header setting
    const manualHeaders: string[] = [];
    
    for (const cookieName of cookiesToClear) {
      // Basic deletions
      manualHeaders.push(`${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`);
      manualHeaders.push(`${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly`);
      manualHeaders.push(`${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure`);
      manualHeaders.push(`${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure`);
      
      // Production domain deletions
      if (process.env.NODE_ENV === 'production') {
        manualHeaders.push(`${cookieName}=; Path=/; Domain=.globalpharmatrading.co.uk; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`);
        manualHeaders.push(`${cookieName}=; Path=/; Domain=globalpharmatrading.co.uk; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`);
        manualHeaders.push(`${cookieName}=; Path=/; Domain=.globalpharmatrading.co.uk; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure`);
        manualHeaders.push(`${cookieName}=; Path=/; Domain=globalpharmatrading.co.uk; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; Secure`);
      }
    }
    
    // Set manual headers (try multiple approaches)
    for (const headerValue of manualHeaders) {
      try {
        response.headers.append('Set-Cookie', headerValue);
      } catch (error) {
        // Continue with other headers
      }
    }

    // Also try non-httpOnly deletion for client-side cookies
    const clientSideOptions: Array<{path?: string; domain?: string; maxAge: number; expires: Date}> = [
      { path: "/", maxAge: 0, expires: new Date(0) },
      { maxAge: 0, expires: new Date(0) },
    ];

    if (process.env.NODE_ENV === 'production') {
      clientSideOptions.push(
        { path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
        { path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
        { domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
        { domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) }
      );
    }

    for (const cookieName of cookiesToClear) {
      for (const options of clientSideOptions) {
        try {
          response.cookies.set(cookieName, "", options);
        } catch (error) {
          console.warn(`Failed to clear client-side cookie ${cookieName}:`, error);
        }
      }
    }
    
    console.log(`🔥 NUCLEAR DELETION COMPLETE: Attempted ${cookiesToClear.length} cookies × ${allNuclearStrategies.length + clientSideOptions.length + manualHeaders.length} strategies = ${cookiesToClear.length * (allNuclearStrategies.length + clientSideOptions.length + manualHeaders.length)} total deletion attempts`);
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ 
      message: "Logout failed",
      success: false 
    }, { status: 500 });
  }
}
