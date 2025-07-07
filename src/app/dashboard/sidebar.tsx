"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaHome, 
  FaPrescriptionBottleAlt,
  FaUser,
  FaExclamationCircle,
  FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from '@/lib/auth-context';

const links = [
  { href: "/dashboard", label: "Dashboard", icon: FaHome },
  { href: "/dashboard/profile", label: "My Profile", icon: FaUser },
  { href: "/dashboard/complaints", label: "Complaints", icon: FaExclamationCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('=== SIDEBAR LOGOUT CLICKED ===');
      console.log('Current URL:', window.location.href);
      console.log('Current cookies before logout:', document.cookie);
      
      // Show immediate feedback to user
      const button = document.querySelector('button[data-logout]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span>Logging out...</span>';
      }
      
      await logout();
    } catch (error) {
      console.error('Sidebar logout failed:', error);
      
      // Reset button state
      const button = document.querySelector('button[data-logout]') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.innerHTML = '<span>Logout</span>';
      }
      
      // Force redirect anyway to clear any cached state
      console.log('Force redirecting due to logout error...');
      window.location.replace('/auth/login?logout=error&t=' + Date.now());
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-green-800 text-white flex flex-col py-6 px-4 shadow-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center tracking-wide">Global Pharma</h1>
        <p className="text-center text-green-200 text-sm mt-1">Customer Portal</p>
      </div>
      
      <div className="h-px bg-green-700 my-4"></div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-green-600 text-white font-medium"
                      : "text-green-100 hover:bg-green-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-green-300"}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="h-px bg-green-700 my-4"></div>
      
      <button
        onClick={handleLogout}
        data-logout="true"
        className="flex items-center gap-3 px-4 py-3 rounded-md text-green-100 hover:bg-green-700 transition-all duration-200 w-full text-left"
      >
        <FaSignOutAlt className="w-5 h-5 text-green-300" />
        <span>Logout</span>
      </button>
    </aside>
  );
}