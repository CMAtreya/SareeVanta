'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, products } from '@/lib/products';
import FlyingCartAnimation, { FlyingItem } from '@/components/ecommerce/FlyingCartAnimation';
import { createClient } from '@/lib/supabase/client';

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
  maxDiscountCapINR?: number;
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
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  cartBounced: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isMarqueeDismissed, setIsMarqueeDismissed] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Flying items particle queue
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartBounced, setCartBounced] = useState(false);

  // --------------------------------------------------------------------------
  // 1. AUTH & DB SYNC & PENDING ACTION EXECUTOR
  // --------------------------------------------------------------------------
  useEffect(() => {
    const supabase = createClient();

    const syncUserData = async (user: any) => {
      setCurrentUser(user);

      if (user) {
        // Fetch saved cart from database
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            const rawItems = data.items || data.cart?.items || [];
            if (rawItems.length > 0) {
              const dbItems: CartItem[] = rawItems.map((item: any) => {
                const variantData = item.product_variants;
                const productData = variantData?.products;
                const foundProduct = products.find(p => p.id === item.product_id || p.slug === item.product_id || p.id === variantData?.id) || {
                  id: variantData?.id || item.variant_id || item.product_id || 'db-prod',
                  slug: productData?.slug || 'heirloom-silk-saree',
                  title: productData?.title || 'Heirloom Silk Saree',
                  weave: 'Mysore Silk',
                  fabric: 'Pure Mulberry Silk',
                  occasion: 'Bridal & Muhurtham',
                  priceINR: Math.round((variantData?.price_paise || 2850000) / 100),
                  rating: 4.9,
                  reviewCount: 12,
                  color: variantData?.colors?.name || 'Crimson Red',
                  colorHex: variantData?.colors?.hex_code || '#8B1E28',
                  images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85'],
                  zariGrade: 'Tested Pure Zari',
                  dimensions: '5.5m Pure Silk Saree',
                  inStock: true,
                  description: 'Authentic silk saree from Neelsareehouse guild.',
                  artisanCluster: 'Mysuru Loom Guild',
                  silkMarkCertified: true,
                };

                return {
                  product: foundProduct,
                  quantity: item.quantity,
                  blouseOption: item.blouse_option || 'unstitched',
                  tailoringExtraINR: item.tailoring_extra_inr || 0,
                };
              });
              setCart(dbItems);
            }
          }
        } catch (err) {
          console.error('[CartContext] Failed to fetch DB cart:', err);
        }

        // Fetch saved wishlist from database
        try {
          const { data: wishlistData } = await supabase
            .from('wishlist_items')
            .select('variant_id')
            .eq('customer_id', user.id);

          if (wishlistData) {
            setWishlist(wishlistData.map((w: any) => w.variant_id));
          }
        } catch (err) {
          console.error('[CartContext] Failed to fetch DB wishlist:', err);
        }

        // Check & Execute Pending Cart Action from sessionStorage
        try {
          const pendingCartStr = sessionStorage.getItem('pending_cart_action');
          if (pendingCartStr) {
            sessionStorage.removeItem('pending_cart_action');
            const pending = JSON.parse(pendingCartStr);
            if (pending?.product) {
              const targetProduct = products.find(p => p.id === pending.product.id) || pending.product;
              setCart((prev) => {
                const existing = prev.find(item => item.product.id === targetProduct.id);
                if (existing) {
                  return prev.map(item => item.product.id === targetProduct.id ? { ...item, quantity: item.quantity + (pending.quantity || 1) } : item);
                }
                return [...prev, { product: targetProduct, quantity: pending.quantity || 1, blouseOption: pending.blouseOption, tailoringExtraINR: pending.tailoringExtraINR }];
              });
              setIsCartDrawerOpen(true);
            }
          }
        } catch (err) {
          console.error('[CartContext] Error executing pending cart action:', err);
        }

        // Check & Execute Pending Wishlist Action from sessionStorage
        try {
          const pendingWishlistStr = sessionStorage.getItem('pending_wishlist_action');
          if (pendingWishlistStr) {
            sessionStorage.removeItem('pending_wishlist_action');
            const pending = JSON.parse(pendingWishlistStr);
            if (pending?.productId) {
              setWishlist((prev) => prev.includes(pending.productId) ? prev : [...prev, pending.productId]);
              await supabase.from('wishlist_items').upsert({ customer_id: user.id, variant_id: pending.productId });
            }
          }
        } catch (err) {
          console.error('[CartContext] Error executing pending wishlist action:', err);
        }

      } else {
        // Unauthenticated guest user
        setCart([]);
        setWishlist([]);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => syncUserData(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUserData(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --------------------------------------------------------------------------
  // 2. FLYING ANIMATION & CART ACTIONS
  // --------------------------------------------------------------------------
  const triggerFlyAnimation = (imageUrl: string, sourcePosition?: SourcePosition) => {
    if (typeof window === 'undefined') return;

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
    setCartBounced(true);
    setTimeout(() => setCartBounced(false), 500);
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    blouseOption?: string,
    tailoringExtraINR = 0,
    sourcePosition?: SourcePosition
  ) => {
    if (!currentUser) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_action', JSON.stringify({
          product,
          quantity,
          blouseOption,
          tailoringExtraINR,
        }));
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
      return;
    }

    const maxStock = product.stockCount ?? 5;

    // 1. Update Cart Data State with strict stock count cap (BFS 9.3)
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const cappedQty = Math.min(maxStock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: cappedQty }
            : item
        );
      }
      const initialQty = Math.min(quantity, maxStock);
      return [...prev, { product, quantity: initialQty, blouseOption, tailoringExtraINR }];
    });

    // 2. Sync to Supabase Database
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        quantity,
        blouseOption,
        tailoringExtraINR,
      }),
    }).catch(err => console.error('[CartContext] DB sync error:', err));

    // 3. Trigger silk-flight animation
    const productImage = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
    triggerFlyAnimation(productImage, sourcePosition);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (currentUser) {
      fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).catch(err => console.error('[CartContext] DB remove error:', err));
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stockCount ?? 5;
          const cappedQty = Math.min(quantity, maxStock);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );

    if (currentUser) {
      fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      }).catch(err => console.error('[CartContext] DB update error:', err));
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!currentUser) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_wishlist_action', JSON.stringify({ productId }));
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
      return;
    }

    const isCurrentlyWishlisted = wishlist.includes(productId);
    setWishlist((prev) =>
      isCurrentlyWishlisted
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

    const supabase = createClient();
    if (isCurrentlyWishlisted) {
      await supabase.from('wishlist_items').delete().eq('customer_id', currentUser.id).eq('variant_id', productId);
    } else {
      await supabase.from('wishlist_items').upsert({ customer_id: currentUser.id, variant_id: productId });
    }
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

  const clearCart = async () => {
    setCart([]);
    setAppliedCoupon(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userCart } = await supabase.from('carts').select('id').eq('customer_id', user.id).single();
      if (userCart) {
        await supabase.from('cart_items').delete().eq('cart_id', userCart.id);
      }
    }
  };

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
        clearCart,
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
      <FlyingCartAnimation items={flyingItems} onComplete={handleFlightComplete} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
