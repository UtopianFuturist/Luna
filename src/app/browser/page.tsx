"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout'; // Assuming AppLayout is in src/components

const categorizedLinks = [
  {
    category: "AI Tools",
    links: [
      { name: "ChatGPT", url: "https://chat.openai.com" },
      { name: "Google Gemini", url: "https://gemini.google.com" },
      { name: "Anthropic Claude", url: "https://claude.ai" },
      { name: "WebSim", url: "https://websim.ai" },
    ],
  },
  {
    category: "Social",
    links: [
      { name: "YouTube", url: "https://youtube.com" },
      { name: "Soundcloud", url: "https://soundcloud.com" },
      { name: "BlueSky", url: "https://bsky.app" },
      { name: "Discord", url: "https://discord.com/login" },
    ],
  },
  {
    category: "Payment",
    links: [
      { name: "CashApp", url: "https://cash.app" },
      { name: "Venmo", url: "https://venmo.com" },
      { name: "Zelle", url: "https://zellepay.com" },
      { name: "Paypal", url: "https://paypal.com" },
    ],
  },
  {
    category: "BlueSky Tools",
    links: [
      { name: "ClearSky", url: "https://clearsky.app.placeholder" },
      { name: "Graze Feed Builder", url: "https://graze.placeholder.url" }
    ]
  }
];

const BrowserPage: React.FC = () => {
  const [iframeSrc, setIframeSrc] = useState<string>("about:blank"); // Initial blank page

  const handleLinkSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const url = event.target.value;
    if (url) {
      setIframeSrc(url);
    }
  };

  return (
    <AppLayout currentPage="Browser" showSidebarButton={true}>
      <div className="flex flex-col h-screen">
        <div className="p-4 bg-gray-900 text-white flex flex-wrap gap-4 items-center">
          {categorizedLinks.map((categoryGroup) => (
            <div key={categoryGroup.category} className="flex flex-col">
              <label htmlFor={`${categoryGroup.category}-select`} className="mb-1 text-sm font-medium text-gray-300">
                {categoryGroup.category}:
              </label>
              <select
                id={`${categoryGroup.category}-select`}
                onChange={handleLinkSelection}
                className="bg-gray-700 text-white p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                defaultValue="" // Ensure default option is selected initially
              >
                <option value="" disabled>Select a {categoryGroup.category.slice(0, -1)} link...</option>
                {categoryGroup.links.map((link) => (
                  <option key={link.name} value={link.url}>
                    {link.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <iframe
          src={iframeSrc}
          className="flex-grow border-none"
          title="Browser"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // Security sandbox options
        />
      </div>
    </AppLayout>
  );
};

export default BrowserPage;
