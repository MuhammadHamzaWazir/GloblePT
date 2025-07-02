'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  // Basic Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  // Identity Verification
  const [nationalInsuranceNumber, setNIN] = useState('');
  const [nhsNumber, setNHS] = useState('');
  const [photoId, setPhotoId] = useState<File | null>(null);
  const [addressProof, setAddressProof] = useState<File | null>(null);
  
  // Medical History & Capacity Assessment
  const [currentMedications, setCurrentMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateAge = () => {
    if (!dateOfBirth) return false;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 16;
  };

  const handleStepValidation = (step: number) => {
    switch (step) {
      case 1:
        if (!name || !email || !password || !confirmPassword || !address || !dateOfBirth) {
          setError('Please fill in all required fields.');
          return false;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return false;
        }
        if (!validateAge()) {
          setError('You must be at least 16 years old to register.');
          return false;
        }
        break;
      case 2:
        // Identity verification is optional but recommended
        break;
      case 3:
        // Medical history is optional
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (handleStepValidation(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!handleStepValidation(currentStep)) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      
      // Basic information
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('address', address);
      formData.append('dateOfBirth', dateOfBirth);
      
      // Identity verification
      if (nationalInsuranceNumber) formData.append('nationalInsuranceNumber', nationalInsuranceNumber);
      if (nhsNumber) formData.append('nhsNumber', nhsNumber);
      if (photoId) formData.append('photoId', photoId);
      if (addressProof) formData.append('addressProof', addressProof);
      
      // Medical history
      if (currentMedications) formData.append('currentMedications', currentMedications);
      if (allergies) formData.append('allergies', allergies);
      if (medicalConditions) formData.append('medicalConditions', medicalConditions);
      formData.append('isPregnant', isPregnant.toString());
      formData.append('isBreastfeeding', isBreastfeeding.toString());
      
      const response = await fetch('/api/auth/register', { 
        method: 'POST', 
        body: formData 
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Auto-login after successful registration
      await login(email, password);
      router.push('/dashboard');
      
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-green-800 mb-4">👤 Personal Information</h2>
      
      <input 
        name="name" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        type="text" 
        placeholder="Full Name *" 
        className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
        required 
      />
      
      <input 
        name="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        type="email" 
        placeholder="Email Address *" 
        className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
        required 
      />
      
      <textarea 
        name="address" 
        value={address} 
        onChange={e => setAddress(e.target.value)} 
        placeholder="Full Address *" 
        rows={3}
        className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
        required 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-green-800 mb-1">Date of Birth *</label>
          <input 
            name="dateOfBirth" 
            value={dateOfBirth} 
            onChange={e => setDateOfBirth(e.target.value)} 
            type="date" 
            className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
            required 
          />
          <p className="text-xs text-green-600 mt-1">Must be 16+ for pharmacy services</p>
        </div>
        
        <div className="relative">
          <input 
            name="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            type={showPassword ? "text" : "password"}
            placeholder="Password *" 
            className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
            required 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      
      <input 
        name="confirmPassword" 
        value={confirmPassword} 
        onChange={e => setConfirmPassword(e.target.value)} 
        type="password" 
        placeholder="Confirm Password *" 
        className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
        required 
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-green-800 mb-4">🔒 Identity Verification</h2>
      <p className="text-sm text-green-700 mb-4">
        To comply with UK pharmacy regulations, we need to verify your identity. This helps ensure safe and legal dispensing of medicines.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          name="nationalInsuranceNumber" 
          value={nationalInsuranceNumber} 
          onChange={e => setNIN(e.target.value)} 
          type="text" 
          placeholder="National Insurance Number (optional)" 
          className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
        />
        
        <input 
          name="nhsNumber" 
          value={nhsNumber} 
          onChange={e => setNHS(e.target.value)} 
          type="text" 
          placeholder="NHS Number (optional)" 
          className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
        />
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-green-800 mb-2">
            📷 Photo ID (Passport, Driving License, etc.)
          </label>
          <input 
            name="photoId" 
            type="file" 
            accept="image/*,.pdf"
            onChange={e => setPhotoId(e.target.files?.[0] || null)} 
            className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-100 file:text-green-800"
          />
          <p className="text-xs text-green-600 mt-1">Government-issued ID required for verification</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-green-800 mb-2">
            🏠 Address Proof (Utility Bill, Bank Statement, etc.)
          </label>
          <input 
            name="addressProof" 
            type="file" 
            accept="image/*,.pdf"
            onChange={e => setAddressProof(e.target.files?.[0] || null)} 
            className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-100 file:text-green-800"
          />
          <p className="text-xs text-green-600 mt-1">Recent document showing your address</p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-green-800 mb-4">🏥 Medical History & Safety Assessment</h2>
      <p className="text-sm text-green-700 mb-4">
        This information helps our pharmacists ensure safe and appropriate medication recommendations.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-green-800 mb-2">
            Current Medications (comma-separated)
          </label>
          <textarea 
            name="currentMedications" 
            value={currentMedications} 
            onChange={e => setCurrentMedications(e.target.value)} 
            placeholder="e.g., Paracetamol 500mg, Ibuprofen 200mg, etc."
            rows={3}
            className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-green-800 mb-2">
            Known Allergies (comma-separated)
          </label>
          <textarea 
            name="allergies" 
            value={allergies} 
            onChange={e => setAllergies(e.target.value)} 
            placeholder="e.g., Penicillin, Aspirin, etc."
            rows={3}
            className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-green-800 mb-2">
            Medical Conditions (comma-separated)
          </label>
          <textarea 
            name="medicalConditions" 
            value={medicalConditions} 
            onChange={e => setMedicalConditions(e.target.value)} 
            placeholder="e.g., Diabetes, High Blood Pressure, etc."
            rows={3}
            className="w-full border-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 p-4 border-2 border-green-300 rounded cursor-pointer hover:bg-green-50">
            <input 
              type="checkbox" 
              checked={isPregnant} 
              onChange={e => setIsPregnant(e.target.checked)} 
              className="w-5 h-5 text-green-600"
            />
            <span className="text-green-800">Currently pregnant</span>
          </label>
          
          <label className="flex items-center space-x-3 p-4 border-2 border-green-300 rounded cursor-pointer hover:bg-green-50">
            <input 
              type="checkbox" 
              checked={isBreastfeeding} 
              onChange={e => setIsBreastfeeding(e.target.checked)} 
              className="w-5 h-5 text-green-600"
            />
            <span className="text-green-800">Currently breastfeeding</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 to-blue-100 py-12">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">Register for Pharmacy Services</h1>
          <div className="flex justify-center space-x-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {step}
              </div>
            ))}
          </div>
          <div className="text-sm text-green-600">
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Personal Information' :
              currentStep === 2 ? 'Identity Verification' :
              'Medical History'
            }
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            {currentStep > 1 && (
              <button 
                type="button"
                onClick={prevStep}
                className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-full font-semibold transition-all"
              >
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-semibold transition-all ml-auto"
              >
                Next Step
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-full font-semibold transition-all ml-auto flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 text-center text-green-800">
          <p>Already have an account? <a href="/auth/login" className="text-green-700 underline font-semibold">Login here</a></p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">🔒 Privacy & Security</h3>
          <p className="text-sm text-blue-700">
            Your personal and medical information is securely encrypted and only accessible to authorized pharmacy staff. 
            We comply with UK GDPR and pharmacy regulations to protect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
