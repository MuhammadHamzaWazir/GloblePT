import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get environment information
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      
      // Check for various JWT/auth related env vars
      jwtSecret: !!process.env.JWT_SECRET,
      nextauthSecret: !!process.env.NEXTAUTH_SECRET,
      authSecret: !!process.env.AUTH_SECRET,
      secretKey: !!process.env.SECRET_KEY,
      
      // List all env vars that contain 'SECRET' or 'JWT' (without values for security)
      secretEnvVars: Object.keys(process.env).filter(key => 
        key.includes('SECRET') || key.includes('JWT') || key.includes('AUTH')
      ),
      
      // Get lengths for debugging (without exposing values)
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      nextauthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      
      // Total env vars count
      totalEnvVars: Object.keys(process.env).length
    };
    
    console.log('Environment diagnostic:', envInfo);
    
    return NextResponse.json(envInfo);
    
  } catch (error) {
    console.error('Environment diagnostic error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
