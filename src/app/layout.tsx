import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { Suspense } from "react";
import DynamicLayout from "./components/DynamicLayout";

export const metadata = {
  title: "Global Pharma Trading - Online Pharmacy Management",
  description: "Professional pharmacy management system for prescriptions, customer service, and healthcare solutions.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Global Pharma Trading - Online Pharmacy Management</title>
        <meta
          name="description"
          content="Professional pharmacy management system for prescriptions, customer service, and healthcare solutions."
        />
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} 
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <DynamicLayout>
            <Suspense fallback={null}>{children}</Suspense>
          </DynamicLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
