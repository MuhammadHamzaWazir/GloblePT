import Link from "next/link";
import Image from "next/image";

export default function MainFooter() {
  return (
    <footer className="w-full py-12 bg-gradient-to-br from-green-800 to-blue-700 text-white animate-slide-up px-6">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Company Info */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/">
              <Image src="/images/assets/global-pharma-trading-logo.jpg" alt="Global Pharma Trading Logo" width={80} height={80} className="rounded-full shadow cursor-pointer mb-4" />
            </Link>
            <span className="font-bold text-lg tracking-tight text-green-100 drop-shadow mb-2">Global Pharma Trading</span>
            <p className="text-sm text-green-200 text-center md:text-left">Your Health, Our Priority</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-green-100">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="hover:underline hover:text-green-200 transition-colors text-sm">Home</Link>
              <Link href="/about" className="hover:underline hover:text-green-200 transition-colors text-sm">About Us</Link>
              <Link href="/services" className="hover:underline hover:text-green-200 transition-colors text-sm">Services</Link>
              <Link href="/contact" className="hover:underline hover:text-green-200 transition-colors text-sm">Contact</Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-green-100">Contact Info</h3>
            <div className="text-sm text-green-200 space-y-2">
              <p>📍 Unit 42b Bowlers Croft<br/>Basildon, Essex SS14 3ED</p>
              <p>📞 <a href="tel:07950938398" className="hover:underline">07950 938398</a></p>
              <p>✉️ <a href="mailto:info@globalpharmatrading.co.uk" className="hover:underline">info@globalpharmatrading.co.uk</a></p>
              <p className="text-xs mt-2">Mon-Fri: 9AM-5PM</p>
            </div>
          </div>

          {/* Professional Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-green-100">Professional</h3>
            <div className="text-sm text-green-200 space-y-2">
              <p><strong>Director:</strong><br/>Usamah Patel</p>
              <p><strong>Superintendent:</strong><br/>
                <a href="https://www.pharmacyregulation.org/registers/pharmacist/2073649" 
                   target="_blank" 
                   className="hover:underline text-green-100">
                  Frederick Osei Akomeah
                </a>
              </p>
              <p>Reg: <a href="https://www.pharmacyregulation.org/registers/pharmacist/2073649" target="_blank" className="hover:underline">2073649</a></p>
              <p><strong>Company No:</strong> 15990775</p>
              <Image src="/assets/gphc-logo.svg" alt="GPhC Logo" width={60} height={30} className="mt-2" />
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-green-600 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-sm">
            <Link href="/legal/privacy-policy" className="hover:underline hover:text-green-200 transition-colors">Privacy Policy</Link>
            <Link href="/legal/terms-conditions" className="hover:underline hover:text-green-200 transition-colors">Terms & Conditions</Link>
          </div>
          <span className="text-sm text-green-100 text-center">
            © {new Date().getFullYear()} Global Pharma Trading. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
