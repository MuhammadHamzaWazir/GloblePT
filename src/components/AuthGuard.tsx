// Route Protection Component
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getDashboardRoute } from '@/lib/utils';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (isLoading) {
      return;
    }

    setAuthCheckComplete(true);

    // Handle authenticated user on auth pages
    if (user && window.location.pathname.startsWith('/auth/')) {
      const dashboardRoute = getDashboardRoute(user.role);
      router.push(dashboardRoute);
      return;
    }

    // Handle unauthenticated user on protected pages  
    if (!user && requireAuth) {
      router.push(redirectTo);
      return;
    }

  }, [user, isLoading, requireAuth, redirectTo, router]);

  // Show loading while auth context is loading
  if (isLoading || !authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // For non-auth pages, let the content render if auth check is complete
  if (!requireAuth || user) {
    return <>{children}</>;
  }

  // For auth-required pages without user, show loading while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
