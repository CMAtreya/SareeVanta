'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, products } from '@/lib/products';

export interface CartItem {
  product: Product;
  quantity: number;
  blouseOption?: string;
  tailoringExtraINR?: number;
}

export interface AppliedCoupon {
  code: string;
  discountPercent?: number;
  discountFixedINR?: number;
  description: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartDrawerOpen: boolean;
  isMarqueeDismissed: boolean;
  currency: string;
  setCurrency: (curr: string) => void;
  addToCart: (product: Product, quantity?: number, blouseOption?: string, tailoringExtraINR?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  setIsMarqueeDismissed: (dismissed: boolean) => void;
  cartCount: number;
  cartSubtotalINR: number;
  cartTotalINR: number;
  wishlistCount: number;
  appliedCoupon: AppliedCoupon | null;
  couponDiscountINR: number;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: products[0],
      quantity: 1,
      blouseOption: 'Unstitched Standard (Free)',
      tailoringExtraINR: 0,
    },
    {
      product: products[1],
      quantity: 1,
      blouseOption: 'Custom Tailored Bespoke (+₹1,800)',
      tailoringExtraINR: 1800,
    },
  ]);

  const [wishlist, setWishlist] = useState<string[]>([
    'mysore-royal-crimson',
    'banarasi-kadwa-emerald',
    'paithani-tilli-shot-purple',
  ]);

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isMarqueeDismissed, setIsMarqueeDismissed] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const addToCart = (
    product: Product,
    quantity = 1,
    blouseOption = 'Unstitched Standard (Free)',
    tailoringExtraINR = 0
  ) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.blouseOption === blouseOption
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.blouseOption === blouseOption
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, blouseOption, tailoringExtraINR }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotalINR = cart.reduce(
    (total, item) =>
      total + (item.product.priceINR + (item.tailoringExtraINR || 0)) * item.quantity,
    0
  );

  const couponDiscountINR = appliedCoupon
    ? appliedCoupon.discountPercent
      ? Math.round((cartSubtotalINR * appliedCoupon.discountPercent) / 100)
      : appliedCoupon.discountFixedINR || 0
    : 0;

  const cartTotalINR = Math.max(0, cartSubtotalINR - couponDiscountINR);

  const wishlistCount = wishlist.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartDrawerOpen,
        isMarqueeDismissed,
        currency,
        setCurrency,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        setIsCartDrawerOpen,
        setIsMarqueeDismissed,
        cartCount,
        cartSubtotalINR,
        cartTotalINR,
        wishlistCount,
        appliedCoupon,
        couponDiscountINR,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
