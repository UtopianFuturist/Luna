"use client";

import React, { useState, useEffect } from 'react';
import {
  Music, Users, Image as ImageIcon, Sun, BookOpen, UtensilsCrossed, HelpCircle,
  Github, Palette, MessageSquare, Send, CheckSquare, Trash2,
  BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning, PlusCircle, LinkOff, Link as LinkIcon, Pin, HelpCircle as HelpCircleIcon,
  CalendarDays, TrendingUp, TrendingDown, Minus, // Added new icons
  Smile, Rss, Film // Icons for new widgets
} from 'lucide-react';

interface WidgetProps {
  instanceId: string;
  widgetId: string;
  widgetName: string;
}

interface IndividualWidgetProps {
  instanceId: string;
}

const MoodStatusWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const [statusText, setStatusText] = useState("No status set");
  const [moodEmoji, setMoodEmoji] = useState("🤔");
  const textKey = `widgetContent_statusText_${instanceId}`;
  const emojiKey = `widgetContent_moodEmoji_${instanceId}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedText = localStorage.getItem(textKey);
      const savedEmoji = localStorage.getItem(emojiKey);
      if (savedText !== null) setStatusText(savedText);
      else setStatusText("No status set");

      if (savedEmoji !== null) setMoodEmoji(savedEmoji);
      else setMoodEmoji("🤔");
    }
  }, [instanceId, textKey, emojiKey]);

  return (
    <div className="text-center p-1">
      <span className="text-4xl block mb-1" role="img" aria-label="Mood emoji">{moodEmoji || '🤔'}</span>
      <p className="text-sm text-gray-300 break-words whitespace-pre-wrap">
        {statusText || "No status set"}
      </p>
    </div>
  );
};

const CalendarEventsWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
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
};

const StockTickerWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
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
};

const QuoteOfTheDayWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const [quoteText, setQuoteText] = useState("No quote set.");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const textKey = `widgetContent_quoteText_${instanceId}`;
  const authorKey = `widgetContent_quoteAuthor_${instanceId}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedText = localStorage.getItem(textKey);
      const savedAuthor = localStorage.getItem(authorKey);
      if (savedText !== null) setQuoteText(savedText);
      if (savedAuthor !== null) setQuoteAuthor(savedAuthor);
    }
  }, [instanceId, textKey, authorKey]);

  return (
    <div>
      <blockquote className="text-lg italic text-gray-300">
        "{quoteText}"
      </blockquote>
      {quoteAuthor && <p className="text-right mt-2 text-gray-400">- {quoteAuthor}</p>}
    </div>
  );
};

const PinnedPostWidgetWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  return (
    <div className="text-center p-4 text-gray-300">
      <Pin size={24} className="mx-auto mb-2 text-sky-400" />
      <h4 className="font-semibold text-white">My Pinned Post</h4>
      <p className="text-sm text-gray-400 mt-1">
        Content of the actual pinned post would appear here. This could be text, an image, or a link.
      </p>
    </div>
  );
};

interface LinkItem { id: number; name: string; url: string; }
const QuickLinksWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const lsLinksKey = `widgetContent_quickLinks_links_${instanceId}`;
  const [linksToDisplay, setLinksToDisplay] = useState<LinkItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLinks = localStorage.getItem(lsLinksKey);
      setLinksToDisplay(savedLinks ? JSON.parse(savedLinks) : []);
    }
  }, [instanceId, lsLinksKey]);

  if (linksToDisplay.length === 0) {
    return <p className="text-gray-400 text-xs italic text-center">No links configured. Set them in Widget Board settings.</p>;
  }

  return (
    <div className="flex flex-col h-full text-sm">
      <ul className="space-y-1 overflow-y-auto flex-grow" style={{maxHeight: '140px'}}>
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
};

const CurrentlyListeningWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
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
};

const PersonalPhotoGalleryWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const galleryImages = [
    "https://via.placeholder.com/200x150/4A5568/FFFFFF?text=Photo+1",
    "https://via.placeholder.com/200x150/718096/FFFFFF?text=Photo+2",
  ];
  return (
    <div className="w-full">
      <img
        src={galleryImages[0]}
        alt="Personal gallery photo 1"
        className="rounded-md w-full object-cover h-32 md:h-40"
      />
    </div>
  );
};

const TopFriendsWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
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
            <Users size={20} />
          </div>
          <span className="text-gray-300">{friend.name}</span>
        </div>
      ))}
    </div>
  );
};

const QuickNotesWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  return <p className="text-gray-300">Quick Notes Widget Content Here</p>;
};

const ProfileStatsWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  return <p className="text-gray-300">Profile Stats Widget Content Here</p>;
};

const LatestPostWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  return <p className="text-gray-300">My Latest Post Widget Content Here</p>;
};

const FavoriteYouTubeVideoWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  return (
    <div className="aspect-video">
      <iframe
        className="w-full h-full rounded-md"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Favorite YouTube Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
      ></iframe>
    </div>
  );
};

const ClockWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

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
};

const WeatherWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <Sun size={48} className="text-yellow-400 mb-2" />
      <p className="text-xl font-semibold text-gray-200">San Francisco</p>
      <p className="text-3xl text-white">65°F</p>
      <p className="text-gray-300">Sunny</p>
    </div>
  );
};

const StickyNoteWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const [noteContent, setNoteContent] = useState("No note set. Edit in settings.");
  const storageKey = `widgetContent_stickyNote_${instanceId}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedNote = localStorage.getItem(storageKey);
      setNoteContent(savedNote !== null ? savedNote : "No note set. Edit in settings.");
    }
  }, [instanceId, storageKey]);

  return (
    <div
      className="w-full h-full bg-yellow-200 text-yellow-900 p-2 rounded-md overflow-y-auto"
      style={{ whiteSpace: 'pre-wrap', minHeight: '120px', wordWrap: 'break-word' }}
    >
      {noteContent}
    </div>
  );
};

const CountdownTimerWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const lsTitleKey = `widgetContent_countdownTitle_${instanceId}`;
  const lsTargetDateKey = `widgetContent_countdownTargetDate_${instanceId}`;
  const defaultTitle = "Countdown";
  const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [title, setTitle] = useState(defaultTitle);
  const [targetDateStr, setTargetDateStr] = useState(defaultDate);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTitle = localStorage.getItem(lsTitleKey);
      const savedTargetDate = localStorage.getItem(lsTargetDateKey);
      setTitle(savedTitle || defaultTitle);
      setTargetDateStr(savedTargetDate || defaultDate);
    }
  }, [instanceId, lsTitleKey, lsTargetDateKey, defaultTitle, defaultDate]);

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

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  return (
    <div className="text-center p-2 space-y-2">
      <p className="text-md font-semibold text-gray-100 truncate" title={title}>{title}</p>
      <p className="text-2xl font-mono text-green-400">{timeLeft}</p>
    </div>
  );
};

const DeviceBatteryWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean; error: string | null }>({
    level: 0,
    charging: false,
    error: 'Initializing...',
  });

  useEffect(() => {
    let batteryManager: any = null;
    let isMounted = true;

    const updateBatteryStatus = (bm: any) => {
      if (isMounted) {
        setBatteryInfo({
          level: bm.level * 100,
          charging: bm.charging,
          error: null,
        });
      }
    };

    const handleNotSupported = () => {
      if (isMounted) {
        setBatteryInfo({ level: 0, charging: false, error: 'Battery API not supported.' });
      }
    };

    if (typeof navigator.getBattery === 'function') {
      navigator.getBattery()
        .then(bm => {
          if (!isMounted) return;
          batteryManager = bm;
          updateBatteryStatus(bm);

          const chargingChangeHandler = () => updateBatteryStatus(bm);
          const levelChangeHandler = () => updateBatteryStatus(bm);

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
      handleNotSupported();
    }

    return () => {
      isMounted = false;
      if (batteryManager && batteryManager._cleanupListeners) {
        batteryManager._cleanupListeners();
      }
    };
  }, []);

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
};

interface GuestbookEntry { id: number; name: string; message: string; date: string; }
const GuestbookWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const lsGuestbookKey = `widgetContent_guestbook_entries_${instanceId}`;
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(lsGuestbookKey);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');

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
        {entries.slice().reverse().map(entry => (
          <div key={entry.id} className="p-1.5 bg-gray-700 rounded-md">
            <p className="text-gray-300 break-words">"{entry.message}"</p>
            <p className="text-xs text-gray-500 text-right mt-0.5">- {entry.name} on {entry.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PollOption { id: string; text: string; votes: number; }
const MiniPollWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const pollQuestion = "Favorite Season?";
  const pollQuestionIdentifier = pollQuestion.replace(/\s/g, '');
  const lsPollOptionsKey = `widgetContent_miniPoll_options_${instanceId}_${pollQuestionIdentifier}`;
  const lsPollVotedKey = `widgetContent_miniPoll_voted_${instanceId}_${pollQuestionIdentifier}`;

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
  const [hasVoted, setHasVoted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(lsPollVotedKey) === 'true';
    }
    return false;
  });

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
};

const GithubProjectShowcaseWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
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
};

const ArtGallerySnippetWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
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
};

interface TodoItem { id: number; text: string; completed: boolean; }
const SimpleTodoListWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const lsTodoKey = `widgetContent_todoItems_${instanceId}`;
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedTodos = localStorage.getItem(lsTodoKey);
      return savedTodos ? JSON.parse(savedTodos) : [];
    }
    return [];
  });
  const [newTodoText, setNewTodoText] = useState('');

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
      <ul className="space-y-1.5 overflow-y-auto flex-grow" style={{maxHeight: '100px'}}>
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
};

const DigitalBookshelfWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const books = [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", coverPlaceholderText: "TG" },
    { title: "1984", author: "George Orwell", coverPlaceholderText: "84" },
    { title: "To Kill a Mockingbird", author: "Harper Lee", coverPlaceholderText: "TK" },
  ];
  return (
    <div className="space-y-3">
      {books.slice(0,2).map(book => (
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
};

const RecipeOfTheDayWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
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
};

const AskMeAnythingBoxWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
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
};

const VirtualPetWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Smile size={48} className="text-yellow-400 mb-2" />
      <p className="text-lg font-semibold text-gray-200">Fido</p>
      <p className="text-sm text-gray-400">Fido is happy!</p>
    </div>
  );
};

const RecentBlogPostsWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const posts = [
    { id: 1, title: "My First Blog Post", url: "#" },
    { id: 2, title: "Exploring New Technologies", url: "#" },
    { id: 3, title: "A Guide to Productive Workflows", url: "#" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center text-gray-300 mb-1">
        <Rss size={18} className="mr-2 text-orange-400" />
        <h4 className="font-semibold text-sm">Recent Posts</h4>
      </div>
      <ul className="space-y-1">
        {posts.slice(0, 3).map(post => (
          <li key={post.id} className="text-xs">
            <a href={post.url} className="text-blue-400 hover:text-blue-300 hover:underline truncate">
              {post.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FavoriteMediaWidget: React.FC<IndividualWidgetProps> = ({ instanceId }) => {
  const mediaItems = [
    { id: 1, title: "Epic Adventure Movie", year: "2023", type: "Movie", coverIcon: <Film size={24} className="text-gray-500" /> },
    { id: 2, title: "Sci-Fi Series", year: "2022", type: "Show", coverIcon: <Film size={24} className="text-red-500" /> },
    { id: 3, title: "Documentary Film", year: "2024", type: "Movie", coverIcon: <Film size={24} className="text-blue-500" /> },
  ];
  return (
    <div className="space-y-2">
       <div className="flex items-center text-gray-300 mb-1">
        <Film size={18} className="mr-2 text-purple-400" />
        <h4 className="font-semibold text-sm">Favorite Media</h4>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        {mediaItems.slice(0,3).map(item => (
          <div key={item.id} className="bg-gray-700 p-1.5 rounded-md">
            <div className="w-full h-16 bg-gray-600 rounded flex items-center justify-center mb-1">
              {item.coverIcon}
            </div>
            <p className="font-semibold text-gray-200 truncate text-[10px] leading-tight" title={item.title}>{item.title}</p>
            <p className="text-gray-400 text-[9px]">{item.type} ({item.year})</p>
          </div>
        ))}
      </div>
    </div>
  );
};


const Widget: React.FC<WidgetProps> = ({ instanceId, widgetId, widgetName }) => {
  const renderWidgetContent = () => {
    switch (widgetId) {
      case 'moodStatus':
        return <MoodStatusWidget instanceId={instanceId} />;
      case 'calendarEvents':
        return <CalendarEventsWidget instanceId={instanceId} />;
      case 'stockTicker':
        return <StockTickerWidget instanceId={instanceId} />;
      case 'quoteOfTheDay':
        return <QuoteOfTheDayWidget instanceId={instanceId} />;
      case 'pinnedPostWidget':
        return <PinnedPostWidgetWidget instanceId={instanceId} />;
      case 'quickLinks':
        return <QuickLinksWidget instanceId={instanceId} />;
      case 'currentlyListening':
        return <CurrentlyListeningWidget instanceId={instanceId} />;
      case 'personalPhotoGallery':
        return <PersonalPhotoGalleryWidget instanceId={instanceId} />;
      case 'topFriends':
        return <TopFriendsWidget instanceId={instanceId} />;
      case 'quickNotes':
        return <QuickNotesWidget instanceId={instanceId} />;
      case 'profileStats':
        return <ProfileStatsWidget instanceId={instanceId} />;
      case 'latestPost':
        return <LatestPostWidget instanceId={instanceId} />;
      case 'favoriteYouTubeVideo':
        return <FavoriteYouTubeVideoWidget instanceId={instanceId} />;
      case 'clockWidget':
        return <ClockWidget instanceId={instanceId} />;
      case 'weather':
        return <WeatherWidget instanceId={instanceId} />;
      case 'stickyNote':
        return <StickyNoteWidget instanceId={instanceId} />;
      case 'countdownTimer':
        return <CountdownTimerWidget instanceId={instanceId} />;
      case 'deviceBattery':
        return <DeviceBatteryWidget instanceId={instanceId} />;
      case 'guestbook':
        return <GuestbookWidget instanceId={instanceId} />;
      case 'miniPoll':
        return <MiniPollWidget instanceId={instanceId} />;
      case 'githubProjectShowcase':
        return <GithubProjectShowcaseWidget instanceId={instanceId} />;
      case 'artGallerySnippet':
        return <ArtGallerySnippetWidget instanceId={instanceId} />;
      case 'simpleTodoList':
        return <SimpleTodoListWidget instanceId={instanceId} />;
      case 'digitalBookshelf':
        return <DigitalBookshelfWidget instanceId={instanceId} />;
      case 'recipeOfTheDay':
        return <RecipeOfTheDayWidget instanceId={instanceId} />;
      case 'askMeAnythingBox':
        return <AskMeAnythingBoxWidget instanceId={instanceId} />;
      case 'virtualPet':
        return <VirtualPetWidget instanceId={instanceId} />;
      case 'recentBlogPosts':
        return <RecentBlogPostsWidget instanceId={instanceId} />;
      case 'favoriteMedia':
        return <FavoriteMediaWidget instanceId={instanceId} />;
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
