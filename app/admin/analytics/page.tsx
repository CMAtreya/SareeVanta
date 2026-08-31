'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  Layers,
  MapPin,
  CheckCircle2,
  Package,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

type DateRangeType = 'ALL_TIME' | 'TODAY' | 'LAST_7_DAYS' | 'MONTH_TO_DATE';

export default function PerformanceAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRangeType>('ALL_TIME');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalyticsData() {
      setLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/admin/orders').then((r) => (r.ok ? r.json() : { orders: [] })),
          fetch('/api/admin/products').then((r) => (r.ok ? r.json() : { products: [] })),
        ]);

        if (ordersRes.orders && Array.isArray(ordersRes.orders)) {
          setAllOrders(ordersRes.orders);
        }
        if (productsRes.products && Array.isArray(productsRes.products)) {
          setCatalogProducts(productsRes.products);
        }
      } catch (err) {
        console.error('[Analytics] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, []);

  // Filter orders by selected date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return allOrders.filter((order) => {
      if (dateRange === 'ALL_TIME') return true;
      const placedTime = order.placed_at ? new Date(order.placed_at).getTime() : 0;
      if (!placedTime) return false;

      if (dateRange === 'TODAY') return placedTime >= startOfToday;
      if (dateRange === 'LAST_7_DAYS') return placedTime >= sevenDaysAgo;
      if (dateRange === 'MONTH_TO_DATE') return placedTime >= startOfMonth;
      return true;
    });
  }, [allOrders, dateRange]);

  // Real financial metrics computed from filtered orders
  const financialMetrics = useMemo(() => {
    const totalOrdersCount = filteredOrders.length;
    const gross = filteredOrders.reduce((sum: number, o: any) => sum + Math.round((o.total_paise || 0) / 100), 0);
    const paidOrders = filteredOrders.filter((o: any) => o.payment_status === 'PAID');
    const returnedOrders = filteredOrders.filter(
      (o: any) => o.order_status === 'RETURNED' || o.order_status === 'RETURN_REQUESTED'
    );
    const returnedAmount = returnedOrders.reduce(
      (sum: number, o: any) => sum + Math.round((o.total_paise || 0) / 100),
      0
    );
    const net = Math.max(0, gross - returnedAmount);
    const aov = totalOrdersCount > 0 ? Math.round(gross / totalOrdersCount) : 0;
    const cogs = Math.round(gross * 0.45); // Standard weaver base cost estimate
    const margin = gross > 0 ? Number((((gross - cogs) / gross) * 100).toFixed(1)) : 55.0;

    return {
      grossRevenue: gross,
      netRevenue: net,
      totalOrders: totalOrdersCount,
      paidOrdersCount: paidOrders.length,
      returnedOrdersCount: returnedOrders.length,
      cogs,
      grossMarginPercent: margin,
      averageOrderValue: aov,
    };
  }, [filteredOrders]);

  // Real Geographic Distribution from order delivery addresses
  const geographicMetrics = useMemo(() => {
    const stateMap: Record<
      string,
      { state: string; count: number; revenue: number; cities: Set<string>; pincodes: Set<string>; rtoCount: number }
    > = {};

    filteredOrders.forEach((order) => {
      const addresses = Array.isArray(order.order_delivery_addresses)
        ? order.order_delivery_addresses
        : order.order_delivery_addresses
        ? [order.order_delivery_addresses]
        : [];

      const addr = addresses[0];
      const stateName = (addr?.state || 'Direct Express / Unspecified').trim();
      const cityName = (addr?.city || '').trim();
      const pincode = (addr?.postal_code || '').trim();
      const orderRev = Math.round((order.total_paise || 0) / 100);
      const isReturned = order.order_status === 'RETURNED' || order.order_status === 'RETURN_REQUESTED';

      if (!stateMap[stateName]) {
        stateMap[stateName] = {
          state: stateName,
          count: 0,
          revenue: 0,
          cities: new Set(),
          pincodes: new Set(),
          rtoCount: 0,
        };
      }

      stateMap[stateName].count += 1;
      stateMap[stateName].revenue += orderRev;
      if (cityName) stateMap[stateName].cities.add(cityName);
      if (pincode) stateMap[stateName].pincodes.add(pincode);
      if (isReturned) stateMap[stateName].rtoCount += 1;
    });

    const totalOrdersCount = filteredOrders.length;

    return Object.values(stateMap)
      .map((item) => {
        const rtoRate = item.count > 0 ? Number(((item.rtoCount / item.count) * 100).toFixed(1)) : 0;
        const share = totalOrdersCount > 0 ? Number(((item.count / totalOrdersCount) * 100).toFixed(1)) : 0;
        const citiesList = Array.from(item.cities).slice(0, 3).join(', ');
        const pincodesList = Array.from(item.pincodes).slice(0, 3).join(', ');

        return {
          state: item.state,
          cities: citiesList || 'Metropolitan Hubs',
          pincodes: pincodesList || 'Direct Hub',
          totalDispatches: item.count,
          revenue: item.revenue,
          share,
          rtoRate,
          status: rtoRate === 0 ? 'SAFE_PREPAID_ZONE' : rtoRate > 10 ? 'HIGH_RISK_ZONE' : 'NORMAL',
          riskColor:
            rtoRate === 0
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : rtoRate > 10
              ? 'text-rose-700 bg-rose-50 border-rose-200'
              : 'text-blue-700 bg-blue-50 border-blue-200',
        };
      })
      .sort((a, b) => b.totalDispatches - a.totalDispatches);
  }, [filteredOrders]);

  // Weave Tradition Breakdown from Catalog and Orders
  const weaveMetrics = useMemo(() => {
    const distribution: Record<string, { count: number; totalRevenue: number }> = {};

    catalogProducts.forEach((p: any) => {
      const w = p.weave || 'Pure Silk';
      const price = p.priceINR || 28000;
      if (!distribution[w]) distribution[w] = { count: 0, totalRevenue: 0 };
      distribution[w].count += 1;
      distribution[w].totalRevenue += price;
    });

    const totalAll = Object.values(distribution).reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const colors = ['bg-amber-500', 'bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];

    return Object.entries(distribution).map(([wName, val], idx) => ({
      weave: wName,
      revenue: val.totalRevenue,
      units: val.count,
      share: totalAll > 0 ? Number(((val.totalRevenue / totalAll) * 100).toFixed(1)) : 20,
      aov: Math.round(val.totalRevenue / (val.count || 1)),
      barColor: colors[idx % colors.length],
    }));
  }, [catalogProducts]);

  return (
    <div className="font-sans text-[#1F1B16] select-none pb-28 space-y-6 animate-fade-in">
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
              <span>Real-Time Database BI</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Unit Economics, Gross Merchandise Value, Weave Tradition Margins & Customer Geographies
          </p>
        </div>

        {/* Global Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E8DCC9] shadow-2xs font-mono text-xs">
            {[
              { key: 'ALL_TIME', label: 'All Time' },
              { key: 'TODAY', label: 'Today' },
              { key: 'LAST_7_DAYS', label: 'Last 7D' },
              { key: 'MONTH_TO_DATE', label: 'This Month' },
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
              ₹{financialMetrics.grossRevenue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-[11px] font-mono text-stone-500">
            Net: <strong className="text-stone-800">₹{financialMetrics.netRevenue.toLocaleString('en-IN')}</strong> from {financialMetrics.totalOrders} total orders
          </div>
        </div>

        {/* Total Orders Placed */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Total Orders</span>
            <ShoppingCart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-stone-900 tracking-tight">
              {financialMetrics.totalOrders}
            </span>
            <span className="text-xs text-emerald-700 font-bold">
              {financialMetrics.paidOrdersCount} Paid
            </span>
          </div>
          <div className="text-[11px] font-mono text-stone-500">
            {financialMetrics.returnedOrdersCount} returned / claimed
          </div>
        </div>

        {/* Gross Margin % */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Estimated Gross Margin</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-emerald-700 tracking-tight">
              {financialMetrics.grossMarginPercent}%
            </span>
          </div>
          <div className="text-[11px] font-mono text-stone-500">
            Direct-from-loom artisan pricing
          </div>
        </div>

        {/* AOV */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-mono">
            <span>Average Order Value (AOV)</span>
            <Package className="w-4 h-4 text-[#7A1C30]" />
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-bold text-stone-900 tracking-tight">
              ₹{financialMetrics.averageOrderValue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-[11px] font-mono text-amber-700">
            Per-basket average across placed orders
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. GEOGRAPHIC CUSTOMER & PINCODE DISTRIBUTION      */}
      {/* ================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-sm text-[#1F1B16] font-sans flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#7A1C30]" />
              <span>Geographic Customer & Order Distribution</span>
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Live delivery territories aggregated from customer address pincodes and city/state records
            </p>
          </div>
          <span className="text-xs font-mono bg-[#FAF3E4] text-[#7A1C30] px-2.5 py-1 rounded-lg font-bold border border-[#C87F4A]/30">
            {geographicMetrics.length} Active Regions
          </span>
        </div>

        {geographicMetrics.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF6F0] rounded-xl border border-[#E8DCC9]">
            <MapPin className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-800">No Delivery Records Yet</h4>
            <p className="text-xs text-stone-500 mt-1">
              Customer delivery states and pincodes will automatically populate here as orders are placed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#FAF6F0] border-b border-[#E8DCC9] text-stone-700 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">State / Territory</th>
                  <th className="p-3">Cities & Pincodes</th>
                  <th className="p-3 text-center">Orders</th>
                  <th className="p-3 text-right">Revenue</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-stone-700 font-sans">
                {geographicMetrics.map((item, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3 font-semibold text-stone-900">{item.state}</td>
                    <td className="p-3 font-mono text-[11px] text-stone-600">
                      <div>{item.cities}</div>
                      <div className="text-[10px] text-stone-400">Pincodes: {item.pincodes}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-xs">
                      {item.totalDispatches} Orders ({item.share}%)
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-stone-900">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.riskColor}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* 4. WEAVE TRADITION & CATALOG SHARE                 */}
      {/* ================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-sm text-[#1F1B16] font-sans flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C87F4A]" />
              <span>Weave Tradition & Fabric Catalog Share</span>
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Live inventory distribution and value share per handloom tradition across active products
            </p>
          </div>
        </div>

        {weaveMetrics.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF6F0] rounded-xl border border-[#E8DCC9]">
            <p className="text-xs text-stone-500">No active weave categories loaded.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {weaveMetrics.map((wp) => (
              <div key={wp.weave} className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between items-center font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{wp.weave}</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-stone-900">₹{wp.revenue.toLocaleString('en-IN')}</strong>
                    <span className="text-stone-400 text-[10px] ml-1.5">
                      ({wp.units} creations • Avg: ₹{wp.aov.toLocaleString('en-IN')})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#FAF6F0] rounded-full h-2.5 overflow-hidden border border-[#E8DCC9]">
                  <div
                    className={`h-full rounded-full ${wp.barColor || 'bg-amber-500'}`}
                    style={{ width: `${wp.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
