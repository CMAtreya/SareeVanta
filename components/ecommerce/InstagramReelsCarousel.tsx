'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Instagram,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Heart,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface ActiveReel {
  id: string;
  url: string;
  shortcode?: string;
  caption: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Helper to extract clean Instagram Reel shortcodes (e.g. Cq5h1VQBW5R) from any Instagram link
function getShortcode(url: string, fallback?: string): string {
  if (fallback && fallback.length >= 5) return fallback;
  if (!url) return '';
  const match = url.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : '';
}

// Luxury Native Reel Card with Direct In-Place Video Playback (No Modal Popup)
function DirectInlineReelCard({ reel }: { reel: ActiveReel }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(() => Math.floor(180 + (reel.caption.length * 7) % 400));
  const [hasLiked, setHasLiked] = useState(false);

  const shortcode = getShortcode(reel.url, reel.shortcode);
  const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const imagePoster =
    reel.thumbnail_url ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="relative w-[280px] sm:w-[320px] h-[520px] sm:h-[560px] flex-shrink-0 rounded-3xl overflow-hidden bg-[#18110E] border border-[#C87F4A]/30 shadow-2xl snap-start select-none transition-all duration-300 hover:scale-[1.02] hover:border-[#C87F4A] flex flex-col justify-between group">
      {isPlaying ? (
        /* 1. In-Place Live Video Player (Direct inside the card) */
        <div className="w-full h-full relative bg-black flex flex-col">
          <div className="absolute top-3 right-3 z-30">
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all shadow-md cursor-pointer"
              title="Close Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={reel.caption || `Instagram Reel ${shortcode}`}
            className="w-full h-full border-0 bg-black"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        /* 2. Luxury Cover Card - Clicking Play Starts Video In-Place Directly */
        <div
          onClick={() => setIsPlaying(true)}
          className="w-full h-full relative flex flex-col justify-between cursor-pointer"
        >
          {/* Background Poster */}
          <img
            src={imagePoster}
            alt={reel.caption || 'Neel Saree House Silk Reel'}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/70 pointer-events-none" />

          {/* Top Brand Info */}
          <div className="relative z-20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-[#F77737] via-[#FD1D1D] to-[#833AB4]">
                <div className="w-full h-full rounded-full bg-[#18110E] flex items-center justify-center text-[10px] font-bold text-amber-200 font-serif">
                  NSH
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-white text-xs font-bold font-sans tracking-wide">
                    neelsareehouse
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                </div>
                <span className="text-[10px] text-amber-200/80 font-mono block">Mysuru Silks</span>
              </div>
            </div>

            <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90">
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
            </div>
          </div>

          {/* Center Play Button */}
          <div className="relative z-20 flex-1 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#C87F4A] group-hover:border-[#C87F4A]">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Bottom Caption & Stats */}
          <div className="relative z-20 p-4 space-y-2.5">
            <p className="text-white/90 text-xs font-sans font-medium line-clamp-2 leading-relaxed drop-shadow-md">
              {reel.caption || 'Discover royal Mysuru crepe silks, handwoven zari pallus, and heirloom draping.'}
            </p>

            <div className="flex items-center justify-between pt-1 text-white/80 text-[11px] font-mono border-t border-white/10">
              <button
                type="button"
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 transition-colors ${
                  hasLiked ? 'text-red-400' : 'hover:text-red-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-400' : ''}`} />
                <span>{likes}</span>
              </button>

              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-200 font-bold uppercase tracking-wider">
                Play Reel
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstagramReelsCarousel() {
  const [reels, setReels] = useState<ActiveReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  // 2. INFINITE AUTO-ROTATING CAROUSEL ENGINE
  // ----------------------------------------------------
  useEffect(() => {
    if (isHovered || reels.length === 0) return;

    autoScrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3500);

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
            <span>Official Instagram Reels Feed</span>
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
            Live silk draping tutorials, loom rhythms, and official Instagram reels playing directly from our Mysuru store.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/neelsareehouse/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-md transition-transform hover:scale-105"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow @neelsareehouse on Instagram</span>
            </a>
          </div>
        </div>

        {/* Real Luxury Reels Video Carousel Container */}
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
              {reels.map((reel) => (
                <DirectInlineReelCard key={reel.id} reel={reel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
