"use client";

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft, Send, Paperclip, Mic } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Placeholder data for a specific chat
const initialMessages = [
  {
    id: 'm1',
    sender: 'other',
    avatar: '/shapes_logo.jpeg', // Using available logo as placeholder
    text: 'Hello! How are you today?',
    timestamp: '10:00 AM'
  },
  {
    id: 'm2',
    sender: 'me',
    text: 'I\'m doing well, thank you. How about yourself?',
    timestamp: '10:01 AM'
  },
  {
    id: 'm3',
    sender: 'other',
    avatar: '/shapes_logo.jpeg',
    text: 'Great! Just working on some new projects.',
    timestamp: '10:02 AM'
  },
  {
    id: 'm4',
    sender: 'me',
    text: 'That sounds interesting. What kind of projects?',
    timestamp: '10:03 AM'
  },
  {
    id: 'm5',
    sender: 'other',
    avatar: '/shapes_logo.jpeg',
    text: 'Just some design work. This is a placeholder message to demonstrate how longer messages appear in the chat interface. The bubble should expand properly to accommodate multiple lines of text while maintaining readability and visual consistency across different screen sizes.',
    timestamp: '10:05 AM'
  },
  {
    id: 'm6',
    sender: 'me',
    text: 'That looks great! The design is coming along nicely.',
    timestamp: '10:07 AM'
  },
];

interface ChatViewClientProps {
  chatId: string;
}

const ChatViewClient: React.FC<ChatViewClientProps> = ({ chatId }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Placeholder: Fetch chat partner details based on chatId
  const chatPartner = {
    name: 'User123',
    avatar: '/shapes_logo.jpeg',
    handle: '@user123.bsky.social'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const newMsg = {
      id: `m${messages.length + 1}`,
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <AppLayout currentPage={`chat/${chatId}`} showHeader={false} showSidebarButton={false}>
      <div className="bg-black text-white flex flex-col h-screen">
        {/* Custom Header for Chat View */}
        <header className="h-14 flex items-center px-4 border-b border-gray-800 sticky top-0 bg-black z-30">
          <Link href="/chat" legacyBehavior>
            <a className="p-2 -ml-2 mr-2 text-blue-400">
              <ArrowLeft size={24} />
            </a>
          </Link>
          <Image src={chatPartner.avatar} alt={chatPartner.name} width={32} height={32} className="rounded-full mr-3" />
          <div>
            <h1 className="text-base font-semibold leading-tight">{chatPartner.name}</h1>
            <p className="text-xs text-gray-500 leading-tight">{chatPartner.handle}</p>
          </div>
          {/* Potentially a MoreHorizontal or Call icon on the right */}
        </header>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'other' && (
                <Image src={msg.avatar || '/shapes_logo.jpeg'} alt="Sender Avatar" width={32} height={32} className="rounded-full mr-2 self-end mb-1" />
              )}
              <div 
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-blue-200' : 'text-gray-400'} text-right`}>{msg.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="bg-black border-t border-gray-800 p-3 sticky bottom-0 z-10">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-200">
              <Paperclip size={22} />
            </button>
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-grow bg-gray-800 border border-gray-700 rounded-full py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {newMessage ? (
                <button type="submit" className="p-2 text-blue-500 hover:text-blue-400">
                    <Send size={22} />
                </button>
            ) : (
                <button type="button" className="p-2 text-gray-400 hover:text-gray-200">
                    <Mic size={22} />
                </button>
            )}
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatViewClient;
