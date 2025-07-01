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

const links = [
  { href: "/dashboard", label: "Dashboard", icon: FaHome },
  { href: "/dashboard/profile", label: "My Profile", icon: FaUser },
  { href: "/dashboard/complaints", label: "Complaints", icon: FaExclamationCircle },
];

export default function Sidebar() {
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
        className="flex items-center gap-3 px-4 py-3 rounded-md text-green-100 hover:bg-green-700 transition-all duration-200 w-full text-left"
      >
        <FaSignOutAlt className="w-5 h-5 text-green-300" />
        <span>Logout</span>
      </button>
    </aside>
  );
}