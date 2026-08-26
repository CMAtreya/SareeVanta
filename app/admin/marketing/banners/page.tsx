'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  LayoutTemplate,
  Layers,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  MoveUp,
  MoveDown,
  Sparkles,
  Sliders,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  X,
  Check,
  Calendar,
  ExternalLink,
  Smartphone,
  Monitor,
  Palette,
  Play,
  RotateCcw,
  Save,
  Grid,
} from 'lucide-react';
import { products } from '@/lib/products';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  destinationUrl: string;
  desktopImage: string;
  mobileImage: string;
  badgeText: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface CategoryCuratorItem {
  id: string;
  name: string;
  subtitle: string;
  slug: string;
  coverImage: string;
  featuredSkus: string[];
  isActive: boolean;
}

const INITIAL_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'The Royal Wodeyar Heritage',
    subtitle: 'Pure 100% Mulberry Crepe Silks hand-woven with tested 24K pure gold zari.',
    ctaText: 'Explore Royal Heritage',
    destinationUrl: '/products?weave=Mysore+Silk',
    desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1920&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    badgeText: 'Mysuru Master Weaver Craft',
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    isActive: true,
  },
  {
    id: 'slide-2',
    title: 'Bridal Korvai Masterpieces',
    subtitle: 'Heavy 3-shuttle interlocking borders crafted by 4th-generation temple artisans.',
    ctaText: 'View Bridal Trousseau',
    destinationUrl: '/products?weave=Kanchipuram',
    desktopImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1920&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
    badgeText: 'Muhurtham 2026 Collection',
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'slide-3',
    title: 'Varanasi Kadwa & Meenakari',
    subtitle: 'Intricate floral jaals and hand-woven motifs from the sacred ghats.',
    ctaText: 'Discover Banarasi',
    destinationUrl: '/products?weave=Banarasi',
    desktopImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1920&auto=format&fit=crop',
    mobileImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
    badgeText: 'Pure Katan Handlooms',
    startDate: '2026-08-10',
    endDate: '2026-10-31',
    isActive: true,
  },
];

const INITIAL_CATEGORIES: CategoryCuratorItem[] = [
  {
    id: 'cat-1',
    name: 'Mysore Silk Crepe',
    subtitle: 'Lightweight Royal Drape with Pure Kasuti',
    slug: 'mysore-silk',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    featuredSkus: ['NSH-SKU-MYS-01', 'NSH-SKU-MYS-02', 'NSH-SKU-MYS-07', 'NSH-SKU-MYS-09'],
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Kanchipuram Korvai',
    subtitle: 'Heavy 3-Shuttle Temple Zari Brocades',
    slug: 'kanchipuram',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
    featuredSkus: ['NSH-SKU-KAN-04', 'NSH-SKU-KAN-08', 'NSH-SKU-KAN-11', 'NSH-SKU-KAN-02'],
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Banarasi Kadwa',
    subtitle: 'Varanasi Meenakari Bootas & Katan Silks',
    slug: 'banarasi',
    coverImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
    featuredSkus: ['NSH-SKU-BAN-03', 'NSH-SKU-BAN-05', 'NSH-SKU-BAN-06', 'NSH-SKU-BAN-09'],
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'Yeola Paithani',
    subtitle: 'Maharashtrian Asawali Peacock Borders',
    slug: 'paithani',
    coverImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
    featuredSkus: ['NSH-SKU-PAI-02', 'NSH-SKU-PAI-04', 'NSH-SKU-PAI-07', 'NSH-SKU-PAI-01'],
    isActive: true,
  },
  {
    id: 'cat-5',
    name: 'Tissue Georgette',
    subtitle: 'Metallic Sheer Gold & Silver Drapes',
    slug: 'tissue-georgette',
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    featuredSkus: ['NSH-SKU-TIS-08', 'NSH-SKU-TIS-01', 'NSH-SKU-TIS-03', 'NSH-SKU-TIS-05'],
    isActive: true,
  },
  {
    id: 'cat-6',
    name: 'Patan Patola',
    subtitle: 'Double Ikkat Geometry & Natural Dyes',
    slug: 'patola',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    featuredSkus: ['NSH-SKU-PAT-01', 'NSH-SKU-PAT-02', 'NSH-SKU-PAT-03', 'NSH-SKU-PAT-04'],
    isActive: true,
  },
];

export default function StorefrontDisplayManagerPage() {
  const [activeSection, setActiveSection] = useState<'HERO' | 'MARQUEE' | 'CATEGORIES'>('HERO');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. HERO SLIDES STATE
  const [slides, setSlides] = useState<HeroSlide[]>(INITIAL_SLIDES);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);

  // 2. MARQUEE TICKER STATE
  const [marqueeEnabled, setMarqueeEnabled] = useState(true);
  const [marqueeText, setMarqueeText] = useState(
    '✨ FESTIVE MUHURTHAM SEASON: Flat 10% Off with Code MYSORE10 • Free BlueDart Air Shipping On All Domestic Orders • Silk Mark Certified 100% Pure Handlooms'
  );
  const [marqueeBgColor, setMarqueeBgColor] = useState('#0F172A');
  const [marqueeTextColor, setMarqueeTextColor] = useState('#FEF3C7');
  const [marqueeSpeed, setMarqueeSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST'>('NORMAL');

  // 3. CATEGORY CURATOR STATE
  const [categories, setCategories] = useState<CategoryCuratorItem[]>(INITIAL_CATEGORIES);

  // Reorder Slide
  const moveSlide = (index: number, direction: 'UP' | 'DOWN') => {
    const newIndex = direction === 'UP' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setSlides(updated);
    triggerToast('Slide order updated.');
  };

  // Reorder Category
  const moveCategory = (index: number, direction: 'UP' | 'DOWN') => {
    const newIndex = direction === 'UP' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setCategories(updated);
    triggerToast('Homepage category tile sequence updated.');
  };

  // Toggle Slide Active
  const toggleSlideActive = (id: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    triggerToast('Slide visibility status updated.');
  };

  // Save Slide Edits
  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (slides.some((s) => s.id === editingSlide.id)) {
      setSlides((prev) => prev.map((s) => (s.id === editingSlide.id ? editingSlide : s)));
      triggerToast(`Slide "${editingSlide.title}" updated.`);
    } else {
      setSlides([...slides, editingSlide]);
      triggerToast(`New hero banner added to carousel.`);
    }
    setEditingSlide(null);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="font-sans text-[#1F1B16] select-none pb-28 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#18110E] text-[#FAF3E4] px-5 py-3 rounded-2xl shadow-2xl border border-[#C87F4A]/30 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. TOP HEADER & BREADCRUMBS                        */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Homepage Content
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <LayoutTemplate className="w-3 h-3 text-[#7A1C30]" />
              <span>Homepage Merchandising</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Hero Banners, Single Active Marquee & Category Curations
          </p>
        </div>

        {/* View Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="px-3.5 py-1.5 rounded-lg border border-[#E8DCC9] bg-white hover:bg-[#FAF6F0] text-stone-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Preview Live Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#7A1C30]" />
        </Link>
      </div>

      {/* ================================================== */}
      {/* 2. NAVIGATION TABS                                 */}
      {/* ================================================== */}
      <div className="flex items-center gap-2 border-b border-[#E8DCC9] pb-1 overflow-x-auto">
        {[
          { key: 'HERO', label: `Hero Promo Carousel (${slides.length} Slides)`, icon: ImageIcon },
          { key: 'MARQUEE', label: 'Top Offer Marquee / Ticker', icon: Megaphone },
          { key: 'CATEGORIES', label: `Shop By Category Grid (6 Tiles)`, icon: Grid },
        ].map((sec) => (
          <button
            key={sec.key}
            type="button"
            onClick={() => setActiveSection(sec.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSection === sec.key
                ? 'bg-[#7A1C30] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
            }`}
          >
            <sec.icon className="w-4 h-4" />
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* ================================================== */}
      {/* 3. SECTION 1: HERO PROMO CAROUSEL MANAGER          */}
      {/* ================================================== */}
      {activeSection === 'HERO' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1F1B16] font-sans">
                Hero Carousel Slides Sequence
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Order determines the first-look slide rotation speed on the main homepage.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingSlide({
                  id: `slide-${Date.now()}`,
                  title: 'Grand Festive Silk Showcase',
                  subtitle: 'Authentic pure silk handlooms with certified Silk Mark provenance.',
                  ctaText: 'Explore Collection',
                  destinationUrl: '/products',
                  desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1920&auto=format&fit=crop',
                  mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
                  badgeText: 'ROYAL HERITAGE EXCLUSIVE',
                  startDate: '2026-08-01',
                  endDate: '2026-12-31',
                  isActive: true,
                });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-200" />
              <span>+ Add Hero Slide</span>
            </button>
          </div>
          {/* Slides List */}

          {/* Slides List */}
          <div className="space-y-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans hover:border-slate-300 transition-all"
              >
                {/* Reorder Arrows & Position */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSlide(index, 'UP')}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-xs text-slate-500">#{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => moveSlide(index, 'DOWN')}
                      disabled={index === slides.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <img
                    src={slide.desktopImage}
                    alt={slide.title}
                    className="w-24 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                  />

                  {/* Content Details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{slide.title}</span>
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.2 rounded font-bold border border-blue-200">
                        {slide.badgeText}
                      </span>
                      {!slide.isActive && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          Draft / Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-1">{slide.subtitle}</p>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 pt-0.5">
                      <span>CTA: "{slide.ctaText}" → {slide.destinationUrl}</span>
                      <span>•</span>
                      <span>Schedule: {slide.startDate} to {slide.endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => toggleSlideActive(slide.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      slide.isActive
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    {slide.isActive ? 'Active on Store' : 'Inactive'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingSlide(slide)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                    title="Edit Slide Content"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSlides(slides.filter((s) => s.id !== slide.id));
                      triggerToast('Slide removed from carousel.');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. SECTION 2: TOP OFFER MARQUEE TICKER             */}
      {/* ================================================== */}
      {activeSection === 'MARQUEE' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-600" />
                <span>Top Scrolling Offer Bar (Marquee)</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Persistent header ticker bar for promotional alerts, festive coupons & shipping notices
              </p>
            </div>

            {/* Toggle Active */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Site-Wide Marquee:</span>
              <button
                type="button"
                onClick={() => {
                  setMarqueeEnabled(!marqueeEnabled);
                  triggerToast(`Marquee ticker ${!marqueeEnabled ? 'enabled' : 'disabled'}.`);
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  marqueeEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {marqueeEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Real-time Live Animated Preview */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Live Animated Storefront Preview
            </span>
            <div
              className="py-2.5 px-4 rounded-xl overflow-hidden border border-slate-300 font-mono text-xs font-semibold shadow-inner"
              style={{
                backgroundColor: marqueeBgColor,
                color: marqueeTextColor,
              }}
            >
              <div className="whitespace-nowrap overflow-hidden">
                <span className="inline-block animate-marquee">{marqueeText}</span>
              </div>
            </div>
          </div>

          {/* Marquee Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Marquee Announcement Text *
              </label>
              <textarea
                rows={2}
                value={marqueeText}
                onChange={(e) => setMarqueeText(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-sans text-slate-900"
              />
            </div>

            {/* Color Selectors */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Background Canvas Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={marqueeBgColor}
                  onChange={(e) => setMarqueeBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={marqueeBgColor}
                  onChange={(e) => setMarqueeBgColor(e.target.value)}
                  className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
                />
                <div className="flex gap-1">
                  {['#0F172A', '#831843', '#1E3A8A', '#14532D'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMarqueeBgColor(c)}
                      className="w-6 h-6 rounded-md border border-slate-300"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Text & Icon Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={marqueeTextColor}
                  onChange={(e) => setMarqueeTextColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={marqueeTextColor}
                  onChange={(e) => setMarqueeTextColor(e.target.value)}
                  className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
                />
                <div className="flex gap-1">
                  {['#FEF3C7', '#FFFFFF', '#FDE047', '#BBF7D0'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMarqueeTextColor(c)}
                      className="w-6 h-6 rounded-md border border-slate-300"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Speed Controller */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Scroll Velocity
              </label>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                {[
                  { key: 'SLOW', label: 'Slow (35s)', speed: '35s' },
                  { key: 'NORMAL', label: 'Normal (25s)', speed: '25s' },
                  { key: 'FAST', label: 'Fast (15s)', speed: '15s' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      setMarqueeSpeed(s.key as any);
                      triggerToast(`Scroll velocity set to ${s.label}.`);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      marqueeSpeed === s.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => triggerToast('Marquee settings published to storefront.')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Publish Marquee Updates</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 5. SECTION 3: "SHOP BY CATEGORY" CURATOR           */}
      {/* ================================================== */}
      {activeSection === 'CATEGORIES' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-sans">
              Homepage "Shop by Heritage Tradition" Curator
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Configure the 6 category tiles and the 4 featured product thumbnails appearing in each drawer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs font-sans hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        Position #{index + 1}
                      </span>
                    </div>

                    {/* Move controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveCategory(index, 'UP')}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Left/Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(index, 'DOWN')}
                        disabled={index === categories.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        title="Move Right/Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={cat.coverImage}
                      alt={cat.name}
                      className="w-14 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      <p className="text-slate-500 text-[11px] line-clamp-1">{cat.subtitle}</p>
                      <span className="text-[10px] font-mono text-blue-700 font-semibold">
                        /products?weave={cat.slug}
                      </span>
                    </div>
                  </div>

                  {/* 4 Mini Thumbnails Selection */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                    <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                      4 Curated Masterpiece SKUs:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] text-center font-bold">
                      {cat.featuredSkus.map((sku) => (
                        <div
                          key={sku}
                          className="bg-white p-1 rounded border border-slate-300 text-slate-800 truncate"
                          title={sku}
                        >
                          {sku.split('-')[2]}-{sku.split('-')[3]}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    ✓ Live on Homepage
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerToast(`Category ${cat.name} preview launched.`)}
                    className="text-blue-600 hover:underline text-xs font-semibold"
                  >
                    Curate SKUs →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. BANNER CARD EDITOR MODAL / DRAWER               */}
      {/* ================================================== */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Hero Promo Slide Studio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
              {/* Images */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Desktop Image URL (1920x800) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.desktopImage}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, desktopImage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                  <img
                    src={editingSlide.desktopImage}
                    alt="Desktop Preview"
                    className="w-full h-24 rounded-lg object-cover mt-2 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Image URL (800x1000) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.mobileImage}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, mobileImage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                  <img
                    src={editingSlide.mobileImage}
                    alt="Mobile Preview"
                    className="w-20 h-24 rounded-lg object-cover mt-2 border border-slate-200"
                  />
                </div>
              </div>

              {/* Headings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Badge Pill Inscription
                  </label>
                  <input
                    type="text"
                    value={editingSlide.badgeText}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, badgeText: e.target.value })
                    }
                    placeholder="e.g. Mysuru Royal Heritage"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Main Banner Heading *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.title}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={editingSlide.subtitle}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {/* CTA & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CTA Button Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.ctaText}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, ctaText: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Destination URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.destinationUrl}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, destinationUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Publish From</label>
                  <input
                    type="date"
                    value={editingSlide.startDate}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Publish Until</label>
                  <input
                    type="date"
                    value={editingSlide.endDate}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Commit Slide Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
