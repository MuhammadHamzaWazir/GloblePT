"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { 
  FaHome, 
  FaUsers, 
  FaUserFriends, 
  FaExclamationCircle, 
  FaAddressBook, 
  FaChartLine,
  FaPrescriptionBottleAlt,
  FaUser,
  FaShieldAlt,
  FaIdCard
} from "react-icons/fa";

// Define the navigation links with icons
const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: FaHome },
  { href: "/admin/dashboard/profile", label: "My Profile", icon: FaUser },
  { href: "/admin/dashboard/users", label: "Users", icon: FaUsers },
  { href: "/admin/dashboard/prescriptions", label: "Prescriptions", icon: FaPrescriptionBottleAlt },
  { href: "/admin/dashboard/identity-verification", label: "Identity Verification", icon: FaIdCard },
  { href: "/admin/dashboard/customers", label: "Customers", icon: FaUserFriends },
  { href: "/admin/dashboard/complaints", label: "Complaints", icon: FaExclamationCircle },
  { href: "/admin/dashboard/contacts", label: "Contacts", icon: FaAddressBook },
  { href: "/admin/dashboard/sales", label: "Sales", icon: FaChartLine },
];

export default function Sidebar() {
  const pathname = usePathname();

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
      
      <div className="p-4 bg-green-700 rounded-md text-sm">
        <p className="font-medium">Need help?</p>
        <p className="text-green-200 mt-1">Check our documentation or contact support</p>
      </div>
    </aside>
  );
}