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
  Sparkles,
  Tag,
  Check,
  X,
  AlertCircle,
  ChevronRight,
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
    selectedKeys,
    selectedCartItems,
    selectedCount,
    selectedSubtotalINR,
    selectedTotalINR,
    selectedDiscountINR,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    getItemKey,
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

  const isAllSelected = cart.length > 0 && selectedKeys.length === cart.length;
  const isPartiallySelected = selectedKeys.length > 0 && selectedKeys.length < cart.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  const removeSelectedItems = () => {
    cart.forEach((item) => {
      const key = getItemKey(item);
      if (selectedKeys.includes(key)) {
        removeFromCart(item.product.id, item.variantId, item.selectedColor);
      }
    });
  };

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
        body: JSON.stringify({ code: targetCode, cartSubtotalINR: selectedSubtotalINR }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        applyCoupon({
          code: data.code,
          discountPercent: data.discountPercent,
          discountFixedINR: data.discountFixedINR,
          maxDiscountCapINR: data.maxDiscountCapINR,
          description: data.description,
        });
        setCouponFeedback({ type: 'success', message: data.message });
        setCouponInput('');
      } else {
        setCouponFeedback({
          type: 'error',
          message: data.message || 'Invalid coupon code.',
        });
      }
    } catch (err) {
      setCouponFeedback({
        type: 'error',
        message: 'Could not validate coupon. Please check connection.',
      });
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Row */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 font-sans mb-6">
          <Link href="/" className="hover:text-[#C87F4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link href="/products" className="hover:text-[#C87F4A] transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-[#1F1B16] font-semibold">Shopping Bag</span>
        </nav>

        {/* Page Title & Status */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7A1C30]/10 border border-[#7A1C30]/20 text-[#7A1C30] text-[11px] font-mono font-bold uppercase tracking-[0.2em] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
            <span>Neelsareehouse Checkout Portal</span>
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
          /* 2-COLUMN CART LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT: CART LINE ITEMS */}
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

                {selectedKeys.length > 0 && (
                  <button
                    type="button"
                    onClick={removeSelectedItems}
                    className="text-xs font-sans text-stone-500 hover:text-red-600 transition-colors flex items-center gap-1.5 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove Selected</span>
                  </button>
                )}
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk divide-y divide-[#C87F4A]/15">
                {cart.map((item, idx) => {
                  const itemKey = getItemKey(item);
                  const isSelected = selectedKeys.includes(itemKey);
                  const itemPrice = item.product.priceINR + (item.tailoringExtraINR || 0);
                  const lineTotal = itemPrice * item.quantity;
                  const itemColor = item.selectedColor || item.product.color;
                  const itemHex = item.selectedColorHex || item.product.colorHex;

                  return (
                    <div
                      key={itemKey}
                      className={`py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-60 bg-stone-50/50 -mx-2 px-2 rounded-xl'
                      }`}
                    >
                      {/* Left: Checkbox + Product Thumbnail & Details */}
                      <div className="flex gap-3 sm:gap-4 items-start sm:items-center flex-1 min-w-0">
                        {/* Checkbox Button */}
                        <button
                          type="button"
                          onClick={() => toggleItemSelection(itemKey)}
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
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop'}
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

                        <div className="space-y-1.5 truncate flex-1 min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-semibold block">
                            {item.product.weave} • {item.product.fabric}
                          </span>

                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-editorial text-base sm:text-lg font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors block truncate"
                          >
                            {item.product.title}
                          </Link>

                          {/* Color Variant Dot Pill */}
                          {itemColor && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FAF3E4] border border-[#C87F4A]/20 text-[10px] font-mono text-stone-700">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: itemHex || '#8B1E28' }}
                              />
                              <span>{itemColor}</span>
                              {item.selectedSku && (
                                <span className="text-stone-400">({item.selectedSku})</span>
                              )}
                            </div>
                          )}
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
                        {(() => {
                          const maxStock = item.product.stockCount ?? 5;
                          const isAtMax = item.quantity >= maxStock;
                          return (
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2">
                                <div className="inline-flex items-center bg-[#FAF3E4] border border-[#C87F4A]/30 rounded-lg p-0.5 shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId, item.selectedColor)}
                                    className="p-1.5 rounded text-stone-700 hover:text-[#C87F4A] transition-colors cursor-pointer"
                                    aria-label="Decrease Quantity"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-7 text-center font-mono font-bold text-xs text-[#1F1B16]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={isAtMax}
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variantId, item.selectedColor)}
                                    className={`p-1.5 rounded transition-colors ${
                                      isAtMax
                                        ? 'opacity-30 cursor-not-allowed text-stone-400 bg-stone-100'
                                        : 'text-stone-700 hover:text-[#C87F4A] cursor-pointer'
                                    }`}
                                    aria-label="Increase Quantity"
                                    title={isAtMax ? `Max available stock reached (${maxStock})` : 'Increase Quantity'}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.product.id, item.variantId, item.selectedColor)}
                                  className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  aria-label={`Remove ${item.product.title}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              {isAtMax && (
                                <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                                  Max Stock Limit Reached ({maxStock})
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY CARD */}
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
                        <span className="font-mono font-bold">-{formatPrice(selectedDiscountINR)}</span>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-stone-400 hover:text-red-600 p-0.5 cursor-pointer"
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
                      <span>Express Air Delivery</span>
                    </span>
                    <span className="font-mono font-semibold text-emerald-800 uppercase text-[11px]">
                      FREE
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t border-[#C87F4A]/20 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#773D21] block">
                      Final Total Amount (After Discount)
                    </span>
                    <span className="text-[10px] text-stone-400 font-sans">
                      Includes 18% Handloom GST
                    </span>
                  </div>
                  <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                    {formatPrice(selectedTotalINR)}
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
                      className="px-4 py-2 bg-[#1F1B16] hover:bg-black text-[#FAF3E4] rounded-xl text-xs font-mono font-bold uppercase disabled:opacity-50 transition-colors cursor-pointer"
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
