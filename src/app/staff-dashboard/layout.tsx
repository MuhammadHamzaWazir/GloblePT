'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaPrescriptionBottleAlt,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaExclamationCircle,
  FaUser
} from "react-icons/fa";

// Define the navigation links with icons
const navItems = [
  { href: "/staff-dashboard", label: "Dashboard", icon: FaHome },
  { href: "/staff-dashboard/profile", label: "My Profile", icon: FaUser },
  { href: "/staff-dashboard/prescriptions", label: "Prescriptions", icon: FaPrescriptionBottleAlt },
  { href: "/staff-dashboard/complaints", label: "Complaints", icon: FaExclamationCircle },
  { href: "/staff-dashboard/customers", label: "Customers", icon: FaUsers },
  { href: "/staff-dashboard/reports", label: "Reports", icon: FaChartLine },
];

interface StaffSidebarProps {
  children: React.ReactNode;
}

export default function StaffSidebar({ children }: StaffSidebarProps) {
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
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Staff Portal</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
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
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        
        {/* Content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
