'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    category: "Registration & Account",
    question: "How do I register for an online pharmacy account?",
    answer: "To register, click 'Register' on our homepage and complete the registration form. You'll need to provide personal details, upload a photo ID and proof of address. Your account will be reviewed by our team within 1-2 business days before approval."
  },
  {
    id: 2,
    category: "Registration & Account",
    question: "What documents do I need for verification?",
    answer: "You'll need to upload a clear photo of your ID (passport, driving license, or national ID card) and a proof of address document (utility bill, bank statement, or council tax bill) dated within the last 3 months."
  },
  {
    id: 3,
    category: "Registration & Account",
    question: "How long does account approval take?",
    answer: "Account approval typically takes 1-2 business days. Once approved, you'll receive an email confirmation and can log in to access our services."
  },
  {
    id: 4,
    category: "Prescriptions",
    question: "How do I upload a prescription?",
    answer: "After logging in, go to 'Upload Prescription' in your dashboard. You can upload clear photos or scanned copies of your prescription. Supported formats include JPG, PNG, and PDF files up to 10MB each."
  },
  {
    id: 5,
    category: "Prescriptions",
    question: "What happens after I upload my prescription?",
    answer: "Our qualified pharmacists will review your prescription within 24 hours. If approved, we'll prepare your medication and arrange delivery. You'll receive email updates throughout the process."
  },
  {
    id: 6,
    category: "Prescriptions",
    question: "Can I upload multiple prescriptions at once?",
    answer: "Yes, you can upload multiple prescription images in a single session. Each prescription will be reviewed separately by our pharmacists."
  },
  {
    id: 7,
    category: "Payment & Delivery",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards through our secure Stripe payment system. We also offer direct debit for regular prescriptions and payment exemption options for eligible customers."
  },
  {
    id: 8,
    category: "Payment & Delivery",
    question: "Do I qualify for free prescriptions?",
    answer: "You may qualify for free prescriptions if you're under 16, over 60, pregnant, or have certain medical conditions. During registration, you can select your exemption reason, and we'll verify this with your GP if needed."
  },
  {
    id: 9,
    category: "Payment & Delivery",
    question: "How long does delivery take?",
    answer: "Standard delivery takes 1-3 working days. Express delivery (next day) is available for urgent prescriptions. You'll receive tracking information once your order is dispatched."
  },
  {
    id: 10,
    category: "GP Details",
    question: "Why do you need my GP information?",
    answer: "GP details help us verify prescription authenticity and contact your GP if we need to confirm any prescription details. This ensures your safety and helps us provide the best pharmaceutical care."
  },
  {
    id: 11,
    category: "GP Details",
    question: "Is my NHS number required?",
    answer: "Yes, your NHS number helps us accurately identify you and ensures we have the correct patient records. This information is stored securely and used only for prescription services."
  },
  {
    id: 12,
    category: "Orders & Tracking",
    question: "How can I track my order?",
    answer: "You can track your order status in the 'Orders' section of your dashboard. Once dispatched, you'll receive a tracking number to monitor your delivery with Royal Mail or our courier service."
  },
  {
    id: 13,
    category: "Orders & Tracking",
    question: "What if my medication is out of stock?",
    answer: "If your medication is temporarily out of stock, our pharmacists will contact you to discuss alternatives or arrange for the medication to be ordered specifically for you."
  },
  {
    id: 14,
    category: "Safety & Privacy",
    question: "Is my personal information secure?",
    answer: "Yes, we use industry-standard encryption and comply with UK GDPR regulations. Your personal and medical information is only accessible to authorized pharmacy staff and is never shared with third parties."
  },
  {
    id: 15,
    category: "Safety & Privacy",
    question: "Who can access my medical information?",
    answer: "Only qualified pharmacists and authorized healthcare professionals involved in your care can access your medical information. All staff are bound by professional confidentiality requirements."
  },
  {
    id: 16,
    category: "Support",
    question: "How can I contact customer support?",
    answer: "You can contact us through the messaging system in your dashboard, email us at info@globalpharmatrading.co.uk, or call 07950 938398 during business hours (Mon-Fri, 9AM-5PM)."
  },
  {
    id: 17,
    category: "Support",
    question: "What if I have a complaint?",
    answer: "You can submit complaints through the 'Complaints' section in your dashboard. All complaints are handled by our management team and you'll receive updates on the resolution process."
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const openAllInCategory = () => {
    const categoryItems = filteredFAQs.map(item => item.id);
    setOpenItems(prev => [...new Set([...prev, ...categoryItems])]);
  };

  const closeAllInCategory = () => {
    const categoryItems = filteredFAQs.map(item => item.id);
    setOpenItems(prev => prev.filter(id => !categoryItems.includes(id)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <FaQuestionCircle className="text-6xl text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our online pharmacy services, 
            registration process, prescriptions, and more.
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={openAllInCategory}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Expand All
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={closeAllInCategory}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800 mt-1">
                    {item.question}
                  </h3>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {openItems.includes(item.id) ? (
                    <FaChevronUp className="text-green-600" />
                  ) : (
                    <FaChevronDown className="text-green-600" />
                  )}
                </div>
              </button>
              
              {openItems.includes(item.id) && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-green-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/dashboard/messages"
              className="bg-white border border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Message Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
