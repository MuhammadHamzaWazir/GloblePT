import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("� Processing logout request...");
    
    // Create response
    const response = NextResponse.json({ 
      message: "Logged out successfully",
      success: true
    });

    // Clear the main authentication cookie
    response.cookies.set('pharmacy_auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0)
    });

    // Clear any additional auth-related cookies
    const authCookies = ['token', 'session', 'auth_token', 'user_session'];
    
    authCookies.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
        expires: new Date(0)
      });
    });
    
    console.log("✅ Logout successful");
    return response;
    
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ 
      message: "Logout failed",
      success: false 
    }, { status: 500 });
  }
}
