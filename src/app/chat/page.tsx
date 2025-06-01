"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { listConvos, ConvoView, ConvosPage } from '@/lib/bskyService';
import { MessageSquarePlus, Users, BellOff, Bell } from 'lucide-react';

const ChatListPage: React.FC = () => {
  const { agent, isAuthenticated, session } = useAuth();
  const [convos, setConvos] = useState<ConvoView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const fetchConvos = useCallback(async (loadMore = false) => {
    if (!agent || !isAuthenticated) {
      if (!isAuthenticated) setError("Please log in to view chats.");
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    if (!loadMore) {
      setIsLoading(true);
      setConvos([]);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    const currentCursor = loadMore ? cursor : undefined;

    try {
      const data: ConvosPage = await listConvos(agent, currentCursor, 30);
      setConvos(prev => loadMore ? [...prev, ...data.convos] : data.convos);
      setCursor(data.cursor);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err instanceof Error ? err.message : "Unknown error fetching conversations.");
    } finally {
      if (!loadMore) setIsLoading(false);
      else setIsLoadingMore(false);
    }
  }, [agent, cursor, isAuthenticated]);

  useEffect(() => {
    if (agent && isAuthenticated) {
      fetchConvos();
    } else {
      setIsLoading(false);
      setConvos([]);
      setCursor(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, isAuthenticated]);


  const getConvoDisplayDetails = (convo: ConvoView, currentUserDid: string | undefined) => {
    const otherMembers = convo.members.filter(member => member.did !== currentUserDid);

    if (otherMembers.length === 0) { // Should not happen in typical DMs, maybe a convo with self?
      return { name: "Self Chat", avatar: session?.avatar || null, isGroup: false };
    }
    if (otherMembers.length === 1) {
      return {
        name: otherMembers[0].displayName || otherMembers[0].handle,
        avatar: otherMembers[0].avatar || null,
        isGroup: false
      };
    }
    // Group chat
    return {
      name: otherMembers.map(m => m.displayName || m.handle).slice(0, 3).join(', ') + (otherMembers.length > 3 ? '...' : ''),
      avatar: null, // Placeholder for group avatar
      isGroup: true
    };
  };

  const renderConvoItem = (convo: ConvoView) => {
    const displayDetails = getConvoDisplayDetails(convo, session?.did);
    let lastMessageText = "No messages yet";
    let lastMessageDate: Date | null = null;

    if (convo.lastMessage && 'text' in convo.lastMessage && typeof convo.lastMessage.text === 'string') {
        lastMessageText = convo.lastMessage.text;
        if ('sentAt' in convo.lastMessage && typeof convo.lastMessage.sentAt === 'string') {
            lastMessageDate = new Date(convo.lastMessage.sentAt);
        }
    } else if (convo.lastMessage && 'deletedMessageView' in convo.lastMessage) { // Example if lastMessage is a union type
        lastMessageText = "[Message deleted]";
    }


    return (
      <Link href={`/chat/${convo.id}`} key={convo.id} legacyBehavior>
        <a className="flex items-center p-3 hover:bg-gray-800/70 transition-colors border-b border-gray-700/50">
          <div className="flex-shrink-0 mr-3">
            {displayDetails.avatar ? (
              <Image src={displayDetails.avatar} alt={displayDetails.name || "avatar"} width={48} height={48} className="rounded-full bg-gray-600" />
            ) : displayDetails.isGroup ? (
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                <Users size={24} className="text-gray-400"/>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xl font-bold">
                {displayDetails.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-100 truncate">{displayDetails.name}</h3>
              {lastMessageDate && <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{lastMessageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">{lastMessageText}</p>
          </div>
          <div className="flex flex-col items-end ml-2 space-y-1">
            {convo.unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
                {convo.unreadCount}
              </span>
            )}
            {convo.muted && (
              <BellOff size={14} className="text-gray-500" title="Muted"/>
            )}
             {!convo.muted && convo.unreadCount === 0 && ( // Placeholder for read but not muted, if needed
                <div className="w-2 h-2"></div> // Ensures consistent height
            )}
          </div>
        </a>
      </Link>
    );
  };

  return (
    <AppLayout currentPage="Chat" showHeader={true} showSidebarButton={true}>
      <div className="text-white h-full flex flex-col">
        <div className="p-3 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Messages</h1>
          <button className="p-2 rounded-full hover:bg-gray-700" title="New Chat">
            <MessageSquarePlus size={20} />
          </button>
        </div>

        {isLoading && convos.length === 0 && <div className="p-4 text-center flex-grow flex items-center justify-center">Loading conversations...</div>}
        {error && <div className="p-4 text-red-400 text-center flex-grow flex items-center justify-center">Error: {error}</div>}

        {convos.length === 0 && !isLoading && !error && (
          <div className="p-4 text-center text-gray-400 flex-grow flex items-center justify-center">
            You have no conversations yet.
          </div>
        )}

        <div className="flex-grow overflow-y-auto">
          {convos.map(convo => renderConvoItem(convo))}
        </div>

        {cursor && !isLoadingMore && convos.length > 0 && (
          <div className="p-4 flex justify-center border-t border-gray-700/50">
            <button
              onClick={() => fetchConvos(true)}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Conversations'}
            </button>
          </div>
        )}
        {isLoadingMore && <div className="p-4 text-center">Loading more...</div>}
        {!cursor && convos.length > 0 && !isLoading && !isLoadingMore && (
            <div className="p-4 text-center text-xs text-gray-500">End of conversations.</div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChatListPage;
