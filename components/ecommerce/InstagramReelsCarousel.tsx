'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Instagram,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Phone,
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

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default function InstagramReelsCarousel() {
  const [reels, setReels] = useState<ActiveReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hover/touch pause state
  const [isHovered, setIsHovered] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ----------------------------------------------------
  // 1. FETCH ACTIVE REELS IN REAL TIME (No stale cache)
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

    // Re-fetch on tab focus or visibility change to ensure real-time sync with admin
    const onFocus = () => fetchActiveReels();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [fetchActiveReels]);

  // ----------------------------------------------------
  // 2. HYDRATE ALL INSTAGRAM OEMBED WIDGETS
  // Converts all blockquotes into the official Instagram interactive widgets
  // ----------------------------------------------------
  useEffect(() => {
    if (reels.length === 0) return;

    const triggerProcess = () => {
      if (typeof window !== 'undefined' && window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
      }
    };

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        if (window.instgrm?.Embeds?.process) {
          window.instgrm.Embeds.process();
        } else {
          // Ensure script is loaded
          let script = document.querySelector<HTMLScriptElement>(
            'script[src*="instagram.com/embed.js"]'
          );
          if (!script) {
            script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
          }

          script.addEventListener('load', triggerProcess, { once: true });

          // Polling fallback
          const pollInterval = setInterval(() => {
            if (window.instgrm?.Embeds?.process) {
              window.instgrm.Embeds.process();
              clearInterval(pollInterval);
            }
          }, 150);

          setTimeout(() => clearInterval(pollInterval), 5000);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [reels]);

  // ----------------------------------------------------
  // 3. CONTINUOUS SMOOTH AUTO-SCROLL CAROUSEL ENGINE
  // Auto-scrolls continuously, pauses on hover/touch
  // ----------------------------------------------------
  useEffect(() => {
    if (isHovered || reels.length === 0) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    // Auto-scroll every 4 seconds
    autoScrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardStep = 350; // Card width (330px) + gap (20px)

        if (scrollLeft + cardStep >= maxScroll - 20) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: cardStep, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
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
    <section className="py-20 sm:py-28 bg-[#FAF3E4] border-b border-[#C87F4A]/25 relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#C87F4A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto space-y-10 relative z-10">
        {/* ================================================== */}
        {/* SECTION HEADING: Centered Luxury Atelier Banner    */}
        {/* ================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#C87F4A]/30 shadow-xs text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
            <span>Mysuru Atelier Feed</span>
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
            Curated silk draping tutorials, loom rhythms, and behind-the-scenes stories directly from our Mysuru salon.
          </p>

          {/* Follow Button */}
          <div className="pt-3 flex items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/neelsareehouse/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-md transition-transform hover:scale-105"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow @neelsareehouse</span>
            </a>
          </div>
        </div>

        {/* ================================================== */}
        {/* GRACEFUL FALLBACK (If reel list is empty)           */}
        {/* ================================================== */}
        {!isLoading && reels.length === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#C87F4A]/30 shadow-silk text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white mx-auto shadow-md">
              <Instagram className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-editorial text-2xl font-bold text-[#1F1B16]">
                Follow @neelsareehouse on Instagram
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                <em>"Let our sarees weave stories you’ll cherish, Where every drape tells a tale."</em>
                <br />
                Discover daily silk draping tutorials, new loom arrivals, and wedding curations on our official Instagram feed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <a
                href="https://www.instagram.com/neelsareehouse/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                <span>Visit Instagram Feed</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/919980124595"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp: 9980124595</span>
              </a>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* HORIZONTAL CAROUSEL: ALL CARDS ALWAYS RENDERED AS  */}
        {/* OFFICIAL INSTAGRAM EMBED IN UNIFORM EQUAL SIZES    */}
        {/* ================================================== */}
        {reels.length > 0 && (
          <div className="relative group/carousel">
            {/* Left Nav Arrow Button */}
            <button
              type="button"
              onClick={() => handleManualScroll('left')}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#1F1B16] border border-[#C87F4A]/30 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
              aria-label="Previous reels"
            >
              <ChevronLeft className="w-5 h-5 text-[#773D21]" />
            </button>

            {/* Right Nav Arrow Button */}
            <button
              type="button"
              onClick={() => handleManualScroll('right')}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#1F1B16] border border-[#C87F4A]/30 shadow-xl flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
              aria-label="Next reels"
            >
              <ChevronRight className="w-5 h-5 text-[#773D21]" />
            </button>

            {/* Carousel Scroll Track - Equal-dimensioned video card row */}
            <div
              ref={scrollContainerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={() => setIsHovered(true)}
              onTouchEnd={() => setIsHovered(false)}
              className="flex gap-5 sm:gap-6 items-stretch overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory focus:outline-none px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reels.map((reel) => {
                const coverImage =
                  reel.thumbnail_url ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';

                return (
                  <a
                    key={reel.id}
                    href={reel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-[280px] sm:w-[310px] h-[480px] flex-shrink-0 rounded-3xl overflow-hidden bg-[#1F1B16] border border-[#C87F4A]/40 shadow-xl snap-start transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between"
                  >
                    {/* Background Cover Photo */}
                    <img
                      src={coverImage}
                      alt={reel.caption || 'Instagram Reel'}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B16] via-[#1F1B16]/30 to-black/50 transition-opacity duration-300 group-hover:opacity-90" />

                    {/* Card Top Header */}
                    <div className="relative z-10 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold">
                        <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                        <span>@neelsareehouse</span>
                      </div>

                      <span className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs opacity-80 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </span>
                    </div>

                    {/* Card Center Animated Play Button */}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-2xl transition-transform duration-300 group-hover:scale-115">
                        <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center border border-white/30">
                          <svg className="w-6 h-6 ml-1 fill-white text-white" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      <span className="mt-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-amber-200/90 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-amber-400/30">
                        Watch Reel on Instagram
                      </span>
                    </div>

                    {/* Card Bottom Caption */}
                    <div className="relative z-10 p-5 space-y-2">
                      <p className="font-editorial text-base sm:text-lg font-bold text-white leading-snug line-clamp-2 drop-shadow-md">
                        {reel.caption || 'Neel Saree House Handloom Atelier Showcase'}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300/80">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Tap to open reel video</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
