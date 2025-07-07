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
  FaPoundSign
} from "react-icons/fa";
import AuthGuard from '@/components/AuthGuard';

// Define the navigation links with icons
const navItems = [
  { href: "/staff-dashboard", label: "Dashboard", icon: FaHome },
  { href: "/staff-dashboard/profile", label: "My Profile", icon: FaUser },
  { href: "/staff-dashboard/prescriptions", label: "Prescriptions", icon: FaPrescriptionBottleAlt },
  { href: "/staff-dashboard/pricing", label: "Pricing Management", icon: FaPoundSign },
  { href: "/staff-dashboard/complaints", label: "Complaints", icon: FaExclamationCircle },
];

interface StaffSidebarProps {
  children: React.ReactNode;
}

export default function StaffSidebar({ children }: StaffSidebarProps) {
  return (
    <AuthGuard requireAuth={true}>
      <StaffSidebarContent children={children} />
    </AuthGuard>
  );
}

function StaffSidebarContent({ children }: StaffSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-blue-600 text-white rounded-md shadow-lg transition-colors hover:bg-blue-700"
          aria-label="Toggle navigation"
        >
          {isOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
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
          <div className="flex items-center justify-center h-16 bg-blue-600 text-white shadow-md">
            <h1 className="text-xl font-bold">Staff Portal</h1>
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
                    flex items-center px-3 py-3 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            >
              <FaSignOutAlt className="mr-3 h-5 w-5 text-gray-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top padding for mobile menu button */}
        <div className="lg:hidden h-16"></div>
        
        {/* Content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
