'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth-context';

export default function RegisterPage() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [nationalInsuranceNumber, setNIN] = useState('');
  const [nhsNumber, setNHS] = useState('');
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('password', password);
    if (nationalInsuranceNumber) formData.append('nationalInsuranceNumber', nationalInsuranceNumber);
    if (nhsNumber) formData.append('nhsNumber', nhsNumber);
    if (file1) formData.append('file1', file1);
    if (file2) formData.append('file2', file2);
    await fetch('/api/auth/register', { method: 'POST', body: formData });
    await login(email, password);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-green-50 to-blue-100 animate-fade-in py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-10 animate-fade-in-delay text-green-800">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center animate-pop-in">Register</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input name="name" value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Full Name" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" required />
          <input name="email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" required />
          <input name="address" value={address} onChange={e => setAddress(e.target.value)} type="text" placeholder="Address" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" required />
          <input name="password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" required />
          <input name="nationalInsuranceNumber" value={nationalInsuranceNumber} onChange={e => setNIN(e.target.value)} type="text" placeholder="National Insurance Number (optional)" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" />
          <input name="nhsNumber" value={nhsNumber} onChange={e => setNHS(e.target.value)} type="text" placeholder="NHS Number (optional)" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-3 px-4 text-lg rounded transition-all text-black" />
          <input name="file1" type="file" onChange={e => setFile1(e.target.files?.[0] || null)} className="file-input file-input-bordered w-full text-black" />
          <input name="file2" type="file" onChange={e => setFile2(e.target.files?.[0] || null)} className="file-input file-input-bordered w-full text-black" />
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold text-lg shadow transition-all animate-bounce-in">Register</button>
        </form>
        <p className="mt-6 text-center text-green-800">Already have an account? <a href="/auth/login" className="text-green-700 underline font-semibold">Login</a></p>
      </div>
    </div>
  );
}
