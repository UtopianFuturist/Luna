"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { listNotifications, updateSeen, Notification, NotificationsPage } from '@/lib/bskyService';
import { Heart, Repeat2, UserPlus, MessageCircle, AtSign, Quote, AlertCircle, CheckCircle } from 'lucide-react'; // Added AlertCircle, CheckCircle
import Image from 'next/image'; // For author avatars

const NotificationsPageClient: React.FC = () => {
  const { agent, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isMarkingSeen, setIsMarkingSeen] = useState<boolean>(false);
  const [seenStatus, setSeenStatus] = useState<string | null>(null); // For feedback on updateSeen

  const fetchNotifications = useCallback(async (loadMore = false) => {
    if (!agent || !isAuthenticated) {
      if (!isAuthenticated) setError("Please log in to view notifications.");
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    if (!loadMore) {
      setIsLoading(true);
      setNotifications([]); // Clear on fresh load
    } else {
      setIsLoadingMore(true);
    }
    setError(null);
    const currentCursor = loadMore ? cursor : undefined;

    try {
      const data: NotificationsPage = await listNotifications(agent, currentCursor, 30);
      setNotifications(prev => loadMore ? [...prev, ...data.notifications] : data.notifications);
      setCursor(data.cursor);

      // After fetching, if it's an initial load and there are notifications, mark them as seen.
      // This is a simplified approach. A more robust solution might only call updateSeen if there are *unread* notifications.
      if (!loadMore && data.notifications.length > 0) {
        // Check if there are any unread notifications before marking all as seen
        const hasUnread = data.notifications.some(n => !n.isRead);
        if (hasUnread) {
            setIsMarkingSeen(true);
            setSeenStatus("Marking notifications as seen...");
            try {
                await updateSeen(agent);
                setSeenStatus("Notifications marked as seen.");
                // Optimistically update isRead status on currently loaded notifications
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (seenError) {
                console.error("Error marking notifications seen:", seenError);
                setSeenStatus("Failed to mark notifications as seen.");
            } finally {
                setIsMarkingSeen(false);
                // Clear seen status message after a delay
                setTimeout(() => setSeenStatus(null), 3000);
            }
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err instanceof Error ? err.message : "Unknown error fetching notifications.");
    } finally {
      if (!loadMore) setIsLoading(false);
      else setIsLoadingMore(false);
    }
  }, [agent, cursor, isAuthenticated]);

  useEffect(() => {
    if (agent && isAuthenticated) {
      fetchNotifications();
    } else {
        setIsLoading(false); // Not authenticated, not loading
        setNotifications([]); // Clear notifications if logged out
        setCursor(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, isAuthenticated]); // fetchNotifications is not in deps to control it manually via Load More

  const getNotificationIcon = (reason: string) => {
    switch (reason) {
      case 'like': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'repost': return <Repeat2 className="w-5 h-5 text-green-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'reply': return <MessageCircle className="w-5 h-5 text-sky-500" />;
      case 'quote': return <Quote className="w-5 h-5 text-purple-500" />;
      case 'mention': return <AtSign className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActionText = (notification: Notification): string => {
    switch (notification.reason) {
      case 'like': return "liked your post";
      case 'repost': return "reposted your post";
      case 'follow': return "followed you";
      case 'reply': return "replied to your post";
      case 'quote': return "quoted your post";
      case 'mention': return "mentioned you in a post";
      default: return `triggered a notification: ${notification.reason}`;
    }
  };

  const getSubjectLink = (notification: Notification): string | null => {
    if (notification.reasonSubject) {
        // e.g. at://did:plc:userdid/app.bsky.feed.post/recordid
        const parts = notification.reasonSubject.split('/');
        if (parts.length >= 3) {
            const handleOrDid = parts[2]; // This is the DID of the subject's author
            const recordType = parts[3];
            const rkey = parts[4];
            // This logic might need to be more robust based on URI structures
            if (recordType === 'app.bsky.feed.post' && rkey) {
                 // To link to a post, we usually need the author's handle for a prettier URL.
                 // Notification author is `notification.author`
                 // If the subject is a post by someone else, we don't have their handle directly here.
                 // For simplicity, we'll link to the generic post viewer if we can construct it.
                 // A better link would involve fetching the post author's handle.
                 // For now, this is a placeholder or needs improvement.
                return `/profile/${handleOrDid}/post/${rkey}`; // This might be incorrect if handleOrDid is not the author of reasonSubject
            }
        }
    } else if (notification.reason === 'follow') {
        return `/profile/${notification.author.handle}`;
    }
    // If the record itself is a post (e.g. for mentions, replies, quotes)
    if (notification.record && (notification.record as any).$type === 'app.bsky.feed.post') {
        return `/profile/${notification.author.handle}/post/${notification.uri.split('/').pop()}`;
    }
    return null;
  }

  const renderNotificationItem = (notification: Notification) => {
    const subjectLink = getSubjectLink(notification);
    let postTextSnippet = null;
    if (notification.record && (notification.record as any).text) {
        postTextSnippet = (notification.record as any).text.substring(0, 100) + ((notification.record as any).text.length > 100 ? '...' : '');
    }


    return (
      <div key={notification.uri} className={`p-4 flex space-x-3 items-start ${!notification.isRead ? 'bg-blue-900/20' : 'hover:bg-gray-800/50'} transition-colors`}>
        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.reason)}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {notification.author.avatar && <Image src={notification.author.avatar} alt={notification.author.handle} width={24} height={24} className="rounded-full" />}
            <Link href={`/profile/${notification.author.handle}`} legacyBehavior>
              <a className="font-semibold text-gray-100 hover:underline">{notification.author.displayName || `@${notification.author.handle}`}</a>
            </Link>
          </div>
          <p className="text-sm text-gray-300">
            {getActionText(notification)}
            {subjectLink ? (
                <Link href={subjectLink} legacyBehavior><a className="text-blue-400 hover:underline ml-1">(view context)</a></Link>
            ) : notification.reasonSubject ? (
                <span className="text-gray-500 ml-1">(context: {notification.reasonSubject.split('/').pop()})</span>
            ) : null}
          </p>
          {postTextSnippet && (
            <p className="text-xs text-gray-400 mt-1 p-2 bg-gray-700/30 rounded-md border border-gray-600/50">
              {postTextSnippet}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">{new Date(notification.indexedAt).toLocaleString()}</p>
        </div>
        {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full self-center" title="Unread"></div>}
      </div>
    );
  };

  return (
    <AppLayout currentPage="Notifications" showHeader={true} showSidebarButton={true}>
      <div className="text-white">
        <div className="p-3 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg font-semibold">Notifications</h1>
          {seenStatus && (
            <span className={`text-xs px-2 py-1 rounded-md ${isMarkingSeen ? 'text-yellow-300 bg-yellow-700/50' : 'text-green-300 bg-green-700/50'}`}>
              {isMarkingSeen ? <AlertCircle className="inline w-3 h-3 mr-1"/> : <CheckCircle className="inline w-3 h-3 mr-1"/>}
              {seenStatus}
            </span>
          )}
        </div>

        {isLoading && notifications.length === 0 && <div className="p-4 text-center">Loading notifications...</div>}
        {error && <div className="p-4 text-red-400 text-center">Error: {error}</div>}

        {notifications.length === 0 && !isLoading && !error && (
          <div className="p-4 text-center text-gray-400">You have no notifications yet.</div>
        )}

        <div className="divide-y divide-gray-700/50">
          {notifications.map(item => renderNotificationItem(item))}
        </div>

        {cursor && !isLoadingMore && notifications.length > 0 && (
          <div className="p-4 flex justify-center">
            <button
              onClick={() => fetchNotifications(true)}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading...' : 'Load More Notifications'}
            </button>
          </div>
        )}
        {isLoadingMore && <div className="p-4 text-center">Loading more...</div>}
        {!cursor && notifications.length > 0 && !isLoading && !isLoadingMore && (
            <div className="p-4 text-center text-gray-500">End of notifications.</div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsPageClient;
