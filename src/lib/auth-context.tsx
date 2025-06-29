'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setCookie, deleteCookie, getCookie } from './cookie';

export type UserRole = 'admin' | 'staff' | 'assistant' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is authenticated by calling a verify endpoint
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              id: data.user.id?.toString() || '',
              name: data.user.name || '',
              email: data.user.email || '',
              role: (data.user.role?.toLowerCase() || 'customer') as UserRole,
            });
          }
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        // User not authenticated, which is fine
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
        } catch (e) {
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
      // Call logout API to clear the httpOnly cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      deleteCookie('pharmacy_auth'); // Clear any non-httpOnly cookies
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
