export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-green-800 mb-8 text-center">Terms & Conditions</h1>
        
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Agreement to Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the services of Global Pharma Trading, you agree to be bound by these 
              Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Pharmaceutical Services</h2>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>All prescriptions must be valid and issued by a qualified healthcare professional</li>
              <li>We reserve the right to refuse to dispense any prescription if we have concerns about safety or legality</li>
              <li>Controlled substances require additional verification and may have restrictions</li>
              <li>Home delivery services are subject to availability and geographic limitations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Professional Responsibility</h2>
            <p className="leading-relaxed">
              Our pharmacy is regulated by the General Pharmaceutical Council (GPhC). Our Superintendent 
              Pharmacist, <a href="https://www.pharmacyregulation.org/registers/pharmacist/2073649" 
              target="_blank" className="text-blue-600 hover:underline font-semibold">Frederick Osei Akomeah</a> (Registration: 2073649), ensures all services meet 
              professional standards and regulatory requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Patient Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>Provide accurate and complete information about your medical history</li>
              <li>Inform us of any allergies or adverse reactions to medications</li>
              <li>Follow prescribed dosage instructions and safety guidelines</li>
              <li>Store medications safely and dispose of unused medications properly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Payment and Pricing</h2>
            <p className="leading-relaxed">
              Payment is required at the time of service unless prior arrangements have been made. 
              NHS prescriptions are charged according to current NHS prescription charges. 
              Private prescriptions are charged at competitive market rates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Limitation of Liability</h2>
            <p className="leading-relaxed">
              While we take every care to ensure the accuracy and safety of our services, 
              we cannot be held liable for any adverse reactions or complications arising from 
              the use of medications dispensed, provided we have followed proper procedures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Complaints Procedure</h2>
            <p className="leading-relaxed">
              If you have any concerns or complaints about our services, please contact us directly. 
              We will investigate all complaints promptly and fairly. You may also contact the 
              General Pharmaceutical Council if you are not satisfied with our response.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Contact Information</h2>
            <div className="bg-green-50 p-6 rounded-lg">
              <p><strong>Global Pharma Trading</strong></p>
              <p>Director: Usamah Patel</p>
              <p>Unit 42b Bowlers Croft, Basildon, Essex SS14 3ED</p>
              <p>Phone: <a href="tel:07950938398" className="text-blue-600 hover:underline">07950 938398</a></p>
              <p>Email: <a href="mailto:info@globalpharmatrading.co.uk" className="text-blue-600 hover:underline">info@globalpharmatrading.co.uk</a></p>
              <p>Opening Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
            </div>
          </section>

          <section className="text-sm text-gray-600 border-t pt-6">
            <p>These terms and conditions were last updated on July 1, 2025. We reserve the right to modify these terms at any time.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
