'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { deleteCookie, nukeAllCookies } from './cookie';

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
      console.log('🔥🔥🔥 NUCLEAR LOGOUT PROCESS STARTED 🔥🔥🔥');
      const timestamp = new Date().toISOString();
      console.log(`🔥 [${timestamp}] NUCLEAR LOGOUT: Starting most aggressive cookie deletion...`);
      
      // Clear local state first to prevent any UI issues
      setUser(null);
      console.log(`🔥 [${timestamp}] User state cleared`);
      
      // NUCLEAR STEP 1: NUKE ALL COOKIES BEFORE API CALL
      console.log(`🔥 [${timestamp}] INITIATING NUCLEAR COOKIE DELETION...`);
      
      if (typeof window !== 'undefined') {
        // Get all cookies before deletion for debugging
        const allCookiesBefore = document.cookie;
        console.log(`🔥 [${timestamp}] All cookies before NUCLEAR deletion:`, allCookiesBefore);
        
        // NUCLEAR APPROACH: Use the nuclear function
        nukeAllCookies();
        
        // ADDITIONAL BRUTE FORCE: Try to delete EVERY possible cookie combination
        const possibleCookieNames = [
          'pharmacy_auth', 'token', 'session', 'auth_token', 'user_session', 
          'remember_token', 'csrf_token', 'user', 'user_id', 'userid', 
          'user_token', 'access_token', 'refresh_token', 'jwt', 'jwt_token',
          'bearer_token', 'api_token', 'login_token', 'auth', 'authentication',
          'pharmacy_session', 'pharmacy_user', 'pharmacy_token', 'global_pharma_auth',
          'globalpharma_auth', 'pharmacy_remember', 'user_preferences',
          '__Secure-pharmacy_auth', '__Host-pharmacy_auth'
        ];
        
        // Also try to extract any existing cookie names
        const existingCookies = document.cookie.split(';').map(cookie => {
          const eqPos = cookie.indexOf('=');
          return eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        }).filter(name => name.length > 0);
        
        const allCookieNames = [...new Set([...possibleCookieNames, ...existingCookies])];
        console.log(`🔥 [${timestamp}] TARGETING ${allCookieNames.length} cookies for NUCLEAR deletion:`, allCookieNames);
        
        // NUCLEAR DELETE EACH COOKIE
        allCookieNames.forEach((cookieName, index) => {
          console.log(`🔥 [${timestamp}] NUCLEAR deletion ${index + 1}/${allCookieNames.length}: ${cookieName}`);
          deleteCookie(cookieName);
        });
        
        // ADDITIONAL NUCLEAR APPROACH: Raw document.cookie manipulation
        const domain = window.location.hostname;
        const nuclearDeletionAttempts = [];
        
        for (const cookieName of allCookieNames) {
          // Every possible combination for maximum destruction
          const deletionCombos = [
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; max-age=0`,
            `${cookieName}=; expires=Wed, 31 Dec 1969 23:59:59 GMT; path=/; max-age=-1`,
            `${cookieName}=DELETED; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; max-age=0`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}; max-age=0`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain}; max-age=0`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; max-age=0`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; httponly; max-age=0`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; httponly; max-age=0`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax; max-age=0`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=strict; max-age=0`,
            `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=none; secure; max-age=0`
          ];
          
          if (domain.includes('globalpharmatrading.co.uk')) {
            deletionCombos.push(
              `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=globalpharmatrading.co.uk; max-age=0`,
              `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.globalpharmatrading.co.uk; max-age=0`,
              `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=www.globalpharmatrading.co.uk; max-age=0`,
              `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=globalpharmatrading.co.uk; secure; max-age=0`,
              `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.globalpharmatrading.co.uk; secure; max-age=0`
            );
          }
          
          nuclearDeletionAttempts.push(...deletionCombos);
        }
        
        console.log(`🔥 [${timestamp}] Executing ${nuclearDeletionAttempts.length} NUCLEAR deletion attempts...`);
        
        // Execute all nuclear deletion attempts
        nuclearDeletionAttempts.forEach((attempt, index) => {
          try {
            document.cookie = attempt;
          } catch (e) {
            // Continue with other attempts
          }
        });
        
        // Clear ALL storage
        try {
          // Clear localStorage
          const localStorageKeys = Object.keys(localStorage);
          localStorageKeys.forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              // Continue
            }
          });
          
          // Clear sessionStorage
          const sessionStorageKeys = Object.keys(sessionStorage);
          sessionStorageKeys.forEach(key => {
            try {
              sessionStorage.removeItem(key);
            } catch (e) {
              // Continue
            }
          });
          
          console.log(`🔥 [${timestamp}] NUCLEAR storage clearing complete`);
        } catch (e) {
          console.log(`🔥 [${timestamp}] Storage nuclear cleanup failed:`, e);
        }
        
        // Verify nuclear deletion
        setTimeout(() => {
          const allCookiesAfter = document.cookie;
          console.log(`🔥 [${timestamp}] Cookies after NUCLEAR deletion:`, allCookiesAfter || 'NO COOKIES REMAINING');
          const pharmaCookieRemaining = allCookiesAfter.includes('pharmacy_auth');
          console.log(`🔥 [${timestamp}] pharmacy_auth survival status:`, pharmaCookieRemaining ? '💀 SURVIVED NUCLEAR ATTACK' : '✅ COMPLETELY DESTROYED');
        }, 100);
      }
      
      // NUCLEAR STEP 2: Call logout API to clear server-side httpOnly cookies
      console.log(`🔥 [${timestamp}] Calling NUCLEAR logout API...`);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`🔥 [${timestamp}] NUCLEAR logout API response:`, data);
      } else {
        console.warn(`🔥 [${timestamp}] NUCLEAR logout API failed with status:`, response.status);
      }
      
      // NUCLEAR STEP 3: Final cleanup and redirect
      console.log(`🔥 [${timestamp}] Performing NUCLEAR final cleanup...`);
      
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
