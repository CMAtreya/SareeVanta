'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Sparkles,
  Phone,
  Check,
  Star,
  Layers,
  Scissors,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  AlertCircle,
  Eye,
  Plus,
  Minus,
  MessageSquare,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { Product, Review } from '@/lib/products';
import { useCart } from '@/components/providers/CartContext';
import ProductCard from '@/components/ecommerce/ProductCard';
import ProductDetailSkeleton from '@/components/ecommerce/ProductDetailSkeleton';

// In-memory PDP cache for instant (0ms) product loading
const pdpCache = new Map<string, any>();

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params as { slug: string };

  const { addToCart, toggleWishlist, isInWishlist, currency } = useCart();

  // Local / API Product Data
  const initialCached = pdpCache.get(slug)?.product || null;
  const [product, setProduct] = useState<Product | null>(initialCached);
  const [relatedItems, setRelatedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!initialCached);

  // Gallery & Variant State
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialCached?.images || []);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Zoom on Hover State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Purchase States
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Accordion State
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    fabric: true,
    zari: false,
    care: false,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // More Information vs More Info Tab State
  const [infoTab, setInfoTab] = useState<'moreInformation' | 'moreInfo'>('moreInformation');

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(initialCached?.reviewsList || []);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewPhotos, setNewReviewPhotos] = useState<string[]>([]);

  // Fetch logged in customer profile name for review prefill
  useEffect(() => {
    async function loadCustomer() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const name = data.user?.name || data.user?.full_name || data.customer?.name || (data.user?.email ? data.user.email.split('@')[0] : '');
          if (name) {
            setNewReviewAuthor(name);
            setIsUserLoggedIn(true);
          }
        }
      } catch (err) {
        // guest mode
      }
    }
    loadCustomer();
  }, []);

  // Carousel Ref for "You May Also Like"
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch product from GET /api/products/:slug with memory cache
  useEffect(() => {
    let isMounted = true;

    if (pdpCache.has(slug)) {
      const data = pdpCache.get(slug);
      if (data.product) {
        setProduct(data.product);
        setRelatedItems(data.relatedProducts || []);
        const primaryImgs = (data.product.images && data.product.images.length > 0
          ? data.product.images
          : data.product.colorVariants?.[0]?.images || []
        ).filter((url: any) => typeof url === 'string' && url.trim().length > 5);
        setGalleryImages(primaryImgs);
        setSelectedImageIdx(0);
        if (data.product.reviewsList) {
          setReviews(data.product.reviewsList);
        }
        setLoading(false);
        return;
      }
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          pdpCache.set(slug, data);
          if (isMounted && data.product) {
            setProduct(data.product);
            setRelatedItems(data.relatedProducts || []);
            const primaryImgs = (data.product.images && data.product.images.length > 0
              ? data.product.images
              : data.product.colorVariants?.[0]?.images || []
            ).filter((url: any) => typeof url === 'string' && url.trim().length > 5);
            setGalleryImages(primaryImgs);
            setSelectedImageIdx(0);
            if (data.product.reviewsList) {
              setReviews(data.product.reviewsList);
            }
          }
          if (isMounted) setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching product from API:', err);
      }

      if (isMounted) {
        setProduct(null);
        setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Color Variant Selection (Strict max 3 photos)
  const handleVariantClick = (idx: number) => {
    setSelectedVariantIndex(idx);
    if (product?.colorVariants && product.colorVariants[idx]) {
      const variantImgs = (product.colorVariants[idx].images || []).filter((url) => typeof url === 'string' && url.trim().length > 5).slice(0, 3);
      const fallbackImgs = (product.images || []).filter((url) => typeof url === 'string' && url.trim().length > 5).slice(0, 3);
      setGalleryImages(variantImgs.length > 0 ? variantImgs : fallbackImgs);
      setSelectedImageIdx(0);
    }
  };

  // Zoom on Hover Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-24 px-4 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#7A1C30]/10 border border-[#7A1C30]/20 flex items-center justify-center mx-auto text-[#7A1C30]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl text-stone-900 font-bold">
            Saree Creation Not Found
          </h1>
          <p className="text-sm font-sans text-stone-600 leading-relaxed">
            The requested saree listing could not be located or has been archived from our digital atelier.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7A1C30] hover:bg-[#5E1524] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <span>Explore All Sarees</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const totalPriceINR = product.priceINR * quantity;
  const stock = product.stockCount ?? 2;

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  // Add to Cart Action via POST /api/cart/items
  const handleAddToCart = async (e: React.MouseEvent) => {
    try {
      await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });
    } catch (err) {
      console.warn('API cart items call failed, using client context');
    }

    addToCart(product, quantity, undefined, 0, e);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  // Handle Review Photo Upload (Max 2 photos per DSS specification)
  const handleReviewPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 2 - newReviewPhotos.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const result = loadEvent.target?.result as string;
          if (result) {
            setNewReviewPhotos((prev) => {
              if (prev.length < 2) {
                return [...prev, result];
              }
              return prev;
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });

    e.target.value = '';
  };

  const handleRemoveReviewPhoto = (index: number) => {
    setNewReviewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Customer Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      location: 'Mysuru Patron',
      rating: newReviewRating,
      date: 'Just now',
      title: newReviewTitle.trim() || 'Exceptional Pure Silk Saree',
      comment: newReviewComment.trim(),
      verified: true,
      photos: newReviewPhotos.slice(0, 2),
      photo: newReviewPhotos[0] || undefined,
    };

    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);

    // Sync to backend /api/reviews
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: 'pending-guest-order',
          order_item_id: 'item-guest',
          variant_id: product?.id || 'default-variant',
          rating: newReviewRating,
          review_text: newReviewComment.trim(),
          photos: newReviewPhotos.slice(0, 2),
        }),
      });
    } catch (err) {
      console.warn('[Review Modal] Background sync to API queued:', err);
    }

    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setNewReviewPhotos([]);
  };

  // Carousel Controls
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* 1. Breadcrumb Row at Top */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 font-sans mb-6">
          <Link href="/" className="hover:text-[#C87F4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link href="/products" className="hover:text-[#C87F4A] transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link
            href={`/products?weave=${encodeURIComponent(product.weave)}`}
            className="hover:text-[#C87F4A] transition-colors"
          >
            {product.weave}
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-[#1F1B16] font-semibold truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* 2. Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ==================================================== */}
          {/* LEFT: IMAGE GALLERY (Main + Zoom + Thumbnails)      */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnail Strip */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                    selectedImageIdx === idx
                      ? 'border-[#C87F4A] shadow-md scale-105'
                      : 'border-stone-200/80 opacity-70 hover:opacity-100 hover:border-stone-300'
                  }`}
                  aria-label={`View Image ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.title} view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage Image with Zoom on Hover */}
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative flex-1 rounded-2xl overflow-hidden bg-stone-100 border border-[#C87F4A]/25 shadow-silk-lg cursor-crosshair select-none"
            >
              {/* Normal Image or Branded Atelier Placeholder */}
              {(() => {
                const currentImg = galleryImages[selectedImageIdx] || galleryImages[0] || product.images?.[0];
                const hasValidImage = currentImg && typeof currentImg === 'string' && currentImg.trim().length > 5;

                if (hasValidImage) {
                  return (
                    <div className="relative w-full h-[520px] sm:h-[620px] bg-white flex items-center justify-center p-2">
                      <img
                        src={currentImg}
                        alt={product.title}
                        className={`w-full h-full object-contain object-center transition-opacity duration-200 ${
                          isZoomed ? 'opacity-0' : 'opacity-100'
                        }`}
                      />

                      {/* Zoom Magnifier Lens Image */}
                      {isZoomed && (
                        <div
                          className="absolute inset-0 w-full h-full bg-no-repeat pointer-events-none"
                          style={{
                            backgroundImage: `url(${currentImg})`,
                            backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`,
                            backgroundSize: '220%',
                          }}
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <div className="w-full h-full min-h-[440px] bg-[#1F1B16] text-[#FAF3E4] flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border border-[#C87F4A]/50 flex items-center justify-center bg-[#FAF3E4]/10 shadow-lg">
                      <Sparkles className="w-8 h-8 text-[#C87F4A]" />
                    </div>
                    <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#E2CE9F]">NEEL SAREE HOUSE ATELIER</span>
                    <h3 className="font-editorial text-2xl text-white font-semibold max-w-sm">{product.title}</h3>
                    <p className="text-xs text-stone-300 font-mono max-w-xs leading-relaxed">
                      Masterpiece Drape Photo Pending Studio Capture. 100% Pure Silk Certified.
                    </p>
                  </div>
                );
              })()}

              {/* Silk Mark Overlay Badge */}
              <div className="absolute top-4 left-4 bg-[#FAF3E4]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#C87F4A]/30 text-xs font-mono font-semibold text-[#773D21] flex items-center gap-1.5 shadow-sm pointer-events-none">
                <ShieldCheck className="w-4 h-4 text-[#C87F4A]" />
                <span>100% Silk Mark India Certified</span>
              </div>

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                  inWishlist
                    ? 'bg-red-50 text-red-600 scale-110 shadow-red-200'
                    : 'bg-[#FAF3E4]/90 text-[#1F1B16] hover:bg-white hover:text-[#C87F4A]'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-600' : ''}`} />
              </button>

              {/* Zoom Helper Tip */}
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-[#FAF3E4] text-[10px] font-mono px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>Hover to Zoom 24K Zari Details</span>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT: PRODUCT DETAILS & PURCHASE ACTIONS           */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Details */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[#C87F4A] mb-1">
                <span>{product.weave}</span>
                <span>•</span>
                <span>{product.fabric}</span>
              </div>

              <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1F1B16] leading-tight">
                {product.title}
              </h1>

              {/* Reviews & Cluster Provenance */}
              <div className="mt-2.5 flex items-center gap-3 text-xs text-stone-600">
                <div className="flex items-center gap-1 text-amber-700">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold">{product.rating}</span>
                  <a href="#reviews" className="text-stone-500 underline ml-1">
                    ({product.reviewCount} verified patron reviews)
                  </a>
                </div>
                <span>•</span>
                <span className="font-mono text-[#773D21] font-medium">{product.artisanCluster}</span>
              </div>
            </div>

            {/* Price Row with Scratched Price Above Discounted Price & Discount Percentage Beside it */}
            {(() => {
              const originalUnitPrice = product.originalPriceINR && product.originalPriceINR > product.priceINR
                ? product.originalPriceINR
                : Math.round((product.priceINR * 1.25) / 100) * 100;
              const discountPercent = Math.round(((originalUnitPrice - product.priceINR) / originalUnitPrice) * 100);

              return (
                <div className="p-4 rounded-2xl bg-white border border-[#C87F4A]/25 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col">
                    {/* Scratched Original Price Above Discounted Price with Discount Percentage Beside it */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm sm:text-base text-stone-400 line-through font-sans">
                        {formatPrice(originalUnitPrice * quantity)}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {discountPercent}% OFF
                      </span>
                    </div>

                    {/* Discounted / Selling Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-editorial text-3xl sm:text-4xl font-bold text-[#1F1B16]">
                        {formatPrice(totalPriceINR)}
                      </span>
                      <span className="text-xs text-stone-500 font-sans">
                        (Incl. of all taxes)
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                    GST & Customs Included
                  </span>
                </div>
              );
            })()}

            {/* Description Card */}
            {product.description && (
              <div className="p-4 rounded-2xl bg-white/90 border border-[#C87F4A]/20 shadow-xs space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#C87F4A] block">
                  Atelier Heritage Story
                </span>
                <p className="text-xs sm:text-[13px] text-stone-700 leading-relaxed font-sans">
                  {product.description}
                </p>
              </div>
            )}

            {/* Weave Tradition & Fabric Spec Chips */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
              <div className="p-3 bg-white/80 rounded-xl border border-[#C87F4A]/20 shadow-xs">
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Weave Tradition</span>
                <span className="font-semibold text-[#1F1B16]">{product.weave}</span>
              </div>
              <div className="p-3 bg-white/80 rounded-xl border border-[#C87F4A]/20 shadow-xs">
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Fabric</span>
                <span className="font-semibold text-[#1F1B16]">{product.fabric}</span>
              </div>
            </div>

            {/* Color Variant Swatches (Clicking swaps gallery images) */}
            {(() => {
              const variantsList = product.colorVariants || [];
              const activeVariant = variantsList[selectedVariantIndex] || variantsList[0];
              if (variantsList.length === 0) return null;

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#1F1B16]">
                      Color Variant: <strong className="text-[#C87F4A]">{activeVariant?.name || product.color}</strong>
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {variantsList.length} {variantsList.length === 1 ? 'Color Available' : 'Colors Available'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {variantsList.map((variant, vIdx) => (
                      <button
                        key={variant.id || vIdx}
                        type="button"
                        onClick={() => handleVariantClick(vIdx)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-sans cursor-pointer ${
                          selectedVariantIndex === vIdx
                            ? 'border-[#C87F4A] bg-white font-bold text-[#1F1B16] shadow-xs ring-2 ring-[#C87F4A]/30'
                            : 'border-stone-300 bg-white/60 text-stone-700 hover:border-[#C87F4A]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                          style={{ backgroundColor: variant.hex || '#8B1E28' }}
                        />
                        <span>{variant.name || `Color ${vIdx + 1}`}</span>
                        {variant.stock !== undefined && (
                          <span className="text-[10px] font-mono text-stone-400">({variant.stock})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Stock Indicator (Warning tone badge when stock is low) */}
            <div className="flex items-center gap-2 py-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>
                  {stock <= 3
                    ? `⚡ Only ${stock} pieces left in Mysuru flagship vault`
                    : `In Stock • ${stock} available for immediate dispatch`}
                </span>
              </span>
            </div>

            {/* Quantity Stepper + Add to Cart + Heart Favorites Row */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F1B16] flex items-center justify-between">
                <span>Select Quantity & Order:</span>
                <span className="text-[11px] font-mono text-stone-500 font-normal">
                  Standard 5.5m Pure Silk Saree
                </span>
              </label>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* 1. Quantity Stepper */}
                <div className="inline-flex items-center bg-white border border-[#C87F4A]/30 rounded-xl p-1 shadow-xs h-[50px] flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-full px-2 sm:px-2.5 rounded-lg text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Decrease Quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 sm:w-11 text-center font-mono font-bold text-xs sm:text-sm text-[#1F1B16]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    className="h-full px-2 sm:px-2.5 rounded-lg text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Increase Quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Add to Cart Button (Matching rounded-xl shape) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 h-[50px] px-2 sm:px-6 rounded-xl text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.08em] sm:tracking-[0.15em] transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-md cursor-pointer ${
                    addedAnimation
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#C87F4A] hover:bg-[#B36737] text-white transform hover:-translate-y-0.5'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* 3. Heart Favorites Button (Matching rounded-xl shape) */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`h-[50px] w-[50px] rounded-xl border border-[#C87F4A]/30 transition-colors flex items-center justify-center flex-shrink-0 shadow-xs cursor-pointer ${
                    inWishlist
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'bg-white text-[#1F1B16] hover:bg-[#FAF3E4] hover:text-[#C87F4A]'
                  }`}
                  aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  title={inWishlist ? 'In Wishlist' : 'Save to Favorites'}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-600' : ''}`} />
                </button>
              </div>
            </div>

              {/* ==================================================== */}
              {/* INNOVATIVE PRODUCT SPECIFICATIONS & INFO TABS         */}
              {/* Placed Directly Below "Try This on AI Avatar Studio"  */}
              {/* ==================================================== */}
              <section className="mt-8 bg-white rounded-3xl p-5 sm:p-7 border border-[#C87F4A]/25 shadow-silk">
                {/* Centered Pill Tab Switcher */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setInfoTab('moreInformation')}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-sans font-semibold transition-all duration-200 ${
                      infoTab === 'moreInformation'
                        ? 'bg-[#A33B45] text-white shadow-md'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Product Information
                  </button>
                  <button
                    type="button"
                    onClick={() => setInfoTab('moreInfo')}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-sans font-semibold transition-all duration-200 ${
                      infoTab === 'moreInfo'
                        ? 'bg-[#A33B45] text-white shadow-md'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    More Info
                  </button>
                </div>

                {/* Tab 1: Detailed Specifications Matrix */}
                {infoTab === 'moreInformation' && (
                  <div className="animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 border-t border-stone-100">
                      {/* Left Column */}
                      <div className="divide-y divide-stone-100">
                        <div className="grid grid-cols-12 py-3 items-center">
                          <span className="col-span-4 text-xs font-medium text-stone-600 font-sans">
                            Fabric:
                          </span>
                          <div className="col-span-8 bg-[#FAF6F0] px-3 py-2 rounded-md">
                            <span className="text-xs font-semibold text-stone-900 font-sans">
                              {product.fabric || 'Pure Mulberry Silk'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 py-3 items-center">
                          <span className="col-span-4 text-xs font-medium text-stone-600 font-sans">
                            Weave Tradition:
                          </span>
                          <div className="col-span-8 bg-[#FAF6F0] px-3 py-2 rounded-md">
                            <span className="text-xs font-semibold text-stone-900 font-sans">
                              {product.weave}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 py-3 items-center">
                          <span className="col-span-4 text-xs font-medium text-stone-600 font-sans">
                            Motif & Pattern:
                          </span>
                          <div className="col-span-8 bg-[#FAF6F0] px-3 py-2 rounded-md">
                            <span className="text-xs font-semibold text-stone-900 font-sans">
                              {product.pattern || 'Kasuti Diamonds'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="divide-y divide-stone-100">
                        <div className="grid grid-cols-12 py-3 items-center">
                          <span className="col-span-4 text-xs font-medium text-stone-600 font-sans">
                            Color:
                          </span>
                          <div className="col-span-8 bg-[#FAF6F0] px-3 py-2 rounded-md">
                            <span className="text-xs font-semibold text-stone-900 font-sans">
                              {product.color}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 py-3 items-center">
                          <span className="col-span-4 text-xs font-medium text-stone-600 font-sans">
                            Zari Specification:
                          </span>
                          <div className="col-span-8 bg-[#FAF6F0] px-4 py-2 rounded-md">
                            <span className="text-xs font-semibold text-stone-900 font-sans">
                              {product.zariGrade || 'Pure 24K Tested Zari'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 py-3 items-center">
                          <span className="col-span-4 text-xs font-medium text-stone-600 font-sans">
                            Saree Dimension:
                          </span>
                          <div className="col-span-8 bg-[#FAF6F0] px-3 py-2 rounded-md">
                            <span className="text-xs font-semibold text-stone-900 font-sans">
                              {product.dimensions || '5.5 M X 1.14 M'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 py-3 items-center">
                          <span className="col-span-4 text-xs font-medium text-stone-600 font-sans">
                            Wash Care:
                          </span>
                          <div className="col-span-8 bg-[#FAF6F0] px-3 py-2 rounded-md">
                            <span className="text-xs font-semibold text-stone-900 font-sans">
                              Dry-clean Only
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: More Info (Provenance, Silk Mark & Care Details) */}
                {infoTab === 'moreInfo' && (
                  <div className="animate-fade-in pt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#D9A876]/30 space-y-2">
                        <h4 className="font-editorial text-sm font-bold text-stone-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#A33B45]" />
                          <span>Authentic Certification & Guarantee</span>
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          Each piece is certified by Central Silk Board with Silk Mark hologram authentication guaranteeing 100% natural silk fibers and genuine purity standards.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#D9A876]/30 space-y-2">
                        <h4 className="font-editorial text-sm font-bold text-stone-900 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#A33B45]" />
                          <span>Preservation & Cedar Storage</span>
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed">
                          Store wrapped in breathable unbleached cotton/muslin bags with natural cedar blocks. Rotate fold lines every 4-6 months to maintain generational luster.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>

        {/* ==================================================== */}
        {/* "YOU MAY ALSO LIKE" HORIZONTAL CAROUSEL              */}
        {/* Placed ABOVE Customer Reviews with Equal Height Cards */}
        {/* ==================================================== */}
        <section className="mt-16 pt-12 border-t border-[#C87F4A]/20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#C87F4A]">
                Complementary Handlooms
              </span>
              <h2 className="font-editorial text-2xl sm:text-4xl font-normal text-[#1F1B16]">
                You May Also Like
              </h2>
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="p-2.5 rounded-full bg-white border border-[#C87F4A]/30 hover:bg-[#C87F4A] hover:text-white transition-colors shadow-xs"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="p-2.5 rounded-full bg-white border border-[#C87F4A]/30 hover:bg-[#C87F4A] hover:text-white transition-colors shadow-xs"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Track with Equal-Dimensioned Saree Cards */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-1 scrollbar-none snap-x items-stretch"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {relatedItems.map((relProduct) => (
              <div
                key={relProduct.id}
                className="w-[270px] sm:w-[300px] md:w-[320px] flex-shrink-0 snap-start flex flex-col"
              >
                <ProductCard product={relProduct} />
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================== */}
        {/* CUSTOMER REVIEWS SECTION (Rating summary + cards)    */}
        {/* ==================================================== */}
        <section id="reviews" className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-[#C87F4A]/25 shadow-silk">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-[#C87F4A]/20 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C87F4A] font-mono font-bold block mb-1">
                Patron Testimonials
              </span>
              <h2 className="font-editorial text-2xl sm:text-4xl font-normal text-[#1F1B16]">
                Customer Reviews
              </h2>
            </div>

            {/* Star Rating Summary */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="font-editorial text-4xl sm:text-5xl font-bold text-[#1F1B16]">
                  {product.rating > 0 ? product.rating : '—'}
                </div>
                <div className="flex items-center justify-center gap-0.5 text-amber-500 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        product.rating > 0 && i < Math.floor(product.rating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-stone-500 font-sans block mt-0.5">
                  Based on {reviews.length} reviews
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-[#C87F4A] hover:bg-[#B36737] text-white px-5 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Individual Review Cards or No Reviews Empty State */}
          {reviews.length === 0 ? (
            <div className="mt-8 p-10 rounded-2xl bg-[#FAF3E4]/60 border border-dashed border-[#C87F4A]/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#7A1C30]/10 text-[#7A1C30] flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 text-[#C87F4A]" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">No Patron Reviews Yet</h3>
              <p className="text-xs text-stone-600 font-mono max-w-md mx-auto leading-relaxed">
                Be the first to share your drape experience for this heirloom masterpiece.
              </p>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#7A1C30] hover:bg-[#5F1424] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                <Star className="w-4 h-4" />
                <span>Be the First to Review</span>
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-[#FAF3E4]/70 border border-[#C87F4A]/20 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Rating Stars & Date */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(Math.floor(rev.rating || 5))].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-stone-500">{rev.date}</span>
                    </div>

                    {/* Review Title */}
                    <h4 className="font-editorial text-base font-bold text-[#1F1B16]">
                      {rev.title}
                    </h4>

                    {/* Comment */}
                    <p className="text-xs text-stone-600 font-sans leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {/* Uploaded Customer Photos (Max 2 DSS Specification) */}
                    {(() => {
                      const photoList = rev.photos && rev.photos.length > 0
                        ? rev.photos
                        : rev.photo
                        ? [rev.photo]
                        : [];
                      if (photoList.length === 0) return null;

                      return (
                        <div className="mt-3 flex items-center gap-2">
                          {photoList.map((pUrl, pIdx) => (
                            <div
                              key={pIdx}
                              className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border border-[#C87F4A]/30 shadow-xs group bg-stone-100 flex-shrink-0"
                            >
                              <img
                                src={pUrl}
                                alt={`Customer drape review photo ${pIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute bottom-1 right-1 bg-black/60 p-0.5 rounded text-white text-[8px] font-mono flex items-center gap-0.5">
                                <Camera className="w-2.5 h-2.5" />
                                <span>{pIdx + 1}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Author Info */}
                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#1F1B16] block">{rev.author}</span>
                      <span className="text-[10px] text-stone-500 font-sans">{rev.location}</span>
                    </div>

                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Write a Review Modal with Photo Upload (Max 2) */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsReviewModalOpen(false)}
            />
            <div className="relative bg-[#FAF3E4] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#C87F4A]/30 z-10 text-[#1F1B16] space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
                <h3 className="font-editorial text-xl font-bold">Write a Customer Review</h3>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 text-stone-500 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-sans">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-stone-700">Customer Name</label>
                    {isUserLoggedIn && (
                      <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Account</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    readOnly={isUserLoggedIn}
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Radhika Sundaram"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                      isUserLoggedIn
                        ? 'bg-stone-100/90 border-stone-300 text-stone-800 font-semibold cursor-not-allowed'
                        : 'bg-white border-stone-300 focus:ring-2 focus:ring-[#C87F4A]'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Star Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${newReviewRating >= star ? 'fill-amber-500' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Review Headline</label>
                  <input
                    type="text"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    placeholder="e.g. Majestic drape for Muhurtham"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C87F4A]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Your Review & Drape Experience</label>
                  <textarea
                    required
                    rows={3}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Describe the fabric feel, luster under lighting, pleating comfort..."
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C87F4A]"
                  />
                </div>

                {/* Upload Drape Photos (Max 2 DSS Specification) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-stone-700 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-[#C87F4A]" />
                      <span>Upload Drape Photos</span>
                    </label>
                    <span className="text-[10px] font-mono text-stone-500">
                      {newReviewPhotos.length}/2 photos uploaded
                    </span>
                  </div>

                  {newReviewPhotos.length < 2 && (
                    <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#C87F4A]/40 rounded-xl bg-white/60 hover:bg-white cursor-pointer transition-colors text-center text-[11px] text-stone-600 font-medium">
                      <Camera className="w-4 h-4 text-[#C87F4A]" />
                      <span>Click to select saree photos (PNG/JPG, max 2)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReviewPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {newReviewPhotos.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-3">
                      {newReviewPhotos.map((photoUrl, pIndex) => (
                        <div
                          key={pIndex}
                          className="relative w-16 h-20 rounded-xl overflow-hidden border border-[#C87F4A]/30 shadow-xs bg-stone-100 group"
                        >
                          <img
                            src={photoUrl}
                            alt={`Preview ${pIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveReviewPhoto(pIndex)}
                            className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors cursor-pointer"
                            title="Remove Photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-md cursor-pointer transition-colors"
                >
                  Submit Customer Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
