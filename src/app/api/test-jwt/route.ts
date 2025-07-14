import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== JWT DEBUG ENDPOINT ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length || 0);
    
    // Test if we can import the auth functions
    try {
      const { generateToken } = await import("@/lib/auth");
      console.log("Auth module imported successfully");
      
      // Test token generation
      const testUser = {
        id: "1",
        email: "test@test.com",
        name: "Test User",
        role: "customer" as const
      };
      
      const token = generateToken(testUser);
      console.log("Token generated successfully, length:", token.length);
      
      return NextResponse.json({
        success: true,
        jwtSecretExists: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        tokenGenerated: true,
        tokenLength: token.length
      });
      
    } catch (authError) {
      console.error("Auth module error:", authError);
      return NextResponse.json({
        success: false,
        jwtSecretExists: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        authError: authError instanceof Error ? authError.message : "Unknown auth error"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
