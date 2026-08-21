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
import { products, Product, Review } from '@/lib/products';
import { useCart } from '@/components/providers/CartContext';
import ProductCard from '@/components/ecommerce/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params as { slug: string };

  const { addToCart, toggleWishlist, isInWishlist, currency } = useCart();

  // Local / API Product Data
  const initialProduct = products.find((p) => p.slug === slug) || products[0];
  const [product, setProduct] = useState<Product>(initialProduct);
  const [relatedItems, setRelatedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Gallery & Variant State
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialProduct.images);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Zoom on Hover State
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Purchase States
  const [quantity, setQuantity] = useState(1);
  const [selectedBlouse, setSelectedBlouse] = useState('Unstitched Standard (Free)');
  const [tailoringExtra, setTailoringExtra] = useState(0);
  const [isTailoringModalOpen, setIsTailoringModalOpen] = useState(false);
  const [tailoringSpecs, setTailoringSpecs] = useState({
    bust: '36',
    waist: '30',
    sleeveLength: '10',
    neckStyle: 'Classic Round U-Back',
  });
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

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(initialProduct.reviewsList || []);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Carousel Ref for "You May Also Like"
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch product from GET /api/products/:slug
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.product) {
            setProduct(data.product);
            setRelatedItems(data.relatedProducts || []);
            const initialImages = data.product.colorVariants?.[0]?.images || data.product.images;
            setGalleryImages(initialImages);
            setSelectedImageIdx(0);
            if (data.product.reviewsList) {
              setReviews(data.product.reviewsList);
            }
          }
          return;
        }
      } catch (err) {
        console.error('Error fetching product from API:', err);
      }

      // Fallback local lookup
      const found = products.find((p) => p.slug === slug) || products[0];
      if (isMounted) {
        setProduct(found);
        const rel = products
          .filter((p) => p.id !== found.id && (p.weave === found.weave || p.occasion === found.occasion))
          .slice(0, 4);
        setRelatedItems(rel);
        const initialImages = found.colorVariants?.[0]?.images || found.images;
        setGalleryImages(initialImages);
        setSelectedImageIdx(0);
        if (found.reviewsList) {
          setReviews(found.reviewsList);
        }
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Color Variant Selection
  const handleVariantClick = (idx: number) => {
    setSelectedVariantIndex(idx);
    if (product.colorVariants && product.colorVariants[idx]) {
      setGalleryImages(product.colorVariants[idx].images);
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

  const inWishlist = isInWishlist(product.id);
  const totalPriceINR = (product.priceINR + tailoringExtra) * quantity;
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
          blouseOption: selectedBlouse,
          tailoringExtraINR: tailoringExtra,
        }),
      });
    } catch (err) {
      console.warn('API cart items call failed, using client context');
    }

    addToCart(product, quantity, selectedBlouse, tailoringExtra, e);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  // Add Customer Review
  const handleSubmitReview = (e: React.FormEvent) => {
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
    };

    setReviews([newRev, ...reviews]);
    setIsReviewModalOpen(false);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
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
              className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-[#C87F4A]/25 shadow-silk-lg cursor-crosshair select-none"
            >
              {/* Normal Image */}
              <img
                src={galleryImages[selectedImageIdx] || galleryImages[0]}
                alt={product.title}
                className={`w-full h-full object-cover object-center transition-opacity duration-200 ${
                  isZoomed ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* Zoom Magnifier Lens Image */}
              {isZoomed && (
                <div
                  className="absolute inset-0 w-full h-full bg-no-repeat pointer-events-none"
                  style={{
                    backgroundImage: `url(${galleryImages[selectedImageIdx] || galleryImages[0]})`,
                    backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`,
                    backgroundSize: '240%',
                  }}
                />
              )}

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

            {/* Price Row with Currency & Tax Guarantee */}
            <div className="p-4 rounded-2xl bg-white border border-[#C87F4A]/25 flex items-baseline justify-between shadow-sm">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-3">
                  <span className="font-editorial text-3xl sm:text-4xl font-bold text-[#1F1B16]">
                    {formatPrice(totalPriceINR)}
                  </span>
                  {product.originalPriceINR && (
                    <span className="text-sm text-stone-400 line-through font-editorial">
                      {formatPrice(product.originalPriceINR * quantity)}
                    </span>
                  )}
                </div>
                {tailoringExtra > 0 && (
                  <span className="text-[11px] font-mono text-[#773D21] mt-0.5">
                    Includes {formatPrice(tailoringExtra * quantity)} Bespoke Tailoring
                  </span>
                )}
              </div>

              <span className="text-[10px] sm:text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                GST & Customs Included
              </span>
            </div>

            {/* Weave / Fabric / Blouse-Included Spec Chips */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-sans">
              <div className="p-2.5 bg-white/70 rounded-xl border border-[#C87F4A]/20">
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Weave & Craft</span>
                <span className="font-semibold text-[#1F1B16]">{product.weave} Tradition</span>
              </div>
              <div className="p-2.5 bg-white/70 rounded-xl border border-[#C87F4A]/20">
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Fabric Purity</span>
                <span className="font-semibold text-[#1F1B16]">{product.fabric}</span>
              </div>
              <div className="p-2.5 bg-white/70 rounded-xl border border-[#C87F4A]/20">
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Blouse Piece</span>
                <span className="font-semibold text-[#1F1B16]">Included 0.8m Running</span>
              </div>
              <div className="p-2.5 bg-white/70 rounded-xl border border-[#C87F4A]/20">
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Zari Metallurgy</span>
                <span className="font-semibold text-[#1F1B16]">{product.zariGrade}</span>
              </div>
            </div>

            {/* Color Variant Swatches (Clicking swaps gallery images) */}
            {product.colorVariants && product.colorVariants.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#1F1B16]">
                    Color Variant: <strong className="text-[#C87F4A]">{product.colorVariants[selectedVariantIndex].name}</strong>
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">
                    {product.colorVariants.length} Colors Available
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {product.colorVariants.map((variant, vIdx) => (
                    <button
                      key={vIdx}
                      type="button"
                      onClick={() => handleVariantClick(vIdx)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-sans ${
                        selectedVariantIndex === vIdx
                          ? 'border-[#C87F4A] bg-white font-bold text-[#1F1B16] shadow-xs ring-2 ring-[#C87F4A]/30'
                          : 'border-stone-300 bg-white/60 text-stone-700 hover:border-[#C87F4A]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: variant.hex }}
                      />
                      <span>{variant.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Indicator (Warning tone badge when stock is low) */}
            <div className="flex items-center gap-2 py-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>
                  {stock <= 3
                    ? `⚡ Only ${stock} pieces left in Mysuru salon vault`
                    : `In Stock • ${stock} available for immediate dispatch`}
                </span>
              </span>
            </div>

            {/* Quantity Stepper & Blouse Customization Button */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1F1B16] flex items-center justify-between">
                <span>Select Quantity:</span>
                <span className="text-[11px] font-mono text-stone-500 font-normal">
                  Standard 5.5m Saree + 0.8m Blouse Piece
                </span>
              </label>

              <div className="flex items-center gap-4">
                {/* Stepper */}
                <div className="inline-flex items-center bg-white border border-[#C87F4A]/30 rounded-xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 rounded-lg text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Decrease Quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm text-[#1F1B16]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    className="p-2 rounded-lg text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Increase Quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Optional Custom Blouse Tailoring Trigger */}
                <button
                  type="button"
                  onClick={() => setIsTailoringModalOpen(true)}
                  className="flex-1 py-2.5 px-3 bg-white/70 border border-[#C87F4A]/30 hover:border-[#C87F4A] rounded-xl text-left flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Scissors className="w-3.5 h-3.5 text-[#C87F4A]" />
                    <div>
                      <span className="text-xs font-semibold text-[#1F1B16] block group-hover:text-[#C87F4A]">
                        {selectedBlouse}
                      </span>
                      <span className="text-[10px] text-stone-500 font-sans">
                        Click to customize measurements
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C87F4A]" />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Add to Cart + Wishlist Row */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md ${
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

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 rounded-sm border transition-colors flex items-center justify-center ${
                    inWishlist
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'bg-white border-[#C87F4A]/30 text-[#1F1B16] hover:bg-[#FAF3E4]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-600' : ''}`} />
                </button>
              </div>

              {/* Secondary "Try This on AI Avatar" Button (Linking to /try-on?saree=[slug]) */}
              <Link
                href={`/try-on?saree=${encodeURIComponent(product.slug)}`}
                className="w-full py-3.5 rounded-sm bg-[#1F1B16] hover:bg-black text-[#FAF3E4] text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#C87F4A]" />
                <span>Try This on AI Avatar Studio</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* BELOW THE FOLD: ACCORDION FABRIC & CARE DETAILS      */}
        {/* ==================================================== */}
        <div className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-[#C87F4A]/25 shadow-silk">
          <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-[#1F1B16] mb-6">
            Fabric, Provenance & Preservation Details
          </h2>

          <div className="divide-y divide-[#C87F4A]/15">
            {/* Accordion 1: Fabric & Weave Details */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('fabric')}
                className="flex items-center justify-between w-full text-left font-editorial text-lg font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
              >
                <span>1. Fabric Architecture & Weaving Craft</span>
                {openAccordions.fabric ? <ChevronUp className="w-5 h-5 text-[#C87F4A]" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {openAccordions.fabric && (
                <div className="mt-3 text-xs sm:text-sm text-stone-700 font-sans leading-relaxed space-y-2">
                  <p>{product.description}</p>
                  <p>
                    Woven with 100% natural Karnataka Mulberry Silk and twisted yarn, imparting the legendary fluid crepe drape that gracefully accentuates formal and bridal movements.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Zari Metallurgy & Loom Traceability */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('zari')}
                className="flex items-center justify-between w-full text-left font-editorial text-lg font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
              >
                <span>2. Zari Metallurgy & Loom Provenance</span>
                {openAccordions.zari ? <ChevronUp className="w-5 h-5 text-[#C87F4A]" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {openAccordions.zari && (
                <div className="mt-3 text-xs sm:text-sm text-stone-700 font-sans leading-relaxed space-y-2">
                  <p>
                    <strong>Zari Composition:</strong> {product.zariGrade}. Guaranteed 57% silver electroplated with 24-karat pure yellow gold ribbon without synthetic copper adulteration.
                  </p>
                  <p>
                    <strong>Master Loom Guild:</strong> {product.artisanCluster}. Every meter represents generational shuttle mastery passed down through 5 generations of heritage weavers.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3: Wash & Cedar Storage Care */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('care')}
                className="flex items-center justify-between w-full text-left font-editorial text-lg font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
              >
                <span>3. Silk Care & Cedar Storage Guidelines</span>
                {openAccordions.care ? <ChevronUp className="w-5 h-5 text-[#C87F4A]" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {openAccordions.care && (
                <div className="mt-3 text-xs sm:text-sm text-stone-700 font-sans leading-relaxed space-y-2">
                  <p>✦ <strong>Dry Clean Exclusively:</strong> Pure silk with real metallic zari must only be professionally dry cleaned.</p>
                  <p>✦ <strong>Breathable Muslin Wrap:</strong> Store in acid-free unbleached cotton/muslin bags with natural cedar blocks. Avoid plastic wrapping.</p>
                  <p>✦ <strong>Fold Rotation:</strong> Air the saree and change the fold lines every 4-6 months to prevent creasing on metallic zari wefts.</p>
                </div>
              )}
            </div>

            {/* Accordion 4: Shipping, Fall & Pico Guarantee */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className="flex items-center justify-between w-full text-left font-editorial text-lg font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
              >
                <span>4. Complimentary Fall, Pico & Express Shipping</span>
                {openAccordions.shipping ? <ChevronUp className="w-5 h-5 text-[#C87F4A]" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              {openAccordions.shipping && (
                <div className="mt-3 text-xs sm:text-sm text-stone-700 font-sans leading-relaxed space-y-2">
                  <p>✦ <strong>Complimentary Ready-to-Drape:</strong> Includes hand-stitched fall and interlocking pico border finish at no extra charge.</p>
                  <p>✦ <strong>Insured Express Courier:</strong> Dispatched via BlueDart / DHL Express in tamper-proof waterproof security boxes within 2-4 business days.</p>
                </div>
              )}
            </div>
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
                  {product.rating}
                </div>
                <div className="flex items-center justify-center gap-0.5 text-amber-500 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-[11px] text-stone-500 font-sans block mt-0.5">
                  Based on {reviews.length} reviews
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-[#C87F4A] hover:bg-[#B36737] text-white px-5 py-3 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Individual Review Cards */}
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
                      {[...Array(Math.floor(rev.rating))].map((_, i) => (
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

                  {/* Uploaded Photo if available */}
                  {rev.photo && (
                    <div className="mt-2 relative w-20 h-24 rounded-lg overflow-hidden border border-[#C87F4A]/30 shadow-xs">
                      <img src={rev.photo} alt="Customer uploaded drape photo" className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 bg-black/60 p-0.5 rounded text-white text-[8px] font-mono">
                        <Camera className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  )}
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
        </section>

        {/* Write a Review Modal */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsReviewModalOpen(false)}
            />
            <div className="relative bg-[#FAF3E4] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#C87F4A]/30 z-10 text-[#1F1B16] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
                <h3 className="font-editorial text-xl font-bold">Write a Patron Review</h3>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 text-stone-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Radhika Sundaram"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
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
                        className="p-1 text-amber-500 hover:scale-110 transition-transform"
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
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
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
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3 rounded-sm text-xs font-bold uppercase tracking-widest shadow-md"
                >
                  Submit Patron Review
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Custom Tailoring Modal */}
        {isTailoringModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsTailoringModalOpen(false)}
            />
            <div className="relative bg-[#FAF3E4] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#C87F4A]/30 z-10 text-[#1F1B16] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-[#C87F4A]" />
                  <h3 className="font-editorial text-xl font-bold">
                    Bespoke Tailoring Specifications
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTailoringModalOpen(false)}
                  className="p-1 text-stone-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Bust (Inches)</label>
                  <input
                    type="number"
                    value={tailoringSpecs.bust}
                    onChange={(e) => setTailoringSpecs({ ...tailoringSpecs, bust: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Waist (Inches)</label>
                  <input
                    type="number"
                    value={tailoringSpecs.waist}
                    onChange={(e) => setTailoringSpecs({ ...tailoringSpecs, waist: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Sleeve Length (Inches)</label>
                  <input
                    type="number"
                    value={tailoringSpecs.sleeveLength}
                    onChange={(e) => setTailoringSpecs({ ...tailoringSpecs, sleeveLength: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Neck & Back Style</label>
                  <select
                    value={tailoringSpecs.neckStyle}
                    onChange={(e) => setTailoringSpecs({ ...tailoringSpecs, neckStyle: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                  >
                    <option>Classic Round U-Back</option>
                    <option>Royal Sweetheart Neck</option>
                    <option>Temple Deep V-Back with Latkan</option>
                    <option>Elbow Sleeve Brocade Cut</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTailoringModalOpen(false)}
                className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3 rounded-sm text-xs font-bold uppercase tracking-widest shadow-md"
              >
                Confirm Measurements & Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
