'use client';

import { useState } from 'react';
import {
  Heart,
  Eye,
  ShoppingBag,
  Sparkles,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';

export interface SareeProduct {
  id: string;
  title: string;
  weave: string;
  category: string;
  priceINR: number;
  priceUSD: number;
  originalPriceINR?: number;
  badge?: string;
  image: string;
  hoverImage: string;
  color: string;
  zari: string;
  dimensions: string;
  blouseIncluded?: boolean;
  description: string;
  artisanCluster: string;
}

export const productsData: SareeProduct[] = [
  {
    id: 'mysore-royal-crimson',
    title: 'Royal Wodeyar Crimson Crepe Silk Saree',
    weave: 'Mysore Silk',
    category: 'mysore',
    priceINR: 28500,
    priceUSD: 345,
    originalPriceINR: 32000,
    badge: 'Flagship Signature',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    color: 'Deep Royal Crimson & Antique Gold',
    zari: 'Tested Pure Gold & Silver Ribbon',
    dimensions: '5.5m Pure Silk Saree',
    description:
      'Woven from 100% Karnataka Mulberry Silk with twisted crepe yarn, featuring the authentic Mysore royal insignia border and rich woven pallu with Kasuti diamond motifs.',
    artisanCluster: 'Devaraja Loom Guild, Mysuru',
  },
  {
    id: 'kanchi-muhurtham-gold',
    title: 'Kanchipuram Heavy Korvai Bridal Silk Saree',
    weave: 'Kanchipuram',
    category: 'kanchi',
    priceINR: 64000,
    priceUSD: 770,
    badge: 'Bridal Heirloom',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    color: 'Vermilion Red & 24K Pure Zari',
    zari: '57% Silver / 0.6% 24-Karat Gold Electroplate',
    dimensions: '6.2m Comprehensive Bridal Length',
    description:
      'A true generational heirloom crafted with the traditional three-shuttle Korvai interlocking technique. Adorned with Mayil (peacock) and Yanai (elephant) pure zari motifs.',
    artisanCluster: 'Kanchi Master Guild, Tamil Nadu',
  },
  {
    id: 'banarasi-kadwa-emerald',
    title: 'Banarasi Pure Katan Silk Shikargah Saree',
    weave: 'Banarasi',
    category: 'banarasi',
    priceINR: 46000,
    priceUSD: 550,
    originalPriceINR: 52000,
    badge: 'Limited Curation',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    color: 'Forest Emerald & Warm Gold Zari',
    zari: 'Fine Antique Kadwa Micro-Zari',
    dimensions: '5.5m Pure Silk Saree',
    description:
      'Hand-woven using the meticulous Kadwa technique where each floral vine is individually locked into the warp without reverse floats, ensuring extreme comfort.',
    artisanCluster: 'Mubarakpur Looms, Varanasi',
  },
  {
    id: 'mysore-champagne-gold',
    title: 'Mysuru Champagne Gold Tissue Georgette',
    weave: 'Mysore Silk',
    category: 'mysore',
    priceINR: 36000,
    priceUSD: 435,
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    color: 'Champagne Ivory & Burnished Gold',
    zari: 'Full Warp Real Zari Ribbon',
    dimensions: '5.5m Pure Silk Saree',
    description:
      'Combines the fluid drape of royal georgette with pure zari weft threads for a subtle luminous shine under ambient evening chandeliers.',
    artisanCluster: 'Nanjangud Loom Heritage, Mysuru',
  },
  {
    id: 'paithani-tilli-shot-purple',
    title: 'Yeola Paithani Pure Silk Asawali Pallu Saree',
    weave: 'Paithani',
    category: 'paithani',
    priceINR: 52000,
    priceUSD: 625,
    badge: 'Hand-Knotted Pallu',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    color: 'Dhoop-Chhaon Royal Violet & Crimson',
    zari: 'Tested Pure Gold Tapestry Weft',
    dimensions: '6.0m Traditional Drape',
    description:
      'Features the iconic tapestry-woven Asawali floral vines and vibrant peacocks on the grand pallu, woven entirely by hand without jacquard punchcards.',
    artisanCluster: 'Yeola Weavers, Maharashtra',
  },
  {
    id: 'chanderi-dust-gold',
    title: 'Chanderi Wild Tussar & Gold Boota Saree',
    weave: 'Chanderi',
    category: 'chanderi',
    priceINR: 19500,
    priceUSD: 235,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    hoverImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    color: 'Warm Sandalwood & Antiqued Gold',
    zari: 'Fine Gold Wire Extra-Weft',
    dimensions: '5.5m Pure Silk Saree',
    description:
      'A gossamer blend of wild raw Tussar and spun mulberry silk with delicate circular gold ashrafi bootas scattered across the body.',
    artisanCluster: 'Pranpur Heritage Village, Chanderi',
  },
];

const categories = [
  { id: 'all', label: 'All Curations' },
  { id: 'mysore', label: 'Mysore Royal Silk' },
  { id: 'kanchi', label: 'Bridal Kanchipuram' },
  { id: 'banarasi', label: 'Banarasi Katan' },
  { id: 'paithani', label: 'Paithani & Tissues' },
];

export default function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState<SareeProduct | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bag, setBag] = useState<string[]>([]);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const filteredProducts =
    selectedCategory === 'all'
      ? productsData
      : productsData.filter((p) => p.category === selectedCategory);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToBag = (product: SareeProduct) => {
    setBag((prev) => [...prev, product.id]);
    setAddedNotice(`Added "${product.title}" to your shopping bag.`);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  return (
    <section
      id="bridal"
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#C87F4A]/20"
    >
      {/* Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1A18] text-[#FAF3E4] px-5 py-3.5 rounded-lg shadow-2xl border border-[#C87F4A] flex items-center gap-3 animate-fade-in">
          <Check className="w-4 h-4 text-[#C87F4A]" />
          <span className="text-xs font-medium">{addedNotice}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready-To-Ship Masterpieces</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1C1A18] font-normal tracking-tight">
            Heirloom Curations
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-lg">
            Fast, functional discovery. Every piece includes complimentary fall & pico, certified Silk Mark tag, and safe global dispatch within 24 hours.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-8 md:mt-0 flex flex-wrap gap-2">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                selectedCategory === tab.id
                  ? 'bg-[#1C1A18] text-[#FAF3E4] shadow-sm'
                  : 'bg-white text-stone-600 hover:text-black border border-[#C87F4A]/20 hover:border-[#C87F4A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {filteredProducts.map((product) => {
          const isWishlisted = wishlist.includes(product.id);
          const isInBag = bag.includes(product.id);

          return (
            <div
              key={product.id}
              className="group bg-white rounded-xl overflow-hidden border border-[#C87F4A]/15 hover:border-[#C87F4A]/50 shadow-sm hover:shadow-silk-lg transition-all duration-300 flex flex-col justify-between"
            >
              {/* Product Image Stage */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-[#1C1A18] text-[#FAF3E4] text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-sm shadow-md">
                    {product.badge}
                  </span>
                )}

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 text-red-600'
                      : 'bg-white/80 text-stone-700 hover:text-[#C87F4A]'
                  }`}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-current' : ''
                    }`}
                  />
                </button>

                {/* Quick View Hover Trigger */}
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(product)}
                  className="absolute bottom-3 left-3 right-3 bg-white/90 hover:bg-white text-[#1C1A18] py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C87F4A]" />
                  <span>Quick View</span>
                </button>
              </div>

              {/* Product Info */}
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#C87F4A] font-mono tracking-wider uppercase mb-1">
                    <span>{product.weave}</span>
                    <span className="text-stone-400">Pure Silk</span>
                  </div>

                  <h3 className="font-editorial text-lg text-[#1C1A18] font-medium leading-snug line-clamp-1 group-hover:text-[#C87F4A] transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                    {product.color}
                  </p>
                </div>

                {/* Price & Action Row */}
                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-editorial text-xl font-bold text-[#1C1A18]">
                        ₹{product.priceINR.toLocaleString('en-IN')}
                      </span>
                      {product.originalPriceINR && (
                        <span className="text-xs text-stone-400 line-through">
                          ₹{product.originalPriceINR.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">
                      ~${product.priceUSD} USD
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToBag(product)}
                    className={`px-3.5 py-2 rounded-sm text-xs font-medium uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                      isInBag
                        ? 'bg-emerald-800 text-white'
                        : 'bg-[#C87F4A] hover:bg-[#B36737] text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isInBag ? 'In Bag' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setQuickViewProduct(null)}
          />

          <div className="relative bg-[#FAF3E4] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#C87F4A]/40 p-6 sm:p-8 z-10 animate-fade-in text-[#1C1A18]">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-5 right-5 text-stone-500 hover:text-black p-1.5 rounded-full bg-white border border-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-stone-200 border border-[#C87F4A]/20">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#FAF3E4]/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-[#773D21]">
                  {quickViewProduct.artisanCluster}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#C87F4A] font-semibold">
                    {quickViewProduct.weave} • GI Registered
                  </span>

                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#1C1A18] font-semibold mt-1 mb-2">
                    {quickViewProduct.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-editorial text-2xl font-bold text-[#1C1A18]">
                      ₹{quickViewProduct.priceINR.toLocaleString('en-IN')}
                    </span>
                    {quickViewProduct.originalPriceINR && (
                      <span className="text-sm text-stone-400 line-through">
                        ₹{quickViewProduct.originalPriceINR.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-xs text-stone-500 font-mono ml-2">
                      (${quickViewProduct.priceUSD} USD)
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#44403C] leading-relaxed mb-5">
                    {quickViewProduct.description}
                  </p>

                  {/* Saree Spec Chips */}
                  <div className="space-y-2 text-xs bg-white p-4 rounded-lg border border-[#C87F4A]/20 mb-6">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-mono text-[11px]">Weave Guild:</span>
                      <span className="font-semibold">{quickViewProduct.artisanCluster}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-mono text-[11px]">Dimensions:</span>
                      <span className="font-semibold">{quickViewProduct.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-mono text-[11px]">Silk Mark:</span>
                      <span className="font-semibold text-emerald-800">100% Certified Pure Silk</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      addToBag(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </button>

                  <a
                    href={`https://wa.me/918212423344?text=Hello%20Neelsareehouse%2C%20I%20am%20interested%20in%20inspecting%20the%20${encodeURIComponent(
                      quickViewProduct.title
                    )}%20(ID%3A%20${quickViewProduct.id}).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-white hover:bg-stone-50 text-[#1C1A18] border border-[#C87F4A]/40 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#C87F4A]" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
