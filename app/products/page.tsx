'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
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
import { products, Product } from '@/lib/products';
import ProductCard from '@/components/ecommerce/ProductCard';
import ProductFilters, { FilterCounts } from '@/components/ecommerce/ProductFilters';

function ProductsListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial query params
  const weaveParam = searchParams.get('weave');
  const fabricParam = searchParams.get('fabric');
  const occasionParam = searchParams.get('occasion');
  const colorParam = searchParams.get('color');
  const priceMinParam = searchParams.get('price_min');
  const priceMaxParam = searchParams.get('price_max');
  const silkMarkParam = searchParams.get('silk_mark');
  const sortParam = searchParams.get('sort') || 'featured';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const filterParam = searchParams.get('filter');

  // Filter States
  const [selectedWeaves, setSelectedWeaves] = useState<string[]>(
    weaveParam ? weaveParam.split(',').map((w) => w.trim()) : []
  );
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(
    fabricParam ? fabricParam.split(',').map((f) => f.trim()) : []
  );
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(
    occasionParam ? occasionParam.split(',').map((o) => o.trim()) : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    colorParam ? colorParam.split(',').map((c) => c.trim()) : []
  );
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

  // Sync state to URL Query Params
  const syncParamsToUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedWeaves.length > 0) params.set('weave', selectedWeaves.join(','));
    if (selectedFabrics.length > 0) params.set('fabric', selectedFabrics.join(','));
    if (selectedOccasions.length > 0) params.set('occasion', selectedOccasions.join(','));
    if (selectedColors.length > 0) params.set('color', selectedColors.join(','));
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
    selectedColors,
    priceRange,
    silkMarkOnly,
    sortBy,
    currentPage,
    filterParam,
    router,
  ]);

  // Fetch from GET /api/products
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedWeaves.length > 0) params.set('weave', selectedWeaves.join(','));
        if (selectedFabrics.length > 0) params.set('fabric', selectedFabrics.join(','));
        if (selectedOccasions.length > 0) params.set('occasion', selectedOccasions.join(','));
        if (selectedColors.length > 0) params.set('color', selectedColors.join(','));
        if (priceRange[0] > 10000) params.set('price_min', priceRange[0].toString());
        if (priceRange[1] < 100000) params.set('price_max', priceRange[1].toString());
        if (silkMarkOnly) params.set('silk_mark', 'true');
        if (sortBy) params.set('sort', sortBy);
        params.set('page', currentPage.toString());
        params.set('limit', gridCols === 4 ? '12' : '9');
        if (filterParam) params.set('filter', filterParam);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setApiProducts(data.products || []);
            setApiTotal(data.total || 0);
            setApiTotalPages(data.totalPages || 1);
            setFilterCounts(data.counts);
            setIsLoading(false);
          }
          return;
        }
      } catch (err) {
        console.error('Error fetching from /api/products, falling back to local dataset', err);
      }

      // Local fallback calculation if API fails
      if (isMounted) {
        let filtered = products.filter((p) => {
          if (selectedWeaves.length > 0 && !selectedWeaves.includes(p.weave)) return false;
          if (selectedFabrics.length > 0 && !selectedFabrics.includes(p.fabric)) return false;
          if (selectedOccasions.length > 0 && !selectedOccasions.includes(p.occasion)) return false;
          if (selectedColors.length > 0 && !selectedColors.some((c) => p.color.toLowerCase().includes(c))) return false;
          if (p.priceINR < priceRange[0] || p.priceINR > priceRange[1]) return false;
          if (silkMarkOnly && !p.silkMarkCertified) return false;
          if (filterParam === 'new' && !p.isNew) return false;
          return true;
        });

        if (sortBy === 'price-low') filtered.sort((a, b) => a.priceINR - b.priceINR);
        else if (sortBy === 'price-high') filtered.sort((a, b) => b.priceINR - a.priceINR);
        else if (sortBy === 'popularity') filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        else if (sortBy === 'newest') filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

        setApiProducts(filtered);
        setApiTotal(filtered.length);
        setApiTotalPages(Math.ceil(filtered.length / 9) || 1);
        setIsLoading(false);
      }
    };

    fetchProducts();
    syncParamsToUrl();

    return () => {
      isMounted = false;
    };
  }, [
    selectedWeaves,
    selectedFabrics,
    selectedOccasions,
    selectedColors,
    priceRange,
    silkMarkOnly,
    sortBy,
    currentPage,
    gridCols,
    filterParam,
    syncParamsToUrl,
  ]);

  // Clear all filters
  const handleClearAll = () => {
    setSelectedWeaves([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedColors([]);
    setPriceRange([10000, 100000]);
    setSilkMarkOnly(false);
    setCurrentPage(1);
  };

  // Dynamic Header Title & Breadcrumbs
  const dynamicCategoryTitle = useMemo(() => {
    if (selectedWeaves.length === 1) return `${selectedWeaves[0]} Sarees`;
    if (selectedFabrics.length === 1) return `${selectedFabrics[0]} Sarees`;
    if (selectedOccasions.length === 1) return `${selectedOccasions[0]} Sarees`;
    if (filterParam === 'new') return 'New Arrivals';
    if (filterParam === 'bridal') return 'Bridal & Muhurtham Trousseau';
    return 'All Heritage Silk Sarees';
  }, [selectedWeaves, selectedFabrics, selectedOccasions, filterParam]);

  // Active filter chip removable tags
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    selectedWeaves.forEach((w) =>
      chips.push({ label: `Weave: ${w}`, onRemove: () => setSelectedWeaves(selectedWeaves.filter((i) => i !== w)) })
    );
    selectedFabrics.forEach((f) =>
      chips.push({ label: `Fabric: ${f}`, onRemove: () => setSelectedFabrics(selectedFabrics.filter((i) => i !== f)) })
    );
    selectedOccasions.forEach((o) =>
      chips.push({ label: `Occasion: ${o}`, onRemove: () => setSelectedOccasions(selectedOccasions.filter((i) => i !== o)) })
    );
    selectedColors.forEach((c) =>
      chips.push({ label: `Color: ${c}`, onRemove: () => setSelectedColors(selectedColors.filter((i) => i !== c)) })
    );
    if (priceRange[0] > 10000 || priceRange[1] < 100000) {
      chips.push({
        label: `₹${priceRange[0].toLocaleString()} – ₹${priceRange[1].toLocaleString()}`,
        onRemove: () => setPriceRange([10000, 100000]),
      });
    }
    if (silkMarkOnly) {
      chips.push({ label: 'Silk Mark Certified', onRemove: () => setSilkMarkOnly(false) });
    }
    return chips;
  }, [selectedWeaves, selectedFabrics, selectedOccasions, selectedColors, priceRange, silkMarkOnly]);

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
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
            <span>Neelsareehouse Permanent Curation • Mysuru</span>
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

            {/* Product Grid Area / Empty State */}
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="inline-block w-8 h-8 border-3 border-[#C87F4A] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-mono text-stone-500">Loading Royal Masterpieces...</p>
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
                <p className="text-xs text-stone-500 mt-2 font-sans leading-relaxed">
                  We couldn't find any sarees matching your selected filters. Try broadening your price range or clearing some attributes.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-6 inline-flex items-center gap-2 bg-[#C87F4A] hover:bg-[#B36737] text-white px-7 py-3 rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              /* Products Grid: 3-4 columns desktop, 2 columns mobile */
              <div
                className={`grid grid-cols-2 ${
                  gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                } gap-4 sm:gap-6`}
              >
                {apiProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
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
