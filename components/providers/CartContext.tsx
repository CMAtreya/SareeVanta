'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, products } from '@/lib/products';
import FlyingCartAnimation, { FlyingItem } from '@/components/ecommerce/FlyingCartAnimation';
import { createClient } from '@/lib/supabase/client';

export interface CartItem {
  product: Product;
  variantId?: string;
  selectedColor?: string;
  selectedColorHex?: string;
  selectedSku?: string;
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
    sourcePosition?: SourcePosition,
    variantId?: string,
    selectedColor?: string,
    selectedColorHex?: string,
    selectedSku?: string
  ) => void;
  removeFromCart: (productId: string, variantId?: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string, selectedColor?: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  setIsMarqueeDismissed: (dismissed: boolean) => void;
  cartCount: number;
  cartSubtotalINR: number;
  cartTotalINR: number;
  selectedKeys: string[];
  selectedCartItems: CartItem[];
  selectedCount: number;
  selectedSubtotalINR: number;
  selectedTotalINR: number;
  selectedDiscountINR: number;
  toggleItemSelection: (itemKey: string) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  getItemKey: (item: CartItem) => string;
  wishlistCount: number;
  appliedCoupon: AppliedCoupon | null;
  couponDiscountINR: number;
  clearCart: () => void;
  removePurchasedItems: (purchased: { productId: string; variantId?: string; selectedColor?: string }[]) => void;
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

  // Initial load from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sareevanta_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(parsed);
          }
        }
        const savedCoupon = localStorage.getItem('sareevanta_coupon');
        if (savedCoupon) {
          setAppliedCoupon(JSON.parse(savedCoupon));
        }
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }
    }
  }, []);

  // Sync cart changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (cart.length > 0) {
          localStorage.setItem('sareevanta_cart', JSON.stringify(cart));
        } else {
          localStorage.removeItem('sareevanta_cart');
        }
      } catch (e) {}
    }
  }, [cart]);

  // Sync appliedCoupon to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (appliedCoupon) {
          localStorage.setItem('sareevanta_coupon', JSON.stringify(appliedCoupon));
        } else {
          localStorage.removeItem('sareevanta_coupon');
        }
      } catch (e) {}
    }
  }, [appliedCoupon]);

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
                const colorData = Array.isArray(variantData?.colors) ? variantData?.colors[0] : variantData?.colors;
                const mediaList = Array.isArray(variantData?.product_variant_media) ? variantData?.product_variant_media : [];
                const sortedMedia = [...mediaList].sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
                const itemImages = sortedMedia.map((m: any) => m.url).filter((u: any) => typeof u === 'string' && u.trim().length > 5);
                
                const weaveName = Array.isArray(productData?.weavings) ? productData?.weavings[0]?.name : productData?.weavings?.name || '';
                const fabricName = Array.isArray(productData?.fabrics) ? productData?.fabrics[0]?.name : productData?.fabrics?.name || '';

                const sellingPriceINR = variantData?.price_paise 
                  ? Math.round(variantData.price_paise / 100) 
                  : (productData?.base_selling_price_paise ? Math.round(productData.base_selling_price_paise / 100) : 0);

                const mrpINR = variantData?.mrp_paise 
                  ? Math.round(variantData.mrp_paise / 100) 
                  : (productData?.base_mrp_paise ? Math.round(productData.base_mrp_paise / 100) : sellingPriceINR);

                const resolvedProduct: Product = {
                  id: productData?.id || variantData?.id || item.variant_id || item.product_id || 'db-prod',
                  slug: productData?.slug || '',
                  title: productData?.title || 'Pure Silk Saree',
                  weave: weaveName,
                  fabric: fabricName,
                  occasion: '',
                  priceINR: sellingPriceINR,
                  originalPriceINR: mrpINR,
                  rating: 5,
                  reviewCount: 0,
                  color: colorData?.name || '',
                  colorHex: colorData?.hex_code || '#8B1E28',
                  images: itemImages,
                  zariGrade: '',
                  dimensions: '5.5m Pure Silk Saree',
                  inStock: true,
                  description: '',
                  artisanCluster: 'Neel Saree House Artisan Guild',
                  silkMarkCertified: true,
                  sku: variantData?.sku || '',
                  variantId: variantData?.id || item.variant_id,
                };

                return {
                  product: resolvedProduct,
                  quantity: item.quantity || 1,
                  blouseOption: item.blouse_option || 'unstitched',
                  tailoringExtraINR: item.tailoring_extra_inr || 0,
                  variantId: variantData?.id || item.variant_id,
                  selectedColor: colorData?.name || resolvedProduct.color,
                  selectedColorHex: colorData?.hex_code || resolvedProduct.colorHex,
                  selectedSku: variantData?.sku || resolvedProduct.sku,
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
              const targetColor = pending.selectedColor || targetProduct.color;
              const targetSku = pending.selectedSku || targetProduct.sku;
              const vId = pending.variantId;

              setCart((prev) => {
                const existingIdx = prev.findIndex((item) => {
                  if (item.product.id !== targetProduct.id) return false;
                  if (vId && item.variantId) return item.variantId === vId;
                  if (targetColor && item.selectedColor) return item.selectedColor === targetColor;
                  return true;
                });

                if (existingIdx >= 0) {
                  return prev.map((item, idx) =>
                    idx === existingIdx ? { ...item, quantity: item.quantity + (pending.quantity || 1) } : item
                  );
                }
                return [
                  ...prev,
                  {
                    product: targetProduct,
                    quantity: pending.quantity || 1,
                    blouseOption: pending.blouseOption,
                    tailoringExtraINR: pending.tailoringExtraINR,
                    variantId: vId,
                    selectedColor: targetColor,
                    selectedColorHex: pending.selectedColorHex || targetProduct.colorHex,
                    selectedSku: targetSku,
                  },
                ];
              });

              fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productId: targetProduct.id,
                  variantId: vId,
                  quantity: pending.quantity || 1,
                  blouseOption: pending.blouseOption,
                  tailoringExtraINR: pending.tailoringExtraINR,
                  sku: targetSku,
                  color: targetColor,
                }),
              }).catch(() => {});

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
    sourcePosition?: SourcePosition,
    variantId?: string,
    selectedColor?: string,
    selectedColorHex?: string,
    selectedSku?: string
  ) => {
    // Strict Authentication Enforcement: User must be logged in to add to cart
    if (!currentUser) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_cart_action', JSON.stringify({
          product,
          quantity,
          blouseOption,
          tailoringExtraINR,
          variantId,
          selectedColor,
          selectedColorHex,
          selectedSku,
        }));
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
      return;
    }

    const maxStock = product.stockCount ?? 5;
    const targetColor = selectedColor || product.color;
    const targetSku = selectedSku || product.sku;

    // 1. Update Cart Data State with distinct variant line items
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => {
        const sameProduct = item.product.id === product.id;
        if (!sameProduct) return false;
        if (variantId && item.variantId) return item.variantId === variantId;
        if (targetColor && item.selectedColor) return item.selectedColor === targetColor;
        return true;
      });

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const cappedQty = Math.min(maxStock, existing.quantity + quantity);
        return prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: cappedQty }
            : item
        );
      }

      const initialQty = Math.min(quantity, maxStock);
      return [
        ...prev,
        {
          product,
          quantity: initialQty,
          blouseOption,
          tailoringExtraINR,
          variantId,
          selectedColor: targetColor,
          selectedColorHex: selectedColorHex || product.colorHex,
          selectedSku: targetSku,
        },
      ];
    });

    // 2. Sync to Supabase Database if user is authenticated
    if (currentUser) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId,
          quantity,
          blouseOption,
          tailoringExtraINR,
          sku: targetSku,
          color: targetColor,
        }),
      }).catch((err) => console.error('[CartContext] DB sync error:', err));
    }

    // 3. Trigger silk-flight animation
    const productImage = product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
    triggerFlyAnimation(productImage, sourcePosition);
  };

  const removeFromCart = (productId: string, variantId?: string, selectedColor?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.product.id !== productId) return true;
        if (variantId && item.variantId) return item.variantId !== variantId;
        if (selectedColor && item.selectedColor) return item.selectedColor !== selectedColor;
        return false;
      })
    );
    if (currentUser) {
      fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId }),
      }).catch((err) => console.error('[CartContext] DB remove error:', err));
    }
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string, selectedColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId, selectedColor);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        const matches =
          item.product.id === productId &&
          (!variantId || item.variantId === variantId) &&
          (!selectedColor || item.selectedColor === selectedColor);

        if (matches) {
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
        body: JSON.stringify({ productId, variantId, quantity }),
      }).catch((err) => console.error('[CartContext] DB update error:', err));
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

  const getItemKey = (item: CartItem) =>
    item.variantId
      ? `${item.product.id}_${item.variantId}`
      : `${item.product.id}_${item.selectedColor || item.product.color || 'default'}`;

  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('sareevanta_selected_keys');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });

  const [hasInitializedSelection, setHasInitializedSelection] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('sareevanta_selected_keys') !== null;
    }
    return false;
  });

  // Sync selectedKeys when items are added/removed from cart
  useEffect(() => {
    setSelectedKeys((prev) => {
      const currentKeys = cart.map(getItemKey);
      if (!hasInitializedSelection && prev.length === 0 && currentKeys.length > 0) {
        setHasInitializedSelection(true);
        return currentKeys;
      }
      return prev.filter((k) => currentKeys.includes(k));
    });
  }, [cart, hasInitializedSelection]);

  // Persist user selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('sareevanta_selected_keys', JSON.stringify(selectedKeys));
      } catch (e) {}
    }
  }, [selectedKeys]);

  const toggleItemSelection = (itemKey: string) => {
    setSelectedKeys((prev) =>
      prev.includes(itemKey) ? prev.filter((k) => k !== itemKey) : [...prev, itemKey]
    );
  };

  const selectAllItems = () => {
    setSelectedKeys(cart.map(getItemKey));
  };

  const deselectAllItems = () => {
    setSelectedKeys([]);
  };

  const selectedCartItems = cart.filter((item) => selectedKeys.includes(getItemKey(item)));

  const selectedCount = selectedCartItems.reduce((acc, it) => acc + it.quantity, 0);

  const selectedSubtotalINR = selectedCartItems.reduce(
    (total, item) =>
      total + (item.product.priceINR + (item.tailoringExtraINR || 0)) * item.quantity,
    0
  );

  const rawSelectedDiscount = appliedCoupon
    ? appliedCoupon.discountPercent
      ? Math.round((selectedSubtotalINR * appliedCoupon.discountPercent) / 100)
      : appliedCoupon.discountFixedINR || 0
    : 0;

  const selectedDiscountINR = appliedCoupon?.maxDiscountCapINR
    ? Math.min(appliedCoupon.maxDiscountCapINR, rawSelectedDiscount)
    : rawSelectedDiscount;

  const selectedTotalINR = Math.max(0, selectedSubtotalINR - selectedDiscountINR);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotalINR = cart.reduce(
    (total, item) =>
      total + (item.product.priceINR + (item.tailoringExtraINR || 0)) * item.quantity,
    0
  );

  const rawDiscount = appliedCoupon
    ? appliedCoupon.discountPercent
      ? Math.round((cartSubtotalINR * appliedCoupon.discountPercent) / 100)
      : appliedCoupon.discountFixedINR || 0
    : 0;

  const couponDiscountINR = appliedCoupon?.maxDiscountCapINR
    ? Math.min(appliedCoupon.maxDiscountCapINR, rawDiscount)
    : rawDiscount;

  const cartTotalINR = Math.max(0, cartSubtotalINR - couponDiscountINR);

  const wishlistCount = wishlist.length;

  const clearCart = async () => {
    setCart([]);
    setSelectedKeys([]);
    setAppliedCoupon(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('sareevanta_cart');
        localStorage.removeItem('sareevanta_coupon');
      } catch (e) {}
    }
    fetch('/api/cart?clearAll=true', { method: 'DELETE' }).catch((err) =>
      console.error('[CartContext] clearCart DB error:', err)
    );
  };

  const removePurchasedItems = async (
    purchased: { productId: string; variantId?: string; selectedColor?: string }[]
  ) => {
    if (!purchased || purchased.length === 0) return;

    setCart((prev) =>
      prev.filter((item) => {
        const wasPurchased = purchased.some((p) => {
          if (p.variantId && item.variantId) return p.variantId === item.variantId;
          if (p.productId === item.product.id) {
            if (p.selectedColor && item.selectedColor) return p.selectedColor === item.selectedColor;
            return true;
          }
          return false;
        });
        return !wasPurchased;
      })
    );

    setAppliedCoupon(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('sareevanta_coupon');
      } catch (e) {}
    }

    try {
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: purchased,
        }),
      });
    } catch (e) {
      console.error('[CartContext] removePurchasedItems error:', e);
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
        removePurchasedItems,
        toggleWishlist,
        isInWishlist,
        setIsCartDrawerOpen,
        setIsMarqueeDismissed,
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
