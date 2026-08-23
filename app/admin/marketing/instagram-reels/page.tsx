'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Play,
  Instagram,
  Sparkles,
  UploadCloud,
  X,
  Eye,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminInstagramReel {
  id: string;
  url: string;
  shortcode: string;
  caption: string;
  thumbnail_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminInstagramReelsPage() {
  const [reels, setReels] = useState<AdminInstagramReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form States
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [thumbnailInput, setThumbnailInput] = useState('');
  const [thumbnailFilePreview, setThumbnailFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deletingReel, setDeletingReel] = useState<AdminInstagramReel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview Modal
  const [previewReel, setPreviewReel] = useState<AdminInstagramReel | null>(null);

  // Helper: Extract Instagram shortcode from URL
  const extractShortcode = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
  };

  const detectedShortcode = extractShortcode(urlInput.trim());
  const isUrlValid = Boolean(detectedShortcode);

  // Load reels from API
  const fetchReels = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/instagram-reels', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success) {
        setReels(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // Auto-dismiss feedback after 4s
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // Handle Thumbnail File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setThumbnailFilePreview(preview);
      setThumbnailInput(preview);
    }
  };

  // Submit New Reel
  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUrlValid) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid Instagram reel URL (e.g. https://www.instagram.com/reel/DR7Wt2CEiEz/).',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/instagram-reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput.trim(),
          caption: captionInput.trim(),
          thumbnail_url: thumbnailInput.trim() || null,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Reel added to homepage carousel successfully!' });
        setUrlInput('');
        setCaptionInput('');
        setThumbnailInput('');
        setThumbnailFilePreview(null);
        setIsFormOpen(false);
        await fetchReels();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to add reel.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'An unexpected error occurred while adding reel.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Reel Active/Inactive
  const handleToggleActive = async (reel: AdminInstagramReel) => {
    const updatedStatus = !reel.is_active;
    // Optimistic UI update
    setReels((prev) => prev.map((r) => (r.id === reel.id ? { ...r, is_active: updatedStatus } : r)));

    try {
      const res = await fetch(`/api/admin/instagram-reels/${encodeURIComponent(reel.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        fetchReels(); // Rollback on error
      } else {
        setFeedback({
          type: 'success',
          message: `Reel is now ${updatedStatus ? 'visible on' : 'hidden from'} the homepage.`,
        });
      }
    } catch (err) {
      fetchReels();
    }
  };

  // Reorder Item (Move Up / Down)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reels.length) return;

    const newReels = [...reels];
    const [moved] = newReels.splice(index, 1);
    newReels.splice(targetIndex, 0, moved);

    // Update sort_orders sequentially
    const reorderedWithOrder = newReels.map((r, i) => ({ ...r, sort_order: i + 1 }));
    setReels(reorderedWithOrder);

    const orderedIds = reorderedWithOrder.map((r) => r.id);

    try {
      await fetch('/api/admin/instagram-reels/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      fetchReels();
    }
  };

  // Execute Delete Reel
  const confirmDeleteReel = async () => {
    if (!deletingReel) return;
    setIsDeleting(true);

    const targetId = deletingReel.id;

    // Optimistic delete
    setReels((prev) => prev.filter((r) => r.id !== targetId));

    try {
      const res = await fetch(`/api/admin/instagram-reels/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Reel deleted successfully from catalog!' });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to delete reel.' });
        await fetchReels();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Error deleting reel.' });
      await fetchReels();
    } finally {
      setIsDeleting(false);
      setDeletingReel(null);
    }
  };

  const activeCount = reels.filter((r) => r.is_active).length;

  return (
    <div className="space-y-8 text-xs font-sans">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#C87F4A]/25 shadow-silk flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono text-[#C87F4A] font-bold mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>Marketing Suite</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
            Instagram Reels Manager
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Add, delete, reorder, or toggle live Instagram reels on the homepage carousel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-200" />
            <span>{isFormOpen ? 'Close Form' : 'Add Reel'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#C87F4A]/20 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 block">Total Curated Reels</span>
          <span className="font-editorial text-xl font-bold text-[#1F1B16]">{reels.length} Reels</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#C87F4A]/20 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 block">Active in Homepage Carousel</span>
          <span className="font-editorial text-xl font-bold text-emerald-800">{activeCount} Visible</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#C87F4A]/20 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 block">Target Channel</span>
          <a
            href="https://www.instagram.com/neelsareehouse/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs font-bold text-[#C87F4A] hover:underline flex items-center gap-1 mt-1"
          >
            <span>@neelsareehouse</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-2xl text-xs font-sans flex items-center justify-between gap-2 shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="text-stone-400 hover:text-black">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* ==================================================== */}
      {/* 1. TOP FORM: ADD NEW INSTAGRAM REEL                 */}
      {/* ==================================================== */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddReel}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#C87F4A]/30 shadow-silk space-y-6 overflow-hidden"
          >
            <div className="border-b border-[#C87F4A]/20 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#C87F4A]" />
                <h3 className="font-editorial text-lg font-bold text-[#1F1B16]">
                  Add Instagram Reel to Carousel
                </h3>
              </div>
              <span className="text-[10px] font-mono text-stone-400">Live Shortcode Extraction</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instagram URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Instagram Reel or Post URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://www.instagram.com/reel/DR7Wt2CEiEz/ or /p/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-mono text-[#1F1B16] focus:outline-none focus:border-[#C87F4A]"
                  />
                  {detectedShortcode && (
                    <span className="absolute right-2.5 top-2 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      ID: {detectedShortcode}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 font-sans block">
                  Must match pattern <code>instagram.com/reel/[shortcode]</code> or <code>/p/[shortcode]</code>
                </span>
              </div>

              {/* Caption / Label Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Overlay Caption / Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Mysore Crepe Drape Tutorial in 4K"
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-sans text-[#1F1B16] focus:outline-none focus:border-[#C87F4A]"
                />
                <span className="text-[10px] text-stone-400 font-sans block">
                  Shown as overlay title on the website carousel independently of Instagram.
                </span>
              </div>
            </div>

            {/* Thumbnail Upload (Optional with Placeholder Fallback) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">
                Custom Thumbnail Image (Optional)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Upload Trigger Area */}
                <div className="sm:col-span-8 border-2 border-dashed border-[#C87F4A]/30 rounded-2xl p-4 text-center bg-[#FAF3E4]/30 hover:bg-[#FAF3E4]/60 transition-colors">
                  <input
                    type="file"
                    id="reel-thumb-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="reel-thumb-upload" className="cursor-pointer space-y-1 block">
                    <UploadCloud className="w-5 h-5 text-[#C87F4A] mx-auto" />
                    <span className="text-xs font-bold text-[#1F1B16] block">
                      Choose custom image file or paste URL below
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Falls back to elegant play-button placeholder if omitted
                    </span>
                  </label>
                </div>

                {/* Thumbnail Preview Box */}
                <div className="sm:col-span-4 flex items-center justify-center">
                  <div className="w-24 h-36 rounded-2xl overflow-hidden border border-stone-300 bg-[#1F1B16] relative flex items-center justify-center shadow-xs">
                    {thumbnailFilePreview || thumbnailInput ? (
                      <img
                        src={thumbnailFilePreview || thumbnailInput}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Generic Play Placeholder */
                      <div className="text-center p-2 text-white/70">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                          <Play className="w-4 h-4 ml-0.5 fill-white text-white" />
                        </div>
                        <span className="text-[8px] font-mono uppercase block text-stone-300">
                          Placeholder
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Image URL input */}
              <input
                type="url"
                placeholder="Or paste external image URL (e.g. https://.../thumb.jpg)"
                value={thumbnailInput}
                onChange={(e) => {
                  setThumbnailInput(e.target.value);
                  setThumbnailFilePreview(null);
                }}
                className="w-full px-3.5 py-2 bg-[#FAF3E4]/30 border border-stone-200 rounded-xl text-[11px] font-mono text-[#1F1B16] focus:outline-none focus:border-[#C87F4A]"
              />
            </div>

            {/* Form Submit Button */}
            <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !isUrlValid}
                className="px-6 py-2.5 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding Reel...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Reel</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* 2. REELS TABLE & CARD LIST (WITH REORDERING & DELETE)*/}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl border border-[#C87F4A]/25 shadow-silk overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF3E4]/40">
          <div className="flex items-center gap-2">
            <h3 className="font-editorial text-base font-bold text-[#1F1B16]">
              Curated Reels Catalog
            </h3>
            <span className="text-[10px] font-mono bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-bold">
              {reels.length} Total
            </span>
          </div>

          <button
            type="button"
            onClick={fetchReels}
            className="p-1.5 text-stone-400 hover:text-[#C87F4A] transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-stone-400">
            Loading curated reels catalog...
          </div>
        ) : reels.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Film className="w-8 h-8 text-stone-300 mx-auto" />
            <span className="text-xs font-bold text-[#1F1B16] block">No Instagram reels added yet</span>
            <p className="text-xs text-stone-500 font-sans max-w-sm mx-auto">
              Click the "Add Reel" button above to add your first Instagram reel to the homepage carousel.
            </p>
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-[#C87F4A] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Add First Reel
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  !reel.is_active ? 'bg-stone-50/70 opacity-60' : 'hover:bg-[#FAF3E4]/30'
                }`}
              >
                {/* Left Block: Reorder Controls + Thumbnail + Metadata */}
                <div className="flex items-center gap-3.5">
                  {/* Reorder Arrows */}
                  <div className="flex flex-col items-center gap-1 text-stone-400">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, 'up')}
                      className="p-1 hover:text-[#C87F4A] hover:bg-stone-100 rounded disabled:opacity-20 transition-colors"
                      title="Move Up in Carousel"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-stone-600">
                      #{reel.sort_order}
                    </span>
                    <button
                      type="button"
                      disabled={index === reels.length - 1}
                      onClick={() => handleMoveOrder(index, 'down')}
                      className="p-1 hover:text-[#C87F4A] hover:bg-stone-100 rounded disabled:opacity-20 transition-colors"
                      title="Move Down in Carousel"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail / Generic Placeholder */}
                  <div className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-2xl overflow-hidden bg-[#1F1B16] border border-[#C87F4A]/30 flex-shrink-0 flex items-center justify-center shadow-xs">
                    {reel.thumbnail_url ? (
                      <img
                        src={reel.thumbnail_url}
                        alt={reel.caption || reel.shortcode}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-0.5">
                          <Play className="w-3 h-3 ml-0.5 fill-white text-white" />
                        </div>
                        <span className="text-[7px] font-mono uppercase text-stone-400 block">
                          Play
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reel Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#1F1B16]">
                        {reel.shortcode}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                          reel.is_active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-stone-200 text-stone-600 border-stone-300'
                        }`}
                      >
                        {reel.is_active ? 'Live in Carousel' : 'Hidden'}
                      </span>
                    </div>

                    <p className="font-editorial text-sm font-bold text-[#1F1B16] line-clamp-1">
                      {reel.caption || 'No custom caption (Using reel shortcode)'}
                    </p>

                    <a
                      href={reel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-[#C87F4A] hover:underline flex items-center gap-1"
                    >
                      <Instagram className="w-3 h-3" />
                      <span>{reel.url}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Right Block: Active Toggle + Preview + Delete */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Preview Modal Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewReel(reel)}
                    className="p-2 bg-stone-100 hover:bg-[#FAF3E4] hover:text-[#C87F4A] rounded-xl text-stone-600 transition-colors flex items-center gap-1 font-mono text-[11px]"
                    title="Preview Reel Player"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Preview</span>
                  </button>

                  {/* Active / Inactive Toggle */}
                  <label
                    className="flex items-center gap-2 cursor-pointer select-none bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors"
                    title={reel.is_active ? 'Hide from carousel' : 'Show in carousel'}
                  >
                    <input
                      type="checkbox"
                      checked={reel.is_active}
                      onChange={() => handleToggleActive(reel)}
                      className="accent-[#C87F4A] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono font-semibold text-stone-700">
                      {reel.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </label>

                  {/* Delete Button (Opens Confirmation Modal) */}
                  <button
                    type="button"
                    onClick={() => setDeletingReel(reel)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Reel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 3. DELETE CONFIRMATION MODAL                         */}
      {/* ==================================================== */}
      <AnimatePresence>
        {deletingReel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeletingReel(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full border border-red-200 overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-editorial text-xl font-bold text-[#1F1B16]">
                  Delete Instagram Reel?
                </h3>
                <p className="text-xs text-stone-600 font-sans">
                  Are you sure you want to remove <strong>{deletingReel.shortcode}</strong> from your carousel catalog? This action cannot be undone.
                </p>
                {deletingReel.caption && (
                  <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-xl border border-stone-200 mt-2">
                    "{deletingReel.caption}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingReel(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteReel}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* 4. REEL PREVIEW MODAL                                */}
      {/* ==================================================== */}
      <AnimatePresence>
        {previewReel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewReel(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1F1B16] rounded-3xl max-w-sm w-full border border-[#C87F4A]/40 overflow-hidden shadow-2xl relative text-white"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[#C87F4A]" />
                  <span className="font-mono text-xs font-bold">{previewReel.shortcode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewReel(null)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-[9/16] bg-black">
                <iframe
                  src={`https://www.instagram.com/reel/${previewReel.shortcode}/embed/`}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>

              <div className="p-4 bg-[#1F1B16] border-t border-white/10">
                <p className="font-editorial text-sm font-bold">{previewReel.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
