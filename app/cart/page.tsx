'use client';

import { useState, useEffect } from 'react';
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
  Gift,
  Award,
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

  const [selectedIds, setSelectedIds] = useState<string[]>(() => cart.map((i) => i.product.id));
  const [includeGiftWrap, setIncludeGiftWrap] = useState(false);
  const [includeSilkMarkCertificate, setIncludeSilkMarkCertificate] = useState(true);
  const [includeFallPico, setIncludeFallPico] = useState(true);

  // Sync selected IDs when cart items change
  useEffect(() => {
    setSelectedIds((prev) => {
      const currentCartIds = cart.map((i) => i.product.id);
      if (prev.length === 0 && currentCartIds.length > 0) return currentCartIds;
      const validPrev = prev.filter((id) => currentCartIds.includes(id));
      const newlyAdded = currentCartIds.filter((id) => !prev.includes(id));
      return [...validPrev, ...newlyAdded];
    });
  }, [cart]);

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === cart.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cart.map((i) => i.product.id));
    }
  };

  const toggleItemSelect = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const removeSelectedItems = () => {
    selectedIds.forEach((id) => removeFromCart(id));
    setSelectedIds([]);
  };

  const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < cart.length;

  const selectedCartItems = cart.filter((item) => selectedIds.includes(item.product.id));
  const selectedCount = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const selectedSubtotalINR = selectedCartItems.reduce(
    (total, item) => total + (item.product.priceINR + (item.tailoringExtraINR || 0)) * item.quantity,
    0
  );

  const giftPackagingINR = includeGiftWrap && selectedCount > 0 ? 249 : 0;

  const discountINR = appliedCoupon
    ? appliedCoupon.discountPercent
      ? Math.round((selectedSubtotalINR * appliedCoupon.discountPercent) / 100)
      : appliedCoupon.discountFixedINR || 0
    : 0;

  const finalTotalINR = Math.max(0, selectedSubtotalINR + giftPackagingINR - discountINR);

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
              {/* Select All / Batch Control Bar */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#C87F4A]/25 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                      isAllSelected
                        ? 'bg-[#7A1C30] border-[#7A1C30] text-white shadow-xs'
                        : isPartiallySelected
                        ? 'bg-[#7A1C30]/20 border-[#7A1C30] text-[#7A1C30]'
                        : 'border-stone-300 hover:border-[#C87F4A] bg-white'
                    }`}
                    aria-label="Select or deselect all items"
                  >
                    {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    {isPartiallySelected && <Minus className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-sans font-bold text-[#1F1B16]">
                      Select All ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
                    </span>
                    <span className="text-[11px] font-mono font-semibold bg-[#FAF3E4] text-[#773D21] border border-[#C87F4A]/30 px-2 py-0.5 rounded-full">
                      {selectedCount} of {cartCount} selected
                    </span>
                  </div>
                </div>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={removeSelectedItems}
                    className="text-xs font-sans text-stone-500 hover:text-red-600 transition-colors flex items-center gap-1.5 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove Selected</span>
                  </button>
                )}
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk divide-y divide-[#C87F4A]/15">
                {cart.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.product.id);
                  const itemPrice = item.product.priceINR + (item.tailoringExtraINR || 0);
                  const lineTotal = itemPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.blouseOption}-${idx}`}
                      className={`py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-60 bg-stone-50/50 -mx-2 px-2 rounded-xl'
                      }`}
                    >
                      {/* Left: Checkbox + Product Thumbnail & Details */}
                      <div className="flex gap-3 sm:gap-4 items-start sm:items-center flex-1 min-w-0">
                        {/* Checkbox Button */}
                        <button
                          type="button"
                          onClick={() => toggleItemSelect(item.product.id)}
                          className={`w-5 h-5 mt-1 sm:mt-0 rounded-md border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-[#7A1C30] border-[#7A1C30] text-white shadow-xs'
                              : 'border-stone-300 hover:border-[#C87F4A] bg-white'
                          }`}
                          aria-label={isSelected ? `Deselect ${item.product.title}` : `Select ${item.product.title}`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>

                        <Link
                          href={`/products/${item.product.slug}`}
                          className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#FAF3E4] border border-[#C87F4A]/25 flex-shrink-0 group shadow-xs relative"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {!isSelected && (
                            <div className="absolute inset-0 bg-stone-900/20 backdrop-grayscale flex items-center justify-center">
                              <span className="text-[9px] font-mono font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                                Unselected
                              </span>
                            </div>
                          )}
                        </Link>

                        <div className="space-y-1 truncate flex-1 min-w-0">
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
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 flex-shrink-0">
                        {/* Unit Price */}
                        <div className="text-right">
                          <span
                            className={`font-editorial text-lg sm:text-xl font-bold block ${
                              isSelected ? 'text-[#1F1B16]' : 'text-stone-400 line-through'
                            }`}
                          >
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

              {/* Luxury Services & Complimentary Options Checkbox Panel */}
              <div className="bg-white rounded-3xl p-6 border border-[#C87F4A]/25 shadow-xs space-y-3.5">
                <h4 className="font-editorial text-base font-bold text-[#1F1B16] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C87F4A]" />
                  <span>Curated Heritage Services & Packaging</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Service 1: Ready to drape Fall & Pico Checkbox */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF3E4]/60 border border-[#C87F4A]/20 cursor-pointer hover:bg-[#FAF3E4] transition-colors select-none">
                    <button
                      type="button"
                      onClick={() => setIncludeFallPico(!includeFallPico)}
                      className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                        includeFallPico
                          ? 'bg-[#7A1C30] border-[#7A1C30] text-white shadow-2xs'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {includeFallPico && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                    <div className="text-xs">
                      <div className="font-semibold text-[#1F1B16] flex items-center gap-1.5">
                        <Scissors className="w-3 h-3 text-[#C87F4A]" />
                        <span>Ready-to-Drape Fall & Pico</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">Complimentary hand-hemming</p>
                      <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase mt-1 block">
                        Included (FREE)
                      </span>
                    </div>
                  </label>

                  {/* Service 2: Royal Mysore Gift Box Checkbox */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF3E4]/60 border border-[#C87F4A]/20 cursor-pointer hover:bg-[#FAF3E4] transition-colors select-none">
                    <button
                      type="button"
                      onClick={() => setIncludeGiftWrap(!includeGiftWrap)}
                      className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                        includeGiftWrap
                          ? 'bg-[#7A1C30] border-[#7A1C30] text-white shadow-2xs'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {includeGiftWrap && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                    <div className="text-xs">
                      <div className="font-semibold text-[#1F1B16] flex items-center gap-1.5">
                        <Gift className="w-3 h-3 text-[#C87F4A]" />
                        <span>Royal Mysore Velvet Gift Box</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">Includes Gold Calligraphy Note</p>
                      <span className="text-[10px] font-mono text-[#7A1C30] font-bold uppercase mt-1 block">
                        +₹249 (Premium Box)
                      </span>
                    </div>
                  </label>

                  {/* Service 3: Silk Mark Authenticity Seal Checkbox */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF3E4]/60 border border-[#C87F4A]/20 cursor-pointer hover:bg-[#FAF3E4] transition-colors select-none">
                    <button
                      type="button"
                      onClick={() => setIncludeSilkMarkCertificate(!includeSilkMarkCertificate)}
                      className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                        includeSilkMarkCertificate
                          ? 'bg-[#7A1C30] border-[#7A1C30] text-white shadow-2xs'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {includeSilkMarkCertificate && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                    <div className="text-xs">
                      <div className="font-semibold text-[#1F1B16] flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Govt. Silk Mark Guarantee</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">Physical QR Authenticity Seal</p>
                      <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase mt-1 block">
                        Included (FREE)
                      </span>
                    </div>
                  </label>
                </div>
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
                    <span>Subtotal ({selectedCount} Selected {selectedCount === 1 ? 'Item' : 'Items'})</span>
                    <span className="font-mono text-sm font-semibold text-[#1F1B16]">
                      {formatPrice(selectedSubtotalINR)}
                    </span>
                  </div>

                  {/* Gift Wrap Packaging Line Item */}
                  {includeGiftWrap && selectedCount > 0 && (
                    <div className="flex items-center justify-between text-stone-700 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-[#C87F4A]" />
                        <span>Royal Velvet Gift Box</span>
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#1F1B16]">
                        +{formatPrice(giftPackagingINR)}
                      </span>
                    </div>
                  )}

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
                        <span className="font-mono font-bold">-{formatPrice(discountINR)}</span>
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
                    {formatPrice(finalTotalINR)}
                  </span>
                </div>

                {/* Primary Proceed to Checkout Button */}
                {selectedCount > 0 ? (
                  <Link
                    href="/checkout"
                    className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 block text-center cursor-pointer"
                  >
                    <span>Proceed to Checkout ({selectedCount} {selectedCount === 1 ? 'item' : 'items'})</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-stone-300 text-stone-500 py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
                  >
                    <span>Select Items to Checkout</span>
                  </button>
                )}

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
