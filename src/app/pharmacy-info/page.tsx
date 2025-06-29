import React from 'react';

export default function PharmacyInfoPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pharmacy Information</h1>
      <ul className="space-y-2">
        <li><strong>Owner:</strong> [Owner Name]</li>
        <li><strong>Superintendent:</strong> [Superintendent Name]</li>
        <li><strong>Superintendent Registration Number:</strong> [Registration Number]</li>
        <li><strong>Phone:</strong> [Phone Number]</li>
        <li><strong>Email:</strong> [Email Address]</li>
      </ul>
      <div className="mt-4">
        <a href="https://www.pharmacyregulation.org/registers/pharmacist" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Check Superintendent Registration Status</a>
      </div>
    </div>
  );
}
