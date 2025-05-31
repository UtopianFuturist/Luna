"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout'; // Assuming AppLayout is in src/components
import Widget from '@/components/Widget'; // Import the Widget component

// Define available widgets (should match the one in settings page for consistency)
const availableWidgetsList = [
  { id: 'currentlyListening', name: 'Currently Listening To' },
  { id: 'profileStats', name: 'Profile Stats' },
  { id: 'quickLinks', name: 'Quick Links' },
  { id: 'latestPost', name: 'My Latest Post' },
  { id: 'notes', name: 'Quick Notes' },
  { id: 'moodStatus', name: 'Mood/Status' },
  { id: 'quoteOfTheDay', name: 'Quote of the Day' },
  { id: 'trendingTopics', name: 'Trending Topics' },
  { id: 'photoOfTheDay', name: 'Photo of the Day' },
  { id: 'personalPhotoGallery', name: 'Personal Photo Gallery' },
  { id: 'topFriends', name: 'Top Friends' },
  { id: 'calendarEvents', name: 'Upcoming Events' },
  { id: 'stockTicker', name: 'Stock Ticker' },
  { id: 'weather', name: 'Weather Forecast' },
  { id: 'newsFeed', name: 'News Feed' },
  { id: 'bookmarks', name: 'My Bookmarks' },
  { id: 'favoriteYouTubeVideo', name: 'Favorite YouTube Video' },
  { id: 'clockWidget', name: 'Clock' },
  { id: 'stickyNote', name: 'Sticky Note' },
  { id: 'countdownTimer', name: 'Countdown Timer' },
  { id: 'simpleTodoList', name: 'Simple To-Do List' },
  { id: 'digitalBookshelf', name: 'Digital Bookshelf' },
  { id: 'recipeOfTheDay', name: 'Recipe of the Day' },
  { id: 'askMeAnythingBox', name: 'Ask Me Anything Box' },
  { id: 'guestbook', name: 'Guestbook' },
  { id: 'miniPoll', name: 'Mini Poll' },
  { id: 'githubProjectShowcase', name: 'GitHub Projects' },
  { id: 'artGallerySnippet', name: 'Art Gallery Snippet' },
  { id: 'deviceBattery', name: 'Device Battery' },
  { id: 'pinnedPostWidget', name: 'Pinned Post' },
];

interface ConfiguredWidget {
  instanceId: string;
  widgetId: string;
  page: 1 | 2;
  row: 0 | 1;
  col: 0 | 1;
  size: '1x1' | '1x2' | '2x1' | '2x2';
}

const ProfilePage: React.FC = () => {
  const [configuredWidgetsFromStorage, setConfiguredWidgetsFromStorage] = useState<ConfiguredWidget[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLayout = localStorage.getItem('userConfiguredWidgetsLayout_v2');
      if (savedLayout) {
        try {
          const parsedLayout = JSON.parse(savedLayout);
          if (Array.isArray(parsedLayout)) { // Add more validation as needed
            setConfiguredWidgetsFromStorage(parsedLayout);
          } else {
            setConfiguredWidgetsFromStorage([]); // Initialize if invalid
          }
        } catch (error) {
          console.error("Error parsing configured widget layout from localStorage:", error);
          setConfiguredWidgetsFromStorage([]); // Initialize on error
        }
      } else {
        setConfiguredWidgetsFromStorage([]); // Initialize if not found
      }
    }
  }, []);

  const getWidgetDataById = (id: string | null): { id: string; name: string } | null => {
    if (!id) return null;
    const widget = availableWidgetsList.find(w => w.id === id);
    return widget || null;
  };

  const handleNextPage = () => {
    if (currentPage === 1 && configuredWidgetsFromStorage.some(w => w.page === 2)) {
      setCurrentPage(2);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage === 2) {
      setCurrentPage(1);
    }
  };

  const widgetsForCurrentPage = configuredWidgetsFromStorage.filter(w => w.page === currentPage);

  const showNextPageButton = currentPage === 1 && configuredWidgetsFromStorage.some(w => w.page === 2);
  const showPreviousPageButton = currentPage === 2;

  return (
    <AppLayout currentPage="Profile" showSidebarButton={true}>
      <div className="p-4 text-white">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">My Widget Board - Page {currentPage}</h2>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 min-h-[calc(2*160px+1rem)]"> {/* Ensure consistent height */}
            {widgetsForCurrentPage.length === 0 && (
              <div className="col-span-2 row-span-2 flex items-center justify-center text-gray-500">
                <p>No widgets configured for this page. Go to settings to add some!</p>
              </div>
            )}
            {widgetsForCurrentPage.map((widgetConfig) => {
              const widgetDetails = getWidgetDataById(widgetConfig.widgetId);
              if (!widgetDetails) {
                return (
                  <div key={widgetConfig.instanceId} className="bg-red-500 p-2 rounded-md flex items-center justify-center text-xs col-start-1 row-start-1 col-span-1 row-span-1"> {/* Default small size for error */}
                    Error: Widget ID '{widgetConfig.widgetId}' not found.
                  </div>
                );
              }

              const colSpan = widgetConfig.size.endsWith('2') ? '2' : '1';
              const rowSpan = widgetConfig.size.startsWith('2') ? '2' : '1';

              const gridPlacementClass = `
                col-start-${widgetConfig.col + 1}
                row-start-${widgetConfig.row + 1}
                col-span-${colSpan}
                row-span-${rowSpan}
              `;

              return (
                <div key={widgetConfig.instanceId} className={`${gridPlacementClass} bg-gray-800 rounded-lg shadow-md flex flex-col overflow-hidden`}> {/* Added overflow-hidden */}
                  <Widget instanceId={widgetConfig.instanceId} widgetId={widgetDetails.id} widgetName={widgetDetails.name} />
                </div>
              );
            })}
          </div>
          {/* Pagination Controls */}
          <div className="mt-6 flex justify-center items-center space-x-4">
            {showPreviousPageButton && (
              <button onClick={handlePreviousPage} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md">
                Previous Page
              </button>
            )}
            {showNextPageButton && (
              <button onClick={handleNextPage} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md">
                Next Page
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
