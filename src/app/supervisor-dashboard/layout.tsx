'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaPrescriptionBottleAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaExclamationCircle,
  FaUser,
  FaCheckCircle
} from "react-icons/fa";
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/lib/auth-context';

// Define the navigation links with icons
const navItems = [
  { href: "/supervisor-dashboard", label: "Dashboard", icon: FaHome },
  { href: "/supervisor-dashboard/profile", label: "My Profile", icon: FaUser },
  { href: "/supervisor-dashboard/prescriptions", label: "Prescriptions", icon: FaPrescriptionBottleAlt },
  { href: "/supervisor-dashboard/approvals", label: "Prescription Approvals", icon: FaCheckCircle },
  { href: "/supervisor-dashboard/complaints", label: "Complaints", icon: FaExclamationCircle },
];

interface SupervisorSidebarProps {
  children: React.ReactNode;
}

export default function SupervisorSidebar({ children }: SupervisorSidebarProps) {
  return (
    <AuthGuard requireAuth={true}>
      <SupervisorSidebarContent children={children} />
    </AuthGuard>
  );
}

function SupervisorSidebarContent({ children }: SupervisorSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect anyway
      window.location.href = '/auth/login';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-md shadow-lg"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-16 bg-purple-600 text-white">
            <h1 className="text-xl font-bold">Supervisor Portal</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive 
                      ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <svg className="animate-spin mr-3 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="truncate">Logging out...</span>
                </>
              ) : (
                <>
                  <FaSignOutAlt className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="ml-12">
              <h2 className="text-lg font-semibold text-gray-800">Supervisor Dashboard</h2>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
