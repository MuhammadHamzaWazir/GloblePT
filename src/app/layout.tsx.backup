import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { headers } from "next/headers";
import { SEOSetting } from "../lib/types";
import { Suspense } from "react";
import MainHeader from "./components/MainHeader";
import MainFooter from "./components/MainFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function fetchSEO(path: string): Promise<SEOSetting | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/seo?page=${encodeURIComponent(path)}`
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const dashboardPaths = [
  "/dashboard",
  "/dashboard/complaints",
  "/admin/dashboard",
  "/admin/users",
  "/admin/customers",
  "/admin/staff",
  "/admin/roles",
  "/admin/prescriptions",
  "/admin/complaints",
  "/admin/contact",
  "/staff-dashboard",
  "/assistant-portal"
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const path = headersList.get('x-nextjs-pathname') || '/';
  const seo = await fetchSEO(path);
  const isDashboard = dashboardPaths.some(p => path.startsWith(p));
  return (
    <html lang="en">
      <head>
        <title>{seo?.title || "Pharmacy"}</title>
        <meta
          name="description"
          content={seo?.description || "Pharmacy website"}
        />
        {seo?.canonical && <link rel="canonical" href={seo.canonical} />}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {!isDashboard && <MainHeader />}
          <Suspense fallback={null}>{children}</Suspense>
          {!isDashboard && <MainFooter />}
        </AuthProvider>
      </body>
    </html>
  );
}
