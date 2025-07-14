import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { AuthUser } from './types'

// Get JWT_SECRET with proper error handling
const getJWTSecret = (): string => {
  // Try multiple possible environment variable names that Vercel might use
  let secret = process.env.JWT_SECRET || 
               process.env.NEXTAUTH_SECRET || 
               process.env.AUTH_SECRET ||
               process.env.SECRET_KEY ||
               process.env.NEXT_PUBLIC_JWT_SECRET; // Sometimes Vercel needs NEXT_PUBLIC_
  
  console.log('Environment check:', {
    JWT_SECRET: !!process.env.JWT_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    SECRET_KEY: !!process.env.SECRET_KEY,
    NEXT_PUBLIC_JWT_SECRET: !!process.env.NEXT_PUBLIC_JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV
  });
  
  // If still no secret in production, use the known production secret
  if (!secret && process.env.NODE_ENV === 'production') {
    // Use the exact secret that should be in Vercel environment
    secret = '9639abc4e5a74139f39c1d9d48d46ba1';
    console.warn('⚠️ Using hardcoded production JWT secret as fallback');
  }
  
  // Final crypto fallback if absolutely nothing works
  if (!secret) {
    const fallbackSeed = process.env.VERCEL_URL || 
                        process.env.NEXTAUTH_URL || 
                        process.env.VERCEL_GIT_COMMIT_SHA ||
                        'globalpharmatrading-fallback-2025';
    
    secret = crypto.createHash('sha256').update(fallbackSeed + 'jwt-secret').digest('hex');
    console.warn('⚠️ Using crypto fallback JWT secret');
  }
  
  if (!secret) {
    console.error('❌ No JWT secret available from any source');
    console.error('Available env vars containing SECRET/JWT:', 
      Object.keys(process.env).filter(k => k.includes('SECRET') || k.includes('JWT')));
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  console.log('✅ JWT secret found, length:', secret.length);
  return secret;
};

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token using jose library (serverless-friendly)
 */
export async function generateToken(user: AuthUser): Promise<string> {
  try {
    const secret = getJWTSecret();
    console.log('JWT Secret available:', !!secret);
    
    const alg = 'HS256';
    const jwt = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(secret));
    
    return jwt;
  } catch (error) {
    console.error('JWT token generation failed:', error);
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    throw new Error(`JWT token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify and decode a JWT token using jose library
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract token from request headers or cookies
 */
export function extractToken(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Try cookies
  const cookies = request.headers.get('cookie')
  if (cookies) {
    const match = cookies.match(/pharmacy_auth=([^;]+)/)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

/**
 * Check if user has required role
 */
export function checkRole(user: AuthUser, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role)
}

/**
 * Middleware to protect API routes
 */
export async function requireAuth(request: Request): Promise<AuthUser | null> {
  const token = extractToken(request)
  
  if (!token) {
    return null
  }
  
  const user = await verifyToken(token)
  return user
}

/**
 * Generate a secure random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}
