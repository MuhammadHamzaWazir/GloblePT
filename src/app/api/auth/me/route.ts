import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Simple in-memory rate limiter (in production, consider Redis)
const requestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 60; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `auth_me_${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key) || { count: 0, lastReset: now };
  
  // Reset count if window has passed
  if (now - record.lastReset > RATE_WINDOW) {
    record.count = 0;
    record.lastReset = now;
  }
  
  record.count++;
  requestCounts.set(key, record);
  
  return record.count > RATE_LIMIT;
}

export async function GET(request: Request) {
  try {
    // Check rate limit
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      // Silently handle rate limiting without console warning to reduce noise
      return NextResponse.json({ 
        authenticated: false,
        message: "Too many requests",
        retryAfter: Math.ceil(RATE_WINDOW / 1000)
      }, { status: 429 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("pharmacy_auth")?.value;

    if (!token) {
      return NextResponse.json({ 
        authenticated: false,
        message: "No authentication token found" 
      }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ 
        authenticated: false,
        message: "Invalid authentication token" 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Authentication check error:", error);
    return NextResponse.json({ 
      authenticated: false,
      message: "Internal server error" 
    }, { status: 500 });
  }
}
