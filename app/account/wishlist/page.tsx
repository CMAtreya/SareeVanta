'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';
import { Product, products } from '@/lib/products';

export default function AccountWishlistPage() {
  const { wishlist, toggleWishlist, addToCart, currency } = useCart();
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    // Filter matching products from wishlist IDs or fallback to initial items
    const filtered = products.filter((p) => wishlist.includes(p.id));
    if (filtered.length > 0) {
      setSavedProducts(filtered);
    } else if (wishlist.length > 0) {
      // Map IDs if needed
      setSavedProducts(products.slice(0, 3));
    } else {
      setSavedProducts([]);
    }
    setIsLoading(false);
  }, [wishlist]);

  const handleMoveToCart = (product: Product, e?: React.MouseEvent) => {
    addToCart(product, 1, 'Unstitched Standard (Free)', 0, e);
    toggleWishlist(product.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-1">
            Curated Treasures
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
            Saved Wishlist Sarees
          </h1>
          <span className="text-xs text-stone-500 font-sans block mt-1">
            {savedProducts.length} {savedProducts.length === 1 ? 'saree' : 'sarees'} saved for upcoming royal festivities.
          </span>
        </div>

        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF3E4] hover:bg-[#C87F4A] hover:text-white text-[#1F1B16] border border-[#C87F4A]/30 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors"
        >
          <span>Explore More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Wishlist Grid */}
      {savedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#C87F4A]/20 shadow-silk space-y-4">
          <Heart className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="font-editorial text-xl font-bold text-[#1F1B16]">Your Wishlist is Empty</h3>
          <p className="text-xs text-stone-500 font-sans max-w-sm mx-auto">
            Explore our Mysore Silk, Kanchipuram bridal, and Banarasi handlooms to curate your favorites.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-[#C87F4A] text-white rounded-sm text-xs font-bold uppercase tracking-wider"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#C87F4A]/25 shadow-silk flex flex-col justify-between group"
            >
              <div className="relative">
                <Link
                  href={`/products/${product.slug}`}
                  className="block aspect-[3/4] overflow-hidden bg-[#FAF3E4]"
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Remove from Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-white transition-colors shadow-sm"
                  aria-label="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Weave Badge */}
                <span className="absolute bottom-3 left-3 bg-[#1F1B16]/80 backdrop-blur-sm text-[#FAF3E4] text-[9px] font-mono uppercase px-2.5 py-1 rounded-md font-semibold">
                  {product.weave}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-editorial text-sm font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors block line-clamp-1"
                  >
                    {product.title}
                  </Link>
                  <span className="text-[11px] text-stone-500 font-sans block mt-0.5">
                    {product.fabric} • 24K Tested Real Zari
                  </span>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-editorial text-base font-bold text-[#1F1B16]">
                    {formatPrice(product.priceINR)}
                  </span>

                  {/* Move to Cart CTA */}
                  <button
                    type="button"
                    onClick={(e) => handleMoveToCart(product, e)}
                    className="px-3.5 py-2 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
