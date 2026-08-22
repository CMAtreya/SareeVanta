'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Package,
  Gift,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  X,
  FileText,
  Copy,
  Check,
  CreditCard,
  RotateCcw,
  Sparkles,
  QrCode,
  ShieldCheck,
  Send,
  Eye,
  SlidersHorizontal,
  Calendar,
  Layers,
} from 'lucide-react';

interface OrderItem {
  title: string;
  weave: string;
  sku: string;
  price: number;
  qty: number;
  image: string;
  zari: string;
}

interface OrderRecord {
  id: string;
  date: string;
  time: string;
  customerName: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  items: OrderItem[];
  totalAmount: number;
  paymentGateway: 'Razorpay UPI' | 'Cashfree NetBanking' | 'Razorpay CC' | 'Cash on Delivery';
  paymentStatus: 'PAID' | 'COD_UNCONFIRMED' | 'FAILED';
  fulfillmentState:
    | 'UNASSIGNED'
    | 'TO_PACK'
    | 'READY_TO_SHIP'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED_RTO';
  awb: string;
  carrier: 'Blue Dart Air' | 'Delhivery Express';
  isGiftWrapped: boolean;
  giftMessage?: string;
  silkMarkAuditId: string;
}

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'NSH-2026-8941',
    date: '22 Aug 2026',
    time: '06:15 PM',
    customerName: 'Dr. Ananya Rao',
    city: 'Bengaluru, KA',
    pincode: '560001',
    phone: '+91 98450 12345',
    email: 'ananya.rao@hospital.org',
    items: [
      {
        title: 'Royal Wodeyar Crimson Crepe Silk',
        weave: 'Mysore Silk',
        sku: 'NSH-SKU-MYS-01',
        price: 28500,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
        zari: '24K Tested Pure Zari',
      },
    ],
    totalAmount: 28500,
    paymentGateway: 'Razorpay UPI',
    paymentStatus: 'PAID',
    fulfillmentState: 'TO_PACK',
    awb: 'BD-BLR-884920',
    carrier: 'Blue Dart Air',
    isGiftWrapped: true,
    giftMessage: 'Happy Wedding Anniversary to dearest Amma & Appa. With lots of love!',
    silkMarkAuditId: 'CSB-2026-MYS-8942',
  },
  {
    id: 'NSH-2026-8940',
    date: '22 Aug 2026',
    time: '03:40 PM',
    customerName: 'Smt. Radhika Reddy',
    city: 'Hyderabad, TS',
    pincode: '500034',
    phone: '+91 99890 98765',
    email: 'radhika.reddy@gmail.com',
    items: [
      {
        title: 'Bridal Kanchipuram Korvai Gold Brocade',
        weave: 'Kanchipuram',
        sku: 'NSH-SKU-KAN-04',
        price: 68000,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
        zari: 'Sacred 3-Shuttle Pure Gold Zari',
      },
      {
        title: 'Champagne Tissue Georgette Floral Zari',
        weave: 'Tissue Georgette',
        sku: 'NSH-SKU-TIS-08',
        price: 36000,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
        zari: 'Lightweight Tested Zari',
      },
    ],
    totalAmount: 104000,
    paymentGateway: 'Cashfree NetBanking',
    paymentStatus: 'PAID',
    fulfillmentState: 'READY_TO_SHIP',
    awb: 'BD-HYD-773821',
    carrier: 'Blue Dart Air',
    isGiftWrapped: false,
    silkMarkAuditId: 'CSB-2026-KAN-1102',
  },
  {
    id: 'NSH-2026-8939',
    date: '22 Aug 2026',
    time: '01:20 PM',
    customerName: 'Meera Deshmukh',
    city: 'Mumbai, MH',
    pincode: '400050',
    phone: '+91 98200 44556',
    email: 'meera.deshmukh@outlook.com',
    items: [
      {
        title: 'Yeola Paithani Royal Peacock Asawali',
        weave: 'Paithani',
        sku: 'NSH-SKU-PAI-02',
        price: 46000,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
        zari: 'Tapestry Pure Zari',
      },
    ],
    totalAmount: 46000,
    paymentGateway: 'Razorpay CC',
    paymentStatus: 'PAID',
    fulfillmentState: 'IN_TRANSIT',
    awb: 'BD-MUM-119283',
    carrier: 'Blue Dart Air',
    isGiftWrapped: true,
    giftMessage: 'For the Diwali Pooja. Stay blessed!',
    silkMarkAuditId: 'CSB-2026-PAI-9920',
  },
  {
    id: 'NSH-2026-8938',
    date: '21 Aug 2026',
    time: '07:10 PM',
    customerName: 'Pooja Singhania',
    city: 'New Delhi, DL',
    pincode: '110001',
    phone: '+91 98110 33221',
    email: 'pooja.singhania@delhicorp.in',
    items: [
      {
        title: 'Varanasi Kadwa Katan Meenakari Boota',
        weave: 'Banarasi',
        sku: 'NSH-SKU-BAN-03',
        price: 54000,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
        zari: 'Antiqued Gold Tested Zari',
      },
    ],
    totalAmount: 54000,
    paymentGateway: 'Razorpay UPI',
    paymentStatus: 'PAID',
    fulfillmentState: 'OUT_FOR_DELIVERY',
    awb: 'BD-DEL-554910',
    carrier: 'Blue Dart Air',
    isGiftWrapped: false,
    silkMarkAuditId: 'CSB-2026-BAN-5510',
  },
  {
    id: 'NSH-2026-8937',
    date: '21 Aug 2026',
    time: '02:45 PM',
    customerName: 'Kavitha Sundaram',
    city: 'Chennai, TN',
    pincode: '600004',
    phone: '+91 94440 88990',
    email: 'kavitha.sundaram@gmail.com',
    items: [
      {
        title: 'Mysuru Sandalwood Crepe Gold Kasuti',
        weave: 'Mysore Silk',
        sku: 'NSH-SKU-MYS-07',
        price: 32000,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
        zari: 'Pure Mulberry Tested Zari',
      },
    ],
    totalAmount: 32000,
    paymentGateway: 'Cash on Delivery',
    paymentStatus: 'COD_UNCONFIRMED',
    fulfillmentState: 'TO_PACK',
    awb: 'DEL-MAA-992011',
    carrier: 'Delhivery Express',
    isGiftWrapped: false,
    silkMarkAuditId: 'CSB-2026-MYS-3319',
  },
  {
    id: 'NSH-2026-8936',
    date: '20 Aug 2026',
    time: '11:30 AM',
    customerName: 'Sneha Kulkarni',
    city: 'Pune, MH',
    pincode: '411004',
    phone: '+91 97650 11223',
    email: 'sneha.k@puneengg.ac.in',
    items: [
      {
        title: 'Royal Wodeyar Crimson Crepe Silk',
        weave: 'Mysore Silk',
        sku: 'NSH-SKU-MYS-01',
        price: 28500,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
        zari: '24K Tested Pure Zari',
      },
    ],
    totalAmount: 28500,
    paymentGateway: 'Razorpay UPI',
    paymentStatus: 'PAID',
    fulfillmentState: 'DELIVERED',
    awb: 'BD-PUN-334190',
    carrier: 'Blue Dart Air',
    isGiftWrapped: false,
    silkMarkAuditId: 'CSB-2026-MYS-8942',
  },
  {
    id: 'NSH-2026-8935',
    date: '19 Aug 2026',
    time: '04:15 PM',
    customerName: 'Deepak Varma',
    city: 'Kolkata, WB',
    pincode: '700019',
    phone: '+91 98300 77889',
    email: 'deepak.varma@tata.com',
    items: [
      {
        title: 'Varanasi Kadwa Katan Meenakari Boota',
        weave: 'Banarasi',
        sku: 'NSH-SKU-BAN-03',
        price: 54000,
        qty: 1,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
        zari: 'Antiqued Gold Tested Zari',
      },
    ],
    totalAmount: 54000,
    paymentGateway: 'Cash on Delivery',
    paymentStatus: 'FAILED',
    fulfillmentState: 'CANCELLED_RTO',
    awb: 'DEL-CCU-441920',
    carrier: 'Delhivery Express',
    isGiftWrapped: false,
    silkMarkAuditId: 'CSB-2026-BAN-5510',
  },
];

export default function OrderManagementHubPage() {
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    | 'ALL'
    | 'TO_PACK'
    | 'READY_TO_SHIP'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'COD_PENDING'
    | 'CANCELLED_RTO'
  >('ALL');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL_TIME');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  // Modals & Drawers
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<OrderRecord | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<OrderRecord | null>(null);
  const [isBulkLabelModalOpen, setIsBulkLabelModalOpen] = useState(false);
  const [isBulkInvoiceModalOpen, setIsBulkInvoiceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab Counts
  const counts = useMemo(() => {
    return {
      ALL: orders.length,
      TO_PACK: orders.filter((o) => o.fulfillmentState === 'TO_PACK').length,
      READY_TO_SHIP: orders.filter((o) => o.fulfillmentState === 'READY_TO_SHIP').length,
      IN_TRANSIT: orders.filter((o) => o.fulfillmentState === 'IN_TRANSIT').length,
      OUT_FOR_DELIVERY: orders.filter((o) => o.fulfillmentState === 'OUT_FOR_DELIVERY').length,
      DELIVERED: orders.filter((o) => o.fulfillmentState === 'DELIVERED').length,
      COD_PENDING: orders.filter((o) => o.paymentStatus === 'COD_UNCONFIRMED').length,
      CANCELLED_RTO: orders.filter((o) => o.fulfillmentState === 'CANCELLED_RTO').length,
    };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Tab Filter
      if (activeTab === 'TO_PACK' && o.fulfillmentState !== 'TO_PACK') return false;
      if (activeTab === 'READY_TO_SHIP' && o.fulfillmentState !== 'READY_TO_SHIP') return false;
      if (activeTab === 'IN_TRANSIT' && o.fulfillmentState !== 'IN_TRANSIT') return false;
      if (activeTab === 'OUT_FOR_DELIVERY' && o.fulfillmentState !== 'OUT_FOR_DELIVERY') return false;
      if (activeTab === 'DELIVERED' && o.fulfillmentState !== 'DELIVERED') return false;
      if (activeTab === 'COD_PENDING' && o.paymentStatus !== 'COD_UNCONFIRMED') return false;
      if (activeTab === 'CANCELLED_RTO' && o.fulfillmentState !== 'CANCELLED_RTO') return false;

      // Gateway Filter
      if (gatewayFilter !== 'ALL' && o.paymentGateway !== gatewayFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        const matches =
          o.id.toLowerCase().includes(cleanQ) ||
          o.awb.toLowerCase().includes(cleanQ) ||
          o.customerName.toLowerCase().includes(cleanQ) ||
          o.city.toLowerCase().includes(cleanQ) ||
          o.pincode.includes(cleanQ) ||
          o.phone.includes(cleanQ);

        if (!matches) return false;
      }

      return true;
    });
  }, [orders, activeTab, gatewayFilter, searchQuery]);

  // Multi-select handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // State Transition Actions
  const handlePackOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, fulfillmentState: 'READY_TO_SHIP' } : o))
    );
    triggerToast(`Order #${id} packed and manifested for BlueDart pickup.`);
  };

  const handleBulkManifest = () => {
    setOrders((prev) =>
      prev.map((o) =>
        selectedOrderIds.includes(o.id) ? { ...o, fulfillmentState: 'READY_TO_SHIP' } : o
      )
    );
    triggerToast(`${selectedOrderIds.length} orders manifested for courier pickup.`);
    setSelectedOrderIds([]);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Export Courier Pickup Manifest CSV
  const handleExportCourierManifest = () => {
    const targetOrders =
      selectedOrderIds.length > 0
        ? orders.filter((o) => selectedOrderIds.includes(o.id))
        : filteredOrders;

    const headers = [
      'Order ID',
      'AWB Code',
      'Carrier',
      'Customer Name',
      'Contact Phone',
      'Delivery Address / City',
      'Pincode',
      'Declared Value INR',
      'COD Amount INR',
      'Weight Grams',
      'Silk Mark Tag',
    ];

    const rows = targetOrders.map((o) => [
      `"${o.id}"`,
      `"${o.awb}"`,
      `"${o.carrier}"`,
      `"${o.customerName}"`,
      `"${o.phone}"`,
      `"${o.city}"`,
      `"${o.pincode}"`,
      o.totalAmount,
      o.paymentStatus === 'COD_UNCONFIRMED' ? o.totalAmount : 0,
      o.items.length * 680,
      `"${o.silkMarkAuditId}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `BlueDart_Delhivery_Pickup_Manifest_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(id);
    setTimeout(() => setCopiedAwb(null), 1500);
  };

  return (
    <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-fade-in">
      {/* ================================================== */}
      {/* 1. TOP HEADER & BREADCRUMBS                        */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Order Management Hub
            </h1>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{counts.TO_PACK} Orders To Pack (P0 Urgent)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Real-Time BlueDart Air & Delhivery Handloom Fulfillment Pipeline
          </p>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCourierManifest}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Courier Manifest</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkInvoiceModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download Tax Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBulkLabelModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Bulk Shipping Labels</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. ADVANCED FILTER BAR                             */}
      {/* ================================================== */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search & Select Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order #, AWB code, Customer Name, Pincode, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Gateway Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Gateway:
              </span>
              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL">All Gateways</option>
                <option value="Razorpay UPI">Razorpay UPI</option>
                <option value="Cashfree NetBanking">Cashfree NetBanking</option>
                <option value="Razorpay CC">Razorpay CC</option>
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Period:
              </span>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                <option value="ALL_TIME">All Time</option>
                <option value="TODAY">Today</option>
                <option value="YESTERDAY">Yesterday</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="MTD">Month-to-Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {[
            { key: 'ALL', label: 'All Orders', count: counts.ALL },
            { key: 'TO_PACK', label: 'Unfulfilled / To Pack', count: counts.TO_PACK, urgent: true },
            { key: 'READY_TO_SHIP', label: 'Ready to Ship', count: counts.READY_TO_SHIP },
            { key: 'IN_TRANSIT', label: 'In-Transit', count: counts.IN_TRANSIT },
            { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: counts.OUT_FOR_DELIVERY },
            { key: 'DELIVERED', label: 'Delivered', count: counts.DELIVERED },
            { key: 'COD_PENDING', label: 'COD Verification', count: counts.COD_PENDING },
            { key: 'CANCELLED_RTO', label: 'Cancelled / RTO', count: counts.CANCELLED_RTO },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  activeTab === tab.key
                    ? 'bg-slate-800 text-amber-300'
                    : tab.urgent && tab.count > 0
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
      {/* 3. FLOATING BULK SELECTION ACTION BAR             */}
      {/* ================================================== */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl flex items-center justify-between text-xs animate-fade-in border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white font-mono px-2.5 py-0.5 rounded font-bold">
              {selectedOrderIds.length} Selected
            </span>
            <span className="text-slate-300 font-sans hidden sm:inline">
              Fulfillment actions for BlueDart & Delhivery dispatch:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkManifest}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Mark Packed</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBulkLabelModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Generate Labels</span>
            </button>
            <button
              type="button"
              onClick={handleExportCourierManifest}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Manifest</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. INTERACTIVE DATA TABLE                          */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedOrderIds.length === filteredOrders.length
                    }
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                </th>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Customer & Destination</th>
                <th className="p-3.5">Product Breakdown</th>
                <th className="p-3.5">Total & Payment</th>
                <th className="p-3.5">Fulfillment State</th>
                <th className="p-3.5 text-right">Primary Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  const totalItems = order.items.reduce((acc, it) => acc + it.qty, 0);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(order.id)}
                          className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                      </td>

                      {/* Order ID & Gift Wrapped Indicator */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono font-bold text-slate-900 hover:text-blue-600 hover:underline"
                          >
                            #{order.id}
                          </Link>
                          {order.isGiftWrapped && (
                            <span
                              className="p-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200"
                              title={`Gift Wrapped: "${order.giftMessage || 'Scented Silk Box'}"`}
                            >
                              <Gift className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>{order.awb}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(order.awb, order.id)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Copy AWB Tracking Code"
                          >
                            {copiedAwb === order.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">
                        <div>{order.date}</div>
                        <div className="text-[10px] text-slate-400">{order.time}</div>
                      </td>

                      {/* Customer & Destination */}
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>
                            {order.city} • <strong className="text-slate-700">{order.pincode}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Product Breakdown (Stacked Thumbnails) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.title}
                                title={`${item.title} (${item.weave})`}
                                className="w-8 h-10 rounded object-cover border border-white shadow-2xs"
                              />
                            ))}
                          </div>
                          <div className="text-[11px] font-mono">
                            <span className="font-bold text-slate-800">{totalItems} Item{totalItems > 1 ? 's' : ''}</span>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {order.items[0]?.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Total & Payment Badge */}
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-slate-900 text-xs">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="mt-0.5">
                          {order.paymentStatus === 'PAID' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{order.paymentGateway}</span>
                            </span>
                          ) : order.paymentStatus === 'COD_UNCONFIRMED' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-2.5 h-2.5 text-amber-600" />
                              <span>COD Unconfirmed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                              <span>Payment Failed</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fulfillment State Pill */}
                      <td className="p-3.5">
                        {order.fulfillmentState === 'TO_PACK' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Unfulfilled / To Pack</span>
                          </span>
                        ) : order.fulfillmentState === 'READY_TO_SHIP' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-300">
                            <Package className="w-3 h-3 text-blue-600" />
                            <span>Ready to Ship</span>
                          </span>
                        ) : order.fulfillmentState === 'IN_TRANSIT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-300">
                            <Truck className="w-3 h-3 text-purple-600" />
                            <span>In-Transit ({order.carrier})</span>
                          </span>
                        ) : order.fulfillmentState === 'OUT_FOR_DELIVERY' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-300">
                            <Truck className="w-3 h-3 text-indigo-600" />
                            <span>Out for Delivery</span>
                          </span>
                        ) : order.fulfillmentState === 'DELIVERED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Delivered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>RTO / Cancelled</span>
                          </span>
                        )}
                      </td>

                      {/* Primary Contextual Action Button */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.fulfillmentState === 'TO_PACK' ? (
                            <button
                              type="button"
                              onClick={() => handlePackOrder(order.id)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <Package className="w-3 h-3" />
                              <span>Pack Items</span>
                            </button>
                          ) : order.fulfillmentState === 'READY_TO_SHIP' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForDrawer(order);
                                setIsBulkLabelModalOpen(true);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Print Label</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setTrackingOrder(order)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1"
                            >
                              <Truck className="w-3 h-3 text-slate-500" />
                              <span>Track AWB</span>
                            </button>
                          )}

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            title="Inspect Order Workstation"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Showing {filteredOrders.length} of {orders.length} Handloom Dispatches</span>
          <span>Mysuru Salon BlueDart Air API Connected</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* 5. ORDER DETAIL DRAWER & PACKING VERIFICATION     */}
      {/* ================================================== */}
      {selectedOrderForDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  NS
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                    <span>Order #{selectedOrderForDrawer.id}</span>
                    {selectedOrderForDrawer.isGiftWrapped && (
                      <span className="text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        <span>Gift Wrapped</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    Placed on {selectedOrderForDrawer.date} at {selectedOrderForDrawer.time}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForDrawer(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans max-h-[75vh] overflow-y-auto">
              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Patron & Delivery Address
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedOrderForDrawer.customerName}
                  </div>
                  <div className="text-slate-700">{selectedOrderForDrawer.city}</div>
                  <div className="font-mono text-slate-600">
                    PIN: <strong>{selectedOrderForDrawer.pincode}</strong>
                  </div>
                  <div className="font-mono text-blue-700 pt-1">
                    {selectedOrderForDrawer.phone} • {selectedOrderForDrawer.email}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block font-mono">
                    Air Courier & Logistics
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Carrier:</span>
                    <span className="font-bold text-slate-900">{selectedOrderForDrawer.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AWB Code:</span>
                    <span className="font-bold text-blue-600">{selectedOrderForDrawer.awb}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Silk Mark Audit:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedOrderForDrawer.silkMarkAuditId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-bold text-slate-800">
                      {selectedOrderForDrawer.paymentGateway}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gift Message Card */}
              {selectedOrderForDrawer.isGiftWrapped && selectedOrderForDrawer.giftMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-rose-600" />
                    <span>Personalized Gift Card Inscription:</span>
                  </div>
                  <p className="italic text-xs font-sans">"{selectedOrderForDrawer.giftMessage}"</p>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Ordered Saree Items ({selectedOrderForDrawer.items.length})
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {selectedOrderForDrawer.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-14 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {item.weave} • {item.zari}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{item.sku}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">Qty: {item.qty}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrderForDrawer.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Handloom Silk GST (5% Included):</span>
                  <span>
                    ₹{Math.round(selectedOrderForDrawer.totalAmount * 0.05).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>BlueDart Insured Air Express:</span>
                  <span className="text-emerald-700 font-bold">FREE (Complimentary)</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span>₹{selectedOrderForDrawer.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 flex items-center gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print GST Tax Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderForDrawer(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Close Order File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. LIVE COURIER TRACKING DRAWER                    */}
      {/* ================================================== */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-sans">
                    Live Courier Radar Tracking
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    {trackingOrder.carrier} • {trackingOrder.awb}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs font-sans">
              {/* Stepper */}
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                {[
                  {
                    title: 'Order Manifested & Picked Up',
                    desc: 'Mysuru Flagship Salon Hub',
                    time: '22 Aug, 07:45 PM',
                    completed: true,
                  },
                  {
                    title: 'Sorted at Bengaluru Air Hub',
                    desc: 'Kempegowda International Gateway',
                    time: '23 Aug, 03:15 AM',
                    completed: true,
                  },
                  {
                    title: 'Out for Destination Delivery',
                    desc: `Assigned to BlueDart Courier Agent for ${trackingOrder.city}`,
                    time: '23 Aug, 09:30 AM',
                    completed: trackingOrder.fulfillmentState === 'OUT_FOR_DELIVERY' || trackingOrder.fulfillmentState === 'DELIVERED',
                  },
                  {
                    title: 'Delivered to Patron',
                    desc: 'OTP Verified Doorstep Handover with Silk Mark Box',
                    time: 'Expected by 02:00 PM',
                    completed: trackingOrder.fulfillmentState === 'DELIVERED',
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        step.completed
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step.completed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{step.title}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{step.desc}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Tracking Radar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 7. THERMAL BARCODE & SHIPPING LABEL MODAL          */}
      {/* ================================================== */}
      {isBulkLabelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  BlueDart Air 4x6" Thermal Shipping Label
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkLabelModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="border-2 border-slate-900 rounded-2xl p-5 bg-white space-y-3 shadow-sm">
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
                  <div className="font-bold text-lg text-slate-900 font-sans">BLUE DART AIR</div>
                  <div className="text-right font-mono text-[10px] font-bold">
                    PRIORITY HANDLOOM EXPRESS
                  </div>
                </div>

                {/* Barcode representation */}
                <div className="h-12 bg-slate-950 rounded flex items-center justify-center text-white text-xs font-mono tracking-[0.3em] font-bold">
                  ||||| || |||| ||| ||||| ||||
                </div>

                <div className="flex justify-between font-mono text-xs font-bold border-b border-slate-300 pb-2">
                  <span>AWB: BD-BLR-884920</span>
                  <span>ROUTING: BLR / HYD</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-bold text-[10px] uppercase text-slate-500 block font-mono">
                      Deliver To:
                    </span>
                    <div className="font-bold text-slate-900">Dr. Ananya Rao</div>
                    <div className="text-slate-700">Bengaluru, Karnataka</div>
                    <div className="font-bold text-slate-900 font-mono">PIN: 560001</div>
                    <div className="font-mono text-slate-600">+91 98450 12345</div>
                  </div>

                  <div>
                    <span className="font-bold text-[10px] uppercase text-slate-500 block font-mono">
                      Shipper Return Address:
                    </span>
                    <div className="font-bold text-slate-900">NEEL SAREE HOUSE</div>
                    <div className="text-slate-700">Sayyaji Rao Road, Mysuru</div>
                    <div className="font-bold text-slate-900 font-mono">PIN: 570001</div>
                    <div className="font-mono text-emerald-800 font-bold">100% SILK MARK CERTIFIED</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-500">Standard 4x6" Zebra Thermal Scale</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkLabelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Label PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 8. BULK TAX INVOICE MODAL                          */}
      {/* ================================================== */}
      {isBulkInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Batch GST Tax Invoices
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs font-sans text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Printer className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Generate Invoices for {filteredOrders.length} Orders
              </h4>
              <p className="text-slate-500 font-mono text-xs">
                Includes Central Silk Board certification hashes and 5% GST tax breakdown
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkInvoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setIsBulkInvoiceModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Download PDF Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
