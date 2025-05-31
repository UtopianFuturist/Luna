"use client";

import React, { useState, useEffect } from 'react';
import {
  Music, Users, Image as ImageIcon, Sun, BookOpen, UtensilsCrossed, HelpCircle,
  Github, Palette, MessageSquare, Send, CheckSquare, Trash2,
  BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, PlusCircle, Link as LinkIcon
} from 'lucide-react';

interface WidgetProps {
  widgetId: string;
  widgetName: string;
  // Potentially add other common props like onRemove, onEdit, etc. later
}

const Widget: React.FC<WidgetProps> = ({ widgetId, widgetName }) => {
  const renderWidgetContent = () => {
    switch (widgetId) {
      case 'moodStatus':
        return (
          <div className="text-center">
            <span className="text-4xl" role="img" aria-label="Happy face">😊</span>
            <p className="mt-2 text-gray-300">Feeling great today!</p>
          </div>
        );
      case 'quoteOfTheDay':
        return (
          <div>
            <blockquote className="text-lg italic text-gray-300">
              "The only way to do great work is to love what you do."
            </blockquote>
            <p className="text-right mt-2 text-gray-400">- Steve Jobs</p>
          </div>
        );
      case 'quickLinks': { // Renamed from linkHub to match availableWidgetsList ID
        interface LinkItem { id: number; name: string; url: string; }
        const lsLinksKey = `widget_quickLinks_links_${widgetId}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [userLinks, setUserLinks] = useState<LinkItem[]>(() => {
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(lsLinksKey);
            return saved ? JSON.parse(saved) : [];
          }
          return [];
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [newLinkName, setNewLinkName] = useState('');
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [newLinkUrl, setNewLinkUrl] = useState('');

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          localStorage.setItem(lsLinksKey, JSON.stringify(userLinks));
        }, [userLinks, lsLinksKey]);

        const handleAddLink = () => {
          if (newLinkName.trim() === '' || newLinkUrl.trim() === '') return;
          // Basic URL validation (starts with http/https)
          if (!newLinkUrl.startsWith('http://') && !newLinkUrl.startsWith('https://')) {
            alert('Please enter a valid URL (starting with http:// or https://)');
            return;
          }
          setUserLinks([...userLinks, { id: Date.now(), name: newLinkName, url: newLinkUrl }]);
          setNewLinkName('');
          setNewLinkUrl('');
        };

        const handleDeleteLink = (id: number) => {
          setUserLinks(userLinks.filter(link => link.id !== id));
        };

        return (
          <div className="flex flex-col h-full text-sm">
            <div className="mb-2 space-y-1">
              <input
                type="text"
                placeholder="Link Name (e.g., Portfolio)"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                className="w-full p-1.5 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
              />
              <input
                type="url"
                placeholder="URL (e.g., https://example.com)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="w-full p-1.5 bg-gray-700 text-white rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
              />
              <button onClick={handleAddLink} className="w-full bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-500 flex items-center justify-center space-x-1 text-xs">
                <PlusCircle size={14}/>
                <span>Add Link</span>
              </button>
            </div>
            <ul className="space-y-1 overflow-y-auto flex-grow" style={{maxHeight: '90px'}}>
              {userLinks.length === 0 && <p className="text-gray-400 text-xs italic">No links added yet.</p>}
              {userLinks.map(link => (
                <li key={link.id} className="flex items-center justify-between p-1 bg-gray-700 rounded-md">
                  <a
                    href={link.url}
                    className="text-blue-400 hover:text-blue-300 hover:underline truncate flex-1 text-xs mr-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.url}
                  >
                    {link.name}
                  </a>
                  <button onClick={() => handleDeleteLink(link.id)} className="text-red-500 hover:text-red-400">
                    <Trash2 size={14}/>
                  </button>
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
        const storageKey = `widget_stickyNote_content`; // Simpler key for single instance assumption

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (typeof window !== 'undefined') {
            const savedNote = localStorage.getItem(storageKey);
            if (savedNote) {
              setNote(savedNote);
            }
          }
        }, [storageKey]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, note);
          }
        }, [note, storageKey]);

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
        const lsTitleKey = `widget_countdownTitle_${widgetId}`;
        const lsTargetDateKey = `widget_countdownTargetDate_${widgetId}`;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [title, setTitle] = useState(() => {
          if (typeof window !== 'undefined') {
            return localStorage.getItem(lsTitleKey) || "New Year's Eve";
          }
          return "New Year's Eve";
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [targetDateStr, setTargetDateStr] = useState(() => {
           if (typeof window !== 'undefined') {
            return localStorage.getItem(lsTargetDateKey) || new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 16); // Next New Year
          }
          return new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 16);
        });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [timeLeft, setTimeLeft] = useState('');

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          localStorage.setItem(lsTitleKey, title);
        }, [title, lsTitleKey]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          localStorage.setItem(lsTargetDateKey, targetDateStr);
        }, [targetDateStr, lsTargetDateKey]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
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
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Countdown Title"
              className="w-full p-1 bg-gray-700 text-white rounded-md text-sm mb-1 focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="datetime-local"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="w-full p-1 bg-gray-700 text-white rounded-md text-sm mb-2 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xl font-semibold text-gray-100 truncate" title={title}>{title}</p>
            <p className="text-2xl font-mono text-green-400">{timeLeft}</p>
          </div>
        );
      }
      case 'deviceBattery': {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean; error: string | null }>({
          level: 0,
          charging: false,
          error: 'Loading battery status...',
        });

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          let batteryManager: any = null; // To store battery manager for cleanup

          const updateBatteryStatus = (bm: any) => {
            setBatteryInfo({
              level: bm.level * 100,
              charging: bm.charging,
              error: null,
            });
          };

          if (typeof navigator.getBattery === 'function') {
            navigator.getBattery()
              .then(bm => {
                batteryManager = bm; // Assign to outer scope variable
                updateBatteryStatus(bm);
                bm.addEventListener('chargingchange', () => updateBatteryStatus(bm));
                bm.addEventListener('levelchange', () => updateBatteryStatus(bm));
              })
              .catch(err => {
                console.error("Error getting battery status:", err);
                setBatteryInfo({ level: 0, charging: false, error: 'Battery status unavailable.' });
              });
          } else {
            setBatteryInfo({ level: 0, charging: false, error: 'Battery API not supported.' });
          }

          return () => { // Cleanup function
            if (batteryManager) {
              batteryManager.removeEventListener('chargingchange', () => updateBatteryStatus(batteryManager));
              batteryManager.removeEventListener('levelchange', () => updateBatteryStatus(batteryManager));
            }
          };
        }, []);

        const renderBatteryIcon = () => {
          if (batteryInfo.error) return <BatteryWarning size={32} className="text-red-500" />;
          if (batteryInfo.charging) return <BatteryCharging size={32} className="text-green-500" />;
          if (batteryInfo.level > 80) return <BatteryFull size={32} className="text-green-500" />;
          if (batteryInfo.level > 40) return <BatteryMedium size={32} className="text-yellow-500" />;
          return <BatteryLow size={32} className="text-red-500" />;
        };

        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {renderBatteryIcon()}
            {batteryInfo.error ? (
              <p className="mt-2 text-sm text-red-400">{batteryInfo.error}</p>
            ) : (
              <>
                <p className="mt-1 text-2xl font-bold text-white">{Math.round(batteryInfo.level)}%</p>
                <p className="text-xs text-gray-400">{batteryInfo.charging ? 'Charging' : 'Discharging'}</p>
              </>
            )}
          </div>
        );
      }
      case 'guestbook': {
        interface GuestbookEntry { id: number; name: string; message: string; date: string; }
        const lsGuestbookKey = `widget_guestbook_entries_${widgetId}`;

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
        const pollQuestion = "Favorite Season?";
        const lsPollOptionsKey = `widget_miniPoll_options_${widgetId}_${pollQuestion.replace(/\s/g, '')}`;
        const lsPollVotedKey = `widget_miniPoll_voted_${widgetId}_${pollQuestion.replace(/\s/g, '')}`;

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
        const lsTodoKey = `widget_todoItems_${widgetId}`;

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
