'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Plus,
  Trash2,
  Tag,
  ShieldCheck,
  Info,
  CheckCircle2,
  X,
  Sparkles,
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface ProductEditorFormProps {
  mode: 'create' | 'edit';
  productId?: string;
}

// Code128 Barcode Visual SVG Generator Component
const Code128BarcodeVisual = ({ value }: { value: string }) => {
  const bars = useMemo(() => {
    const pattern: number[] = [2, 1, 1, 2, 3, 2, 1, 1, 2, 2, 1, 3];
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      pattern.push((charCode % 3) + 1, ((charCode * 2) % 4) + 1, (charCode % 2) + 1);
    }
    pattern.push(2, 3, 3, 1, 1, 1, 2);
    return pattern;
  }, [value]);

  return (
    <div className="bg-white p-2.5 rounded-xl border border-amber-300 flex flex-col items-center justify-center space-y-1 shadow-2xs">
      <svg className="h-9 w-full max-w-[220px]" viewBox="0 0 160 36" preserveAspectRatio="none">
        {bars.map((width, idx) => {
          const isBlack = idx % 2 === 0;
          const x = bars.slice(0, idx).reduce((acc, w) => acc + w * 1.8, 4);
          return isBlack ? (
            <rect key={idx} x={x} y={0} width={width * 1.5} height={36} fill="#1F1B16" />
          ) : null;
        })}
      </svg>
      <span className="font-mono text-[11px] font-bold text-amber-950 tracking-widest">{value}</span>
    </div>
  );
};

export default function ProductEditorForm({ mode, productId }: ProductEditorFormProps) {
  const router = useRouter();

  // Loading state for edit mode to prevent showing dummy data
  const [isLoading, setIsLoading] = useState(mode === 'edit');

  // Auto-generated SKU and Barcode for new items (NSH-SKU-[WEAVE_CODE]-[SEQ])
  const autoSku = `NSH-SKU-MYS-${Math.floor(10 + Math.random() * 90)}`;
  const autoBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;

  // Form State: System Identifiers (Read-Only)
  const [sku, setSku] = useState(autoSku);
  const [barcode, setBarcode] = useState(autoBarcode);

  // Form State: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Form State: Weaving & Fabric Specs
  const [weave, setWeave] = useState('Mysore Silk');
  const [fabricOptions, setFabricOptions] = useState<string[]>([
    'Pure Mulberry Silk',
    'Soft Silk',
    'Raw Silk',
    'Crepe Silk',
    'Georgette',
    'Tissue Silk',
    'Tussar Silk',
    'Organza',
    'Pure Katan Silk',
    'Chanderi Silk',
  ]);
  const [fabric, setFabric] = useState('Pure Mulberry Silk');
  const [isAddingNewFabric, setIsAddingNewFabric] = useState(false);
  const [newFabricInput, setNewFabricInput] = useState('');
  const [isFabricDropdownOpen, setIsFabricDropdownOpen] = useState(false);

  const [zariOptions, setZariOptions] = useState<string[]>([
    'Pure 24K Tested Zari',
    'Tested Gold Zari',
    'Silver Tested Zari',
    'Pure Zari Thread Interlock',
    'Antique Gold Zari',
    'Copper Zari Weave',
    'No Zari / Resham Threadwork',
  ]);
  const [zariSpec, setZariSpec] = useState('Pure 24K Tested Zari');
  const [isAddingNewZari, setIsAddingNewZari] = useState(false);
  const [newZariInput, setNewZariInput] = useState('');
  const [isZariDropdownOpen, setIsZariDropdownOpen] = useState(false);

  // Form State: Motif & Heritage Pattern Selection
  const [patternOptions, setPatternOptions] = useState<string[]>([
    'Kasuti Diamonds',
    'Peacock Mayil & Yanai',
    'Temple Korvai Border',
    'Floral Kadwa Meenakari',
    'Asawali Floral Vines',
    'Ashrafi Bootas',
    'Jacquard Zari Butta',
    'Temple Border',
  ]);
  const [pattern, setPattern] = useState('Kasuti Diamonds');
  const [isAddingNewPattern, setIsAddingNewPattern] = useState(false);
  const [newPatternInput, setNewPatternInput] = useState('');
  const [isPatternDropdownOpen, setIsPatternDropdownOpen] = useState(false);

  // Form State: Color Variant Management (BFS-1 §6.3 & DSS §4)
  const SAREE_COLOR_PALETTE = [
    { name: 'Royal Crimson', hex: '#8B1E28', code: 'CRM' },
    { name: 'Peacock Teal', hex: '#005F73', code: 'TEL' },
    { name: 'Kanchipuram Gold', hex: '#D97706', code: 'GLD' },
    { name: 'Rani Pink', hex: '#BE185D', code: 'PNK' },
    { name: 'Bottle Green', hex: '#065F46', code: 'GRN' },
    { name: 'Midnight Blue', hex: '#1E3A8A', code: 'BLU' },
    { name: 'Mustard Yellow', hex: '#B45309', code: 'YEL' },
    { name: 'Deep Violet', hex: '#5B21B6', code: 'VIO' },
    { name: 'Ivory White', hex: '#F5F5F4', code: 'IVR' },
  ];

  const [colorVariants, setColorVariants] = useState<
    { id: string; name: string; hex: string; sku: string; stockCount: number; images: [string, string, string] }[]
  >([
    {
      id: 'var-1',
      name: 'Royal Crimson',
      hex: '#8B1E28',
      sku: `${autoSku}-CRM`,
      stockCount: 1,
      images: ['', '', ''],
    },
  ]);

  // Form State: Occasions (Multi-Select Tags)
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const availableOccasions = [
    'Bridal',
    'Muhurtham',
    'Grand Reception',
    'Sangeet',
    'Festive',
    'Cocktail Soirée',
  ];

  // Form State: Special Marketing Badges & Tags
  const [selectedBadges, setSelectedBadges] = useState<string[]>(mode === 'create' ? ['New Arrival'] : []);
  const [availableBadges, setAvailableBadges] = useState<string[]>([
    'Best Seller',
    'New Arrival',
    'Limited Edition',
    'Silk Mark Certified',
    'Heirloom Heritage',
    'Vault Masterpiece',
  ]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Form State: Pricing & Financials (Order: Cost Price -> MRP -> Selling Price -> Stock)
  const [costPrice, setCostPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [gstRate, setGstRate] = useState('18');
  const [hsnCode, setHsnCode] = useState('5007');

  // Form State: Blouse & Physical Dimensions
  const [hasBlousePiece, setHasBlousePiece] = useState(true);
  const [blouseLength, setBlouseLength] = useState('0.80m');
  const [blouseWidth, setBlouseWidth] = useState('1.14m');
  const [sareeLength, setSareeLength] = useState('5.5m');
  const [sareeWidth, setSareeWidth] = useState('1.14m');
  const [packageWeight, setPackageWeight] = useState('680g');
  const [packageDimensions, setPackageDimensions] = useState('38 x 28 x 4 cm');

  // Form State: Certification & Status
  const [isSilkMarkCertified, setIsSilkMarkCertified] = useState(true);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  // Media Images
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Save / UI States
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Populate data in edit mode from Supabase or static product store
  useEffect(() => {
    async function fetchProductDetails() {
      if (mode !== 'edit' || !productId) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`);
        const data = await res.json();
        const found = data.product || (data.products && Array.isArray(data.products) ? data.products.find((p: any) => p.id === productId || p.slug === productId) : null);
        if (found) {
          const mainVariant = found.product_variants?.[0];
          const dbVariants = found.product_variants || [];

          // Extract all live images across all variants
          const allMediaUrls: string[] = [];
          dbVariants.forEach((v: any) => {
            if (Array.isArray(v.product_variant_media)) {
              v.product_variant_media.forEach((m: any) => {
                if (m.url && !allMediaUrls.includes(m.url)) {
                  allMediaUrls.push(m.url);
                }
              });
            }
          });

          if (dbVariants.length > 0) {
            const mappedColorVars = dbVariants.map((v: any, vIdx: number) => {
              const inv = Array.isArray(v.inventory) ? v.inventory[0] : v.inventory;
              const actualStock = inv && typeof inv.quantity === 'number' ? inv.quantity : 1;

              const mediaList = Array.isArray(v.product_variant_media) ? v.product_variant_media : [];
              const sortedMedia = [...mediaList].sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
              const vImgs = sortedMedia.map((m: any) => m.url || '').filter(Boolean);

              return {
                id: v.id || `var-${vIdx + 1}`,
                name: v.colors?.name || 'Royal Crimson',
                hex: v.colors?.hex_code || '#8B1E28',
                sku: v.sku || `NSH-SKU-${(found.slug || 'SAREE').toUpperCase().slice(0, 8)}`,
                stockCount: actualStock,
                images: [
                  vImgs[0] || '',
                  vImgs[1] || '',
                  vImgs[2] || '',
                ] as [string, string, string],
              };
            });
            setColorVariants(mappedColorVars);
          }

          let parsedMeta: any = {};
          if (found.care_instructions) {
            try {
              parsedMeta = JSON.parse(found.care_instructions);
            } catch (e) {}
          }

          setTitle(found.title || '');
          setDescription(found.description || '');
          setWeave(found.weavings?.name || 'Mysore Silk');
          if (found.fabrics?.name) setFabric(found.fabrics.name);
          if (found.zari_specifications?.name) setZariSpec(found.zari_specifications.name);
          if (found.patterns?.name) setPattern(found.patterns.name);

          // Restore multi-occasions
          const restoredOccasions: string[] = [];
          if (found.occasions?.name) restoredOccasions.push(found.occasions.name);
          if (parsedMeta.occasions && Array.isArray(parsedMeta.occasions)) {
            parsedMeta.occasions.forEach((o: string) => {
              if (o && !restoredOccasions.includes(o)) restoredOccasions.push(o);
            });
          }
          if (restoredOccasions.length > 0) setSelectedOccasions(restoredOccasions);

          // Restore special badges
          if (parsedMeta.badges && Array.isArray(parsedMeta.badges)) {
            setSelectedBadges(parsedMeta.badges);
          }

          setSellingPrice(String(Math.round((found.base_selling_price_paise || 0) / 100)));
          setMrp(String(Math.round((found.base_mrp_paise || 0) / 100)));
          setCostPrice(String(Math.round(((found.base_selling_price_paise || 0) / 100) * 0.65)));
          setStock(String(mainVariant?.inventory?.[0]?.quantity || 1));

          const fixedSku = mainVariant?.sku || `NSH-SKU-${found.id.slice(0, 6).toUpperCase()}`;
          const fixedBarcode = `890${found.id.replace(/[^0-9]/g, '').slice(0, 9).padEnd(9, '5')}`;
          setSku(fixedSku);
          setBarcode(fixedBarcode);

          if (allMediaUrls.length > 0) {
            setImages(allMediaUrls);
          }
        }
      } catch (err) {
        console.error('[Product Editor] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetails();
  }, [mode, productId]);

  // Calculated Discount Percent
  const discountPercent = mrp && sellingPrice
    ? Math.max(0, Math.round(((Number(mrp) - Number(sellingPrice)) / Number(mrp)) * 100))
    : 0;

  // Toggle Occasion Tag
  const toggleOccasion = (occ: string) => {
    if (selectedOccasions.includes(occ)) {
      setSelectedOccasions(selectedOccasions.filter((o) => o !== occ));
    } else {
      setSelectedOccasions([...selectedOccasions, occ]);
    }
    setIsDirty(true);
  };

  // Toggle Special Badge Tag
  const toggleBadge = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
    setIsDirty(true);
  };

  // Add Custom Badge Action
  const handleAddCustomBadge = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!availableBadges.includes(trimmed)) {
      setAvailableBadges([...availableBadges, trimmed]);
    }
    if (!selectedBadges.includes(trimmed)) {
      setSelectedBadges([...selectedBadges, trimmed]);
    }
    setCustomTagInput('');
    setIsDirty(true);
  };

  // Add Image URL
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
    setIsDirty(true);
  };

  // Handle Multi-File Local Upload (Instant Data URL Preview)
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setImages((prev) => [...prev, base64Url]);
          setIsDirty(true);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Save / Publish Action
  const handleSave = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    // 1. Title & Weave
    if (!title || !title.trim()) {
      alert('Validation Error: Saree Title / Product Name is mandatory.');
      return;
    }
    if (!weave || !weave.trim()) {
      alert('Validation Error: Weave Tradition is mandatory.');
      return;
    }

    // 2. Pricing & Financials (All mandatory)
    if (!costPrice || Number(costPrice) <= 0) {
      alert('Validation Error: Cost Price (Internal) is mandatory and must be greater than ₹0.');
      return;
    }
    if (!mrp || Number(mrp) <= 0) {
      alert('Validation Error: MRP (₹) is mandatory and must be greater than ₹0.');
      return;
    }
    if (!sellingPrice || Number(sellingPrice) <= 0) {
      alert('Validation Error: Selling Price (₹) is mandatory and must be greater than ₹0.');
      return;
    }
    const primaryVariantStock = Number(colorVariants[0]?.stockCount ?? 1);
    if (isNaN(primaryVariantStock) || primaryVariantStock < 0) {
      alert('Validation Error: Physical Stock in Color Variant Management is mandatory and cannot be negative.');
      return;
    }
    if (!hsnCode || !hsnCode.trim()) {
      alert('Validation Error: HSN Code is mandatory.');
      return;
    }
    if (!gstRate || !gstRate.trim()) {
      alert('Validation Error: GST Rate (%) is mandatory.');
      return;
    }

    // 3. Weaving & Fabric Specifications (All mandatory)
    if (!fabric || !fabric.trim()) {
      alert('Validation Error: Fabric Specification is mandatory.');
      return;
    }
    if (!zariSpec || !zariSpec.trim()) {
      alert('Validation Error: Zari Specification is mandatory.');
      return;
    }
    if (!pattern || !pattern.trim()) {
      alert('Validation Error: Heritage Motif & Pattern is mandatory.');
      return;
    }

    // 4. Images (Strictly from Color Variant Management: At least 1 image and max 3 images)
    const allImagesList = (colorVariants[0]?.images || colorVariants.flatMap((v) => v.images || []))
      .filter((url) => typeof url === 'string' && url.trim().length > 5);

    if (allImagesList.length === 0) {
      alert('Validation Error: Please upload at least 1 drape image (Primary Drape) in Color Variant Management.');
      return;
    }
    if (allImagesList.length > 3) {
      alert('Validation Error: Maximum 3 images are allowed per saree creation.');
      return;
    }

    // 5. Tags (At least 1 tag each)
    if (selectedOccasions.length === 0) {
      alert('Validation Error: Please select at least one Occasion & Wearability tag.');
      return;
    }
    if (selectedBadges.length === 0) {
      alert('Validation Error: Please select at least one Special Marketing Badge (e.g. New Arrival).');
      return;
    }

    // 6. Blouse & Physical Dimensions (All mandatory)
    if (hasBlousePiece) {
      if (!blouseLength || !blouseLength.trim()) {
        alert('Validation Error: Blouse Length is mandatory when Blouse Piece is included.');
        return;
      }
      if (!blouseWidth || !blouseWidth.trim()) {
        alert('Validation Error: Blouse Width is mandatory when Blouse Piece is included.');
        return;
      }
    }
    if (!sareeLength || !sareeLength.trim()) {
      alert('Validation Error: Saree Length is mandatory.');
      return;
    }
    if (!sareeWidth || !sareeWidth.trim()) {
      alert('Validation Error: Saree Width is mandatory.');
      return;
    }
    if (!packageWeight || !packageWeight.trim()) {
      alert('Validation Error: Package Dead Weight is mandatory.');
      return;
    }
    if (!packageDimensions || !packageDimensions.trim()) {
      alert('Validation Error: Package Dimensions (L x W x H) are mandatory.');
      return;
    }

    setIsSaving(true);

    const updatedProductPayload = {
      id: productId,
      title: title.trim() || 'Untitled Saree Creation',
      slug: (title.trim() || 'saree').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: description.trim(),
      base_mrp_inr: Number(mrp) || Number(sellingPrice || 28000) * 1.18,
      base_selling_price_inr: Number(sellingPrice) || 28000,
      sku: sku || `NSH-SKU-MYS-${Math.floor(10 + Math.random() * 90)}`,
      weave,
      fabric,
      zari: zariSpec,
      pattern,
      occasion: selectedOccasions[0] || 'Bridal',
      occasions: selectedOccasions,
      badges: selectedBadges,
      color_name: colorVariants[0]?.name || 'Royal Crimson',
      color_hex: colorVariants[0]?.hex || '#8B1E28',
      initial_stock: primaryVariantStock,
      images: allImagesList,
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProductPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error('API save error:', errData);
      }
    } catch (err) {
      console.error('Error dispatching product save to API:', err);
    }

    setStatus(targetStatus);
    setIsSaving(false);
    setIsDirty(false);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      router.push('/admin/catalog');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-pulse max-w-6xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-200" />
            <div className="space-y-2">
              <div className="w-64 h-6 bg-stone-200 rounded-lg" />
              <div className="w-48 h-3 bg-stone-200 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-28 h-10 bg-stone-200 rounded-xl" />
            <div className="w-36 h-10 bg-stone-200 rounded-xl" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="w-32 h-4 bg-stone-200 rounded" />
              <div className="w-full h-10 bg-stone-100 rounded-xl" />
              <div className="w-full h-24 bg-stone-100 rounded-xl" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="w-32 h-4 bg-stone-200 rounded" />
              <div className="grid grid-cols-4 gap-3">
                <div className="h-10 bg-stone-100 rounded-xl" />
                <div className="h-10 bg-stone-100 rounded-xl" />
                <div className="h-10 bg-stone-100 rounded-xl" />
                <div className="h-10 bg-stone-100 rounded-xl" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="w-32 h-4 bg-stone-200 rounded" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-28 bg-stone-100 rounded-xl" />
                <div className="h-28 bg-stone-100 rounded-xl" />
                <div className="h-28 bg-stone-100 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="w-32 h-4 bg-stone-200 rounded" />
              <div className="flex flex-wrap gap-2">
                <div className="w-20 h-7 bg-stone-100 rounded-lg" />
                <div className="w-24 h-7 bg-stone-100 rounded-lg" />
                <div className="w-28 h-7 bg-stone-100 rounded-lg" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="w-32 h-4 bg-stone-200 rounded" />
              <div className="w-full h-32 bg-stone-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-[#7A1C30] text-white px-6 py-4 rounded-2xl shadow-2xl border border-amber-300/40 flex items-center gap-3 font-semibold text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-amber-300" />
          <span>Saree Masterpiece Details Saved Successfully! Redirecting to Catalog...</span>
        </div>
      )}

      {/* 1. TOP ACTION & STATUS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/catalog"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-white transition-colors shadow-2xs"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4 text-[#7A1C30]" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans truncate">
                {mode === 'create' ? 'Create Product SKU' : `Edit Product SKU (${sku})`}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {status === 'PUBLISHED' ? 'Published' : 'Draft / Unpublished'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Configure Product Metadata & Inventory Details
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave('DRAFT')}
            disabled={isSaving || !title.trim() || !sellingPrice}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save as Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave('PUBLISHED')}
            disabled={isSaving || !title.trim() || !sellingPrice}
            className="px-5 py-2 rounded-xl bg-[#7A1C30] hover:bg-[#601625] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-4 h-4 text-amber-200" />
                <span>Save & Publish SKU</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. READ-ONLY SYSTEM IDENTIFIERS (SKU & VISUAL CODE128 BARCODE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold mb-1">
            System SKU (Read-Only & Immutable) *
          </label>
          <input
            type="text"
            readOnly
            value={sku}
            className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold text-amber-950 select-all cursor-default text-xs"
          />
          <p className="text-[10px] text-amber-800 font-mono mt-1">Primary internal admin identifier</p>
        </div>

        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold mb-1">
            Scannable Internal Barcode (Code128 Format) *
          </label>
          <Code128BarcodeVisual value={barcode} />
        </div>
      </div>

      {/* 3. MAIN FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Details, Pricing, Weave Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Tag className="w-4 h-4 text-[#7A1C30]" />
              <span>Product Details</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Saree Title / Product Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="e.g. Kanchipuram Heavy Korvai Gold Brocade Silk Saree"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A1C30]"
              />
            </div>

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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
              >
                <option value="Mysore Silk">Mysore Silk</option>
                <option value="Kanchipuram">Kanchipuram</option>
                <option value="Banarasi">Banarasi</option>
                <option value="Paithani">Paithani</option>
                <option value="Patola">Patola</option>
                <option value="Tissue Georgette">Tissue Georgette</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Craftsmanship details, weaving notes, pallu design..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A1C30] resize-y"
              />
            </div>
          </div>

          {/* Pricing & Financials (Exact Order: Cost Price (Internal) -> MRP -> Selling Price -> Stock) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Info className="w-4 h-4 text-[#7A1C30]" />
              <span>Pricing & Financials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <span>Cost Price (Internal) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="text"
                    required
                    value={costPrice ? Number(costPrice).toLocaleString('en-IN') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setCostPrice(raw);
                      setIsDirty(true);
                    }}
                    placeholder="18,500"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A1C30]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">MRP (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="text"
                    required
                    value={mrp ? Number(mrp).toLocaleString('en-IN') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setMrp(raw);
                      setIsDirty(true);
                    }}
                    placeholder="34,000"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A1C30]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Selling Price (₹) *</label>
                  {discountPercent > 0 && (
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="text"
                    required
                    value={sellingPrice ? Number(sellingPrice).toLocaleString('en-IN') : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setSellingPrice(raw);
                      setIsDirty(true);
                    }}
                    placeholder="28,000"
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7A1C30]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code *</label>
                <input
                  type="text"
                  required
                  value={hsnCode}
                  onChange={(e) => {
                    setHsnCode(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="5007 (Pure Silk Handloom)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate (%) *</label>
                <input
                  type="number"
                  required
                  value={gstRate}
                  onChange={(e) => {
                    setGstRate(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Weaving & Fabric Specs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-[#7A1C30]" />
              <span>Weaving & Fabric Specifications</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: Custom Fabric Selection Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-semibold text-slate-700">Fabric Specification *</label>
                {!isAddingNewFabric ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFabricDropdownOpen(!isFabricDropdownOpen);
                        setIsZariDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#FAF6F0] hover:bg-[#F5ECE0] border border-[#E8DCC9] rounded-xl text-xs font-bold text-[#1F1B16] flex items-center justify-between transition-all shadow-2xs cursor-pointer group"
                    >
                      <span className="truncate">{fabric}</span>
                      <ChevronDown className={`w-4 h-4 text-[#7A1C30] transition-transform ${isFabricDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isFabricDropdownOpen && (
                      <div
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        style={{ overscrollBehavior: 'contain' }}
                        className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#FAF6F0] border border-[#E8DCC9] rounded-2xl shadow-xl p-1.5 space-y-0.5 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewFabric(true);
                            setIsFabricDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-[#7A1C30] hover:bg-[#F3E7CE] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add New Fabric Category...</span>
                        </button>

                        {/* Subtle Horizontal Divider Line (Per Reference Image) */}
                        <div className="my-1 border-b border-[#E8DCC9]" />

                        <div
                          onWheel={(e) => e.stopPropagation()}
                          style={{ overscrollBehavior: 'contain' }}
                          className="max-h-48 overflow-y-auto overscroll-contain touch-pan-y space-y-0.5 custom-scrollbar"
                        >
                          {fabricOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setFabric(opt);
                                setIsFabricDropdownOpen(false);
                                setIsDirty(true);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                                fabric === opt
                                  ? 'bg-[#7A1C30] text-white font-bold'
                                  : 'text-[#1F1B16] hover:bg-[#F5ECE0]'
                              }`}
                            >
                              <span>{opt}</span>
                              {fabric === opt && <CheckCircle2 className="w-3.5 h-3.5 text-[#E2CE9F]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newFabricInput}
                      onChange={(e) => setNewFabricInput(e.target.value)}
                      placeholder="Type custom fabric name..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newFabricInput.trim()) {
                          const val = newFabricInput.trim();
                          setFabricOptions([val, ...fabricOptions]);
                          setFabric(val);
                          setNewFabricInput('');
                          setIsDirty(true);
                        }
                        setIsAddingNewFabric(false);
                      }}
                      className="px-3.5 py-2 bg-[#7A1C30] hover:bg-[#5F1424] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewFabric(false)}
                      className="px-2.5 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Custom Zari Specification Dropdown */}
              <div className="space-y-1.5 relative">
                <label className="block text-xs font-semibold text-slate-700">Zari Specification *</label>
                {!isAddingNewZari ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsZariDropdownOpen(!isZariDropdownOpen);
                        setIsFabricDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 bg-[#FAF6F0] hover:bg-[#F5ECE0] border border-[#E8DCC9] rounded-xl text-xs font-bold text-[#1F1B16] flex items-center justify-between transition-all shadow-2xs cursor-pointer group"
                    >
                      <span className="truncate">{zariSpec}</span>
                      <ChevronDown className={`w-4 h-4 text-[#7A1C30] transition-transform ${isZariDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isZariDropdownOpen && (
                      <div
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        style={{ overscrollBehavior: 'contain' }}
                        className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#FAF6F0] border border-[#E8DCC9] rounded-2xl shadow-xl p-1.5 space-y-0.5 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewZari(true);
                            setIsZariDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-[#7A1C30] hover:bg-[#F3E7CE] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Add New Zari Specification...</span>
                        </button>

                        {/* Subtle Horizontal Divider Line (Per Reference Image) */}
                        <div className="my-1 border-b border-[#E8DCC9]" />

                        <div
                          onWheel={(e) => e.stopPropagation()}
                          style={{ overscrollBehavior: 'contain' }}
                          className="max-h-48 overflow-y-auto overscroll-contain touch-pan-y space-y-0.5 custom-scrollbar"
                        >
                          {zariOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setZariSpec(opt);
                                setIsZariDropdownOpen(false);
                                setIsDirty(true);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                                zariSpec === opt
                                  ? 'bg-[#7A1C30] text-white font-bold'
                                  : 'text-[#1F1B16] hover:bg-[#F5ECE0]'
                              }`}
                            >
                              <span>{opt}</span>
                              {zariSpec === opt && <CheckCircle2 className="w-3.5 h-3.5 text-[#E2CE9F]" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={newZariInput}
                      onChange={(e) => setNewZariInput(e.target.value)}
                      placeholder="Type custom zari spec..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newZariInput.trim()) {
                          const val = newZariInput.trim();
                          setZariOptions([val, ...zariOptions]);
                          setZariSpec(val);
                          setNewZariInput('');
                          setIsDirty(true);
                        }
                        setIsAddingNewZari(false);
                      }}
                      className="px-3.5 py-2 bg-[#7A1C30] hover:bg-[#5F1424] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewZari(false)}
                      className="px-2.5 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Motif & Heritage Pattern Selection */}
            <div className="space-y-1.5 relative pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">Heritage Motif & Pattern *</label>
              {!isAddingNewPattern ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPatternDropdownOpen(!isPatternDropdownOpen);
                      setIsFabricDropdownOpen(false);
                      setIsZariDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0] hover:bg-[#F5ECE0] border border-[#E8DCC9] rounded-xl text-xs font-bold text-[#1F1B16] flex items-center justify-between transition-all shadow-2xs cursor-pointer group"
                  >
                    <span className="truncate">{pattern}</span>
                    <ChevronDown className={`w-4 h-4 text-[#7A1C30] transition-transform ${isPatternDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isPatternDropdownOpen && (
                    <div
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      style={{ overscrollBehavior: 'contain' }}
                      className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#FAF6F0] border border-[#E8DCC9] rounded-2xl shadow-xl p-1.5 space-y-0.5 text-xs max-h-56 overflow-y-auto overscroll-contain touch-pan-y"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewPattern(true);
                          setIsPatternDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-[#7A1C30] hover:bg-[#F3E7CE] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add New Motif Pattern...</span>
                      </button>

                      {patternOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setPattern(opt);
                            setIsPatternDropdownOpen(false);
                            setIsDirty(true);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            pattern === opt ? 'bg-[#7A1C30] text-white font-bold' : 'text-stone-800 hover:bg-[#F5ECE0]'
                          }`}
                        >
                          <span className="truncate">{opt}</span>
                          {pattern === opt && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={newPatternInput}
                    onChange={(e) => setNewPatternInput(e.target.value)}
                    placeholder="Type custom motif pattern..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPatternInput.trim()) {
                        const val = newPatternInput.trim();
                        setPatternOptions([val, ...patternOptions]);
                        setPattern(val);
                        setNewPatternInput('');
                        setIsDirty(true);
                      }
                      setIsAddingNewPattern(false);
                    }}
                    className="px-3.5 py-2 bg-[#7A1C30] hover:bg-[#5F1424] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewPattern(false)}
                    className="px-2.5 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Color Variant Management Card (BFS-1 §6.3 & DSS §4 Compliant Redesign) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#7A1C30]" />
                  <span>Color Variant Management (BFS-1 §6.3)</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Select color palette chip, manage 3 drape photos per variant & auto-generated SKUs
                </p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                Master Product → Color Variants
              </span>
            </div>

            <div className="space-y-4">
              {colorVariants.map((varItem, idx) => (
                <div key={varItem.id} className="p-4 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-3">
                  {/* Top Row: Palette Picker Chips & Basic Specs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        Choose Color Palette Swatch *
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {SAREE_COLOR_PALETTE.map((pal) => {
                          const isSelected = varItem.hex === pal.hex;
                          return (
                            <button
                              key={pal.code}
                              type="button"
                              onClick={() => {
                                const updated = [...colorVariants];
                                updated[idx].hex = pal.hex;
                                updated[idx].name = pal.name;
                                updated[idx].sku = `${autoSku}-${pal.code}`;
                                setColorVariants(updated);
                                setIsDirty(true);
                              }}
                              className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                                isSelected ? 'border-[#7A1C30] scale-110 shadow-sm ring-2 ring-[#7A1C30]/20' : 'border-white shadow-2xs hover:scale-105'
                              }`}
                              style={{ backgroundColor: pal.hex }}
                              title={`${pal.name} (${pal.code})`}
                            >
                              {isSelected && <Check className={`w-3 h-3 ${pal.hex === '#F5F5F4' ? 'text-slate-800' : 'text-white'}`} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Color Name</label>
                        <input
                          type="text"
                          value={varItem.name}
                          onChange={(e) => {
                            const updated = [...colorVariants];
                            updated[idx].name = e.target.value;
                            setColorVariants(updated);
                            setIsDirty(true);
                          }}
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 w-36"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                          Variant SKU (Read-Only)
                        </label>
                        <input
                          type="text"
                          value={varItem.sku}
                          readOnly
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-100 font-mono font-bold text-slate-700 w-36 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Physical Stock</label>
                        <input
                          type="number"
                          value={varItem.stockCount}
                          onChange={(e) => {
                            const updated = [...colorVariants];
                            updated[idx].stockCount = parseInt(e.target.value, 10) || 0;
                            setColorVariants(updated);
                            setIsDirty(true);
                          }}
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900 w-20"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setColorVariants(colorVariants.filter((_, i) => i !== idx));
                          setIsDirty(true);
                        }}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors self-end mb-0.5"
                        title="Remove Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: 3 Variant Images (Primary Drape, Detail Zari, Pallu Shot) */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Variant Drape Images (Up to 3 Photos per Color Variant)</span>
                      <span className="text-slate-400">BFS-1 §6.3 Compliant</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Image 1 (Primary Drape)' },
                        { label: 'Image 2 (Weave / Zari Detail)' },
                        { label: 'Image 3 (Pallu / Border Detail)' },
                      ].map((slot, imgIdx) => (
                        <div key={imgIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 relative group">
                              {varItem.images[imgIdx] ? (
                                <>
                                  <img src={varItem.images[imgIdx]} alt={`Slot ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...colorVariants];
                                      const newImgs = [...updated[idx].images] as [string, string, string];
                                      newImgs[imgIdx] = '';
                                      updated[idx].images = newImgs;
                                      setColorVariants(updated);
                                      setIsDirty(true);
                                    }}
                                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    title="Remove Photo"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <span className="block text-[10px] font-semibold text-slate-700 truncate">{slot.label}</span>
                              <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1C30] hover:text-[#5F1424] bg-[#FAF3E4] hover:bg-[#F3E7CE] px-2.5 py-1 rounded-lg border border-[#C87F4A]/30 transition-colors">
                                <Plus className="w-3 h-3 text-[#7A1C30]" />
                                <span>{varItem.images[imgIdx] ? 'Change File' : 'Upload File'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const base64DataUrl = event.target?.result as string;
                                        if (base64DataUrl) {
                                          const updated = [...colorVariants];
                                          const newImgs = [...updated[idx].images] as [string, string, string];
                                          newImgs[imgIdx] = base64DataUrl;
                                          updated[idx].images = newImgs;
                                          setColorVariants(updated);
                                          setIsDirty(true);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setColorVariants([
                  ...colorVariants,
                  {
                    id: `var-${Date.now()}`,
                    name: 'Kanchipuram Gold',
                    hex: '#D97706',
                    sku: `${autoSku}-GLD`,
                    stockCount: 2,
                    images: ['', '', ''],
                  },
                ]);
                setIsDirty(true);
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#7A1C30]" />
              <span>+ Add Saree Color Variant</span>
            </button>
          </div>
        </div>

        {/* Right Column: Occasions, Special Badges, Blouse & Dimensions, Silk Mark, Media */}
        <div className="space-y-6">
          {/* Occasion Tags Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-[#7A1C30]" />
              <span>Occasions & Wearability *</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {availableOccasions.map((occ) => {
                const isSelected = selectedOccasions.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => toggleOccasion(occ)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#7A1C30] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {occ} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Marketing Badges & Custom Tags */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-[#7A1C30]" />
              <span>Special Marketing Badges *</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {availableBadges.map((badge) => {
                const isSelected = selectedBadges.includes(badge);
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => toggleBadge(badge)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {badge} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddCustomBadge} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                + Tag
              </button>
            </form>
          </div>

          {/* Blouse & Dimensions */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900">
                <input
                  type="checkbox"
                  checked={hasBlousePiece}
                  onChange={(e) => setHasBlousePiece(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7A1C30] focus:ring-[#7A1C30]"
                />
                <span>Blouse Piece Included</span>
              </label>
            </div>

            {hasBlousePiece && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Blouse Length *</label>
                  <input
                    type="text"
                    required={hasBlousePiece}
                    value={blouseLength}
                    onChange={(e) => setBlouseLength(e.target.value)}
                    placeholder="e.g. 0.80m"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Blouse Width *</label>
                  <input
                    type="text"
                    required={hasBlousePiece}
                    value={blouseWidth}
                    onChange={(e) => setBlouseWidth(e.target.value)}
                    placeholder="e.g. 1.14m"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Saree Length *</label>
                <input
                  type="text"
                  required
                  value={sareeLength}
                  onChange={(e) => setSareeLength(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Saree Width *</label>
                <input
                  type="text"
                  required
                  value={sareeWidth}
                  onChange={(e) => setSareeWidth(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Package Weight *</label>
                <input
                  type="text"
                  required
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Package Dimensions *</label>
                <input
                  type="text"
                  required
                  value={packageDimensions}
                  onChange={(e) => setPackageDimensions(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Central Silk Board Certification */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSilkMarkCertified}
                onChange={(e) => setIsSilkMarkCertified(e.target.checked)}
                className="w-4 h-4 rounded text-[#7A1C30] focus:ring-[#7A1C30]"
              />
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Central Silk Board Silk Mark Certified</span>
              </span>
            </label>
          </div>


        </div>
      </div>
    </div>
  );
}
