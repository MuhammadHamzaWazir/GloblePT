'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';
import { getDashboardRoute } from '../../lib/utils';

export default function MainHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [userRole, setUserRole] = useState<string>('CUSTOMER');
  const [dashboardUrl, setDashboardUrl] = useState('/dashboard');

  // Get user role and set appropriate dashboard URL
  useEffect(() => {
    if (user) {
      // Use the role from the auth context instead of making another API call
      const role = user.role?.toUpperCase() || 'CUSTOMER';
      setUserRole(role);
      setDashboardUrl(getDashboardRoute(role));
    } else {
      // Reset to defaults when user is null
      setUserRole('CUSTOMER');
      setDashboardUrl('/dashboard');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    setOpen(false);
    router.push('/auth/login');
  };
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-gradient-to-br from-green-800 to-blue-700 shadow-md sticky top-0 z-10 animate-slide-down">
      <span className="text-2xl font-bold text-green-100 tracking-tight"> 
      <Link href="/">
        <Image src="/images/assets/global-pharma-trading-logo.jpg"
         alt="Global Pharma Trading Logo" width={120} height={120} className="rounded-full shadow cursor-pointer ml-4" />
      </Link>
      </span>
      {/* Nav links */}
      <nav className={`sm:flex gap-6 text-lg font-medium ${open ? 'flex flex-col absolute top-20 left-0 w-full bg-gradient-to-br from-green-800 to-blue-700 py-6 shadow-lg z-20' : 'hidden sm:flex'} transition-all`}>
        <Link href="/" className="hover:text-green-200 text-white transition-colors block py-2 px-4" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/about" className="hover:text-green-200 text-white transition-colors block py-2 px-4" onClick={() => setOpen(false)}>About Us</Link>
        <Link href="/services" className="hover:text-green-200 text-white transition-colors block py-2 px-4" onClick={() => setOpen(false)}>Services</Link>
        <Link href="/contact" className="hover:text-green-200 text-white transition-colors block py-2 px-4" onClick={() => setOpen(false)}>Contact</Link>
        {user ? (
          <div className="relative block py-2 px-4">
            <button onClick={() => setDropdown(v => !v)} className="flex items-center gap-2 text-white font-semibold focus:outline-none">
              Dashboard
              <svg className={`w-4 h-4 ml-1 transition-transform ${dropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-30 animate-fade-in text-green-800">
                <Link href={dashboardUrl} className="block px-4 py-2 hover:bg-green-50" onClick={() => { setDropdown(false); setOpen(false); }}>
                  {userRole === 'ADMIN' ? 'Admin Dashboard' :
                   userRole === 'STAFF' ? 'Staff Dashboard' :
                   userRole === 'SUPERVISOR' ? 'Supervisor Dashboard' :
                   userRole === 'ASSISTANT' ? 'Assistant Portal' : 'Dashboard'}
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-green-50">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className="hover:text-green-200 text-white transition-colors block py-2 px-4" onClick={() => setOpen(false)}>Login</Link>
        )}
      </nav>
      
      {/* Hamburger for mobile/tablet */}
      <button
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 ml-2 focus:outline-none"
        aria-label="Toggle navigation"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`block w-6 h-0.5 bg-green-100 mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-green-100 mb-1 transition-all ${open ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-green-100 transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>
      {/* Overlay for mobile nav */}
      {open && <div className="fixed inset-0 bg-black/30 z-10 sm:hidden" onClick={() => setOpen(false)}></div>}
    </header>
  );
}
