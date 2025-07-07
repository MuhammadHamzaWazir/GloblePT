'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { deleteCookie } from './cookie';

export type UserRole = 'admin' | 'staff' | 'assistant' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  useEffect(() => {
    // Check if user is authenticated by calling the auth/me endpoint
    const checkAuth = async () => {
      const now = Date.now();
      
      // Prevent excessive calls - only check once every 5 seconds
      if (now - lastCheckTime < 5000) {
        setIsLoading(false);
        return;
      }
      
      setLastCheckTime(now);
      
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser({
              id: data.user.id?.toString() || '',
              name: data.user.name || '',
              email: data.user.email || '',
              role: (data.user.role?.toLowerCase() || 'customer') as UserRole,
            });
          } else {
            setUser(null);
          }
        } else {
          // Only log errors that aren't 401 (expected when not authenticated)
          if (res.status !== 401) {
            console.warn('Auth check failed with status:', res.status);
          }
          setUser(null);
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        // User not authenticated, which is fine
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("=== CLIENT LOGIN DEBUG ===");
      console.log("Attempting login with:", { email, password: "***" });
      
      // Call the real API endpoint
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", res.status);
      console.log("Login response ok:", res.ok);

      // Check if response is ok
      if (!res.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await res.json();
          console.log("Error response data:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use default message
          errorMessage = `Login failed with status ${res.status}`;
        }
        throw new Error(errorMessage);
      }

      // Parse the response
      const data = await res.json();
      console.log("Login success response:", data);

      // Extract user data from the response
      const userData = data.user || data;
      
      const userObj: User = {
        id: userData.id?.toString() || '',
        name: userData.name || email,
        email: userData.email || email,
        role: (userData.role?.toLowerCase() || 'customer') as UserRole,
      };

      console.log("Setting user object:", userObj);
      setUser(userObj);
      // Don't store in cookie as the JWT is already stored as httpOnly cookie
      // setCookie('pharmacy_auth', JSON.stringify(userObj));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  const logout = async () => {
    try {
      console.log('=== LOGOUT PROCESS STARTED ===');
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Starting comprehensive logout process...`);
      
      // Clear local state first to prevent any UI issues
      setUser(null);
      console.log(`[${timestamp}] User state cleared`);
      
      // STEP 1: Aggressive client-side cookie deletion BEFORE API call
      console.log(`[${timestamp}] Starting aggressive cookie deletion...`);
      
      if (typeof window !== 'undefined') {
        // Get all cookies before deletion for debugging
        const allCookiesBefore = document.cookie;
        console.log(`[${timestamp}] All cookies before deletion:`, allCookiesBefore);
        
        // ENHANCED: Clear ALL cookies from the domain, not just pharmacy-related ones
        const allCookies = document.cookie.split(';');
        const cookieNames = allCookies.map(cookie => {
          const eqPos = cookie.indexOf('=');
          return eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        }).filter(name => name.length > 0);
        
        console.log(`[${timestamp}] Found ${cookieNames.length} cookies to clear:`, cookieNames);
        
        // Clear each cookie with multiple deletion strategies
        cookieNames.forEach(cookieName => {
          // Use the enhanced deleteCookie function
          deleteCookie(cookieName);
          
          // Additional brute force deletion for each cookie
          const domain = window.location.hostname;
          const deletionAttempts = [
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`,
            `${cookieName}=; max-age=0; path=/;`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain};`,
            `${cookieName}=; max-age=0; path=/; domain=${domain};`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain};`,
            `${cookieName}=; max-age=0; path=/; domain=.${domain};`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure;`,
            `${cookieName}=; max-age=0; path=/; secure;`
          ];
          
          deletionAttempts.forEach((cookieString, index) => {
            try {
              document.cookie = cookieString;
            } catch (e) {
              console.warn(`Failed deletion attempt ${index + 1} for ${cookieName}:`, e);
            }
          });
          
          console.log(`[${timestamp}] Applied ${deletionAttempts.length} deletion methods for: ${cookieName}`);
        });
        
        // Clear localStorage and sessionStorage
        try {
          localStorage.removeItem('pharmacy_auth');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          sessionStorage.removeItem('pharmacy_auth');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          console.log(`[${timestamp}] Local/session storage cleared`);
        } catch (e) {
          console.log(`[${timestamp}] Storage cleanup failed:`, e);
        }
        
        // Wait a moment and verify cookie deletion
        setTimeout(() => {
          const allCookiesAfter = document.cookie;
          console.log(`[${timestamp}] All cookies after deletion:`, allCookiesAfter);
          const pharmaCookieRemaining = allCookiesAfter.includes('pharmacy_auth');
          console.log(`[${timestamp}] pharmacy_auth still present:`, pharmaCookieRemaining ? 'YES - FAILED' : 'NO - SUCCESS');
        }, 50);
      }
      
      // STEP 2: Call logout API to clear the httpOnly cookie
      console.log(`[${timestamp}] Calling logout API...`);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[${timestamp}] Logout API response:`, data);
      } else {
        console.warn(`[${timestamp}] Logout API failed with status:`, response.status);
      }
      
      // STEP 3: Final cleanup and redirect
      console.log(`[${timestamp}] Performing final cleanup...`);
      
      // Additional delay to ensure all operations complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Force redirect to login page with logout parameter and cache busting
      const redirectUrl = `/auth/login?logout=true&t=${Date.now()}`;
      console.log(`[${timestamp}] Redirecting to:`, redirectUrl);
      window.location.replace(redirectUrl);
      
    } catch (error) {
      console.error('=== LOGOUT PROCESS FAILED ===');
      console.error('Logout process failed:', error);
      
      // EMERGENCY CLEANUP - even if API call fails, clear everything
      setUser(null);
      
      if (typeof window !== 'undefined') {
        // Nuclear option - clear everything
        try {
          localStorage.clear();
          sessionStorage.clear();
          
          // Brute force delete all cookies
          const cookies = document.cookie.split(';');
          cookies.forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
              document.cookie = `${name}=; max-age=0; path=/;`;
            }
          });
          
          console.log('Emergency cleanup completed');
        } catch (e) {
          console.log('Emergency storage clear failed:', e);
        }
      }
      
      // Force redirect even if everything fails
      window.location.replace(`/auth/login?logout=emergency&t=${Date.now()}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
