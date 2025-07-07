import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    console.log("Starting logout process...");
    
    // Create response with redirect to login
    const response = NextResponse.json({ 
      message: "Logged out successfully",
      success: true,
      redirectTo: "/auth/login"
    });
    
    // Clear the authentication cookie with multiple approaches for better compatibility
    
    // Method 1: Set cookie to empty with immediate expiration
    response.cookies.set("pharmacy_auth", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
      expires: new Date(0), // Also set explicit past date
      domain: process.env.NODE_ENV === 'production' ? '.globalpharmatrading.co.uk' : undefined
    });
    
    // Method 2: Explicit delete
    response.cookies.delete("pharmacy_auth");
    
    // Method 3: Also try to clear without domain in case that's the issue
    if (process.env.NODE_ENV === 'production') {
      response.cookies.set("pharmacy_auth", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0)
      });
    }
    
    console.log("User logged out successfully - cookie cleared with multiple methods");
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ 
      message: "Logout failed",
      success: false 
    }, { status: 500 });
  }
}
