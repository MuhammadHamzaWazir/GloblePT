export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-100 animate-fade-in">
      <div className="max-w-4xl mx-auto py-16 px-4 animate-fade-in-delay">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-800 mb-4 animate-pop-in text-center">Our Services</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform animate-bounce-in">
            <span className="text-3xl mb-2">💊</span>
            <h2 className="text-xl font-semibold mb-2 text-green-800">Prescription Fulfillment</h2>
            <p className="text-green-700">Fast, accurate, and confidential prescription services for all your needs.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform animate-bounce-in">
            <span className="text-3xl mb-2">🩺</span>
            <h2 className="text-xl font-semibold mb-2 text-green-800">Health Consultations</h2>
            <p className="text-green-700">Speak with our expert pharmacists for free health and medication advice.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform animate-bounce-in">
            <span className="text-3xl mb-2">🚚</span>
            <h2 className="text-xl font-semibold mb-2 text-green-800">Home Delivery</h2>
            <p className="text-green-700">Convenient and safe delivery of medicines and health products to your door.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition-transform animate-bounce-in">
            <span className="text-3xl mb-2">🧪</span>
            <h2 className="text-xl font-semibold mb-2 text-green-800">Lab Test Booking</h2>
            <p className="text-green-700">Book blood tests and diagnostics with trusted local labs through us.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
