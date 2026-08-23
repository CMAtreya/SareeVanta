'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  ShieldCheck,
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  ChevronDown,
  Eye,
  ExternalLink,
  Plus,
  RefreshCw,
  MoreHorizontal,
  X,
  FileText,
  Copy,
  Check,
  Video,
  MessageSquare,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Sparkles,
  Phone,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Flame,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '@/lib/products';

// Mock Date Range Data
const METRICS_BY_RANGE = {
  TODAY: {
    netSales: 342500,
    prevNetSales: 289000,
    growth: 18.5,
    orders: 14,
    prepaidCount: 12,
    codCount: 2,
    aov: 42800,
    rtoRate: 1.2,
    hourlyVelocity: [
      { time: '08 AM', sales: 18000, orders: 1 },
      { time: '10 AM', sales: 64000, orders: 3 },
      { time: '12 PM', sales: 88500, orders: 4 },
      { time: '02 PM', sales: 42000, orders: 2 },
      { time: '04 PM', sales: 56000, orders: 2 },
      { time: '06 PM', sales: 74000, orders: 2 },
    ],
  },
  YESTERDAY: {
    netSales: 289000,
    prevNetSales: 310000,
    growth: -6.7,
    orders: 11,
    prepaidCount: 10,
    codCount: 1,
    aov: 38500,
    rtoRate: 1.4,
    hourlyVelocity: [
      { time: '08 AM', sales: 12000, orders: 1 },
      { time: '10 AM', sales: 45000, orders: 2 },
      { time: '12 PM', sales: 72000, orders: 3 },
      { time: '02 PM', sales: 38000, orders: 1 },
      { time: '04 PM', sales: 68000, orders: 3 },
      { time: '06 PM', sales: 54000, orders: 1 },
    ],
  },
  THIS_WEEK: {
    netSales: 1845000,
    prevNetSales: 1560000,
    growth: 18.2,
    orders: 68,
    prepaidCount: 59,
    codCount: 9,
    aov: 43200,
    rtoRate: 1.1,
    hourlyVelocity: [
      { time: 'Mon', sales: 240000, orders: 9 },
      { time: 'Tue', sales: 280000, orders: 11 },
      { time: 'Wed', sales: 210000, orders: 8 },
      { time: 'Thu', sales: 310000, orders: 12 },
      { time: 'Fri', sales: 289000, orders: 11 },
      { time: 'Sat', sales: 342500, orders: 14 },
      { time: 'Sun', sales: 173500, orders: 3 },
    ],
  },
  MTD: {
    netSales: 5420000,
    prevNetSales: 4680000,
    growth: 15.8,
    orders: 194,
    prepaidCount: 168,
    codCount: 26,
    aov: 41900,
    rtoRate: 1.3,
    hourlyVelocity: [
      { time: 'W1', sales: 1150000, orders: 42 },
      { time: 'W2', sales: 1280000, orders: 48 },
      { time: 'W3', sales: 1420000, orders: 52 },
      { time: 'W4', sales: 1570000, orders: 52 },
    ],
  },
};

// Initial Orders State
const INITIAL_ORDERS = [
  {
    id: 'NSH-2026-9841',
    awb: 'BD-BLR-884920',
    patronName: 'Dr. Ananya Rao',
    patronCity: 'Bengaluru, KA',
    phone: '+91 98450 12345',
    sareeTitle: 'Royal Wodeyar Crimson Crepe Silk',
    sku: 'NSH-SKU-MYS-01',
    weave: 'Mysore Silk',
    zari: '24K Tested Pure Zari',
    amount: 28500,
    paymentStatus: 'PAID (UPI)',
    paymentMethod: 'Prepaid Razorpay',
    fulfillmentStatus: 'READY_TO_DISPATCH',
    time: '12 mins ago',
    silkMarkVerified: true,
  },
  {
    id: 'NSH-2026-9840',
    awb: 'BD-HYD-773821',
    patronName: 'Smt. Radhika Reddy',
    patronCity: 'Hyderabad, TS',
    phone: '+91 99890 98765',
    sareeTitle: 'Bridal Kanchipuram Korvai Gold Brocade',
    sku: 'NSH-SKU-KAN-04',
    weave: 'Kanchipuram',
    zari: 'Sacred 3-Shuttle Pure Gold Zari',
    amount: 68000,
    paymentStatus: 'PAID (HDFC NetBanking)',
    paymentMethod: 'Prepaid NetBanking',
    fulfillmentStatus: 'DISPATCHED',
    time: '45 mins ago',
    silkMarkVerified: true,
  },
  {
    id: 'NSH-2026-9839',
    awb: 'BD-MUM-119283',
    patronName: 'Meera Deshmukh',
    patronCity: 'Mumbai, MH',
    phone: '+91 98200 44556',
    sareeTitle: 'Yeola Paithani Royal Peacock Asawali',
    sku: 'NSH-SKU-PAI-02',
    weave: 'Paithani',
    zari: 'Tapestry Pure Zari',
    amount: 46000,
    paymentStatus: 'PAID (Credit Card)',
    paymentMethod: 'Prepaid CC',
    fulfillmentStatus: 'PROCESSING',
    time: '2 hours ago',
    silkMarkVerified: true,
  },
  {
    id: 'NSH-2026-9838',
    awb: 'BD-DEL-554910',
    patronName: 'Pooja Singhania',
    patronCity: 'New Delhi, DL',
    phone: '+91 98110 33221',
    sareeTitle: 'Varanasi Kadwa Katan Meenakari Boota',
    sku: 'NSH-SKU-BAN-03',
    weave: 'Banarasi',
    zari: 'Antiqued Gold Tested Zari',
    amount: 54000,
    paymentStatus: 'PAID (UPI)',
    paymentMethod: 'Prepaid UPI',
    fulfillmentStatus: 'DELIVERED',
    time: '3 hours ago',
    silkMarkVerified: true,
  },
  {
    id: 'NSH-2026-9837',
    awb: 'BD-MAA-992011',
    patronName: 'Kavitha Sundaram',
    patronCity: 'Chennai, TN',
    phone: '+91 94440 88990',
    sareeTitle: 'Champagne Tissue Georgette Floral Zari',
    sku: 'NSH-SKU-TIS-08',
    weave: 'Tissue Georgette',
    zari: 'Lightweight Tested Zari',
    amount: 36000,
    paymentStatus: 'COD VERIFIED',
    paymentMethod: 'Cash on Delivery',
    fulfillmentStatus: 'READY_TO_DISPATCH',
    time: '4 hours ago',
    silkMarkVerified: true,
  },
  {
    id: 'NSH-2026-9836',
    awb: 'BD-PUN-334190',
    patronName: 'Sneha Kulkarni',
    patronCity: 'Pune, MH',
    phone: '+91 97650 11223',
    sareeTitle: 'Mysuru Sandalwood Crepe Gold Kasuti',
    sku: 'NSH-SKU-MYS-07',
    weave: 'Mysore Silk',
    zari: 'Pure Mulberry Tested Zari',
    amount: 32000,
    paymentStatus: 'PENDING VERIFICATION',
    paymentMethod: 'Prepaid Gateway Pending',
    fulfillmentStatus: 'ON_HOLD',
    time: '5 hours ago',
    silkMarkVerified: true,
  },
];

// Single Piece Inventory Watchlist
const INVENTORY_WATCHLIST = [
  {
    id: 'watch-1',
    title: 'Royal Wodeyar Crimson Crepe Silk',
    weave: 'Mysore Silk',
    stockLeft: 1,
    activeCarts: 4,
    price: '₹28,500',
    status: 'CRITICAL_LOW',
  },
  {
    id: 'watch-2',
    title: 'Bridal Kanchipuram 3-Shuttle Korvai',
    weave: 'Kanchipuram',
    stockLeft: 2,
    activeCarts: 6,
    price: '₹68,000',
    status: 'HIGH_DEMAND',
  },
  {
    id: 'watch-3',
    title: 'Kadwa Katan Antique Meenakari',
    weave: 'Banarasi',
    stockLeft: 1,
    activeCarts: 3,
    price: '₹54,000',
    status: 'CRITICAL_LOW',
  },
  {
    id: 'watch-4',
    title: 'Yeola Paithani Asawali Gold Border',
    weave: 'Paithani',
    stockLeft: 0,
    activeCarts: 8,
    price: '₹46,000',
    status: 'OUT_OF_STOCK',
  },
];

export default function AdminExecutiveDashboard() {
  const [dateRange, setDateRange] = useState<'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'MTD'>('TODAY');
  const [chartView, setChartView] = useState<'HOURLY' | 'DAILY'>('HOURLY');
  const [chartMetric, setChartMetric] = useState<'NET' | 'GROSS'>('NET');
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<any | null>(null);
  const [activeVisitors, setActiveVisitors] = useState(48);
  const [triageFilter, setTriageFilter] = useState<string | null>(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);

  // Live Visitor Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVisitors((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(38, Math.min(64, prev + delta));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentMetrics = METRICS_BY_RANGE[dateRange];

  // Weave Sales Distribution Data
  const weaveDistribution = [
    { name: 'Mysore Silk', percentage: 42, color: '#2563EB', revenue: '₹1,43,850' },
    { name: 'Kanchipuram', percentage: 28, color: '#7C3AED', revenue: '₹95,900' },
    { name: 'Banarasi', percentage: 18, color: '#F59E0B', revenue: '₹61,650' },
    { name: 'Paithani & Tissue', percentage: 12, color: '#10B981', revenue: '₹41,100' },
  ];

  // Filtered Orders based on Triage
  const displayedOrders = useMemo(() => {
    if (!triageFilter) return orders;
    if (triageFilter === 'PACKING') {
      return orders.filter((o) => o.fulfillmentStatus === 'READY_TO_DISPATCH');
    }
    if (triageFilter === 'RECONCILE') {
      return orders.filter((o) => o.fulfillmentStatus === 'ON_HOLD');
    }
    return orders;
  }, [orders, triageFilter]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 font-sans select-none pb-12">
      {/* ================================================== */}
      {/* 1. TOP HEADER & CUSTOM DATE RANGE PICKER           */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Executive Control Center
            </h1>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mysuru Flagship Live</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Morning Store Opening & Daily Order Dispatch Pipeline
          </p>
        </div>

        {/* Date Range Picker Controls */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto scrollbar-none max-w-full flex-wrap sm:flex-nowrap">
          {[
            { key: 'TODAY', label: 'Today' },
            { key: 'YESTERDAY', label: 'Yesterday' },
            { key: 'THIS_WEEK', label: 'This Week' },
            { key: 'MTD', label: 'Month-to-Date' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setDateRange(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                dateRange === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. 5-CARD KPI METRIC BANNER WITH SPARKLINE          */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Net Sales */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Net Sales
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ₹{currentMetrics.netSales.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <span
              className={`font-bold font-mono text-[11px] px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                currentMetrics.growth >= 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {currentMetrics.growth >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{Math.abs(currentMetrics.growth)}%</span>
            </span>
            <span className="text-[11px] text-slate-400 font-sans">vs prev period</span>
          </div>

          {/* Micro SVG Sparkline with Gradient */}
          <div className="mt-3 h-7 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
              <defs>
                <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 18 Q 20 8, 40 14 T 70 6 T 100 2 L 100 25 L 0 25 Z"
                fill="url(#salesGrad)"
              />
              <path
                d="M 0 18 Q 20 8, 40 14 T 70 6 T 100 2"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* KPI 2: Total Orders & Split */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <ShoppingCart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {currentMetrics.orders} Orders
          </div>
          <div className="mt-2.5 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-emerald-700 font-bold">
                Prepaid: {currentMetrics.prepaidCount} ({Math.round((currentMetrics.prepaidCount / currentMetrics.orders) * 100)}%)
              </span>
              <span className="text-slate-500 font-medium">COD: {currentMetrics.codCount}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(currentMetrics.prepaidCount / currentMetrics.orders) * 100}%` }}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${(currentMetrics.codCount / currentMetrics.orders) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* KPI 3: Average Order Value */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-purple-300 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Average Order Value
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            ₹{currentMetrics.aov.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-purple-700 font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>High Bridal Cart Volume</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-1">
            Top item: Pure Mysore Crepe Silk
          </p>
        </motion.div>

        {/* KPI 4: Return / RTO Rate */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-amber-300 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Return / RTO Rate
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {currentMetrics.rtoRate}%
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <span className="text-emerald-700 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] border border-emerald-200">
              98.8%
            </span>
            <span className="text-[11px] text-slate-500 font-sans">BlueDart delivery</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-1">
            Industry Benchmark: 6.8%
          </p>
        </motion.div>

        {/* KPI 5: Live Active Visitors */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all relative overflow-hidden group bg-gradient-to-br from-white via-white to-emerald-50/20"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Active Visitors
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight flex items-center gap-2">
            <span>{activeVisitors} Patrons</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>8 in Checkout Funnel</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-1">
            Real-time Polling Active
          </p>
        </motion.div>
      </div>

      {/* ================================================== */}
      {/* 3. ACTIONABLE TRIAGE BAR (Stripe/Shopify Style)    */}
      {/* ================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Morning Actionable Triage:
            </span>
            <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.2 rounded font-bold text-slate-700">
              4 Action Items
            </span>
          </div>
          {triageFilter && (
            <button
              type="button"
              onClick={() => setTriageFilter(null)}
              className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Triage Pill 1: Packing Labels */}
          <button
            type="button"
            onClick={() => setTriageFilter(triageFilter === 'PACKING' ? null : 'PACKING')}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
              triageFilter === 'PACKING'
                ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-amber-50/60 hover:bg-amber-50 border-amber-200/80'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs shadow-xs">
              14
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-amber-950 truncate">
                Generate Packing Labels
              </div>
              <div className="text-[10px] text-amber-800 font-mono">
                BlueDart pickup today 07:30 PM
              </div>
            </div>
          </button>

          {/* Triage Pill 2: Return Approvals */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs shadow-xs">
              3
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-blue-950 truncate">
                Return Requests Pending
              </div>
              <div className="text-[10px] text-blue-800 font-mono">
                Awaiting Silk Mark inspection
              </div>
            </div>
          </div>

          {/* Triage Pill 3: Zero Stock SKUs */}
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs shadow-xs">
              6
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-rose-950 truncate">
                Pure Silk Zero Stock Alert
              </div>
              <div className="text-[10px] text-rose-800 font-mono">
                Notify Mysuru Guild Master
              </div>
            </div>
          </div>

          {/* Triage Pill 4: Webhook Reconcile */}
          <button
            type="button"
            onClick={() => setTriageFilter(triageFilter === 'RECONCILE' ? null : 'RECONCILE')}
            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
              triageFilter === 'RECONCILE'
                ? 'bg-purple-100/80 border-purple-400 ring-2 ring-purple-400/30'
                : 'bg-purple-50/60 hover:bg-purple-50 border-purple-200/80'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs shadow-xs">
              2
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-purple-950 truncate">
                Failed Webhooks to Reconcile
              </div>
              <div className="text-[10px] text-purple-800 font-mono">
                HDFC & Razorpay sync check
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. DUAL-COLUMN OPERATIONS GRID (70% Left / 30% Right) */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================== */}
        {/* LEFT COLUMN (70% - 8 Cols on lg screen)       */}
        {/* ============================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Sales Velocity Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  <span>Sales & Order Velocity</span>
                </h3>
                <p className="text-[11px] font-mono text-slate-500">
                  {dateRange} Real-Time Revenue Trajectory
                </p>
              </div>

              {/* Chart Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setChartMetric('NET')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      chartMetric === 'NET'
                        ? 'bg-white text-blue-600 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Net Sales
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('GROSS')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      chartMetric === 'GROSS'
                        ? 'bg-white text-blue-600 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Gross Revenue
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-200">
                {currentMetrics.hourlyVelocity.map((point, index) => {
                  const maxVal = Math.max(...currentMetrics.hourlyVelocity.map((p) => p.sales));
                  const heightPercent = Math.round((point.sales / maxVal) * 85) + 15;
                  const isHovered = hoveredDataPoint?.time === point.time;

                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredDataPoint(point)}
                      onMouseLeave={() => setHoveredDataPoint(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    >
                      {/* Floating Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-xl whitespace-nowrap pointer-events-none animate-fade-in">
                          <div className="font-bold text-amber-300">
                            ₹{point.sales.toLocaleString('en-IN')}
                          </div>
                          <div className="text-slate-300">{point.orders} orders placed</div>
                        </div>
                      )}

                      {/* Bar Fill */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                          isHovered
                            ? 'bg-blue-600 shadow-md'
                            : 'bg-gradient-to-t from-blue-600/80 to-blue-500/90 group-hover:from-blue-600 group-hover:to-blue-400'
                        }`}
                      />
                      <span className="text-[10px] font-mono text-slate-500 mt-2 font-medium">
                        {point.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>Peak buying velocity: 12 PM - 02 PM & 06 PM</span>
              <span className="text-emerald-700 font-bold">● High Conversion Rate (4.8%)</span>
            </div>
          </div>

          {/* Live & Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  <span>Live & Recent Orders</span>
                </h3>
                <p className="text-[11px] font-mono text-slate-500">
                  Showing {displayedOrders.length} orders in queue
                </p>
              </div>

              <Link
                href="/admin?tab=orders"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>View Full Matrix</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Patron & Destination</th>
                    <th className="p-3">Weave Category</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Fulfillment</th>
                    <th className="p-3 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForSlip(order)}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {order.id}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{order.patronName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{order.patronCity}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {order.weave}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        ₹{order.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {order.fulfillmentStatus === 'READY_TO_DISPATCH' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>Ready to Pack</span>
                          </span>
                        ) : order.fulfillmentStatus === 'DISPATCHED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <Truck className="w-2.5 h-2.5 text-blue-600" />
                            <span>In Transit</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {order.fulfillmentStatus}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForSlip(order)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
                          title="Print AWB Packing Slip"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ============================================== */}
        {/* RIGHT COLUMN (30% - 4 Cols on lg screen)      */}
        {/* ============================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Weave Sales Distribution Donut Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-600" />
                <span>Weave Sales Distribution</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">By Revenue</span>
            </div>

            {/* Segment Progress Bar Visual */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex shadow-inner">
              {weaveDistribution.map((w, idx) => (
                <div
                  key={idx}
                  style={{ width: `${w.percentage}%`, backgroundColor: w.color }}
                  className="h-full"
                  title={`${w.name}: ${w.percentage}%`}
                />
              ))}
            </div>

            {/* Distribution Legend List */}
            <div className="space-y-2 pt-1 divide-y divide-slate-100 text-xs font-sans">
              {weaveDistribution.map((w, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                    <span className="font-semibold text-slate-800">{w.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900">{w.revenue}</span>
                    <span className="text-slate-400 text-[10px] ml-1.5">({w.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Single-Piece Luxury Inventory Watchlist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Loom Watchlist (Low Stock)
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-bold border border-rose-200">
                Live
              </span>
            </div>

            <div className="space-y-2.5">
              {INVENTORY_WATCHLIST.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 truncate max-w-[180px]">
                      {item.title}
                    </div>
                    <span className="font-mono font-bold text-slate-900">{item.price}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">{item.weave}</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        item.stockLeft === 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.stockLeft === 0 ? 'Out of Stock' : `Only ${item.stockLeft} left on loom`}
                    </span>
                  </div>

                  <div className="text-[10px] text-blue-600 font-mono flex items-center gap-1 pt-0.5">
                    <span>🔥 {item.activeCarts} patrons currently have this in cart</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 5. PACKING SLIP & DISPATCH MANIFEST MODAL          */}
      {/* ================================================== */}
      {selectedOrderForSlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    BlueDart Air Dispatch Manifest
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {selectedOrderForSlip.id} • {selectedOrderForSlip.awb}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForSlip(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patron:</span>
                  <span className="font-bold text-slate-900">{selectedOrderForSlip.patronName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-semibold text-slate-800">{selectedOrderForSlip.patronCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-mono text-slate-700">{selectedOrderForSlip.phone}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Saree:</span>
                  <span className="font-bold text-slate-900">{selectedOrderForSlip.sareeTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weave / Zari:</span>
                  <span className="font-semibold text-amber-800">
                    {selectedOrderForSlip.weave} • {selectedOrderForSlip.zari}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Price:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{selectedOrderForSlip.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-2">
                <span>Central Silk Board Tag: Verified</span>
                <span>Dispatch Carrier: BlueDart Air</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Packing Slip</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderForSlip(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-xs"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
