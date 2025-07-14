import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { AuthUser } from './types'

// Get JWT_SECRET with proper error handling
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('❌ JWT_SECRET environment variable is not set');
    throw new Error('JWT_SECRET environment variable is required');
  }
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
 * Generate a JWT token
 */
export function generateToken(user: AuthUser): string {
  try {
    const secret = getJWTSecret();
    console.log('JWT Secret available:', !!secret);
    
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      secret,
      { expiresIn: '7d' }
    );
  } catch (error) {
    console.error('JWT token generation failed:', error);
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
    throw new Error(`JWT token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as any
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    }
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null
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
  
  const user = verifyToken(token)
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
