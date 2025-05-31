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
];

const MAX_WIDGET_SLOTS_TOTAL = 8; // Total slots in the layout
const WIDGETS_PER_PAGE = 4; // Slots per page view (2x2 grid)

const ProfilePage: React.FC = () => {
  const [currentWidgetLayout, setCurrentWidgetLayout] = useState<(string | null)[]>(Array(MAX_WIDGET_SLOTS_TOTAL).fill(null));
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Placeholder for actual pinned post data and logic - this is specific to the profile page
  const pinnedPostPlaceholder = {
    id: 'pinnedPost', // Special ID for the pinned post slot
    name: 'Pinned Post',
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let loadedLayout = Array(MAX_WIDGET_SLOTS_TOTAL).fill(null);
      const storedLayout = localStorage.getItem('userWidgetLayout');

      if (storedLayout) {
        try {
          const parsedLayout = JSON.parse(storedLayout);
          if (Array.isArray(parsedLayout) && parsedLayout.length === MAX_WIDGET_SLOTS_TOTAL) {
            loadedLayout = parsedLayout;
          } else {
            console.warn("Stored widget layout is invalid. Initializing with defaults.");
            // Fallback to default initialization if stored layout is malformed
            initializeDefaultLayout(loadedLayout);
          }
        } catch (error) {
          console.error("Error parsing widget layout from localStorage:", error);
          initializeDefaultLayout(loadedLayout); // Initialize on error
        }
      } else {
        // No layout found, try to build one from selected widgets (if any) or set to default
        initializeDefaultLayout(loadedLayout);
      }
      setCurrentWidgetLayout(loadedLayout);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Helper to initialize layout if none is found or if it's invalid
  const initializeDefaultLayout = (layoutArray: (string | null)[]) => {
    // This function could try to populate from 'userSelectedWidgets' if that's desired
    // For now, it just ensures the pinned post slot is conceptually there.
    // The actual pinned post is rendered separately, not via Widget component for slot 0.
    // So, layout[0] might represent the first *configurable* widget slot if pinned post is fixed.
    // For this iteration, assuming layout[0] is for pinned post, then layout[1-7] are for other widgets.
    // However, the prompt implies layout[0] is for pinned post content on page 1,
    // and then layout[1-3] are other widgets on page 1.
    // Page 2 uses layout[4-7].
    // The `userWidgetLayout` from settings page does not include a pinned post slot.
    // So, we adapt. The `currentWidgetLayout` here will be shifted for display.
    // Let's assume the loaded layout from 'userWidgetLayout' is for the 8 *configurable* slots.
    // Pinned post will be handled as a special case on page 1.
    // This means the `currentWidgetLayout` here should match the structure of `userWidgetLayout`.
    const storedSelectedIds = localStorage.getItem('userSelectedWidgets');
    if (storedSelectedIds) {
        try {
            const parsedIds: string[] = JSON.parse(storedSelectedIds);
            if (Array.isArray(parsedIds)) {
                for (let i = 0; i < parsedIds.length && i < MAX_WIDGET_SLOTS_TOTAL; i++) {
                    layoutArray[i] = parsedIds[i];
                }
            }
        } catch (e) { console.error("Could not initialize layout from selected widgets", e); }
    }
    // `layoutArray` is modified in place or a new one is returned and set
  };

  const getWidgetDataById = (id: string | null): { id: string; name: string } | null => {
    if (!id) return null;
    const widget = availableWidgetsList.find(w => w.id === id);
    return widget || null;
  };

  // Returns data for the 3 or 4 configurable slots on the current page
  const getWidgetDataForPageSlots = (): ({ id: string; name: string } | null)[] => {
    if (currentPage === 1) {
      // Page 1 has 3 configurable slots after the Pinned Post
      return [
        getWidgetDataById(currentWidgetLayout[0]), // Corresponds to grid cell 2
        getWidgetDataById(currentWidgetLayout[1]), // Corresponds to grid cell 3
        getWidgetDataById(currentWidgetLayout[2]), // Corresponds to grid cell 4
      ];
    } else { // currentPage === 2
      // Page 2 has 4 configurable slots
      return [
        getWidgetDataById(currentWidgetLayout[3]), // Corresponds to grid cell 1
        getWidgetDataById(currentWidgetLayout[4]), // Corresponds to grid cell 2
        getWidgetDataById(currentWidgetLayout[5]), // Corresponds to grid cell 3
        getWidgetDataById(currentWidgetLayout[6]), // Corresponds to grid cell 4
      ];
    }
  };

  const widgetDataForSlots = getWidgetDataForPageSlots();

  const handleNextPage = () => {
    if (currentPage === 1) {
      setCurrentPage(2);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage === 2) {
      setCurrentPage(1);
    }
  };

  // Determine if Next Page button should be shown
  const showNextPageButton = currentPage === 1 && currentWidgetLayout.slice(3, 7).some(id => id !== null);
  // Determine if Previous Page button should be shown
  const showPreviousPageButton = currentPage === 2;


  return (
    <AppLayout currentPage="Profile" showSidebarButton={true}>
      <div className="p-4 text-white">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">My Widget Board - Page {currentPage}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[320px]"> {/* min-h to prevent layout jump */}
            {Array.from({ length: WIDGETS_PER_PAGE }).map((_, cellIndex) => {
              if (currentPage === 1 && cellIndex === 0) {
                // First cell on Page 1 is always Pinned Post
                return (
                  <div key="pinned-post" className="bg-gray-800 p-4 rounded-lg shadow min-h-[150px] flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg font-semibold mb-2">{pinnedPostPlaceholder.name}</h3>
                    <p><em>Display pinned post here.</em></p>
                  </div>
                );
              }

              // Determine the actual widget data for this cell
              let widgetToRenderData: { id: string; name: string } | null = null;
              if (currentPage === 1) {
                // For Page 1, cellIndex 1, 2, 3 map to widgetDataForSlots[0], [1], [2]
                widgetToRenderData = widgetDataForSlots[cellIndex -1];
              } else { // currentPage === 2
                // For Page 2, cellIndex 0, 1, 2, 3 map to widgetDataForSlots[0], [1], [2], [3]
                widgetToRenderData = widgetDataForSlots[cellIndex];
              }

              if (widgetToRenderData) {
                return <Widget key={widgetToRenderData.id + '-' + cellIndex} widgetId={widgetToRenderData.id} widgetName={widgetToRenderData.name} />;
              } else {
                return (
                  <div key={`empty-${cellIndex}`} className="bg-gray-700 p-4 rounded-lg shadow min-h-[150px] flex justify-center items-center">
                    <p className="text-gray-400">Empty Widget Slot</p>
                  </div>
                );
              }
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
