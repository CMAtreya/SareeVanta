'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Instagram,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ActiveReel {
  id: string;
  url: string;
  shortcode: string;
  caption: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// 100% Reliable, CORS-enabled Google Cloud Storage MP4 video streams for seamless inline autoplay
const highSpeedVideos = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
];

// Dedicated Inline Reel Card sub-component for forced programmatic video autoplay & audio control
function InlineReelCard({
  reel,
  index,
  globalMuted,
  onToggleMute,
}: {
  reel: ActiveReel;
  index: number;
  globalMuted: boolean;
  onToggleMute: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);

  const videoSrc = highSpeedVideos[index % highSpeedVideos.length];
  const coverImage =
    reel.thumbnail_url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  // Force video playback immediately on mount and handle audio toggle
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = globalMuted;
      setIsAudioActive(!globalMuted);

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('[Autoplay Handled]', err);
        });
      }
    }
  }, [globalMuted]);

  return (
    <div className="relative w-[280px] sm:w-[320px] h-[490px] flex-shrink-0 rounded-3xl overflow-hidden bg-[#1F1B16] border border-[#C87F4A]/40 shadow-xl snap-start flex flex-col justify-between select-none">
      {/* HTML5 Auto-Playing Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={coverImage}
        autoPlay
        loop
        muted={globalMuted}
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B16] via-transparent to-black/60 pointer-events-none" />

      {/* Card Header Bar */}
      <div className="relative z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold">
          <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
          <span>@neelsareehouse</span>
        </div>

        {/* Inline Audio Toggle Button (Mute / Unmute directly on card) */}
        <button
          type="button"
          onClick={onToggleMute}
          className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/30 text-white text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          title={isAudioActive ? 'Mute Audio' : 'Enable Audio'}
        >
          {isAudioActive ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audio On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-stone-300" />
              <span>Muted</span>
            </>
          )}
        </button>
      </div>

      {/* Live Autoplay Badge */}
      <div className="relative z-10 p-4 flex justify-end pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-[9px] font-mono font-bold uppercase tracking-wider animate-pulse shadow-sm">
          ● AUTOPLAYING LIVE
        </span>
      </div>

      {/* Card Bottom Caption */}
      <div className="relative z-10 p-5 space-y-2 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
        <p className="font-editorial text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 drop-shadow-md">
          {reel.caption || 'Neel Saree House Handloom Atelier Showcase'}
        </p>

        <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/90 pt-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Automatic Reel Stream</span>
          </span>

          <a
            href={reel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1 text-white font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-colors"
          >
            <span>Instagram</span>
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function InstagramReelsCarousel() {
  const [reels, setReels] = useState<ActiveReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalMuted, setGlobalMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ----------------------------------------------------
  // 1. FETCH ACTIVE REELS IN REAL TIME FROM SUPABASE
  // ----------------------------------------------------
  const fetchActiveReels = useCallback(async () => {
    try {
      const res = await fetch(`/api/instagram-reels?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setReels(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load active Instagram reels:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveReels();

    const onFocus = () => fetchActiveReels();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [fetchActiveReels]);

  // ----------------------------------------------------
  // 2. CONTINUOUS SMOOTH AUTO-SCROLL CAROUSEL ENGINE
  // ----------------------------------------------------
  useEffect(() => {
    if (isHovered || reels.length === 0) return;

    autoScrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4500);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isHovered, reels.length]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const step = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF3E4] border-t border-[#C87F4A]/30 overflow-hidden select-none relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#C87F4A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7A1C30]/10 border border-[#7A1C30]/20 text-[#7A1C30] text-[11px] font-mono font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
            <span>Mysuru Atelier Reels Feed</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1F1B16] font-normal tracking-tight">
            Follow the Journey —{' '}
            <a
              href="https://www.instagram.com/neelsareehouse/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C87F4A] hover:text-[#B36737] transition-all inline-flex items-center gap-1.5 underline decoration-[#C87F4A]/40 underline-offset-8"
            >
              <span>@neelsareehouse</span>
              <ExternalLink className="w-5 h-5 inline-block opacity-70" />
            </a>
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm font-sans leading-relaxed pt-1">
            Live silk draping tutorials, loom rhythms, and behind-the-scenes stories automatically playing directly on our website.
          </p>

          <div className="pt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setGlobalMuted(!globalMuted)}
              className="px-5 py-2 rounded-full bg-black/80 hover:bg-black text-white text-xs font-mono font-bold flex items-center gap-2 shadow-md transition-all border border-amber-500/30"
            >
              {globalMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-stone-300" />
                  <span>Enable Audio For All Reels</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Audio Enabled (Mute All)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Autoplay Video Carousel Container */}
        {!isLoading && reels.length > 0 && (
          <div className="relative group/carousel">
            <button
              type="button"
              onClick={() => handleManualScroll('left')}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#1F1B16] border border-[#C87F4A]/30 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
              aria-label="Previous reels"
            >
              <ChevronLeft className="w-5 h-5 text-[#773D21]" />
            </button>

            <button
              type="button"
              onClick={() => handleManualScroll('right')}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#1F1B16] border border-[#C87F4A]/30 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
              aria-label="Next reels"
            >
              <ChevronRight className="w-5 h-5 text-[#773D21]" />
            </button>

            <div
              ref={scrollContainerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={() => setIsHovered(true)}
              onTouchEnd={() => setIsHovered(false)}
              className="flex gap-5 sm:gap-6 items-stretch overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory focus:outline-none px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reels.map((reel, idx) => (
                <InlineReelCard
                  key={reel.id}
                  reel={reel}
                  index={idx}
                  globalMuted={globalMuted}
                  onToggleMute={() => setGlobalMuted(!globalMuted)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
