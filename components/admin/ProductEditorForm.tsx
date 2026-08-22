'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Check,
  Sparkles,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  HelpCircle,
  Wand2,
  FileText,
  DollarSign,
  Package,
  Truck,
  Globe,
  Share2,
  Tag,
  ShieldCheck,
  Layers,
  AlertCircle,
  Eye,
  Info,
  Clock,
  CheckCircle2,
  X,
  Upload,
} from 'lucide-react';
import { products } from '@/lib/products';

interface ProductEditorFormProps {
  mode: 'create' | 'edit';
  productId?: string;
}

export default function ProductEditorForm({ mode, productId }: ProductEditorFormProps) {
  const router = useRouter();

  // Find existing product if edit mode
  const existingProduct = useMemoProduct(productId);

  // Form State: Basic Identifiers
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  // Form State: Technical Ethnic Taxonomy
  const [weave, setWeave] = useState('Mysore Silk');
  const [fabric, setFabric] = useState('100% Pure Mulberry Silk');
  const [zariType, setZariType] = useState('24K Tested Pure Zari');
  const [loomType, setLoomType] = useState('Traditional Jacquard Handloom');
  const [motifPattern, setMotifPattern] = useState('Mayil (Peacock) & Rudraksha Butta');
  const [palluBorderDetails, setPalluBorderDetails] = useState('Rich Heavy Gold Zari Contrast Pallu');
  const [hasBlousePiece, setHasBlousePiece] = useState(true);
  const [blouseDetails, setBlouseDetails] = useState('Contrast Crimson Crepe with Gold Kasuti Border (80cm)');
  const [isSilkMarkCertified, setIsSilkMarkCertified] = useState(true);
  const [silkMarkNumber, setSilkMarkNumber] = useState('CSB-2026-MYS-8942');

  // Form State: Media Asset Studio
  const [mediaImages, setMediaImages] = useState<
    { id: string; url: string; role: string }[]
  >([
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
      role: 'Primary Drape',
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
      role: 'Pallu Close-up',
    },
    {
      id: 'img-3',
      url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
      role: 'Border Macro',
    },
  ]);
  const [hasVideo, setHasVideo] = useState(true);
  const [videoUrl, setVideoUrl] = useState(
    'https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-a-traditional-indian-dress-41315-large.mp4'
  );

  // Form State: Inventory & Financials
  const [sku, setSku] = useState('NSH-SKU-MYS-01');
  const [loomTag, setLoomTag] = useState('LOOM-KA-MYS-28');
  const [hsnCode, setHsnCode] = useState('5007.20.10');
  const [gstRate, setGstRate] = useState('5%');
  const [costPrice, setCostPrice] = useState('18500');
  const [priceINR, setPriceINR] = useState('28500');
  const [originalPriceINR, setOriginalPriceINR] = useState('32000');
  const [stock, setStock] = useState('3');

  // Form State: Sidebar Controls
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ACTIVE');
  const [channels, setChannels] = useState({
    onlineStore: true,
    whatsAppCatalog: true,
    liveShopping: true,
  });
  const [occasions, setOccasions] = useState<string[]>([
    'Bridal',
    'Muhurtham',
    'Grand Reception',
  ]);
  const [weightGrams, setWeightGrams] = useState('680');
  const [dimensions, setDimensions] = useState('38 x 28 x 4 cm');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // UI state
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Populate data in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingProduct) {
      setTitle(existingProduct.title);
      setSubtitle((existingProduct as any).storySubtitle || `${existingProduct.weave} Masterpiece`);
      setSlug(existingProduct.slug);
      setDescription(
        existingProduct.description ||
          'Handcrafted pure mulberry silk saree woven on traditional pitlooms with sacred tested zari threads.'
      );
      setWeave(existingProduct.weave);
      setPriceINR(String(existingProduct.priceINR));
      setOriginalPriceINR(String(existingProduct.originalPriceINR || Math.round(existingProduct.priceINR * 1.15)));
      setSku((existingProduct as any).sku || `NSH-SKU-${existingProduct.id.slice(0, 4)}`);
      setMetaTitle(`${existingProduct.title} | Pure Silk Sarees | NEEL SAREE HOUSE`);
      setMetaDescription(`Handwoven ${existingProduct.weave} pure silk saree certified with Silk Mark tag. Free BlueDart air delivery across India.`);
      if (existingProduct.images?.length) {
        setMediaImages(
          existingProduct.images.map((url, i) => ({
            id: `img-${i}`,
            url,
            role: i === 0 ? 'Primary Drape' : i === 1 ? 'Pallu Close-up' : 'Border Macro',
          }))
        );
      }
    } else if (mode === 'create') {
      setTitle('Royal Mysuru Gold Zari Vintage Crepe Silk');
      setSubtitle('Royal Heritage Wodeyar Collection');
      setSlug('royal-mysuru-gold-zari-vintage-crepe-silk');
      setDescription(
        'An opulent pure Mysore silk saree meticulously spun with pure mulberry silk filaments and accented with radiant gold zari borders for auspicious occasions.'
      );
      setMetaTitle('Royal Mysuru Gold Zari Crepe Silk | NEEL SAREE HOUSE');
      setMetaDescription('Authentic pure Mysore crepe silk handloom saree with Central Silk Board Silk Mark certification.');
    }
  }, [mode, existingProduct]);

  // Auto-generate Slug on Title change
  const handleTitleChange = (val: string) => {
    setTitle(val);
    setIsDirty(true);
    if (mode === 'create') {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      setMetaTitle(`${val} | NEEL SAREE HOUSE`);
    }
  };

  // Insert Fabric Care Snippet
  const handleInsertFabricCareSnippet = () => {
    const careSnippet =
      '\n\n--- FABRIC CARE & PRESERVATION ---\n• 100% Pure Mulberry Silk with Tested Zari.\n• Dry-clean only with reputable saree specialists.\n• Wrap and store in unbleached pure cotton or muslin fabric.\n• Change folding crease every 3-4 months to preserve weave integrity.\n• Iron on medium silk temperature setting only on the reverse face.';
    setDescription((prev) => prev + careSnippet);
    setIsDirty(true);
  };

  // Save / Publish Action
  const handleSave = (publishState: 'ACTIVE' | 'DRAFT') => {
    setIsSaving(true);
    setTimeout(() => {
      setStatus(publishState);
      setIsSaving(false);
      setIsDirty(false);
      setSaveToast(true);
      setTimeout(() => {
        setSaveToast(false);
        router.push('/admin/catalog');
      }, 900);
    }, 600);
  };

  const discountPercent = originalPriceINR
    ? Math.round(((Number(originalPriceINR) - Number(priceINR)) / Number(originalPriceINR)) * 100)
    : 0;

  return (
    <div className="font-sans text-slate-900 select-none pb-28">
      {/* ================================================== */}
      {/* 1. STICKY TOP WORKSTATION HEADER                   */}
      {/* ================================================== */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 -mx-6 lg:-mx-8 -mt-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        {/* Left: Breadcrumbs & Unsaved Warning */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalog"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Catalog /</span>
              <h2 className="font-bold text-sm text-slate-900 font-sans truncate max-w-sm">
                {mode === 'create' ? 'Register New Handloom Saree' : `Edit SKU (${sku})`}
              </h2>
            </div>
            {isDirty && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved modifications detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.push('/admin/catalog')}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
          >
            Discard
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('DRAFT')}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('ACTIVE')}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            {isSaving ? (
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing...</span>
              </div>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{mode === 'create' ? 'Publish to Store' : 'Update Live Saree'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {saveToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Handloom Masterpiece SKU successfully published to live storefront.</span>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. TWO-COLUMN WORKSPACE (65% Left / 35% Right)     */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================== */}
        {/* LEFT COLUMN (65% - 8 Cols on lg screen)       */}
        {/* ============================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: BASIC IDENTIFIERS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>1. Basic Identifiers & Story</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Saree Title / Masterpiece Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Royal Mysuru Vintage Gold Zari Crepe Silk"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle / Heritage Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Royal Heritage Wodeyar Collection"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Handle / Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-500 text-xs font-mono">
                    /products/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-r-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Description with Fabric Care Snippet Inserter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Detailed Saree Narrative & Loom Specs
                </label>
                <button
                  type="button"
                  onClick={handleInsertFabricCareSnippet}
                  className="text-[11px] font-mono font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>+ Insert Fabric Care Snippet</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Describe the weaving technique, zari purity, occasion relevance, and sensory drape quality..."
                className="w-full p-3.5 border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 2: TECHNICAL ETHNIC TAXONOMY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>2. Technical Ethnic Taxonomy (Silk House Specs)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weave Tradition *
                </label>
                <select
                  value={weave}
                  onChange={(e) => {
                    setWeave(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900"
                >
                  <option value="Mysore Silk">Mysore Silk</option>
                  <option value="Kanchipuram">Kanchipuram</option>
                  <option value="Banarasi">Banarasi</option>
                  <option value="Paithani">Paithani</option>
                  <option value="Patola">Patola</option>
                  <option value="Chanderi">Chanderi</option>
                  <option value="Tussar">Tussar</option>
                  <option value="Ikkat">Ikkat</option>
                  <option value="Tissue Georgette">Tissue Georgette</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fabric Composition *
                </label>
                <select
                  value={fabric}
                  onChange={(e) => {
                    setFabric(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900"
                >
                  <option value="100% Pure Mulberry Silk">100% Pure Mulberry Silk</option>
                  <option value="Pure Kanchipuram Raw Silk">Pure Kanchipuram Raw Silk</option>
                  <option value="Mulberry Silk Cotton Blend">Mulberry Silk Cotton Blend</option>
                  <option value="Pure Organza Silk">Pure Organza Silk</option>
                  <option value="Pure Georgette Crepe Silk">Pure Georgette Crepe Silk</option>
                  <option value="Metallic Tissue Silk">Metallic Tissue Silk</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Zari Specification *
                </label>
                <select
                  value={zariType}
                  onChange={(e) => {
                    setZariType(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900"
                >
                  <option value="24K Tested Pure Zari">24K Tested Pure Gold Zari</option>
                  <option value="Sacred 3-Shuttle Pure Gold Zari">Sacred 3-Shuttle Pure Gold Zari</option>
                  <option value="Half-Fine Tested Zari">Half-Fine Tested Zari</option>
                  <option value="Antiqued Silver Core Zari">Antiqued Silver Core Zari</option>
                  <option value="Tapestry Pure Zari">Tapestry Pure Zari</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loom Construction Type
                </label>
                <select
                  value={loomType}
                  onChange={(e) => {
                    setLoomType(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-900"
                >
                  <option value="Traditional Jacquard Handloom">Traditional Jacquard Handloom</option>
                  <option value="Authentic Pitloom Handloom">Authentic Pitloom Handloom</option>
                  <option value="Frame Handloom 3-Shuttle">Frame Handloom 3-Shuttle</option>
                  <option value="Kadhwa Hand-Loom Shuttle">Kadhwa Hand-Loom Shuttle</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif / Design Pattern
                </label>
                <input
                  type="text"
                  value={motifPattern}
                  onChange={(e) => {
                    setMotifPattern(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Mayil (Peacock), Rudraksha Butta, Temple Border"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-sans text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pallu & Border Styling
                </label>
                <input
                  type="text"
                  value={palluBorderDetails}
                  onChange={(e) => {
                    setPalluBorderDetails(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Contrast Korvai Temple Border with Rich Brocade Pallu"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-sans text-slate-900"
                />
              </div>
            </div>

            {/* Blouse Piece & Silk Mark Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              {/* Blouse Piece */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Blouse Piece Included</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHasBlousePiece(!hasBlousePiece);
                      setIsDirty(true);
                    }}
                    className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                      hasBlousePiece ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        hasBlousePiece ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {hasBlousePiece && (
                  <input
                    type="text"
                    value={blouseDetails}
                    onChange={(e) => {
                      setBlouseDetails(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Blouse color & length (e.g. Contrast 80cm)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-sans"
                  />
                )}
              </div>

              {/* Silk Mark Certificate */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Central Silk Board Certified
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSilkMarkCertified(!isSilkMarkCertified);
                      setIsDirty(true);
                    }}
                    className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                      isSilkMarkCertified ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isSilkMarkCertified ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {isSilkMarkCertified && (
                  <input
                    type="text"
                    value={silkMarkNumber}
                    onChange={(e) => {
                      setSilkMarkNumber(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Silk Mark Tag # (e.g. CSB-2026-MYS-8942)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: MEDIA ASSET STUDIO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>3. Media Asset Studio & Role Tagger</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {mediaImages.length} High-Res Frames
              </span>
            </div>

            {/* Images Grid with Role Taggers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {mediaImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-2 space-y-2 shadow-2xs"
                >
                  <div className="h-44 rounded-lg overflow-hidden relative bg-slate-200">
                    <img
                      src={img.url}
                      alt={`Saree View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-bold">
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-500 mb-0.5">
                      Asset Role Tag
                    </label>
                    <select
                      value={img.role}
                      onChange={(e) => {
                        const newImgs = [...mediaImages];
                        newImgs[idx].role = e.target.value;
                        setMediaImages(newImgs);
                        setIsDirty(true);
                      }}
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 font-medium"
                    >
                      <option value="Primary Drape">Primary Drape</option>
                      <option value="Pallu Close-up">Pallu Close-up</option>
                      <option value="Border Macro">Border Macro</option>
                      <option value="Blouse Piece">Blouse Piece</option>
                      <option value="Pleat View">Pleat View</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Drag and Drop Ingestion Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:border-blue-500 transition-colors cursor-pointer space-y-1">
              <Upload className="w-6 h-6 text-blue-600 mx-auto" />
              <p className="font-semibold text-xs text-slate-800">
                Drag and drop high-resolution saree photos (Up to 50MB)
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Recommended: 2000x2600 px studio drape lighting
              </p>
            </div>

            {/* Video Asset Uploader */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">
                    10-Second Real-Drape 4K Video Clip
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  Ready for AI Avatar
                </span>
              </div>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Video CDN URL (e.g. https://...)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-800"
              />
            </div>
          </div>

          {/* SECTION 4: SINGLE-PIECE & BATCH INVENTORY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2 pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>4. Single-Piece & Financials Matrix</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Master SKU *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => {
                    setSku(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loom Tag ID</label>
                <input
                  type="text"
                  value={loomTag}
                  onChange={(e) => {
                    setLoomTag(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => {
                    setHsnCode(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate</label>
                <select
                  value={gstRate}
                  onChange={(e) => {
                    setGstRate(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-800"
                >
                  <option value="5%">5% Handloom Silk GST</option>
                  <option value="12%">12% High-Value GST</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cost Price (₹ Internal)
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => {
                    setCostPrice(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={priceINR}
                  onChange={(e) => {
                    setPriceINR(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compare-at MRP (₹)
                </label>
                <input
                  type="number"
                  value={originalPriceINR}
                  onChange={(e) => {
                    setOriginalPriceINR(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Qty (Loom)
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center justify-between">
                <span>Calculated Storefront Discount:</span>
                <span className="font-bold">{discountPercent}% OFF MSRP</span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================== */}
        {/* RIGHT COLUMN (35% - Sticky Sidebar)            */}
        {/* ============================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. STATUS & CHANNELS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
              Status & Channels
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Storefront State
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-900"
              >
                <option value="ACTIVE">Active (Live on Website)</option>
                <option value="DRAFT">Draft (Internal Staging)</option>
                <option value="ARCHIVED">Archived (Sold Vault)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-sans">
              <label className="block font-semibold text-slate-700">Sales Channels</label>
              {[
                { key: 'onlineStore', label: 'Online Storefront' },
                { key: 'whatsAppCatalog', label: 'WhatsApp VIP Catalog' },
                { key: 'liveShopping', label: 'Live Video Shopping Studio' },
              ].map((c) => (
                <label key={c.key} className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={(channels as any)[c.key]}
                    onChange={(e) => {
                      setChannels({ ...channels, [c.key]: e.target.checked });
                      setIsDirty(true);
                    }}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. OCCASION & COLLECTIONS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Occasion Tags</span>
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {[
                'Bridal',
                'Muhurtham',
                'Grand Reception',
                'Festive Pooja',
                'Temple Votive',
                'Trousseau Curation',
              ].map((occ) => {
                const isSelected = occasions.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => {
                      setOccasions(
                        isSelected
                          ? occasions.filter((o) => o !== occ)
                          : [...occasions, occ]
                      );
                      setIsDirty(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. SHIPPING & DIMENSIONS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shipping & Weight</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Weight (Grams) *
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={weightGrams}
                    onChange={(e) => {
                      setWeightGrams(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-l-xl font-mono text-slate-900"
                  />
                  <span className="px-3 py-1.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-xl text-slate-500 font-mono">
                    g
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Used for real-time BlueDart air parcel billing
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Folded Dimensions (LxWxH)
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => {
                    setDimensions(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. SEO & SOCIAL GRAPH */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <span>SEO & Social Preview</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Meta Title</span>
                  <span className="text-[10px] font-mono text-slate-400">{metaTitle.length}/70</span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => {
                    setMetaTitle(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Meta Description</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => {
                    setMetaDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 leading-relaxed"
                />
              </div>

              {/* Google Search Card Snippet Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
                <div className="text-[11px] text-emerald-700 font-mono truncate">
                  https://neelsareehouse.com/products/{slug}
                </div>
                <div className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                  {metaTitle || title || 'Product Title Preview'}
                </div>
                <div className="text-[11px] text-slate-600 line-clamp-2">
                  {metaDescription || description.slice(0, 140) || 'Product meta description snippet preview...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper hook to find product
function useMemoProduct(productId?: string) {
  return React.useMemo(() => {
    if (!productId) return undefined;
    return products.find(
      (p) => p.id === productId || p.slug === productId || (p as any).sku === productId
    );
  }, [productId]);
}
