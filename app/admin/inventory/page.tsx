'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  Clock,
  History,
  ShieldCheck,
  Building,
  User,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  Check,
  HelpCircle,
  Tag,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  sku: string;
  title: string;
  weave: string;
  fabric: string;
  image: string;
  binLocation: string;
  loomBatch: string;
  costPrice: number;
  retailPrice: number;
  physicalStock: number;
  reservedStock: number;
  reorderPoint: number;
  silkMarkAuditId: string;
}

interface AuditLogRecord {
  id: string;
  timestamp: string;
  sku: string;
  title: string;
  delta: number;
  previousStock: number;
  newStock: number;
  reason: string;
  staffMember: string;
  notes?: string;
}

// In-Memory Module Cache for Instant Tab Switching
let cachedInventoryData: InventoryItem[] | null = null;

export default function InventoryMatrixPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(cachedInventoryData || []);
  const [loading, setLoading] = useState<boolean>(!cachedInventoryData);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'LOGS'>('MATRIX');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSegment, setFilterSegment] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'SINGLE_PIECE'>('ALL');
  const [weaveFilter, setWeaveFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.inventory && Array.isArray(data.inventory)) {
          const formatted: InventoryItem[] = data.inventory.map((inv: any, idx: number) => {
            const variant = inv.product_variants || {};
            const product = variant.products || {};
            const media = variant.product_variant_media || [];
            const primaryMedia = media.find((m: any) => m.is_primary) || media[0];
            const weave = product.weavings?.name || 'Mysore Silk';
            const fabric = product.fabrics?.name || 'Pure Mulberry Silk';
            const priceINR = Math.round((variant.price_paise || 2850000) / 100);
            const costINR = Math.round(priceINR * 0.65);

            return {
              id: inv.id || `inv-${idx}`,
              sku: variant.sku || `NSH-SKU-MYS-0${idx + 1}`,
              title: product.title || 'Pure Silk Handloom Saree',
              weave,
              fabric,
              image: primaryMedia?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
              binLocation: `Vault-${(product.slug || 'LOC').toUpperCase().slice(0, 4)}-${10 + idx}`,
              loomBatch: `LOOM-${(product.slug || 'KA').toUpperCase().slice(0, 4)}-${100 + idx}`,
              costPrice: costINR,
              retailPrice: priceINR,
              physicalStock: inv.quantity ?? 0,
              reservedStock: inv.reserved_quantity ?? 0,
              reorderPoint: 2,
              silkMarkAuditId: `CSB-2026-${(product.slug || 'MYS').toUpperCase().slice(0, 4)}-${1000 + idx}`,
            };
          });
          cachedInventoryData = formatted;
          setInventory(formatted);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching live inventory:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);


  // Modal State for stock adjustment
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustDirection, setAdjustDirection] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [adjustQuantity, setAdjustQuantity] = useState<string>('1');
  const [adjustReason, setAdjustReason] = useState<string>('Stock Count Reconcile');
  const [adjustNotes, setAdjustNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Summary KPIs Calculation
  const kpis = useMemo(() => {
    const totalPhysicalUnits = inventory.reduce((acc, it) => acc + it.physicalStock, 0);
    const totalReservedUnits = inventory.reduce((acc, it) => acc + it.reservedStock, 0);
    const valuationCost = inventory.reduce((acc, it) => acc + it.costPrice * it.physicalStock, 0);
    const valuationRetail = inventory.reduce((acc, it) => acc + it.retailPrice * it.physicalStock, 0);
    const outOfStockCount = inventory.filter((it) => it.physicalStock === 0).length;
    const lowStockCount = inventory.filter(
      (it) => it.physicalStock > 0 && it.physicalStock - it.reservedStock <= it.reorderPoint
    ).length;

    return {
      totalPhysicalUnits,
      totalReservedUnits,
      valuationCost,
      valuationRetail,
      outOfStockCount,
      lowStockCount,
    };
  }, [inventory]);

  // Filtered Matrix Rows
  const filteredItems = useMemo(() => {
    return inventory.filter((it) => {
      const ats = it.physicalStock - it.reservedStock;

      if (filterSegment === 'LOW_STOCK' && (ats > it.reorderPoint || it.physicalStock === 0)) return false;
      if (filterSegment === 'OUT_OF_STOCK' && it.physicalStock > 0) return false;
      if (filterSegment === 'SINGLE_PIECE' && it.physicalStock !== 1) return false;

      if (weaveFilter !== 'ALL' && it.weave !== weaveFilter) return false;

      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        const matches =
          it.sku.toLowerCase().includes(cleanQ) ||
          it.title.toLowerCase().includes(cleanQ) ||
          it.binLocation.toLowerCase().includes(cleanQ) ||
          it.loomBatch.toLowerCase().includes(cleanQ) ||
          it.silkMarkAuditId.toLowerCase().includes(cleanQ);

        if (!matches) return false;
      }

      return true;
    });
  }, [inventory, filterSegment, weaveFilter, searchQuery]);

  // Handle Stock Adjustment Confirmation
  const handleConfirmStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = Math.max(1, parseInt(adjustQuantity, 10) || 1);
    if (!adjustingItem) return;

    const delta = adjustDirection === 'INCREASE' ? qtyVal : -qtyVal;
    const previousStock = adjustingItem.physicalStock;
    const newStock = Math.max(0, previousStock + delta);

    // Update Inventory State
    setInventory((prev) =>
      prev.map((it) => (it.id === adjustingItem.id ? { ...it, physicalStock: newStock } : it))
    );

    try {
      await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: adjustingItem.sku,
          change_quantity: delta,
          reason: adjustReason,
        }),
      });
    } catch (err) {
      console.error('Error dispatching inventory adjustment to API:', err);
    }

    // Record in Audit Trail
    const newLog: AuditLogRecord = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      sku: adjustingItem.sku,
      title: adjustingItem.title,
      delta,
      previousStock,
      newStock,
      reason: adjustReason,
      staffMember: 'SuperAdmin Executive (Authenticated Session)',
      notes: adjustNotes.trim() || undefined,
    };
    setAuditLogs([newLog, ...auditLogs]);

    triggerToast(
      `Stock for ${adjustingItem.sku} adjusted by ${delta > 0 ? `+${delta}` : delta} units (${adjustReason}).`
    );
    setAdjustingItem(null);
    setAdjustQuantity('1');
    setAdjustNotes('');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Export Stock Ledger CSV
  const handleExportStockLedger = () => {
    const headers = [
      'Master SKU',
      'Saree Title',
      'Weave Tradition',
      'Bin Location',
      'Loom Batch',
      'Cost Price INR',
      'Retail Price INR',
      'Physical Stock',
      'Reserved Stock',
      'Available to Sell (ATS)',
      'Reorder Point',
      'Silk Mark ID',
    ];

    const rows = inventory.map((it) => [
      `"${it.sku}"`,
      `"${it.title}"`,
      `"${it.weave}"`,
      `"${it.binLocation}"`,
      `"${it.loomBatch}"`,
      it.costPrice,
      it.retailPrice,
      it.physicalStock,
      it.reservedStock,
      it.physicalStock - it.reservedStock,
      it.reorderPoint,
      `"${it.silkMarkAuditId}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NeelSareeHouse_Inventory_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="font-sans text-[#1F1B16] select-none pb-28 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
          <div>
            <div className="h-7 w-64 bg-[#E8DCC9]/40 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-96 bg-[#E8DCC9]/20 rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-[#E8DCC9]/40 rounded-xl animate-pulse" />
        </div>

        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-3">
              <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
              <div className="h-8 w-16 bg-stone-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Skeleton Table */}
        <div className="bg-white rounded-2xl border border-[#E8DCC9] shadow-2xs p-6 space-y-4">
          <div className="h-10 w-full bg-stone-100 rounded-xl animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 w-full bg-stone-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#1F1B16] select-none pb-28 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#18110E] text-[#FAF3E4] px-5 py-3 rounded-2xl shadow-2xl border border-[#C87F4A]/30 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. TOP HEADER & BREADCRUMBS                        */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Inventory Control Matrix
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#7A1C30]" />
              <span>Silk Mark Central Vault</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Physical Warehouse Bins, Loom Batches & Real-Time Stock Ledger
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportStockLedger}
            className="px-3 py-1.5 rounded-lg border border-[#E8DCC9] bg-white hover:bg-[#FAF6F0] text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#7A1C30]" />
            <span>Export Stock Ledger (CSV)</span>
          </button>

          <Link
            href="/admin/catalog/new"
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-200" />
            <span>Register New Saree</span>
          </Link>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. INVENTORY SUMMARY KPIs                          */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Units on Hand */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Total Units on Hand</span>
            <Package className="w-4 h-4 text-[#7A1C30]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
              {kpis.totalPhysicalUnits}
            </span>
            <span className="text-[11px] font-mono text-stone-500">Physical Units</span>
          </div>
          <div className="text-[11px] font-mono text-amber-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{kpis.totalReservedUnits} Units committed to open orders</span>
          </div>
        </div>

        {/* KPI 2: Inventory Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Inventory Valuation</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
              ₹{(kpis.valuationRetail / 100000).toFixed(1)}L
            </span>
            <span className="text-[11px] font-mono text-stone-500">at Retail</span>
          </div>
          <div className="text-[11px] font-mono text-stone-500">
            Cost Valuation: <strong className="text-stone-800">₹{(kpis.valuationCost / 100000).toFixed(1)}L</strong>
          </div>
        </div>

        {/* KPI 3: Low Stock SKUs */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-700 text-xs font-mono">
            <span>Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-800 tracking-tight">
              {kpis.lowStockCount}
            </span>
            <span className="text-[11px] font-mono text-stone-500">SKUs ≤ Reorder Point</span>
          </div>
          <div className="text-[11px] font-mono text-amber-700">
            Loom re-order trigger activated
          </div>
        </div>

        {/* KPI 4: Out of Stock SKUs */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 bg-rose-50/40 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-rose-700 text-xs font-mono">
            <span>Out of Stock</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-800 tracking-tight">
              {kpis.outOfStockCount}
            </span>
            <span className="text-[11px] font-mono text-stone-500">Loom SKUs at 0</span>
          </div>
          <div className="text-[11px] font-mono text-rose-700">
            Archived to Vault / In Re-Weave
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. TABS (MATRIX vs AUDIT LOGS)                     */}
      {/* ================================================== */}
      <div className="flex items-center justify-between border-b border-[#E8DCC9] pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('MATRIX')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'MATRIX'
                ? 'bg-[#7A1C30] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Live Stock Matrix ({inventory.length} SKUs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'LOGS'
                ? 'bg-[#7A1C30] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail & Logs ({auditLogs.length} Events)</span>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. TAB CONTENT 1: LIVE STOCK MATRIX TABLE          */}
      {/* ================================================== */}
      {activeTab === 'MATRIX' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search SKU, Saree Title, Bin #, Loom Batch, or Silk Mark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF6F0] border border-[#E8DCC9] focus:bg-white focus:border-[#7A1C30] rounded-xl text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                  Weave:
                </span>
                <select
                  value={weaveFilter}
                  onChange={(e) => setWeaveFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#FAF6F0] border border-[#E8DCC9] rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:border-[#7A1C30]"
                >
                  <option value="ALL">All Weave Traditions</option>
                  <option value="Mysore Silk">Mysore Silk</option>
                  <option value="Kanchipuram">Kanchipuram</option>
                  <option value="Banarasi">Banarasi</option>
                  <option value="Paithani">Paithani</option>
                  <option value="Patola">Patola</option>
                  <option value="Tissue Georgette">Tissue Georgette</option>
                </select>
              </div>
            </div>

            {/* Quick Segment Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
              {[
                { key: 'ALL', label: 'All Items', count: inventory.length },
                { key: 'LOW_STOCK', label: 'Low Stock (≤ 3)', count: kpis.lowStockCount },
                { key: 'OUT_OF_STOCK', label: 'Out of Stock', count: kpis.outOfStockCount },
              ].map((seg) => (
                <button
                  key={seg.key}
                  type="button"
                  onClick={() => setFilterSegment(seg.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    filterSegment === seg.key
                      ? 'bg-[#7A1C30] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
                  }`}
                >
                  <span>{seg.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      filterSegment === seg.key ? 'bg-[#5F1424] text-[#E2CE9F]' : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {seg.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-2xl border border-[#E8DCC9] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="min-w-[900px] w-full text-left text-xs font-sans">
                <thead className="bg-[#FAF6F0] border-b border-[#E8DCC9] text-stone-700 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3.5">Saree SKU & Masterpiece</th>
                    <th className="p-3.5 text-center">Vault Bin</th>
                    <th className="p-3.5 text-center">Physical Stock</th>
                    <th className="p-3.5 text-center">Reserved Stock</th>
                    <th className="p-3.5 text-center">Available (ATS)</th>
                    <th className="p-3.5 text-center">Stock Status</th>
                    <th className="p-3.5 text-right">Quick Stock Adjustment</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 font-mono text-xs">
                        No inventory SKUs match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const ats = item.physicalStock - item.reservedStock;
                      const isLow = ats <= item.reorderPoint && item.physicalStock > 0;
                      const isOut = item.physicalStock === 0;

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/90 transition-colors ${
                            isOut ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {/* 1. Saree SKU & Masterpiece */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-10 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                                <div className="text-[10px] font-mono text-slate-500">
                                  {item.weave} • {item.fabric}
                                </div>
                                <div className="text-[10px] font-mono text-blue-700 font-bold mt-0.5">
                                  {item.sku}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Vault Bin Location */}
                          <td className="p-3.5 text-center font-mono text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>{item.binLocation}</span>
                            </span>
                          </td>

                          {/* 3. Current Physical Stock */}
                          <td className="p-3.5 text-center font-mono font-bold text-xs">
                            <span
                              className={`px-2 py-0.5 rounded ${
                                isOut
                                  ? 'bg-rose-100 text-rose-800'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.physicalStock} Units
                            </span>
                          </td>

                          {/* 4. Reserved Stock */}
                          <td className="p-3.5 text-center font-mono text-xs">
                            {item.reservedStock > 0 ? (
                              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {item.reservedStock} Locked
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* 5. Available to Sell (ATS) */}
                          <td className="p-3.5 text-center font-mono font-bold text-sm">
                            <span
                              className={`${
                                ats <= 0
                                  ? 'text-rose-600'
                                  : ats <= item.reorderPoint
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {ats}
                            </span>
                          </td>

                          {/* 6. Stock Status Badge */}
                          <td className="p-3.5 text-center font-mono text-xs">
                            {isOut ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                OUT OF STOCK
                              </span>
                            ) : isLow ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                                LOW STOCK
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                IN STOCK
                              </span>
                            )}
                          </td>

                          {/* 7. Quick Action +/- */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustingItem(item);
                                  setAdjustDirection('DECREASE');
                                }}
                                disabled={item.physicalStock === 0}
                                className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                                title="Subtract Stock"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustingItem(item);
                                  setAdjustDirection('INCREASE');
                                }}
                                className="w-8 h-8 rounded-lg bg-[#7A1C30] hover:bg-[#5F1424] text-white flex items-center justify-center font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                                title="Add Stock"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 5. TAB CONTENT 2: INVENTORY LOGS & AUDIT TRAIL     */}
      {/* ================================================== */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>Stock Ledger & Audit Trail</span>
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Immutable audit history of all manual adjustments, loom restocks, and order commits
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg font-bold border border-blue-200">
              {auditLogs.length} Total Ledger Entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">SKU & Saree Title</th>
                  <th className="p-3.5 text-center">Stock Delta</th>
                  <th className="p-3.5 text-center">Stock Transition</th>
                  <th className="p-3.5">Audit Reason</th>
                  <th className="p-3.5">Authorized Staff</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs">{log.title}</div>
                      <div className="font-mono text-[10px] text-blue-700 font-bold">{log.sku}</div>
                      {log.notes && (
                        <div className="text-[10px] text-slate-500 italic mt-0.5">"{log.notes}"</div>
                      )}
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-xs">
                      {log.delta > 0 ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          +{log.delta} Units
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                          {log.delta} Units
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center font-mono text-xs text-slate-600">
                      <span>{log.previousStock} Units</span>
                      <span className="mx-1.5 text-slate-400">→</span>
                      <strong className="text-slate-900">{log.newStock} Units</strong>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium text-slate-800 text-[11px]">
                        {log.reason}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{log.staffMember}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. MANDATORY REASON STOCK ADJUSTMENT MODAL         */}
      {/* ================================================== */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Stock Ledger Delta Adjustment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdjustment} className="p-6 space-y-4 text-xs font-sans">
              {/* Product Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={adjustingItem.image}
                  alt={adjustingItem.title}
                  className="w-12 h-14 rounded-lg object-cover border border-slate-300"
                />
                <div>
                  <div className="font-bold text-slate-900 text-xs">{adjustingItem.title}</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    SKU: {adjustingItem.sku} • Bin: {adjustingItem.binLocation}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-800 font-semibold">
                    Current Physical Stock: <strong>{adjustingItem.physicalStock} Units</strong>
                  </div>
                </div>
              </div>

              {/* Adjustment Direction & Qty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delta Type</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAdjustDirection('INCREASE')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        adjustDirection === 'INCREASE'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Add Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustDirection('DECREASE')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        adjustDirection === 'DECREASE'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      - Subtract
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delta Units</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={adjustQuantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setAdjustQuantity(val);
                    }}
                    placeholder="Enter units (e.g. 50)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mandatory Reason Dropdown */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Audit Reason *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-900"
                >
                  <option value="Stock Count Reconcile">Stock Count Reconcile (Cycle Count)</option>
                  <option value="Damaged on Loom / Zari Defect">
                    Damaged on Loom / Zari Defect (Sent to Scrap)
                  </option>
                  <option value="Offline Showroom Transfer (Sayyaji Rao)">
                    Offline Showroom Transfer (Sayyaji Rao Flagship)
                  </option>
                  <option value="Returned to Master Weaver for Re-Weft">
                    Returned to Master Weaver for Re-Weft
                  </option>
                  <option value="Restocked from Loom Cluster">
                    Restocked from Loom Cluster (New Weave Receipt)
                  </option>
                </select>
              </div>

              {/* Automatic Authenticated Staff Identification */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Authorizing Staff Member
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>SuperAdmin Executive (Authenticated Admin Session)</span>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Ledger Notes</label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Provide reference numbers, weaver batch codes, or inspection remarks..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Commit Ledger Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
