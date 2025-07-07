import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Debug page for testing cookie clearing",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;
    
    console.log("Debug action:", action);
    
    if (action === "test-logout") {
      // Create response with comprehensive cookie clearing
      const response = NextResponse.json({
        message: "Debug logout test - clearing all possible cookie variations",
        timestamp: new Date().toISOString(),
        action: "test-logout"
      });
      
      // Clear pharmacy_auth with ALL possible combinations
      const cookieClearingStrategies = [
        // Basic strategies
        { name: "pharmacy_auth", value: "", options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax" as const, maxAge: 0, expires: new Date(0) } },
        { name: "pharmacy_auth", value: "", options: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax" as const, path: "/", maxAge: 0, expires: new Date(0) } },
        
        // Production-specific strategies
        ...(process.env.NODE_ENV === 'production' ? [
          { name: "pharmacy_auth", value: "", options: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", domain: ".globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) } },
          { name: "pharmacy_auth", value: "", options: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", domain: "globalpharmatrading.co.uk", maxAge: 0, expires: new Date(0) } },
          { name: "pharmacy_auth", value: "", options: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 0, expires: new Date(0) } }
        ] : [])
      ];
      
      cookieClearingStrategies.forEach((strategy, index) => {
        response.cookies.set(strategy.name, strategy.value, strategy.options);
        console.log(`Applied cookie clearing strategy ${index + 1}:`, strategy);
      });
      
      return response;
    }
    
    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
    
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({ message: "Debug endpoint error", error: String(error) }, { status: 500 });
  }
}
