'use client';

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Grid3X3,
  LayoutGrid,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
  RotateCcw,
  Search,
} from 'lucide-react';
import { Product } from '@/lib/products';
import ProductCard from '@/components/ecommerce/ProductCard';
import ProductCardSkeleton from '@/components/ecommerce/ProductCardSkeleton';
import ProductFilters, { FilterCounts } from '@/components/ecommerce/ProductFilters';
import { seedPdpCacheFromCatalog } from '@/lib/pdpCache';

// Client-side in-memory query cache with TTL for instant (0ms) filter switching without stale retention
const filterQueryCache = new Map<string, { data: any; timestamp: number }>();

function ProductsListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial query params
  const weaveParam = searchParams.get('weave');
  const fabricParam = searchParams.get('fabric');
  const occasionParam = searchParams.get('occasion');
  const patternParam = searchParams.get('pattern');
  const colorParam = searchParams.get('color');
  const searchParam = searchParams.get('q') || searchParams.get('search');
  const priceMinParam = searchParams.get('price_min');
  const priceMaxParam = searchParams.get('price_max');
  const silkMarkParam = searchParams.get('silk_mark');
  const sortParam = searchParams.get('sort') || 'featured';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const filterParam = searchParams.get('filter');

  // Filter States
  const [selectedWeaves, setSelectedWeaves] = useState<string[]>(
    weaveParam ? weaveParam.split(',').map((w) => w.trim()).filter(Boolean) : []
  );
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(
    fabricParam ? fabricParam.split(',').map((f) => f.trim()).filter(Boolean) : []
  );
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    occasionParam ? occasionParam.split(',').map((o) => o.trim()).filter(Boolean) : []
  );
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(
    patternParam ? patternParam.split(',').map((pt) => pt.trim()).filter(Boolean) : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    colorParam ? colorParam.split(',').map((c) => c.trim()).filter(Boolean) : []
  );
  const [searchQuery, setSearchQuery] = useState<string>(searchParam || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    priceMinParam ? parseInt(priceMinParam, 10) : 10000,
    priceMaxParam ? parseInt(priceMaxParam, 10) : 100000,
  ]);
  const [silkMarkOnly, setSilkMarkOnly] = useState(silkMarkParam === 'true');
  const [sortBy, setSortBy] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [gridCols, setGridCols] = useState<3 | 4>(3);

  // API State
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [apiTotal, setApiTotal] = useState<number>(0);
  const [apiTotalPages, setApiTotalPages] = useState<number>(1);
  const [filterCounts, setFilterCounts] = useState<FilterCounts | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Sync state to URL Query Params
  const syncParamsToUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedWeaves.length > 0) params.set('weave', selectedWeaves.join(','));
    if (selectedFabrics.length > 0) params.set('fabric', selectedFabrics.join(','));
    if (selectedOccasions.length > 0) params.set('occasion', selectedOccasions.join(','));
    if (selectedPatterns.length > 0) params.set('pattern', selectedPatterns.join(','));
    if (selectedColors.length > 0) params.set('color', selectedColors.join(','));
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (priceRange[0] > 10000) params.set('price_min', priceRange[0].toString());
    if (priceRange[1] < 100000) params.set('price_max', priceRange[1].toString());
    if (silkMarkOnly) params.set('silk_mark', 'true');
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (filterParam) params.set('filter', filterParam);

    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    router.replace(newUrl, { scroll: false });
  }, [
    selectedWeaves,
    selectedFabrics,
    selectedOccasions,
    selectedPatterns,
    selectedColors,
    searchQuery,
    priceRange,
    silkMarkOnly,
    sortBy,
    currentPage,
    filterParam,
    router,
  ]);

  // Sync URL searchParams to React filter state on mount / external URL navigation
  const isInitialMount = useRef(true);

  useEffect(() => {
    const w = searchParams.get('weave') || searchParams.get('category');
    const f = searchParams.get('fabric');
    const o = searchParams.get('occasion');
    const pt = searchParams.get('pattern');
    const c = searchParams.get('color');
    const s = searchParams.get('q') || searchParams.get('search');
    const pMin = searchParams.get('price_min');
    const pMax = searchParams.get('price_max');
    const sm = searchParams.get('silk_mark');
    const sort = searchParams.get('sort') || 'featured';
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSelectedWeaves(w ? w.split(',').map((item) => item.trim()).filter(Boolean) : []);
    setSelectedFabrics(f ? f.split(',').map((item) => item.trim()).filter(Boolean) : []);
    setSelectedOccasions(o ? o.split(',').map((item) => item.trim()).filter(Boolean) : []);
    setSelectedPatterns(pt ? pt.split(',').map((item) => item.trim()).filter(Boolean) : []);
    setSelectedColors(c ? c.split(',').map((item) => item.trim()).filter(Boolean) : []);
    setSearchQuery(s || '');
    setPriceRange([
      pMin ? parseInt(pMin, 10) : 10000,
      pMax ? parseInt(pMax, 10) : 100000,
    ]);
    setSilkMarkOnly(sm === 'true');
    setSortBy(sort);
    setCurrentPage(page);
  }, [searchParams]);

  // Update URL when filter states change
  useEffect(() => {
    syncParamsToUrl();
  }, [syncParamsToUrl]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedWeaves([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedPatterns([]);
    setSelectedColors([]);
    setSearchQuery('');
    setPriceRange([10000, 100000]);
    setSilkMarkOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
    router.replace('/products', { scroll: false });
  };

  // Compute displayProducts instantly for 0ms sorting response on screen
  const displayProducts = useMemo(() => {
    const list = [...apiProducts];
    if (sortBy === 'price-low') {
      return list.sort((a, b) => (a.priceINR || 0) - (b.priceINR || 0));
    } else if (sortBy === 'price-high') {
      return list.sort((a, b) => (b.priceINR || 0) - (a.priceINR || 0));
    } else if (sortBy === 'popularity') {
      return list.sort((a, b) => (b.rating || b.reviewCount || 0) - (a.rating || a.reviewCount || 0));
    } else if (sortBy === 'newest') {
      return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    return list;
  }, [apiProducts, sortBy]);

  const catalogSnapshotRef = useRef<Product[]>([]);

  // Fetch products from GET /api/products with instant 0ms local filtering & SWR
  useEffect(() => {
    let isMounted = true;
    const limit = 16;

    const fetchProducts = async () => {
      const params = new URLSearchParams();
      if (selectedWeaves.length > 0) params.set('weave', selectedWeaves.join(','));
      if (selectedFabrics.length > 0) params.set('fabric', selectedFabrics.join(','));
      if (selectedOccasions.length > 0) params.set('occasion', selectedOccasions.join(','));
      if (selectedPatterns.length > 0) params.set('pattern', selectedPatterns.join(','));
      if (selectedColors.length > 0) params.set('color', selectedColors.join(','));
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (priceRange[0] > 10000) params.set('price_min', priceRange[0].toString());
      if (priceRange[1] < 100000) params.set('price_max', priceRange[1].toString());
      if (silkMarkOnly) params.set('silk_mark', 'true');
      if (sortBy) params.set('sort', sortBy);
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());
      if (filterParam) params.set('filter', filterParam);

      const cacheKey = params.toString();
      const cached = filterQueryCache.get(cacheKey);
      const isFresh = cached && (Date.now() - cached.timestamp < 5000) && Array.isArray(cached.data?.products) && cached.data.products.length > 0;

      // 0ms Instant client-side snapshot filtering for immediate filter feedback
      if (catalogSnapshotRef.current.length > 0) {
        const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const nWeaves = selectedWeaves.map(norm);
        const nFabrics = selectedFabrics.map(norm);
        const nOccasions = selectedOccasions.map(norm);

        const instant = catalogSnapshotRef.current.filter((p) => {
          if (nWeaves.length > 0) {
            const pw = norm(p.weave);
            if (!nWeaves.some((nw) => pw === nw || pw.includes(nw) || nw.includes(pw))) return false;
          }
          if (nFabrics.length > 0) {
            const pf = norm(p.fabric);
            if (!nFabrics.some((nf) => pf === nf || pf.includes(nf) || nf.includes(pf))) return false;
          }
          if (nOccasions.length > 0) {
            const po = norm(p.occasion);
            const poccs = (p.occasions || []).map(norm);
            if (!nOccasions.some((no) => po === no || poccs.includes(no) || po.includes(no))) return false;
          }
          if (priceRange[0] > 10000 && (p.priceINR || 0) < priceRange[0]) return false;
          if (priceRange[1] < 100000 && (p.priceINR || 0) > priceRange[1]) return false;
          if (silkMarkOnly && !p.silkMarkCertified) return false;
          return true;
        });

        if (isMounted) {
          setApiProducts(instant.slice((currentPage - 1) * limit, currentPage * limit));
          setApiTotal(instant.length);
          setApiTotalPages(Math.ceil(instant.length / limit) || 1);
          setIsLoading(false);
        }
      } else if (cached && isFresh) {
        if (isMounted) {
          setApiProducts(cached.data.products || []);
          setApiTotal(cached.data.total || 0);
          setApiTotalPages(cached.data.totalPages || 1);
          setFilterCounts(cached.data.counts);
          setIsLoading(false);
        }
      } else if (apiProducts.length === 0) {
        setIsLoading(true);
      }

      try {
        const res = await fetch(`/api/products?${cacheKey}`, { cache: 'default' });
        if (res.ok) {
          const data = await res.json();
          filterQueryCache.set(cacheKey, { data, timestamp: Date.now() });

          // Accumulate unique products into catalogSnapshotRef and pre-seed PDP cache
          if (Array.isArray(data.products)) {
            data.products.forEach((p: Product) => seedPdpCacheFromCatalog(p));
            const currentIds = new Set(catalogSnapshotRef.current.map((p) => p.id));
            const newItems = data.products.filter((p: Product) => !currentIds.has(p.id));
            if (newItems.length > 0) {
              catalogSnapshotRef.current = [...catalogSnapshotRef.current, ...newItems];
            }
          }

          if (isMounted) {
            setApiProducts(data.products || []);
            setApiTotal(data.total || 0);
            setApiTotalPages(data.totalPages || 1);
            setFilterCounts(data.counts);
            setIsLoading(false);
            setIsFetching(false);
          }
          return;
        }
      } catch (err) {
        console.error('Error fetching from /api/products:', err);
      }

      if (isMounted) {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchProducts();

    const handleRevalidate = () => {
      filterQueryCache.clear();
      fetchProducts();
    };

    window.addEventListener('focus', handleRevalidate);
    document.addEventListener('visibilitychange', handleRevalidate);
    window.addEventListener('sareevanta:products_updated', handleRevalidate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'sareevanta_last_product_update') {
        filterQueryCache.clear();
        fetchProducts();
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleRevalidate);
      document.removeEventListener('visibilitychange', handleRevalidate);
      window.removeEventListener('sareevanta:products_updated', handleRevalidate);
    };
  }, [
    selectedWeaves,
    selectedFabrics,
    selectedOccasions,
    selectedPatterns,
    selectedColors,
    searchQuery,
    priceRange,
    silkMarkOnly,
    sortBy,
    currentPage,
    gridCols,
    filterParam,
  ]);

  // Clear all filters
  const handleClearAll = () => {
    setSelectedWeaves([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedPatterns([]);
    setSelectedColors([]);
    setSearchQuery('');
    setPriceRange([10000, 100000]);
    setSilkMarkOnly(false);
    setCurrentPage(1);
    router.replace('/products', { scroll: false });
  };

  // Dynamic Header Title & Breadcrumbs
  const dynamicCategoryTitle = useMemo(() => {
    if (searchQuery.trim()) return `Search: "${searchQuery}"`;
    if (selectedPatterns.length === 1) return `${selectedPatterns[0]} Pattern Sarees`;
    if (selectedWeaves.length === 1) return `${selectedWeaves[0]} Sarees`;
    if (selectedFabrics.length === 1) return `${selectedFabrics[0]} Sarees`;
    if (selectedOccasions.length === 1) return `${selectedOccasions[0]} Sarees`;
    if (filterParam === 'new') return 'New Arrivals';
    if (filterParam === 'bridal') return 'Bridal & Muhurtham Trousseau';
    return 'All Heritage Silk Sarees';
  }, [searchQuery, selectedPatterns, selectedWeaves, selectedFabrics, selectedOccasions, filterParam]);

  // Active filter chip removable tags
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (searchQuery.trim()) {
      chips.push({
        label: `Search: "${searchQuery}"`,
        onRemove: () => {
          setSearchQuery('');
          setCurrentPage(1);
        },
      });
    }
    selectedWeaves.forEach((w) =>
      chips.push({
        label: `Weave: ${w}`,
        onRemove: () => {
          setSelectedWeaves(selectedWeaves.filter((i) => i !== w));
          setCurrentPage(1);
        },
      })
    );
    selectedFabrics.forEach((f) =>
      chips.push({
        label: `Fabric: ${f}`,
        onRemove: () => {
          setSelectedFabrics(selectedFabrics.filter((i) => i !== f));
          setCurrentPage(1);
        },
      })
    );
    selectedOccasions.forEach((o) =>
      chips.push({
        label: `Occasion: ${o}`,
        onRemove: () => {
          setSelectedOccasions(selectedOccasions.filter((i) => i !== o));
          setCurrentPage(1);
        },
      })
    );
    selectedPatterns.forEach((pt) =>
      chips.push({
        label: `Pattern: ${pt}`,
        onRemove: () => {
          setSelectedPatterns(selectedPatterns.filter((i) => i !== pt));
          setCurrentPage(1);
        },
      })
    );
    selectedColors.forEach((c) =>
      chips.push({
        label: `Color: ${c}`,
        onRemove: () => {
          setSelectedColors(selectedColors.filter((i) => i !== c));
          setCurrentPage(1);
        },
      })
    );
    if (priceRange[0] > 10000 || priceRange[1] < 100000) {
      chips.push({
        label: `₹${priceRange[0].toLocaleString()} – ₹${priceRange[1].toLocaleString()}`,
        onRemove: () => {
          setPriceRange([10000, 100000]);
          setCurrentPage(1);
        },
      });
    }
    if (silkMarkOnly) {
      chips.push({
        label: 'Silk Mark Certified',
        onRemove: () => {
          setSilkMarkOnly(false);
          setCurrentPage(1);
        },
      });
    }
    return chips;
  }, [
    searchQuery,
    selectedWeaves,
    selectedFabrics,
    selectedOccasions,
    selectedPatterns,
    selectedColors,
    priceRange,
    silkMarkOnly,
  ]);


  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* 1. Breadcrumbs Row */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 font-sans mb-4">
          <Link href="/" className="hover:text-[#C87F4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link href="/products" className="hover:text-[#C87F4A] transition-colors">
            Collections
          </Link>
          {selectedWeaves.length === 1 && (
            <>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <span className="text-[#1F1B16] font-semibold">{selectedWeaves[0]}</span>
            </>
          )}
          {selectedOccasions.length === 1 && selectedWeaves.length !== 1 && (
            <>
              <ChevronRight className="w-3 h-3 text-stone-400" />
              <span className="text-[#1F1B16] font-semibold">{selectedOccasions[0]}</span>
            </>
          )}
        </nav>

        {/* 2. Page Header Banner */}
        <div className="pb-5 border-b border-[#C87F4A]/20 mb-6">
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SareeVanta Permanent Curation • Mysuru</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-normal text-[#1F1B16] tracking-tight">
            {dynamicCategoryTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-sans mt-1.5 max-w-2xl">
            Showing authenticated pure silk sarees crafted with tested 24K real gold & silver zari, delivered in heirloom acid-free packaging.
          </p>
        </div>

        {/* 3. Main Two-Column Layout (LEFT: Sidebar Filter, RIGHT: Product Grid) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT: Sticky Sidebar Filter Panel */}
          <ProductFilters
            selectedWeaves={selectedWeaves}
            setSelectedWeaves={(w) => {
              setSelectedWeaves(w);
              setCurrentPage(1);
            }}
            selectedFabrics={selectedFabrics}
            setSelectedFabrics={(f) => {
              setSelectedFabrics(f);
              setCurrentPage(1);
            }}
            selectedOccasions={selectedOccasions}
            setSelectedOccasions={(o) => {
              setSelectedOccasions(o);
              setCurrentPage(1);
            }}
            selectedColors={selectedColors}
            setSelectedColors={(c) => {
              setSelectedColors(c);
              setCurrentPage(1);
            }}
            priceRange={priceRange}
            setPriceRange={(pr) => {
              setPriceRange(pr);
              setCurrentPage(1);
            }}
            silkMarkOnly={silkMarkOnly}
            setSilkMarkOnly={(sm) => {
              setSilkMarkOnly(sm);
              setCurrentPage(1);
            }}
            onClearAll={handleClearAll}
            totalFilteredCount={apiTotal}
            counts={filterCounts}
          />

          {/* RIGHT: Listing Area */}
          <div className="flex-1 w-full">
            {/* Top Toolbar: Count + Sort + Grid Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#C87F4A]/15 text-xs text-stone-600">
              <span className="font-mono text-xs">
                Showing <strong className="text-[#1F1B16]">{apiProducts.length}</strong> of{' '}
                <strong className="text-[#1F1B16]">{apiTotal}</strong> creations
              </span>

              <div className="flex items-center gap-3 sm:gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#C87F4A]" />
                  <span className="hidden sm:inline font-sans font-semibold uppercase tracking-wider text-[#773D21] text-[11px]">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-[#C87F4A]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#1F1B16] focus:outline-none focus:border-[#C87F4A] cursor-pointer shadow-xs font-sans"
                  >
                    <option value="featured">Featured Curations</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="popularity">Popularity / Ratings</option>
                  </select>
                </div>

                {/* Desktop Grid Columns Switcher */}
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

            {/* Active Filter Removable Chips Row */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-2.5 rounded-xl bg-white/60 border border-[#C87F4A]/20">
                <span className="text-[11px] font-mono text-[#773D21] font-semibold uppercase tracking-wider mr-1">
                  Active:
                </span>
                {activeChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#C87F4A]/30 text-[11px] font-sans text-[#1F1B16] shadow-xs"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="text-stone-400 hover:text-black p-0.5 rounded-full"
                      aria-label={`Remove ${chip.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] text-[#C87F4A] hover:underline font-sans font-bold uppercase tracking-wider ml-auto"
                >
                  Reset All
                </button>
              </div>
            )}

            {/* Product Grid Area / Shimmer Skeletons / Empty State */}
            {isLoading && apiProducts.length === 0 ? (
              <div
                className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${
                  gridCols === 4 ? 'lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5' : 'lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'
                } gap-4 sm:gap-6`}
              >
                {[...Array(gridCols === 4 ? 8 : 6)].map((_, sIdx) => (
                  <ProductCardSkeleton key={sIdx} />
                ))}
              </div>
            ) : apiProducts.length === 0 ? (
              /* Empty State */
              <div className="py-20 text-center bg-white rounded-2xl border border-[#C87F4A]/25 p-8 max-w-lg mx-auto shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#FAF3E4] border border-[#C87F4A]/30 flex items-center justify-center mx-auto mb-4 text-[#C87F4A]">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#1F1B16]">
                  No matching sarees found
                </h3>
                <p className="text-xs text-stone-500 font-sans mt-2 leading-relaxed">
                  We couldn't find any sarees matching your selected filter combination. Try adjusting or clearing your filters to discover our royal handloom catalog.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-6 px-6 py-2.5 rounded-full bg-[#7A1C30] hover:bg-[#5E1524] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              /* Products Grid: Crisp, Vibrant, No Jarring Opacity Dims */
              <div className="relative">
                {isFetching && (
                  <div className="absolute -top-3 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7A1C30] via-[#C87F4A] to-[#7A1C30] animate-pulse z-20 rounded-full" />
                )}
                <div
                  className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${
                    gridCols === 4 ? 'lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5' : 'lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4'
                  } gap-4 sm:gap-6`}
                >
                  {displayProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* 4. Pagination */}
            {apiTotalPages > 1 && !isLoading && (
              <div className="mt-12 flex items-center justify-center gap-2 pt-6 border-t border-[#C87F4A]/20">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-stone-300 bg-white text-stone-600 hover:text-black hover:border-[#C87F4A] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: apiTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#C87F4A] text-white shadow-xs font-bold'
                        : 'bg-white text-stone-700 border border-stone-200 hover:border-[#C87F4A]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(apiTotalPages, p + 1))}
                  disabled={currentPage === apiTotalPages}
                  className="p-2 rounded-lg border border-stone-300 bg-white text-stone-600 hover:text-black hover:border-[#C87F4A] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E4] p-12 text-center text-xs font-mono">
          Loading Curations...
        </div>
      }
    >
      <ProductsListingContent />
    </Suspense>
  );
}
