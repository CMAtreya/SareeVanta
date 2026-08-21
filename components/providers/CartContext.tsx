'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, products } from '@/lib/products';
import FlyingCartAnimation, { FlyingItem } from '@/components/ecommerce/FlyingCartAnimation';

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

export type SourcePosition = { x: number; y: number } | React.MouseEvent | HTMLElement | null;

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartDrawerOpen: boolean;
  isMarqueeDismissed: boolean;
  currency: string;
  setCurrency: (curr: string) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    blouseOption?: string,
    tailoringExtraINR?: number,
    sourcePosition?: SourcePosition
  ) => void;
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
  cartBounced: boolean;
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

  // Flying items particle queue
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartBounced, setCartBounced] = useState(false);

  const triggerFlyAnimation = (imageUrl: string, sourcePosition?: SourcePosition) => {
    if (typeof window === 'undefined') return;

    // Locate header shopping cart button in DOM
    const cartEl =
      document.getElementById('header-cart-button') ||
      document.querySelector('[aria-label="Shopping Cart"]');

    const cartRect = cartEl
      ? cartEl.getBoundingClientRect()
      : { left: window.innerWidth - 60, top: 25, width: 32, height: 32 };

    const destX = cartRect.left + cartRect.width / 2;
    const destY = cartRect.top + cartRect.height / 2;

    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if (sourcePosition) {
      if ('clientX' in sourcePosition && typeof sourcePosition.clientX === 'number') {
        startX = sourcePosition.clientX;
        startY = sourcePosition.clientY;
      } else if ('getBoundingClientRect' in sourcePosition && typeof sourcePosition.getBoundingClientRect === 'function') {
        const r = sourcePosition.getBoundingClientRect();
        startX = r.left + r.width / 2;
        startY = r.top + r.height / 2;
      } else if ('x' in sourcePosition && 'y' in sourcePosition) {
        startX = sourcePosition.x;
        startY = sourcePosition.y;
      }
    }

    const newItem: FlyingItem = {
      id: `fly-${Date.now()}-${Math.random()}`,
      image: imageUrl,
      startX,
      startY,
      destX,
      destY,
    };

    setFlyingItems((prev) => [...prev, newItem]);
  };

  const handleFlightComplete = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    // Trigger elastic bounce on cart icon
    setCartBounced(true);
    setTimeout(() => setCartBounced(false), 500);
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    blouseOption = 'Unstitched Standard (Free)',
    tailoringExtraINR = 0,
    sourcePosition?: SourcePosition
  ) => {
    // 1. Update Cart Data State
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

    // 2. Trigger silk-flight animation to Cart button (WITHOUT opening drawer)
    const productImage = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
    triggerFlyAnimation(productImage, sourcePosition);
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
        cartBounced,
      }}
    >
      {children}
      {/* Global Flying Saree to Cart Particles */}
      <FlyingCartAnimation items={flyingItems} onComplete={handleFlightComplete} />
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
