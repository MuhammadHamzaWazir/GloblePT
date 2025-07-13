"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { 
  FaHome, 
  FaUsers, 
  FaExclamationCircle, 
  FaPrescriptionBottleAlt,
  FaUser,
  FaIdCard,
  FaSignOutAlt,
  FaUserClock,
  FaInbox
} from "react-icons/fa";
import { useAuth } from '@/lib/auth-context';

// Define the navigation links with icons
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FaHome },
  { href: "/admin/dashboard/inbox", label: "Inbox", icon: FaInbox },
  { href: "/admin/dashboard/profile", label: "My Profile", icon: FaUser },
  { href: "/admin/dashboard/users", label: "Users", icon: FaUsers },
  { href: "/admin/dashboard/pending-users", label: "Pending Approvals", icon: FaUserClock },
  { href: "/admin/dashboard/prescriptions", label: "Prescriptions", icon: FaPrescriptionBottleAlt },
  { href: "/admin/dashboard/identity-verification", label: "Identity Verification", icon: FaIdCard },
  { href: "/admin/dashboard/complaints", label: "Complaints", icon: FaExclamationCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Redirect anyway to clear any cached state
      window.location.replace('/auth/login?logout=true');
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-green-800 text-white flex flex-col py-6 px-4 shadow-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center tracking-wide">Global Pharma</h1>
        <p className="text-center text-green-200 text-sm mt-1">Admin Dashboard</p>
      </div>
      
      <div className="h-px bg-green-700 my-4"></div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
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
        disabled={isLoggingOut}
        className="flex items-center gap-3 px-4 py-3 rounded-md text-green-100 hover:bg-green-700 transition-all duration-200 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? (
          <>
            <svg className="animate-spin h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Logging out...</span>
          </>
        ) : (
          <>
            <FaSignOutAlt className="w-5 h-5 text-green-300" />
            <span>Logout</span>
          </>
        )}
      </button>
    </aside>
  );
}