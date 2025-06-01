"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useRouter for back button
import Link from 'next/link';
import Image from 'next/image';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMessages,
  sendMessage,
  getConvo,
  MessageView,
  MessagesPage,
  ConvoView
} from '@/lib/bskyService';
import { ArrowLeft, Send, Paperclip, Mic, UserCircle, Users } from 'lucide-react';

const IndividualChatPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { agent, isAuthenticated, session } = useAuth();

  const chatId = typeof params.chatId === 'string' ? params.chatId : null;

  const [convoDetails, setConvoDetails] = useState<ConvoView | null>(null);
  const [messages, setMessages] = useState<MessageView[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(true);
  const [isLoadingConvo, setIsLoadingConvo] = useState<boolean>(true);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const getConvoDisplayDetails = useCallback((convo: ConvoView | null, currentUserDid: string | undefined) => {
    if (!convo) return { name: "Chat", avatar: null, isGroup: false, members: [] };
    const otherMembers = convo.members.filter(member => member.did !== currentUserDid);

    if (otherMembers.length === 0) {
      return { name: convo.members[0]?.displayName || convo.members[0]?.handle || "Self Chat", avatar: convo.members[0]?.avatar || null, isGroup: false, members: convo.members };
    }
    if (otherMembers.length === 1) {
      return { name: otherMembers[0].displayName || otherMembers[0].handle, avatar: otherMembers[0].avatar || null, isGroup: false, members: otherMembers };
    }
    return {
      name: otherMembers.map(m => m.displayName || m.handle).slice(0,2).join(', ') + (otherMembers.length > 2 ? ` & ${otherMembers.length-2} more` : ''),
      avatar: null,
      isGroup: true,
      members: otherMembers
    };
  }, []);


  // Fetch Conversation Details
  useEffect(() => {
    if (chatId && agent && isAuthenticated) {
      setIsLoadingConvo(true);
      getConvo(agent, chatId)
        .then(data => {
          setConvoDetails(data);
        })
        .catch(err => {
          console.error("Error fetching convo details:", err);
          setError("Failed to load conversation details.");
        })
        .finally(() => setIsLoadingConvo(false));
    }
  }, [chatId, agent, isAuthenticated]);

  const fetchMessages = useCallback(async (loadMore = false) => {
    if (!agent || !chatId || !isAuthenticated) return;

    if (!loadMore) setIsLoadingMessages(true);
    else setIsLoadingMoreMessages(true);
    setError(null);

    const currentCursor = loadMore ? cursor : undefined;

    try {
      const data: MessagesPage = await getMessages(agent, chatId, currentCursor, 30); // Fetch 30 messages
      // Messages from API are typically newest first, so prepend if loading more (older)
      setMessages(prev => loadMore ? [...data.messages.reverse(), ...prev] : data.messages.reverse());
      setCursor(data.cursor);
      if (!loadMore) {
        setTimeout(() => scrollToBottom("auto"), 100); // Scroll to bottom on initial load
      } else {
        // Preserve scroll position when loading older messages
        if (chatContainerRef.current && data.messages.length > 0) {
            const firstMessage = chatContainerRef.current.querySelector('[data-msg-id]');
            const oldScrollHeight = chatContainerRef.current.scrollHeight;
            // Wait for new messages to render, then adjust scroll
            requestAnimationFrame(() => {
                if (firstMessage) {
                    const newScrollHeight = chatContainerRef.current!.scrollHeight;
                    chatContainerRef.current!.scrollTop = newScrollHeight - oldScrollHeight + chatContainerRef.current!.scrollTop;
                }
            });
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : "Unknown error fetching messages.");
    } finally {
      if (!loadMore) setIsLoadingMessages(false);
      else setIsLoadingMoreMessages(false);
    }
  }, [agent, chatId, cursor, isAuthenticated]);

  useEffect(() => {
    if (chatId && agent && isAuthenticated) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, agent, isAuthenticated]); // fetchMessages dependency removed to control calls

  const handleSendMessage = async () => {
    if (!agent || !chatId || newMessageText.trim() === '') return;
    setIsSending(true);
    try {
      const sentMessage = await sendMessage(agent, chatId, newMessageText);
      // Add the sent message to the local state (optimistic update)
      // Assuming MessageViewSent is compatible with MessageView structure for display
      const messageToAdd: MessageView = {
        $type: "chat.bsky.convo.defs#messageView", // This might need adjustment based on actual returned type if it's just MessageViewSent
        id: sentMessage.id,
        rev: sentMessage.rev,
        text: newMessageText, // Use the text that was sent
        sentAt: new Date().toISOString(), // Use current time, or better, use sentMessage.sentAt if available
        sender: { did: session!.did }, // Current user is the sender
        // embeds: [] // If supporting embeds in future
      };
      setMessages(prev => [...prev, messageToAdd]);
      setNewMessageText('');
      setTimeout(() => scrollToBottom(), 0); // Scroll after message is added
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message.");
      // Revert optimistic update or show error specifically for the message if needed
    } finally {
      setIsSending(false);
    }
  };

  const convoDisplay = getConvoDisplayDetails(convoDetails, session?.did);

  return (
    <AppLayout
        currentPage={isLoadingConvo ? "Chat" : convoDisplay.name || "Chat"}
        showHeader={false} // Using custom header for chat
        showSidebarButton={false}
    >
      <div className="flex flex-col h-screen text-white bg-black">
        {/* Custom Header */}
        <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-gray-700 flex items-center p-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-700 mr-2">
            <ArrowLeft size={20} />
          </button>
          {isLoadingConvo ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse mr-2"></div>
          ) : convoDisplay.avatar ? (
            <Image src={convoDisplay.avatar} alt="avatar" width={32} height={32} className="rounded-full mr-2" />
          ) : convoDisplay.isGroup ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-2"><Users size={16}/></div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm font-bold mr-2">
              {convoDisplay.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-md font-semibold truncate">{isLoadingConvo ? "Loading Chat..." : convoDisplay.name}</h1>
        </header>

        {/* Messages Area */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
          {isLoadingMessages && messages.length === 0 && <p className="text-center text-gray-400">Loading messages...</p>}
          {error && <p className="text-center text-red-400">Error: {error}</p>}

          {cursor && !isLoadingMoreMessages && (
            <div className="text-center py-2">
                <button
                    onClick={() => fetchMessages(true)}
                    className="text-xs text-blue-400 hover:underline"
                    disabled={isLoadingMoreMessages}
                >
                    {isLoadingMoreMessages ? "Loading older..." : "Load older messages"}
                </button>
            </div>
          )}
          {isLoadingMoreMessages && <p className="text-center text-xs text-gray-400 py-2">Loading older messages...</p>}


          {messages.map((msg) => {
            // Check if msg is a DeletedMessageView or LogBeginConvo, skip for now or render placeholder
            if (msg.$type === 'chat.bsky.convo.defs#deletedMessageView' || msg.$type === 'chat.bsky.convo.defs#logView') {
                return <div key={msg.id || msg.rev} className="text-xs text-center text-gray-500 italic py-1">(Event: {msg.$type.split('#').pop()})</div>;
            }

            const isMe = msg.sender?.did === session?.did;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`} data-msg-id={msg.id}>
                <div className={`max-w-[70%] p-2.5 rounded-xl ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-100 rounded-bl-none'}`}>
                  {/* For group chats, show sender name if not me */}
                  {!isMe && convoDetails?.members && convoDetails.members.length > 2 && (
                    <p className="text-xs font-semibold mb-0.5 text-sky-300">
                        {convoDetails.members.find(m => m.did === msg.sender?.did)?.displayName || msg.sender?.did.slice(-6)}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-200/80' : 'text-gray-400/80'} text-right`}>
                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} /> {/* For auto-scrolling */}
        </div>
        {!chatId && !isLoadingMessages && !error && (
            <div className="flex-grow flex items-center justify-center text-gray-400">Select a chat to view messages.</div>
        )}
         {chatId && messages.length === 0 && !isLoadingMessages && !error && (
            <div className="flex-grow flex items-center justify-center text-gray-400">No messages in this chat yet.</div>
        )}


        {/* Message Input Area */}
        {chatId && (
          <div className="sticky bottom-0 bg-black border-t border-gray-700 p-3 flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400"><Paperclip size={20} /></button>
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow p-2.5 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              disabled={isSending}
            />
            {newMessageText ? (
                <button
                    onClick={handleSendMessage}
                    disabled={isSending || newMessageText.trim() === ''}
                    className="p-2.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50"
                >
                    <Send size={20} />
                </button>
            ) : (
                <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400"><Mic size={20} /></button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default IndividualChatPage;
