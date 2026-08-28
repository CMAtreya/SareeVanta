'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Phone,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';
import { weaveCategories, fabricFilters, occasionFilters } from '@/lib/products';

const announcements = [
  {
    id: 1,
    content: (
      <span>
        Additional 10% off By Using <strong className="font-bold tracking-wider">WELCOME</strong> Coupon on selected Products <span className="underline cursor-pointer hover:text-amber-200">T&C</span> Apply.
      </span>
    ),
  },
  {
    id: 2,
    content: (
      <span>
        ✦ Complimentary Insured Express Delivery Across India & 45+ Countries.
      </span>
    ),
  },
  {
    id: 3,
    content: (
      <span>
        ✦ 100% Central Silk Board Certified Pure Heirloom Handloom Silks.
      </span>
    ),
  },
  {
    id: 4,
    content: (
      <span>
        ✦ Visit Our Mysuru Flagship Heritage Store on Sayyaji Rao Road.
      </span>
    ),
  },
];

const searchScrollPhrases = [
  'Kanchipuram Sarees',
  'Paithani Sarees',
  'Mysore Silk Sarees',
  'Banarasi Katan Silk',
  'Tissue Georgette Sarees',
  'Pure Zari Bridal Sarees',
  'Organza Floral Sarees',
];

const patternOptions = [
  { name: 'Kasuti Diamonds', desc: 'Mysuru Crest Motif' },
  { name: 'Peacock Mayil & Yanai', desc: 'Kanchipuram Heritage' },
  { name: 'Temple Korvai Border', desc: 'Sacred 3-Shuttle Weave' },
  { name: 'Floral Kadwa Meenakari', desc: 'Banarasi Gold Art' },
  { name: 'Asawali Floral Vines', desc: 'Paithani Tapestry' },
  { name: 'Ashrafi Bootas', desc: 'Chanderi Gold Dots' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, wishlistCount, setIsCartDrawerOpen, cartBounced } = useCart();

  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<{ type: string; text: string; url: string }[]>([]);
  const [matchingProducts, setMatchingProducts] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [liveMarqueeLines, setLiveMarqueeLines] = useState<string[]>([]);
  const [marqueeBgColor, setMarqueeBgColor] = useState<string>('#7A1C30');
  const [marqueeTextColor, setMarqueeTextColor] = useState<string>('#FEF3C7');
  const [isMarqueeActive, setIsMarqueeActive] = useState<boolean>(true);

  // Fetch live published marquee announcements and colors from database
  useEffect(() => {
    fetch(`/api/marquee?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.bgColor) setMarqueeBgColor(data.bgColor);
        if (data.textColor) setMarqueeTextColor(data.textColor);
        if (data.isActive !== undefined) setIsMarqueeActive(Boolean(data.isActive));

        if (data.activeLines && Array.isArray(data.activeLines) && data.activeLines.length > 0) {
          setLiveMarqueeLines(data.activeLines);
        } else if (data.activeMarquee?.message_text && data.activeMarquee.is_active !== false) {
          setLiveMarqueeLines([data.activeMarquee.message_text]);
        }
      })
      .catch((err) => console.error('[Header] Marquee fetch error:', err));
  }, []);

  const dynamicAnnouncements = useMemo(() => {
    if (liveMarqueeLines.length > 0) {
      return liveMarqueeLines.map((line, idx) => ({
        id: idx,
        content: <span style={{ color: marqueeTextColor }}>{line}</span>,
      }));
    }
    return [
      {
        id: 1,
        content: <span style={{ color: marqueeTextColor }}>✨ Silk Mark Certified 100% Pure Handloom Silks Direct from Master Weavers</span>,
      },
    ];
  }, [liveMarqueeLines, marqueeTextColor]);

  // Rotate announcement bar every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % dynamicAnnouncements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [dynamicAnnouncements.length]);

  // Auto-rotate search placeholder phrases (scrolling name only)
  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % searchScrollPhrases.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Instant client-side + debounced server-side search autocomplete
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchSuggestions([]);
      setMatchingProducts([]);
      return;
    }

    // 1. Instant local autocomplete matching
    const localSugs: { type: string; text: string; url: string }[] = [];
    const knownTaxonomies = [
      { type: 'Weave Tradition', name: 'Mysore Silk', url: '/products?weave=Mysore+Silk' },
      { type: 'Weave Tradition', name: 'Kanchipuram', url: '/products?weave=Kanchipuram' },
      { type: 'Weave Tradition', name: 'Banarasi', url: '/products?weave=Banarasi' },
      { type: 'Weave Tradition', name: 'Paithani', url: '/products?weave=Paithani' },
      { type: 'Weave Tradition', name: 'Tissue Georgette', url: '/products?weave=Tissue+Georgette' },
      { type: 'Weave Tradition', name: 'Ikkat', url: '/products?weave=Ikkat' },
      { type: 'Fabric Texture', name: 'Pure Mulberry Silk', url: '/products?fabric=Pure+Mulberry+Silk' },
      { type: 'Fabric Texture', name: 'Soft Silk', url: '/products?fabric=Soft+Silk' },
      { type: 'Fabric Texture', name: 'Crepe Silk', url: '/products?fabric=Crepe+Silk' },
      { type: 'Fabric Texture', name: 'Organza', url: '/products?fabric=Organza' },
      { type: 'Royal Hue', name: 'Crimson Red', url: '/products?color=Crimson+Red' },
      { type: 'Royal Hue', name: 'Peacock Teal', url: '/products?color=Peacock+Teal' },
      { type: 'Royal Hue', name: 'Kanchipuram Gold', url: '/products?color=Kanchipuram+Gold' },
      { type: 'Royal Hue', name: 'Rani Pink', url: '/products?color=Rani+Pink' },
      { type: 'Royal Hue', name: 'Bottle Green', url: '/products?color=Bottle+Green' },
      { type: 'Royal Hue', name: 'Midnight Blue', url: '/products?color=Midnight+Blue' },
      { type: 'Heritage Pattern', name: 'Kasuti Diamonds', url: '/products?search=Kasuti+Diamonds' },
      { type: 'Heritage Pattern', name: 'Peacock Mayil & Yanai', url: '/products?search=Peacock+Mayil' },
      { type: 'Heritage Pattern', name: 'Floral Kadwa Meenakari', url: '/products?search=Kadwa' },
    ];

    knownTaxonomies.forEach((t) => {
      if (t.name.toLowerCase().includes(q)) {
        localSugs.push({ type: t.type, text: t.name, url: t.url });
      }
    });

    setSearchSuggestions(localSugs.slice(0, 5));

    // 2. Debounced API fetch for full catalog & live images
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.suggestions && data.suggestions.length > 0) {
            setSearchSuggestions(data.suggestions);
          }
          if (data.products && Array.isArray(data.products)) {
            setMatchingProducts(data.products.slice(0, 4));
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const prevAnnouncement = () => {
    setAnnouncementIndex((prev) => (prev - 1 + dynamicAnnouncements.length) % dynamicAnnouncements.length);
  };

  const nextAnnouncement = () => {
    setAnnouncementIndex((prev) => (prev + 1) % dynamicAnnouncements.length);
  };

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 220);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim() || searchScrollPhrases[phraseIndex];
    if (query) {
      setSearchFocused(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="w-full z-40 sticky top-0">
      {/* 1. TOP PROMOTIONAL ANNOUNCEMENT BAR */}
      {isMarqueeActive && (
        <div
          style={{ backgroundColor: marqueeBgColor, color: marqueeTextColor }}
          className="py-1.5 px-3 sm:px-6 relative z-50 text-[11px] sm:text-xs font-sans tracking-wide w-full transition-colors duration-300"
        >
          <div className="w-full px-2 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex items-center justify-between">
            <button
              type="button"
              onClick={prevAnnouncement}
              style={{ color: marqueeTextColor }}
              className="p-1 opacity-80 hover:opacity-100 transition-opacity focus:outline-none flex-shrink-0 cursor-pointer"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 text-center overflow-hidden px-2 h-5 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={announcementIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="truncate font-medium"
                  style={{ color: marqueeTextColor }}
                >
                  {dynamicAnnouncements[announcementIndex]?.content}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={nextAnnouncement}
              style={{ color: marqueeTextColor }}
              className="p-1 opacity-80 hover:opacity-100 transition-opacity focus:outline-none flex-shrink-0 cursor-pointer"
              aria-label="Next announcement"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER ROW (Glassmorphism, Centered Scrolling Search Pill, Action Icons) */}
      <div
        className={`w-full relative z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF3E4]/90 backdrop-blur-md shadow-sm border-b border-[#C87F4A]/25'
            : 'bg-[#FAF3E4]/95 backdrop-blur-md border-b border-[#C87F4A]/20'
        }`}
      >
        <div className="w-full px-2.5 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2.5 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-8">
          {/* Mobile Menu Button (Small Screens) */}
          <div className="flex items-center lg:hidden flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="text-[#1F1B16] hover:text-[#7A1C30] p-1 focus:outline-none"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Left: Brand Identity Logo (NEELSAREEHOUSE MYSURU • ESTD. 2021) */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-3 focus:outline-none group flex-shrink-0 min-w-0"
          >
            {/* Brand Emblem Logo with Gold Gradient Ring */}
            <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B] shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF3E4] flex items-center justify-center p-0.5 border border-white/60">
                <picture>
                  <source srcSet="/assets/logo.webp" type="image/webp" />
                  <img
                    src="/assets/logo.jpg"
                    alt="NEELSAREEHOUSE Emblem"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('logo.webp')) {
                        target.src = '/assets/logo.webp';
                      }
                    }}
                  />
                </picture>
              </div>
            </div>

            <div className="flex flex-col items-start min-w-0">
              <span className="font-editorial text-sm xs:text-base sm:text-2xl lg:text-[26px] font-bold tracking-[0.02em] sm:tracking-[0.06em] text-[#1F1B16] uppercase group-hover:text-[#7A1C30] transition-colors leading-none truncate">
                NEELSAREEHOUSE
              </span>
              <span className="text-[7px] sm:text-[9.5px] tracking-[0.16em] sm:tracking-[0.28em] font-sans font-bold text-[#C87F4A] uppercase mt-0.5 sm:mt-1 leading-none">
                MYSURU • ESTD. 2021
              </span>
            </div>
          </Link>

          {/* Center: Long Rounded-Full Search Pill Bar (Desktop & Tablet) */}
          <div className="hidden sm:block flex-1 max-w-4xl 2xl:max-w-6xl mx-3 sm:mx-6 xl:mx-10 relative">
            <form
              onSubmit={handleSearchSubmit}
              className="relative w-full"
            >
              <div
                onClick={() => searchInputRef.current?.focus()}
                className={`relative w-full h-10 sm:h-11 px-5 rounded-full bg-white/80 backdrop-blur-md border transition-all duration-200 flex items-center justify-between cursor-text ${
                  searchFocused
                    ? 'border-[#7A1C30] ring-2 ring-[#7A1C30]/20 bg-white/95 shadow-md'
                    : 'border-[#D9A876]/70 hover:border-[#7A1C30]/70'
                }`}
              >
                {/* Real Text Input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                  className="w-full bg-transparent text-xs sm:text-sm text-[#1F1B16] focus:outline-none z-10 font-sans pr-12"
                />

                {/* Static "Search for" + Animated Dynamic Saree Name (When input is empty) */}
                {!searchQuery && (
                  <div className="absolute left-5 right-12 inset-y-0 flex items-center pointer-events-none overflow-hidden text-xs sm:text-sm text-stone-500 font-sans select-none">
                    <span className="text-stone-600 font-medium mr-1.5 flex-shrink-0">
                      Search for
                    </span>
                    <div className="overflow-hidden h-5 flex items-center flex-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={phraseIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.28, ease: 'easeOut' }}
                          className="truncate text-[#7A1C30] font-sans font-medium"
                        >
                          {searchScrollPhrases[phraseIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Clear (X) or Search Button */}
                <div className="flex items-center gap-1 z-10">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }}
                      className="text-stone-400 hover:text-stone-700 p-1 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="text-[#C87F4A] hover:text-[#7A1C30] transition-colors p-1 flex-shrink-0 focus:outline-none"
                    aria-label="Submit Search"
                  >
                    <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.75]" />
                  </button>
                </div>
              </div>
            </form>

            {/* Instant Search Suggestions & Products Dropdown with Enhanced Glassmorphism */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF3E4]/85 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl shadow-[0_20px_50px_rgba(31,27,22,0.18)] border border-white/80 ring-1 ring-[#C87F4A]/30 p-4 z-50 animate-fade-in max-h-[480px] overflow-y-auto">
                {/* 1. Live Matching Products */}
                {matchingProducts.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#7A1C30] px-2 block mb-2">
                      Matching Sarees ({matchingProducts.length})
                    </span>
                    <div className="space-y-1.5">
                      {matchingProducts.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onMouseDown={() => router.push(`/products/${prod.slug}`)}
                          className="w-full text-left p-2 rounded-xl bg-white/50 hover:bg-white/90 backdrop-blur-md flex items-center gap-3 transition-all border border-white/60 hover:border-[#C87F4A]/40 shadow-2xs group"
                        >
                          <div className="w-10 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                            <img
                              src={prod.images?.[0]}
                              alt={prod.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-[#C87F4A] uppercase font-semibold">
                                {prod.weave}
                              </span>
                              {prod.silkMarkCertified && (
                                <span className="text-[8.5px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Silk Mark
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-editorial font-medium text-stone-900 truncate group-hover:text-[#7A1C30]">
                              {prod.title}
                            </h5>
                            <span className="text-xs font-bold text-stone-800 font-sans">
                              ₹{prod.priceINR.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Categorical Suggestions */}
                {searchSuggestions.length > 0 && (
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#7A1C30] px-2 block">
                      Search Suggestions
                    </span>
                    {searchSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => router.push(sug.url)}
                        className="w-full text-left px-3 py-2 rounded-xl bg-white/40 hover:bg-white/90 backdrop-blur-md text-xs font-sans text-[#1F1B16] flex items-center justify-between transition-all border border-transparent hover:border-[#C87F4A]/30 group"
                      >
                        <span className="font-medium group-hover:text-[#7A1C30]">{sug.text}</span>
                        <span className="text-[10px] font-mono text-[#C87F4A] uppercase">
                          {sug.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Popular Searches Pills (Shown when query is empty or as footer) */}
                {(!searchQuery.trim() || (matchingProducts.length === 0 && searchSuggestions.length === 0)) && (
                  <div className="space-y-2 pt-2.5 border-t border-[#C87F4A]/20">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-600 block px-2">
                      Popular Searches
                    </span>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {[
                        'Mysore Silk Crepe',
                        'Bridal Kanchipuram',
                        'Banarasi Katan',
                        '24K Pure Zari',
                        'Soft Silk Sarees',
                        'Champagne Tissue',
                      ].map((term, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={() => {
                            setSearchQuery(term);
                            router.push(`/search?q=${encodeURIComponent(term)}`);
                          }}
                          className="text-[11px] bg-white/70 hover:bg-[#7A1C30] hover:text-white backdrop-blur-sm px-3 py-1 rounded-full text-stone-700 transition-all border border-[#C87F4A]/30 shadow-2xs font-sans cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: User Profile, Wishlist, Shopping Bag Icon Cluster (INR Removed) */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {/* Profile / Account */}
            <Link
              href="/account"
              className="p-1.5 text-stone-800 hover:text-[#7A1C30] transition-colors focus:outline-none"
              aria-label="User Account"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
            </Link>

            {/* Wishlist with Red Circular Badge */}
            <Link
              href="/account/wishlist"
              className="relative p-1.5 text-stone-800 hover:text-[#7A1C30] transition-colors focus:outline-none"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              <span className="absolute -top-0.5 -right-0.5 bg-[#7A1C30] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-sans">
                {wishlistCount}
              </span>
            </Link>

            {/* Shopping Bag with Red Circular Badge & Spring Elastic Bounce */}
            <button
              id="header-cart-button"
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-1.5 text-stone-800 hover:text-[#7A1C30] transition-colors focus:outline-none"
              aria-label="Shopping Bag"
            >
              <motion.div
                animate={
                  cartBounced
                    ? {
                        scale: [1, 1.4, 0.85, 1.2, 1],
                        rotate: [0, -10, 10, -5, 0],
                      }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.5]" />
              </motion.div>
              <span className="absolute -top-0.5 -right-0.5 bg-[#7A1C30] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-sans">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dedicated Full-Width Search Bar Row */}
        <div className="sm:hidden px-4 pb-3 pt-1.5 border-t border-[#C87F4A]/15 bg-[#FAF3E4]/95 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div
              onClick={() => searchInputRef.current?.focus()}
              className={`relative w-full h-10 px-4 rounded-full bg-white/90 border transition-all flex items-center justify-between shadow-2xs ${
                searchFocused ? 'border-[#7A1C30] ring-2 ring-[#7A1C30]/20' : 'border-[#D9A876]'
              }`}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                className="w-full bg-transparent text-xs text-[#1F1B16] focus:outline-none pr-10 font-sans"
              />
              {!searchQuery && (
                <div className="absolute left-4 right-10 inset-y-0 flex items-center pointer-events-none text-xs text-stone-500 font-sans select-none">
                  <span className="text-stone-600 font-medium mr-1.5 flex-shrink-0">Search for</span>
                  <div className="overflow-hidden h-5 flex items-center flex-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={phraseIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="truncate text-[#7A1C30] font-medium"
                      >
                        {searchScrollPhrases[phraseIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1 z-10">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    className="text-stone-400 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button type="submit" className="text-[#C87F4A] p-1">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 3. BOTTOM CATEGORY NAVIGATION BAR (Glassmorphic 4-Category Bar) */}
      <nav className="hidden lg:block w-full relative z-20 bg-[#FAF3E4]/85 backdrop-blur-md border-b border-[#C87F4A]/15 py-2.5">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <ul className="flex items-center justify-center gap-10 xl:gap-14 text-xs font-sans font-semibold tracking-wide uppercase text-stone-800">
            {/* 1. Shop by Category (Comprehensive Mega-Menu - 4 Columns: Weave, Fabric, Occasion, Pattern) */}
            <li
              className="relative py-1"
              onMouseEnter={() => handleMouseEnter('categories')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`hover:text-[#7A1C30] transition-colors flex items-center gap-1.5 focus:outline-none ${
                  activeDropdown === 'categories' ? 'text-[#7A1C30] font-bold' : ''
                }`}
              >
                <span>Shop By Category</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === 'categories' ? 'rotate-180 text-[#7A1C30]' : 'text-stone-500'
                }`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'categories' && (
                  <div className="absolute top-full -left-36 pt-3 z-50">
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="w-[860px] bg-gradient-to-b from-[#FAF5EE]/95 via-white/90 to-[#FAF3E4]/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(122,28,48,0.18)] border border-white/80 ring-1 ring-[#C87F4A]/25 p-7 text-stone-900 overflow-hidden relative"
                    >
                      {/* Subtle Glass Shimmer / Radial Ambient Glow */}
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#7A1C30]/10 via-[#C87F4A]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-[#C87F4A]/10 via-amber-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

                      {/* Header row in mega menu */}
                      <div className="relative flex items-center justify-between pb-3.5 border-b border-[#C87F4A]/20 mb-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#7A1C30]" />
                          <span className="text-[11px] uppercase tracking-[0.25em] text-[#7A1C30] font-mono font-bold">
                            Royal Handloom Curation Matrix
                          </span>
                        </div>
                        <Link
                          href="/products"
                          onClick={() => setActiveDropdown(null)}
                          className="text-[11px] text-[#7A1C30] hover:text-[#5B1021] font-bold flex items-center gap-1.5 uppercase tracking-wider bg-white/80 hover:bg-white px-3 py-1 rounded-full border border-[#C87F4A]/30 transition-all shadow-2xs"
                        >
                          <span>Explore All Handlooms (600+ Pieces)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* 4-Column Layout (Color Removed) */}
                      <div className="relative grid grid-cols-4 gap-4">
                        {/* 1. Shop by Weave */}
                        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-2xs hover:border-[#C87F4A]/40 transition-colors space-y-3">
                          <div>
                            <span className="text-xs font-bold text-[#7A1C30] tracking-wider uppercase block font-editorial">
                              Shop by Weave
                            </span>
                            <div className="h-[1.5px] w-full bg-gradient-to-r from-[#7A1C30] via-[#C87F4A] to-transparent mt-1" />
                          </div>
                          <ul className="space-y-1.5 text-xs text-stone-700 font-sans font-normal normal-case">
                            {weaveCategories.map((wc) => (
                              <li key={wc.id}>
                                <Link
                                  href={`/products?weave=${encodeURIComponent(wc.name)}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#7A1C30] hover:shadow-2xs transition-all block truncate font-medium"
                                >
                                  {wc.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 2. Shop by Fabric */}
                        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-2xs hover:border-[#C87F4A]/40 transition-colors space-y-3">
                          <div>
                            <span className="text-xs font-bold text-[#7A1C30] tracking-wider uppercase block font-editorial">
                              Shop by Fabric
                            </span>
                            <div className="h-[1.5px] w-full bg-gradient-to-r from-[#7A1C30] via-[#C87F4A] to-transparent mt-1" />
                          </div>
                          <ul className="space-y-1.5 text-xs text-stone-700 font-sans font-normal normal-case">
                            {fabricFilters.map((fabric, idx) => (
                              <li key={idx}>
                                <Link
                                  href={`/products?fabric=${encodeURIComponent(fabric)}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#7A1C30] hover:shadow-2xs transition-all block truncate font-medium"
                                >
                                  {fabric}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 3. Shop by Occasion */}
                        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-2xs hover:border-[#C87F4A]/40 transition-colors space-y-3">
                          <div>
                            <span className="text-xs font-bold text-[#7A1C30] tracking-wider uppercase block font-editorial">
                              Shop by Occasion
                            </span>
                            <div className="h-[1.5px] w-full bg-gradient-to-r from-[#7A1C30] via-[#C87F4A] to-transparent mt-1" />
                          </div>
                          <ul className="space-y-1.5 text-xs text-stone-700 font-sans font-normal normal-case">
                            {occasionFilters.map((occ, idx) => (
                              <li key={idx}>
                                <Link
                                  href={`/products?occasion=${encodeURIComponent(occ)}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#7A1C30] hover:shadow-2xs transition-all block truncate font-medium"
                                >
                                  {occ}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 4. Shop by Pattern */}
                        <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-2xs hover:border-[#C87F4A]/40 transition-colors space-y-3">
                          <div>
                            <span className="text-xs font-bold text-[#7A1C30] tracking-wider uppercase block font-editorial">
                              Shop by Pattern
                            </span>
                            <div className="h-[1.5px] w-full bg-gradient-to-r from-[#7A1C30] via-[#C87F4A] to-transparent mt-1" />
                          </div>
                          <ul className="space-y-1.5 text-xs text-stone-700 font-sans font-normal normal-case">
                            {patternOptions.map((p, idx) => (
                              <li key={idx}>
                                <Link
                                  href={`/products?search=${encodeURIComponent(p.name)}`}
                                  onClick={() => setActiveDropdown(null)}
                                  className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-[#7A1C30] hover:shadow-2xs transition-all block group"
                                >
                                  <span className="block truncate font-medium text-xs leading-tight">{p.name}</span>
                                  <span className="block text-[9.5px] text-stone-400 font-mono tracking-tight leading-tight">{p.desc}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Footer Badge strip in mega menu */}
                      <div className="relative mt-5 pt-3.5 border-t border-[#C87F4A]/15 flex items-center justify-between text-[10.5px] font-mono text-[#7A1C30]">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#C87F4A]" />
                            <span>100% Central Silk Board Silk Mark</span>
                          </span>
                          <span className="text-stone-300">•</span>
                          <span>24K Tested Zari Mastery</span>
                          <span className="text-stone-300">•</span>
                          <span>Complimentary Fall & Pico Included</span>
                        </div>
                        <span className="text-stone-500 italic">Dispatched from Mysuru Flagship Guild</span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </li>

            {/* 2. New Arrival */}
            <li>
              <Link
                href="/products?filter=new"
                className={`hover:text-[#7A1C30] transition-colors ${
                  pathname === '/products' ? 'hover:text-[#7A1C30]' : ''
                }`}
              >
                New Arrival
              </Link>
            </li>

            {/* 3. Bridal */}
            <li>
              <Link
                href="/products?occasion=Bridal+%26+Muhurtham"
                className="text-[#7A1C30] hover:text-[#5B1021] transition-colors flex items-center gap-1 font-bold"
              >
                <span>Bridal</span>
                <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
              </Link>
            </li>

            {/* 4. Our Story */}
            <li>
              <Link
                href="/our-story"
                className={`transition-colors ${
                  pathname === '/our-story'
                    ? 'text-[#7A1C30] font-bold border-b-2 border-[#7A1C30] pb-0.5'
                    : 'hover:text-[#7A1C30]'
                }`}
              >
                Our Story
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF3E4] shadow-2xl p-6 flex flex-col justify-between border-r border-[#C87F4A]/30 z-10 overflow-y-auto"
            >
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-5 border-b border-[#C87F4A]/20">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B] shadow-xs flex-shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF3E4] flex items-center justify-center p-0.5 border border-white/60">
                        <img
                          src="/logo.png"
                          alt="NEELSAREEHOUSE Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-editorial text-base font-bold text-[#1F1B16] tracking-[0.06em] uppercase leading-none">
                        NEELSAREEHOUSE
                      </h3>
                      <span className="text-[7.5px] tracking-[0.24em] text-[#C87F4A] font-sans font-bold block mt-1 leading-none">
                        MYSURU • ESTD. 2021
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-700 hover:text-[#7A1C30] p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="mt-5 space-y-3 text-xs uppercase tracking-wider font-semibold">
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-900 hover:text-[#7A1C30] block py-2 border-b border-stone-200"
                  >
                    Shop by Category
                  </Link>
                  <Link
                    href="/products?filter=new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-900 hover:text-[#7A1C30] block py-2 border-b border-stone-200"
                  >
                    New Arrival
                  </Link>
                  <Link
                    href="/products?occasion=Bridal+%26+Muhurtham"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#7A1C30] font-bold block py-2 border-b border-stone-200"
                  >
                    Bridal & Muhurtham
                  </Link>
                  <Link
                    href="/our-story"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-900 hover:text-[#7A1C30] block py-2 border-b border-stone-200"
                  >
                    Our Story
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-900 hover:text-[#7A1C30] block py-2 border-b border-stone-200"
                  >
                    My Account & Orders
                  </Link>
                </div>
              </div>

              {/* VIP WhatsApp Concierge */}
              <div className="pt-6 border-t border-[#C87F4A]/20">
                <a
                  href="https://wa.me/918212423344"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#7A1C30] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#5B1021] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp VIP Concierge</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
