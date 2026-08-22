'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wand2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileArchive,
  RefreshCw,
  Eye,
  Trash2,
  X,
  Search,
  Filter,
  Check,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Download,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { products } from '@/lib/products';

export interface SkinToneAssets {
  fair?: string;
  wheatish?: string;
  medium?: string;
  deep?: string;
  dark?: string;
}

export interface SareeAvatarMatrixItem {
  id: string;
  sku: string;
  title: string;
  weave: string;
  fabric: string;
  sareeThumbnail: string;
  isTryOnEnabled: boolean;
  tones: SkinToneAssets;
}

const INITIAL_MATRIX: SareeAvatarMatrixItem[] = [
  {
    id: 'saree-1',
    sku: 'NSH-SKU-MYS-01',
    title: 'Royal Wodeyar Crimson Crepe Silk',
    weave: 'Mysore Silk',
    fabric: '100% Pure Mulberry Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    isTryOnEnabled: true,
    tones: {
      fair: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop',
      wheatish: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
      medium: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop',
      deep: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=400&auto=format&fit=crop',
      dark: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'saree-2',
    sku: 'NSH-SKU-KAN-04',
    title: 'Bridal Kanchipuram Korvai Gold Brocade',
    weave: 'Kanchipuram',
    fabric: 'Pure Raw Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
    isTryOnEnabled: true,
    tones: {
      fair: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop',
      wheatish: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop',
      medium: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'saree-3',
    sku: 'NSH-SKU-BAN-03',
    title: 'Varanasi Kadwa Katan Meenakari Boota',
    weave: 'Banarasi',
    fabric: 'Pure Katan Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
    isTryOnEnabled: true,
    tones: {
      fair: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop',
      wheatish: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop',
      medium: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=400&auto=format&fit=crop',
      deep: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop',
      dark: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'saree-4',
    sku: 'NSH-SKU-PAI-02',
    title: 'Yeola Paithani Royal Peacock Asawali',
    weave: 'Paithani',
    fabric: '100% Pure Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
    isTryOnEnabled: true,
    tones: {
      fair: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=400&auto=format&fit=crop',
      wheatish: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'saree-5',
    sku: 'NSH-SKU-TIS-08',
    title: 'Champagne Tissue Georgette Floral Zari',
    weave: 'Tissue Georgette',
    fabric: 'Metallic Tissue Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    isTryOnEnabled: true,
    tones: {
      fair: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=400&auto=format&fit=crop',
      wheatish: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=400&auto=format&fit=crop',
      medium: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=400&auto=format&fit=crop',
      deep: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=400&auto=format&fit=crop',
    },
  },
  {
    id: 'saree-6',
    sku: 'NSH-SKU-PAT-01',
    title: 'Patan Double Ikkat Royal Elephant Votive',
    weave: 'Patola',
    fabric: 'Pure Mulberry Silk',
    sareeThumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    isTryOnEnabled: false,
    tones: {},
  },
];

const SKIN_TONES = [
  { key: 'fair', label: 'Fair Tone', color: '#FCE6D6' },
  { key: 'wheatish', label: 'Wheatish Tone', color: '#F3C5A8' },
  { key: 'medium', label: 'Medium Tone', color: '#D99B72' },
  { key: 'deep', label: 'Deep Tone', color: '#A56843' },
  { key: 'dark', label: 'Dark Tone', color: '#683F25' },
] as const;

export default function AiAvatarMatrixPage() {
  const [matrix, setMatrix] = useState<SareeAvatarMatrixItem[]>(INITIAL_MATRIX);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'PARTIAL' | 'DISABLED'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bulk ZIP Modal State
  const [isBulkZipModalOpen, setIsBulkZipModalOpen] = useState(false);
  const [zipFileName, setZipFileName] = useState<string | null>(null);
  const [isSimulatingZip, setIsSimulatingZip] = useState(false);

  // Single Slot Upload Modal
  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    sareeId: string;
    sku: string;
    toneKey: keyof SkinToneAssets;
    toneLabel: string;
  } | null>(null);
  const [slotImageUrl, setSlotImageUrl] = useState('');

  // Preview Modal
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    tone: string;
  } | null>(null);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalEnabled = matrix.filter((m) => m.isTryOnEnabled).length;
    let totalGeneratedAssets = 0;
    const totalSlots = matrix.length * 5;

    matrix.forEach((item) => {
      if (item.tones.fair) totalGeneratedAssets++;
      if (item.tones.wheatish) totalGeneratedAssets++;
      if (item.tones.medium) totalGeneratedAssets++;
      if (item.tones.deep) totalGeneratedAssets++;
      if (item.tones.dark) totalGeneratedAssets++;
    });

    const pendingGenerations = totalSlots - totalGeneratedAssets;

    return {
      totalEnabled,
      totalGeneratedAssets,
      totalSlots,
      pendingGenerations,
    };
  }, [matrix]);

  // Filtered Matrix List
  const filteredMatrix = useMemo(() => {
    return matrix.filter((item) => {
      const toneCount = Object.values(item.tones).filter(Boolean).length;

      if (statusFilter === 'READY' && toneCount < 5) return false;
      if (statusFilter === 'PARTIAL' && (toneCount === 0 || toneCount === 5)) return false;
      if (statusFilter === 'DISABLED' && item.isTryOnEnabled) return false;

      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        const matches =
          item.sku.toLowerCase().includes(cleanQ) ||
          item.title.toLowerCase().includes(cleanQ) ||
          item.weave.toLowerCase().includes(cleanQ);

        if (!matches) return false;
      }

      return true;
    });
  }, [matrix, statusFilter, searchQuery]);

  // Toggle Saree Try-On Eligibility
  const toggleTryOn = (id: string) => {
    setMatrix((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newState = !item.isTryOnEnabled;
        triggerToast(`Virtual Try-On ${newState ? 'enabled' : 'disabled'} for ${item.sku}.`);
        return { ...item, isTryOnEnabled: newState };
      })
    );
  };

  // Upload/Assign Single Slot
  const handleAssignSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotTarget || !slotImageUrl.trim()) return;

    setMatrix((prev) =>
      prev.map((item) => {
        if (item.id !== activeSlotTarget.sareeId) return item;
        return {
          ...item,
          tones: {
            ...item.tones,
            [activeSlotTarget.toneKey]: slotImageUrl.trim(),
          },
        };
      })
    );

    triggerToast(
      `${activeSlotTarget.toneLabel} render assigned to SKU ${activeSlotTarget.sku}.`
    );
    setActiveSlotTarget(null);
    setSlotImageUrl('');
  };

  // Delete Single Slot
  const deleteSlotAsset = (sareeId: string, toneKey: keyof SkinToneAssets, sku: string) => {
    setMatrix((prev) =>
      prev.map((item) => {
        if (item.id !== sareeId) return item;
        const newTones = { ...item.tones };
        delete newTones[toneKey];
        return { ...item, tones: newTones };
      })
    );
    triggerToast(`Render deleted from ${sku} (${toneKey}).`);
  };

  // Bulk ZIP Simulation
  const handleSimulateZipUpload = () => {
    setIsSimulatingZip(true);
    setTimeout(() => {
      setMatrix((prev) =>
        prev.map((item) => ({
          ...item,
          isTryOnEnabled: true,
          tones: {
            fair: item.tones.fair || item.sareeThumbnail,
            wheatish: item.tones.wheatish || item.sareeThumbnail,
            medium: item.tones.medium || item.sareeThumbnail,
            deep: item.tones.deep || item.sareeThumbnail,
            dark: item.tones.dark || item.sareeThumbnail,
          },
        }))
      );
      setIsSimulatingZip(false);
      setIsBulkZipModalOpen(false);
      triggerToast('Bulk ZIP processed: 18 missing skin-tone renders mapped and activated.');
    }, 1500);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. TOP HEADER & BREADCRUMBS                        */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              AI Avatar Asset Matrix Control Panel
            </h1>
            <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-purple-600" />
              <span>Multi-Tone Virtual Drape Studio</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            5 Indian Skin Tones (Fair, Wheatish, Medium, Deep, Dark) Asset Mapping & Ingestion Grid
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkZipModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <FileArchive className="w-3.5 h-3.5 text-purple-600" />
            <span>Bulk ZIP Asset Ingestion</span>
          </button>

          <Link
            href="/try-on"
            target="_blank"
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Open AI Try-On Studio</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. MATRIX STATUS OVERVIEW (KPIs)                   */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Enabled Saree SKUs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {summary.totalEnabled} / {matrix.length} SKUs
          </div>
          <div className="text-[11px] font-mono text-emerald-700">
            Active on customer virtual try-on dressing room
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Skin-Tone Image Assets</span>
            <ImageIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {summary.totalGeneratedAssets} / {summary.totalSlots} Renders
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {Math.round((summary.totalGeneratedAssets / summary.totalSlots) * 100)}% Matrix
            Coverage
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Pending Asset Slots</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tracking-tight">
            {summary.pendingGenerations} Missing
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Requires photorealistic AI avatar rendering
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. SEARCH & SEGMENTATION TABS                      */}
      {/* ================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Saree Title, Master SKU, or Weave Tradition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div className="text-xs font-mono text-slate-500">
            Showing <strong className="text-slate-900">{filteredMatrix.length}</strong> of{' '}
            {matrix.length} Catalog SKUs
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {[
            { key: 'ALL', label: 'All Catalog Sarees', count: matrix.length },
            {
              key: 'READY',
              label: 'Ready (5/5 Tones Full)',
              count: matrix.filter((m) => Object.values(m.tones).filter(Boolean).length === 5).length,
            },
            {
              key: 'PARTIAL',
              label: 'Partial Coverage (1-4 Tones)',
              count: matrix.filter(
                (m) =>
                  Object.values(m.tones).filter(Boolean).length > 0 &&
                  Object.values(m.tones).filter(Boolean).length < 5
              ).length,
            },
            {
              key: 'DISABLED',
              label: 'Disabled / Missing',
              count: matrix.filter((m) => !m.isTryOnEnabled).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  statusFilter === tab.key ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. ASSET MATRIX DATA GRID                          */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5 min-w-[240px]">Saree Masterpiece & SKU</th>
                <th className="p-3.5 text-center">Status</th>
                {SKIN_TONES.map((tone) => (
                  <th key={tone.key} className="p-3.5 text-center min-w-[120px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-400"
                        style={{ backgroundColor: tone.color }}
                      />
                      <span>{tone.label}</span>
                    </div>
                  </th>
                ))}
                <th className="p-3.5 text-right">Try-On Toggle</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No sarees match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((item) => {
                  const toneCount = Object.values(item.tones).filter(Boolean).length;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Saree Masterpiece & SKU */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.sareeThumbnail}
                            alt={item.title}
                            className="w-12 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
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

                      {/* Status Pill */}
                      <td className="p-3.5 text-center font-mono">
                        {toneCount === 5 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Ready (5/5)</span>
                          </span>
                        ) : toneCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Partial ({toneCount}/5)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <span>Missing (0/5)</span>
                          </span>
                        )}
                      </td>

                      {/* 5 Skin Tone Asset Slots */}
                      {SKIN_TONES.map((tone) => {
                        const assetUrl = item.tones[tone.key];

                        return (
                          <td key={tone.key} className="p-3 text-center">
                            {assetUrl ? (
                              <div className="relative group inline-block">
                                <img
                                  src={assetUrl}
                                  alt={`${tone.label} preview`}
                                  className="w-14 h-18 rounded-lg object-cover border border-slate-200 shadow-2xs group-hover:ring-2 ring-blue-500 transition-all cursor-pointer"
                                  onClick={() =>
                                    setPreviewImage({
                                      url: assetUrl,
                                      title: item.title,
                                      tone: tone.label,
                                    })
                                  }
                                />
                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-slate-950/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewImage({
                                        url: assetUrl,
                                        title: item.title,
                                        tone: tone.label,
                                      })
                                    }
                                    className="p-1 rounded bg-white text-slate-900 hover:bg-slate-100"
                                    title="Inspect 4K Render"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteSlotAsset(item.id, tone.key, item.sku)
                                    }
                                    className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700"
                                    title="Delete Render"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSlotTarget({
                                    sareeId: item.id,
                                    sku: item.sku,
                                    toneKey: tone.key,
                                    toneLabel: tone.label,
                                  });
                                  setSlotImageUrl(item.sareeThumbnail);
                                }}
                                className="w-14 h-18 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-600 transition-all"
                                title={`Upload ${tone.label} render for ${item.sku}`}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-mono font-bold">+ Tone</span>
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Try-On Eligibility Toggle */}
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => toggleTryOn(item.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            item.isTryOnEnabled
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border-slate-300 bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.isTryOnEnabled ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================== */}
      {/* 5. BULK ZIP ASSET INGESTION MODAL                  */}
      {/* ================================================== */}
      {isBulkZipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileArchive className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Bulk ZIP Avatar Asset Ingestion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkZipModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1.5 text-purple-950">
                <div className="font-bold text-xs flex items-center gap-1.5 text-purple-900">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>ZIP File Naming Convention Guideline</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Archive your 4K transparent avatar PNGs/JPEGs matching the pattern:
                </p>
                <div className="p-2 bg-white rounded-lg border border-purple-200 font-mono text-[10px] text-slate-800">
                  <code>[sku]_[skintone].jpg</code> (e.g. <code>NSH-SKU-MYS-01_fair.jpg</code>)
                </div>
              </div>

              {/* Dropzone */}
              <div className="p-8 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl bg-purple-50/30 text-center space-y-2 cursor-pointer transition-colors">
                <FileArchive className="w-8 h-8 text-purple-600 mx-auto" />
                <div className="font-bold text-slate-900 text-xs">
                  Drop your bulk ZIP file here (up to 500MB)
                </div>
                <p className="text-[11px] text-slate-500 font-mono">
                  Auto-extracts and links skin-tone renders to master saree SKUs
                </p>
                <button
                  type="button"
                  onClick={() => setZipFileName('Diwali2026_Handloom_Avatar_Renders_Batch_04.zip')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-purple-300 text-purple-900 text-xs font-bold hover:bg-purple-50 shadow-2xs"
                >
                  {zipFileName || 'Select Sample Bulk ZIP Archive'}
                </button>
              </div>

              {zipFileName && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-800 font-bold">{zipFileName}</span>
                  <span className="text-emerald-700 font-bold">18 Renders Detected</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBulkZipModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!zipFileName || isSimulatingZip}
                  onClick={handleSimulateZipUpload}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {isSimulatingZip ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting Renders...</span>
                    </>
                  ) : (
                    <span>Execute Bulk Ingestion</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. SINGLE SLOT ASSET UPLOAD MODAL                  */}
      {/* ================================================== */}
      {activeSlotTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Assign {activeSlotTarget.toneLabel} Render
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlotTarget(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSlot} className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px]">
                Target SKU: <strong className="text-slate-900">{activeSlotTarget.sku}</strong>
                <br />
                Tone Slot: <strong className="text-blue-700">{activeSlotTarget.toneLabel}</strong>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  High-Resolution Render URL (4K Transparent) *
                </label>
                <input
                  type="text"
                  required
                  value={slotImageUrl}
                  onChange={(e) => setSlotImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              {slotImageUrl && (
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">Preview</span>
                  <img
                    src={slotImageUrl}
                    alt="Preview"
                    className="w-24 h-32 rounded-xl object-cover border border-slate-200 mx-auto"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveSlotTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Assign to Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 7. PREVIEW RENDER MODAL                            */}
      {/* ================================================== */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="relative max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="w-full h-96 object-cover"
            />

            <div className="p-4 bg-slate-900 text-white text-xs font-sans space-y-0.5">
              <div className="font-bold">{previewImage.title}</div>
              <div className="text-[11px] font-mono text-amber-300">{previewImage.tone}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
