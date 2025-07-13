'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '../../../components/AuthGuard';
import { 
  FaEnvelope, 
  FaPaperPlane, 
  FaUser, 
  FaUserShield,
  FaExclamationTriangle,
  FaPlus
} from 'react-icons/fa';

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  messageType: string;
  isSystemMessage: boolean;
  createdAt: string;
}

interface Conversation {
  id: number;
  subject?: string;
  priority: string;
  isArchived: boolean;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderName: string;
    senderId: number;
  };
  participants: {
    id: number;
    name: string;
    email: string;
    role: string;
  }[];
  lastMessageAt: string;
  createdAt: string;
}

export default function MessagesPage() {
  return (
    <AuthGuard requireAuth={true}>
      <MessagesContent />
    </AuthGuard>
  );
}

function MessagesContent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New message form
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [newMessagePriority, setNewMessagePriority] = useState('normal');
  
  // Current message input
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For now, return empty array since API isn't ready
      setConversations([]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async () => {
    if (!newMessageSubject.trim() || !newMessageContent.trim()) {
      setError('Subject and message are required');
      return;
    }

    try {
      setSendLoading(true);
      setError('');
      
      // For now, show success message
      alert('Message functionality will be available soon. Your message: ' + newMessageContent);
      
      // Reset form
      setNewMessageSubject('');
      setNewMessageContent('');
      setNewMessagePriority('normal');
      setShowNewMessageForm(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to send message');
    } finally {
      setSendLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaEnvelope className="text-green-600 text-2xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">Communicate with our pharmacy team</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewMessageForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            >
              <FaPlus className="mr-2" />
              New Message
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-6 text-center text-gray-500">
                  <FaEnvelope className="mx-auto text-4xl mb-3 text-gray-300" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new message with our team</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaEnvelope className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Messaging System</h3>
              <p className="text-gray-600">Click "New Message" to start a conversation with our pharmacy team</p>
            </div>
          </div>
        </div>

        {/* New Message Modal */}
        {showNewMessageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Message to Admin</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newMessageSubject || ''}
                    onChange={(e) => setNewMessageSubject(e.target.value)}
                    placeholder="Enter subject..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newMessagePriority || 'normal'}
                    onChange={(e) => setNewMessagePriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={newMessageContent || ''}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewMessageForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startNewConversation}
                  disabled={sendLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                >
                  {sendLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
