'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Tag,
  Check,
  X,
  AlertCircle,
  Scissors,
  CheckCircle2,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartSubtotalINR,
    cartTotalINR,
    appliedCoupon,
    couponDiscountINR,
    applyCoupon,
    removeCoupon,
    currency,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const targetCode = (codeToApply || couponInput).trim();
    if (!targetCode) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }

    setCouponLoading(true);
    setCouponFeedback(null);

    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: targetCode }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        applyCoupon({
          code: data.code,
          discountPercent: data.discountPercent,
          discountFixedINR: data.discountFixedINR,
          description: data.description,
        });
        setCouponFeedback({ type: 'success', message: data.message });
        setCouponInput('');
      } else {
        setCouponFeedback({
          type: 'error',
          message: data.message || 'Invalid or expired coupon code.',
        });
      }
    } catch (err) {
      setCouponFeedback({
        type: 'error',
        message: 'Could not validate coupon. Please try again.',
      });
    } finally {
      setCouponLoading(false);
    }
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
          <span className="text-[#1F1B16] font-semibold">Shopping Bag</span>
        </nav>

        {/* Page Title */}
        <div className="pb-4 border-b border-[#C87F4A]/20 mb-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neelsareehouse Checkout Salon</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1F1B16] tracking-tight">
            Your Shopping Bag
          </h1>
          <span className="text-xs sm:text-sm text-stone-600 font-sans">
            {cartCount > 0
              ? `You have ${cartCount} handcrafted ${cartCount === 1 ? 'saree' : 'sarees'} in your bag.`
              : 'Your bag is currently empty.'}
          </span>
        </div>

        {/* Empty Cart State */}
        {cart.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#C87F4A]/25 p-8 max-w-xl mx-auto shadow-silk space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#FAF3E4] border border-[#C87F4A]/30 flex items-center justify-center mx-auto text-[#C87F4A] shadow-sm">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                Your Heirloom Bag is Empty
              </h3>
              <p className="text-xs text-stone-500 font-sans max-w-sm mx-auto mt-2 leading-relaxed">
                Explore our royal looms of Mysuru and curate your dream silk saree with tested 24K real gold zari.
              </p>
            </div>

            {/* Continue Shopping CTA */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#C87F4A] hover:bg-[#B36737] text-white px-8 py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* 2-COLUMN CART LAYOUT                                 */
          /* LEFT: LINE ITEMS LIST | RIGHT: ORDER SUMMARY         */
          /* ==================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ==================================================== */}
            {/* LEFT: CART LINE ITEMS (COL-span-7 or 8)              */}
            {/* ==================================================== */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk divide-y divide-[#C87F4A]/15">
                {cart.map((item, idx) => {
                  const itemPrice = item.product.priceINR + (item.tailoringExtraINR || 0);
                  const lineTotal = itemPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.blouseOption}-${idx}`}
                      className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex gap-4 items-start sm:items-center flex-1">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#FAF3E4] border border-[#C87F4A]/25 flex-shrink-0 group shadow-xs"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </Link>

                        <div className="space-y-1 truncate flex-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-semibold block">
                            {item.product.weave} • {item.product.fabric}
                          </span>

                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-editorial text-base sm:text-lg font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors block truncate"
                          >
                            {item.product.title}
                          </Link>

                          {/* Complimentary Ready to Drape Assurance */}
                          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Includes Ready-to-Drape Fall & Pico</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price Column */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                        {/* Unit Price */}
                        <div className="text-right">
                          <span className="font-editorial text-lg sm:text-xl font-bold text-[#1F1B16] block">
                            {formatPrice(lineTotal)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] font-mono text-stone-400 block">
                              {formatPrice(itemPrice)} each
                            </span>
                          )}
                        </div>

                        {/* Stepper + Remove Row */}
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center bg-[#FAF3E4] border border-[#C87F4A]/30 rounded-lg p-0.5 shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1.5 rounded text-stone-700 hover:text-[#C87F4A] transition-colors"
                              aria-label="Decrease Quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-mono font-bold text-xs text-[#1F1B16]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1.5 rounded text-stone-700 hover:text-[#C87F4A] transition-colors"
                              aria-label="Increase Quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Remove ${item.product.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Complimentary Gift Packaging & Silk Mark Assurance Band */}
              <div className="bg-white/80 rounded-2xl p-4 border border-[#C87F4A]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
                  <span>
                    Every saree arrives in our signature cedar preservation box with Govt. Silk Mark certificate.
                  </span>
                </div>
                <Link href="/products" className="text-[#C87F4A] hover:underline font-bold font-mono text-[11px] flex-shrink-0">
                  + Add Another Saree
                </Link>
              </div>
            </div>

            {/* ==================================================== */}
            {/* RIGHT: ORDER SUMMARY CARD (COL-span-4 or 5)          */}
            {/* ==================================================== */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#C87F4A]/25 shadow-silk space-y-6">
                <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#1F1B16] pb-3 border-b border-[#C87F4A]/20">
                  Order Summary
                </h3>

                {/* Subtotal / Discount / Shipping Breakdown */}
                <div className="space-y-3 text-xs font-sans">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Subtotal ({cartCount} Items)</span>
                    <span className="font-mono text-sm font-semibold text-[#1F1B16]">
                      {formatPrice(cartSubtotalINR)}
                    </span>
                  </div>

                  {/* Applied Coupon Discount */}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-emerald-800 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <div>
                          <span className="font-mono font-bold block">{appliedCoupon.code}</span>
                          <span className="text-[10px] text-emerald-700 font-sans block leading-none">
                            {appliedCoupon.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">-{formatPrice(couponDiscountINR)}</span>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-stone-400 hover:text-red-600 p-0.5"
                          aria-label="Remove Coupon"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Estimated Shipping */}
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#C87F4A]" />
                      <span>Estimated Shipping</span>
                    </span>
                    <span className="font-mono font-semibold text-emerald-800 uppercase text-[11px]">
                      FREE (Insured Express)
                    </span>
                  </div>

                  {/* Taxes Guarantee */}
                  <div className="flex items-center justify-between text-stone-600">
                    <span>GST & Customs</span>
                    <span className="font-mono text-stone-500 text-[11px]">Included (0%)</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t border-[#C87F4A]/20 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#773D21] block">
                      Grand Total
                    </span>
                    <span className="text-[10px] text-stone-400 font-sans">
                      Includes all taxes & complimentary fall/pico
                    </span>
                  </div>
                  <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                    {formatPrice(cartTotalINR)}
                  </span>
                </div>

                {/* Primary Proceed to Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 block text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Coupon Code Input Form */}
                <div className="pt-4 border-t border-[#C87F4A]/15 space-y-3">
                  <label className="text-[11px] uppercase font-mono font-bold text-[#1F1B16] block">
                    Have a Privilege Coupon?
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ROYAL10, MYSORE2021"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponFeedback(null);
                      }}
                      className="flex-1 px-3 py-2 bg-[#FAF3E4] border border-[#C87F4A]/30 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#C87F4A]"
                    />
                    <button
                      type="button"
                      disabled={couponLoading}
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-2 bg-[#1F1B16] hover:bg-black text-[#FAF3E4] rounded-xl text-xs font-mono font-bold uppercase disabled:opacity-50 transition-colors"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  {/* Feedback Message */}
                  {couponFeedback && (
                    <div
                      className={`p-2.5 rounded-xl text-[11px] font-sans flex items-center gap-1.5 ${
                        couponFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {couponFeedback.type === 'success' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                      )}
                      <span>{couponFeedback.message}</span>
                    </div>
                  )}

                  {/* Popular Coupon Chips */}
                  {!appliedCoupon && (
                    <div className="pt-1">
                      <span className="text-[10px] text-stone-500 font-mono block mb-1.5">
                        Available Promos (Click to Apply):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { code: 'ROYAL10', label: '10% Off (ROYAL10)' },
                          { code: 'MYSORE2021', label: '₹2,500 Off (MYSORE2021)' },
                          { code: 'FESTIVE15', label: '15% Off (FESTIVE15)' },
                        ].map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            className="bg-[#FAF3E4] hover:bg-[#C87F4A] hover:text-white text-stone-700 text-[10px] font-mono px-2 py-1 rounded-md border border-[#C87F4A]/25 transition-colors"
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-[#C87F4A]/15 space-y-2 text-[11px] text-stone-600 font-sans">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C87F4A] flex-shrink-0" />
                    <span>Govt. Tested Pure 24K Zari & Silk Mark Authenticity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-[#C87F4A] flex-shrink-0" />
                    <span>7-Day Hassle-Free Exchange & Return Policy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#C87F4A] flex-shrink-0" />
                    <span>Insured Air Courier Dispatch with Live GPS Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
