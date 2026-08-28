'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  Upload,
  Plus,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Archive,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Barcode,
  Tag,
  Layers,
  ChevronDown,
  MoreVertical,
  X,
  Check,
  Eye,
  EyeOff,
  Percent,
  IndianRupee,
  Package,
  Wand2,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Info,
} from 'lucide-react';
import { products, Product } from '@/lib/products';

// Extended Catalog Item Type
interface CatalogSaree {
  id: string;
  title: string;
  slug: string;
  sku: string;
  loomId: string;
  hsnCode: string;
  weave: string;
  fabric: string;
  zariType: string;
  priceINR: number;
  originalPriceINR: number;
  stock: number;
  hasAiAvatar: boolean;
  isActive: boolean;
  status: 'ACTIVE' | 'LOW_STOCK' | 'SINGLE_PIECE' | 'DRAFT' | 'ARCHIVED';
  images: string[];
  silkMarkNumber: string;
}

// Global in-memory cache for instant 0ms back-navigation and persistence
let adminCatalogCache: CatalogSaree[] | null = null;

export default function AdminCatalogPage() {
  const [catalog, setCatalog] = useState<CatalogSaree[]>(adminCatalogCache || []);
  const [isLoading, setIsLoading] = useState(!adminCatalogCache);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'ACTIVE' | 'LOW_STOCK' | 'SINGLE_PIECE' | 'DRAFT' | 'ARCHIVED'
  >('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredImage, setHoveredImage] = useState<{ src: string; x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          const formatted: CatalogSaree[] = data.products.map((p: any, idx: number) => {
            const firstVariant = p.product_variants?.[0] || {};
            const invData = Array.isArray(firstVariant.inventory) ? firstVariant.inventory[0] : firstVariant.inventory;
            const actualStock = invData ? Math.max(0, (invData.quantity || 0) - (invData.reserved_quantity || 0)) : 0;
            const weave = p.weavings?.name || 'Mysore Silk Crepe';
            const fabric = p.fabrics?.name || '100% Pure Mulberry Silk';
            const zari = p.zari_specifications?.name || 'Pure 24K Tested Zari';
            const priceINR = Math.round((p.base_selling_price_paise || 2850000) / 100);
            const mrpINR = Math.round((p.base_mrp_paise || 3200000) / 100);

            const mediaList = firstVariant.product_variant_media || [];
            const displayImages = mediaList.length > 0 ? mediaList.map((m: any) => m.url) : [
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
            ];

            return {
              id: p.id,
              title: p.title,
              slug: p.slug || p.id,
              sku: firstVariant.sku || `NSH-SKU-MYS-${10 + idx}`,
              loomId: `LOOM-KA-${10 + idx}`,
              hsnCode: '5007.20.10',
              weave,
              fabric,
              zariType: zari,
              priceINR,
              originalPriceINR: mrpINR,
              stock: actualStock,
              hasAiAvatar: true,
              isActive: p.is_published !== false,
              status: p.is_published ? (actualStock <= 3 && actualStock > 0 ? 'LOW_STOCK' : actualStock === 0 ? 'DRAFT' : 'ACTIVE') : 'DRAFT',
              images: displayImages,
              silkMarkNumber: `CSB-2026-MYS-${1000 + idx}`,
            };
          });
          adminCatalogCache = formatted;
          setCatalog(formatted);
        }
      })
      .catch((err) => console.error('Error loading live catalog products:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Modals
  const [editingSaree, setEditingSaree] = useState<CatalogSaree | null>(null);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isNewSareeModalOpen, setIsNewSareeModalOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Bulk Price Form State
  const [bulkPriceType, setBulkPriceType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [bulkPriceChange, setBulkPriceChange] = useState<number>(5);
  const [bulkPriceDirection, setBulkPriceDirection] = useState<'INCREASE' | 'DECREASE'>('INCREASE');

  // Bulk Category Form State
  const [bulkNewWeave, setBulkNewWeave] = useState('Mysore Silk');

  // New Saree Form State
  const [newSareeForm, setNewSareeForm] = useState({
    title: '',
    weave: 'Mysore Silk',
    fabric: '100% Pure Mulberry Silk',
    zariType: 'Pure Gold Zari' as CatalogSaree['zariType'],
    priceINR: 28500,
    originalPriceINR: 32000,
    stock: 3,
    silkMarkNumber: 'CSB-2026-MYS-889',
    hsnCode: '5007.20.10',
    hasAiAvatar: true,
    image: '',
  });

  // Filter Counts
  const counts = useMemo(() => {
    return {
      ALL: catalog.length,
      ACTIVE: catalog.filter((c) => c.isActive && c.status !== 'ARCHIVED').length,
      LOW_STOCK: catalog.filter((c) => c.stock > 0 && c.stock <= 2).length,
      SINGLE_PIECE: catalog.filter((c) => c.stock === 1).length,
      DRAFT: catalog.filter((c) => c.status === 'DRAFT').length,
      ARCHIVED: catalog.filter((c) => c.status === 'ARCHIVED').length,
    };
  }, [catalog]);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      // Tab Filter
      if (activeTab === 'ACTIVE' && (!item.isActive || item.status === 'ARCHIVED')) return false;
      if (activeTab === 'LOW_STOCK' && !(item.stock > 0 && item.stock <= 2)) return false;
      if (activeTab === 'SINGLE_PIECE' && item.stock !== 1) return false;
      if (activeTab === 'DRAFT' && item.status !== 'DRAFT') return false;
      if (activeTab === 'ARCHIVED' && item.status !== 'ARCHIVED') return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        const matches =
          item.title.toLowerCase().includes(cleanQ) ||
          item.sku.toLowerCase().includes(cleanQ) ||
          item.loomId.toLowerCase().includes(cleanQ) ||
          item.hsnCode.toLowerCase().includes(cleanQ) ||
          item.weave.toLowerCase().includes(cleanQ) ||
          item.silkMarkNumber.toLowerCase().includes(cleanQ);

        if (!matches) return false;
      }

      return true;
    });
  }, [catalog, activeTab, searchQuery]);

  // Multi-select handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredCatalog.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Inline Stock Update
  const handleStockChange = async (id: string, newStock: number) => {
    const validStock = Math.max(0, newStock);
    setCatalog((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus =
            validStock === 0
              ? 'DRAFT'
              : validStock <= 3
              ? 'LOW_STOCK'
              : 'ACTIVE';
          return { ...item, stock: validStock, status: newStatus };
        }
        return item;
      })
    );

    try {
      const targetItem = catalog.find((i) => i.id === id);
      await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: id,
          sku: targetItem?.sku,
          new_quantity: validStock,
        }),
      });
    } catch (err) {
      console.error('[Catalog] Error updating stock in database:', err);
    }
  };

  // Visibility Toggle
  const handleToggleVisibility = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  // Duplicate Saree
  const handleDuplicateSaree = (saree: CatalogSaree) => {
    const newId = `saree-dup-${Date.now()}`;
    const duplicated: CatalogSaree = {
      ...saree,
      id: newId,
      title: `${saree.title} (Copy)`,
      sku: `${saree.sku}-COPY`,
      slug: `${saree.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      status: 'DRAFT',
      isActive: false,
    };
    setCatalog((prev) => [duplicated, ...prev]);
    setActiveActionMenuId(null);
  };

  // Archive Saree
  const handleArchiveSaree = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'ARCHIVED', isActive: false } : item
      )
    );
    setActiveActionMenuId(null);
  };

  // Delete Saree
  const handleDeleteSaree = (id: string) => {
    setCatalog((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setActiveActionMenuId(null);
  };

  // Bulk Apply Price Change
  const handleApplyBulkPrice = () => {
    setCatalog((prev) =>
      prev.map((item) => {
        if (!selectedIds.includes(item.id)) return item;

        let delta = 0;
        if (bulkPriceType === 'PERCENT') {
          delta = Math.round(item.priceINR * (bulkPriceChange / 100));
        } else {
          delta = bulkPriceChange;
        }

        const newPrice =
          bulkPriceDirection === 'INCREASE'
            ? item.priceINR + delta
            : Math.max(1000, item.priceINR - delta);

        return { ...item, priceINR: newPrice };
      })
    );
    setIsBulkPriceModalOpen(false);
  };

  // Bulk Change Category
  const handleApplyBulkCategory = () => {
    setCatalog((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, weave: bulkNewWeave } : item
      )
    );
    setIsBulkCategoryModalOpen(false);
  };

  // Bulk Mark Out of Stock
  const handleBulkMarkOutOfStock = () => {
    setCatalog((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? { ...item, stock: 0, status: 'DRAFT', isActive: false }
          : item
      )
    );
    setSelectedIds([]);
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    try {
      await fetch(`/api/admin/products?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
    } catch (err) {
      console.error('[Catalog] Error deleting products:', err);
    }
    setCatalog((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Master SKU',
      'Title',
      'Weave',
      'Fabric',
      'Zari Type',
      'Selling Price INR',
      'MRP INR',
      'Available Stock',
      'Silk Mark #',
      'HSN Code',
      'Loom ID',
      'Active Status',
    ];

    const rows = filteredCatalog.map((c) => [
      `"${c.sku}"`,
      `"${c.title}"`,
      `"${c.weave}"`,
      `"${c.fabric}"`,
      `"${c.zariType}"`,
      c.priceINR,
      c.originalPriceINR,
      c.stock,
      `"${c.silkMarkNumber}"`,
      `"${c.hsnCode}"`,
      `"${c.loomId}"`,
      c.isActive ? 'Active' : 'Hidden',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NeelSareeHouse_Catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create New Saree
  const handleCreateNewSaree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSareeForm.title.trim()) return;

    const title = newSareeForm.title.trim();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const priceINR = Number(newSareeForm.priceINR);
    const originalPriceINR = Number(newSareeForm.originalPriceINR);
    const newSku = `NSH-SKU-${newSareeForm.weave.substring(0, 3).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description: `${newSareeForm.weave} woven in pure silk with ${newSareeForm.zariType}.`,
          base_mrp_inr: originalPriceINR,
          base_selling_price_inr: priceINR,
          sku: newSku,
          initial_stock: Number(newSareeForm.stock) || 10,
        }),
      });

      const data = await res.json();
      const newId = data.product_id || `saree-custom-${Date.now()}`;

      const newItem: CatalogSaree = {
        id: newId,
        title,
        slug,
        sku: newSku,
        loomId: `LOOM-KA-${Math.floor(30 + Math.random() * 20)}`,
        hsnCode: newSareeForm.hsnCode,
        weave: newSareeForm.weave,
        fabric: newSareeForm.fabric,
        zariType: newSareeForm.zariType as any,
        priceINR,
        originalPriceINR,
        stock: Number(newSareeForm.stock) || 10,
        hasAiAvatar: true,
        isActive: true,
        status: 'ACTIVE',
        images: [newSareeForm.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop'],
        silkMarkNumber: newSareeForm.silkMarkNumber,
      };

      setCatalog((prev) => [newItem, ...prev]);
      setIsNewSareeModalOpen(false);
    } catch (err) {
      console.error('[Catalog] Error creating product:', err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 select-none pb-24">
      {/* ================================================== */}
      {/* 1. HEADER & TOP ACTION BAR                         */}
      {/* ================================================== */}
      <div className="space-y-4">
        {/* Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Master Product Catalog
              </h1>
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                {counts.ALL} Master Handloom SKUs
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Magento-Class Dense Inventory Matrix with Silk Mark & AI Avatar Tracking
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <Link
              href="/admin/catalog/bulk-upload"
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Bulk Import Engine</span>
            </Link>

            <Link
              href="/admin/catalog/new"
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-200" />
              <span>+ Add New Saree</span>
            </Link>
          </div>
        </div>

        {/* Search Bar & Quick Filter Segment Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8DCC9] shadow-2xs">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Title, Master SKU, Loom ID, HSN, or Silk Mark #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF6F0] border border-[#E8DCC9] focus:bg-white focus:border-[#7A1C30] rounded-xl text-xs text-stone-900 focus:outline-none transition-colors font-medium"
            />
          </div>

          {/* Quick Segment Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: 'All', count: counts.ALL },
              { key: 'ACTIVE', label: 'Published', count: counts.ACTIVE },
              { key: 'LOW_STOCK', label: 'Low Stock (≤ 3)', count: counts.LOW_STOCK },
              { key: 'DRAFT', label: 'Drafts', count: counts.DRAFT },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-[#7A1C30] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    activeTab === tab.key
                      ? 'bg-[#5F1424] text-[#E2CE9F]'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. DENSE DATA TABLE (Magento-Class Grid)           */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-[#E8DCC9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="min-w-[900px] w-full text-left text-xs font-sans">
            <thead className="bg-[#FAF6F0] border-b border-[#E8DCC9] text-stone-700 font-mono text-[11px] uppercase">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredCatalog.length > 0 &&
                      selectedIds.length === filteredCatalog.length
                    }
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                </th>
                <th className="p-3 w-14">Media</th>
                <th className="p-3">Saree Name & SKU</th>
                <th className="p-3">Weave & Fabric</th>
                <th className="p-3">Zari Purity</th>
                <th className="p-3">Price & MRP</th>
                <th className="p-3 w-32">Available Stock</th>
                <th className="p-3 text-center">Visibility</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-100">
                    <td className="p-3 text-center"><div className="w-4 h-4 bg-stone-200 rounded mx-auto" /></td>
                    <td className="p-3"><div className="w-9 h-12 bg-stone-200 rounded" /></td>
                    <td className="p-3 space-y-1.5"><div className="w-36 h-3.5 bg-stone-300 rounded" /><div className="w-24 h-2.5 bg-stone-200 rounded" /></td>
                    <td className="p-3 space-y-1.5"><div className="w-28 h-3 bg-stone-200 rounded" /><div className="w-20 h-2.5 bg-stone-200 rounded" /></td>
                    <td className="p-3"><div className="w-24 h-3 bg-stone-200 rounded" /></td>
                    <td className="p-3"><div className="w-16 h-3 bg-stone-300 rounded" /></td>
                    <td className="p-3"><div className="w-20 h-6 bg-stone-200 rounded" /></td>
                    <td className="p-3 text-center"><div className="w-8 h-4 bg-stone-200 rounded-full mx-auto" /></td>
                    <td className="p-3 text-right"><div className="w-12 h-4 bg-stone-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No sarees match your catalog query.
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((saree) => {
                  const isSelected = selectedIds.includes(saree.id);
                  const discountPercent = saree.originalPriceINR
                    ? Math.round(
                        ((saree.originalPriceINR - saree.priceINR) /
                          saree.originalPriceINR) *
                          100
                      )
                    : 0;

                  return (
                    <tr
                      key={saree.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(saree.id)}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                      </td>

                      {/* Media 40px with Hover-Zoom Tooltip */}
                      <td className="p-3">
                        <div
                          className="w-10 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 relative cursor-pointer group"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredImage({
                              src: saree.images[0],
                              x: rect.right + 12,
                              y: rect.top - 40,
                            });
                          }}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <img
                            src={saree.images[0]}
                            alt={saree.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      </td>

                      {/* Saree Name & Master SKU */}
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {saree.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-slate-700">{saree.sku}</span>
                        </div>
                      </td>

                      {/* Weave & Fabric */}
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{saree.weave}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {saree.fabric}
                        </div>
                      </td>

                      {/* Zari Type */}
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            saree.zariType.toLowerCase().includes('24k') || saree.zariType.toLowerCase().includes('pure zari')
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : saree.zariType.toLowerCase().includes('silver')
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : saree.zariType.toLowerCase().includes('tested gold')
                              ? 'bg-yellow-50 text-yellow-900 border-yellow-300'
                              : saree.zariType.toLowerCase().includes('antique')
                              ? 'bg-orange-50 text-orange-900 border-orange-300'
                              : saree.zariType.toLowerCase().includes('copper')
                              ? 'bg-rose-50 text-rose-900 border-rose-300'
                              : saree.zariType.toLowerCase().includes('no zari') || saree.zariType.toLowerCase().includes('resham')
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                          }`}
                        >
                          {saree.zariType}
                        </span>
                      </td>

                      {/* Retail Price & MRP */}
                      <td className="p-3 font-mono">
                        <div className="font-bold text-slate-900">
                          ₹{saree.priceINR.toLocaleString('en-IN')}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="line-through">
                            ₹{saree.originalPriceINR.toLocaleString('en-IN')}
                          </span>
                          {discountPercent > 0 && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Available Stock (Inline Editable Counter) */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStockChange(saree.id, saree.stock - 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={saree.stock}
                            onChange={(e) =>
                              handleStockChange(saree.id, parseInt(e.target.value, 10) || 0)
                            }
                            className={`w-12 py-1 text-center font-mono font-bold text-xs rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              saree.stock === 0
                                ? 'bg-rose-50 border-rose-300 text-rose-700'
                                : saree.stock === 1
                                ? 'bg-amber-50 border-amber-300 text-amber-800'
                                : 'bg-white border-slate-200 text-slate-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleStockChange(saree.id, saree.stock + 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                        {saree.stock <= 3 && (
                          <span className={`text-[10px] font-mono block mt-0.5 ${saree.stock === 0 ? 'text-rose-600 font-bold' : 'text-amber-700 font-semibold'}`}>
                            {saree.stock === 0 ? 'Out of Stock' : 'Low Stock (≤ 3)'}
                          </span>
                        )}
                      </td>

                      {/* Visibility Switch */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(saree.id)}
                          className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                            saree.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                          title={saree.isActive ? 'Active on Storefront' : 'Hidden from Storefront'}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              saree.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions Context Menu */}
                      <td className="p-3 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${saree.slug}`}
                            target="_blank"
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="View Storefront PDP"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveActionMenuId(
                                activeActionMenuId === saree.id ? null : saree.id
                              )
                            }
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Action Menu Dropdown */}
                        {activeActionMenuId === saree.id && (
                          <div className="absolute right-3 top-10 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30 text-left text-xs font-sans space-y-0.5">
                            <Link
                              href={`/admin/catalog/${saree.id}/edit`}
                              className="w-full px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5 text-blue-600" />
                              <span>Full Specs Editor</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDuplicateSaree(saree)}
                              className="w-full px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <Copy className="w-3.5 h-3.5 text-purple-600" />
                              <span>Duplicate SKU</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleArchiveSaree(saree.id)}
                              className="w-full px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-600" />
                              <span>Archive to Vault</span>
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => handleDeleteSaree(saree.id)}
                              className="w-full px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete SKU</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>
            Showing {filteredCatalog.length} of {catalog.length} Handloom Masterpieces
          </span>
          <span>Mysore Royal Handloom Registry v2.4</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. FLOATING MULTI-SELECT ACTION BAR (>=1 Selected) */}
      {/* ================================================== */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 text-xs animate-fade-in">
          <div className="flex items-center gap-2 font-mono">
            <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded">
              {selectedIds.length} Selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkPriceModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Percent className="w-3.5 h-3.5 text-blue-400" />
              <span>Update Price</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkCategoryModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Weave</span>
            </button>

            <button
              type="button"
              onClick={handleBulkMarkOutOfStock}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Archive className="w-3.5 h-3.5 text-rose-400" />
              <span>Mark Out of Stock</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBarcodeModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Barcode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Barcode Labels</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="p-1 text-slate-400 hover:text-white"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. HOVER ZOOM IMAGE TOOLTIP                       */}
      {/* ================================================== */}
      {hoveredImage && (
        <div
          style={{ left: hoveredImage.x, top: hoveredImage.y }}
          className="fixed z-50 w-48 h-64 rounded-2xl bg-white p-1.5 shadow-2xl border border-slate-300 pointer-events-none animate-fade-in overflow-hidden"
        >
          <img
            src={hoveredImage.src}
            alt="Zoom Preview"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      )}

      {/* ================================================== */}
      {/* 5. MODAL: BULK PRICE UPDATE                       */}
      {/* ================================================== */}
      {isBulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Bulk Price Adjustment ({selectedIds.length} Sarees)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Action Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkPriceDirection('INCREASE')}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      bulkPriceDirection === 'INCREASE'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    + Increase Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkPriceDirection('DECREASE')}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      bulkPriceDirection === 'DECREASE'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    - Discount / Decrease
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Mode</label>
                  <select
                    value={bulkPriceType}
                    onChange={(e) => setBulkPriceType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Value</label>
                  <input
                    type="number"
                    value={bulkPriceChange}
                    onChange={(e) => setBulkPriceChange(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkPrice}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Apply Price Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. MODAL: BULK CATEGORY/WEAVE CHANGE               */}
      {/* ================================================== */}
      {isBulkCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Change Weave / Taxonomy ({selectedIds.length} Sarees)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select New Weave Tradition
                </label>
                <select
                  value={bulkNewWeave}
                  onChange={(e) => setBulkNewWeave(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="Mysore Silk">Mysore Silk</option>
                  <option value="Kanchipuram">Kanchipuram</option>
                  <option value="Banarasi">Banarasi</option>
                  <option value="Paithani">Paithani</option>
                  <option value="Chanderi">Chanderi</option>
                  <option value="Tissue Georgette">Tissue Georgette</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkCategoryModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkCategory}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                Update Weave Taxonomy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 7. MODAL: BARCODE LABELS (PDF PREVIEW)             */}
      {/* ================================================== */}
      {isBarcodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Print Thermal Barcode Labels (50mm x 25mm)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {catalog
                  .filter((c) => selectedIds.includes(c.id))
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-slate-300 bg-white space-y-1.5 shadow-2xs text-center"
                    >
                      <div className="font-bold text-[11px] text-slate-900 uppercase truncate">
                        NEEL SAREE HOUSE
                      </div>
                      <div className="text-[10px] font-mono text-slate-600 truncate">{c.title}</div>
                      {/* Simulated Barcode */}
                      <div className="h-8 bg-slate-900 mx-auto rounded flex items-center justify-center text-white text-[9px] font-mono tracking-[0.25em]">
                        ||| | || ||| | |||
                      </div>
                      <div className="flex justify-between text-[10px] font-mono font-bold pt-1">
                        <span>{c.sku}</span>
                        <span className="text-emerald-700">₹{c.priceINR.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-500">
                {selectedIds.length} labels ready to print
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBarcodeModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Barcode PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 8. MODAL: BULK IMPORT CSV                         */}
      {/* ================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Bulk Saree Catalog Import
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans text-center">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 space-y-2 hover:border-blue-500 transition-colors cursor-pointer bg-slate-50">
                <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                <p className="font-bold text-slate-800">Drag & Drop CSV / Excel Spreadsheet</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Supports .csv, .xlsx formatted with Silk Mark & SKU columns
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-slate-500">Need the template format?</span>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Download Sample CSV
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Upload & Ingest SKUs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 9. MODAL: ADD NEW SAREE FORM                      */}
      {/* ================================================== */}
      {isNewSareeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-sans">
                    Register New Handloom Saree SKU
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    Central Silk Board & Loom Guild Certified
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewSareeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSaree} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Saree Title / Masterpiece Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Wodeyar Vintage Gold Zari Crepe Silk"
                  value={newSareeForm.title}
                  onChange={(e) =>
                    setNewSareeForm({ ...newSareeForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Weave Tradition
                  </label>
                  <select
                    value={newSareeForm.weave}
                    onChange={(e) =>
                      setNewSareeForm({ ...newSareeForm, weave: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Mysore Silk">Mysore Silk</option>
                    <option value="Kanchipuram">Kanchipuram</option>
                    <option value="Banarasi">Banarasi</option>
                    <option value="Paithani">Paithani</option>
                    <option value="Chanderi">Chanderi</option>
                    <option value="Tissue Georgette">Tissue Georgette</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Zari Purity Grade
                  </label>
                  <select
                    value={newSareeForm.zariType}
                    onChange={(e) =>
                      setNewSareeForm({ ...newSareeForm, zariType: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="Pure Gold Zari">Pure Gold Zari (24K Tested)</option>
                    <option value="Tested Gold Zari">Tested Gold Zari</option>
                    <option value="Antiqued Silver Zari">Antiqued Silver Zari</option>
                    <option value="Tapestry Zari">Tapestry Zari</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newSareeForm.priceINR}
                    onChange={(e) =>
                      setNewSareeForm({ ...newSareeForm, priceINR: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={newSareeForm.originalPriceINR}
                    onChange={(e) =>
                      setNewSareeForm({
                        ...newSareeForm,
                        originalPriceINR: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={newSareeForm.stock}
                    onChange={(e) =>
                      setNewSareeForm({ ...newSareeForm, stock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Silk Mark Certificate #
                  </label>
                  <input
                    type="text"
                    value={newSareeForm.silkMarkNumber}
                    onChange={(e) =>
                      setNewSareeForm({ ...newSareeForm, silkMarkNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={newSareeForm.hsnCode}
                    onChange={(e) =>
                      setNewSareeForm({ ...newSareeForm, hsnCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Upload Saree Photo (File / Asset)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewSareeForm({ ...newSareeForm, image: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {newSareeForm.image && (
                    <img
                      src={newSareeForm.image}
                      alt="Preview"
                      className="w-10 h-12 object-cover rounded-lg border border-slate-300"
                    />
                  )}
                </div>
              </div>

              <div className="px-0 pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSareeModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSareeForm.title.trim() || !newSareeForm.priceINR}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Register Master Saree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 10. MODAL: EDIT SAREE SPECS                       */}
      {/* ================================================== */}
      {editingSaree && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Edit Saree SKU ({editingSaree.sku})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingSaree(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Saree Title</label>
                <input
                  type="text"
                  value={editingSaree.title}
                  onChange={(e) =>
                    setEditingSaree({ ...editingSaree, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editingSaree.priceINR}
                    onChange={(e) =>
                      setEditingSaree({
                        ...editingSaree,
                        priceINR: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={editingSaree.originalPriceINR}
                    onChange={(e) =>
                      setEditingSaree({
                        ...editingSaree,
                        originalPriceINR: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingSaree.stock}
                    onChange={(e) =>
                      setEditingSaree({
                        ...editingSaree,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Silk Mark #</label>
                  <input
                    type="text"
                    value={editingSaree.silkMarkNumber}
                    onChange={(e) =>
                      setEditingSaree({
                        ...editingSaree,
                        silkMarkNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSaree(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCatalog((prev) =>
                    prev.map((item) => (item.id === editingSaree.id ? editingSaree : item))
                  );
                  setEditingSaree(null);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
