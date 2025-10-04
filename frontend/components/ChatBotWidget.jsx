'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { apiPost } from '@/lib/api';


// This was built for the Demo Purpose. So change the styles and whatever is needed for this Chatbot UI.
export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await apiPost('api/chat/', {
        message: input,
        sessionId: 'user-123', // You can replace this with dynamic user/session ID
      });

      const botReply = res.data.reply || "I'm not sure I understood that.";
      const botMessage = { sender: 'bot', text: botReply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: 'bot', text: 'Server error. Please try again later.' };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setInput('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-2xl border flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-blue-600 text-white px-4 py-3 font-semibold">
            Trip Planner Chatbot
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
