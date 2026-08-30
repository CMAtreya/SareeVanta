'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Sparkles,
  ChevronRight,
  ArrowUpDown,
  Grid3X3,
  LayoutGrid,
  ShieldCheck,
  Award,
  ArrowLeft,
  Search,
  Filter,
} from 'lucide-react';
import { INITIAL_COLLECTIONS, SareeCollection } from '@/lib/taxonomy';
import { Product, products as fallbackProducts } from '@/lib/products';
import ProductCard from '@/components/ecommerce/ProductCard';
import ProductCardSkeleton from '@/components/ecommerce/ProductCardSkeleton';

export default function CollectionLandingPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const [collection, setCollection] = useState<SareeCollection | null>(null);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'popularity' | 'newest'>('featured');
  const [gridCols, setGridCols] = useState<3 | 4>(3);

  // 1. Fetch Collection Metadata
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/collections/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.collection) {
          setCollection(data.collection);
        }
      })
      .catch(() => {
        const local = INITIAL_COLLECTIONS.find((c) => c.slug === slug);
        if (isMounted && local) {
          setCollection(local);
        }
      })
      .finally(() => {
        if (isMounted) setCollectionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // 2. Fetch Catalog Products
  useEffect(() => {
    let isMounted = true;
    fetch('/api/products?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            setAllProducts(data.products);
          } else {
            setAllProducts(fallbackProducts);
          }
        }
      })
      .catch(() => {
        if (isMounted) setAllProducts(fallbackProducts);
      })
      .finally(() => {
        if (isMounted) setProductsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Filter products matching collection criteria (Automatic Rule or Manual SKU mapping)
  const collectionProducts = useMemo(() => {
    if (!collection) return [];

    const norm = (s?: string) => (s || '').toLowerCase().trim();
    const titleLower = norm(collection.title);
    const slugLower = norm(collection.slug);

    // Rule-Based or Curated Matching
    let matched = allProducts.filter((p) => {
      // Direct mapped SKU match
      if (collection.assignedSkus && collection.assignedSkus.length > 0) {
        const hasSku = collection.assignedSkus.some(
          (sku) => norm(sku) === norm(p.id) || norm(sku) === norm(p.slug) || (p as any).sku === sku
        );
        if (hasSku) return true;
      }

      // Keyword / Taxonomy / Rule Matching
      const pWeave = norm(p.weave);
      const pFabric = norm(p.fabric);
      const pOccasion = norm(p.occasion);
      const pTitle = norm(p.title);

      if (titleLower.includes('wodeyar') || slugLower.includes('wodeyar') || titleLower.includes('mysore')) {
        return pWeave.includes('mysore') || pTitle.includes('mysore') || pFabric.includes('crepe');
      }
      if (titleLower.includes('banarasi') || slugLower.includes('banarasi')) {
        return pWeave.includes('banarasi') || pTitle.includes('banarasi') || pTitle.includes('kadwa');
      }
      if (titleLower.includes('bridal') || titleLower.includes('kanchipuram') || slugLower.includes('bridal') || slugLower.includes('kanchipuram')) {
        return p.isBridal || pOccasion.includes('bridal') || pWeave.includes('kanchipuram') || pTitle.includes('korvai');
      }
      if (titleLower.includes('paithani') || slugLower.includes('paithani')) {
        return pWeave.includes('paithani') || pTitle.includes('paithani') || pTitle.includes('asawali');
      }
      if (titleLower.includes('organza') || slugLower.includes('organza')) {
        return pWeave.includes('organza') || pFabric.includes('organza');
      }

      return false;
    });

    // If fewer than 4 matched, gracefully supplement with top royal sarees so the lookbook is always rich
    if (matched.length < 4 && allProducts.length > 0) {
      const remaining = allProducts.filter((p) => !matched.some((m) => m.id === p.id));
      matched = [...matched, ...remaining.slice(0, 8 - matched.length)];
    }

    // Apply Sorting
    const sorted = [...matched];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => (a.priceINR || 0) - (b.priceINR || 0));
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => (b.priceINR || 0) - (a.priceINR || 0));
    } else if (sortBy === 'popularity') {
      sorted.sort((a, b) => (b.rating || b.reviewCount || 0) - (a.rating || a.reviewCount || 0));
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return sorted;
  }, [collection, allProducts, sortBy]);

  if (!collectionLoading && !collection) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF3E4] text-[#1F1B16]">
      {/* 1. Breadcrumbs Header */}
      <div className="bg-[#1F1B16] text-[#FAF3E4]/80 text-xs py-3 border-b border-[#C87F4A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C87F4A]" />
          <Link href="/collections" className="hover:text-white transition-colors">
            Curated Lookbooks
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C87F4A]" />
          <span className="text-white font-medium truncate">{collection?.title || 'Loading Collection...'}</span>
        </div>
      </div>

      {/* 2. Hero Editorial Story Banner */}
      <section className="relative w-full overflow-hidden bg-[#1F1B16] text-[#FAF3E4]">
        <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px]">
          {collectionLoading ? (
            <div className="absolute inset-0 bg-[#1F1B16] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#C87F4A]/40 border-t-[#C87F4A] animate-spin" />
            </div>
          ) : (
            <>
              {/* Background Cover Image with Vignette */}
              <img
                src={collection?.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop'}
                alt={collection?.title || 'Collection Cover'}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-3000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1F1B16]/95 via-[#1F1B16]/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B16] via-transparent to-[#1F1B16]/30" />

              {/* Editorial Copy */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl space-y-3 sm:space-y-4 animate-fade-in">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF3E4]/15 backdrop-blur-md border border-white/20 text-[#FAF3E4] text-[11px] font-mono font-semibold uppercase tracking-[0.25em]">
                      <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
                      <span>{collection?.badge || 'Curated Handloom Lookbook'}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-[1.1] tracking-tight">
                      {collection?.title}
                    </h1>

                    {/* Tagline */}
                    <p className="text-xs sm:text-sm md:text-base text-stone-200 font-sans leading-relaxed">
                      {collection?.tagline}
                    </p>

                    {/* Description */}
                    {collection?.description && (
                      <p className="text-[11px] sm:text-xs text-stone-300 font-sans leading-relaxed border-l-2 border-[#C87F4A] pl-3 italic">
                        "{collection.description}"
                      </p>
                    )}

                    {/* Quality Badges */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-stone-300">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>100% Pure Mulberry Silk</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Silk Mark Certified</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. Main Lookbook Products Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Controls Toolbar: Saree Count, Sorting, and Grid Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#C87F4A]/20">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#773D21] block">
              Curated Masterpiece Weaves
            </span>
            <p className="text-xs text-stone-600 font-sans mt-0.5">
              Showing <strong>{collectionProducts.length}</strong> handcrafted heirlooms in this royal edition
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#C87F4A]/30 text-xs shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#C87F4A]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-[#1F1B16] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Curation</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popularity">Popularity</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* Desktop Column Toggle */}
            <div className="hidden sm:flex items-center bg-white rounded-xl border border-[#C87F4A]/30 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  gridCols === 3 ? 'bg-[#7A1C30] text-white' : 'text-stone-500 hover:text-black'
                }`}
                title="3 Columns Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  gridCols === 4 ? 'bg-[#7A1C30] text-white' : 'text-stone-500 hover:text-black'
                }`}
                title="4 Columns Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {productsLoading ? (
          <div
            className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${
              gridCols === 4 ? 'lg:grid-cols-4 xl:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-3'
            } gap-4 sm:gap-6`}
          >
            {[...Array(6)].map((_, idx) => (
              <ProductCardSkeleton key={idx} />
            ))}
          </div>
        ) : collectionProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#C87F4A]/25 p-8 max-w-lg mx-auto shadow-sm">
            <Search className="w-10 h-10 text-[#C87F4A] mx-auto mb-3" />
            <h3 className="font-editorial text-2xl font-bold text-[#1F1B16]">No Sarees in this Collection Yet</h3>
            <p className="text-xs text-stone-500 font-sans mt-2">
              New royal drapes are currently being loomed by our master weavers for this lookbook.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7A1C30] hover:bg-[#5E1524] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              <span>Explore All Royal Weaves</span>
            </Link>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${
              gridCols === 4 ? 'lg:grid-cols-4 xl:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-3'
            } gap-4 sm:gap-6`}
          >
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Back to All Lookbooks Navigation CTA */}
        <div className="pt-12 border-t border-[#C87F4A]/20 text-center space-y-3">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#7A1C30] hover:text-[#5E1524] uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Discover More Curated Royal Lookbooks</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
