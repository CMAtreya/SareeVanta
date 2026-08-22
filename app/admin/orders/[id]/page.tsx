'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Send,
  RotateCcw,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Phone,
  Mail,
  Copy,
  Check,
  AlertTriangle,
  AlertCircle,
  FileText,
  DollarSign,
  Package,
  Gift,
  Sparkles,
  QrCode,
  Tag,
  CreditCard,
  MessageSquare,
  Plus,
  X,
  Radio,
  Zap,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  time: string;
  author: string;
  note: string;
  type: 'SYSTEM' | 'USER' | 'CARRIER';
}

export default function SingleOrderProcessingPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const orderId = params.id || 'NSH-2026-8941';

  // Order State
  const [fulfillmentState, setFulfillmentState] = useState<
    'TO_PACK' | 'READY_TO_SHIP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  >('TO_PACK');
  const [carrier, setCarrier] = useState<'Blue Dart Air' | 'Delhivery Surface' | 'Shiprocket Priority'>('Blue Dart Air');
  const [awbCode, setAwbCode] = useState('BD-BLR-884920');

  // Loom Tag Warehouse Picker Verifications
  const [silkMarkChecked, setSilkMarkChecked] = useState(true);
  const [zariInspectionChecked, setZariInspectionChecked] = useState(true);
  const [blousePieceChecked, setBlousePieceChecked] = useState(true);
  const [scentedWrapChecked, setScentedWrapChecked] = useState(true);

  // Copied State
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audit Logs
  const [newNote, setNewNote] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      time: '22 Aug 2026, 06:15 PM',
      author: 'Razorpay Webhook',
      note: 'Prepaid transaction captured (ID: pay_Rzp992810xJk8). Order moved to Fulfillment queue.',
      type: 'SYSTEM',
    },
    {
      id: 'log-2',
      time: '22 Aug 2026, 07:30 PM',
      author: 'Master Weaver Ramesh (Loom 28)',
      note: 'Physical Silk Mark tag #CSB-2026-MYS-8942 verified against Central Silk Board registry.',
      type: 'USER',
    },
    {
      id: 'log-3',
      time: '22 Aug 2026, 08:05 PM',
      author: 'Packaging Salon Lead',
      note: 'Saree wrapped in pure unbleached muslin cloth with natural cedar balls in gift box.',
      type: 'USER',
    },
  ]);

  const allChecksPassed =
    silkMarkChecked && zariInspectionChecked && blousePieceChecked && scentedWrapChecked;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      time: 'Just now',
      author: 'Admin (Mysuru Salon)',
      note: newNote.trim(),
      type: 'USER',
    };

    setAuditLogs([newEntry, ...auditLogs]);
    setNewNote('');
    triggerToast('Internal note recorded on order audit trail.');
  };

  const handlePackAndGenerateAWB = () => {
    setFulfillmentState('READY_TO_SHIP');
    triggerToast(`Order #${orderId} packed & manifested for ${carrier} pickup.`);
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      time: 'Just now',
      author: 'BlueDart Air API',
      note: `AWB #${awbCode} generated. Pickup scheduled for Kempegowda Evening Cargo route.`,
      type: 'CARRIER',
    };
    setAuditLogs([newEntry, ...auditLogs]);
  };

  const handleSendWhatsAppUpdate = () => {
    setIsWhatsAppModalOpen(false);
    triggerToast(`WhatsApp tracking dispatch sent to +91 98450 12345.`);
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      time: 'Just now',
      author: 'Gupshup WhatsApp API',
      note: `Delivered template "saree_dispatched_v2" with BlueDart tracking link.`,
      type: 'SYSTEM',
    };
    setAuditLogs([newEntry, ...auditLogs]);
  };

  const handleCancelOrder = () => {
    setFulfillmentState('CANCELLED');
    setIsCancelModalOpen(false);
    triggerToast(`Order #${orderId} marked Cancelled and refund initiated via Razorpay.`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <div className="font-sans text-slate-900 select-none pb-28 space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. TOP ACTION HEADER                               */}
      {/* ================================================== */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 -mx-6 lg:-mx-8 -mt-6 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        {/* Left: Breadcrumbs & Status Pills */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Orders Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Orders /</span>
              <h2 className="font-bold text-sm sm:text-base text-slate-900 font-sans">
                #{orderId}
              </h2>

              {/* Financial Status Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>PAID (Razorpay UPI)</span>
              </span>

              {/* Fulfillment Status Pill */}
              {fulfillmentState === 'TO_PACK' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Unfulfilled / To Pack</span>
                </span>
              ) : fulfillmentState === 'READY_TO_SHIP' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-300">
                  <Package className="w-3 h-3 text-blue-600" />
                  <span>Ready to Ship</span>
                </span>
              ) : fulfillmentState === 'IN_TRANSIT' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-300">
                  <Truck className="w-3 h-3 text-purple-600" />
                  <span>In-Transit ({carrier})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-300">
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                  <span>Cancelled / Refunded</span>
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Placed on 22 Aug 2026, 06:15 PM • Central Silk Board Verified
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsInvoiceModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Print GST Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLabelModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Thermal Label (4x6)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Send WhatsApp Update</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-medium hover:bg-rose-50 transition-colors"
          >
            Cancel / Refund
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. THREE-COLUMN / SPLIT WORKSTATION GRID           */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================== */}
        {/* MAIN COLUMN (65% - 8 Cols)                     */}
        {/* ============================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: ORDERED ITEMS & WEAVE TAXONOMY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Ordered Saree Items & Loom Manifest (1 SKU)</span>
              </h3>
              <span className="text-[11px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-200">
                HSN 5007.20.10
              </span>
            </div>

            {/* Saree Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"
                    alt="Royal Wodeyar Crimson Crepe Silk"
                    className="w-16 h-20 rounded-xl object-cover border border-slate-300 shadow-2xs"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      Royal Wodeyar Crimson Crepe Silk
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                      <span className="font-semibold text-blue-700">Mysore Silk</span>
                      <span>•</span>
                      <span>100% Pure Mulberry Silk</span>
                      <span>•</span>
                      <span className="font-mono text-amber-700 font-bold">24K Tested Zari</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      SKU: <strong className="text-slate-700">NSH-SKU-MYS-01</strong> • Loom Tag: LOOM-KA-MYS-28
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono sm:border-l sm:border-slate-200 sm:pl-4">
                  <div className="font-bold text-slate-900 text-base">₹28,500</div>
                  <div className="text-[10px] text-slate-500">Qty: 1 Unit</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    GST 5% Included (₹1,357)
                  </div>
                </div>
              </div>

              {/* Tax & Purity Breakdown Details */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Base Taxable</span>
                  <span className="font-bold text-slate-800">₹27,143.00</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">CGST (2.5%)</span>
                  <span className="font-bold text-slate-800">₹678.50</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">SGST (2.5%)</span>
                  <span className="font-bold text-slate-800">₹678.50</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">Central Silk Mark</span>
                  <span className="font-bold text-emerald-700">CSB-2026-MYS-8942</span>
                </div>
              </div>
            </div>

            {/* Gift Box Add-on Banner */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">Luxury Scented Silk Gift Box Packaging Requested</span>
                  <p className="text-[11px] text-rose-700 italic font-sans mt-0.5">
                    "Happy Wedding Anniversary to dearest Amma & Appa. With lots of love!"
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-rose-200/60 text-rose-900 px-2 py-0.5 rounded font-bold">
                COMPLIMENTARY
              </span>
            </div>
          </div>

          {/* SECTION 2: LOOM TAG & WAREHOUSE PICKER VERIFICATION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Warehouse Picker Quality Verification Checklist</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Mandatory before label printing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={silkMarkChecked}
                  onChange={(e) => setSilkMarkChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Verify Physical Silk Mark Tag #CSB-2026-MYS-8942
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Ensure holographic barcode is stitched firmly to saree pallu.
                  </span>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={zariInspectionChecked}
                  onChange={(e) => setZariInspectionChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    24K Tested Zari Inspection
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Inspect pallu zari weft for zero snagging and intact kasuti weave.
                  </span>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={blousePieceChecked}
                  onChange={(e) => setBlousePieceChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Blouse Piece Included (80cm Running)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Contrast crimson crepe blouse attached at end of cut length.
                  </span>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={scentedWrapChecked}
                  onChange={(e) => setScentedWrapChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Muslin Wrap & Cedar Ball Inset
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Wrap in pure unbleached cotton muslin with anniversary card.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 3: SHIPPING CARRIER INTEGRATION & RATE COMPARISON */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Shipping Carrier Integration & Rate Comparison</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Pincode 560001 Serviceable
              </span>
            </div>

            {/* Courier Comparison Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* BlueDart Air (Recommended) */}
              <div
                onClick={() => setCarrier('Blue Dart Air')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  carrier === 'Blue Dart Air'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">Blue Dart Air</span>
                  <span className="text-[9px] font-mono bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                    FASTEST
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Next-Day 10:30 AM Delivery</div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 font-mono">
                  <span className="text-xs font-bold text-slate-900">₹280.00</span>
                  <span className="text-[10px] text-emerald-700 font-bold">99.8% On-Time</span>
                </div>
              </div>

              {/* Delhivery Surface */}
              <div
                onClick={() => setCarrier('Delhivery Surface')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  carrier === 'Delhivery Surface'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">Delhivery Express</span>
                  <span className="text-[9px] font-mono bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                    CHEAPEST
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">2 Business Days Delivery</div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 font-mono">
                  <span className="text-xs font-bold text-slate-900">₹160.00</span>
                  <span className="text-[10px] text-slate-600 font-medium">96.4% On-Time</span>
                </div>
              </div>

              {/* Shiprocket Priority */}
              <div
                onClick={() => setCarrier('Shiprocket Priority')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  carrier === 'Shiprocket Priority'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">Shiprocket Priority</span>
                  <span className="text-[9px] font-mono bg-purple-600 text-white px-1.5 py-0.2 rounded font-bold">
                    MULTI-CARRIER
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Smart Routing (Blr Hub)</div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200 font-mono">
                  <span className="text-xs font-bold text-slate-900">₹240.00</span>
                  <span className="text-[10px] text-slate-600 font-medium">98.1% On-Time</span>
                </div>
              </div>
            </div>

            {/* AWB Generation Action */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block font-mono">
                  Active AWB Code: <span className="text-blue-700">{awbCode}</span>
                </span>
                <span className="text-slate-500 text-[11px] font-mono">
                  Pickup Slot: Today, 07:30 PM • Kempegowda Air Corridor
                </span>
              </div>

              <button
                type="button"
                disabled={!allChecksPassed}
                onClick={handlePackAndGenerateAWB}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Assign {carrier} & Generate AWB</span>
              </button>
            </div>

            {/* Live AWB Webhook Step Log */}
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
                Live Courier Webhook Events
              </span>
              <div className="space-y-2 text-xs font-mono">
                {[
                  {
                    event: 'MANIFEST_GENERATED',
                    text: 'Shipping manifest electronic data transmitted to BlueDart server.',
                    time: '22 Aug, 07:35 PM',
                  },
                  {
                    event: 'PICKUP_SCHEDULED',
                    text: 'Assigned to BlueDart Courier Agent (Mysuru Sayyaji Rao Hub).',
                    time: '22 Aug, 08:00 PM',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-slate-700"
                  >
                    <div>
                      <span className="text-blue-700 font-bold mr-2">[{item.event}]</span>
                      <span>{item.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================== */}
        {/* RIGHT COLUMN (35% - 4 Cols - Customer Sidebar) */}
        {/* ============================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. CUSTOMER PROFILE & RISK SCORE */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
                Patron Intelligence
              </h4>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                Low RTO Risk (98%)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                AR
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-sm truncate">
                  Dr. Ananya Rao
                </div>
                <div className="text-xs text-slate-500 font-mono">Senior Surgeon • Bengaluru</div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 font-mono text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] uppercase text-slate-400 block">Total Orders</span>
                <span className="font-bold text-slate-900 text-sm">4 Orders</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[9px] uppercase text-slate-400 block">Customer LTV</span>
                <span className="font-bold text-emerald-700 text-sm">₹1,48,500</span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-1.5 text-xs font-mono pt-1 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>+91 98450 12345</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyText('+91 98450 12345', 'phone')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">ananya.rao@hospital.org</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyText('ananya.rao@hospital.org', 'email')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* 2. SHIPPING & BILLING ADDRESS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Destination Address</span>
              </h4>
              <a
                href="https://maps.google.com/?q=560001+Bengaluru"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-mono text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="text-xs text-slate-800 space-y-1 leading-relaxed">
              <div className="font-bold text-slate-900">Dr. Ananya Rao</div>
              <div>#402, Heritage Palms, Lavelle Road</div>
              <div>Near UB City Mall, Shanthala Nagar</div>
              <div>Bengaluru, Karnataka — <strong className="font-mono text-slate-900">560001</strong></div>
            </div>

            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] font-mono text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Pincode 560001: Direct BlueDart Air Delivery Zone 1</span>
            </div>
          </div>

          {/* 3. FINANCIAL SUMMARY */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider pb-2 border-b border-slate-100">
              Financial Summary & GST
            </h4>

            <div className="space-y-2 text-xs font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (1 Handloom SKU):</span>
                <span>₹28,500.00</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Applied (ROYALHERITAGE):</span>
                <span>-₹0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Handloom Silk GST (5% Included):</span>
                <span>₹1,357.00</span>
              </div>
              <div className="flex justify-between">
                <span>BlueDart Insured Air Express:</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between text-slate-900 font-bold text-sm">
                <span>Total Amount:</span>
                <span>₹28,500.00</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-500 space-y-0.5">
              <div className="flex justify-between">
                <span>Gateway:</span>
                <span className="font-bold text-slate-800">Razorpay UPI</span>
              </div>
              <div className="flex justify-between">
                <span>Txn ID:</span>
                <span className="font-bold text-blue-700">pay_Rzp992810xJk8</span>
              </div>
            </div>
          </div>

          {/* 4. INTERNAL ORDER NOTES & AUDIT TRAIL */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Order Audit Trail</span>
              <span className="text-[10px] font-mono text-slate-400">{auditLogs.length} Events</span>
            </h4>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private note (e.g. customer requested evening delivery)..."
                className="w-full p-2 border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Internal Note</span>
              </button>
            </form>

            {/* Audit Logs List */}
            <div className="space-y-2.5 pt-2 max-h-64 overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans space-y-1"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold text-slate-800">{log.author}</span>
                    <span className="text-slate-400">{log.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. MODALS (INVOICE, THERMAL LABEL, WHATSAPP, CANCEL) */}
      {/* ================================================== */}

      {/* GST Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  GST Tax Invoice — Order #{orderId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <div className="font-bold text-sm text-slate-900 font-sans">NEEL SAREE HOUSE</div>
                  <div className="text-slate-500">Sayyaji Rao Road, Mysuru, Karnataka 570001</div>
                  <div className="text-slate-600">GSTIN: 29AAAAA0000A1Z5</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">TAX INVOICE</div>
                  <div className="text-slate-500">Invoice #: NSH-INV-2026-8941</div>
                  <div className="text-slate-500">Date: 22 Aug 2026</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800 font-sans">Bill & Deliver To:</div>
                <div className="text-slate-700">Dr. Ananya Rao</div>
                <div className="text-slate-600">#402, Heritage Palms, Lavelle Road, Bengaluru 560001</div>
                <div className="text-slate-600">State Code: 29 (Karnataka)</div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2">HSN</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2 text-right">Taxable</th>
                    <th className="p-2 text-right">GST (5%)</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2">
                      <div className="font-bold text-slate-900">Royal Wodeyar Crimson Crepe Silk</div>
                      <div className="text-[10px] text-slate-400">Silk Mark: CSB-2026-MYS-8942</div>
                    </td>
                    <td className="p-2">5007.20.10</td>
                    <td className="p-2">1</td>
                    <td className="p-2 text-right">₹27,143.00</td>
                    <td className="p-2 text-right">₹1,357.00</td>
                    <td className="p-2 text-right font-bold">₹28,500.00</td>
                  </tr>
                </tbody>
              </table>

              <div className="text-right font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                Total Invoice Value: ₹28,500.00 (Prepaid via UPI)
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] font-mono text-slate-500">Authorized Silk Board Signatory</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Label Modal */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  4x6" Thermal BlueDart Air Label
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="border-2 border-slate-900 rounded-2xl p-5 bg-white space-y-3">
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
                  <div className="font-bold text-lg text-slate-900">BLUE DART AIR</div>
                  <div className="text-right font-mono text-[10px] font-bold">
                    PRIORITY HANDLOOM AIR
                  </div>
                </div>

                <div className="h-12 bg-slate-950 rounded flex items-center justify-center text-white text-xs font-mono tracking-[0.3em] font-bold">
                  ||||| || |||| ||| ||||| ||||
                </div>

                <div className="flex justify-between font-mono text-xs font-bold border-b border-slate-300 pb-2">
                  <span>AWB: {awbCode}</span>
                  <span>ROUTING: BLR / MYQ</span>
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
                      Shipper Return:
                    </span>
                    <div className="font-bold text-slate-900">NEEL SAREE HOUSE</div>
                    <div className="text-slate-700">Sayyaji Rao Rd, Mysuru</div>
                    <div className="font-bold text-slate-900 font-mono">PIN: 570001</div>
                    <div className="font-mono text-emerald-800 font-bold">SILK MARK VERIFIED</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLabelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Dispatch Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Send WhatsApp Dispatch Update
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs font-sans">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-950">
                <div className="font-bold text-xs flex items-center gap-1.5 text-emerald-800">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Template: saree_dispatched_v2</span>
                </div>
                <p className="font-sans leading-relaxed text-xs">
                  Namaste <strong>Dr. Ananya Rao</strong>! Your handcrafted{' '}
                  <strong>Royal Wodeyar Crimson Crepe Silk</strong> has been verified with Central Silk
                  Mark tag (<strong>#CSB-2026-MYS-8942</strong>) and handed over to BlueDart Air.
                </p>
                <p className="font-mono text-[11px] text-emerald-800">
                  AWB Code: <strong>{awbCode}</strong>
                  <br />
                  Tracking Link: https://neelsareehouse.com/orders/{orderId}/track
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendWhatsAppUpdate}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-rose-900 font-sans">
                  Cancel Order & Initiate Refund
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs font-sans">
              <p className="text-slate-700 leading-relaxed">
                Are you sure you want to cancel order <strong>#{orderId}</strong>? This will release the
                reserved loom stock back into available inventory and reverse ₹28,500 via Razorpay UPI.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium"
              >
                Keep Order Active
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Cancellation & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
