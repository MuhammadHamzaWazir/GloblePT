import Link from "next/link";
import Image from "next/image";

export default function MainFooter() {
  return (
    <footer className="w-full py-8 bg-gradient-to-br from-green-800 to-blue-700 text-white flex flex-col sm:flex-row justify-between items-center animate-slide-up px-6">
      <nav className="flex gap-6 mb-4 sm:mb-0">
        <Link href="/" className="hover:underline hover:text-green-200 transition-colors">Home</Link>
        <Link href="/about" className="hover:underline hover:text-green-200 transition-colors">About Us</Link>
        <Link href="/services" className="hover:underline hover:text-green-200 transition-colors">Services</Link>
        <Link href="/contact" className="hover:underline hover:text-green-200 transition-colors">Contact</Link>
      </nav>
      <div className="flex flex-col items-center gap-2 mb-4 sm:mb-0">
        <Link href="/">
          <Image src="/images/assets/global-pharma-trading-logo.jpg" alt="Global Pharma Trading Logo" width={80} height={80} className="rounded-full shadow cursor-pointer" />
        </Link>
        <span className="font-bold text-lg tracking-tight text-green-100 drop-shadow">Global Pharma Trading</span>
      </div>
      <span className="text-sm text-green-100 text-center sm:text-right w-full sm:w-auto">
        © {new Date().getFullYear()} Global Pharma Trading. All rights reserved.
      </span>
    </footer>
  );
}
