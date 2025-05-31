"use client";

import React, { useState, useEffect } from 'react';
import { Music, Users, Image as ImageIcon, Sun } from 'lucide-react'; // Added Sun icon

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
      case 'linkHub':
        // In a real app, these links would come from props or state
        const links = [
          { name: "My Portfolio", url: "#portfolio" },
          { name: "Twitter", url: "#twitter" },
          { name: "GitHub", url: "#github" },
        ];
        return (
          <div>
            <ul className="space-y-2">
              {links.map(link => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                    target="_blank" // Good practice for external links, though these are placeholders
                    rel="noopener noreferrer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
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
