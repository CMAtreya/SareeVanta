'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Search,
  Percent,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  X,
  Trash2,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export interface CouponItem {
  id: string;
  code: string;
  title: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number; // e.g. 10 for 10%, 2000 for ₹2,000
  maxDiscountCap: number; // e.g. 3000
  minOrderValue: number;
  usageCount: number;
  maxUsageLimit: number;
  revenueGenerated: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PAUSED';
}

export interface AutomaticDiscountRule {
  id: string;
  title: string;
  badgeText: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  maxCapINR: number;
  minOrderThresholdINR: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PAUSED';
}

const INITIAL_AUTO_DISCOUNTS: AutomaticDiscountRule[] = [
  {
    id: 'rule-1',
    title: 'Festive Season Threshold Privilege',
    badgeText: 'Auto-Applied at Cart',
    type: 'FIXED_AMOUNT',
    value: 2000,
    maxCapINR: 2000,
    minOrderThresholdINR: 25000,
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    status: 'ACTIVE',
  },
  {
    id: 'rule-2',
    title: 'Royal Bridal Trousseau 10% Edit',
    badgeText: 'Cart Orders ₹35,000+',
    type: 'PERCENTAGE',
    value: 10,
    maxCapINR: 4500,
    minOrderThresholdINR: 35000,
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    status: 'ACTIVE',
  },
];

export default function CouponsMarketingPage() {
  const [activeTab, setActiveTab] = useState<'COUPONS' | 'AUTOMATIC_DISCOUNTS'>('COUPONS');

  // 1. Coupons State
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);

  // 2. Automatic Discount Rules State
  const [autoDiscounts, setAutoDiscounts] = useState<AutomaticDiscountRule[]>(INITIAL_AUTO_DISCOUNTS);

  // Filters & Notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State: Create Coupon
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [formValue, setFormValue] = useState<string>('10');
  const [formMaxCap, setFormMaxCap] = useState<string>('3000');
  const [formMOV, setFormMOV] = useState<string>('15000');
  const [formMaxUsage, setFormMaxUsage] = useState<string>('500');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State: Create Auto Discount Rule
  const [isAutoRuleModalOpen, setIsAutoRuleModalOpen] = useState(false);
  const [autoTitle, setAutoTitle] = useState('');
  const [autoBadge, setAutoBadge] = useState('Festive Special');
  const [autoType, setAutoType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('FIXED_AMOUNT');
  const [autoValue, setAutoValue] = useState<string>('2000');
  const [autoMaxCap, setAutoMaxCap] = useState<string>('2000');
  const [autoMOV, setAutoMOV] = useState<string>('25000');
  const [autoStartDate, setAutoStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoEndDate, setAutoEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Coupons from DB
  const fetchCoupons = () => {
    setCouponsLoading(true);
    fetch('/api/admin/coupons')
      .then((res) => res.json())
      .then((data) => {
        if (data.coupons && Array.isArray(data.coupons)) {
          const formatted: CouponItem[] = data.coupons.map((c: any) => {
            let parsedTitle = `Privilege Promo ${c.code}`;
            let parsedMaxCap = 3000;

            try {
              if (c.description && c.description.startsWith('{')) {
                const meta = JSON.parse(c.description);
                parsedTitle = meta.title || parsedTitle;
                parsedMaxCap = meta.maxCapINR ? Number(meta.maxCapINR) : 3000;
              } else if (c.description) {
                parsedTitle = c.description;
              }
            } catch (e) {
              // fallback
            }

            return {
              id: c.id,
              code: c.code,
              title: parsedTitle,
              type: c.discount_type === 'FIXED' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
              value: Number(c.discount_value || 0),
              maxDiscountCap: parsedMaxCap,
              minOrderValue: Math.round((c.min_order_amount_paise || 0) / 100),
              usageCount: Number(c.times_redeemed || c.usage_count || 0),
              maxUsageLimit: Number(c.max_redemptions || 500),
              revenueGenerated: Math.round((c.attributed_revenue_paise || 0) / 100),
              startDate: c.starts_at ? new Date(c.starts_at).toISOString().split('T')[0] : '2026-08-01',
              endDate: c.expires_at ? new Date(c.expires_at).toISOString().split('T')[0] : '2026-12-31',
              status: c.is_active ? 'ACTIVE' : 'PAUSED',
            };
          });
          setCoupons(formatted);
        }
      })
      .catch((err) => console.error('[Coupons Page] Fetch error:', err))
      .finally(() => setCouponsLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    triggerToast(`Coupon code "${code}" copied to clipboard.`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (id: string, currentStatus: string, code: string) => {
    const nextActive = currentStatus !== 'ACTIVE';
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon_id: id, is_active: nextActive }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: nextActive ? 'ACTIVE' : 'PAUSED' } : c))
      );
      triggerToast(`Coupon "${code}" is now ${nextActive ? 'ACTIVE' : 'PAUSED'}.`);
    } catch (err) {
      console.error('[Coupons Toggle] Error:', err);
      triggerToast('Failed to update status in database.');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete coupon');

      setCoupons((prev) => prev.filter((c) => c.id !== id));
      triggerToast(`Coupon "${code}" deleted from database.`);
    } catch (err) {
      console.error('[Coupons Delete] Error:', err);
      triggerToast('Failed to delete coupon.');
    }
  };

  // Submit Create Coupon Form
  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCode.trim()) {
      triggerToast('Coupon Code is mandatory.');
      return;
    }
    if (!formTitle.trim()) {
      triggerToast('Campaign Title is mandatory.');
      return;
    }
    if (!formValue || Number(formValue) <= 0) {
      triggerToast('Discount Value must be greater than 0.');
      return;
    }
    if (formType === 'PERCENTAGE' && (!formMaxCap || Number(formMaxCap) <= 0)) {
      triggerToast('Maximum Discount Cap is mandatory for percentage discounts.');
      return;
    }
    if (!formMOV || Number(formMOV) < 0) {
      triggerToast('Minimum Order Value (MOV) is mandatory.');
      return;
    }
    if (!formMaxUsage || Number(formMaxUsage) <= 0) {
      triggerToast('Total Global Usage Limit is mandatory.');
      return;
    }
    if (!formStartDate || !formEndDate) {
      triggerToast('Start date and End date are mandatory.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formCode.trim().toUpperCase(),
          title: formTitle.trim(),
          discount_type: formType,
          discount_value: Number(formValue),
          max_discount_cap_inr: formType === 'PERCENTAGE' ? Number(formMaxCap) : 0,
          min_order_amount_inr: Number(formMOV),
          max_usage_limit: Number(formMaxUsage),
          starts_at: formStartDate,
          expires_at: formEndDate,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save coupon');
      }

      triggerToast(`Coupon "${formCode.toUpperCase()}" created and activated.`);
      setIsCouponModalOpen(false);

      // Reset form
      setFormCode('');
      setFormTitle('');
      setFormValue('10');
      setFormMaxCap('3000');
      setFormMOV('15000');
      setFormMaxUsage('500');

      fetchCoupons();
    } catch (err: any) {
      console.error('[Create Coupon] Error:', err);
      triggerToast(err.message || 'Error creating coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Create Auto Discount Rule
  const handleCreateAutoRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoTitle.trim()) {
      triggerToast('Rule Title is mandatory.');
      return;
    }
    if (!autoValue || Number(autoValue) <= 0) {
      triggerToast('Discount Value is mandatory.');
      return;
    }
    if (!autoMOV || Number(autoMOV) < 0) {
      triggerToast('Minimum Order Threshold is mandatory.');
      return;
    }

    const newRule: AutomaticDiscountRule = {
      id: `auto-${Date.now()}`,
      title: autoTitle.trim(),
      badgeText: autoBadge.trim() || 'Sitewide Privilege',
      type: autoType,
      value: Number(autoValue),
      maxCapINR: Number(autoMaxCap) || 0,
      minOrderThresholdINR: Number(autoMOV),
      startDate: autoStartDate,
      endDate: autoEndDate,
      status: 'ACTIVE',
    };

    setAutoDiscounts([newRule, ...autoDiscounts]);
    setIsAutoRuleModalOpen(false);
    setAutoTitle('');
    setAutoValue('2000');
    setAutoMOV('25000');
    triggerToast(`Automatic discount rule "${newRule.title}" created.`);
  };

  const handleDeleteAutoRule = (id: string, title: string) => {
    if (!window.confirm(`Delete automatic discount rule "${title}"?`)) return;
    setAutoDiscounts((prev) => prev.filter((r) => r.id !== id));
    triggerToast(`Automatic discount rule "${title}" deleted.`);
  };

  const handleToggleAutoRuleStatus = (id: string) => {
    setAutoDiscounts((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        triggerToast(`Rule "${r.title}" is now ${next}.`);
        return { ...r, status: next };
      })
    );
  };

  // Filtered lists
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [coupons, statusFilter, searchQuery]);

  const filteredAutoDiscounts = useMemo(() => {
    return autoDiscounts.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = r.title.toLowerCase().includes(q) || r.badgeText.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [autoDiscounts, statusFilter, searchQuery]);

  const totalGMV = coupons.reduce((acc, c) => acc + c.revenueGenerated, 0);
  const totalClaims = coupons.reduce((acc, c) => acc + c.usageCount, 0);

  return (
    <div className="font-sans text-slate-900 pb-28 space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#1F1B16] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C87F4A]/40 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Discounts & Promotions Hub
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C87F4A]" />
              <span>Live Checkout Engine</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Manage Checkout Promo Codes and Sitewide Automatic Threshold Discounts
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {activeTab === 'COUPONS' ? (
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#7A1C30] hover:bg-[#5F1424] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-200" />
              <span>+ Create Promo Coupon</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAutoRuleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#B8892B] hover:bg-[#966F21] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>+ Create Automatic Discount Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Total Campaign GMV
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ₹{(totalGMV / 100000).toFixed(1)} Lakhs
          </div>
          <span className="text-[10px] text-emerald-700 font-mono font-semibold block">
            Attributed GMV generated from redemptions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Total Redemptions
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalClaims} Orders</div>
          <span className="text-[10px] text-slate-500 font-mono block">
            Across online cart checkouts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
            Active Campaigns
          </span>
          <div className="text-2xl font-bold font-mono text-[#7A1C30]">
            {coupons.filter((c) => c.status === 'ACTIVE').length} Coupons •{' '}
            {autoDiscounts.filter((r) => r.status === 'ACTIVE').length} Auto Rules
          </div>
          <span className="text-[10px] text-[#B8892B] font-mono font-semibold block">
            Live and redeemable by patrons
          </span>
        </div>
      </div>

      {/* 3. Section Tabs (Coupons vs Automatic Discounts) */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('COUPONS')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'COUPONS'
              ? 'border-[#7A1C30] text-[#7A1C30]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Checkout Promo Coupons ({coupons.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUTOMATIC_DISCOUNTS')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'AUTOMATIC_DISCOUNTS'
              ? 'border-[#7A1C30] text-[#7A1C30]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Automatic Store Discounts & Flash Rules ({autoDiscounts.length})</span>
        </button>
      </div>

      {/* 4. Controls Bar (Search & Status Filter) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'COUPONS'
                ? 'Search coupon codes, titles...'
                : 'Search automatic discount rules...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#7A1C30]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['ALL', 'ACTIVE', 'PAUSED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 5. TAB 1: PROMOTIONAL CHECKOUT COUPONS TABLE       */}
      {/* ================================================== */}
      {activeTab === 'COUPONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3.5">Coupon Code & Campaign</th>
                  <th className="p-3.5">Discount Mechanism</th>
                  <th className="p-3.5">Usage & Max Cap</th>
                  <th className="p-3.5">Attributed Revenue</th>
                  <th className="p-3.5">Validity Schedule</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {couponsLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                      Loading promotional coupons from database...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                      No promo coupons found. Click "+ Create Promo Coupon" to launch your first code.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Code & Title */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-0.5 rounded bg-slate-100 text-[#7A1C30] font-mono font-bold text-xs border border-slate-200">
                            {coupon.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(coupon.code)}
                            className="text-slate-400 hover:text-black transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="font-semibold text-slate-900 text-xs mt-0.5">
                          {coupon.title}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          Min. Order: ₹{coupon.minOrderValue.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Mechanism */}
                      <td className="p-3.5">
                        {coupon.type === 'PERCENTAGE' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold font-mono text-xs inline-flex items-center gap-1">
                            <span>%</span>
                            <span>{coupon.value}% Flat Off</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-xs inline-flex items-center gap-1">
                            <span>₹</span>
                            <span>₹{coupon.value.toLocaleString('en-IN')} Off</span>
                          </span>
                        )}
                        {coupon.type === 'PERCENTAGE' && coupon.maxDiscountCap > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Max Cap: ₹{coupon.maxDiscountCap.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="p-3.5 font-mono text-xs">
                        <div className="font-bold text-slate-900">
                          {coupon.usageCount} / {coupon.maxUsageLimit}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {coupon.maxUsageLimit > 0
                            ? `${Math.round((coupon.usageCount / coupon.maxUsageLimit) * 100)}% claimed`
                            : '0% claimed'}
                        </div>
                      </td>

                      {/* Attributed GMV */}
                      <td className="p-3.5 font-mono text-xs">
                        <div className="font-bold text-slate-900">
                          ₹{coupon.revenueGenerated.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-stone-500">GMV Captured</div>
                      </td>

                      {/* Validity */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">
                        <div>{coupon.startDate}</div>
                        <div className="text-[10px] text-slate-400">until {coupon.endDate}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            coupon.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {coupon.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(coupon.id, coupon.status, coupon.code)
                            }
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
                          >
                            {coupon.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                            className="p-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. TAB 2: AUTOMATIC STORE DISCOUNTS TABLE          */}
      {/* ================================================== */}
      {activeTab === 'AUTOMATIC_DISCOUNTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-amber-50/60 border-b border-amber-200/60 flex items-center gap-2.5 text-xs text-amber-900">
            <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Automatic Threshold Discounts:</strong> These promotions are auto-applied directly
              in the shopping cart when an order reaches the minimum threshold — no coupon code input is
              required from the patron.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3.5">Promotion Title & Badge</th>
                  <th className="p-3.5">Automatic Discount Value</th>
                  <th className="p-3.5">Threshold Threshold</th>
                  <th className="p-3.5">Validity Schedule</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                {filteredAutoDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      No automatic discount rules defined. Click "+ Create Automatic Discount Rule".
                    </td>
                  </tr>
                ) : (
                  filteredAutoDiscounts.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title & Badge */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-xs">{rule.title}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold border border-amber-200">
                          {rule.badgeText}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="p-3.5">
                        {rule.type === 'PERCENTAGE' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold font-mono text-xs">
                            {rule.value}% Sitewide Off
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-xs">
                            ₹{rule.value.toLocaleString('en-IN')} Flat Off
                          </span>
                        )}
                        {rule.type === 'PERCENTAGE' && rule.maxCapINR > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Max Cap: ₹{rule.maxCapINR.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Threshold */}
                      <td className="p-3.5 font-mono text-xs text-slate-900">
                        <div className="font-bold">
                          Orders ₹{rule.minOrderThresholdINR.toLocaleString('en-IN')}+
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          ✓ Auto-deducted
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">
                        <div>{rule.startDate}</div>
                        <div className="text-[10px] text-slate-400">until {rule.endDate}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            rule.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {rule.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleAutoRuleStatus(rule.id)}
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
                          >
                            {rule.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAutoRule(rule.id, rule.title)}
                            className="p-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 7. MODAL: CREATE PROMOTIONAL CHECKOUT COUPON       */}
      {/* ================================================== */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#C87F4A]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-5 bg-gradient-to-r from-[#FAF3E4] to-white border-b border-[#C87F4A]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#7A1C30]" />
                <h2 className="font-bold text-base text-[#1F1B16]">
                  Create Promotional Coupon Code
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateCouponSubmit}
              className="p-6 space-y-4 text-xs font-sans overflow-y-auto"
            >
              {/* Row 1: Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Coupon Code *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormCode(`VAULT${Math.floor(1000 + Math.random() * 9000)}`)
                      }
                      className="text-[10px] font-mono text-[#7A1C30] hover:underline"
                    >
                      Randomize
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MYSORE10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
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
                    placeholder="e.g. Navratri 2026 Privilege Silk Special"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Row 2: Discount Mechanism Toggle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Discount Mechanism *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('PERCENTAGE')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      formType === 'PERCENTAGE'
                        ? 'border-[#7A1C30] bg-[#FAF3E4]/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      %
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Percentage Off (%)
                      </span>
                      <span className="text-[10px] text-slate-500">e.g. 10% off entire order</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('FIXED_AMOUNT')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      formType === 'FIXED_AMOUNT'
                        ? 'border-[#7A1C30] bg-[#FAF3E4]/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      ₹
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Fixed Amount (₹)
                      </span>
                      <span className="text-[10px] text-slate-500">e.g. Flat ₹2,000 off</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Row 3: Discount Value & Max Discount Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {formType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={formType === 'PERCENTAGE' ? 100 : 100000}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                {formType === 'PERCENTAGE' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Maximum Discount Cap (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={formMaxCap}
                      onChange={(e) => setFormMaxCap(e.target.value)}
                      placeholder="e.g. 3000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Discount Policy
                    </label>
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono text-[11px]">
                      Flat deduction of ₹{Number(formValue || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: MOV & Global Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimum Order Value (MOV ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formMOV}
                    onChange={(e) => setFormMOV(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Global Usage Limit *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formMaxUsage}
                    onChange={(e) => setFormMaxUsage(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Row 5: Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valid Until *</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#7A1C30] hover:bg-[#5F1424] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Activating Promo...' : 'Activate Promotional Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 8. MODAL: CREATE AUTOMATIC DISCOUNT RULE           */}
      {/* ================================================== */}
      {isAutoRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="p-5 bg-gradient-to-r from-amber-50 to-white border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-base text-slate-900">
                  Create Automatic Threshold Discount
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoRuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateAutoRuleSubmit}
              className="p-6 space-y-4 text-xs font-sans overflow-y-auto"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rule Title (Internal) *
                </label>
                <input
                  type="text"
                  required
                  value={autoTitle}
                  onChange={(e) => setAutoTitle(e.target.value)}
                  placeholder="e.g. Diwali Grand Cart Offer ₹2,000 Off"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Storefront Badge Callout *
                  </label>
                  <input
                    type="text"
                    required
                    value={autoBadge}
                    onChange={(e) => setAutoBadge(e.target.value)}
                    placeholder="e.g. Cart Orders ₹25,000+"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimum Order Threshold (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={autoMOV}
                    onChange={(e) => setAutoMOV(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type *</label>
                  <select
                    value={autoType}
                    onChange={(e) => setAutoType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  >
                    <option value="FIXED_AMOUNT">Flat Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage Off (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {autoType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={autoValue}
                    onChange={(e) => setAutoValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={autoStartDate}
                    onChange={(e) => setAutoStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valid Until *</label>
                  <input
                    type="date"
                    required
                    value={autoEndDate}
                    onChange={(e) => setAutoEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAutoRuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B8892B] hover:bg-[#966F21] text-white font-bold shadow-xs cursor-pointer"
                >
                  Activate Automatic Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
