'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Award,
  Truck,
  CheckCircle2,
  Clock,
  Scissors,
  Star,
} from 'lucide-react';
import { products, sixCategoriesWithThumbnails } from '@/lib/products';
import ProductCard from '@/components/ecommerce/ProductCard';
import InstagramReelsCarousel from '@/components/ecommerce/InstagramReelsCarousel';
import { useProducts } from '@/hooks/useProducts';

export default function HomePage() {
  // ----------------------------------------------------
  // 1. Hero Promo Carousel State (Auto-advances every 5s)
  // ----------------------------------------------------
  const heroSlides = [
    {
      id: 1,
      tag: 'Royal Festive Curation 2026',
      title: 'The Mysore Crepe Silk Edit',
      subtitle: 'Pure Mulberry Sericulture & Authentic Royal Wodeyar Insignia Borders',
      link: '/products?weave=Mysore+Silk',
      ctaText: 'Shop Festive Edit',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=85',
    },
    {
      id: 2,
      tag: 'Auspicious Muhurtham Collection',
      title: 'Heirloom Bridal Kanchipuram',
      subtitle: 'Tested 24-Karat Real Gold & Silver Zari with Authentic Korvai Interlock',
      link: '/products?occasion=Bridal+%26+Muhurtham',
      ctaText: 'Explore Bridal Collection',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1800&q=85',
    },
    {
      id: 3,
      tag: 'Varanasi Loom Heritage',
      title: 'Banarasi Katan & Kadwa Weaves',
      subtitle: 'Individually Engraved Floral Bootas & Antique Zari Without Reverse Floats',
      link: '/products?weave=Banarasi',
      ctaText: 'Shop Banarasi Edit',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1800&q=85',
    },
    {
      id: 4,
      tag: 'Guild Gifting & Curations',
      title: 'New Season Arrivals & Gift Cards',
      subtitle: 'Discover the Latest Handloom Drops with Complimentary Fall & Pico',
      link: '/products?filter=new',
      ctaText: 'Discover New In',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1800&q=85',
    },
  ];

  const [liveHeroSlides, setLiveHeroSlides] = useState<any[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/banners')
      .then((res) => res.json())
      .then((data) => {
        if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
          const activeOnly = data.slides.filter((s: any) => s.is_active);
          if (activeOnly.length > 0) {
            const formatted = activeOnly.map((s: any, idx: number) => ({
              id: s.id || idx + 1,
              tag: s.badge_text || 'Heritage Handloom Collection',
              title: s.heading,
              subtitle: s.tagline || '100% Pure Silk Mark Certified',
              link: '/products',
              ctaText: s.cta_text || 'Explore Collection',
              image: s.desktop_image_path,
            }));
            setLiveHeroSlides(formatted);
          }
        }
      })
      .catch((err) => console.error('[Homepage Hero] Error fetching banners:', err));
  }, []);

  const activeSlides = liveHeroSlides || heroSlides;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  // ----------------------------------------------------
  // 2. Fetch Live Products from Supabase Backend
  // ----------------------------------------------------
  const { products: dbProducts } = useProducts();
  const activeProducts = dbProducts.length > 0 ? dbProducts : products;

  // ----------------------------------------------------
  // 3. Dynamic Category Curator with Live Counts & Photos
  // ----------------------------------------------------
  const [curatedCategoryList, setCuratedCategoryList] = useState(sixCategoriesWithThumbnails);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nsh_category_curations');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const reordered = parsed.map((pCat: any) => {
              const matched = sixCategoriesWithThumbnails.find(
                (c) => c.name.toLowerCase() === (pCat.name || '').toLowerCase() || c.name.toLowerCase() === (pCat.slug || '').toLowerCase()
              );
              return matched || {
                id: pCat.id || pCat.name,
                name: pCat.name,
                desc: pCat.subtitle || 'Royal Weave Heritage',
                image: pCat.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
                count: '12 Designs',
                thumbnails: [],
              };
            });
            setCuratedCategoryList(reordered);
          }
        } catch (e) {}
      }
    }
  }, []);

  const dynamicCategories = curatedCategoryList.map((cat) => {
    const matching = activeProducts.filter(
      (p) => p.weave?.toLowerCase().includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes((p.weave || '').toLowerCase())
    );
    const catImages = matching.flatMap((p) => p.images || []).filter(Boolean);
    const mainImg = catImages[0] || cat.image;
    const thumbs = catImages.length >= 4 ? catImages.slice(0, 4) : cat.thumbnails;

    return {
      ...cat,
      count: `${matching.length > 0 ? matching.length : 12} Designs`,
      image: mainImg,
      thumbnails: thumbs,
    };
  });

  // ----------------------------------------------------
  // 4. Shop By Occasion Tab State (4 Live Database Occasions)
  // ----------------------------------------------------
  const [activeOccasionTab, setActiveOccasionTab] = useState<'wedding' | 'festive' | 'reception' | 'casual'>('wedding');

  const occasionContent = {
    wedding: {
      title: 'Muhurtham & Bridal Trousseau',
      desc: 'Commanding weight, sculptural Korvai borders, and 24-karat tested real gold zari crafted for royal South Indian bridal mandaps.',
      link: '/products?occasion=Bridal+%26+Muhurtham',
      buttonText: 'Explore Bridal Wear',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
      sampleWeaves: 'Kanchipuram Korvai • Royal Wodeyar • Double Ikkat',
      products: activeProducts.filter((p) => p.isBridal || p.occasion?.toLowerCase().includes('bridal')).slice(0, 3),
    },
    festive: {
      title: 'Festive & Puja Celebrations',
      desc: 'Radiant jewel tones, liquid Mysore crepes, and gossamer organzas designed to capture morning temple lamps and evening Diwali soirées.',
      link: '/products?occasion=Festive+%26+Puja',
      buttonText: 'Explore Festive Wear',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      sampleWeaves: 'Mysore Silk • Paithani • Pure Organza',
      products: activeProducts.filter((p) => p.occasion?.toLowerCase().includes('festive') || p.occasion?.toLowerCase().includes('puja')).slice(0, 3),
    },
    reception: {
      title: 'Cocktail & Royal Reception',
      desc: 'Luminous metallic weaves, intricate zari borders, and contemporary colors crafted for evening galas and receptions.',
      link: '/products?occasion=Cocktail+%26+Reception',
      buttonText: 'Explore Reception Wear',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      sampleWeaves: 'Banarasi Kadwa • Paithani • Tissue Georgette',
      products: activeProducts.filter((p) => p.occasion?.toLowerCase().includes('reception') || p.occasion?.toLowerCase().includes('cocktail')).slice(0, 3),
    },
    casual: {
      title: 'Daily Classic & Subtle Drapes',
      desc: 'Lightweight breathable pure tussar, soft silks, and hand-spun chanderis that provide effortless all-day comfort without sacrificing elegance.',
      link: '/products?occasion=Daily+Classic',
      buttonText: 'Explore Casual Wear',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
      sampleWeaves: 'Chanderi Tussar • Soft Silk • Kasuti Crepe',
      products: activeProducts.filter((p) => p.occasion?.toLowerCase().includes('daily') || p.priceINR < 35000).slice(0, 3),
    },
  };

  // ----------------------------------------------------
  // 5. New Arrivals (Live Database Products)
  // ----------------------------------------------------
  const newArrivals = activeProducts.slice(0, 8);

  return (
    <div className="relative w-full bg-[#FAF3E4] text-[#1F1B16]">
      {/* ==================================================== */}
      {/* 2. HERO PROMO CAROUSEL (Full-Width, 5s Auto-Advance) */}
      {/* ==================================================== */}
      <section className="relative w-full overflow-hidden bg-[#1F1B16] text-[#FAF3E4]">
        <div className="relative w-full h-[420px] sm:h-[520px] md:h-[580px] lg:h-[640px]">
          {activeSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Slide Background Image with Vignette Overlay */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[6000ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1F1B16]/90 via-[#1F1B16]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B16]/80 via-transparent to-[#1F1B16]/40" />

              {/* Slide Editorial Copy Container */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
                  <div className="max-w-2xl space-y-4 sm:space-y-5 animate-fade-in">
                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3E4]/15 backdrop-blur-md border border-white/20 text-[#FAF3E4] text-[11px] font-mono font-semibold uppercase tracking-[0.25em]">
                      <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
                      <span>{slide.tag}</span>
                    </div>

                    {/* Headline */}
                    <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal text-white leading-[1.05] tracking-tight">
                      {slide.title}
                    </h2>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm md:text-base text-stone-200 font-sans leading-relaxed max-w-lg">
                      {slide.subtitle}
                    </p>

                    {/* Action Link Button */}
                    <div className="pt-2 sm:pt-4">
                      <Link
                        href={slide.link}
                        className="inline-flex items-center gap-2.5 bg-[#C87F4A] hover:bg-[#B36737] text-white px-8 py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-black/40"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Manual Arrows */}
          <button
            type="button"
            onClick={handlePrevSlide}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-[#FAF3E4]/20 hover:bg-[#C87F4A] text-white backdrop-blur-md transition-all duration-300 shadow-md"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNextSlide}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-[#FAF3E4]/20 hover:bg-[#C87F4A] text-white backdrop-blur-md transition-all duration-300 shadow-md"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Dots Navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
            {heroSlides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentSlide(dotIdx)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === dotIdx
                    ? 'w-7 h-2 bg-[#C87F4A]'
                    : 'w-2 h-2 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. SHOP BY CATEGORY (6 Tiles with Mini-Row & View More) */}
      {/* ==================================================== */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-semibold mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Handloom Lineages</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1F1B16] font-normal tracking-tight">
              Shop by Category
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm max-w-xl mt-2 font-sans">
              Explore 6 royal weave traditions handpicked from master artisan clusters across Southern and Northern India.
            </p>
          </div>

          <Link
            href="/products"
            className="mt-4 sm:mt-0 text-xs font-sans font-bold uppercase tracking-widest text-[#773D21] hover:text-[#C87F4A] inline-flex items-center gap-1.5"
          >
            <span>Explore All 600+ Pieces</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Category Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dynamicCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-5 border border-[#C87F4A]/25 shadow-silk hover:shadow-silk-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Category Main Card Tile */}
              <Link
                href={`/products?weave=${encodeURIComponent(cat.name)}`}
                className="group block relative aspect-[4/3] rounded-xl overflow-hidden mb-4 border border-stone-200"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F1B16]/85 via-[#1F1B16]/20 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#E2CE9F]">
                    {cat.count}
                  </span>
                  <h3 className="font-editorial text-2xl font-bold tracking-tight">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-stone-300 font-sans mt-0.5">
                    {cat.desc}
                  </span>
                </div>
              </Link>

              {/* Small Row of 3-4 Mini Product-Preview Thumbnails BELOW each tile */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <span className="text-[10px] uppercase tracking-wider font-mono font-semibold text-[#773D21] block">
                  Curated {cat.name} Silks:
                </span>

                <div className="grid grid-cols-4 gap-2">
                  {cat.thumbnails.map((thumb, tIdx) => (
                    <Link
                      key={tIdx}
                      href={`/products?weave=${encodeURIComponent(cat.name)}`}
                      className="group/thumb relative aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-[#C87F4A] transition-all bg-[#FAF3E4]"
                    >
                      <img
                        src={thumb}
                        alt={`${cat.name} thumbnail ${tIdx + 1}`}
                        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                      />
                    </Link>
                  ))}
                </div>

                {/* "View More" Button beneath each category's mini-row */}
                <Link
                  href={`/products?weave=${encodeURIComponent(cat.name)}`}
                  className="w-full py-2.5 rounded-lg border border-[#C87F4A]/40 bg-[#FAF3E4]/70 hover:bg-[#C87F4A] hover:text-white text-[#1F1B16] text-xs font-sans font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-sm block text-center"
                >
                  <span>View More {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. SHOP BY OCCASION (Tabs for Festive / Wedding / Casual) */}
      {/* ==================================================== */}
      <section className="py-16 sm:py-20 bg-[#F3E8D6]/70 border-y border-[#C87F4A]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-bold block mb-2">
              Drapes for Every Sacred Moment
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1F1B16] font-normal tracking-tight">
              Shop by Occasion
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-2 font-sans">
              Select your celebration to discover masterfully curated palettes, zari weights, and drape architectures.
            </p>

            {/* Occasion Switcher Tabs */}
            <div className="mt-8 flex justify-center gap-3">
              {[
                { key: 'festive', label: 'Festive' },
                { key: 'wedding', label: 'Wedding' },
                { key: 'casual', label: 'Casual' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveOccasionTab(tab.key as any)}
                  className={`px-6 py-2.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-sm ${
                    activeOccasionTab === tab.key
                      ? 'bg-[#C87F4A] text-white shadow-md'
                      : 'bg-white text-stone-700 hover:bg-[#FAF3E4] border border-[#C87F4A]/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Showcase Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C87F4A]/25 shadow-silk-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Large Lifestyle Image */}
              <div className="lg:col-span-5 relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-[#C87F4A]/20 shadow-inner">
                <img
                  src={occasionContent[activeOccasionTab].image}
                  alt={occasionContent[activeOccasionTab].title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5 text-white">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#E2CE9F]">
                    {occasionContent[activeOccasionTab].sampleWeaves}
                  </span>
                </div>
              </div>

              {/* Description & CTA */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#773D21] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
                  <span>Curated Celebration Edit</span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-4xl font-normal text-[#1F1B16] leading-tight">
                  {occasionContent[activeOccasionTab].title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                  {occasionContent[activeOccasionTab].desc}
                </p>

                {/* Sample Saree Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {occasionContent[activeOccasionTab].products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="p-3 bg-[#FAF3E4] rounded-xl border border-[#C87F4A]/20 hover:border-[#C87F4A] transition-colors flex items-center gap-2.5"
                    >
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop'}
                        alt={p.title}
                        className="w-10 h-12 object-cover rounded bg-stone-100"
                      />
                      <div className="truncate">
                        <span className="text-xs font-editorial font-bold text-[#1F1B16] block truncate">
                          {p.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#773D21]">
                          ₹{p.priceINR.toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Explore CTA Button */}
                <div className="pt-3">
                  <Link
                    href={occasionContent[activeOccasionTab].link}
                    className="inline-flex items-center gap-2 bg-[#C87F4A] hover:bg-[#B36737] text-white px-7 py-3.5 rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md"
                  >
                    <span>{occasionContent[activeOccasionTab].buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4.5 INSTAGRAM REELS CAROUSEL (Interactive In-Website) */}
      {/* ==================================================== */}
      <InstagramReelsCarousel />

      {/* ==================================================== */}
      {/* 5. TRUST / PROMISE SECTION (Clean Horizontal Band) */}
      {/* ==================================================== */}
      <section className="py-12 sm:py-16 bg-[#1F1B16] text-[#FAF3E4] border-y border-[#C87F4A]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF3E4]/10 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-base font-bold text-white">
                Trusted Since 2021
              </h4>
              <span className="text-[11px] text-stone-400 font-sans mt-1">
                Mysuru Royal Heritage
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF3E4]/10 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-base font-bold text-white">
                Pure Silk, Verified
              </h4>
              <span className="text-[11px] text-stone-400 font-sans mt-1">
                Govt. Silk Mark Guarantee
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF3E4]/10 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-base font-bold text-white">
                Authentic Weaves
              </h4>
              <span className="text-[11px] text-stone-400 font-sans mt-1">
                Tested 24K Real Zari
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF3E4]/10 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-base font-bold text-white">
                Express Shipping
              </h4>
              <span className="text-[11px] text-stone-400 font-sans mt-1">
                Insured to 45+ Countries
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 flex flex-col items-center text-center p-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF3E4]/10 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-3">
                <Scissors className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-base font-bold text-white">
                Hand-Picked Collection
              </h4>
              <span className="text-[11px] text-stone-400 font-sans mt-1">
                Complimentary Fall & Pico
              </span>
            </div>
          </div>
        </div>
      </section>



      {/* ==================================================== */}
      {/* 7. "NEW ARRIVALS" PRODUCT GRID (4-5 Columns Desktop) */}
      {/* ==================================================== */}
      <section className="py-16 sm:py-24 bg-white border-t border-[#C87F4A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-bold block mb-2">
                Fresh Loom Releases
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1F1B16] font-normal tracking-tight">
                New Arrivals
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 font-sans">
                Just unboxed from our master artisan clusters in Mysuru, Kanchipuram, and Varanasi.
              </p>
            </div>

            <Link
              href="/products?filter=new"
              className="mt-4 sm:mt-0 text-xs font-sans font-bold uppercase tracking-widest text-[#773D21] hover:text-[#C87F4A] inline-flex items-center gap-1.5"
            >
              <span>View All New Drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 5 Column Desktop Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#FAF3E4] hover:bg-[#F3E8D6] text-[#1F1B16] border border-[#C87F4A]/50 px-9 py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-colors shadow-sm"
            >
              <span>Explore Complete Catalog</span>
              <ArrowRight className="w-4 h-4 text-[#C87F4A]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
