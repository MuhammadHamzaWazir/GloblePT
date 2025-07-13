'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import AuthGuard from '../../../components/AuthGuard';
import { 
  FaInbox, 
  FaPaperPlane, 
  FaUser, 
  FaUserShield,
  FaExclamationTriangle,
  FaPlus,
  FaArchive
} from 'react-icons/fa';

interface Message {
  id: number;
  content: string;
  senderId: number;
  sender: {
    id: number;
    name: string;
    role: string;
  };
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

export default function InboxPage() {
  return (
    <AuthGuard requireAuth={true}>
      <InboxContent />
    </AuthGuard>
  );
}

function InboxContent() {
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

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchMessages = async (conversationId: number) => {
    try {
      setError('');
      
      const response = await fetch(`/api/messages/conversations/${conversationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedConversation) return;

    try {
      setSendLoading(true);
      setError('');
      
      const response = await fetch(`/api/messages/conversations/${selectedConversation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Clear input and refresh messages
      setCurrentMessage('');
      await fetchMessages(selectedConversation);
      
      // Also refresh conversations to update last message
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSendLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/messages/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
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
      
      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: newMessageSubject,
          initialMessage: newMessageContent,
          priority: newMessagePriority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      
      // Reset form and refresh conversations
      setNewMessageSubject('');
      setNewMessageContent('');
      setNewMessagePriority('normal');
      setShowNewMessageForm(false);
      
      // Refresh conversations list
      await fetchConversations();
      
      // Select the new conversation
      setSelectedConversation(data.conversation.id);
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

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Use a simpler formatting that's more consistent between server/client
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      
      return date.toLocaleDateString('en-GB', options) + ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading inbox...</p>
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
              <FaInbox className="text-green-600 text-2xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
                <p className="text-gray-600">Messages from our pharmacy team</p>
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
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <FaInbox className="mx-auto text-4xl mb-3 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new message with our team</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                              {conversation.priority}
                            </span>
                            {conversation.isArchived && (
                              <FaArchive className="text-gray-400 text-xs" />
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.subject || 'No Subject'}
                          </h3>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(conversation.lastMessageAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-lg shadow-sm flex flex-col h-96">
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages in this conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === parseInt(user?.id || '0') ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === parseInt(user?.id || '0')
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === parseInt(user?.id || '0')
                                  ? 'text-green-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.createdAt)} • {message.sender.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendLoading || !currentMessage.trim()}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      {sendLoading ? '...' : <FaPaperPlane />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <FaInbox className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Inbox</h3>
                <p className="text-gray-600">Select a conversation to view your messages or start a new conversation</p>
              </div>
            )}
          </div>
        </div>

        {/* New Message Modal */}
        {showNewMessageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Message to Pharmacy</h3>
              
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
