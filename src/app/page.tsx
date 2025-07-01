import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-100 animate-fade-in">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-green-800 mb-4 animate-pop-in">
          Your Health, Our Priority
        </h1>
        <p className="text-lg sm:text-2xl text-green-800 mb-8 animate-fade-in-delay">
          Trusted pharmacy services, expert advice, and fast prescription
          fulfillment for your family.
        </p>
        <div className="flex flex-wrap gap-4 justify-center animate-fade-in-delay">
          <Link
            href="/services"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 animate-bounce-in"
          >
            Explore Services
          </Link>
          <Link
            href="/contact"
            className="bg-white border border-green-800 text-green-800 px-6 py-3 rounded-full shadow font-semibold text-lg hover:bg-green-50 transition-all duration-300 animate-bounce-in"
          >
            Contact Us
          </Link>
        </div>
        <Image
          src="/images/assets/pharmacy-hero.png"
          alt="Pharmacy"
          width={400}
          height={300}
          className="mt-12 rounded-xl shadow-xl animate-fade-in-delay"
        />
      </main>
      {/* About Section */}
      <section className="w-full bg-white/90 py-16 px-4 animate-fade-in-delay">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <Image
            src="/images/assets/pharmacy-interior.jpg"
            alt="About Pharmacy"
            width={260}
            height={180}
            className="rounded-lg shadow-lg"
          />
          <div className="text-left">
            <h2 className="text-3xl font-bold text-green-800 mb-2 animate-pop-in">
              About Global Pharma Trading
            </h2>
            <p className="text-lg text-green-800 mb-4">
              Global Pharma Trading is dedicated to providing exceptional pharmacy
              services with a personal touch. Under the leadership of Director 
              <strong> Usamah Patel</strong>, our team of licensed pharmacists and
              staff are committed to your health and well-being.
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-green-800 mb-2">Superintendent Pharmacist</h3>
              <p className="text-green-700">
                <a href="https://www.pharmacyregulation.org/registers/pharmacist/2073649" 
                   target="_blank" 
                   className="text-blue-600 hover:underline font-semibold">
                  <strong>Frederick Osei Akomeah</strong>
                </a><br/>
                Registration No: 2073649<br/>
                <a href="https://www.pharmacyregulation.org/registers/pharmacist/2073649" 
                   target="_blank" 
                   className="text-blue-600 hover:underline">
                  View NHS Registration →
                </a>
              </p>
            </div>
            <ul className="text-green-800 text-base space-y-1">
              <li>✔️ Trusted by thousands of families</li>
              <li>✔️ Expert pharmaceutical care</li>
              <li>✔️ Free health consultations</li>
              <li>✔️ Modern, friendly environment</li>
            </ul>
          </div>
        </div>
      </section>
      {/* Services Section */}
      <section className="w-full bg-gradient-to-r from-green-50 to-blue-100 py-16 px-4 animate-fade-in-delay">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-8 text-center animate-pop-in">
            Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform animate-bounce-in">
              <span className="text-3xl mb-2">💊</span>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Prescription Fulfillment</h3>
              <p className="text-green-700">Fast, accurate, and confidential prescription services for all your needs.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform animate-bounce-in">
              <span className="text-3xl mb-2">🩺</span>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Health Consultations</h3>
              <p className="text-green-700">Speak with our expert pharmacists for free health and medication advice.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform animate-bounce-in">
              <span className="text-3xl mb-2">🚚</span>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Home Delivery</h3>
              <p className="text-green-700">Convenient and safe delivery of medicines and health products to your door.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform animate-bounce-in">
              <span className="text-3xl mb-2">🧪</span>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Lab Test Booking</h3>
              <p className="text-green-700">Book blood tests and diagnostics with trusted local labs through us.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Information Section */}
      <section className="w-full bg-white py-16 px-4 animate-fade-in-delay">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-12 text-center animate-pop-in">
            Visit Us & Get In Touch
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div className="space-y-8">
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">📍 Our Location</h3>
                <p className="text-green-700 text-lg mb-2">
                  <strong>Unit 42b Bowlers Croft</strong><br/>
                  Basildon, Essex<br/>
                  SS14 3ED
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">🕒 Opening Hours</h3>
                <p className="text-green-700 text-lg">
                  <strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM<br/>
                  <strong>Saturday & Sunday:</strong> Closed
                </p>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">📞 Contact Details</h3>
                <p className="text-green-700 text-lg">
                  <strong>Phone:</strong> <a href="tel:07950938398" className="text-blue-600 hover:underline">07950 938398</a><br/>
                  <strong>Email:</strong> <a href="mailto:info@globalpharmatrading.co.uk" className="text-blue-600 hover:underline">info@globalpharmatrading.co.uk</a>
                </p>
              </div>
              
              {/* GPhC Registration */}
              <div className="bg-blue-50 rounded-xl p-6 flex items-center gap-4">
                <Image 
                  src="/assets/gphc-logo.svg" 
                  alt="GPhC Registered Pharmacy" 
                  width={80} 
                  height={40}
                  className="flex-shrink-0"
                />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">GPhC Registered Pharmacy</h3>
                  <p className="text-green-700">Regulated by the General Pharmaceutical Council</p>
                </div>
              </div>
            </div>
            
            {/* Google Map */}
            <div className="bg-gray-100 rounded-xl p-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.123456789!2d0.4891!3d51.5631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sUnit%2042b%20Bowlers%20Croft%2C%20Basildon%2C%20Essex%20SS14%203ED!5e0!3m2!1sen!2suk!4v1625097600000"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Global Pharma Trading Location - Unit 42b Bowlers Croft, Basildon"
              ></iframe>
              <p className="text-center text-sm text-gray-600 mt-2">
                <a href="https://maps.google.com/?q=Unit+42b+Bowlers+Croft,+Basildon,+Essex,+SS14+3ED" 
                   target="_blank" 
                   className="text-blue-600 hover:underline">
                  📍 Open in Google Maps
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complaint Section */}
      <section className="w-full bg-white/90 py-16 px-4 animate-fade-in-delay">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-8 text-center animate-pop-in">Have a Complaint?</h2>
          <p className="text-lg text-green-800 mb-6 text-center">We value your feedback. Please let us know if you have any issues or suggestions. Our team will review your complaint and get back to you promptly.</p>
          <form className="bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fade-in-delay" method="POST" action="/api/complaints">
            <input type="text" name="name" placeholder="Your Name" className="w-full border-b-2 border-green-300 focus:border-green-800 outline-none py-2 px-3 text-lg transition-all" required />
            <input type="email" name="email" placeholder="Your Email" className="w-full border-b-2 border-green-300 focus:border-green-800 outline-none py-2 px-3 text-lg transition-all" required />
            <textarea name="message" placeholder="Your Complaint" className="w-full border-b-2 border-green-300 focus:border-green-800 outline-none py-2 px-3 text-lg transition-all" rows={4} required />
            <button type="submit" className="w-full bg-green-800 hover:bg-green-900 text-white py-3 rounded-full font-semibold text-lg shadow transition-all animate-bounce-in">Submit Complaint</button>
          </form>
        </div>
      </section>
      {/* Testimonial Section */}
      <section className="w-full bg-white/90 py-16 px-4 animate-fade-in-delay">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-8 text-center animate-pop-in">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-50 rounded-xl shadow p-6 animate-bounce-in">
              <p className="text-green-800 italic mb-2">Global Pharma Trading made my prescription process so easy and fast. The staff is always friendly!</p>
              <span className="block font-semibold text-green-700">— Sarah L.</span>
            </div>
            <div className="bg-green-50 rounded-xl shadow p-6 animate-bounce-in">
              <p className="text-green-800 italic mb-2">I love the home delivery service. Its a lifesaver for my family!</p>
              <span className="block font-semibold text-green-700">— Mark R.</span>
            </div>
            <div className="bg-green-50 rounded-xl shadow p-6 animate-bounce-in">
              <p className="text-green-800 italic mb-2">The pharmacists are knowledgeable and always answer my questions.</p>
              <span className="block font-semibold text-green-700">— Priya S.</span>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="w-full bg-gradient-to-r from-green-50 to-blue-100 py-16 px-4 animate-fade-in-delay">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-green-800 mb-8 text-center animate-pop-in">
            Contact Us
          </h2>
          <form className="bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fade-in-delay">
            <input type="text" name="name" placeholder="Your Name" className="w-full border-b-2 border-green-300 focus:border-green-800 outline-none py-2 px-3 text-lg transition-all" required />
            <input type="email" name="email" placeholder="Your Email" className="w-full border-b-2 border-green-300 focus:border-green-800 outline-none py-2 px-3 text-lg transition-all" required />
            <textarea name="message" placeholder="Your Message" className="w-full border-b-2 border-green-300 focus:border-green-800 outline-none py-2 px-3 text-lg transition-all" rows={4} required />
            <button type="submit" className="w-full bg-green-800 hover:bg-green-900 text-white py-3 rounded-full font-semibold text-lg shadow transition-all animate-bounce-in">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}

// Animations (add to your global CSS or Tailwind config)
// .animate-fade-in { animation: fadeIn 1s ease-in; }
// .animate-fade-in-delay { animation: fadeIn 1.5s ease-in; }
// .animate-pop-in { animation: popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
// .animate-slide-down { animation: slideDown 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
// .animate-slide-up { animation: slideUp 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
// .animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(.68,-0.55,.27,1.55); }
