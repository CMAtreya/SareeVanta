'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  Gift,
  Copy,
  Check,
  Crown,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  RotateCcw,
  SlidersHorizontal,
  X,
  Trash2,
  Layers,
  ChevronRight,
  HelpCircle,
  Eye,
} from 'lucide-react';

export interface CouponItem {
  id: string;
  code: string;
  title: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING' | 'BUY_X_GET_Y';
  value: number; // e.g. 15 for 15%, 2000 for ₹2,000
  maxDiscountCap?: number; // e.g. 5000
  bxgyDetails?: string;
  minOrderValue: number;
  usageCount: number;
  maxUsageLimit: number;
  limitPerCustomer: number; // 1
  revenueGenerated: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'PAUSED';
  targetAudience: 'ALL' | 'FIRST_TIME' | 'VIP_ONLY' | 'NRI_ONLY';
  applicableWeaves: string[]; // e.g. ["Mysore Silk", "Banarasi"] or ["ALL"]
  excludedWeaves: string[];
}

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: 'coup-1',
    code: 'MYSORE10',
    title: 'Heritage Mysore Silk Welcoming Offer',
    type: 'PERCENTAGE',
    value: 10,
    maxDiscountCap: 3500,
    minOrderValue: 15000,
    usageCount: 184,
    maxUsageLimit: 500,
    limitPerCustomer: 1,
    revenueGenerated: 3480000,
    startDate: '01 Aug 2026',
    endDate: '31 Oct 2026',
    status: 'ACTIVE',
    targetAudience: 'ALL',
    applicableWeaves: ['Mysore Silk'],
    excludedWeaves: ['Bridal Kanchipuram'],
  },
  {
    id: 'coup-2',
    code: 'ROYALVIP5000',
    title: 'Royal Heritage Patron Loyalty Reward',
    type: 'FIXED_AMOUNT',
    value: 5000,
    minOrderValue: 40000,
    usageCount: 38,
    maxUsageLimit: 100,
    limitPerCustomer: 1,
    revenueGenerated: 2150000,
    startDate: '15 Aug 2026',
    endDate: '30 Nov 2026',
    status: 'ACTIVE',
    targetAudience: 'VIP_ONLY',
    applicableWeaves: ['ALL'],
    excludedWeaves: [],
  },
  {
    id: 'coup-3',
    code: 'FIRSTDRAPE',
    title: 'First-Time Handloom Enthusiast Privilege',
    type: 'PERCENTAGE',
    value: 15,
    maxDiscountCap: 4000,
    minOrderValue: 12000,
    usageCount: 312,
    maxUsageLimit: 1000,
    limitPerCustomer: 1,
    revenueGenerated: 5890000,
    startDate: '01 Jan 2026',
    endDate: '31 Dec 2026',
    status: 'ACTIVE',
    targetAudience: 'FIRST_TIME',
    applicableWeaves: ['ALL'],
    excludedWeaves: [],
  },
  {
    id: 'coup-4',
    code: 'BLOUSEFREE',
    title: 'Bridal Season Silk Blouse Promotion',
    type: 'BUY_X_GET_Y',
    value: 0,
    bxgyDetails: 'Buy Saree ≥ ₹25,000, Get Matching Pure Raw Silk Blouse Free (Valued @ ₹3,500)',
    minOrderValue: 25000,
    usageCount: 46,
    maxUsageLimit: 200,
    limitPerCustomer: 1,
    revenueGenerated: 1620000,
    startDate: '10 Aug 2026',
    endDate: '15 Nov 2026',
    status: 'ACTIVE',
    targetAudience: 'ALL',
    applicableWeaves: ['Kanchipuram', 'Paithani', 'Banarasi'],
    excludedWeaves: [],
  },
  {
    id: 'coup-5',
    code: 'EXPRESSAIR',
    title: 'Free BlueDart Express Air Courier',
    type: 'FREE_SHIPPING',
    value: 0,
    minOrderValue: 18000,
    usageCount: 94,
    maxUsageLimit: 300,
    limitPerCustomer: 1,
    revenueGenerated: 1980000,
    startDate: '01 Aug 2026',
    endDate: '30 Sep 2026',
    status: 'ACTIVE',
    targetAudience: 'ALL',
    applicableWeaves: ['ALL'],
    excludedWeaves: [],
  },
  {
    id: 'coup-6',
    code: 'DIWALI2026',
    title: 'Grand Diwali Festival Early Bird',
    type: 'PERCENTAGE',
    value: 20,
    maxDiscountCap: 7500,
    minOrderValue: 30000,
    usageCount: 0,
    maxUsageLimit: 250,
    limitPerCustomer: 1,
    revenueGenerated: 0,
    startDate: '20 Oct 2026',
    endDate: '12 Nov 2026',
    status: 'SCHEDULED',
    targetAudience: 'ALL',
    applicableWeaves: ['ALL'],
    excludedWeaves: [],
  },
  {
    id: 'coup-7',
    code: 'SUMMERWEAVE26',
    title: 'Summer Chanderi & Organza Flash Sale',
    type: 'FIXED_AMOUNT',
    value: 2000,
    minOrderValue: 10000,
    usageCount: 150,
    maxUsageLimit: 150,
    limitPerCustomer: 1,
    revenueGenerated: 1850000,
    startDate: '01 May 2026',
    endDate: '30 Jun 2026',
    status: 'EXPIRED',
    targetAudience: 'ALL',
    applicableWeaves: ['Chanderi Silk', 'Organza'],
    excludedWeaves: ['Kanchipuram'],
  },
];

export default function CouponsMarketingPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED'>('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for New Coupon Workstation
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CouponItem['type']>('PERCENTAGE');
  const [formValue, setFormValue] = useState<number>(10);
  const [formMaxCap, setFormMaxCap] = useState<number>(3000);
  const [formBxgyDetails, setFormBxgyDetails] = useState('Buy any Pure Silk Saree, Get 1m Pure Raw Silk Blouse Free');
  const [formMOV, setFormMOV] = useState<number>(15000);
  const [formMaxUsage, setFormMaxUsage] = useState<number>(500);
  const [formLimitPerCustomer, setFormLimitPerCustomer] = useState<boolean>(true);
  const [formTargetAudience, setFormTargetAudience] = useState<CouponItem['targetAudience']>('ALL');
  const [formApplicableWeaves, setFormApplicableWeaves] = useState<string[]>(['ALL']);
  const [formStartDate, setFormStartDate] = useState('2026-08-25');
  const [formEndDate, setFormEndDate] = useState('2026-11-15');

  // Summary Metrics
  const summary = useMemo(() => {
    const activeCount = coupons.filter((c) => c.status === 'ACTIVE').length;
    const totalRedemptions = coupons.reduce((acc, c) => acc + c.usageCount, 0);
    const totalGrossRevenue = coupons.reduce((acc, c) => acc + c.revenueGenerated, 0);

    return {
      activeCount,
      totalRedemptions,
      totalGrossRevenue,
    };
  }, [coupons]);

  // Filtered List
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        const matches =
          c.code.toLowerCase().includes(cleanQ) ||
          c.title.toLowerCase().includes(cleanQ) ||
          (c.bxgyDetails && c.bxgyDetails.toLowerCase().includes(cleanQ));

        if (!matches) return false;
      }

      return true;
    });
  }, [coupons, statusFilter, typeFilter, searchQuery]);

  // Random Code Generator
  const generateRandomCode = () => {
    const prefixes = ['SILK', 'HERITAGE', 'ROYAL', 'FESTIVE', 'BRIDAL', 'UTSAV'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormCode(`${randomPrefix}${randomNum}`);
  };

  React.useEffect(() => {
    fetch('/api/admin/coupons')
      .then((res) => res.json())
      .then((data) => {
        if (data.coupons && Array.isArray(data.coupons) && data.coupons.length > 0) {
          const formatted: CouponItem[] = data.coupons.map((c: any) => ({
            id: c.id,
            code: c.code,
            title: `Privilege Coupon ${c.code}`,
            type: c.discount_type === 'FIXED' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
            value: Number(c.discount_value),
            minOrderValue: Math.round((c.min_order_amount_paise || 0) / 100),
            usageCount: c.times_used || 0,
            maxUsageLimit: c.usage_limit || 500,
            limitPerCustomer: 1,
            revenueGenerated: (c.times_used || 0) * 25000,
            startDate: '2026-08-01',
            endDate: '2026-12-31',
            status: c.is_active ? 'ACTIVE' : 'PAUSED',
            targetAudience: 'ALL',
            applicableWeaves: ['ALL'],
            excludedWeaves: [],
          }));
          setCoupons(formatted);
        }
      })
      .catch((err) => console.error('[Coupons API] Error fetching coupons:', err));
  }, []);

  // Handle Create Coupon Submission
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formTitle.trim()) return;

    const newCode = formCode.trim().toUpperCase();

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          discount_type: formType === 'FIXED_AMOUNT' ? 'FIXED' : 'PERCENTAGE',
          discount_value: formValue,
          min_order_amount_inr: formMOV,
          is_active: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const createdId = data.coupon?.id || `coup-${Date.now()}`;

        const newCoupon: CouponItem = {
          id: createdId,
          code: newCode,
          title: formTitle.trim(),
          type: formType,
          value: formValue,
          maxDiscountCap: formType === 'PERCENTAGE' ? formMaxCap : undefined,
          bxgyDetails: formType === 'BUY_X_GET_Y' ? formBxgyDetails : undefined,
          minOrderValue: formMOV,
          usageCount: 0,
          maxUsageLimit: formMaxUsage,
          limitPerCustomer: formLimitPerCustomer ? 1 : 99,
          revenueGenerated: 0,
          startDate: formStartDate,
          endDate: formEndDate,
          status: 'ACTIVE',
          targetAudience: formTargetAudience,
          applicableWeaves: formApplicableWeaves,
          excludedWeaves: [],
        };

        setCoupons((prev) => [newCoupon, ...prev]);
        setIsCreatorOpen(false);
        triggerToast(`Promo Coupon ${newCoupon.code} created & activated.`);
        resetForm();
      }
    } catch (err) {
      console.error('[Coupons API] Error creating coupon:', err);
    }
  };

  const resetForm = () => {
    setFormCode('');
    setFormTitle('');
    setFormType('PERCENTAGE');
    setFormValue(10);
    setFormMaxCap(3000);
    setFormMOV(15000);
    setFormMaxUsage(500);
  };

  // Toggle Pause/Active
  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        triggerToast(`Coupon ${c.code} is now ${newStatus}.`);
        return { ...c, status: newStatus };
      })
    );
  };

  const deleteCoupon = (id: string, code: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    triggerToast(`Coupon ${code} removed from active promotional registry.`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

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
              Discounts & Promotional Engine
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C87F4A]" />
              <span>{summary.activeCount} Active Campaigns</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Coupon Codes, BXGY Bundles, Minimum Order Thresholds & VIP Segment Rules
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            generateRandomCode();
            setIsCreatorOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-200" />
          <span>+ Create New Coupon</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* 2. SUMMARY METRICS CARDS                           */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Total Campaign Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
            ₹{(summary.totalGrossRevenue / 100000).toFixed(1)} Lakhs
          </div>
          <div className="text-[11px] font-mono text-emerald-700">
            Attributed GMV generated from coupon redemptions
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Total Redemptions</span>
            <Tag className="w-4 h-4 text-[#7A1C30]" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
            {summary.totalRedemptions} Orders
          </div>
          <div className="text-[11px] font-mono text-stone-500">
            Across online cart checkouts
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Active Live Offers</span>
            <Sparkles className="w-4 h-4 text-[#C87F4A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 tracking-tight">
            {summary.activeCount} Active Codes
          </div>
          <div className="text-[11px] font-mono text-[#C87F4A] font-bold">
            Live and redeemable by patrons
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. SEARCH & SEGMENTATION TABS                      */}
      {/* ================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Coupon Code, Campaign Title, or Target Audience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF6F0] border border-[#E8DCC9] focus:bg-white focus:border-[#7A1C30] rounded-xl text-xs text-stone-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
              Offer Type:
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#FAF6F0] border border-[#E8DCC9] rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:border-[#7A1C30]"
            >
              <option value="ALL">All Offer Types</option>
              <option value="PERCENTAGE">Percentage Off (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
              <option value="BUY_X_GET_Y">Buy X Get Y (BXGY)</option>
              <option value="FREE_SHIPPING">Free Express Shipping</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {[
            { key: 'ALL', label: 'All Coupons', count: coupons.length },
            {
              key: 'ACTIVE',
              label: 'Live & Active',
              count: coupons.filter((c) => c.status === 'ACTIVE').length,
            },
            {
              key: 'SCHEDULED',
              label: 'Scheduled',
              count: coupons.filter((c) => c.status === 'SCHEDULED').length,
            },
            {
              key: 'EXPIRED',
              label: 'Expired / Archived',
              count: coupons.filter((c) => c.status === 'EXPIRED').length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-[#7A1C30] text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  statusFilter === tab.key ? 'bg-[#5F1424] text-[#E2CE9F]' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. DISCOUNT MASTER LIST TABLE                      */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-[#E8DCC9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#FAF6F0] border-b border-[#E8DCC9] text-stone-700 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5">Coupon Code & Campaign</th>
                <th className="p-3.5">Discount Logic</th>
                <th className="p-3.5 text-center">Usage / Max Cap</th>
                <th className="p-3.5">Attributed Revenue</th>
                <th className="p-3.5">Validity Schedule</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No promo coupons found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const usagePercent = Math.min(
                    100,
                    Math.round((coupon.usageCount / coupon.maxUsageLimit) * 100)
                  );

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Coupon Code & Campaign */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCode(coupon.code)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Copy Promo Code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="font-semibold text-slate-900 text-xs mt-1">
                          {coupon.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Min. Order: ₹{coupon.minOrderValue.toLocaleString('en-IN')}
                          {coupon.targetAudience === 'VIP_ONLY' && ' • VIPs Only'}
                          {coupon.targetAudience === 'FIRST_TIME' && ' • New Customers Only'}
                        </div>
                      </td>

                      {/* Discount Logic */}
                      <td className="p-3.5">
                        {coupon.type === 'PERCENTAGE' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <Percent className="w-3 h-3 text-blue-600" />
                              <span>{coupon.value}% Flat Off</span>
                            </span>
                            {coupon.maxDiscountCap && (
                              <div className="text-[10px] font-mono text-slate-500">
                                Up to ₹{coupon.maxDiscountCap.toLocaleString('en-IN')} max
                              </div>
                            )}
                          </div>
                        )}

                        {coupon.type === 'FIXED_AMOUNT' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <DollarSign className="w-3 h-3 text-emerald-600" />
                            <span>₹{coupon.value.toLocaleString('en-IN')} Off</span>
                          </span>
                        )}

                        {coupon.type === 'BUY_X_GET_Y' && (
                          <div className="space-y-0.5 max-w-[200px]">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                              <Gift className="w-3 h-3 text-purple-600" />
                              <span>BXGY Silk Blouse</span>
                            </span>
                            <div className="text-[10px] text-slate-600 line-clamp-1">
                              {coupon.bxgyDetails}
                            </div>
                          </div>
                        )}

                        {coupon.type === 'FREE_SHIPPING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Truck className="w-3 h-3 text-amber-600" />
                            <span>Free Express Air</span>
                          </span>
                        )}
                      </td>

                      {/* Usage / Max Cap */}
                      <td className="p-3.5 text-center font-mono">
                        <div className="text-xs font-bold text-slate-900">
                          {coupon.usageCount} / {coupon.maxUsageLimit}
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usagePercent >= 90
                                ? 'bg-rose-500'
                                : usagePercent >= 50
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">{usagePercent}% claimed</span>
                      </td>

                      {/* Attributed Revenue */}
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-slate-900 text-xs">
                          ₹{coupon.revenueGenerated.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">GMV Captured</div>
                      </td>

                      {/* Validity Schedule */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">
                        <div>{coupon.startDate}</div>
                        <div className="text-slate-400 text-[10px]">until {coupon.endDate}</div>
                      </td>

                      {/* Status Pill */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            coupon.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : coupon.status === 'SCHEDULED'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : coupon.status === 'PAUSED'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              coupon.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : coupon.status === 'SCHEDULED'
                                ? 'bg-blue-500'
                                : coupon.status === 'PAUSED'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{coupon.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleCouponStatus(coupon.id)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                          >
                            {coupon.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteCoupon(coupon.id, coupon.code)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ================================================== */}
      {/* 5. ADVANCED COUPON CREATOR MODAL                   */}
      {/* ================================================== */}
      {isCreatorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Advanced Promotional Coupon Workstation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatorOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateCoupon} className="p-6 space-y-5 overflow-y-auto text-xs font-sans">
              {/* Row 1: Code & Generator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Coupon Code (Case-Insensitive) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MYSORE15"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tracking-wider uppercase"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs whitespace-nowrap"
                    >
                      Randomize
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Internal Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Navratri 2026 Silk Special"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Discount Type Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Discount Mechanism *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'PERCENTAGE', label: 'Percentage Off (%)', icon: Percent },
                    { key: 'FIXED_AMOUNT', label: 'Fixed Amount (₹)', icon: DollarSign },
                    { key: 'BUY_X_GET_Y', label: 'Buy X Get Y (BXGY)', icon: Gift },
                    { key: 'FREE_SHIPPING', label: 'Free Air Shipping', icon: Truck },
                  ].map((dt) => (
                    <button
                      key={dt.key}
                      type="button"
                      onClick={() => setFormType(dt.key as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        formType === dt.key
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <dt.icon
                        className={`w-4 h-4 mb-1.5 ${
                          formType === dt.key ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <div className="font-bold text-slate-900 text-xs">{dt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Values & Caps based on Type */}
              {formType === 'PERCENTAGE' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      required
                      value={formValue}
                      onChange={(e) => setFormValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Maximum Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      value={formMaxCap}
                      onChange={(e) => setFormMaxCap(Number(e.target.value))}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
              )}

              {formType === 'FIXED_AMOUNT' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Flat Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              )}

              {formType === 'BUY_X_GET_Y' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block font-semibold text-slate-700">
                    BXGY Free Gift Bundle Inscription
                  </label>
                  <input
                    type="text"
                    required
                    value={formBxgyDetails}
                    onChange={(e) => setFormBxgyDetails(e.target.value)}
                    placeholder="e.g. Buy 1 Saree, Get 1m Pure Raw Silk Blouse Piece Free"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              )}

              {/* Row 4: Granular Eligibility Rules */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Granular Eligibility Rules</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Minimum Order Value (MOV in ₹)
                    </label>
                    <input
                      type="number"
                      value={formMOV}
                      onChange={(e) => setFormMOV(Number(e.target.value))}
                      placeholder="e.g. 15000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Target Customer Segment
                    </label>
                    <select
                      value={formTargetAudience}
                      onChange={(e) => setFormTargetAudience(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-900"
                    >
                      <option value="ALL">All Storefront Visitors</option>
                      <option value="FIRST_TIME">First-Time Buyers Only</option>
                      <option value="VIP_ONLY">VIP Patrons Only (&gt;₹50k Spend)</option>
                      <option value="NRI_ONLY">International NRI Orders Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Total Global Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formMaxUsage}
                      onChange={(e) => setFormMaxUsage(Number(e.target.value))}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="limitCust"
                      checked={formLimitPerCustomer}
                      onChange={(e) => setFormLimitPerCustomer(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <label htmlFor="limitCust" className="font-semibold text-slate-700 cursor-pointer">
                      Limit to 1 redemption per customer phone/email
                    </label>
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Valid From</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreatorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Activate Promotional Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
