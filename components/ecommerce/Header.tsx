'use client';

import { useState, useRef, useEffect } from 'react';
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
  ArrowRight,
  Globe,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';
import { weaveCategories, fabricFilters, occasionFilters } from '@/lib/products';
import OfferMarquee from './OfferMarquee';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, wishlistCount, setIsCartDrawerOpen, currency, setCurrency, cartBounced } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<{ type: string; text: string; url: string }[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search autocomplete in Header
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error(err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuKey);
    setHoveredNav(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setHoveredNav(null);
    }, 200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Top Promotional Offer Marquee */}
      <OfferMarquee />

      {/* Main Luxury Header - UI/UX Pro Max 3-Column Centered Layout */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF3E4]/95 backdrop-blur-md shadow-sm border-b border-[#C87F4A]/25 py-2'
            : 'bg-[#FAF3E4] border-b border-[#C87F4A]/15 py-2.5 sm:py-3'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between h-10">
            {/* 1. Left: Mobile Menu Trigger + Compact Brand Identity (min-w-[180px]) */}
            <div className="flex items-center gap-2.5 min-w-max lg:min-w-[200px] flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="text-[#1F1B16] hover:text-[#C87F4A] transition-colors p-1.5 lg:hidden rounded-md focus:outline-none"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 group focus:outline-none"
              >
                {/* Decreased Size Brand Logo Emblem */}
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full p-[1.5px] bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B] shadow-xs"
                >
                  <div className="w-full h-full rounded-full bg-[#FAF3E4] overflow-hidden flex items-center justify-center p-0.5">
                    <img
                      src="/logo.png"
                      alt="Neelsareehouse Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </motion.div>

                {/* Decreased Size Brand Wordmark & Estd. 2021 */}
                <div className="flex flex-col justify-center">
                  <span className="font-editorial text-sm sm:text-base font-bold tracking-[0.1em] text-[#1F1B16] leading-none uppercase group-hover:text-[#C87F4A] transition-colors">
                    Neelsareehouse
                  </span>
                  <span className="text-[8px] tracking-[0.22em] uppercase text-[#773D21] font-mono font-medium mt-0.5 leading-none">
                    Mysuru • Estd. 2021
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. Center: Perfectly Centered Mega-Menu Navigation */}
            <nav
              className="hidden lg:flex flex-1 items-center justify-center gap-1 xl:gap-2 text-[11px] xl:text-[12px] tracking-[0.12em] uppercase font-sans font-semibold text-[#1F1B16]/85"
            >
              {/* 1. Shop By Weave Dropdown */}
              <div
                className="relative py-1"
                onMouseEnter={() => handleMouseEnter('weave')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/products"
                  className={`relative px-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1 z-10 ${
                    activeDropdown === 'weave' || hoveredNav === 'weave'
                      ? 'text-[#C87F4A]'
                      : 'text-[#1F1B16]/85 hover:text-[#C87F4A]'
                  }`}
                >
                  <span>Shop By Weave</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      activeDropdown === 'weave' ? 'rotate-180 text-[#C87F4A]' : ''
                    }`}
                  />
                  {hoveredNav === 'weave' && (
                    <motion.span
                      layoutId="navHoverPill"
                      className="absolute inset-0 bg-[#C87F4A]/10 rounded-full -z-10 border border-[#C87F4A]/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {activeDropdown === 'weave' && (
                    <div className="absolute top-full -left-12 pt-2 z-50">
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="w-[640px] bg-[#FAF3E4]/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#C87F4A]/30 p-5"
                      >
                        <div className="flex items-center justify-between pb-2.5 border-b border-[#C87F4A]/20 mb-3">
                          <span className="text-[10px] uppercase tracking-widest text-[#C87F4A] font-mono font-bold">
                            Royal Handloom Clusters
                          </span>
                          <Link
                            href="/products"
                            onClick={() => setActiveDropdown(null)}
                            className="text-[10px] text-[#773D21] hover:text-[#C87F4A] font-medium flex items-center gap-1 font-sans uppercase tracking-wider"
                          >
                            <span>Explore All (600+ Pieces)</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {weaveCategories.map((wc) => (
                            <Link
                              key={wc.id}
                              href={`/products?weave=${encodeURIComponent(wc.name)}`}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-[#C87F4A]/25 group/item"
                            >
                              <img
                                src={wc.image}
                                alt={wc.name}
                                className="w-9 h-9 rounded-lg object-cover border border-[#C87F4A]/20 group-hover/item:scale-105 transition-transform"
                              />
                              <div>
                                <span className="text-xs font-editorial font-bold text-[#1F1B16] group-hover/item:text-[#C87F4A] block leading-tight">
                                  {wc.name}
                                </span>
                                <span className="text-[10px] text-stone-500 font-sans">
                                  {wc.count}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Shop By Fabric Dropdown */}
              <div
                className="relative py-1"
                onMouseEnter={() => handleMouseEnter('fabric')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/products"
                  className={`relative px-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1 z-10 ${
                    activeDropdown === 'fabric' || hoveredNav === 'fabric'
                      ? 'text-[#C87F4A]'
                      : 'text-[#1F1B16]/85 hover:text-[#C87F4A]'
                  }`}
                >
                  <span>Shop By Fabric</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      activeDropdown === 'fabric' ? 'rotate-180 text-[#C87F4A]' : ''
                    }`}
                  />
                  {hoveredNav === 'fabric' && (
                    <motion.span
                      layoutId="navHoverPill"
                      className="absolute inset-0 bg-[#C87F4A]/10 rounded-full -z-10 border border-[#C87F4A]/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {activeDropdown === 'fabric' && (
                    <div className="absolute top-full -left-6 pt-2 z-50">
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="w-[400px] bg-[#FAF3E4]/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#C87F4A]/30 p-4"
                      >
                        <span className="text-[10px] uppercase tracking-widest text-[#C87F4A] font-mono font-bold block pb-2 border-b border-[#C87F4A]/20 mb-2.5">
                          Pure Silk & Handloom Textures
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {fabricFilters.map((fabric, idx) => (
                            <Link
                              key={idx}
                              href={`/products?fabric=${encodeURIComponent(fabric)}`}
                              onClick={() => setActiveDropdown(null)}
                              className="px-2.5 py-1.5 text-xs font-sans text-[#1F1B16] hover:text-[#C87F4A] hover:bg-white rounded-lg transition-colors"
                            >
                              {fabric}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Shop By Occasion Dropdown */}
              <div
                className="relative py-1"
                onMouseEnter={() => handleMouseEnter('occasion')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/products"
                  className={`relative px-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1 z-10 ${
                    activeDropdown === 'occasion' || hoveredNav === 'occasion'
                      ? 'text-[#C87F4A]'
                      : 'text-[#1F1B16]/85 hover:text-[#C87F4A]'
                  }`}
                >
                  <span>Occasions</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      activeDropdown === 'occasion' ? 'rotate-180 text-[#C87F4A]' : ''
                    }`}
                  />
                  {hoveredNav === 'occasion' && (
                    <motion.span
                      layoutId="navHoverPill"
                      className="absolute inset-0 bg-[#C87F4A]/10 rounded-full -z-10 border border-[#C87F4A]/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {activeDropdown === 'occasion' && (
                    <div className="absolute top-full left-0 pt-2 z-50">
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="w-[340px] bg-[#FAF3E4]/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#C87F4A]/30 p-4"
                      >
                        <span className="text-[10px] uppercase tracking-widest text-[#C87F4A] font-mono font-bold block pb-2 border-b border-[#C87F4A]/20 mb-2.5">
                          Curations by Celebration
                        </span>
                        <div className="space-y-1">
                          {occasionFilters.map((occ, idx) => (
                            <Link
                              key={idx}
                              href={`/products?occasion=${encodeURIComponent(occ)}`}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between px-2.5 py-1.5 text-xs font-sans text-[#1F1B16] hover:text-[#C87F4A] hover:bg-white rounded-lg transition-colors"
                            >
                              <span>{occ}</span>
                              <ArrowRight className="w-3 h-3 text-[#C87F4A]" />
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. New Arrivals */}
              <div
                className="relative py-1"
                onMouseEnter={() => setHoveredNav('new')}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Link
                  href="/products?filter=new"
                  className="relative px-2.5 py-1.5 rounded-full transition-colors flex items-center z-10 hover:text-[#C87F4A]"
                >
                  <span>New Arrivals</span>
                  {hoveredNav === 'new' && (
                    <motion.span
                      layoutId="navHoverPill"
                      className="absolute inset-0 bg-[#C87F4A]/10 rounded-full -z-10 border border-[#C87F4A]/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </Link>
              </div>

              {/* 5. Bridal */}
              <div
                className="relative py-1"
                onMouseEnter={() => setHoveredNav('bridal')}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Link
                  href="/products?occasion=Bridal+%26+Muhurtham"
                  className="relative px-2.5 py-1.5 rounded-full text-[#9E2A2B] hover:text-[#C87F4A] font-bold transition-colors flex items-center gap-1 z-10"
                >
                  <span>Bridal</span>
                  <Sparkles className="w-3 h-3 text-[#C87F4A]" />
                  {hoveredNav === 'bridal' && (
                    <motion.span
                      layoutId="navHoverPill"
                      className="absolute inset-0 bg-red-50/80 rounded-full -z-10 border border-red-200/60"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </Link>
              </div>

              {/* 6. OUR STORY (MANDATORY INVARIANT LINK TO /our-story) */}
              <div
                className="relative py-1"
                onMouseEnter={() => setHoveredNav('story')}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <Link
                  href="/our-story"
                  className={`relative px-3 py-1.5 rounded-full font-bold transition-colors flex items-center z-10 ${
                    pathname === '/our-story'
                      ? 'text-white bg-[#C87F4A] shadow-xs'
                      : 'text-[#C87F4A] hover:text-[#9E471D]'
                  }`}
                >
                  <span>Our Story</span>
                  {hoveredNav === 'story' && pathname !== '/our-story' && (
                    <motion.span
                      layoutId="navHoverPill"
                      className="absolute inset-0 bg-[#C87F4A]/15 rounded-full -z-10 border border-[#C87F4A]/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                    />
                  )}
                </Link>
              </div>
            </nav>

            {/* 3. Right: Action Suite with Framer Motion Spring Badges (min-w-[200px] justify-end) */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5 min-w-max lg:min-w-[200px] flex-shrink-0">
              {/* Currency Selector */}
              <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 border border-[#C87F4A]/20 text-xs text-stone-600 mr-1">
                <Globe className="w-3 h-3 text-[#C87F4A]" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-[10.5px] font-mono font-semibold uppercase text-[#1F1B16] focus:outline-none cursor-pointer"
                  aria-label="Select Currency"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              {/* Search Trigger */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F1B16] hover:text-[#C87F4A] hover:bg-white/80 transition-colors focus:outline-none"
                aria-label="Search Silk Sarees"
              >
                <Search className="w-4 h-4" />
              </motion.button>

              {/* Account Link */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Link
                  href="/account"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F1B16] hover:text-[#C87F4A] hover:bg-white/80 transition-colors hidden sm:flex focus:outline-none"
                  aria-label="Customer Account"
                >
                  <User className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Wishlist Link with Spring Badge */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                <Link
                  href="/account/wishlist"
                  className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#1F1B16] hover:text-[#C87F4A] hover:bg-white/80 transition-colors focus:outline-none"
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4" />
                  <AnimatePresence>
                    {wishlistCount > 0 && (
                      <motion.span
                        key={`wishlist-${wishlistCount}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute -top-0.5 -right-0.5 bg-[#1F1B16] text-[#FAF3E4] text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-xs"
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>

              {/* Cart Drawer Trigger with Spring Badge */}
              <motion.button
                id="header-cart-button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                animate={
                  cartBounced
                    ? {
                        scale: [1, 1.45, 0.85, 1.25, 1],
                        rotate: [0, -12, 12, -6, 0],
                      }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.5, ease: 'easeOut' }}
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-[#1F1B16] hover:text-[#C87F4A] hover:bg-white/80 transition-colors focus:outline-none"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className={`w-4 h-4 transition-colors ${cartBounced ? 'text-[#C87F4A]' : ''}`} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={`cart-${cartCount}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: cartBounced ? 1.35 : 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-0.5 -right-0.5 bg-[#C87F4A] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-xs"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Expandable Search Modal with Glassmorphism & Framer Motion */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative bg-[#FAF3E4] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#C87F4A]/30 z-10 text-[#1F1B16]"
            >
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-5 right-5 text-stone-500 hover:text-black p-1.5 rounded-full bg-white border border-stone-200 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-xs uppercase tracking-widest text-[#C87F4A] font-bold block mb-2 font-mono">
                Search Neelsareehouse Catalog
              </span>

              <form onSubmit={handleSearchSubmit} className="relative mt-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by weave, fabric, occasion, color (e.g. Mysore Crepe, Kanchipuram Bridal, 24K Zari)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3.5 bg-white border border-[#C87F4A]/30 rounded-xl text-sm focus:outline-none focus:border-[#C87F4A] shadow-inner font-sans text-[#1F1B16]"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 p-1.5 bg-[#C87F4A] text-white rounded-lg hover:bg-[#B36737] transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Live Autocomplete List */}
              {searchSuggestions.length > 0 && (
                <div className="mt-3 p-2 bg-white rounded-xl border border-[#C87F4A]/20 shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#C87F4A] px-2 block">
                    Suggestions
                  </span>
                  {searchSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(sug.url);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-[#FAF3E4] text-xs font-sans text-[#1F1B16] flex items-center justify-between transition-colors group"
                    >
                      <span className="truncate group-hover:text-[#C87F4A] font-medium">
                        {sug.text}
                      </span>
                      <span className="text-[9px] uppercase font-mono text-stone-400">
                        {sug.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#773D21] block mb-2 font-sans">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Mysore Silk Crepe',
                    'Bridal Kanchipuram',
                    'Banarasi Katan',
                    '24K Pure Zari',
                    'Soft Silk Sarees',
                    'Champagne Tissue',
                  ].map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(`/search?q=${encodeURIComponent(tag)}`);
                      }}
                      className="bg-white hover:bg-[#C87F4A] hover:text-white text-stone-700 text-xs px-3 py-1.5 rounded-full border border-[#C87F4A]/20 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu with Framer Motion */}
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
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full p-0.5 bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B]">
                      <img
                        src="/logo.png"
                        alt="Neelsareehouse"
                        className="w-full h-full object-contain bg-[#FAF3E4] rounded-full p-0.5"
                      />
                    </div>
                    <div>
                      <h3 className="font-editorial text-sm font-bold text-[#1F1B16]">
                        Neelsareehouse
                      </h3>
                      <span className="text-[8px] tracking-widest text-[#773D21] font-mono block">
                        Mysuru • Estd. 2021
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-700 hover:text-[#C87F4A] p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Links */}
                <div className="mt-6 space-y-3.5 text-xs uppercase tracking-widest font-semibold">
                  <Link
                    href="/our-story"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#C87F4A] font-bold block py-2 border-b border-[#C87F4A]/30"
                  >
                    ✦ Our Story (Loom Journey)
                  </Link>

                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#1F1B16] hover:text-[#C87F4A] block py-2 border-b border-stone-200"
                  >
                    Shop By Weave (All Categories)
                  </Link>

                  <Link
                    href="/products?occasion=Bridal+%26+Muhurtham"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#9E2A2B] font-bold block py-2 border-b border-stone-200"
                  >
                    Bridal & Muhurtham Trousseau
                  </Link>

                  <Link
                    href="/products?filter=new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#1F1B16] hover:text-[#C87F4A] block py-2 border-b border-stone-200"
                  >
                    New Arrivals
                  </Link>

                  <Link
                    href="/try-on"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#1F1B16] hover:text-[#C87F4A] block py-2 border-b border-stone-200"
                  >
                    Virtual AI Drape Try-On
                  </Link>

                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#1F1B16] hover:text-[#C87F4A] block py-2 border-b border-stone-200"
                  >
                    My Account & Orders
                  </Link>
                </div>
              </div>

              {/* Mobile Bottom Contact */}
              <div className="pt-6 border-t border-[#C87F4A]/20">
                <a
                  href="https://wa.me/918212423344"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#C87F4A] text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp VIP Concierge</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
