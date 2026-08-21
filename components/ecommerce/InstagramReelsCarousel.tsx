'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Phone,
  X,
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

// In-memory client cache
let cachedReels: ActiveReel[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

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

  // Active playing reel shortcode (only ONE active oEmbed widget at a time)
  const [playingShortcode, setPlayingShortcode] = useState<string | null>(null);

  // Hover/touch pause state (Scentlifestyle.com carousel style)
  const [isHovered, setIsHovered] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ----------------------------------------------------
  // 1. FETCH REELS (With 5-minute Cache)
  // ----------------------------------------------------
  useEffect(() => {
    async function loadActiveReels() {
      const now = Date.now();
      if (cachedReels && now - cacheTimestamp < CACHE_DURATION_MS) {
        setReels(cachedReels);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/instagram-reels');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            cachedReels = json.data;
            cacheTimestamp = now;
            setReels(json.data);
          }
        }
      } catch (err) {
        console.error('Failed to load active Instagram reels:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadActiveReels();
  }, []);

  // ----------------------------------------------------
  // 2. HYDRATE INSTAGRAM OEMBED WIDGET
  // Immediately after mounting blockquote, call window.instgrm.Embeds.process()
  // ----------------------------------------------------
  useEffect(() => {
    if (!playingShortcode) return;

    const triggerProcess = () => {
      if (typeof window !== 'undefined' && window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
      }
    };

    // Small delay to ensure the blockquote is inserted into DOM
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        if (window.instgrm?.Embeds?.process) {
          window.instgrm.Embeds.process();
        } else {
          // If script is still loading, ensure script is present and attach load handler
          let script = document.querySelector<HTMLScriptElement>('script[src*="instagram.com/embed.js"]');
          if (!script) {
            script = document.createElement('script');
            script.src = 'https://www.instagram.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
          }

          script.addEventListener('load', triggerProcess, { once: true });

          // Fallback poll in case script is already cached/executing
          const pollInterval = setInterval(() => {
            if (window.instgrm?.Embeds?.process) {
              window.instgrm.Embeds.process();
              clearInterval(pollInterval);
            }
          }, 100);

          setTimeout(() => clearInterval(pollInterval), 4000);
        }
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [playingShortcode]);

  // ----------------------------------------------------
  // 3. CONTINUOUS SMOOTH AUTO-SCROLL CAROUSEL ENGINE
  // Scentlifestyle-style: Auto-scrolls continuously,
  // pauses on hover/touch or when a reel is clicked & playing.
  // ----------------------------------------------------
  useEffect(() => {
    // If user is hovering or playing an active reel, pause the auto-scroll
    if (isHovered || playingShortcode !== null || reels.length === 0) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    // Auto-scroll every 3.5 seconds
    autoScrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const cardStep = 295; // Card width + gap

        if (scrollLeft + cardStep >= maxScroll - 15) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: cardStep, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isHovered, playingShortcode, reels.length]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const step = direction === 'left' ? -295 : 295;
      scrollContainerRef.current.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  // Handle lazy-load click on card (collapses any other card first)
  const handleCardClick = (shortcode: string) => {
    if (playingShortcode === shortcode) {
      // Toggle off / collapse back to thumbnail
      setPlayingShortcode(null);
    } else {
      // Mount oEmbed widget ONLY for this card
      setPlayingShortcode(shortcode);
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FAF3E4] border-b border-[#C87F4A]/25 relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#C87F4A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto space-y-10 relative z-10">
        {/* ================================================== */}
        {/* SECTION HEADING: Scentlifestyle.com Centered Elegance */}
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
            Curated silk draping tutorials, loom rhythms, and behind-the-scenes stories directly from our Mysuru salon. Tap any reel to watch.
          </p>

          {/* Scentlifestyle Style Follow Button */}
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
        {/* HORIZONTAL CAROUSEL (Scentlifestyle.com Aesthetic)  */}
        {/* Lazy-Loads Instagram oEmbed ONLY on click           */}
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

            {/* Carousel Scroll Track */}
            <div
              ref={scrollContainerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={() => setIsHovered(true)}
              onTouchEnd={() => setIsHovered(false)}
              className="flex gap-4 sm:gap-6 items-start overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory focus:outline-none px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reels.map((reel) => {
                const isPlaying = playingShortcode === reel.shortcode;

                return (
                  <div
                    key={reel.id}
                    className={`flex-shrink-0 rounded-[2rem] overflow-hidden relative bg-[#1F1B16] border border-[#C87F4A]/35 shadow-silk-lg snap-start transition-all duration-300 ${
                      isPlaying
                        ? 'w-[340px] sm:w-[380px] max-w-[400px] border-[#C87F4A] bg-white text-[#1F1B16] shadow-2xl z-20'
                        : 'w-[245px] sm:w-[275px] aspect-[9/16] hover:shadow-2xl hover:border-[#C87F4A] group/card'
                    }`}
                  >
                    {/* ========================================== */}
                    {/* CASE A: OFFICIAL INSTAGRAM OEMBED WIDGET   */}
                    {/* Mounted LAZILY ONLY when clicked           */}
                    {/* ========================================== */}
                    {isPlaying ? (
                      <div className="w-full flex flex-col justify-between bg-white text-[#1F1B16]">
                        {/* Scentlifestyle Top Header Bar */}
                        <div className="p-3 bg-[#FAF3E4] flex items-center justify-between border-b border-[#C87F4A]/25 z-30">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#773D21]">
                            <Instagram className="w-4 h-4 text-[#E1306C]" />
                            <span>@neelsareehouse</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlayingShortcode(null);
                            }}
                            className="px-2.5 py-1 rounded-full bg-[#1F1B16] hover:bg-stone-800 text-white text-[10px] font-mono flex items-center gap-1 transition-colors shadow-xs"
                            title="Close player"
                          >
                            <X className="w-3 h-3" />
                            <span>Close</span>
                          </button>
                        </div>

                        {/* Official Instagram oEmbed Blockquote Markup */}
                        <div className="p-2 sm:p-3 flex items-center justify-center min-h-[480px]">
                          <blockquote
                            className="instagram-media"
                            data-instgrm-permalink={`https://www.instagram.com/reel/${reel.shortcode}/`}
                            data-instgrm-version="14"
                            style={{
                              background: '#FFF',
                              border: 0,
                              borderRadius: '16px',
                              boxShadow: 'none',
                              margin: '1px',
                              maxWidth: '380px',
                              minWidth: '300px',
                              padding: 0,
                              width: '99.375%',
                            }}
                          >
                            <div style={{ padding: '16px' }}>
                              <a
                                href={`https://www.instagram.com/reel/${reel.shortcode}/`}
                                style={{
                                  background: '#FFFFFF',
                                  lineHeight: 0,
                                  padding: '0 0',
                                  textAlign: 'center',
                                  textDecoration: 'none',
                                  width: '100%',
                                  color: '#C87F4A',
                                  fontSize: '12px',
                                  fontFamily: 'sans-serif',
                                }}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View this reel on Instagram
                              </a>
                            </div>
                          </blockquote>
                        </div>
                      </div>
                    ) : (
                      /* ========================================== */
                      /* CASE B: STATIC THUMBNAIL (Scentlifestyle) */
                      /* Zero Instagram oEmbed overhead on load    */
                      /* ========================================== */
                      <div
                        onClick={() => handleCardClick(reel.shortcode)}
                        className="absolute inset-0 w-full h-full cursor-pointer select-none flex flex-col justify-between p-4"
                      >
                        {/* 1. Thumbnail Image or Generic Placeholder */}
                        {reel.thumbnail_url ? (
                          <img
                            src={reel.thumbnail_url}
                            alt={reel.caption || reel.shortcode}
                            className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 select-none"
                          />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#2B231C] to-[#120F0D] flex items-center justify-center">
                            <div className="text-center p-4">
                              <Instagram className="w-12 h-12 text-[#C87F4A]/40 mx-auto mb-2" />
                              <span className="font-editorial text-sm text-[#FAF3E4]/70 block font-bold">
                                Neel Saree House
                              </span>
                              <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                                @{reel.shortcode}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Luxury Dark Gradient Overlay for Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/50 pointer-events-none" />

                        {/* Top Header: Instagram Handle Badge */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[11px] font-sans shadow-sm">
                            <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />
                            <span className="font-semibold">@neelsareehouse</span>
                          </span>
                        </div>

                        {/* Center: Frosted Glass Play Button Overlay */}
                        <div className="relative z-10 flex items-center justify-center flex-1">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-2xl transition-all transform group-hover/card:scale-115 group-hover/card:bg-[#C87F4A]">
                            <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1 fill-white text-white drop-shadow-md" />
                          </div>
                        </div>

                        {/* Bottom: Caption & Scentlifestyle Prompt */}
                        <div className="relative z-10 space-y-1 text-white">
                          {reel.caption && (
                            <p className="font-editorial text-xs sm:text-sm font-bold leading-snug drop-shadow-md line-clamp-2">
                              {reel.caption}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#E2CE9F] pt-1.5 border-t border-white/15">
                            <span>Tap to watch</span>
                            <span className="underline group-hover/card:text-white transition-colors">
                              Watch Reel ↗
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
