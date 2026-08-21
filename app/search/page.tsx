'use client';

import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  ChevronRight,
  ArrowUpDown,
  Grid3X3,
  LayoutGrid,
  RotateCcw,
  Tag,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { products, Product } from '@/lib/products';
import ProductCard from '@/components/ecommerce/ProductCard';

interface SearchSuggestion {
  type: 'category' | 'product' | 'query';
  text: string;
  url: string;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawQuery = searchParams.get('q') || '';

  const [inputQuery, setInputQuery] = useState(rawQuery);
  const [activeQuery, setActiveQuery] = useState(rawQuery);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Sync state when URL param changes
  useEffect(() => {
    setInputQuery(rawQuery);
    setActiveQuery(rawQuery);
  }, [rawQuery]);

  // Click outside listener to close autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live debounced autocomplete fetch as user types
  useEffect(() => {
    if (!inputQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(inputQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setIsSuggestionsOpen(true);
        }
      } catch (e) {
        console.error('Error fetching autocomplete suggestions:', e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputQuery]);

  // Main search query execution from API
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const executeSearch = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(activeQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            let items: Product[] = data.products || [];
            // Apply sorting
            if (sortBy === 'price-low') items.sort((a, b) => a.priceINR - b.priceINR);
            else if (sortBy === 'price-high') items.sort((a, b) => b.priceINR - a.priceINR);
            else if (sortBy === 'newest') items.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            else if (sortBy === 'popularity') items.sort((a, b) => b.reviewCount - a.reviewCount);

            setSearchResults(items);
            setIsLoading(false);
          }
          return;
        }
      } catch (err) {
        console.error('API search failed, falling back to client search:', err);
      }

      // Client Fallback
      if (isMounted) {
        if (!activeQuery.trim()) {
          setSearchResults(products);
        } else {
          const lower = activeQuery.toLowerCase();
          const filtered = products.filter(
            (p) =>
              p.title.toLowerCase().includes(lower) ||
              p.weave.toLowerCase().includes(lower) ||
              p.fabric.toLowerCase().includes(lower) ||
              p.occasion.toLowerCase().includes(lower) ||
              p.color.toLowerCase().includes(lower) ||
              p.zariGrade.toLowerCase().includes(lower) ||
              p.description.toLowerCase().includes(lower)
          );
          setSearchResults(filtered);
        }
        setIsLoading(false);
      }
    };

    executeSearch();
    return () => {
      isMounted = false;
    };
  }, [activeQuery, sortBy]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setIsSuggestionsOpen(false);
      setActiveQuery(inputQuery.trim());
      router.push(`/search?q=${encodeURIComponent(inputQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (url: string) => {
    setIsSuggestionsOpen(false);
    router.push(url);
  };

  // Popular category suggestion chips for zero-results / exploration
  const popularChips = [
    { label: 'Royal Mysore Silk', query: 'Mysore Silk', url: '/products?weave=Mysore%20Silk' },
    { label: 'Bridal Kanchipuram', query: 'Kanchipuram', url: '/products?weave=Kanchipuram' },
    { label: 'Banarasi Katan', query: 'Banarasi', url: '/products?weave=Banarasi' },
    { label: 'Silk Organza', query: 'Organza', url: '/products?weave=Organza' },
    { label: '24K Tested Pure Zari', query: 'Zari', url: '/products' },
  ];

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Breadcrumb Row */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 font-sans mb-6">
          <Link href="/" className="hover:text-[#C87F4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link href="/products" className="hover:text-[#C87F4A] transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-[#1F1B16] font-semibold">Search Results</span>
        </nav>

        {/* Search Header Banner with Live Autocomplete Bar */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neelsareehouse Search Archive</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-[#1F1B16] tracking-tight">
            {activeQuery ? (
              <>
                Search Results for <span className="text-[#C87F4A]">"{activeQuery}"</span>
              </>
            ) : (
              'Discover Heirloom Silk Sarees'
            )}
          </h1>

          {/* Interactive Search Bar with Live Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative mt-6 max-w-2xl mx-auto">
            <form onSubmit={handleFormSubmit} className="relative">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setIsSuggestionsOpen(true);
                }}
                placeholder="Search by weave, fabric, occasion, color (e.g. Mysore Crepe, Bridal Kanchipuram, 24K Zari)..."
                className="w-full pl-5 pr-24 py-4 bg-white border border-[#C87F4A]/35 rounded-2xl text-sm focus:outline-none focus:border-[#C87F4A] shadow-silk text-[#1F1B16] font-sans"
              />

              {inputQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setInputQuery('');
                    setActiveQuery('');
                    router.push('/search');
                  }}
                  className="absolute right-12 top-4 text-stone-400 hover:text-black p-1"
                  aria-label="Clear Search Input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-2.5 top-2.5 px-4 py-2.5 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 text-xs font-bold font-sans uppercase tracking-wider"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* Live Autocomplete Suggestions Dropdown */}
            <AnimatePresence>
              {isSuggestionsOpen && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#FAF3E4]/98 backdrop-blur-xl border border-[#C87F4A]/30 rounded-2xl p-4 shadow-2xl z-50 text-left"
                >
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#C87F4A] block mb-2 px-2">
                    Matching Suggestions
                  </span>
                  <div className="space-y-1">
                    {suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(sug.url)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-sans text-[#1F1B16] transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Search className="w-3.5 h-3.5 text-[#C87F4A] flex-shrink-0" />
                          <span className="truncate group-hover:text-[#C87F4A] font-medium">
                            {sug.text}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 group-hover:text-[#773D21] flex-shrink-0">
                          {sug.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Toolbar: Result Count + Sort + Grid Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-[#C87F4A]/20 text-xs text-stone-600">
          <div className="font-mono text-xs text-[#1F1B16]">
            {activeQuery ? (
              <span>
                Found <strong className="text-[#C87F4A]">{searchResults.length}</strong> matching creations for{' '}
                <strong>"{activeQuery}"</strong>
              </span>
            ) : (
              <span>
                Showing all <strong className="text-[#C87F4A]">{searchResults.length}</strong> creations in catalog
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C87F4A]" />
              <span className="hidden sm:inline font-sans font-semibold uppercase tracking-wider text-[#773D21] text-[11px]">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#C87F4A]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#1F1B16] focus:outline-none focus:border-[#C87F4A] cursor-pointer shadow-xs font-sans"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popularity">Popularity / Ratings</option>
              </select>
            </div>

            {/* Desktop Grid Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-lg border border-[#C87F4A]/25 shadow-xs">
              <button
                type="button"
                onClick={() => setGridCols(3)}
                className={`p-1 rounded transition-colors ${
                  gridCols === 3 ? 'bg-[#C87F4A] text-white' : 'text-stone-500 hover:text-black'
                }`}
                aria-label="3 Column Grid View"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                className={`p-1 rounded transition-colors ${
                  gridCols === 4 ? 'bg-[#C87F4A] text-white' : 'text-stone-500 hover:text-black'
                }`}
                aria-label="4 Column Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#C87F4A] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono text-stone-500">Searching royal handloom archives...</p>
          </div>
        ) : searchResults.length === 0 ? (
          /* Friendly No-Results State with Suggested Category Chips */
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-[#C87F4A]/25 p-8 max-w-xl mx-auto shadow-silk space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#FAF3E4] border border-[#C87F4A]/30 flex items-center justify-center mx-auto text-[#C87F4A] shadow-xs">
              <Search className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                No matching sarees found
              </h3>
              <p className="text-xs text-stone-600 font-sans max-w-md mx-auto mt-2 leading-relaxed">
                We couldn't find any creations matching <strong>"{activeQuery}"</strong>. Explore our most cherished royal clusters below:
              </p>
            </div>

            {/* Clickable Suggested Category Chips */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#773D21] block">
                Suggested Handloom Clusters
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {popularChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputQuery(chip.query);
                      setActiveQuery(chip.query);
                      router.push(`/search?q=${encodeURIComponent(chip.query)}`);
                    }}
                    className="bg-[#FAF3E4] hover:bg-[#C87F4A] hover:text-white text-[#1F1B16] text-xs font-sans px-3.5 py-1.5 rounded-full border border-[#C87F4A]/25 transition-all shadow-xs"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset All / View Catalog CTA */}
            <div className="pt-4 border-t border-[#C87F4A]/15">
              <button
                type="button"
                onClick={() => {
                  setInputQuery('');
                  setActiveQuery('');
                  router.push('/products');
                }}
                className="inline-flex items-center gap-2 bg-[#C87F4A] hover:bg-[#B36737] text-white px-7 py-3 rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Browse All 600+ Creations</span>
              </button>
            </div>
          </div>
        ) : (
          /* Product Grid reusing shared ProductCard */
          <div
            className={`grid grid-cols-2 ${
              gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            } gap-4 sm:gap-6`}
          >
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E4] p-12 text-center text-xs font-mono">
          Loading Search Archives...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
