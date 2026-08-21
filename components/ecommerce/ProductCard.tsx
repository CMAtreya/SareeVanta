'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, Star, ShieldCheck, Check } from 'lucide-react';
import { Product } from '@/lib/products';
import { useCart } from '@/components/providers/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, currency } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const currentImage =
    isHovered && product.images.length > 1 ? product.images[1] : product.images[0];

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#C87F4A]/20 transition-all duration-500 hover:shadow-silk-lg hover:border-[#C87F4A]/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF3E4]">
        <img
          src={currentImage}
          alt={product.title}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBridal && (
            <span className="bg-[#9E2A2B] text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
              Bridal Edit
            </span>
          )}
          {product.isBestseller && !product.isBridal && (
            <span className="bg-[#C87F4A] text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
              Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#1F1B16] text-[#FAF3E4] text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
              New In
            </span>
          )}
          {product.silkMarkCertified && (
            <span className="bg-[#FAF3E4]/90 backdrop-blur-sm text-[#773D21] border border-[#C87F4A]/30 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-2.5 h-2.5 text-[#C87F4A]" />
              <span>Silk Mark</span>
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${
            inWishlist
              ? 'bg-red-50 text-red-600 shadow-md scale-110'
              : 'bg-[#FAF3E4]/80 text-[#1F1B16] hover:bg-white hover:text-[#C87F4A] shadow-sm'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              inWishlist ? 'fill-red-600 scale-105' : ''
            }`}
          />
        </button>

        {/* Desktop Quick Hover Actions Bar */}
        <div className="hidden lg:flex absolute bottom-3 inset-x-3 gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg ${
              addedAnimation
                ? 'bg-emerald-700 text-white'
                : 'bg-[#C87F4A] hover:bg-[#B36737] text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Information Details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 bg-white">
        {/* Weave & Fabric Subheader */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#773D21] mb-1">
          <span className="uppercase font-semibold tracking-wider">
            {product.weave} • {product.fabric}
          </span>
          <div className="flex items-center gap-1 text-amber-700">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span className="font-sans font-medium">{product.rating}</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.slug}`} className="block group-hover:text-[#C87F4A] transition-colors">
          <h3 className="font-editorial text-base sm:text-lg font-medium text-[#1F1B16] leading-snug line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Color & Zari Details */}
        <div className="mt-1 flex items-center gap-2 text-xs text-stone-500 font-sans">
          <span
            className="w-2.5 h-2.5 rounded-full border border-stone-300"
            style={{ backgroundColor: product.colorHex }}
          />
          <span className="truncate">{product.color}</span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-editorial text-lg sm:text-xl font-bold text-[#1F1B16]">
              {formatPrice(product.priceINR)}
            </span>
            {product.originalPriceINR && (
              <span className="text-xs text-stone-400 line-through">
                {formatPrice(product.originalPriceINR)}
              </span>
            )}
          </div>

          {/* Mobile Always-Visible Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="lg:hidden p-2 rounded-full bg-[#FAF3E4] text-[#C87F4A] hover:bg-[#C87F4A] hover:text-white transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
