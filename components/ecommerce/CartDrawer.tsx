'use client';

import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    cartTotalINR,
    cartCount,
    currency,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = 10000;
  const progressPercent = Math.min(100, (cartTotalINR / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotalINR);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF3E4] shadow-2xl flex flex-col border-l border-[#C87F4A]/30">
          {/* Header */}
          <div className="p-6 border-b border-[#C87F4A]/20 flex items-center justify-between bg-white/60">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C87F4A]" />
              <h2 className="font-editorial text-2xl font-bold text-[#1F1B16]">
                Shopping Bag ({cartCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F3E8D6] px-6 py-3 border-b border-[#C87F4A]/15 text-xs text-[#1F1B16]">
            {remainingForFreeShipping > 0 ? (
              <p className="font-sans">
                Add <span className="font-bold text-[#C87F4A]">{formatPrice(remainingForFreeShipping)}</span> more for <span className="font-semibold">FREE Express Shipping</span>!
              </p>
            ) : (
              <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>You unlocked FREE Worldwide Express Shipping!</span>
              </p>
            )}
            <div className="w-full bg-stone-300/60 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#C87F4A] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <ShoppingBag className="w-12 h-12 text-[#C87F4A]/40 mb-4" />
                <h3 className="font-editorial text-xl text-[#1F1B16] font-semibold">
                  Your shopping bag is empty
                </h3>
                <p className="text-xs text-stone-600 mt-2 max-w-xs font-sans">
                  Explore our curated collections of pure silk sarees handwoven across Mysuru, Kanchi, and Varanasi.
                </p>
                <Link
                  href="/products"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-6 bg-[#C87F4A] hover:bg-[#B36737] text-white text-xs font-sans font-semibold uppercase tracking-widest px-6 py-3 rounded-md shadow-md transition-colors"
                >
                  Explore Collections
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-4 rounded-xl bg-white border border-[#C87F4A]/20 shadow-sm"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-20 h-24 object-cover rounded-lg bg-[#FAF3E4] border border-[#C87F4A]/15 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-editorial text-sm font-semibold text-[#1F1B16] line-clamp-1">
                          {item.product.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-[#773D21] block mt-0.5">
                        {item.product.weave} • {item.blouseOption || 'Unstitched Standard'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-editorial font-bold text-sm text-[#1F1B16]">
                        {formatPrice(item.product.priceINR * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-[#FAF3E4]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:bg-stone-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:bg-stone-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#C87F4A]/20 bg-white/70 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C87F4A]" />
                  <span>Complimentary Fall, Pico & Blouse Fabric</span>
                </span>
                <span className="font-mono text-emerald-700 font-semibold">FREE</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                <span className="font-sans text-xs uppercase tracking-wider text-stone-600">
                  Estimated Subtotal
                </span>
                <span className="font-editorial text-2xl font-bold text-[#1F1B16]">
                  {formatPrice(cartTotalINR)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full text-center py-3 rounded-lg border border-[#C87F4A]/50 text-[#1F1B16] text-xs font-sans font-semibold uppercase tracking-wider hover:bg-[#FAF3E4] transition-colors"
                >
                  View Full Cart
                </Link>

                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full text-center py-3 rounded-lg bg-[#C87F4A] hover:bg-[#B36737] text-white text-xs font-sans font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
