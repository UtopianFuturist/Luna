"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Smile, Globe, Users, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ComposePostProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const ComposePost: React.FC<ComposePostProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { agent, isAuthenticated } = useAuth();
  const [postText, setPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the textarea when the modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Handle character count and limit
  const maxCharCount = 300;
  const charCount = postText.length;
  const charCountColor = charCount > maxCharCount * 0.9 
    ? (charCount > maxCharCount ? 'text-red-500' : 'text-yellow-500') 
    : 'text-gray-400';

  const handleSubmitPost = async () => {
    if (!isAuthenticated || !agent) {
      setError('You must be signed in to post');
      return;
    }

    if (postText.trim() === '') {
      setError('Post cannot be empty');
      return;
    }

    if (postText.length > maxCharCount) {
      setError(`Post exceeds maximum character limit of ${maxCharCount}`);
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      // Create the post using the BlueSky API
      await agent.post({
        text: postText,
        // You can add more options here like images, links, etc.
      });

      // Clear the form and close the modal
      setPostText('');
      onPostCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
          <h2 className="text-white font-semibold">New Post</h2>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </div>
        
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent text-white border-none focus:ring-0 resize-none h-32"
            maxLength={maxCharCount + 10} // Allow a bit over to show the error state
          />
          
          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}
          
          <div className="flex justify-between items-center mt-2 border-t border-gray-800 pt-3">
            <div className="flex space-x-3">
              <button className="text-blue-400 hover:text-blue-300">
                <ImageIcon size={20} />
              </button>
              <button className="text-blue-400 hover:text-blue-300">
                <LinkIcon size={20} />
              </button>
              <button className="text-blue-400 hover:text-blue-300">
                <Smile size={20} />
              </button>
              
              {/* Privacy selector */}
              <div className="relative">
                <button className="text-blue-400 hover:text-blue-300">
                  {privacy === 'public' && <Globe size={20} />}
                  {privacy === 'followers' && <Users size={20} />}
                  {privacy === 'private' && <Lock size={20} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-xs ${charCountColor}`}>
                {charCount}/{maxCharCount}
              </span>
              <button
                onClick={handleSubmitPost}
                disabled={isPosting || postText.trim() === '' || postText.length > maxCharCount}
                className={`px-4 py-1.5 rounded-full font-medium flex items-center ${
                  isPosting || postText.trim() === '' || postText.length > maxCharCount
                    ? 'bg-blue-500/50 text-white/50 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isPosting ? 'Posting...' : 'Post'} 
                {!isPosting && <ArrowRight size={16} className="ml-1" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComposePost;
