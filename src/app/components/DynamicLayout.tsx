'use client';

import { usePathname } from 'next/navigation';
import MainHeader from './MainHeader';
import MainFooter from './MainFooter';

const dashboardPaths = [
  "/dashboard",
  "/dashboard/complaints",
  "/dashboard/messages",
  "/dashboard/inbox",
  "/admin/dashboard",
  "/admin/users",
  "/admin/customers",
  "/admin/staff",
  "/admin/roles",
  "/admin/prescriptions",
  "/admin/complaints",
  "/admin/contact",
  "/admin/dashboard/inbox",
  "/staff-dashboard",
  "/assistant-portal"
];

export default function DynamicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname ? dashboardPaths.some(p => pathname.startsWith(p)) : false;

  return (
    <>
      {!isDashboard && <MainHeader />}
      {children}
      {!isDashboard && <MainFooter />}
    </>
  );
}
