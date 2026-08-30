'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  Tag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Pin,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  ChevronRight,
  SlidersHorizontal,
  Bookmark,
  Award,
  Scissors,
  HelpCircle,
  FolderOpen,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import {
  SareeCollection,
  TaxonomyTerm,
  TaxonomyCategory,
  INITIAL_COLLECTIONS,
  INITIAL_TAXONOMY_TERMS,
} from '@/lib/taxonomy';
import { products } from '@/lib/products';

export default function CollectionsTaxonomyPage() {
  const [activeMainTab, setActiveMainTab] = useState<'COLLECTIONS' | 'TAXONOMY'>('COLLECTIONS');

  // Collections State
  const [collections, setCollections] = useState<SareeCollection[]>(INITIAL_COLLECTIONS);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [collectionStatusFilter, setCollectionStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('ALL');

  // Taxonomy State
  const [taxonomyTerms, setTaxonomyTerms] = useState<TaxonomyTerm[]>(INITIAL_TAXONOMY_TERMS);
  const [taxonomySearch, setTaxonomySearch] = useState('');
  const [taxonomyCategoryFilter, setTaxonomyCategoryFilter] = useState<TaxonomyCategory | 'ALL'>('ALL');

  // Modals State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<SareeCollection | null>(null);
  const [isTaxonomyModalOpen, setIsTaxonomyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Collection Form State
  const [colTitle, setColTitle] = useState('');
  const [colSlug, setColSlug] = useState('');
  const [colTagline, setColTagline] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colCover, setColCover] = useState('');
  const [colBadge, setColBadge] = useState('Festive 2026');
  const [colFeatured, setColFeatured] = useState(true);
  const [colType, setColType] = useState<'Rule-Based' | 'Curated'>('Curated');

  // New Taxonomy Form State
  const [taxCategory, setTaxCategory] = useState<TaxonomyCategory>('WEAVE');
  const [taxName, setTaxName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [taxOrigin, setTaxOrigin] = useState('Karnataka');
  const [taxGi, setTaxGi] = useState(true);
  const [taxSilkMark, setTaxSilkMark] = useState(true);
  const [taxDesc, setTaxDesc] = useState('');

  // Summary Metrics
  const summary = useMemo(() => {
    const activeCollections = collections.filter((c) => c.status === 'ACTIVE').length;
    const giWeavesCount = taxonomyTerms.filter((t) => t.category === 'WEAVE' && t.isGiTagged).length;
    const totalTerms = taxonomyTerms.length;
    const totalAssignedSkus = collections.reduce((acc, c) => acc + c.assignedSkuCount, 0);

    return {
      activeCollections,
      giWeavesCount,
      totalTerms,
      totalAssignedSkus,
    };
  }, [collections, taxonomyTerms]);

  // Filtered Collections
  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      if (collectionStatusFilter !== 'ALL' && c.status !== collectionStatusFilter) return false;
      if (collectionSearch.trim()) {
        const q = collectionSearch.toLowerCase().trim();
        const matches =
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [collections, collectionStatusFilter, collectionSearch]);

  // Filtered Taxonomy Terms
  const filteredTaxonomy = useMemo(() => {
    return taxonomyTerms.filter((t) => {
      if (taxonomyCategoryFilter !== 'ALL' && t.category !== taxonomyCategoryFilter) return false;
      if (taxonomySearch.trim()) {
        const q = taxonomySearch.toLowerCase().trim();
        const matches =
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.originState && t.originState.toLowerCase().includes(q)) ||
          t.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [taxonomyTerms, taxonomyCategoryFilter, taxonomySearch]);

  const resetCollectionForm = () => {
    setColTitle('');
    setColSlug('');
    setColTagline('');
    setColDesc('');
    setColCover('');
    setColBadge('Festive 2026');
    setColFeatured(true);
    setColType('Curated');
    setEditingCollection(null);
  };

  // Fetch live collections from database API
  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/collections')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch collections');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.collections && Array.isArray(data.collections)) {
          const formatted: SareeCollection[] = data.collections.map((c: any) => ({
            id: c.id,
            title: c.title,
            slug: c.slug,
            tagline: c.tagline || '',
            description: c.description || '',
            coverImage: c.image_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            badge: c.badge || 'Festive 2026',
            collectionType: (c.collection_type as 'Rule-Based' | 'Curated') || 'Curated',
            assignedSkuCount: Number(c.assigned_sku_count || 12),
            isFeaturedOnHomepage: Boolean(c.is_active),
            status: c.is_active ? 'ACTIVE' : 'DRAFT',
            assignedSkus: Array.isArray(c.assigned_skus) ? c.assigned_skus : [],
          }));
          setCollections(formatted);
        }
      })
      .catch((err) => {
        console.error('[Collections API] Fetch error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Action: Toggle Homepage Pin / Active Status in DB
  const handleToggleCollectionStatus = async (id: string) => {
    const target = collections.find((c) => c.id === id);
    if (!target) return;

    const nextActive = target.status !== 'ACTIVE';
    const nextStatus = nextActive ? 'ACTIVE' : 'DRAFT';

    try {
      const res = await fetch('/api/admin/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: nextActive }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: nextStatus, isFeaturedOnHomepage: nextActive } : c))
      );
      triggerToast(`Collection "${target.title}" is now ${nextStatus}.`);
    } catch (err) {
      console.error('[Collections API] Toggle status error:', err);
      triggerToast('Error updating collection status in database.');
    }
  };

  const handleToggleFeaturedCollection = async (id: string, current: boolean, title: string) => {
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current }),
      });

      if (!res.ok) throw new Error('Failed to update featured status');

      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFeaturedOnHomepage: !current } : c))
      );
      triggerToast(`Collection "${title}" ${!current ? 'pinned to' : 'removed from'} homepage showcase.`);
    } catch (err) {
      console.error('[Collections API] Featured toggle error:', err);
      triggerToast('Error updating showcase pin in database.');
    }
  };

  // Action: Save Collection (Create or Update in DB)
  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colTitle.trim() || !colSlug.trim()) {
      triggerToast('Title and slug are required');
      return;
    }

    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCollection?.id,
          title: colTitle.trim(),
          slug: colSlug.trim(),
          tagline: colTagline.trim(),
          description: colDesc.trim(),
          image_url: colCover.trim() || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
          badge: colBadge.trim() || 'Festive 2026',
          collection_type: colType,
          is_active: colFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save collection');
      }

      const savedDb = data.collection;
      const formattedItem: SareeCollection = {
        id: savedDb?.id || editingCollection?.id || `col-${Date.now()}`,
        title: savedDb?.title || colTitle.trim(),
        slug: savedDb?.slug || colSlug.trim(),
        tagline: savedDb?.tagline || colTagline.trim(),
        description: savedDb?.description || colDesc.trim(),
        coverImage: savedDb?.image_url || colCover.trim() || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
        badge: savedDb?.badge || colBadge.trim(),
        collectionType: (savedDb?.collection_type as 'Rule-Based' | 'Curated') || colType,
        assignedSkuCount: Number(savedDb?.assigned_sku_count || (editingCollection ? editingCollection.assignedSkuCount : 0)),
        isFeaturedOnHomepage: Boolean(savedDb?.is_active ?? colFeatured),
        status: (savedDb?.is_active ?? colFeatured) ? 'ACTIVE' : 'DRAFT',
        assignedSkus: Array.isArray(savedDb?.assigned_skus) ? savedDb.assigned_skus : (editingCollection?.assignedSkus || []),
      };

      if (editingCollection) {
        setCollections((prev) =>
          prev.map((c) => (c.id === editingCollection.id ? formattedItem : c))
        );
        triggerToast(`Collection "${formattedItem.title}" updated successfully.`);
      } else {
        setCollections((prev) => [formattedItem, ...prev]);
        triggerToast(`Collection "${formattedItem.title}" created and published.`);
      }

      setIsCollectionModalOpen(false);
      resetCollectionForm();
    } catch (err: any) {
      console.error('[Collections API] Save error:', err);
      triggerToast(`Error saving collection: ${err.message || 'Network error'}`);
    }
  };

  // Action: Delete Collection from DB
  const handleDeleteCollection = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove the collection "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/collections?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete collection from database');

      setCollections((prev) => prev.filter((c) => c.id !== id));
      triggerToast(`Collection "${title}" deleted.`);
    } catch (err: any) {
      console.error('[Collections API] Delete error:', err);
      triggerToast('Error deleting collection from database.');
    }
  };

  // Action: Save Taxonomy Term
  const handleSaveTaxonomyTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName.trim() || !taxCode.trim()) return;

    const newTerm: TaxonomyTerm = {
      id: `tax-${Date.now()}`,
      category: taxCategory,
      name: taxName.trim(),
      code: taxCode.trim().toUpperCase(),
      originState: taxCategory === 'WEAVE' ? taxOrigin : undefined,
      isGiTagged: taxCategory === 'WEAVE' ? taxGi : undefined,
      isSilkMarkCertified: taxCategory === 'WEAVE' ? taxSilkMark : undefined,
      description: taxDesc.trim(),
      productCount: 0,
      status: 'ACTIVE',
    };

    setTaxonomyTerms((prev) => [newTerm, ...prev]);
    setIsTaxonomyModalOpen(false);
    setTaxName('');
    setTaxCode('');
    setTaxDesc('');
    triggerToast(`Taxonomy term "${taxName}" added to ${taxCategory} master registry.`);
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
      {/* 1. TOP HEADER & WORKSPACE SWITCHER                 */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Collections & Taxonomy Architect
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C87F4A]" />
              <span>Silk Mark Certified Taxonomies</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Curated Saree Collections, Weave Geographical Indication Registry & Ethnic Fabric Taxonomy
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeMainTab === 'COLLECTIONS' ? (
            <button
              type="button"
              onClick={() => {
                setEditingCollection(null);
                setColTitle('');
                setColSlug('');
                setColTagline('');
                setColDesc('');
                setColCover('');
                setColBadge('Muhurtham 2026');
                setColFeatured(true);
                setIsCollectionModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-200" />
              <span>+ Create Curated Collection</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsTaxonomyModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-200" />
              <span>+ Add Taxonomy Term</span>
            </button>
          )}

          <Link
            href="/products"
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl border border-[#E8DCC9] bg-white hover:bg-[#FAF6F0] text-stone-700 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>Storefront View</span>
            <ExternalLink className="w-3 h-3 ml-0.5 text-[#7A1C30]" />
          </Link>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. KPI METRIC SUMMARY                              */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Curated Collections</span>
            <FolderOpen className="w-4 h-4 text-[#7A1C30]" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
            {summary.activeCollections} Active
          </div>
          <div className="text-[11px] font-mono text-emerald-700">
            {collections.filter((c) => c.isFeaturedOnHomepage).length} Featured on Homepage Carousel
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>GI Certified Weaves</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800 tracking-tight">
            {summary.giWeavesCount} Traditions
          </div>
          <div className="text-[11px] font-mono text-stone-500">
            Kanchipuram, Mysore, Varanasi, Paithani, Patola
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Master Taxonomy Terms</span>
            <Tag className="w-4 h-4 text-[#C87F4A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#C87F4A] tracking-tight">
            {summary.totalTerms} Terms
          </div>
          <div className="text-[11px] font-mono text-stone-500">
            Weaves, Pure Silks, Bullion Zari & Pit Looms
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Mapped Saree SKUs</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
            {summary.totalAssignedSkus} Curated Links
          </div>
          <div className="text-[11px] font-mono text-stone-500">
            Across bridal & festive lookbooks
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. MAIN WORKSPACE TABS                             */}
      {/* ================================================== */}
      <div className="flex items-center gap-2 border-b border-[#E8DCC9] pb-2 overflow-x-auto font-sans text-xs">
        <button
          type="button"
          onClick={() => setActiveMainTab('COLLECTIONS')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-2xs whitespace-nowrap cursor-pointer ${
            activeMainTab === 'COLLECTIONS'
              ? 'bg-[#7A1C30] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-amber-200" />
          <span>Curated Collections Studio ({collections.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('TAXONOMY')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-2xs whitespace-nowrap cursor-pointer ${
            activeMainTab === 'TAXONOMY'
              ? 'bg-[#7A1C30] text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
          }`}
        >
          <Tag className="w-4 h-4 text-purple-400" />
          <span>Ethnic Taxonomy Master Engine ({taxonomyTerms.length})</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* 4. TAB 1: CURATED COLLECTIONS STUDIO               */}
      {/* ================================================== */}
      {activeMainTab === 'COLLECTIONS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Collection Title, Slug, or Tagline..."
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-sans">
              {(['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCollectionStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    collectionStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'ALL' ? 'All Collections' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Collection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCollections.map((col) => (
              <div
                key={col.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Cover Image with Badges */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-900/80 text-amber-300 backdrop-blur-xs border border-white/10">
                        {col.badge}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleFeaturedCollection(col.id, col.isFeaturedOnHomepage, col.title)
                        }
                        className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-xs ${
                          col.isFeaturedOnHomepage
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-900/60 text-white hover:bg-slate-900'
                        }`}
                        title="Toggle Homepage Spotlight"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-white bg-slate-950/70 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                      <span>{col.assignedSkuCount} Sarees Mapped</span>
                      <span>{col.validDateRange}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          col.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {col.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Slug: /{col.slug}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 font-sans line-clamp-1">
                      {col.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-sans line-clamp-2 leading-relaxed">
                      {col.tagline}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => handleToggleCollectionStatus(col.id)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    {col.status === 'ACTIVE' ? 'Set as Draft' : 'Publish Active'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/collections/${col.slug}`}
                      target="_blank"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                      title="View Live Storefront Landing Page"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Live</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCollection(col);
                        setColTitle(col.title);
                        setColSlug(col.slug);
                        setColTagline(col.tagline);
                        setColDesc(col.description);
                        setColCover(col.coverImage);
                        setColBadge(col.badge);
                        setColFeatured(col.isFeaturedOnHomepage);
                        setColType(col.collectionType || 'Curated');
                        setIsCollectionModalOpen(true);
                      }}
                      className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3 h-3 text-slate-500" />
                      <span>Edit Studio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCollection(col.id, col.title)}
                      className="p-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Collection from Database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 5. TAB 2: ETHNIC TAXONOMY MASTER ENGINE            */}
      {/* ================================================== */}
      {activeMainTab === 'TAXONOMY' && (
        <div className="space-y-4">
          {/* Category Filter Pills & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Taxonomy Terms, Codes, States, or Descriptions..."
                  value={taxonomySearch}
                  onChange={(e) => setTaxonomySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="text-xs font-mono text-slate-500">
                Showing <strong className="text-slate-900">{filteredTaxonomy.length}</strong> of{' '}
                {taxonomyTerms.length} Taxonomy Terms
              </div>
            </div>

            {/* Category Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 text-xs font-sans">
              {[
                { key: 'ALL', label: 'All Categories' },
                { key: 'WEAVE', label: 'Weave Traditions (GI Tagged)' },
                { key: 'FABRIC', label: 'Fabric Compositions' },
                { key: 'ZARI', label: 'Zari Bullion Specifications' },
                { key: 'LOOM', label: 'Loom & Craft Types' },
                { key: 'MOTIF', label: 'Motifs & Design Patterns' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTaxonomyCategoryFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    taxonomyCategoryFilter === tab.key
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Taxonomy Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Term Name & System Code</th>
                    <th className="p-3.5">Origin & Certifications</th>
                    <th className="p-3.5">Technical Description</th>
                    <th className="p-3.5 text-center">Catalog SKUs</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                  {filteredTaxonomy.map((term) => (
                    <tr key={term.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Category */}
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            term.category === 'WEAVE'
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : term.category === 'FABRIC'
                              ? 'bg-purple-50 text-purple-900 border border-purple-200'
                              : term.category === 'ZARI'
                              ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                              : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {term.category}
                        </span>
                      </td>

                      {/* Term Name & Code */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-xs">{term.name}</div>
                        <code className="text-[10px] font-mono text-blue-700 font-bold">
                          {term.code}
                        </code>
                      </td>

                      {/* Origin & Certifications */}
                      <td className="p-3.5 font-mono text-[11px]">
                        {term.originState && (
                          <div className="font-bold text-slate-800">{term.originState}</div>
                        )}
                        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                          {term.isGiTagged && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                              ✓ GI Certified
                            </span>
                          )}
                          {term.silkMarkCertified && (
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded border border-emerald-300">
                              ✓ Silk Mark
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="p-3.5 max-w-xs">
                        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                          {term.description}
                        </p>
                      </td>

                      {/* Product Count */}
                      <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                        {term.productCount} SKUs
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {term.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            triggerToast(`Taxonomy term ${term.name} selected for catalog audit.`)
                          }
                          className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          Audit SKUs
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. CREATE / EDIT COLLECTION MODAL                  */}
      {/* ================================================== */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  {editingCollection ? 'Edit Collection Studio' : 'Create New Curated Collection'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCollectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="p-6 space-y-4 text-xs font-sans overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Collection Title *
                </label>
                <input
                  type="text"
                  required
                  value={colTitle}
                  onChange={(e) => {
                    setColTitle(e.target.value);
                    if (!editingCollection) {
                      setColSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '')
                      );
                    }
                  }}
                  placeholder="e.g. Royal Wodeyar Muhurtham 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={colSlug}
                    onChange={(e) => setColSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge Tag *</label>
                  <input
                    type="text"
                    required
                    value={colBadge}
                    onChange={(e) => setColBadge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline Subtitle *</label>
                <input
                  type="text"
                  required
                  value={colTagline}
                  onChange={(e) => setColTagline(e.target.value)}
                  placeholder="e.g. Pure Mysore Crepe Silks hand-woven with tested gold zari bullion"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cover Image URL (1200x600 HD)
                </label>
                <input
                  type="text"
                  value={colCover}
                  onChange={(e) => setColCover(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Collection Editorial Description
                </label>
                <textarea
                  rows={3}
                  value={colDesc}
                  onChange={(e) => setColDesc(e.target.value)}
                  placeholder="Describe the heritage provenance and weaver story behind this curation..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Curation Mode & Product Matching
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      colType === 'Curated'
                        ? 'border-[#7A1C30] bg-[#FAF3E4]/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="colType"
                        checked={colType === 'Curated'}
                        onChange={() => setColType('Curated')}
                        className="text-[#7A1C30] focus:ring-[#7A1C30]"
                      />
                      <span className="font-bold text-xs text-slate-900">Manual Editorial</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans mt-1">
                      Handpick and order exact saree SKUs for this lookbook
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      colType === 'Rule-Based'
                        ? 'border-[#7A1C30] bg-[#FAF3E4]/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="colType"
                        checked={colType === 'Rule-Based'}
                        onChange={() => setColType('Rule-Based')}
                        className="text-[#7A1C30] focus:ring-[#7A1C30]"
                      />
                      <span className="font-bold text-xs text-slate-900">Automatic Rule-Based</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-sans mt-1">
                      Auto-populates sarees matching collection title, weave & occasion
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featuredPin"
                  checked={colFeatured}
                  onChange={(e) => setColFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featuredPin" className="text-xs text-slate-800 font-semibold cursor-pointer">
                  Feature this collection in the homepage hero showcase carousel
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  {editingCollection ? 'Save Collection' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 7. ADD TAXONOMY TERM MODAL                         */}
      {/* ================================================== */}
      {isTaxonomyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Add Ethnic Taxonomy Term
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTaxonomyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaxonomyTerm} className="p-6 space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Taxonomy Category *
                </label>
                <select
                  value={taxCategory}
                  onChange={(e) => setTaxCategory(e.target.value as TaxonomyCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 font-semibold"
                >
                  <option value="WEAVE">Weave Tradition (GI Tagged)</option>
                  <option value="FABRIC">Fabric Composition</option>
                  <option value="ZARI">Zari Bullion Specification</option>
                  <option value="LOOM">Loom & Craft Type</option>
                  <option value="MOTIF">Motif & Design Pattern</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Term Display Name *</label>
                <input
                  type="text"
                  required
                  value={taxName}
                  onChange={(e) => {
                    setTaxName(e.target.value);
                    setTaxCode(
                      `${taxCategory}_${e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]+/g, '_')}`
                    );
                  }}
                  placeholder="e.g. Tussar Gicha Silk"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Code *</label>
                <input
                  type="text"
                  required
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-purple-700"
                />
              </div>

              {taxCategory === 'WEAVE' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Origin State / Cluster
                    </label>
                    <input
                      type="text"
                      value={taxOrigin}
                      onChange={(e) => setTaxOrigin(e.target.value)}
                      placeholder="e.g. West Bengal / Karnataka"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxGi}
                        onChange={(e) => setTaxGi(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600"
                      />
                      <span className="text-xs font-semibold text-slate-800">GI Tagged</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taxSilkMark}
                        onChange={(e) => setTaxSilkMark(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                      <span className="text-xs font-semibold text-slate-800">Silk Mark Eligible</span>
                    </label>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={taxDesc}
                  onChange={(e) => setTaxDesc(e.target.value)}
                  placeholder="Provide technical weave details or fabric fiber specifications..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTaxonomyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Save Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
