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
      console.log('Starting logout process...');
      
      // Clear local state first to prevent any UI issues
      setUser(null);
      
      // Clear any client-side cookies aggressively
      deleteCookie('pharmacy_auth');
      
      // Call logout API to clear the httpOnly cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Logout API response:', data);
      
      // Additional client-side cleanup
      if (typeof window !== 'undefined') {
        // Clear localStorage and sessionStorage
        try {
          localStorage.removeItem('pharmacy_auth');
          localStorage.removeItem('user');
          sessionStorage.removeItem('pharmacy_auth');
          sessionStorage.removeItem('user');
        } catch (e) {
          console.log('Storage cleanup failed:', e);
        }
        
        // Force clear all cookies related to pharmacy
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('pharmacy') || name.includes('auth')) {
            deleteCookie(name);
          }
        });
      }
      
      // Add a small delay to ensure cookie is cleared
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force redirect to login page with logout parameter to bypass middleware redirect
      console.log('Redirecting to login page...');
      window.location.replace('/auth/login?logout=true');
      
    } catch (error) {
      console.error('Logout process failed:', error);
      // Even if API call fails, clear state and redirect
      setUser(null);
      deleteCookie('pharmacy_auth');
      
      // Force cleanup even if API failed
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.log('Emergency storage clear failed:', e);
        }
      }
      
      window.location.replace('/auth/login?logout=true');
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
