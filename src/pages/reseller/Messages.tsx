import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

type Message = {
  id: number;
  reseller_id: number;
  sender: 'admin' | 'reseller';
  content: string;
  is_read: number;
  created_at: string;
};

export default function ResellerMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch('/api/reseller/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
          markAsRead();
        }
      });
  };

  const markAsRead = () => {
    fetch('/api/reseller/messages/read', { method: 'PUT' });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const res = await fetch('/api/reseller/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) {
      setNewMessage('');
      fetchMessages();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Support Chat</h2>
        <p className="text-sm text-gray-500">Chat with the admin team</p>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'reseller' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.sender === 'reseller'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'reseller' ? 'text-indigo-200' : 'text-gray-400'}`}>
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
    </div>
  );
}
