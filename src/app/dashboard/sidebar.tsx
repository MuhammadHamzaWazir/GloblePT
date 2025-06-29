"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard Home" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/users/create", label: "Add User" },
  // Add more links as needed
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-green-800 text-white flex flex-col py-8 px-4 shadow-lg">
      <div className="mb-8 text-2xl font-bold text-center tracking-wide">Admin</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-2 rounded transition ${
                  pathname === link.href
                    ? "bg-green-600 font-bold"
                    : "hover:bg-green-700"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}