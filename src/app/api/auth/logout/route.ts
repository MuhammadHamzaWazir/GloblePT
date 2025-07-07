import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    console.log("Starting logout process - clearing ALL cookies...");
    
    // Create response with redirect to login
    const response = NextResponse.json({ 
      message: "Logged out successfully",
      success: true,
      redirectTo: "/auth/login"
    });

    // List of all possible cookies that might be set by the application
    const cookiesToClear = [
      "pharmacy_auth",
      "token", 
      "session",
      "auth_token",
      "user_session",
      "remember_token",
      "csrf_token",
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token"
    ];

    // Common cookie deletion options with proper TypeScript types
    const deletionStrategies = [
      // Strategy 1: Basic deletion (no domain, no path)
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax" as const,
        maxAge: 0,
        expires: new Date(0)
      },
      // Strategy 2: With explicit path
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax" as const,
        path: "/",
        maxAge: 0,
        expires: new Date(0)
      }
    ];

    // Production-specific strategies with domain variations
    const productionStrategies = process.env.NODE_ENV === 'production' ? [
      // Strategy 3: With .globalpharmatrading.co.uk domain
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        path: "/",
        domain: ".globalpharmatrading.co.uk",
        maxAge: 0,
        expires: new Date(0)
      },
      // Strategy 4: With exact domain globalpharmatrading.co.uk
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        path: "/",
        domain: "globalpharmatrading.co.uk",
        maxAge: 0,
        expires: new Date(0)
      }
    ] : [];

    // Combine all strategies
    const allStrategies = [...deletionStrategies, ...productionStrategies];

    // Clear all cookies with all strategies
    for (const cookieName of cookiesToClear) {
      for (const strategy of allStrategies) {
        try {
          response.cookies.set(cookieName, "", strategy);
        } catch (error) {
          console.warn(`Failed to clear cookie ${cookieName} with strategy:`, error);
        }
      }
    }

    // Also try non-httpOnly deletion for client-side cookies
    const clientSideOptions: Array<{path?: string; domain?: string; maxAge: number; expires: Date}> = [
      { path: "/", maxAge: 0, expires: new Date(0) },
    ];

    if (process.env.NODE_ENV === 'production') {
      clientSideOptions.push(
        { path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) },
        { path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) }
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
    
    console.log(`Successfully cleared ${cookiesToClear.length} cookies with ${allStrategies.length + clientSideOptions.length} strategies each`);
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ 
      message: "Logout failed",
      success: false 
    }, { status: 500 });
  }
}
