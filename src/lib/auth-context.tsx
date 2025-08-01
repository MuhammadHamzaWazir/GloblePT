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
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(false);

  useEffect(() => {
    // Check if user is authenticated by calling the auth/me endpoint
    const checkAuth = async () => {
      const now = Date.now();
      
      // Prevent excessive calls - only check once every 30 seconds
      if (now - lastCheckTime < 30000) {
        setIsLoading(false);
        return;
      }
      
      // Prevent concurrent auth checks
      if (authCheckInProgress) {
        return;
      }
      
      setAuthCheckInProgress(true);
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
        // Silently handle auth check failures - this is expected when not logged in
        setUser(null);
      } finally {
        setIsLoading(false);
        setAuthCheckInProgress(false);
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
      setIsLoggingOut(true);
      console.log('� Starting logout process...');
      
      // Clear local state immediately for responsive UI
      setUser(null);
      
      // Call logout API to clear server-side cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('✅ Logout API successful');
      } else {
        console.warn('⚠️ Logout API failed, continuing with client cleanup');
      }
      
      // Simple client-side cleanup
      if (typeof window !== 'undefined') {
        // Clear the main auth cookie
        document.cookie = 'pharmacy_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0';
        
        // Clear relevant storage items
        try {
          localStorage.removeItem('user');
          localStorage.removeItem('auth');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('auth');
        } catch (e) {
          // Continue if storage clearing fails
        }
      }
      
      console.log('✅ Logout complete, redirecting...');
      
      // Quick redirect
      window.location.replace('/auth/login?logout=true');
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Emergency cleanup
      setUser(null);
      
      if (typeof window !== 'undefined') {
        document.cookie = 'pharmacy_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0';
        window.location.replace('/auth/login?logout=emergency');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggingOut, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
