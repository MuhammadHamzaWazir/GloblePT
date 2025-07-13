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
  FaArchive,
  FaReply,
  FaStar,
  FaClock,
  FaCheckCircle
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

export default function AdminInboxPage() {
  return (
    <AuthGuard requireAuth={true} requireRole="admin">
      <AdminInboxContent />
    </AuthGuard>
  );
}

function AdminInboxContent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Current message input
  const [currentMessage, setCurrentMessage] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [filterPriority, showArchived]);

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

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/messages/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      let conversations = data.conversations || [];
      
      // Apply filters
      if (filterPriority !== 'all') {
        conversations = conversations.filter((conv: Conversation) => conv.priority === filterPriority);
      }
      
      if (!showArchived) {
        conversations = conversations.filter((conv: Conversation) => !conv.isArchived);
      }
      
      setConversations(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
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

  const archiveConversation = async (conversationId: number) => {
    try {
      // TODO: Implement archive API endpoint
      alert('Archive functionality will be available soon.');
    } catch (error) {
      console.error('Error archiving conversation:', error);
      setError('Failed to archive conversation');
    }
  };

  const updatePriority = async (conversationId: number, priority: string) => {
    try {
      // TODO: Implement priority update API endpoint
      alert(`Priority update functionality will be available soon. New priority: ${priority}`);
    } catch (error) {
      console.error('Error updating priority:', error);
      setError('Failed to update priority');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <FaExclamationTriangle className="text-red-600" />;
      case 'high': return <FaStar className="text-orange-600" />;
      case 'normal': return <FaClock className="text-blue-600" />;
      case 'low': return <FaCheckCircle className="text-gray-600" />;
      default: return <FaClock className="text-blue-600" />;
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
                <h1 className="text-2xl font-bold text-gray-900">Admin Inbox</h1>
                <p className="text-gray-600">Manage customer messages and support requests</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">Show Archived</span>
              </label>
            </div>
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
                <h2 className="font-semibold text-gray-900">Customer Messages</h2>
                <p className="text-sm text-gray-600">{conversations.length} total conversations</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <FaInbox className="mx-auto text-4xl mb-3 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Customer messages will appear here</p>
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
                            {getPriorityIcon(conversation.priority)}
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
                          <p className="text-xs text-gray-600 mb-1">
                            From: {conversation.participants.find(p => p.role !== 'admin')?.name || 'Unknown'}
                          </p>
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(conversation.lastMessageAt)}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveConversation(conversation.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaArchive className="text-xs" />
                          </button>
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
                      placeholder="Type your reply..."
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Inbox</h3>
                <p className="text-gray-600">Select a conversation to view and respond to customer messages</p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <FaExclamationTriangle className="text-red-600 text-2xl" />
                    </div>
                    <h4 className="font-medium text-gray-900">Urgent</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {conversations.filter(c => c.priority === 'urgent').length}
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <FaStar className="text-orange-600 text-2xl" />
                    </div>
                    <h4 className="font-medium text-gray-900">High Priority</h4>
                    <p className="text-2xl font-bold text-orange-600">
                      {conversations.filter(c => c.priority === 'high').length}
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <FaClock className="text-blue-600 text-2xl" />
                    </div>
                    <h4 className="font-medium text-gray-900">Normal</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {conversations.filter(c => c.priority === 'normal').length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
