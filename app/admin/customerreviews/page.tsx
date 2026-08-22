'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Flag,
  Pin,
  Send,
  SlidersHorizontal,
  Search,
  Filter,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  ShoppingBag,
  Sparkles,
  Eye,
  Settings,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Camera,
} from 'lucide-react';
import { CustomerReview } from '@/lib/reviews';

export default function CustomerReviewsAdminPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQueueTab, setActiveQueueTab] = useState<'PENDING' | 'APPROVED' | 'FLAGGED' | 'REJECTED' | 'ALL'>('PENDING');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [hasMediaOnly, setHasMediaOnly] = useState(false);
  const [verifiedBuyerOnly, setVerifiedBuyerOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Merchant Reply Expand State (Review ID -> text)
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Reject Modal State
  const [rejectingReview, setRejectingReview] = useState<CustomerReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Offensive or inappropriate content');
  const [customRejectionNote, setCustomRejectionNote] = useState('');

  // Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    caption: string;
    customer: string;
  } | null>(null);

  // Review Settings Slide-Over State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoApproveHighRatings, setAutoApproveHighRatings] = useState(true);
  const [reviewRequestDelayDays, setReviewRequestDelayDays] = useState('3');
  const [photoReviewIncentiveAmount, setPhotoReviewIncentiveAmount] = useState('500');
  const [enableWhatsAppReminders, setEnableWhatsAppReminders] = useState(true);

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalPublished = reviews.filter((r) => r.status === 'APPROVED').length;
    const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;
    const flaggedCount = reviews.filter((r) => r.status === 'FLAGGED').length;
    const rejectedCount = reviews.filter((r) => r.status === 'REJECTED').length;

    const totalRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = reviews.length > 0 ? (totalRatings / reviews.length).toFixed(2) : '4.85';

    const verifiedCount = reviews.filter((r) => r.isVerifiedBuyer).length;
    const verifiedPercent = reviews.length > 0 ? Math.round((verifiedCount / reviews.length) * 100) : 94;

    const totalUgcMedia = reviews.reduce((acc, r) => acc + r.mediaUrls.length, 0);

    const starCounts = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      avgRating,
      totalPublished,
      pendingCount,
      flaggedCount,
      rejectedCount,
      verifiedPercent,
      totalUgcMedia,
      starCounts,
    };
  }, [reviews]);

  // Filtered Reviews List
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (activeQueueTab !== 'ALL' && r.status !== activeQueueTab) return false;
      if (ratingFilter !== 'ALL' && r.rating !== ratingFilter) return false;
      if (hasMediaOnly && r.mediaUrls.length === 0) return false;
      if (verifiedBuyerOnly && !r.isVerifiedBuyer) return false;

      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        const matches =
          r.customerName.toLowerCase().includes(cleanQ) ||
          r.customerEmail.toLowerCase().includes(cleanQ) ||
          r.orderId.toLowerCase().includes(cleanQ) ||
          r.sareeTitle.toLowerCase().includes(cleanQ) ||
          r.sareeSku.toLowerCase().includes(cleanQ) ||
          r.headline.toLowerCase().includes(cleanQ) ||
          r.comment.toLowerCase().includes(cleanQ);

        if (!matches) return false;
      }

      return true;
    });
  }, [reviews, activeQueueTab, ratingFilter, hasMediaOnly, verifiedBuyerOnly, searchQuery]);

  // Action: Approve & Publish
  const handleApproveReview = async (id: string, customerName: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
        );
        triggerToast(`Review by ${customerName} approved and published to PDP.`);
      }
    } catch (err) {
      triggerToast('Error approving review.');
    }
  };

  // Action: Pin as Featured Review
  const handleTogglePinFeatured = async (id: string, currentStatus: boolean, sareeTitle: string) => {
    try {
      const newStatus = !currentStatus;
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isFeatured: newStatus } : r))
        );
        triggerToast(
          `Review ${newStatus ? 'pinned as Featured Spotlight' : 'unpinned'} on ${sareeTitle}.`
        );
      }
    } catch (err) {
      triggerToast('Error updating featured status.');
    }
  };

  // Action: Reject / Hide
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReview) return;

    try {
      const finalReason =
        rejectionReason === 'Custom Reason'
          ? customRejectionNote
          : rejectionReason;

      const res = await fetch(`/api/admin/reviews/${rejectingReview.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: finalReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === rejectingReview.id
              ? { ...r, status: 'REJECTED', rejectionReason: finalReason }
              : r
          )
        );
        triggerToast(`Review ${rejectingReview.id} rejected and hidden.`);
        setRejectingReview(null);
        setCustomRejectionNote('');
      }
    } catch (err) {
      triggerToast('Error rejecting review.');
    }
  };

  // Action: Submit Public Merchant Reply
  const handleSubmitMerchantReply = async (id: string) => {
    if (!replyText.trim()) return;

    try {
      setIsSubmittingReply(true);
      const res = await fetch(`/api/admin/reviews/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Sri Chinmaya (Managing Director)',
          text: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  merchantReply: {
                    author: 'Sri Chinmaya (Managing Director)',
                    text: replyText.trim(),
                    repliedAt: 'Just now',
                  },
                }
              : r
          )
        );
        triggerToast('Official merchant reply published.');
        setReplyingReviewId(null);
        setReplyText('');
      }
    } catch (err) {
      triggerToast('Error submitting reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
      {/* 1. TOP ACTION HEADER & CONTROLS                    */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Review Moderation & UGC Content Hub
            </h1>
            {summary.pendingCount > 0 && (
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>{summary.pendingCount} Pending Triage</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Customer Reviews, Verified Drape Photo UGC Lightboxes, Sentiment Analytics & Brand Responses
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Moderation & WhatsApp Rules</span>
          </button>

          <Link
            href="/products"
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>View Live PDPs</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. KPI METRIC SUMMARY BANNER                       */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Average Rating Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Average Store Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {summary.avgRating}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Top Tier Handloom Trust</span>
          </div>
        </div>

        {/* Total Published */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Published Reviews</span>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {summary.totalPublished} Reviews
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Live across catalog PDP pages
          </div>
        </div>

        {/* Pending Moderation Queue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Pending Moderation</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tracking-tight">
            {summary.pendingCount} Reviews
          </div>
          <div className="text-[11px] font-mono text-amber-800">
            Awaiting curator approval
          </div>
        </div>

        {/* Verified Buyer % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Verified Buyer Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tracking-tight">
            {summary.verifiedPercent}%
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Tied to delivered order IDs
          </div>
        </div>

        {/* UGC Media Attached */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Customer UGC Media</span>
            <Camera className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-700 tracking-tight">
            {summary.totalUgcMedia} Drape Photos
          </div>
          <div className="text-[11px] font-mono text-purple-900">
            Real life drape visual proof
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. FILTER BAR & QUEUE TABS                         */}
      {/* ================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Customer, Order #, SKU, Headline, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
            />
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-sans">
            {/* Rating Selector */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 font-mono text-[11px]">
              <span className="text-slate-400 px-1 font-bold">Rating:</span>
              {(['ALL', 5, 4, 3, 2, 1] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRatingFilter(r)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                    ratingFilter === r
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'ALL' ? 'All' : `${r}★`}
                </button>
              ))}
            </div>

            {/* Has Photo UGC Toggle */}
            <button
              type="button"
              onClick={() => setHasMediaOnly(!hasMediaOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                hasMediaOnly
                  ? 'border-purple-300 bg-purple-50 text-purple-950 font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>With Photo UGC</span>
            </button>

            {/* Verified Buyer Toggle */}
            <button
              type="button"
              onClick={() => setVerifiedBuyerOnly(!verifiedBuyerOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                verifiedBuyerOnly
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Buyers Only</span>
            </button>
          </div>
        </div>

        {/* Queue Status Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          {[
            {
              key: 'PENDING',
              label: 'Pending Approval',
              count: summary.pendingCount,
              urgent: summary.pendingCount > 0,
            },
            { key: 'APPROVED', label: 'Published Live', count: summary.totalPublished },
            { key: 'FLAGGED', label: 'Flagged / Spam', count: summary.flaggedCount },
            { key: 'REJECTED', label: 'Rejected / Hidden', count: summary.rejectedCount },
            { key: 'ALL', label: 'All Reviews', count: reviews.length },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveQueueTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeQueueTab === tab.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeQueueTab === tab.key
                    ? 'bg-slate-800 text-amber-300'
                    : tab.urgent
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. DENSE REVIEW MANAGEMENT CARDS / FEED            */}
      {/* ================================================== */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center font-mono text-xs text-slate-400">
            Loading review moderation queue...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center font-mono text-xs text-slate-400">
            No customer reviews match your active filter criteria.
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isReplying = replyingReviewId === rev.id;

            return (
              <div
                key={rev.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-2xs space-y-4 ${
                  rev.isFeatured
                    ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top Header: Customer + Product + Sentiment + Status */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  {/* Left: Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-300 font-mono font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {rev.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs font-sans">
                          {rev.customerName}
                        </span>
                        {rev.isVerifiedBuyer && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verified Buyer • Order #{rev.orderId}</span>
                          </span>
                        )}
                        {rev.isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-900 font-bold bg-amber-100 px-2 py-0.2 rounded-full border border-amber-300">
                            <Pin className="w-3 h-3 text-amber-600 fill-amber-500" />
                            <span>Pinned Spotlight</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {rev.customerEmail} • Submitted {rev.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Right: Saree Product Pill & Sentiment Badge */}
                  <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                    {/* Sentiment */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        rev.sentiment === 'POSITIVE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : rev.sentiment === 'NEUTRAL'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {rev.sentiment === 'POSITIVE' && 'Sentiment: Positive'}
                      {rev.sentiment === 'NEUTRAL' && 'Sentiment: Neutral'}
                      {rev.sentiment === 'NEGATIVE' && 'Sentiment: Negative / Critical'}
                    </span>

                    {/* Saree Tag */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                      <img
                        src={rev.sareeThumbnail}
                        alt={rev.sareeTitle}
                        className="w-6 h-7 rounded object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="text-left font-sans">
                        <div className="font-bold text-[11px] text-slate-900 line-clamp-1">
                          {rev.sareeTitle}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">
                          {rev.sareeSku} • {rev.sareeWeave}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Stars & Review Content Body */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rev.rating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-slate-900 text-xs font-sans">
                      "{rev.headline}"
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {rev.comment}
                  </p>

                  {/* Customer UGC Photo Lightbox Thumbnails */}
                  {rev.mediaUrls.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                        Customer Drape Photos (Click to Zoom):
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {rev.mediaUrls.map((url, i) => (
                          <div
                            key={i}
                            onClick={() =>
                              setLightboxImage({
                                url,
                                caption: rev.headline,
                                customer: rev.customerName,
                              })
                            }
                            className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-300 shadow-2xs hover:ring-2 ring-blue-500 transition-all"
                          >
                            <img
                              src={url}
                              alt="UGC preview"
                              className="w-16 h-20 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Merchant Reply */}
                  {rev.merchantReply && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs font-sans mt-3">
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="font-bold text-blue-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Official Brand Response • {rev.merchantReply.author}</span>
                        </span>
                        <span className="text-slate-400">{rev.merchantReply.repliedAt}</span>
                      </div>
                      <p className="text-slate-700 italic">"{rev.merchantReply.text}"</p>
                    </div>
                  )}

                  {/* Inline Rejection Reason Display if Rejected */}
                  {rev.status === 'REJECTED' && rev.rejectionReason && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] font-mono text-rose-900">
                      <strong>Rejection Reason:</strong> {rev.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Inline Public Merchant Reply Box (When expanded) */}
                {isReplying && (
                  <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-3 animate-fade-in text-xs font-sans">
                    <div className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>Post Official Public Merchant Reply</span>
                    </div>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your gracious brand response: e.g. Namaskara Radhika ji, thank you for choosing our heritage handlooms..."
                      className="w-full p-3 bg-white border border-blue-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(null);
                          setReplyText('');
                        }}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingReply || !replyText.trim()}
                        onClick={() => handleSubmitMerchantReply(rev.id)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Brand Reply</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Bottom Moderation Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                      Status:
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        rev.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : rev.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : rev.status === 'FLAGGED'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Merchant Reply Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingReviewId(isReplying ? null : rev.id);
                        if (!isReplying && rev.merchantReply) {
                          setReplyText(rev.merchantReply.text);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>{rev.merchantReply ? 'Edit Reply' : 'Public Reply'}</span>
                    </button>

                    {/* Pin as Featured */}
                    <button
                      type="button"
                      onClick={() => handleTogglePinFeatured(rev.id, rev.isFeatured, rev.sareeTitle)}
                      className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 ${
                        rev.isFeatured
                          ? 'border-amber-300 bg-amber-50 text-amber-900'
                          : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{rev.isFeatured ? 'Pinned on PDP' : 'Pin Spotlight'}</span>
                    </button>

                    {/* Reject / Hide */}
                    {rev.status !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => setRejectingReview(rev)}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Reject / Hide</span>
                      </button>
                    )}

                    {/* Approve & Publish */}
                    {rev.status !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleApproveReview(rev.id, rev.customerName)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Publish</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================================================== */}
      {/* 5. REJECTION REASON MODAL                          */}
      {/* ================================================== */}
      {rejectingReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Reject & Hide Review ({rejectingReview.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]">
                Customer: <strong className="text-slate-900">{rejectingReview.customerName}</strong>
                <br />
                Headline: "{rejectingReview.headline}"
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Rejection Classification *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 font-medium"
                >
                  <option value="Offensive or inappropriate content">
                    Offensive or inappropriate content
                  </option>
                  <option value="Spam / Promotional link to external site">
                    Spam / Promotional link to external site
                  </option>
                  <option value="Incorrect product / Review refers to another merchant">
                    Incorrect product / Review refers to another merchant
                  </option>
                  <option value="Logistics courier complaint (Unrelated to saree craftsmanship)">
                    Logistics courier complaint (Unrelated to saree craftsmanship)
                  </option>
                  <option value="Custom Reason">Custom Reason...</option>
                </select>
              </div>

              {rejectionReason === 'Custom Reason' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custom Audit Explanation *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={customRejectionNote}
                    onChange={(e) => setCustomRejectionNote(e.target.value)}
                    placeholder="Enter audit rationale for hiding this review..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRejectingReview(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. LIGHTBOX ZOOM MODAL                             */}
      {/* ================================================== */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="relative max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={lightboxImage.url}
              alt="UGC High Res"
              className="w-full h-96 object-cover"
            />

            <div className="p-4 bg-slate-900 text-white text-xs font-sans space-y-0.5">
              <div className="font-bold">"{lightboxImage.caption}"</div>
              <div className="text-[11px] font-mono text-amber-300">
                Uploaded by {lightboxImage.customer}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 7. REVIEW SETTINGS SLIDE-OVER DRAWER               */}
      {/* ================================================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in select-none">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between text-slate-900">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 font-sans">
                    UGC Moderation & Automation Settings
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Form Body */}
              <div className="p-6 space-y-6 text-xs font-sans overflow-y-auto">
                {/* Auto-Publish Rules */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>1. Auto-Publish Smart Guard</span>
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        Auto-Publish 4 & 5-Star Reviews
                      </span>
                      <input
                        type="checkbox"
                        checked={autoApproveHighRatings}
                        onChange={(e) => setAutoApproveHighRatings(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                      Automatically approves and publishes verified customer reviews with 4 or 5 stars without requiring manual triage.
                    </p>
                  </div>
                </div>

                {/* Post-Purchase Request Trigger */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>2. Post-Purchase Review Scheduler</span>
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Trigger Review Request After Delivery Webhook *
                      </label>
                      <select
                        value={reviewRequestDelayDays}
                        onChange={(e) => setReviewRequestDelayDays(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 font-mono font-bold"
                      >
                        <option value="1">1 Day after BlueDart Delivery</option>
                        <option value="3">3 Days after BlueDart Delivery (Recommended)</option>
                        <option value="7">7 Days after BlueDart Delivery</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="waReminders"
                        checked={enableWhatsAppReminders}
                        onChange={(e) => setEnableWhatsAppReminders(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <label
                        htmlFor="waReminders"
                        className="text-xs text-slate-800 font-semibold cursor-pointer"
                      >
                        Dispatch WhatsApp interactive review request buttons
                      </label>
                    </div>
                  </div>
                </div>

                {/* Photo UGC Incentive Bonus */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span>3. Photo UGC Drape Incentive</span>
                  </h4>
                  <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-2">
                    <label className="block font-semibold text-purple-950 mb-1">
                      Store Credit Reward for Photo/Video Review (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-purple-900 font-bold">₹</span>
                      <input
                        type="number"
                        value={photoReviewIncentiveAmount}
                        onChange={(e) => setPhotoReviewIncentiveAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-purple-300 rounded-xl text-xs font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <p className="text-[10px] text-purple-900 font-mono">
                      Instantly generates a ₹{photoReviewIncentiveAmount} gift coupon when a verified buyer uploads drape photos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  triggerToast('Review moderation & WhatsApp automation rules saved.');
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Save Automation Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
