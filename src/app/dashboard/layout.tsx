import Sidebar from "./sidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}