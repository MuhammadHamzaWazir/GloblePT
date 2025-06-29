import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { BellIcon } from "@heroicons/react/24/outline";

export default function PortalHeader() {
  const { logout } = useAuth();
  const router = useRouter();
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 bg-green-800 text-white shadow-md sticky top-0 z-10 animate-slide-down">
      <span className="text-2xl font-bold tracking-tight">Portal</span>
      <div className="flex items-center gap-6">
        <button className="relative group" aria-label="Notifications">
          <BellIcon className="h-7 w-7 text-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1.5 py-0.5 group-hover:scale-110 transition-transform">!</span>
        </button>
        <button onClick={() => { logout(); router.push("/"); }} className="bg-white text-green-800 px-4 py-2 rounded-full font-semibold shadow hover:bg-green-100 transition-all">Logout</button>
      </div>
    </header>
  );
}
