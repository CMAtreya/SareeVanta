'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';


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

const INITIAL_SLIDES: HeroSlide[] = [];
const INITIAL_CATEGORIES: CategoryCuratorItem[] = [
  {
    id: 'mysore-silk',
    name: 'Mysore Silk',
    subtitle: 'Royal Crepe Silk Heritage with 24K Tested Zari',
    slug: 'Mysore Silk',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    featuredSkus: ['NSH-SKU-MYS-01', 'NSH-SKU-MYS-02', 'NSH-SKU-MYS-03', 'NSH-SKU-MYS-04'],
    isActive: true,
  },
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    subtitle: 'Sacred 3-Shuttle Korvai with Heavy Temple Borders',
    slug: 'Kanchipuram',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    featuredSkus: ['NSH-SKU-KAN-01', 'NSH-SKU-KAN-02', 'NSH-SKU-KAN-03', 'NSH-SKU-KAN-04'],
    isActive: true,
  },
  {
    id: 'banarasi',
    name: 'Banarasi',
    subtitle: 'Kadwa Katan Hand-Loomed Brocades & Silver Meenakari',
    slug: 'Banarasi',
    coverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    featuredSkus: ['NSH-SKU-BAN-01', 'NSH-SKU-BAN-02', 'NSH-SKU-BAN-03', 'NSH-SKU-BAN-04'],
    isActive: true,
  },
  {
    id: 'paithani',
    name: 'Paithani',
    subtitle: 'Maharani Asawali Vines with Pure Tapestry Pallus',
    slug: 'Paithani',
    coverImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    featuredSkus: ['NSH-SKU-PAI-01', 'NSH-SKU-PAI-02', 'NSH-SKU-PAI-03', 'NSH-SKU-PAI-04'],
    isActive: true,
  },
  {
    id: 'tissue-georgette',
    name: 'Tissue Georgette',
    subtitle: 'Metallic Luster with Featherlight Draping Elegance',
    slug: 'Tissue Georgette',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    featuredSkus: ['NSH-SKU-TIS-01', 'NSH-SKU-TIS-02', 'NSH-SKU-TIS-03', 'NSH-SKU-TIS-04'],
    isActive: true,
  },
  {
    id: 'ikkat',
    name: 'Ikkat',
    subtitle: 'Mathematical Double Patola Heritage Silk',
    slug: 'Ikkat',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    featuredSkus: ['NSH-SKU-IKK-01', 'NSH-SKU-IKK-02', 'NSH-SKU-IKK-03', 'NSH-SKU-IKK-04'],
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
  const [marqueeLines, setMarqueeLines] = useState<string[]>([
    '✨ FESTIVE MUHURTHAM SEASON: Flat 10% Off with Code MYSORE10',
    '✈️ Free BlueDart Express Air Shipping on all Domestic Orders Above ₹5,000',
    '🏷️ Silk Mark Certified 100% Pure Handloom Silks Direct from Master Weavers',
  ]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [marqueeBgColor, setMarqueeBgColor] = useState('#7A1C30');
  const [marqueeTextColor, setMarqueeTextColor] = useState('#FEF3C7');
  const [marqueeSpeed, setMarqueeSpeed] = useState<'SLOW' | 'NORMAL' | 'FAST'>('NORMAL');

  // 3. CATEGORY CURATOR STATE
  const [categories, setCategories] = useState<CategoryCuratorItem[]>(INITIAL_CATEGORIES);

  // Auto-rotate preview announcement vertically every 3.5 seconds
  React.useEffect(() => {
    if (marqueeLines.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % marqueeLines.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [marqueeLines.length]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to re-fetch fresh slides from DB
  const refreshSlidesFromDb = async () => {
    try {
      const res = await fetch(`/api/admin/banners?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.slides && Array.isArray(data.slides)) {
          const formatted: HeroSlide[] = data.slides.map((s: any) => ({
            id: s.id,
            title: s.heading,
            subtitle: s.tagline || '',
            ctaText: s.cta_text || 'Explore Collection',
            destinationUrl: '/products',
            desktopImage: s.desktop_image_path,
            mobileImage: s.mobile_image_path || s.desktop_image_path,
            badgeText: s.badge_text || '',
            startDate: '2026-08-01',
            endDate: '2026-12-31',
            isActive: Boolean(s.is_active),
          }));
          setSlides(formatted);
        }
      }
    } catch (err) {
      console.error('[Banners API] Refresh error:', err);
    }
  };

  // Reorder Slide
  const moveSlide = async (index: number, direction: 'UP' | 'DOWN') => {
    const newIndex = direction === 'UP' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setSlides(updated);
    triggerToast('Slide order updated.');

    try {
      const reorderPayload = updated.map((s, idx) => ({ id: s.id, display_order: idx + 1 }));
      await fetch(`/api/admin/banners?_t=${Date.now()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
      await refreshSlidesFromDb();
    } catch (err) {
      console.error('[Banners API] Reorder error:', err);
    }
  };

  // Delete Slide Permanently
  const handleDeleteSlide = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    triggerToast(`Slide "${title}" deleted.`);
    try {
      await fetch(`/api/admin/banners?id=${encodeURIComponent(id)}&_t=${Date.now()}`, { method: 'DELETE' });
      await refreshSlidesFromDb();
    } catch (err) {
      console.error('[Banners API] Delete error:', err);
    }
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

  React.useEffect(() => {
    refreshSlidesFromDb();

    // Load active marquee lines & colors
    fetch(`/api/admin/marquee?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.bgColor) setMarqueeBgColor(data.bgColor);
        if (data.textColor) setMarqueeTextColor(data.textColor);
        if (data.isActive !== undefined) setMarqueeEnabled(Boolean(data.isActive));
        if (data.activeLines && Array.isArray(data.activeLines) && data.activeLines.length > 0) {
          setMarqueeLines(data.activeLines);
        } else if (data.activeMarquee?.message_text) {
          setMarqueeLines([data.activeMarquee.message_text]);
        }
      })
      .catch((err) => console.error('[Marquee API] Fetch error:', err));
  }, []);

  // Toggle Slide Active
  const toggleSlideActive = async (id: string) => {
    const slide = slides.find((s) => s.id === id);
    const newActiveState = slide ? !slide.isActive : false;

    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: newActiveState } : s))
    );

    try {
      await fetch(`/api/admin/banners?_t=${Date.now()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slide_id: id, is_active: newActiveState }),
      });
      await refreshSlidesFromDb();
    } catch (err) {
      console.error('[Banners API] Patch error:', err);
    }
    triggerToast('Slide visibility status updated.');
  };

  // Save Slide Edits / Create Slide
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (!editingSlide.title?.trim()) {
      alert('Validation Error: Slide Heading is required.');
      return;
    }

    const finalDesktopImg = editingSlide.desktopImage?.trim();
    if (!finalDesktopImg) {
      alert('Validation Error: Desktop Banner Image is required (choose an image file or enter a valid URL).');
      return;
    }

    const finalMobileImg = editingSlide.mobileImage?.trim() || finalDesktopImg;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/banners?_t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSlide.id,
          slide_id: editingSlide.id,
          heading: editingSlide.title.trim(),
          tagline: editingSlide.subtitle?.trim() || '',
          badge_text: editingSlide.badgeText?.trim() || '',
          cta_text: editingSlide.ctaText?.trim() || 'Explore Collection',
          desktop_image_path: finalDesktopImg,
          mobile_image_path: finalMobileImg,
          is_active: editingSlide.isActive !== false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Error saving banner: ${data.error || 'Server error'}`);
      } else {
        await refreshSlidesFromDb();
        triggerToast(`Hero banner "${editingSlide.title}" saved successfully!`);
        setEditingSlide(null);
      }
    } catch (err: any) {
      console.error('[Banners API] Save error:', err);
      alert(`Network error saving slide: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
                  title: '',
                  subtitle: '',
                  ctaText: 'Explore Collection',
                  destinationUrl: '/products',
                  desktopImage: '',
                  mobileImage: '',
                  badgeText: '',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
                    onClick={() => handleDeleteSlide(slide.id, slide.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
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
                <Megaphone className="w-4 h-4 text-[#7A1C30]" />
                <span>Top Promotional Announcement Bar (Storefront Header)</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Multi-line vertical rotating ticker displayed at the very top of the customer storefront
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
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  marqueeEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {marqueeEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Storefront-Identical Live Animated Preview (Vertical Bottom-to-Top Rotation) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                Live Storefront Rotating Preview (Bottom-to-Top Animation)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Line {previewIndex + 1} of {marqueeLines.length}
              </span>
            </div>

            <div
              className="py-2 px-3 sm:px-6 rounded-2xl overflow-hidden font-sans text-xs font-medium shadow-md transition-colors flex items-center justify-between gap-2"
              style={{
                backgroundColor: marqueeBgColor,
                color: marqueeTextColor,
              }}
            >
              <button
                type="button"
                onClick={() => setPreviewIndex((prev) => (prev - 1 + marqueeLines.length) % marqueeLines.length)}
                className="p-1 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
                title="Previous Line"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 text-center overflow-hidden px-2 h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={previewIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="truncate font-medium"
                  >
                    {marqueeLines[previewIndex] || '✨ Add an announcement below'}
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => setPreviewIndex((prev) => (prev + 1) % marqueeLines.length)}
                className="p-1 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
                title="Next Line"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multi-Line Announcement Inputs */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
                Announcement Messages ({marqueeLines.length} Active Lines)
              </span>
              <button
                type="button"
                onClick={() => setMarqueeLines([...marqueeLines, '✨ New Promotional Alert'])}
                className="px-3 py-1 bg-[#7A1C30] hover:bg-[#5F1424] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Announcement Line</span>
              </button>
            </div>

            <div className="space-y-2">
              {marqueeLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-white px-2.5 py-2 rounded-xl border border-slate-200 text-slate-700">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => {
                      const updated = [...marqueeLines];
                      updated[idx] = e.target.value;
                      setMarqueeLines(updated);
                    }}
                    placeholder={`Announcement line #${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-sans text-slate-900 bg-white focus:border-[#7A1C30]"
                  />
                  {marqueeLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = marqueeLines.filter((_, i) => i !== idx);
                        setMarqueeLines(updated);
                        if (previewIndex >= updated.length) setPreviewIndex(0);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Color Selectors & Storefront Palette */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Background Canvas Color (Storefront Header)
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
                  {[
                    { hex: '#7A1C30', label: 'Royal Maroon' },
                    { hex: '#5F1424', label: 'Deep Wine' },
                    { hex: '#18110E', label: 'Heritage Charcoal' },
                    { hex: '#0F172A', label: 'Royal Navy' },
                    { hex: '#1B3B2B', label: 'Emerald Silk' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setMarqueeBgColor(c.hex)}
                      className="w-6 h-6 rounded-md border border-slate-300 cursor-pointer"
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
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
                  {[
                    { hex: '#FEF3C7', label: 'Warm Gold' },
                    { hex: '#FFFFFF', label: 'Pure White' },
                    { hex: '#FDE047', label: 'Amber Gold' },
                    { hex: '#A7F3D0', label: 'Mint Gold' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setMarqueeTextColor(c.hex)}
                      className="w-6 h-6 rounded-md border border-slate-300 cursor-pointer"
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={async () => {
                try {
                  await fetch('/api/admin/marquee', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message_lines: marqueeLines,
                      bg_color: marqueeBgColor,
                      text_color: marqueeTextColor,
                      is_active: marqueeEnabled,
                    }),
                  });
                  triggerToast('Marquee announcements and colors published to database & storefront header.');
                } catch (err) {
                  console.error('[Marquee API] Error saving marquee:', err);
                  triggerToast('Marquee settings updated.');
                }
              }}
              className="px-5 py-2.5 bg-[#7A1C30] hover:bg-[#5F1424] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
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
              {/* Images File Upload Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desktop Banner Image Upload */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Desktop Banner Image (1920x800) *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 text-center bg-slate-50 transition-colors">
                    <input
                      type="file"
                      id="desktop-banner-upload"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditingSlide({
                              ...editingSlide,
                              desktopImage: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="desktop-banner-upload" className="cursor-pointer space-y-1 block">
                      <ImageIcon className="w-5 h-5 text-blue-600 mx-auto" />
                      <span className="text-xs font-bold text-slate-900 block">
                        Choose Desktop Image File
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        PNG, JPG, WEBP (Recommended 1920x800)
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editingSlide.desktopImage}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, desktopImage: e.target.value })
                    }
                    placeholder="Or paste Desktop Image URL directly..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-mono mt-1"
                  />
                  {editingSlide.desktopImage && (
                    <div className="relative mt-2">
                      <img
                        src={editingSlide.desktopImage}
                        alt="Desktop Preview"
                        className="w-full h-24 rounded-lg object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingSlide({ ...editingSlide, desktopImage: '' })}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 text-[10px]"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Banner Image Upload */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Mobile Banner Image (800x1000) *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-3 text-center bg-slate-50 transition-colors">
                    <input
                      type="file"
                      id="mobile-banner-upload"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditingSlide({
                              ...editingSlide,
                              mobileImage: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="mobile-banner-upload" className="cursor-pointer space-y-1 block">
                      <Smartphone className="w-5 h-5 text-blue-600 mx-auto" />
                      <span className="text-xs font-bold text-slate-900 block">
                        Choose Mobile Image File
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        PNG, JPG, WEBP (Recommended 800x1000)
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editingSlide.mobileImage}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, mobileImage: e.target.value })
                    }
                    placeholder="Or paste Mobile Image URL directly..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-mono mt-1"
                  />
                  {editingSlide.mobileImage && (
                    <div className="relative mt-2 inline-block">
                      <img
                        src={editingSlide.mobileImage}
                        alt="Mobile Preview"
                        className="w-20 h-24 rounded-lg object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingSlide({ ...editingSlide, mobileImage: '' })}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 text-[10px]"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
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
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !editingSlide.title?.trim() || !editingSlide.desktopImage?.trim()}
                  className="px-5 py-2 rounded-xl bg-[#7A1C30] hover:bg-[#5F1424] text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Saving Slide...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-200" />
                      <span>Commit & Publish Slide</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
