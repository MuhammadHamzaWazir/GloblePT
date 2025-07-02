'use client';

import React from 'react';
import SecuritySettings from '../components/SecuritySettings';

export default function FeaturesDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            🏥 Global Pharma Trading - Advanced Security Features
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Comprehensive identity verification, capacity assessment, and age verification system 
            compliant with UK pharmacy regulations and GDPR requirements.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Identity Verification Features */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              🔒 Identity Verification System
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Customer Registration Requirements</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Personal details collection (name, DOB, address)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Government-issued photo ID upload
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Address verification documents
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    National Insurance Number validation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    NHS Number verification
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Verification Process</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Automated age verification (16+ requirement)
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Manual document review by pharmacy staff
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    ID cross-reference validation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Address proof verification
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Account status management
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🛡️ Admin Identity Verification Dashboard</h4>
              <p className="text-blue-700 text-sm">
                Staff and administrators have access to a dedicated identity verification center where they can:
              </p>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• Review uploaded identity documents</li>
                <li>• Verify customer details against official records</li>
                <li>• Approve or reject identity verification requests</li>
                <li>• Add verification notes and compliance records</li>
                <li>• Track verification history and audit trails</li>
              </ul>
            </div>
          </div>

          {/* Capacity Assessment */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              🧠 Capacity Assessment System
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Medical History Collection</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Current medications tracking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Known allergies documentation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Medical conditions recording
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Pregnancy/breastfeeding status
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Emergency contact information
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Capacity Evaluation</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Understanding of medication risks
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Ability to follow instructions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Decision-making capacity assessment
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Pharmacist review and approval
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Ongoing monitoring and updates
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Safety Checks During Prescription</h4>
              <p className="text-yellow-700 text-sm">
                Every prescription request includes mandatory safety confirmations:
              </p>
              <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                <li>• Understanding of medication risks and side effects</li>
                <li>• Ability to follow dosage and administration instructions</li>
                <li>• Confirmation of no known allergies to requested medications</li>
                <li>• Acknowledgment of warnings and contraindications</li>
                <li>• Age verification for restricted medicines</li>
              </ul>
            </div>
          </div>

          {/* Age Verification */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              🔞 Age Verification & Medicine Classification
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">POM Medicines</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium mb-2">Prescription Only Medicine</p>
                  <ul className="space-y-1 text-red-700 text-sm">
                    <li>• Requires valid prescription</li>
                    <li>• Prescriber GMC verification</li>
                    <li>• Identity verification mandatory</li>
                    <li>• Pharmacist approval required</li>
                    <li>• Enhanced tracking and monitoring</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">P Medicines</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium mb-2">Pharmacy Medicine</p>
                  <ul className="space-y-1 text-yellow-700 text-sm">
                    <li>• Screening questionnaire</li>
                    <li>• Capacity assessment</li>
                    <li>• Pharmacist consultation</li>
                    <li>• Risk evaluation</li>
                    <li>• Usage guidance provided</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Age Restrictions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium mb-2">Age-Restricted Items</p>
                  <ul className="space-y-1 text-blue-700 text-sm">
                    <li>• Minimum age validation</li>
                    <li>• Electronic verification tools</li>
                    <li>• Photo ID confirmation</li>
                    <li>• Underage access blocking</li>
                    <li>• Compliance documentation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Automated Compliance Checks</h4>
              <p className="text-green-700 text-sm">
                The system automatically validates age requirements, cross-references identity documents, 
                and ensures compliance with UK pharmacy regulations before processing any medication requests.
              </p>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              🔐 Two-Factor Authentication
            </h2>
            
            <div className="mb-6">
              <SecuritySettings userEmail="demo@globalpharmatrading.co.uk" />
            </div>
          </div>

          {/* Compliance & Privacy */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              📋 Compliance & Privacy Protection
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">UK Pharmacy Regulations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    GPhC (General Pharmaceutical Council) compliance
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Medicines Act 1968 adherence
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Human Medicines Regulations 2012
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    MHRA (Medicines and Healthcare products Regulatory Agency) guidelines
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Data Protection</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    UK GDPR compliance
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    End-to-end data encryption
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Secure document storage
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Audit trail maintenance
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Secure Pharmacy Services?</h2>
            <p className="text-lg mb-6 opacity-90">
              Register now with our comprehensive identity verification and capacity assessment system.
            </p>
            <div className="space-x-4">
              <a 
                href="/auth/register" 
                className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Register Now
              </a>
              <a 
                href="/auth/login" 
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
