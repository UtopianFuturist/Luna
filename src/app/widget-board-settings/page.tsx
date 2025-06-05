"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/src/components/AppLayout';
import Modal from '@/components/Modal'; // Import the Modal component

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
  { id: 'pinnedPostWidget', name: 'Pinned Post' },
  { id: 'virtualPet', name: 'Virtual Pet' },
  { id: 'recentBlogPosts', name: 'Recent Blog Posts' },
  { id: 'favoriteMedia', name: 'Favorite Movies/Shows' },
  // Total 33 widgets
];

// const MAX_WIDGET_SLOTS = 8; // No longer directly used, layout drives this.

interface ConfiguredWidget {
  instanceId: string; // Unique ID for this instance of a widget
  widgetId: string;   // ID of the widget type from availableWidgets
  page: 1 | 2;
  row: 0 | 1;
  col: 0 | 1;
  size: '1x1' | '1x2' | '2x1' | '2x2';
}

const WidgetBoardSettingsPage: React.FC = () => {
  const [configuredWidgets, setConfiguredWidgets] = useState<ConfiguredWidget[]>([]);
  const [editingWidget, setEditingWidget] = useState<ConfiguredWidget | null>(null); // For layout editing

  // State for content editing modal
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContentWidget, setEditingContentWidget] = useState<ConfiguredWidget | null>(null);

  // State for the quote form within the modal
  const [currentQuoteText, setCurrentQuoteText] = useState('');
  const [currentQuoteAuthor, setCurrentQuoteAuthor] = useState('');

  // State for the mood/status form within the modal
  const [currentStatusText, setCurrentStatusText] = useState('');
  const [currentMoodEmoji, setCurrentMoodEmoji] = useState('');

  // State for the countdown timer form within the modal
  const [currentCountdownTitle, setCurrentCountdownTitle] = useState('');
  const [currentCountdownTargetDate, setCurrentCountdownTargetDate] = useState('');

  // State for the Quick Links form within the modal
  interface QuickLinkModalItem { id: string; name: string; url: string; }
  const [currentQuickLinksList, setCurrentQuickLinksList] = useState<QuickLinkModalItem[]>([]);
  const [newQuickLinkName, setNewQuickLinkName] = useState('');
  const [newQuickLinkUrl, setNewQuickLinkUrl] = useState('');

  // State for the Sticky Note form within the modal
  const [currentStickyNoteContent, setCurrentStickyNoteContent] = useState('');

  // State for the Simple To-Do List form within the modal
  interface TodoItemModal { id: number; text: string; completed: boolean; }
  const [currentTodoItemsList, setCurrentTodoItemsList] = useState<TodoItemModal[]>([]);
  const [newTodoItemText, setNewTodoItemText] = useState('');


  // Load and Save configuredWidgets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userConfiguredWidgetsLayout_v2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) { // Add more validation if needed
            setConfiguredWidgets(parsed);
          }
        } catch (e) {
          console.error("Error parsing configured widgets from localStorage", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userConfiguredWidgetsLayout_v2', JSON.stringify(configuredWidgets));
    }
  }, [configuredWidgets]);

  const getWidgetNameById = (id: string | null): string => {
    if (!id) return "N/A";
    return availableWidgets.find(w => w.id === id)?.name || "Unknown Widget";
  };

  const isValidPlacement = (widgets: ConfiguredWidget[], newWidget: ConfiguredWidget, existingInstanceIdToExclude?: string): boolean => {
    if (newWidget.row < 0 || newWidget.row > 1 || newWidget.col < 0 || newWidget.col > 1) return false;

    const [sizeRows, sizeCols] = newWidget.size.split('x').map(Number);
    if (newWidget.row + sizeRows > 2 || newWidget.col + sizeCols > 2) return false; // Exceeds 2x2 page grid

    // Check for overlaps
    for (const w of widgets) {
      if (w.instanceId === existingInstanceIdToExclude || w.page !== newWidget.page) continue;

      const [wRows, wCols] = w.size.split('x').map(Number);
      // Check for intersection of rectangles
      if (
        newWidget.col < w.col + wCols &&
        newWidget.col + sizeCols > w.col &&
        newWidget.row < w.row + wRows &&
        newWidget.row + sizeRows > w.row
      ) {
        return false; // Overlap detected
      }
    }
    return true;
  };

  const findFirstAvailableSlot = (page: 1 | 2, sizeToFit: ConfiguredWidget['size'] = '1x1'): { page: 1 | 2, row: 0 | 1, col: 0 | 1 } | null => {
    const [sRows, sCols] = sizeToFit.split('x').map(Number);
    for (let r = 0; r <= 2 - sRows; r++) {
      for (let c = 0; c <= 2 - sCols; c++) {
        const testWidget: ConfiguredWidget = { instanceId: 'test', widgetId: 'test', page, row: r as 0|1, col: c as 0|1, size: sizeToFit };
        if (isValidPlacement(configuredWidgets, testWidget)) {
          return { page, row: r as 0|1, col: c as 0|1 };
        }
      }
    }
    return null; // No slot found on this page
  };


  const handleAddWidgetToBoard = (widgetId: string) => {
    if (configuredWidgets.length >= 8 && !configuredWidgets.find(w => w.widgetId === 'pinnedPostWidget' && widgetId === 'pinnedPostWidget')) {
        // A bit complex: allow adding pinnedPostWidget even if 8 widgets, if it's not already there.
        // But generally limit to 8 configurable widgets.
        // For now, let's simplify: if adding pinnedPostWidget, check if it exists. If other, check count.
        if (widgetId === 'pinnedPostWidget' && configuredWidgets.find(w => w.widgetId === 'pinnedPostWidget')) {
            alert("Pinned post widget can only be added once.");
            return;
        } else if (widgetId !== 'pinnedPostWidget' && configuredWidgets.filter(w => w.widgetId !== 'pinnedPostWidget').length >= 7 && !configuredWidgets.find(w => w.widgetId === 'pinnedPostWidget')) {
             alert("Max 7 configurable widgets if Pinned Post is not used, or if Pinned Post is used it takes up space making it effectively 1 of the 8 slots.");
             return;
        } else if (widgetId !== 'pinnedPostWidget' && configuredWidgets.length >=8) {
            alert("Maximum 8 widgets (including pinned post) can be configured.");
            return;
        }
    }


    let slot = findFirstAvailableSlot(1);
    let targetPage: 1 | 2 = 1;
    if (!slot) {
      slot = findFirstAvailableSlot(2);
      if (slot) targetPage = 2;
    }

    if (slot) {
      const newWidget: ConfiguredWidget = {
        instanceId: Date.now().toString(),
        widgetId,
        page: targetPage,
        row: slot.row,
        col: slot.col,
        size: '1x1', // Default size
      };
      if (isValidPlacement(configuredWidgets, newWidget)) {
        setConfiguredWidgets([...configuredWidgets, newWidget]);
      } else {
        alert("Could not find a valid empty slot for this widget. Try adjusting other widgets.");
      }
    } else {
      alert("No available slots on either page for a 1x1 widget.");
    }
  };

  const handleUpdateWidgetConfig = (instanceId: string, newConfig: Partial<ConfiguredWidget>) => {
    setConfiguredWidgets(prev => prev.map(w => {
      if (w.instanceId === instanceId) {
        const updatedWidget = { ...w, ...newConfig };
        // Validate before committing update
        if (isValidPlacement(prev.filter(conf => conf.instanceId !== instanceId), updatedWidget, instanceId)) {
          return updatedWidget;
        } else {
          alert(`Invalid placement for ${getWidgetNameById(updatedWidget.widgetId)}. Overlaps or out of bounds.`);
          return w; // Revert to old if invalid
        }
      }
      return w;
    }));
    if (editingWidget?.instanceId === instanceId) setEditingWidget(null); // Close edit form on update
  };

  const handleRemoveWidget = (instanceId: string) => {
    setConfiguredWidgets(prev => prev.filter(w => w.instanceId !== instanceId));
    if (editingWidget?.instanceId === instanceId) setEditingWidget(null);
  };


  // UI for editing a specific widget instance
  const renderEditForm = (widget: ConfiguredWidget) => {
    if (!editingWidget || editingWidget.instanceId !== widget.instanceId) return null;

    const currentWidgetDetails = { ...editingWidget }; // Work on a copy

    const updateProperty = (prop: keyof ConfiguredWidget, value: any) => {
        setEditingWidget(prev => prev ? ({...prev, [prop]: value}) : null);
    };

    return (
        <div className="mt-2 p-3 bg-gray-600 rounded-md space-y-2 text-xs">
            <div>
                <label className="block">Page:</label>
                <select value={currentWidgetDetails.page} onChange={e => updateProperty('page', parseInt(e.target.value) as 1|2)} className="bg-gray-500 p-1 rounded w-full">
                    <option value="1">Page 1</option>
                    <option value="2">Page 2</option>
                </select>
            </div>
            <div>
                <label className="block">Row (0-1):</label>
                <select value={currentWidgetDetails.row} onChange={e => updateProperty('row', parseInt(e.target.value) as 0|1)} className="bg-gray-500 p-1 rounded w-full">
                    <option value="0">0 (Top)</option>
                    <option value="1">1 (Bottom)</option>
                </select>
            </div>
            <div>
                <label className="block">Col (0-1):</label>
                <select value={currentWidgetDetails.col} onChange={e => updateProperty('col', parseInt(e.target.value) as 0|1)} className="bg-gray-500 p-1 rounded w-full">
                    <option value="0">0 (Left)</option>
                    <option value="1">1 (Right)</option>
                </select>
            </div>
            <div>
                <label className="block">Size:</label>
                <select value={currentWidgetDetails.size} onChange={e => updateProperty('size', e.target.value as ConfiguredWidget['size'])} className="bg-gray-500 p-1 rounded w-full">
                    <option value="1x1">1x1</option>
                    <option value="1x2">1x2 (Wide)</option>
                    <option value="2x1">2x1 (Tall)</option>
                    <option value="2x2">2x2 (Large)</option>
                </select>
            </div>
            <div className="flex space-x-2">
                <button onClick={() => handleUpdateWidgetConfig(editingWidget.instanceId, currentWidgetDetails)} className="bg-green-500 hover:bg-green-600 px-2 py-1 rounded">Save Changes</button>
                <button onClick={() => setEditingWidget(null)} className="bg-gray-400 hover:bg-gray-500 px-2 py-1 rounded">Cancel</button>
            </div>
        </div>
    );
  };


  return (
    <AppLayout currentPage="Widget Settings" showSidebarButton={true}>
      <div className="p-4 text-white space-y-6">
        <h1 className="text-2xl font-bold">Customize Your Widget Board</h1>

        {/* Section 1: Add New Widgets */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">1. Add Widgets to Your Board</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableWidgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => handleAddWidgetToBoard(widget.id)}
                className="p-3 bg-blue-600 hover:bg-blue-500 rounded-md text-sm text-left"
                title={`Add ${widget.name} to board`}
              >
                {widget.name}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Configure Added Widgets */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">2. Configured Widgets ({configuredWidgets.length})</h2>
          {configuredWidgets.length === 0 ? (
            <p className="text-gray-400">No widgets configured yet. Add some from the list above.</p>
          ) : (
            <div className="space-y-3">
              {configuredWidgets.map(cw => (
                <div key={cw.instanceId} className="p-3 bg-gray-700 rounded-md text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold">{getWidgetNameById(cw.widgetId)}</span>
                      <span className="text-xs text-gray-400 ml-2">(Page {cw.page}, R{cw.row}C{cw.col}, Size {cw.size})</span>
                    </div>
                    <div className="space-x-2">
                       <button onClick={() => setEditingWidget(cw)} className="text-xs bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded">Edit Layout</button>
                       {cw.widgetId === 'quoteOfTheDay' && (
                         <button
                           onClick={() => {
                             setEditingContentWidget(cw);
                             const textKey = `widgetContent_quoteText_${cw.instanceId}`;
                             const authorKey = `widgetContent_quoteAuthor_${cw.instanceId}`;
                             setCurrentQuoteText(localStorage.getItem(textKey) || '');
                             setCurrentQuoteAuthor(localStorage.getItem(authorKey) || '');
                             setIsContentModalOpen(true);
                           }}
                           className="text-xs bg-purple-500 hover:bg-purple-600 px-2 py-1 rounded ml-1"
                         >
                           Set Quote
                         </button>
                       )}
                       {cw.widgetId === 'moodStatus' && (
                        <button
                          onClick={() => {
                            setEditingContentWidget(cw);
                            const textKey = `widgetContent_statusText_${cw.instanceId}`;
                            const emojiKey = `widgetContent_moodEmoji_${cw.instanceId}`;
                            setCurrentStatusText(localStorage.getItem(textKey) || '');
                            setCurrentMoodEmoji(localStorage.getItem(emojiKey) || '🤔'); // Default emoji
                            setIsContentModalOpen(true);
                          }}
                          className="text-xs bg-teal-500 hover:bg-teal-600 px-2 py-1 rounded ml-1"
                        >
                          Set Mood
                        </button>
                       )}
                       {cw.widgetId === 'countdownTimer' && (
                        <button
                          onClick={() => {
                            setEditingContentWidget(cw);
                            const titleKey = `widgetContent_countdownTitle_${cw.instanceId}`;
                            const dateKey = `widgetContent_countdownTargetDate_${cw.instanceId}`;
                            setCurrentCountdownTitle(localStorage.getItem(titleKey) || 'My Countdown');
                            setCurrentCountdownTargetDate(localStorage.getItem(dateKey) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)); // Default to one week from now
                            setIsContentModalOpen(true);
                          }}
                          className="text-xs bg-cyan-500 hover:bg-cyan-600 px-2 py-1 rounded ml-1"
                        >
                          Set Timer
                        </button>
                       )}
                       {cw.widgetId === 'quickLinks' && (
                        <button
                          onClick={() => {
                            setEditingContentWidget(cw);
                            const linksKey = `widgetContent_quickLinks_links_${cw.instanceId}`;
                            const savedLinks = localStorage.getItem(linksKey);
                            setCurrentQuickLinksList(savedLinks ? JSON.parse(savedLinks) : []);
                            setNewQuickLinkName('');
                            setNewQuickLinkUrl('');
                            setIsContentModalOpen(true);
                          }}
                          className="text-xs bg-lime-500 hover:bg-lime-600 px-2 py-1 rounded ml-1"
                        >
                          Manage Links
                        </button>
                       )}
                       {cw.widgetId === 'stickyNote' && (
                        <button
                          onClick={() => {
                            setEditingContentWidget(cw);
                            const noteKey = `widgetContent_stickyNote_${cw.instanceId}`;
                            setCurrentStickyNoteContent(localStorage.getItem(noteKey) || '');
                            setIsContentModalOpen(true);
                          }}
                          className="text-xs bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded ml-1" // Different color for differentiation
                        >
                          Edit Note
                        </button>
                       )}
                       {cw.widgetId === 'simpleTodoList' && (
                        <button
                          onClick={() => {
                            setEditingContentWidget(cw);
                            const todoKey = `widgetContent_todoItems_${cw.instanceId}`;
                            const savedTodos = localStorage.getItem(todoKey);
                            setCurrentTodoItemsList(savedTodos ? JSON.parse(savedTodos) : []);
                            setNewTodoItemText('');
                            setIsContentModalOpen(true);
                          }}
                          className="text-xs bg-indigo-500 hover:bg-indigo-600 px-2 py-1 rounded ml-1"
                        >
                          Manage Tasks
                        </button>
                       )}
                       <button onClick={() => handleRemoveWidget(cw.instanceId)} className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded ml-1">Remove</button>
                    </div>
                  </div>
                  {renderEditForm(cw)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Visual Preview */}
        {[1, 2].map(pageNumber => (
          <div key={`preview-page-${pageNumber}`} className="p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Page {pageNumber} Preview</h2>
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-64 bg-gray-900 p-2 rounded relative"> {/* Fixed height for preview */}
              {configuredWidgets.filter(w => w.page === pageNumber).map(widgetConfig => {
                const [sizeRows, sizeCols] = widgetConfig.size.split('x').map(Number);
                const gridPlacementClass = `
                  col-start-${widgetConfig.col + 1}
                  row-start-${widgetConfig.row + 1}
                  col-span-${sizeCols}
                  row-span-${sizeRows}
                `;
                return (
                  <div
                    key={`preview-${widgetConfig.instanceId}`}
                    className={`${gridPlacementClass} bg-indigo-600/50 border-2 border-indigo-400 rounded-md flex items-center justify-center p-1 text-xs text-center overflow-hidden`}
                  >
                    {getWidgetNameById(widgetConfig.widgetId)} <br/> ({widgetConfig.size}) @ R{widgetConfig.row}C{widgetConfig.col}
                  </div>
                );
              })}
               {/* Overlay with slot numbers for clarity if needed */}
              {Array.from({length:4}).map((_, idx) => (
                <div key={`slotguide-${pageNumber}-${idx}`} className={`col-start-${(idx%2)+1} row-start-${Math.floor(idx/2)+1} border border-dashed border-gray-700 text-gray-700 text-xs flex items-center justify-center pointer-events-none`}>
                    R{Math.floor(idx/2)}C{idx%2}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Modal for Editing Quote of the Day Content */}
        {editingContentWidget && editingContentWidget.widgetId === 'quoteOfTheDay' && (
          <Modal
            isOpen={isContentModalOpen}
            onClose={() => {
              setIsContentModalOpen(false);
              setEditingContentWidget(null);
              // Clear form fields on close
              setCurrentQuoteText('');
              setCurrentQuoteAuthor('');
            }}
            title={`Set Content for: ${getWidgetNameById(editingContentWidget.widgetId)}`}
          >
            {/* ... existing forms ... */}
            {editingContentWidget.widgetId === 'quoteOfTheDay' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="quoteTextModal" className="block text-sm font-medium text-gray-300 mb-1">Quote Text:</label>
                  <textarea id="quoteTextModal" value={currentQuoteText} onChange={(e) => setCurrentQuoteText(e.target.value)} rows={3} className="w-full p-2 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500" placeholder="Enter the quote"/>
                </div>
                <div>
                  <label htmlFor="quoteAuthorModal" className="block text-sm font-medium text-gray-300 mb-1">Author:</label>
                  <input type="text" id="quoteAuthorModal" value={currentQuoteAuthor} onChange={(e) => setCurrentQuoteAuthor(e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500" placeholder="Enter the author's name"/>
                </div>
                <button onClick={() => { if (editingContentWidget) { localStorage.setItem(`widgetContent_quoteText_${editingContentWidget.instanceId}`, currentQuoteText); localStorage.setItem(`widgetContent_quoteAuthor_${editingContentWidget.instanceId}`, currentQuoteAuthor); alert("Quote saved!"); setIsContentModalOpen(false); setEditingContentWidget(null); } }} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold">Save Quote</button>
              </div>
            )}

            {editingContentWidget.widgetId === 'moodStatus' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="statusTextModal" className="block text-sm font-medium text-gray-300 mb-1">Status Text:</label>
                  <input type="text" id="statusTextModal" value={currentStatusText} onChange={(e) => setCurrentStatusText(e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500" placeholder="How are you feeling?"/>
                </div>
                <div>
                  <label htmlFor="moodEmojiModal" className="block text-sm font-medium text-gray-300 mb-1">Mood Emoji:</label>
                  <input type="text" id="moodEmojiModal" value={currentMoodEmoji} onChange={(e) => setCurrentMoodEmoji(e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500" placeholder="Enter an emoji (e.g., 😊)" maxLength={5} />
                </div>
                <button onClick={() => { if (editingContentWidget) { localStorage.setItem(`widgetContent_statusText_${editingContentWidget.instanceId}`, currentStatusText); localStorage.setItem(`widgetContent_moodEmoji_${editingContentWidget.instanceId}`, currentMoodEmoji); alert("Mood/Status saved!"); setIsContentModalOpen(false); setEditingContentWidget(null); } }} className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-semibold">Save Mood/Status</button>
              </div>
            )}

            {editingContentWidget.widgetId === 'countdownTimer' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="countdownTitleModal" className="block text-sm font-medium text-gray-300 mb-1">Countdown Title:</label>
                  <input type="text" id="countdownTitleModal" value={currentCountdownTitle} onChange={(e) => setCurrentCountdownTitle(e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500" placeholder="e.g., New Year's Eve"/>
                </div>
                <div>
                  <label htmlFor="countdownTargetDateModal" className="block text-sm font-medium text-gray-300 mb-1">Target Date & Time:</label>
                  <input type="datetime-local" id="countdownTargetDateModal" value={currentCountdownTargetDate} onChange={(e) => setCurrentCountdownTargetDate(e.target.value)} className="w-full p-2 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500"/>
                </div>
                <button onClick={() => { if (editingContentWidget) { localStorage.setItem(`widgetContent_countdownTitle_${editingContentWidget.instanceId}`, currentCountdownTitle); localStorage.setItem(`widgetContent_countdownTargetDate_${editingContentWidget.instanceId}`, currentCountdownTargetDate); alert("Timer saved!"); setIsContentModalOpen(false); setEditingContentWidget(null); } }} className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-semibold">Save Timer</button>
              </div>
            )}

            {editingContentWidget.widgetId === 'quickLinks' && (
              <div className="space-y-3 text-sm">
                {/* ... Quick Links form ... */}
                <div className="space-y-1">
                  <label htmlFor="newLinkNameModal" className="block text-xs font-medium text-gray-300">Link Name:</label>
                  <input type="text" id="newLinkNameModal" value={newQuickLinkName} onChange={(e) => setNewQuickLinkName(e.target.value)} placeholder="e.g., My Portfolio" className="w-full p-1.5 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500"/>
                </div>
                <div className="space-y-1">
                  <label htmlFor="newLinkUrlModal" className="block text-xs font-medium text-gray-300">Link URL:</label>
                  <input type="url" id="newLinkUrlModal" value={newQuickLinkUrl} onChange={(e) => setNewQuickLinkUrl(e.target.value)} placeholder="https://example.com" className="w-full p-1.5 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500"/>
                </div>
                <button onClick={() => { if (newQuickLinkName.trim() && newQuickLinkUrl.trim()) { if (!newQuickLinkUrl.startsWith('http://') && !newQuickLinkUrl.startsWith('https://')) { alert('URL must start with http:// or https://'); return; } setCurrentQuickLinksList(prev => [...prev, {id: Date.now().toString(), name: newQuickLinkName, url: newQuickLinkUrl}]); setNewQuickLinkName(''); setNewQuickLinkUrl(''); } else { alert('Please fill name and URL.'); } }} className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-xs flex items-center justify-center"> Add New Link </button>
                <hr className="border-gray-600 my-2"/>
                <h4 className="text-xs font-medium text-gray-400 mb-1">Current Links:</h4>
                {currentQuickLinksList.length === 0 ? <p className="text-xs text-gray-500 italic">No links added yet.</p> : ( <ul className="space-y-1 max-h-32 overflow-y-auto"> {currentQuickLinksList.map(link => ( <li key={link.id} className="flex items-center justify-between p-1 bg-gray-600 rounded-md"> <span className="truncate text-gray-300" title={`${link.name} (${link.url})`}>{link.name}</span> <button onClick={() => setCurrentQuickLinksList(prev => prev.filter(l => l.id !== link.id))} className="text-red-500 hover:text-red-400 p-0.5 text-xs">Delete</button> </li> ))} </ul> )}
                <button onClick={() => { if (editingContentWidget) { localStorage.setItem(`widgetContent_quickLinks_links_${editingContentWidget.instanceId}`, JSON.stringify(currentQuickLinksList)); alert("Links saved!"); setIsContentModalOpen(false); setEditingContentWidget(null); } }} className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold">Save All Links</button>
              </div>
            )}

            {editingContentWidget.widgetId === 'stickyNote' && (
              <div className="space-y-4">
                {/* ... Sticky Note form ... */}
                <div>
                  <label htmlFor="stickyNoteContentModal" className="block text-sm font-medium text-gray-300 mb-1">Note Content:</label>
                  <textarea id="stickyNoteContentModal" value={currentStickyNoteContent} onChange={(e) => setCurrentStickyNoteContent(e.target.value)} rows={5} className="w-full p-2 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500" placeholder="Enter your note..."/>
                </div>
                <button onClick={() => { if (editingContentWidget) { localStorage.setItem(`widgetContent_stickyNote_${editingContentWidget.instanceId}`, currentStickyNoteContent); alert("Note saved!"); setIsContentModalOpen(false); setEditingContentWidget(null); } }} className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md font-semibold">Save Note</button>
              </div>
            )}

            {/* Content for Simple To-Do List */}
            {editingContentWidget.widgetId === 'simpleTodoList' && (
              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <label htmlFor="newTodoItemTextModal" className="block text-xs font-medium text-gray-300">New Task:</label>
                  <input type="text" id="newTodoItemTextModal" value={newTodoItemText} onChange={(e) => setNewTodoItemText(e.target.value)} placeholder="Enter task description" className="w-full p-1.5 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500"/>
                </div>
                <button
                  onClick={() => {
                    if (newTodoItemText.trim()) {
                      setCurrentTodoItemsList(prev => [...prev, {id: Date.now(), text: newTodoItemText, completed: false}]);
                      setNewTodoItemText('');
                    } else {
                      alert('Please enter task text.');
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-xs flex items-center justify-center"
                >
                  Add Task
                </button>
                <hr className="border-gray-600 my-2"/>
                <h4 className="text-xs font-medium text-gray-400 mb-1">Current Tasks:</h4>
                {currentTodoItemsList.length === 0 ? <p className="text-xs text-gray-500 italic">No tasks yet.</p> : (
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {currentTodoItemsList.map(item => (
                      <li key={item.id} className="flex items-center justify-between p-1 bg-gray-600 rounded-md">
                        <span className={`truncate text-gray-300 ${item.completed ? 'line-through' : ''}`} title={item.text}>{item.text}</span>
                        <button onClick={() => setCurrentTodoItemsList(prev => prev.filter(t => t.id !== item.id))} className="text-red-500 hover:text-red-400 p-0.5 text-xs">Delete</button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => {
                    if (editingContentWidget) {
                      const todoKey = `widgetContent_todoItems_${editingContentWidget.instanceId}`;
                      localStorage.setItem(todoKey, JSON.stringify(currentTodoItemsList));
                      alert("Task list updated!");
                      setIsContentModalOpen(false);
                      setEditingContentWidget(null);
                    }
                  }}
                  className="w-full mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-semibold"
                >
                  Save Task List
                </button>
              </div>
            )}
          </Modal>
        )}
      </div>
    </AppLayout>
    </AppLayout>
    </AppLayout>
    </AppLayout>
    </AppLayout>
  );
};

export default WidgetBoardSettingsPage;
