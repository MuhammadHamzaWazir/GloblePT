import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check all possible JWT-related environment variables
    const envCheck = {
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_length: process.env.JWT_SECRET?.length || 0,
      JWT_SECRET_first4: process.env.JWT_SECRET?.substring(0, 4) || 'none',
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      SECRET_KEY: !!process.env.SECRET_KEY,
      NEXT_PUBLIC_JWT_SECRET: !!process.env.NEXT_PUBLIC_JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      timestamp: new Date().toISOString()
    };

    console.log('Production environment check:', envCheck);

    return NextResponse.json({
      status: 'Environment Debug',
      envCheck,
      message: 'Environment variables checked successfully'
    });

  } catch (error) {
    console.error('Environment debug error:', error);
    return NextResponse.json({
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
