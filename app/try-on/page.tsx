'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  ChevronRight,
  ShieldCheck,
  Check,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  SlidersHorizontal,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { products, Product } from '@/lib/products';
import { useCart } from '@/components/providers/CartContext';

type SkinToneId = 'fair' | 'wheatish' | 'medium' | 'deep' | 'dark';

interface SkinToneOption {
  id: SkinToneId;
  name: string;
  subtitle: string;
  hex: string;
}

const skinTones: SkinToneOption[] = [
  {
    id: 'fair',
    name: 'Fair',
    subtitle: 'Porcelain / Ivory',
    hex: '#F7D5BA',
  },
  {
    id: 'wheatish',
    name: 'Wheatish',
    subtitle: 'Warm Golden',
    hex: '#E8B88A',
  },
  {
    id: 'medium',
    name: 'Medium',
    subtitle: 'Dusky Honey',
    hex: '#C68652',
  },
  {
    id: 'deep',
    name: 'Deep',
    subtitle: 'Warm Bronze',
    hex: '#8D4A27',
  },
  {
    id: 'dark',
    name: 'Dark',
    subtitle: 'Rich Ebony',
    hex: '#4B2B1B',
  },
];

/**
 * Pre-generated image-matrix lookup structure:
 * Map from productId (or slug) -> skinToneId -> pre-generated avatar visualizer image path.
 */
const avatarImageMatrix: Record<string, Partial<Record<SkinToneId, string>>> = {
  'mysore-royal-crimson': {
    fair: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    wheatish: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    medium: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    deep: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
    dark: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
  },
  'kanchi-muhurtham-gold': {
    fair: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    wheatish: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    medium: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
    deep: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    dark: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
  },
  'banarasi-kadwa-emerald': {
    fair: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    wheatish: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
    medium: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    deep: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    dark: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
  },
  'mysore-champagne-gold': {
    fair: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
    wheatish: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
    medium: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    deep: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    dark: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  },
  'paithani-tilli-shot-purple': {
    fair: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
    wheatish: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    medium: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    deep: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
    dark: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  },
  'organza-flora-powder-blue': {
    fair: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
    wheatish: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
    medium: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
  },
  'ikkat-patola-royal-ruby': {
    fair: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    wheatish: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    medium: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  },
  'kanchi-rani-pink-gold': {
    fair: 'https://images.unsplash.com/photo-1610030469668-93530c17b58f?auto=format&fit=crop&w=1200&q=85',
    wheatish: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
    medium: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
    deep: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1200&q=85',
  },
};

function TryOnStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sareeQuery = searchParams.get('saree');

  const { addToCart, currency } = useCart();

  // Find pre-selected saree from query parameter or fallback to first product
  const matchedProduct = useMemo(() => {
    if (!sareeQuery) return products[0];
    return (
      products.find(
        (p) =>
          p.slug.toLowerCase() === sareeQuery.toLowerCase() ||
          p.id.toLowerCase() === sareeQuery.toLowerCase()
      ) || products[0]
    );
  }, [sareeQuery]);

  const [selectedProduct, setSelectedProduct] = useState<Product>(matchedProduct);
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinToneId>('wheatish');
  const [isAdded, setIsAdded] = useState(false);

  // Sync state when URL param changes
  useEffect(() => {
    if (sareeQuery) {
      const found = products.find(
        (p) =>
          p.slug.toLowerCase() === sareeQuery.toLowerCase() ||
          p.id.toLowerCase() === sareeQuery.toLowerCase()
      );
      if (found) setSelectedProduct(found);
    }
  }, [sareeQuery]);

  // Lookup currently displayed avatar image
  const currentAvatarImage = useMemo(() => {
    const productLookup = avatarImageMatrix[selectedProduct.id] || avatarImageMatrix[selectedProduct.slug];
    if (productLookup && productLookup[selectedSkinTone]) {
      return productLookup[selectedSkinTone] as string;
    }
    // Return null if this combination doesn't exist in lookup
    return null;
  }, [selectedProduct, selectedSkinTone]);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleSareeSelect = (p: Product) => {
    setSelectedProduct(p);
    router.replace(`/try-on?saree=${encodeURIComponent(p.slug)}`, { scroll: false });
  };

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Breadcrumb Trail */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 font-sans mb-6">
          <Link href="/" className="hover:text-[#C87F4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link href="/products" className="hover:text-[#C87F4A] transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-[#1F1B16] font-semibold">AI Avatar Try-On Studio</span>
        </nav>

        {/* Page Title & Luxury Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neelsareehouse Digital Atelier</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-[#1F1B16] tracking-tight">
            AI Avatar Drape Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-sans mt-2 max-w-xl mx-auto">
            Experience how royal Mysuru crepe and Kanchipuram silk pleats drape across diverse Indian skin tones before making your heirloom purchase.
          </p>
        </div>

        {/* ==================================================== */}
        {/* 2-COLUMN STUDIO WORKSPACE                            */}
        {/* LEFT: AVATAR VISUALIZER | RIGHT: SELECTORS PANEL     */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white p-6 sm:p-10 rounded-3xl border border-[#C87F4A]/25 shadow-silk-lg">
          {/* ==================================================== */}
          {/* LEFT / MAIN AREA: LARGE AVATAR DISPLAY (COL-span-7)  */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Visualizer Frame */}
            <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF3E4] border border-[#C87F4A]/30 shadow-silk">
              {/* Animated Avatar Image with Smooth Crossfade */}
              <AnimatePresence mode="wait">
                {currentAvatarImage ? (
                  <motion.div
                    key={`${selectedProduct.id}-${selectedSkinTone}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="relative w-full h-full"
                  >
                    <img
                      src={currentAvatarImage}
                      alt={`${selectedProduct.title} on ${selectedSkinTone} skin tone avatar`}
                      className="w-full h-full object-cover object-center select-none"
                    />

                    {/* Subtle Sheen Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />
                  </motion.div>
                ) : (
                  /* Graceful Placeholder State */
                  <motion.div
                    key="placeholder-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#FAF3E4] to-[#F3E8D6]"
                  >
                    <div className="w-16 h-16 rounded-full bg-white border border-[#C87F4A]/30 flex items-center justify-center text-[#C87F4A] mb-4 shadow-sm">
                      <ImageIcon className="w-8 h-8 opacity-75" />
                    </div>
                    <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#C87F4A] mb-1">
                      Digital Loom Rendering
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-[#1F1B16]">
                      Preview Coming Soon
                    </h3>
                    <p className="text-xs text-stone-500 font-sans max-w-xs mt-2 leading-relaxed">
                      Our digital atelier is currently calibrating the high-resolution 24K zari drape for this specific skin tone combination.
                    </p>
                    <div className="mt-5 flex items-center gap-2 text-[11px] font-mono text-[#773D21] bg-white/80 px-3 py-1.5 rounded-full border border-[#C87F4A]/20">
                      <Info className="w-3.5 h-3.5 text-[#C87F4A]" />
                      <span>Try Fair, Wheatish, or Medium tone above</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Silk Mark India Guarantee Badge */}
              <div className="absolute top-4 left-4 bg-[#FAF3E4]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C87F4A]/30 text-xs font-mono font-semibold text-[#773D21] flex items-center gap-1.5 shadow-sm pointer-events-none">
                <ShieldCheck className="w-4 h-4 text-[#C87F4A]" />
                <span>100% Silk Mark India Certified</span>
              </div>

              {/* Active Tone Pill Indicator */}
              <div className="absolute top-4 right-4 bg-[#1F1B16]/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-mono text-[#FAF3E4] flex items-center gap-1.5 border border-white/20">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/50"
                  style={{
                    backgroundColor: skinTones.find((t) => t.id === selectedSkinTone)?.hex,
                  }}
                />
                <span className="capitalize">{selectedSkinTone} Tone</span>
              </div>

              {/* Bottom Card Overlay on Avatar Display */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#C87F4A]/30 shadow-lg flex items-center justify-between gap-4">
                <div className="truncate">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#C87F4A] font-semibold">
                    <span>{selectedProduct.weave}</span>
                    <span>•</span>
                    <span>{selectedProduct.fabric}</span>
                  </div>
                  <h4 className="font-editorial text-sm sm:text-base font-bold text-[#1F1B16] truncate">
                    {selectedProduct.title}
                  </h4>
                  <span className="font-mono text-xs font-bold text-[#773D21]">
                    {formatPrice(selectedProduct.priceINR)}
                  </span>
                </div>

                {/* Primary "Add This to Cart" Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`px-5 py-3 rounded-sm text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 shadow-md ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#C87F4A] hover:bg-[#B36737] text-white transform hover:-translate-y-0.5'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add This to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mandatory Explanatory Line */}
            <p className="text-xs font-sans text-stone-500 mt-4 text-center">
              Preview powered by <strong className="text-[#C87F4A]">Neelsareehouse</strong> — see the drape before you buy.
            </p>
          </div>

          {/* ==================================================== */}
          {/* RIGHT / SIDE PANEL: SELECTORS (COL-span-5)           */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 space-y-8">
            {/* SELECTOR 1: CHOOSE A SAREE */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#C87F4A]/20 mb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C87F4A]" />
                  <h3 className="text-xs uppercase tracking-widest font-bold font-mono text-[#1F1B16]">
                    1. Choose a Saree
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-stone-500">
                  {products.length} Designs
                </span>
              </div>

              {/* Scrollable Saree Grid/Strip */}
              <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {products.map((p) => {
                  const isSelected = selectedProduct.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSareeSelect(p)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all group ${
                        isSelected
                          ? 'border-[#C87F4A] bg-[#FAF3E4] shadow-xs ring-1 ring-[#C87F4A]'
                          : 'border-stone-200 bg-white hover:border-[#C87F4A]/50'
                      }`}
                    >
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-11 h-14 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                      />
                      <div className="truncate flex-1">
                        <span className="text-[10px] font-mono text-[#C87F4A] font-semibold block uppercase leading-tight">
                          {p.weave}
                        </span>
                        <span className="text-xs font-editorial font-bold block truncate text-[#1F1B16] group-hover:text-[#C87F4A]">
                          {p.title}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-stone-600 block mt-0.5">
                          {formatPrice(p.priceINR)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SELECTOR 2: SKIN TONE */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#C87F4A]/20 mb-3">
                <h3 className="text-xs uppercase tracking-widest font-bold font-mono text-[#1F1B16]">
                  2. Select Skin Tone
                </h3>
                <span className="text-[11px] font-mono text-[#C87F4A] capitalize font-semibold">
                  {skinTones.find((t) => t.id === selectedSkinTone)?.name} (
                  {skinTones.find((t) => t.id === selectedSkinTone)?.subtitle})
                </span>
              </div>

              {/* Row of 5 Selectable Skin-Tone Swatches */}
              <div className="grid grid-cols-5 gap-2">
                {skinTones.map((tone) => {
                  const isSelected = selectedSkinTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setSelectedSkinTone(tone.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-2 transition-all group text-center ${
                        isSelected
                          ? 'border-[#C87F4A] bg-[#FAF3E4] shadow-xs ring-2 ring-[#C87F4A]/40'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      {/* Circular Color Swatch */}
                      <span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/20 shadow-xs transition-transform group-hover:scale-105 flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: tone.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-black/70 stroke-[3]" />}
                      </span>

                      {/* Label */}
                      <span className="text-[10px] font-sans font-bold text-[#1F1B16] leading-tight">
                        {tone.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Saree Detailed Card & Quick Links */}
            <div className="p-4 rounded-2xl bg-[#FAF3E4]/70 border border-[#C87F4A]/25 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-[#C87F4A]">
                  Selected Saree Specs
                </span>
                <Link
                  href={`/products/${selectedProduct.slug}`}
                  className="text-[11px] font-sans font-semibold text-[#773D21] hover:text-[#C87F4A] flex items-center gap-1"
                >
                  <span>Full Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="bg-white p-2 rounded-lg border border-stone-200">
                  <span className="text-[9px] uppercase font-mono text-stone-400 block">Weave</span>
                  <span className="font-semibold text-[#1F1B16]">{selectedProduct.weave}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-stone-200">
                  <span className="text-[9px] uppercase font-mono text-stone-400 block">Zari Grade</span>
                  <span className="font-semibold text-[#1F1B16]">{selectedProduct.zariGrade}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-600 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Includes 0.8m unstitched matching blouse & complimentary fall/pico.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E4] p-12 text-center text-xs font-mono">
          Loading AI Avatar Studio...
        </div>
      }
    >
      <TryOnStudioContent />
    </Suspense>
  );
}
