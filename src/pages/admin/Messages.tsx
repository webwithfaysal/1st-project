import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';

type Conversation = {
  id: number;
  name: string;
  email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

type Message = {
  id: number;
  reseller_id: number;
  sender: 'admin' | 'reseller';
  content: string;
  is_read: number;
  created_at: string;
};

export default function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedResellerId, setSelectedResellerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = () => {
    fetch('/api/admin/messages/conversations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConversations(data);
        }
      });
  };

  const fetchMessages = (resellerId: number) => {
    fetch(`/api/admin/messages/${resellerId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
          markAsRead(resellerId);
        }
      });
  };

  const markAsRead = (resellerId: number) => {
    fetch(`/api/admin/messages/${resellerId}/read`, { method: 'PUT' });
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedResellerId) {
        fetchMessages(selectedResellerId);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedResellerId]);

  useEffect(() => {
    if (selectedResellerId) {
      fetchMessages(selectedResellerId);
    }
  }, [selectedResellerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedResellerId) return;

    const res = await fetch(`/api/admin/messages/${selectedResellerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      setNewMessage('');
      fetchMessages(selectedResellerId);
      fetchConversations();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white shadow rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {conversations.map((conv) => (
              <li
                key={conv.id}
                onClick={() => setSelectedResellerId(conv.id)}
                className={`px-6 py-4 cursor-pointer hover:bg-gray-100 ${
                  selectedResellerId === conv.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{conv.name}</p>
                      <p className="text-sm text-gray-500 truncate w-32">{conv.last_message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-gray-400">
                      {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 mt-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {conversations.length === 0 && (
              <li className="px-6 py-8 text-center text-gray-500">
                No active conversations
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedResellerId ? (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {conversations.find(c => c.id === selectedResellerId)?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {conversations.find(c => c.id === selectedResellerId)?.email}
                </p>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender === 'admin'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSend} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
              <p className="mt-1 text-sm text-gray-500">Select a reseller from the sidebar to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
