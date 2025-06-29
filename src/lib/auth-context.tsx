'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setCookie, deleteCookie, getCookie } from './cookie';

export type UserRole = 'admin' | 'staff' | 'customer' | 'assistant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // On mount, try to load user from cookie
    if (!user) {
      const cookie = getCookie('pharmacy_auth');
      if (cookie) {
        try {
          const parsed = JSON.parse(cookie);
          setUser(parsed);
        } catch {}
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
  // Call the real API endpoint
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // Optionally, you can fetch user info from the response if your API returns it
  // Here, we just set the user with minimal info
  const userObj: User = {
    id: data.id || '',
    name: data.name || email,
    email,
    role: data.role || 'customer',
  };
  setUser(userObj);
  setCookie('pharmacy_auth', JSON.stringify(userObj));
  }

  const logout = () => {
    setUser(null);
    deleteCookie('pharmacy_auth');
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
