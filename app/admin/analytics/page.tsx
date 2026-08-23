'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
  Layers,
  Sparkles,
  Wand2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Eye,
  SlidersHorizontal,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Filter,
} from 'lucide-react';

export default function PerformanceAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'TODAY' | 'LAST_7_DAYS' | 'MONTH_TO_DATE' | 'FESTIVE_Q3'>('MONTH_TO_DATE');
  const [comparisonMode, setComparisonMode] = useState<'PREV_PERIOD' | 'PREV_YEAR'>('PREV_PERIOD');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sales Performance Data
  const financialMetrics = {
    grossRevenue: 4860000,
    grossChange: '+24.8%',
    netRevenue: 4320000,
    netChange: '+22.1%',
    cogs: 2140000,
    grossMarginPercent: 50.5,
    marginChange: '+3.2% pts',
    averageOrderValue: 33750,
    aovChange: '+8.4%',
  };

  // Conversion Funnel Data
  const funnelStages = [
    {
      stage: '1. Storefront Sessions',
      count: 124500,
      dropoff: null,
      conversionFromTop: '100%',
      icon: Users,
    },
    {
      stage: '2. Product Detail Views',
      count: 68400,
      dropoff: '-45.1%',
      conversionFromTop: '54.9%',
      icon: Eye,
    },
    {
      stage: '3. Add to Bag (Cart)',
      count: 14200,
      dropoff: '-79.2%',
      conversionFromTop: '11.4%',
      icon: ShoppingCart,
    },
    {
      stage: '4. Initiated Checkout',
      count: 4850,
      dropoff: '-65.8%',
      conversionFromTop: '3.9%',
      icon: CreditCardIcon,
    },
    {
      stage: '5. Completed Orders',
      count: 1280,
      dropoff: '-73.6%',
      conversionFromTop: '1.03%',
      icon: CheckCircle2,
    },
  ];

  // Weave Breakdown Data
  const weavePerformance = [
    {
      weave: 'Kanchipuram Korvai',
      revenue: 1848000,
      units: 272,
      share: 42.8,
      aov: 67941,
      growth: '+31.4%',
      barColor: 'bg-amber-500',
    },
    {
      weave: 'Mysore Silk Crepe',
      revenue: 1420000,
      units: 498,
      share: 32.9,
      aov: 28514,
      growth: '+18.2%',
      barColor: 'bg-rose-500',
    },
    {
      weave: 'Banarasi Kadwa Katan',
      revenue: 864000,
      units: 160,
      share: 20.0,
      aov: 54000,
      growth: '+14.5%',
      barColor: 'bg-blue-500',
    },
    {
      weave: 'Yeola Paithani',
      revenue: 482000,
      units: 104,
      share: 11.2,
      aov: 46346,
      growth: '+9.1%',
      barColor: 'bg-purple-500',
    },
    {
      weave: 'Tissue Georgette & Organza',
      revenue: 260000,
      units: 72,
      share: 6.0,
      aov: 36111,
      growth: '+42.0%',
      barColor: 'bg-emerald-500',
    },
  ];

  // Geographic RTO Risk Data
  const stateRtoAnalytics = [
    {
      state: 'Karnataka (Bangalore Hub)',
      totalDispatches: 412,
      rtoRate: 0.8,
      status: 'SAFE_ZONE',
      riskColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      state: 'Tamil Nadu & Kerala',
      totalDispatches: 284,
      rtoRate: 1.4,
      status: 'SAFE_ZONE',
      riskColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      state: 'Maharashtra & Telangana',
      totalDispatches: 310,
      rtoRate: 2.2,
      status: 'NORMAL',
      riskColor: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      state: 'Delhi NCR & Punjab',
      totalDispatches: 180,
      rtoRate: 3.6,
      status: 'NORMAL',
      riskColor: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      state: 'Eastern UP & Bihar Tier-3 COD',
      totalDispatches: 94,
      rtoRate: 14.8,
      status: 'HIGH_RISK_ZONE',
      riskColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  ];

  // Export Report Simulation
  const handleExportReport = () => {
    const reportData = `Neel Saree House - Executive Merchandising Intelligence Report
Generated: ${new Date().toLocaleString()}
Period: ${dateRange} (${comparisonMode})

SALES PERFORMANCE:
Gross Revenue: ₹${financialMetrics.grossRevenue.toLocaleString('en-IN')} (${financialMetrics.grossChange})
Net Revenue: ₹${financialMetrics.netRevenue.toLocaleString('en-IN')} (${financialMetrics.netChange})
COGS: ₹${financialMetrics.cogs.toLocaleString('en-IN')}
Gross Margin: ${financialMetrics.grossMarginPercent}%
Average Order Value: ₹${financialMetrics.averageOrderValue.toLocaleString('en-IN')}

INTERACTIVE VIDEO ENGAGEMENT LIFT:
Video Engagement Conversion Rate: 4.62% vs 0.94% (Standard Browsing)
Lift: +391% Conversion Surge
Return Rate Reduction: 1.8% vs 4.9% (-63%)
`;

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NeelSareeHouse_Executive_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('Executive Merchandising Report exported successfully.');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
      {/* 1. TOP HEADER & TIMEFRAME CONTROLS                 */}
      {/* ================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Performance & Merchandising Intelligence
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-[#7A1C30]" />
              <span>Real-Time Bi-Directional BI</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Unit Economics, Full Funnel Drop-off, Weave Margins, RTO Geographies & AI Lift
          </p>
        </div>

        {/* Global Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8DCC9] shadow-2xs font-mono text-xs">
            {[
              { key: 'TODAY', label: 'Today' },
              { key: 'LAST_7_DAYS', label: 'Last 7D' },
              { key: 'MONTH_TO_DATE', label: 'MTD (Aug)' },
              { key: 'FESTIVE_Q3', label: 'Festive Q3' },
            ].map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDateRange(d.key as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  dateRange === d.key
                    ? 'bg-[#7A1C30] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Comparison Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8DCC9] shadow-2xs font-mono text-xs">
            <button
              type="button"
              onClick={() => setComparisonMode('PREV_PERIOD')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                comparisonMode === 'PREV_PERIOD'
                  ? 'bg-[#FAF3E4] text-[#7A1C30] font-bold border border-[#C87F4A]/30'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              vs Prev Period
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('PREV_YEAR')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                comparisonMode === 'PREV_YEAR'
                  ? 'bg-[#FAF3E4] text-[#7A1C30] font-bold border border-[#C87F4A]/30'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              vs 2025 YoY
            </button>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportReport}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-200" />
            <span>Export BI Report</span>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. SALES PERFORMANCE & UNIT ECONOMICS BANNER       */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Gross Revenue (GMV)</span>
            <DollarSign className="w-4 h-4 text-[#7A1C30]" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-stone-900 tracking-tight">
              ₹{(financialMetrics.grossRevenue / 100000).toFixed(2)}L
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {financialMetrics.grossChange}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Net: <strong className="text-slate-800">₹{(financialMetrics.netRevenue / 100000).toFixed(2)}L</strong> after returns
          </div>
        </div>

        {/* COGS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Cost of Goods Sold (COGS)</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{(financialMetrics.cogs / 100000).toFixed(2)}L
            </span>
            <span className="text-xs text-slate-500">Weaver Procurement</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Pure Zari bullion & silk cocoon costs
          </div>
        </div>

        {/* Gross Margin % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Gross Margin %</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-emerald-700 tracking-tight">
              {financialMetrics.grossMarginPercent}%
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {financialMetrics.marginChange}
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Heritage luxury direct-from-loom margin
          </div>
        </div>

        {/* AOV */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>Average Order Value (AOV)</span>
            <ShoppingCart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              ₹{financialMetrics.averageOrderValue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {financialMetrics.aovChange}
            </span>
          </div>
          <div className="text-[11px] font-mono text-amber-700">
            Bridal trousseau multi-saree baskets
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. FULL CONVERSION FUNNEL VISUALIZATION            */}
      {/* ================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-sm text-[#1F1B16] font-sans flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#7A1C30]" />
              <span>Full Storefront Conversion Funnel</span>
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Stage-by-stage drop-off analytics from initial landing session to verified checkout order
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-stone-400 uppercase block font-bold">Overall Conversion</span>
            <span className="font-bold text-emerald-700 text-base">1.03% (1,280 Orders)</span>
          </div>
        </div>

        {/* Step-by-Step Funnel Bars */}
        <div className="space-y-3 pt-2">
          {funnelStages.map((stg, index) => {
            const widthPercent = Math.max(8, (stg.count / funnelStages[0].count) * 100);

            return (
              <div key={stg.stage} className="space-y-1 text-xs font-sans">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <stg.icon className="w-3.5 h-3.5 text-stone-500" />
                    <span>{stg.stage}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900 text-xs">
                      {stg.count.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      ({stg.conversionFromTop} of visitors)
                    </span>
                    {stg.dropoff && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.2 rounded border border-rose-200">
                        Drop-off: {stg.dropoff}
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="w-full bg-[#FAF6F0] rounded-xl h-4 overflow-hidden relative border border-[#E8DCC9]">
                  <div
                    className="h-full rounded-xl bg-gradient-to-r from-[#7A1C30] to-[#C87F4A] transition-all duration-500 flex items-center justify-end pr-2 text-[9px] font-mono font-bold text-white shadow-inner"
                    style={{ width: `${widthPercent}%` }}
                  >
                    {widthPercent > 15 && `${Math.round(widthPercent)}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. DUAL COLUMN: WEAVE MARGINS + VIDEO ENGAGEMENT LIFT     */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weave & Fabric Breakdown (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-sm text-[#1F1B16] font-sans flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C87F4A]" />
                <span>Weave Tradition & Fabric Revenue Share</span>
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Gross sales contribution & average order value per handloom tradition
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {weavePerformance.map((wp) => (
              <div key={wp.weave} className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between items-center font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{wp.weave}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {wp.growth}
                    </span>
                  </div>
                  <div className="text-right">
                    <strong className="text-stone-900">₹{(wp.revenue / 100000).toFixed(2)}L</strong>
                    <span className="text-stone-400 text-[10px] ml-1.5">
                      ({wp.units} units • AOV: ₹{wp.aov.toLocaleString('en-IN')})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#FAF6F0] rounded-full h-2 overflow-hidden border border-[#E8DCC9]">
                  <div
                    className={`h-full rounded-full ${wp.barColor}`}
                    style={{ width: `${wp.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Video Engagement Impact (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#18110E] to-[#2D1A14] text-white p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between border border-[#C87F4A]/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#E2CE9F] font-mono text-xs font-bold">
              <Sparkles className="w-4 h-4 text-[#C87F4A]" />
              <span>STUDIO & REEL ENGAGEMENT ROI LIFT</span>
            </div>
            <h3 className="font-bold text-base font-sans text-white">
              Studio Photography & Video Impact
            </h3>
            <p className="text-xs text-stone-300 font-mono leading-relaxed">
              Comparison between visitors who engaged with high-res macro weave videos vs standard catalog browsing
            </p>
          </div>

          {/* Metric Comparison Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2 border-t border-[#3D2319]">
            {/* Video Engaged Users */}
            <div className="p-3.5 bg-white/10 rounded-xl border border-white/10 space-y-1">
              <span className="text-[10px] uppercase text-[#E2CE9F] block font-bold">
                ✓ With Studio Video
              </span>
              <div className="text-xl font-bold text-emerald-400">4.62%</div>
              <div className="text-[10px] text-stone-300">Conv. Rate (AOV: ₹42.5k)</div>
              <div className="text-[10px] text-emerald-300 font-bold pt-1">
                Return Rate: 1.8% only
              </div>
            </div>

            {/* Standard Browsing Users */}
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] uppercase text-stone-400 block font-bold">
                ✗ Standard Browsing
              </span>
              <div className="text-xl font-bold text-stone-300">0.94%</div>
              <div className="text-[10px] text-stone-400">Conv. Rate (AOV: ₹26.8k)</div>
              <div className="text-[10px] text-rose-400 font-bold pt-1">
                Return Rate: 4.9%
              </div>
            </div>
          </div>

          {/* Bottom Lift Banner */}
          <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-center font-mono">
            <span className="text-xs font-bold text-emerald-300">
              ⚡ +391% Conversion Surge • 63% Return Rate Drop
            </span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 5. RETURN & RTO GEOGRAPHIC ZONE ANALYTICS          */}
      {/* ================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-sm text-[#1F1B16] font-sans flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#7A1C30]" />
              <span>Geographic Return & RTO Logistics Intelligence</span>
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Pinpoints high-risk COD return regions vs safe prepaid delivery territories
            </p>
          </div>
          <span className="text-xs font-mono bg-[#FAF3E4] text-[#7A1C30] px-2.5 py-1 rounded-lg font-bold border border-[#C87F4A]/30">
            Delhivery & BlueDart Telemetry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#FAF6F0] border-b border-[#E8DCC9] text-stone-700 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3">State / Pincode Zone</th>
                <th className="p-3 text-center">Total Dispatches</th>
                <th className="p-3 text-center">RTO Rate %</th>
                <th className="p-3 text-center">Logistics Risk Classification</th>
                <th className="p-3 text-right">Recommended Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {stateRtoAnalytics.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">{item.state}</td>
                  <td className="p-3 text-center font-mono font-bold text-xs">{item.totalDispatches} Packages</td>
                  <td className="p-3 text-center font-mono font-bold text-xs">
                    <span className={item.rtoRate > 10 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {item.rtoRate}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.riskColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-[11px]">
                    {item.rtoRate > 10 ? (
                      <span className="text-rose-700 font-bold">Mandate 100% Prepaid Only</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Standard COD & Express Air OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CreditCardIcon(props: any) {
  return <DollarSign {...props} />;
}
