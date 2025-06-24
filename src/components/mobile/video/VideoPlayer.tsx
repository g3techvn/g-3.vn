'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlayCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

interface VideoPlayerProps {
  videoUrl: string;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function VideoPlayer({ videoUrl, isActive, isMuted, onToggleMute }: VideoPlayerProps) {
  const [embedError, setEmbedError] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);
  
  if (!videoId) {
    return (
      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
        <p className="text-white">Video không hợp lệ</p>
      </div>
    );
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  // Auto-show embed when active
  if (isActive && !showEmbed && !embedError) {
    setShowEmbed(true);
  }

  // Show embed if active and no error
  if (showEmbed && !embedError) {
    return (
      <div className="relative w-full h-full bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${isActive ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={`Video sản phẩm ${videoId}`}
          onError={() => setEmbedError(true)}
        />
        
        {/* Mute toggle button */}
        <button
          onClick={onToggleMute}
          className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
        >
          {isMuted ? (
            <SpeakerXMarkIcon className="h-6 w-6" />
          ) : (
            <SpeakerWaveIcon className="h-6 w-6" />
          )}
        </button>
      </div>
    );
  }

  // Show thumbnail with play button as fallback
  return (
    <div className="relative w-full h-full cursor-pointer" onClick={() => setShowEmbed(true)}>
      <Image
        src={thumbnailUrl}
        alt="Video thumbnail"
        fill
        className="object-cover"
        onError={() => {
          // If maxres fails, try hqdefault
          const img = document.querySelector(`img[src="${thumbnailUrl}"]`) as HTMLImageElement;
          if (img && !img.src.includes('hqdefault')) {
            img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        }}
      />
      
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-opacity">
        <PlayCircleIcon className="w-20 h-20 text-white drop-shadow-lg" />
      </div>
      
      {/* Error fallback */}
      {embedError && (
        <div className="absolute bottom-4 left-4 right-4">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-red-600 text-white text-center py-2 px-4 rounded hover:bg-red-700 transition-colors text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Xem video trên YouTube
          </a>
        </div>
      )}
      
      {/* Mute toggle for thumbnail view */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleMute();
        }}
        className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
      >
        {isMuted ? (
          <SpeakerXMarkIcon className="h-6 w-6" />
        ) : (
          <SpeakerWaveIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
} 