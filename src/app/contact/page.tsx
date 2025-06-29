'use client';

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-100 animate-fade-in">
      <div className="max-w-xl mx-auto py-16 px-4 animate-fade-in-delay">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-800 mb-4 animate-pop-in text-center">Contact Us</h1>
        {submitted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-green-700 font-semibold animate-bounce-in">
            Thank you for reaching out! We will get back to you soon.
          </div>
        ) : (
          <form className="bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fade-in-delay" onSubmit={e => { e.preventDefault(); setSubmitted(true); }}>
            <input type="text" name="name" placeholder="Your Name" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-2 px-3 text-lg transition-all" required />
            <input type="email" name="email" placeholder="Your Email" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-2 px-3 text-lg transition-all" required />
            <textarea name="message" placeholder="Your Message" className="w-full border-b-2 border-green-300 focus:border-green-600 outline-none py-2 px-3 text-lg transition-all" rows={4} required />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold text-lg shadow transition-all animate-bounce-in">Send Message</button>
          </form>
        )}
      </div>
    </div>
  );
}
