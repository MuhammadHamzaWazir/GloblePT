import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-100 animate-fade-in">
      <div className="max-w-3xl mx-auto py-16 px-4 text-center animate-fade-in-delay">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-800 mb-4 animate-pop-in">
          About Global Pharma Trading
        </h1>
        <p className="text-lg sm:text-xl text-green-800 mb-6 animate-fade-in-delay">
          Global Pharma Trading is dedicated to providing exceptional pharmacy
          services with a personal touch. Our team of licensed pharmacists and
          staff are committed to your health and well-being, offering expert
          advice, fast prescription fulfillment, and a wide range of healthcare
          products.
        </p>
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
