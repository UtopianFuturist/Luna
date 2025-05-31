"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout'; // Assuming AppLayout is in src/components

const availableWidgets = [
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
  // Total 29 widgets
];

const MAX_WIDGET_SLOTS = 8;

const WidgetBoardSettingsPage: React.FC = () => {
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>([]);
  const [widgetLayout, setWidgetLayout] = useState<(string | null)[]>(Array(MAX_WIDGET_SLOTS).fill(null));

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load selected widget IDs
      const storedSelectedIds = localStorage.getItem('userSelectedWidgets');
      let loadedSelectedIds: string[] = [];
      if (storedSelectedIds) {
        try {
          const parsedIds = JSON.parse(storedSelectedIds);
          if (Array.isArray(parsedIds)) {
            loadedSelectedIds = parsedIds;
            setSelectedWidgetIds(loadedSelectedIds);
          }
        } catch (error) {
          console.error("Error parsing selected widgets from localStorage:", error);
        }
      }

      // Load widget layout
      const storedLayout = localStorage.getItem('userWidgetLayout');
      if (storedLayout) {
        try {
          const parsedLayout = JSON.parse(storedLayout);
          // Basic validation: ensure it's an array and has the correct number of slots
          if (Array.isArray(parsedLayout) && parsedLayout.length === MAX_WIDGET_SLOTS) {
            setWidgetLayout(parsedLayout);
          } else {
            // If stored layout is invalid, initialize from loadedSelectedIds
            initializeLayoutFromSelected(loadedSelectedIds);
          }
        } catch (error) {
          console.error("Error parsing widget layout from localStorage:", error);
          initializeLayoutFromSelected(loadedSelectedIds); // Initialize on error
        }
      } else {
        // No layout found, initialize from loadedSelectedIds
        initializeLayoutFromSelected(loadedSelectedIds);
      }
    }
  }, []); // Empty dependency array: runs once on mount

  const initializeLayoutFromSelected = useCallback((currentSelectedIds: string[]) => {
    const initialLayout = Array(MAX_WIDGET_SLOTS).fill(null);
    let layoutIndex = 0;
    for (const id of currentSelectedIds) {
      if (layoutIndex < MAX_WIDGET_SLOTS) {
        initialLayout[layoutIndex++] = id;
      } else {
        break;
      }
    }
    setWidgetLayout(initialLayout);
  }, []);


  // Save data to localStorage whenever selectedWidgetIds or widgetLayout change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('userSelectedWidgets', JSON.stringify(selectedWidgetIds));
        localStorage.setItem('userWidgetLayout', JSON.stringify(widgetLayout));
      } catch (error) {
        console.error("Error saving data to localStorage:", error);
      }
    }
  }, [selectedWidgetIds, widgetLayout]);

  const handleWidgetSelection = (widgetId: string) => {
    // This function now also needs to update the layout if a widget is deselected
    setSelectedWidgetIds(prevSelected => {
      let newSelectedIds;
      if (prevSelected.includes(widgetId)) {
        newSelectedIds = prevSelected.filter(id => id !== widgetId);
        // If widget is deselected, remove it from layout
        setWidgetLayout(currentLayout => currentLayout.map(slotId => slotId === widgetId ? null : slotId));
        return newSelectedIds;
      } else {
        if (prevSelected.length < MAX_WIDGET_SLOTS) { // Max 8 selected to match layout slots
          newSelectedIds = [...prevSelected, widgetId];
          // Optionally, auto-add to first available slot in layout if behavior is desired
          // For now, user explicitly assigns via layout UI.
          return newSelectedIds;
        } else {
          alert(`You can select up to ${MAX_WIDGET_SLOTS} widgets to place on your board.`);
          return prevSelected;
        }
      }
    });
  };

  const handleLayoutChange = (slotIndex: number, newWidgetId: string | null) => {
    setWidgetLayout(currentLayout => {
      const newLayout = [...currentLayout];
      // If the widget is already in another slot, clear that other slot
      if (newWidgetId !== null) {
        for (let i = 0; i < newLayout.length; i++) {
          if (newLayout[i] === newWidgetId && i !== slotIndex) {
            newLayout[i] = null; // Clear old position
          }
        }
      }
      newLayout[slotIndex] = newWidgetId;
      return newLayout;
    });
  };

  const getWidgetNameById = (id: string | null) => {
    if (!id) return "Empty";
    return availableWidgets.find(w => w.id === id)?.name || "Unknown Widget";
  };

  // Widgets available for assignment (those in selectedWidgetIds)
  const assignableWidgets = availableWidgets.filter(widget => selectedWidgetIds.includes(widget.id));

  return (
    <AppLayout currentPage="Widget Settings" showSidebarButton={true}>
      <div className="p-4 text-white">
        <h1 className="text-2xl font-bold mb-4">Customize Your Widget Board</h1>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">1. Select Your Widgets ({selectedWidgetIds.length} / {MAX_WIDGET_SLOTS})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableWidgets.map(widget => (
              <label key={widget.id} className="flex items-center space-x-2 p-3 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  checked={selectedWidgetIds.includes(widget.id)}
                  onChange={() => handleWidgetSelection(widget.id)}
                />
                <span>{widget.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">2. Arrange Your Widgets</h2>
          {selectedWidgetIds.length === 0 ? (
            <p className="text-gray-400">Select some widgets above to arrange them here.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display 8 slots in two pages of 4x1 */}
              {[0, 1].map(page => (
                <div key={`page-${page}`} className="p-2">
                  <h3 className="text-lg font-medium mb-2">Page {page + 1}</h3>
                  {widgetLayout.slice(page * 4, (page + 1) * 4).map((slotWidgetId, indexInPage) => {
                    const slotIndex = page * 4 + indexInPage;
                    return (
                      <div key={slotIndex} className="flex items-center justify-between p-3 mb-2 bg-gray-700 rounded-md">
                        <span className="text-sm">
                          Slot {indexInPage + 1}: <span className="font-semibold">{getWidgetNameById(slotWidgetId)}</span>
                        </span>
                        <select
                          value={slotWidgetId || ""}
                          onChange={(e) => handleLayoutChange(slotIndex, e.target.value === "" ? null : e.target.value)}
                          className="bg-gray-600 text-white text-sm p-1 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Empty</option>
                          {assignableWidgets.map(widget => (
                            <option key={widget.id} value={widget.id}>
                              {widget.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
};

export default WidgetBoardSettingsPage;
    setSelectedWidgets(prevSelected => {
      if (prevSelected.includes(widgetId)) {
        return prevSelected.filter(id => id !== widgetId);
      } else {
        if (prevSelected.length < 8) {
          return [...prevSelected, widgetId];
        } else {
          alert("You can select up to 8 widgets.");
          return prevSelected;
        }
      }
    });
  };

  return (
    <AppLayout currentPage="Widget Settings" showSidebarButton={true}>
      <div className="p-4 text-white">
        <h1 className="text-2xl font-bold mb-4">Customize Your Widget Board</h1>

        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Select Widgets ({selectedWidgets.length} / 8)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableWidgets.map(widget => (
              <label key={widget.id} className="flex items-center space-x-2 p-3 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  checked={selectedWidgets.includes(widget.id)}
                  onChange={() => handleWidgetSelection(widget.id)}
                />
                <span>{widget.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Future UI for reordering/layout customization will go here */}
        {/* For example, a preview of the widget board */}
        {/* <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Selected Widgets Preview:</h2>
          <ul>
            {selectedWidgets.map(id => {
              const widget = availableWidgets.find(w => w.id === id);
              return <li key={id}>{widget?.name}</li>;
            })}
          </ul>
        </div> */}

      </div>
    </AppLayout>
  );
};

export default WidgetBoardSettingsPage;
