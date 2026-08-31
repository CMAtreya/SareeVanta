'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, Star, ShieldCheck, Check } from 'lucide-react';
import { Product } from '@/lib/products';
import { useCart } from '@/components/providers/CartContext';
import { seedPdpCacheFromCatalog, setCachedProduct } from '@/lib/pdpCache';

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
    addToCart(product, 1, undefined, 0, e);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const rawImage =
    (isHovered && product.images?.length > 1 ? product.images[1] : product.images?.[0]) ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=75&w=450&auto=format&fit=crop';

  const currentImage = rawImage.includes('images.unsplash.com')
    ? rawImage.replace(/w=\d+/, 'w=450').replace(/q=\d+/, 'q=75')
    : rawImage;

  const originalPrice = product.originalPriceINR && product.originalPriceINR > product.priceINR
    ? product.originalPriceINR
    : Math.round((product.priceINR * 1.25) / 100) * 100;

  const discountPercent = Math.round(((originalPrice - product.priceINR) / originalPrice) * 100);

  const handlePrefetch = () => {
    if (typeof window !== 'undefined' && product.slug) {
      seedPdpCacheFromCatalog(product);
      fetch(`/api/products/${product.slug}`, { cache: 'default' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.product) {
            setCachedProduct(product.slug, data);
          }
        })
        .catch(() => {});
    }
  };

  return (
    <div
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#C87F4A]/20 transition-all duration-500 hover:shadow-silk-lg hover:border-[#C87F4A]/50"
      onMouseEnter={() => {
        setIsHovered(true);
        handlePrefetch();
      }}
      onTouchStart={handlePrefetch}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF3E4]">
        <img
          src={currentImage}
          alt={product.title}
          width={450}
          height={600}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 items-start">
          {product.isBridal && (
            <span className="bg-[#7A1C30]/95 backdrop-blur-md text-[#FFF8ED] border border-[#E2CE9F]/40 text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <span>✦ Bridal Edit</span>
            </span>
          )}
          {product.isBestseller && !product.isBridal && (
            <span className="bg-[#B8892B]/95 backdrop-blur-md text-white border border-amber-200/40 text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
              ★ Bestseller
            </span>
          )}
          {product.isNew && (
            <span className="bg-[#4A2D1B]/90 backdrop-blur-md text-[#FAF3E4] border border-[#C87F4A]/40 text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
              New Arrival
            </span>
          )}
          {product.silkMarkCertified && (
            <span className="bg-[#FAF3E4]/95 backdrop-blur-md text-[#773D21] border border-[#C87F4A]/35 text-[9px] font-mono font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
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
          <span className="uppercase font-semibold tracking-wider truncate">
            {product.weave} • {product.fabric}
          </span>
          {Boolean(product.rating && (product.reviewCount ?? 0) > 0) && (
            <div className="flex items-center gap-1 text-amber-700 flex-shrink-0">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span className="font-sans font-medium">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Product Title */}
        <Link href={`/products/${product.slug}`} className="block group-hover:text-[#C87F4A] transition-colors">
          <h3 className="font-editorial text-base sm:text-lg font-medium text-[#1F1B16] leading-snug line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Color Variants & Swatches */}
        {(Boolean(product.color) || Boolean(product.colorVariants && product.colorVariants.length > 0)) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-stone-500 font-sans">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.colorVariants && product.colorVariants.length > 0 ? (
                product.colorVariants.map((cv, cvIdx) => (
                  <span
                    key={cv.id || cvIdx}
                    className="w-3 h-3 rounded-full border border-stone-300 shadow-2xs inline-block"
                    style={{ backgroundColor: cv.hex || '#8B1E28' }}
                    title={cv.name}
                  />
                ))
              ) : (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block"
                  style={{ backgroundColor: product.colorHex || '#8B1E28' }}
                />
              )}
            </div>
            <span className="text-[11px] font-mono text-stone-600 truncate font-medium">
              {product.colorVariants && product.colorVariants.length > 1
                ? `${product.colorVariants.length} Colors Available`
                : product.color}
            </span>
          </div>
        )}

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-stone-100 flex items-end justify-between">
          <div className="flex flex-col">
            {/* Scratched original price above discounted price with discount percentage beside it */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs text-stone-400 line-through font-sans">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {discountPercent}% OFF
              </span>
            </div>

            {/* Discounted / Selling Price */}
            <span className="font-editorial text-lg sm:text-xl font-bold text-[#1F1B16]">
              {formatPrice(product.priceINR)}
            </span>
          </div>

          {/* Mobile Always-Visible Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="lg:hidden p-2 rounded-full bg-[#FAF3E4] text-[#C87F4A] hover:bg-[#C87F4A] hover:text-white transition-colors mb-0.5"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
