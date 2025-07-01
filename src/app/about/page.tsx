import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-100 animate-fade-in">
      <div className="max-w-3xl mx-auto py-16 px-4 text-center animate-fade-in-delay">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-800 mb-4 animate-pop-in">
          About Global Pharma Trading
        </h1>
        <p className="text-lg sm:text-xl text-green-800 mb-8 animate-fade-in-delay">
          Under the leadership of Director <strong>Usamah Patel</strong>, Global Pharma Trading 
          is dedicated to providing exceptional pharmacy services with a personal touch. 
          Our team of licensed pharmacists and staff are committed to your health and well-being.
        </p>

        {/* Leadership Team */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 animate-bounce-in">
            <h3 className="text-xl font-semibold text-green-800 mb-3">👨‍💼 Director</h3>
            <p className="text-lg text-green-700"><strong>Usamah Patel</strong></p>
            <p className="text-green-600 mt-2">Leading our pharmacy with expertise and dedication to community health.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 animate-bounce-in">
            <h3 className="text-xl font-semibold text-green-800 mb-3">👨‍⚕️ Superintendent Pharmacist</h3>
            <p className="text-lg text-green-700">
              <a href="https://www.pharmacyregulation.org/registers/pharmacist/2073649" 
                 target="_blank" 
                 className="text-blue-600 hover:underline font-semibold">
                <strong>Frederick Osei Akomeah</strong>
              </a>
            </p>
            <p className="text-green-600 mt-1">Registration No: 2073649</p>
            <a href="https://www.pharmacyregulation.org/registers/pharmacist/2073649" 
               target="_blank" 
               className="inline-block mt-2 text-blue-600 hover:underline">
              View NHS Registration →
            </a>
          </div>
        </div>

        {/* Location & Hours */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fade-in-delay">
          <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Visit Our Pharmacy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">📍 Location</h3>
              <p className="text-green-700">
                <strong>Unit 42b Bowlers Croft</strong><br/>
                Basildon, Essex<br/>
                SS14 3ED
              </p>
              <p className="mt-4">
                <strong>Phone:</strong> <a href="tel:07950938398" className="text-blue-600 hover:underline">07950 938398</a><br/>
                <strong>Email:</strong> <a href="mailto:info@globalpharmatrading.co.uk" className="text-blue-600 hover:underline">info@globalpharmatrading.co.uk</a>
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-3">🕒 Opening Hours</h3>
              <p className="text-green-700">
                <strong>Monday - Friday:</strong> 9:00 AM - 5:00 PM<br/>
                <strong>Saturday & Sunday:</strong> Closed
              </p>
              <div className="mt-4 flex items-center gap-4">
                <Image src="/assets/gphc-logo.svg" alt="GPhC Registered" width={80} height={40} />
                <p className="text-sm text-green-600">GPhC Registered Pharmacy</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-8 animate-fade-in-delay">
          <Image
            src="/images/assets/pharmacy-interior.jpg"
            alt="About Pharmacy"
            width={300}
            height={200}
            className="rounded-lg shadow-lg"
          />
          <ul className="text-left text-green-800 text-lg space-y-2">
            <li>✔️ Trusted by thousands of families</li>
            <li>✔️ 24/7 prescription support</li>
            <li>✔️ Free health consultations</li>
            <li>✔️ Modern, friendly environment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
