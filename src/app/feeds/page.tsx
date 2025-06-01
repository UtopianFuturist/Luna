"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout'; // Assuming AppLayout is in src/components

const FeedPageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const feedUri = searchParams.get('uri');
  const decodedUri = feedUri ? decodeURIComponent(feedUri) : null;

  // Attempt to get a displayable name from the URI, very basic for now
  let pageTitle = "Feed Viewer";
  if (decodedUri) {
    try {
      const parts = decodedUri.split('/');
      const namePart = parts[parts.length -1];
      const collectionPart = parts[parts.length -2];
      if (collectionPart === 'feed') { // e.g. at://did:plc:xxx/app.bsky.feed.generator/feed-name
         pageTitle = namePart || `Feed`;
      } else {
        pageTitle = decodedUri.substring(0, 40) + "..."; // Fallback for other URIs
      }
    } catch {
      pageTitle = "Feed";
    }
  }


  return (
    <AppLayout currentPage={pageTitle} showHeader={true} showSidebarButton={true}>
      <div className="p-4 text-white">
        <h1 className="text-xl font-bold mb-4">
          Feed: {decodedUri ? <span className="text-sky-400">{decodedUri}</span> : "No URI"}
        </h1>

        {decodedUri ? (
          <div>
            <p className="text-gray-300">Displaying content for feed (URI decoded):</p>
            <p className="text-sm text-gray-400 break-all">{decodedUri}</p>
            <div className="mt-6 p-6 bg-gray-800 rounded-lg">
              <p className="text-center text-gray-500">
                Feed content will be fetched and displayed here in a future update.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-red-400">No feed URI specified in the URL.</p>
        )}
      </div>
    </AppLayout>
  );
};

export default FeedPageClient;
