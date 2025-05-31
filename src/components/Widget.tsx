"use client";

import React, { useState, useEffect } from 'react';
import {
  Music, Users, Image as ImageIcon, Sun, BookOpen, UtensilsCrossed, HelpCircle,
  Github, Palette, MessageSquare, Send, CheckSquare, Trash2,
  BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, PlusCircle, LinkOff, Link as LinkIcon, Pin, HelpCircle as HelpCircleIcon,
  CalendarDays, TrendingUp, TrendingDown, Minus // Added new icons
} from 'lucide-react';

interface WidgetProps {
  instanceId: string;
  widgetId: string;
  widgetName: string;
}

const Widget: React.FC<WidgetProps> = ({ instanceId, widgetId, widgetName }) => {
  const renderWidgetContent = () => {
    // Hooks are called at the top level of the component for each specific widget case.
    // ESLint disable comments are used because these hooks are conditionally rendered based on widgetId.
    // This is a common pattern for dynamically rendering different components with their own state.

    switch (widgetId) {
      case 'moodStatus': {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [statusText, setStatusText] = useState("No status set");
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [moodEmoji, setMoodEmoji] = useState("🤔");
        const textKey = `widgetContent_statusText_${instanceId}`;
        const emojiKey = `widgetContent_moodEmoji_${instanceId}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (typeof window !== 'undefined') {
            const savedText = localStorage.getItem(textKey);
            const savedEmoji = localStorage.getItem(emojiKey);
            if (savedText !== null) setStatusText(savedText);
            else setStatusText("No status set"); // Default if nothing saved

            if (savedEmoji !== null) setMoodEmoji(savedEmoji);
            else setMoodEmoji("🤔"); // Default if nothing saved
          }
        }, [instanceId, textKey, emojiKey]); // instanceId in dep array

        return (
          <div className="text-center p-1">
            <span className="text-4xl block mb-1" role="img" aria-label="Mood emoji">{moodEmoji || '🤔'}</span>
            <p className="text-sm text-gray-300 break-words whitespace-pre-wrap">
              {statusText || "No status set"}
            </p>
          </div>
        );
      }
      case 'calendarEvents': { // Was 'upcomingEvents' in prompt, using 'calendarEvents' from list
        const events = [
          { title: "Team Meeting", dateTime: "Oct 26, 10:00 AM", location: "Conf Room 1" },
          { title: "Project Deadline", dateTime: "Oct 28, 5:00 PM", description: "Submit Phase 1 deliverables." },
          { title: "Lunch with Client", dateTime: "Nov 2, 12:30 PM", location: "The Cafe" },
        ];
        return (
          <div className="space-y-2 text-sm">
            {events.slice(0, 3).map((event, index) => (
              <div key={index} className="p-2 bg-gray-700/50 rounded-md">
                <div className="flex items-center text-gray-200 mb-0.5">
                  <CalendarDays size={14} className="mr-2 text-purple-400 flex-shrink-0" />
                  <p className="font-semibold truncate">{event.title}</p>
                </div>
                <p className="text-xs text-gray-400 ml-6">{event.dateTime}</p>
                {event.location && <p className="text-xs text-gray-400 ml-6 truncate">Location: {event.location}</p>}
                {event.description && <p className="text-xs text-gray-400 ml-6 truncate">{event.description}</p>}
              </div>
            ))}
          </div>
        );
      }
      case 'stockTicker': {
        const stocks = [
          { symbol: "AAPL", price: "$175.50", change: "+0.75 (0.43%)", trend: "up" },
          { symbol: "GOOGL", price: "$130.20", change: "-0.15 (0.11%)", trend: "down" },
          { symbol: "MSFT", price: "$330.00", change: "0.00 (0.00%)", trend: "flat" },
        ];
        return (
          <div className="space-y-1.5 text-sm">
            {stocks.map(stock => (
              <div key={stock.symbol} className="flex items-center justify-between p-1.5 bg-gray-700/50 rounded-md">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-200 w-14 truncate" title={stock.symbol}>{stock.symbol}</span>
                  {stock.trend === 'up' && <TrendingUp size={16} className="text-green-500 ml-1 mr-1 flex-shrink-0" />}
                  {stock.trend === 'down' && <TrendingDown size={16} className="text-red-500 ml-1 mr-1 flex-shrink-0" />}
                  {stock.trend === 'flat' && <Minus size={16} className="text-gray-500 ml-1 mr-1 flex-shrink-0" />}
                </div>
                <span className="text-gray-300 text-xs w-16 text-right">{stock.price}</span>
                <span className={`text-xs w-20 text-right ${
                  stock.trend === 'up' ? 'text-green-500' : stock.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {stock.change}
                </span>
              </div>
            ))}
          </div>
        );
      }
      case 'quoteOfTheDay': {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [quoteText, setQuoteText] = useState("No quote set.");
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [quoteAuthor, setQuoteAuthor] = useState("");
        const textKey = `widgetContent_quoteText_${instanceId}`;
        const authorKey = `widgetContent_quoteAuthor_${instanceId}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (typeof window !== 'undefined') {
            const savedText = localStorage.getItem(textKey);
            const savedAuthor = localStorage.getItem(authorKey);
            if (savedText !== null) setQuoteText(savedText);
            if (savedAuthor !== null) setQuoteAuthor(savedAuthor);
            // No saving from here, only loading or default. Setting is via external means.
          }
        }, [instanceId, textKey, authorKey]); // instanceId in dep array if needed for re-fetch on prop change

        return (
          <div>
            <blockquote className="text-lg italic text-gray-300">
              "{quoteText}"
            </blockquote>
            {quoteAuthor && <p className="text-right mt-2 text-gray-400">- {quoteAuthor}</p>}
          </div>
        );
      }
      case 'pinnedPostWidget':
        return (
          <div className="text-center p-4 text-gray-300">
            <Pin size={24} className="mx-auto mb-2 text-sky-400" />
            <h4 className="font-semibold text-white">My Pinned Post</h4>
            <p className="text-sm text-gray-400 mt-1">
              Content of the actual pinned post would appear here. This could be text, an image, or a link.
            </p>
          </div>
        );
      case 'quickLinks': {
        interface LinkItem { id: number; name: string; url: string; } // id can be string if Date.now().toString()
        const lsLinksKey = `widgetContent_quickLinks_links_${instanceId}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [linksToDisplay, setLinksToDisplay] = useState<LinkItem[]>([]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (typeof window !== 'undefined') {
            const savedLinks = localStorage.getItem(lsLinksKey);
            setLinksToDisplay(savedLinks ? JSON.parse(savedLinks) : []);
          }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [instanceId]); // Rerun if instanceId changes, lsLinksKey is derived

        if (linksToDisplay.length === 0) {
          return <p className="text-gray-400 text-xs italic text-center">No links configured. Set them in Widget Board settings.</p>;
        }

        return (
          <div className="flex flex-col h-full text-sm">
            <ul className="space-y-1 overflow-y-auto flex-grow" style={{maxHeight: '140px'}}> {/* Increased maxHeight for display-only */}
              {linksToDisplay.map(link => (
                <li key={link.id} className="p-1.5 bg-gray-700 rounded-md">
                  <a
                    href={link.url}
                    className="text-blue-400 hover:text-blue-300 hover:underline truncate flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.url}
                  >
                    <LinkIcon size={12} className="mr-1.5 text-gray-500 flex-shrink-0"/>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      }
      case 'currentlyListening':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
              <Music size={32} className="text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-200">Song Title - Artist Name</p>
              <p className="text-sm text-gray-400">Listening on: Spotify</p>
            </div>
          </div>
        );
      case 'personalPhotoGallery':
        const galleryImages = [
          "https://via.placeholder.com/200x150/4A5568/FFFFFF?text=Photo+1", // Dark Gray
          "https://via.placeholder.com/200x150/718096/FFFFFF?text=Photo+2", // Medium Gray
        ];
        return (
          <div className="w-full">
            <img
              src={galleryImages[0]}
              alt="Personal gallery photo 1"
              className="rounded-md w-full object-cover h-32 md:h-40" // Fixed height, object-cover
            />
            {/* Basic next/prev buttons could be added later here */}
            {/* <div className="flex justify-between mt-1">
              <button className="text-xs text-blue-400">Prev</button>
              <button className="text-xs text-blue-400">Next</button>
            </div> */}
          </div>
        );
      case 'topFriends':
        const friends = [
          { name: "Friend 1", avatarPlaceholder: "F1" },
          { name: "Friend 2", avatarPlaceholder: "F2" },
          { name: "Friend 3", avatarPlaceholder: "F3" },
        ];
        return (
          <div className="space-y-3">
            {friends.map(friend => (
              <div key={friend.name} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm text-gray-400">
                  {/* Using Users icon as a generic avatar placeholder, or initials */}
                  <Users size={20} />
                  {/* Alternatively, use friend.avatarPlaceholder for initials */}
                </div>
                <span className="text-gray-300">{friend.name}</span>
              </div>
            ))}
          </div>
        );
      case 'quickNotes':
        return <p className="text-gray-300">Quick Notes Widget Content Here</p>;
      case 'profileStats':
        return <p className="text-gray-300">Profile Stats Widget Content Here</p>;
      case 'latestPost':
        return <p className="text-gray-300">My Latest Post Widget Content Here</p>;
      case 'favoriteYouTubeVideo':
        return (
          <div className="aspect-video">
            <iframe
              className="w-full h-full rounded-md"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Example video
              title="Favorite YouTube Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
            ></iframe>
          </div>
        );
      case 'clockWidget':
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const timerId = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
          }, 1000);
          return () => clearInterval(timerId);
        }, []);

        return (
          <div className="text-center">
            <p className="text-3xl font-mono text-gray-100">{currentTime}</p>
          </div>
        );
      case 'weather': // Using existing 'weather' ID as discussed
        return (
          <div className="flex flex-col items-center text-center">
            <Sun size={48} className="text-yellow-400 mb-2" />
            <p className="text-xl font-semibold text-gray-200">San Francisco</p>
            <p className="text-3xl text-white">65°F</p>
            <p className="text-gray-300">Sunny</p>
          </div>
        );
      case 'stickyNote': {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [note, setNote] = useState('');
        const storageKey = `widgetContent_stickyNote_${instanceId}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (typeof window !== 'undefined') {
            const savedNote = localStorage.getItem(storageKey);
            if (savedNote !== null) { // Check for null explicitly
              setNote(savedNote);
            }
          }
        }, [instanceId, storageKey]); // instanceId added to dep array

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, note);
          }
        }, [note, storageKey]); // storageKey will change if instanceId changes

        return (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-full bg-yellow-200 text-yellow-900 p-2 rounded-md resize-none focus:ring-1 focus:ring-yellow-400 placeholder-yellow-700"
            placeholder="Write a note..."
            style={{ minHeight: '120px' }} // Ensure textarea has a decent default height
          />
        );
      }
      case 'countdownTimer': {
        const lsTitleKey = `widgetContent_countdownTitle_${instanceId}`;
        const lsTargetDateKey = `widgetContent_countdownTargetDate_${instanceId}`;
        const defaultTitle = "Countdown";
        const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16); // One week from now

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [title, setTitle] = useState(defaultTitle);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [targetDateStr, setTargetDateStr] = useState(defaultDate);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [timeLeft, setTimeLeft] = useState('');

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => { // Load data from localStorage
          if (typeof window !== 'undefined') {
            const savedTitle = localStorage.getItem(lsTitleKey);
            const savedTargetDate = localStorage.getItem(lsTargetDateKey);
            setTitle(savedTitle || defaultTitle);
            setTargetDateStr(savedTargetDate || defaultDate);
          }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [instanceId]); // Rerun if instanceId changes (e.g. widget replaced in same slot)

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => { // Calculate time left
          const calculateTimeLeft = () => {
            const difference = +new Date(targetDateStr) - +new Date();
            let newTimeLeft = '';

            if (difference > 0) {
              const days = Math.floor(difference / (1000 * 60 * 60 * 24));
              const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
              const minutes = Math.floor((difference / 1000 / 60) % 60);
              const seconds = Math.floor((difference / 1000) % 60);
              newTimeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            } else {
              newTimeLeft = "Countdown finished!";
            }
            setTimeLeft(newTimeLeft);
          };

          calculateTimeLeft(); // Initial calculation
          const timer = setInterval(calculateTimeLeft, 1000);
          return () => clearInterval(timer);
        }, [targetDateStr]);

        return (
          <div className="text-center p-2 space-y-2">
            <p className="text-md font-semibold text-gray-100 truncate" title={title}>{title}</p>
            <p className="text-2xl font-mono text-green-400">{timeLeft}</p>
          </div>
        );
      }
      case 'deviceBattery': {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean; error: string | null }>({
          level: 0,
          charging: false,
          error: 'Initializing...',
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          let batteryManager: any = null;
          let isMounted = true;

          const _updateBatteryStatus = (bm: any) => { // Renamed to avoid conflict
            if (isMounted) {
              setBatteryInfo({
                level: bm.level * 100,
                charging: bm.charging,
                error: null,
              });
            }
          };

          const _handleNotSupported = () => { // Renamed to avoid conflict
            if (isMounted) {
              setBatteryInfo({ level: 0, charging: false, error: 'Battery API not supported.' });
            }
          };

          if (typeof navigator.getBattery === 'function') {
            navigator.getBattery()
              .then(bm => {
                if (!isMounted) return;
                batteryManager = bm;
                _updateBatteryStatus(bm); // Use renamed function

                // Store bound functions to be able to remove them
                const chargingChangeHandler = () => _updateBatteryStatus(bm);
                const levelChangeHandler = () => _updateBatteryStatus(bm);

                bm.addEventListener('chargingchange', chargingChangeHandler);
                bm.addEventListener('levelchange', levelChangeHandler);

                batteryManager._cleanupListeners = () => {
                  bm.removeEventListener('chargingchange', chargingChangeHandler);
                  bm.removeEventListener('levelchange', levelChangeHandler);
                };
              })
              .catch(err => {
                if (isMounted) {
                  console.error("Error getting battery status:", err);
                  setBatteryInfo({ level: 0, charging: false, error: 'Battery status unavailable.' });
                }
              });
          } else {
            _handleNotSupported(); // Use renamed function
          }

          return () => {
            isMounted = false;
            if (batteryManager && batteryManager._cleanupListeners) {
              batteryManager._cleanupListeners();
            }
          };
        }, []); // Empty dependency array, runs once

        const renderBatteryIcon = () => {
          if (batteryInfo.error && batteryInfo.error !== 'Initializing...') return <BatteryWarning size={32} className="text-red-400" />;
          if (batteryInfo.charging) return <BatteryCharging size={32} className="text-green-400" />;
          if (batteryInfo.level > 80) return <BatteryFull size={32} className="text-green-400" />;
          if (batteryInfo.level > 40) return <BatteryMedium size={32} className="text-yellow-400" />;
          if (batteryInfo.level > 0) return <BatteryLow size={32} className="text-orange-500" />;
          if (batteryInfo.error === 'Initializing...') return <HelpCircleIcon size={32} className="text-gray-500"/>;
          return <BatteryWarning size={32} className="text-red-400" />;
        };

        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {renderBatteryIcon()}
            {batteryInfo.error && batteryInfo.error !== 'Initializing...' ? (
              <p className="mt-2 text-sm text-red-400">{batteryInfo.error}</p>
            ) : !batteryInfo.error ? (
              <>
                <p className="mt-1 text-2xl font-bold text-white">{Math.round(batteryInfo.level)}%</p>
                <p className="text-xs text-gray-400">{batteryInfo.charging ? 'Charging' : 'Not Charging'}</p>
              </>
            ) : null }
          </div>
        );
      }
      case 'guestbook': {
        interface GuestbookEntry { id: number; name: string; message: string; date: string; }
        const lsGuestbookKey = `widgetContent_guestbook_entries_${instanceId}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [entries, setEntries] = useState<GuestbookEntry[]>(() => {
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(lsGuestbookKey);
            return saved ? JSON.parse(saved) : [];
          }
          return [];
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [guestName, setGuestName] = useState('');
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [guestMessage, setGuestMessage] = useState('');

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          localStorage.setItem(lsGuestbookKey, JSON.stringify(entries));
        }, [entries, lsGuestbookKey]);

        const handleAddEntry = () => {
          if (guestName.trim() === '' || guestMessage.trim() === '') return;
          const newEntry = {
            id: Date.now(),
            name: guestName,
            message: guestMessage,
            date: new Date().toLocaleDateString()
          };
          setEntries([...entries, newEntry]);
          setGuestName('');
          setGuestMessage('');
        };

        return (
          <div className="flex flex-col h-full text-sm">
            <div className="space-y-2 mb-2">
              <input
                type="text"
                placeholder="Your Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full p-1.5 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500"
              />
              <textarea
                placeholder="Leave a message..."
                value={guestMessage}
                onChange={(e) => setGuestMessage(e.target.value)}
                rows={2}
                className="w-full p-1.5 bg-gray-700 text-white rounded-md resize-none focus:ring-1 focus:ring-blue-500"
              />
              <button onClick={handleAddEntry} className="w-full bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 flex items-center justify-center space-x-1">
                <Send size={14}/>
                <span>Add Message</span>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-1.5" style={{maxHeight: '80px'}}>
              {entries.length === 0 && <p className="text-gray-400 text-xs italic">No messages yet.</p>}
              {entries.slice().reverse().map(entry => ( // Show newest first
                <div key={entry.id} className="p-1.5 bg-gray-700 rounded-md">
                  <p className="text-gray-300 break-words">"{entry.message}"</p>
                  <p className="text-xs text-gray-500 text-right mt-0.5">- {entry.name} on {entry.date}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'miniPoll': {
        interface PollOption { id: string; text: string; votes: number; }
        const pollQuestion = "Favorite Season?"; // This could be made configurable too
        const pollQuestionIdentifier = pollQuestion.replace(/\s/g, '');
        const lsPollOptionsKey = `widgetContent_miniPoll_options_${instanceId}_${pollQuestionIdentifier}`;
        const lsPollVotedKey = `widgetContent_miniPoll_voted_${instanceId}_${pollQuestionIdentifier}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [options, setOptions] = useState<PollOption[]>(() => {
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(lsPollOptionsKey);
            if (saved) return JSON.parse(saved);
          }
          return [
            { id: 'spring', text: 'Spring', votes: 0 },
            { id: 'summer', text: 'Summer', votes: 0 },
            { id: 'autumn', text: 'Autumn', votes: 0 },
            { id: 'winter', text: 'Winter', votes: 0 },
          ];
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [hasVoted, setHasVoted] = useState(() => {
          if (typeof window !== 'undefined') {
            return localStorage.getItem(lsPollVotedKey) === 'true';
          }
          return false;
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          localStorage.setItem(lsPollOptionsKey, JSON.stringify(options));
        }, [options, lsPollOptionsKey]);

        const handleVote = (optionId: string) => {
          if (hasVoted) return;
          setOptions(options.map(opt => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt));
          setHasVoted(true);
          localStorage.setItem(lsPollVotedKey, 'true');
        };

        return (
          <div className="text-sm">
            <p className="font-semibold text-gray-200 mb-2">{pollQuestion}</p>
            <div className="space-y-1.5">
              {options.map(option => (
                <div key={option.id} className="flex items-center justify-between">
                  <span className="text-gray-300">{option.text} ({option.votes})</span>
                  <button
                    onClick={() => handleVote(option.id)}
                    disabled={hasVoted}
                    className={`px-2 py-0.5 text-xs rounded-md flex items-center space-x-1 ${hasVoted ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                  >
                    <CheckSquare size={12}/>
                    <span>Vote</span>
                  </button>
                </div>
              ))}
            </div>
            {hasVoted && <p className="text-xs text-amber-400 mt-2 text-center">Thanks for voting!</p>}
          </div>
        );
      }
      case 'githubProjectShowcase': {
        const projects = [
          { name: "My Awesome Project", description: "A brief description of this cool project.", url: "#github1", stars: 123, forks: 45 },
          { name: "Another Cool Repo", description: "Solving real-world problems with code.", url: "#github2", stars: 67, forks: 12 },
        ];
        return (
          <div className="space-y-3">
            {projects.map(proj => (
              <div key={proj.name} className="p-2 bg-gray-700 rounded-md">
                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold text-sm flex items-center space-x-1">
                  <Github size={14}/>
                  <span>{proj.name}</span>
                </a>
                <p className="text-xs text-gray-300 mt-0.5 mb-1">{proj.description}</p>
                <div className="flex space-x-2 text-xs text-gray-400">
                  <span>⭐ {proj.stars}</span>
                  <span> Forks: {proj.forks}</span>
                </div>
              </div>
            ))}
          </div>
        );
      }
      case 'artGallerySnippet': {
        const artworks = [
          { title: "Sunset Dreams", artist: "My Username", imageUrl: "https://via.placeholder.com/100x80/FF6B6B/FFFFFF?text=Art+1", artUrl: "#art1" },
          { title: "Abstract Blues", artist: "My Username", imageUrl: "https://via.placeholder.com/100x80/4ECDC4/FFFFFF?text=Art+2", artUrl: "#art2" },
        ];
        return (
          <div className="grid grid-cols-2 gap-2">
            {artworks.map(art => (
              <div key={art.title} className="text-xs">
                <a href={art.artUrl} target="_blank" rel="noopener noreferrer">
                  <img src={art.imageUrl} alt={art.title} className="w-full h-16 object-cover rounded-md mb-0.5"/>
                </a>
                <a href={art.artUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline block truncate">{art.title}</a>
                <p className="text-gray-400 truncate">by {art.artist}</p>
              </div>
            ))}
          </div>
        );
      }
      case 'simpleTodoList': {
        interface TodoItem { id: number; text: string; completed: boolean; }
        const lsTodoKey = `widgetContent_todoItems_${instanceId}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [todos, setTodos] = useState<TodoItem[]>(() => {
          if (typeof window !== 'undefined') {
            const savedTodos = localStorage.getItem(lsTodoKey);
            return savedTodos ? JSON.parse(savedTodos) : [];
          }
          return [];
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [newTodoText, setNewTodoText] = useState('');

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          localStorage.setItem(lsTodoKey, JSON.stringify(todos));
        }, [todos, lsTodoKey]);

        const handleAddTodo = () => {
          if (newTodoText.trim() === '') return;
          setTodos([...todos, { id: Date.now(), text: newTodoText, completed: false }]);
          setNewTodoText('');
        };

        const toggleComplete = (id: number) => {
          setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
        };

        const deleteTodo = (id: number) => {
          setTodos(todos.filter(todo => todo.id !== id));
        };

        return (
          <div className="flex flex-col h-full">
            <div className="flex mb-2">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a new task..."
                className="flex-grow p-1.5 bg-gray-700 text-white rounded-l-md text-sm focus:ring-1 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <button onClick={handleAddTodo} className="bg-blue-500 text-white px-3 py-1.5 rounded-r-md text-sm hover:bg-blue-600">Add</button>
            </div>
            <ul className="space-y-1.5 overflow-y-auto flex-grow" style={{maxHeight: '100px'}}> {/* Max height for scroll */}
              {todos.map(todo => (
                <li key={todo.id} className={`flex items-center justify-between p-1.5 rounded-md text-sm ${todo.completed ? 'bg-green-800' : 'bg-gray-600'}`}>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(todo.id)} className="form-checkbox text-green-500 bg-gray-700 border-gray-500 rounded"/>
                    <span className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>{todo.text}</span>
                  </label>
                  <button onClick={() => deleteTodo(todo.id)} className="text-red-500 hover:text-red-400 text-xs">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        );
      }
      case 'digitalBookshelf': {
        const books = [
          { title: "The Great Gatsby", author: "F. Scott Fitzgerald", coverPlaceholderText: "TG" },
          { title: "1984", author: "George Orwell", coverPlaceholderText: "84" },
          { title: "To Kill a Mockingbird", author: "Harper Lee", coverPlaceholderText: "TK" },
        ];
        return (
          <div className="space-y-3">
            {books.slice(0,2).map(book => ( // Show 2 books for space
              <div key={book.title} className="flex items-center space-x-2">
                <div className="w-10 h-14 bg-indigo-700 rounded flex items-center justify-center text-white text-xs font-bold">
                  {book.coverPlaceholderText}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">{book.title}</p>
                  <p className="text-xs text-gray-400">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }
      case 'recipeOfTheDay': {
        return (
          <div className="space-y-2 text-gray-300">
            <div className="flex items-center space-x-2 text-amber-400">
              <UtensilsCrossed size={20} />
              <h4 className="text-md font-semibold">Simple Pasta Delight</h4>
            </div>
            <p className="text-xs italic">A quick and delicious pasta dish for any night of the week.</p>
            <p className="text-xs font-medium mt-1">Key Ingredients:</p>
            <ul className="list-disc list-inside text-xs space-y-0.5">
              <li>Spaghetti or Penne</li>
              <li>Tomato Sauce (canned or homemade)</li>
              <li>Parmesan Cheese</li>
              <li>Garlic & Onion (optional)</li>
            </ul>
          </div>
        );
      }
      case 'askMeAnythingBox': {
        return (
          <div className="space-y-2">
            <textarea
              readOnly
              placeholder="Ask something... (Submissions currently disabled)"
              className="w-full h-20 p-2 bg-gray-700 text-gray-400 rounded-md resize-none text-sm placeholder-gray-500"
            />
            <button
              disabled
              className="w-full px-3 py-1.5 bg-blue-700 text-blue-300 rounded-md text-sm cursor-not-allowed"
            >
              Submit Question
            </button>
          </div>
        );
      }
      // Keep existing cases for other widgets...
      // Add more cases as actual widget implementations are developed
      default:
        return <p className="text-red-400">Unknown Widget Type: {widgetId}</p>;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-md flex flex-col h-full">
      {/* Widget Title Bar */}
      <div className="bg-gray-750 px-4 py-2 border-b border-gray-700 rounded-t-lg">
        <h3 className="text-md font-semibold text-white truncate">{widgetName}</h3>
        {/* Potentially add controls like close, edit, drag handle here */}
      </div>

      {/* Widget Content Area */}
      <div className="p-4 flex-grow overflow-y-auto">
        {renderWidgetContent()}
      </div>
    </div>
  );
};

export default Widget;
