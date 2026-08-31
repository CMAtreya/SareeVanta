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
  if (fallback && fallback.length >= 5 && fallback.toLowerCase() !== 'reel' && fallback.toLowerCase() !== 'reels') return fallback;
  if (!url) return '';
  const match = url.match(/\/(?:reel|reels|p)\/([A-Za-z0-9_-]{5,35})/i);
  if (match) return match[1];
  const cleanPath = url.split('?')[0].split('#')[0];
  const segments = cleanPath.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (/^[A-Za-z0-9_-]{5,35}$/.test(seg) && seg.toLowerCase() !== 'reel' && seg.toLowerCase() !== 'reels') {
      return seg;
    }
  }
  return '';
}

// Direct Live Instagram Reel Card (Real Video Embed, Zero Static Placeholders)
function DirectInlineReelCard({ reel }: { reel: ActiveReel }) {
  const shortcode = getShortcode(reel.url, reel.shortcode);
  const embedUrl = `https://www.instagram.com/reel/${shortcode}/embed/`;

  return (
    <div className="relative w-[300px] sm:w-[330px] h-[540px] sm:h-[580px] flex-shrink-0 rounded-3xl overflow-hidden bg-black border border-[#C87F4A]/30 shadow-2xl snap-start select-none transition-transform duration-300 hover:scale-[1.01]">
      <iframe
        src={embedUrl}
        title={reel.caption || `Instagram Reel ${shortcode}`}
        className="w-full h-full border-0 bg-black rounded-3xl"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        scrolling="no"
      />
    </div>
  );
}

export default function InstagramReelsCarousel() {
  const [reels, setReels] = useState<ActiveReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

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
  // 2. CONTINUOUS SMOOTH AUTO-ROTATING INFINITE CAROUSEL
  // ----------------------------------------------------
  useEffect(() => {
    if (reels.length === 0) return;

    let isPaused = isHovered;

    const scrollLoop = () => {
      if (!isPaused && scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const maxScroll = el.scrollWidth / 2;

        el.scrollLeft += 0.8; // Smooth 60fps continuous glide

        if (el.scrollLeft >= maxScroll) {
          el.scrollLeft = 0; // Seamless loop without jump
        }
      }
      animFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    animFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isHovered, reels.length]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const step = direction === 'left' ? -350 : 350;
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
              className="flex gap-5 sm:gap-6 items-stretch overflow-x-auto pb-6 pt-2 scrollbar-none focus:outline-none px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[...reels, ...reels].map((reel, idx) => (
                <DirectInlineReelCard key={`${reel.id}-${idx}`} reel={reel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
