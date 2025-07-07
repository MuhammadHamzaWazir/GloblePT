'use client';

import Sidebar from "./sidebar";
import AuthGuard from '@/components/AuthGuard';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
        <Sidebar />
        <main className="flex-1 p-8 text-black">{children}</main>
      </div>
    </AuthGuard>
  );
}