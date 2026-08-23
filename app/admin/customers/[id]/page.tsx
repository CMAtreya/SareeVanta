'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Crown,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  Heart,
  Video,
  Plus,
  Send,
  Gift,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  CreditCard,
  Truck,
  Eye,
  X,
  UserCheck,
  Tag,
} from 'lucide-react';
import { SAMPLE_CUSTOMERS, CustomerRecord } from '@/lib/customers';

export default function Customer360ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const customerId = params.id;

  // Find customer or fallback to Dr. Ananya Rao
  const customer: CustomerRecord =
    SAMPLE_CUSTOMERS.find((c) => c.id === customerId) || SAMPLE_CUSTOMERS[0];

  const [activeTab, setActiveTab] = useState<'ORDERS' | 'BAG_WISHLIST' | 'VIDEO_CALLS' | 'ADDRESSES'>(
    'ORDERS'
  );

  // Modals & Actions
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Store credit generator state
  const [voucherAmount, setVoucherAmount] = useState('5000');
  const [voucherReason, setVoucherReason] = useState('Bridal Trousseau Privilege Privilege');
  const [generatedVoucherCode, setGeneratedVoucherCode] = useState<string | null>(null);

  // Video Call Booking State
  const [videoSlot, setVideoSlot] = useState('Tomorrow, 04:00 PM (IST)');
  const [videoStylist, setVideoStylist] = useState('Meenakshi (Senior Bridal Stylist)');
  const [videoWeaves, setVideoWeaves] = useState('Kanchipuram Korvai & Mysore Crepe');

  // Video Call Logs State
  const [videoLogs, setVideoLogs] = useState([
    {
      id: 'vlog-1',
      date: '18 Aug 2026, 05:30 PM',
      duration: '38 Mins',
      stylist: 'Meenakshi (Senior Bridal Draper)',
      notes:
        'Showcased 4 pure Korvai 3-shuttle pieces. Patron loved the Crimson Mayil Peacock border (#NSH-SKU-MYS-01). Requested matching crimson kasuti blouse piece swatch.',
      status: 'COMPLETED',
    },
    {
      id: 'vlog-2',
      date: '10 Aug 2026, 03:00 PM',
      duration: '22 Mins',
      stylist: 'Suresh (Salon Lead)',
      notes:
        'Introductory consultation for daughter’s November wedding. Shared curated PDF lookbook for reception weaves.',
      status: 'COMPLETED',
    },
  ]);

  // Staff Internal Notes State
  const [staffNotes, setStaffNotes] = useState([
    {
      id: 'sn-1',
      time: '22 Aug 2026, 06:20 PM',
      author: 'Packaging Lead',
      note: 'Anniversary gift wrap box confirmed with cedar ball scenting.',
    },
    {
      id: 'sn-2',
      time: '18 Aug 2026, 06:10 PM',
      author: 'Meenakshi',
      note: 'Very discerning eye for 24K pure gold tested zari. Offer first look at upcoming Diwali loom harvest.',
    },
  ]);
  const [newStaffNote, setNewStaffNote] = useState('');

  const handleAddStaffNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffNote.trim()) return;

    setStaffNotes([
      {
        id: `sn-${Date.now()}`,
        time: 'Just now',
        author: 'Admin (Mysuru Salon)',
        note: newStaffNote.trim(),
      },
      ...staffNotes,
    ]);
    setNewStaffNote('');
    triggerToast('Private salon stylist note saved.');
  };

  const handleGenerateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `ROYAL-${customer.name.split(' ')[0].toUpperCase()}-${voucherAmount}`;
    setGeneratedVoucherCode(code);
    triggerToast(`Store credit voucher ${code} (₹${voucherAmount}) generated & assigned.`);
  };

  const handleScheduleVideoCall = (e: React.FormEvent) => {
    e.preventDefault();
    setVideoLogs([
      {
        id: `vlog-${Date.now()}`,
        date: videoSlot,
        duration: 'Scheduled (45 Mins)',
        stylist: videoStylist,
        notes: `Upcoming bridal showcase focused on: ${videoWeaves}`,
        status: 'UPCOMING',
      },
      ...videoLogs,
    ]);
    setIsVideoModalOpen(false);
    triggerToast(`Live Video Shopping session scheduled for ${videoSlot}.`);
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-sans animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. TOP STICKY BAR & QUICK ACTIONS                  */}
      {/* ================================================== */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 -mx-6 lg:-mx-8 -mt-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Customer Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
                {customer.name}
              </h1>
              {/* VIP / Bridal Segment Tag */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  customer.tier === 'ROYAL_HERITAGE_VIP'
                    ? 'bg-[#FAF3E4] text-[#7A1C30] border-[#C87F4A]/30'
                    : customer.tier === 'BRIDAL_TROUSSEAU'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : customer.tier === 'GOLD_PATRON'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <Crown className="w-3 h-3 text-[#C87F4A]" />
                <span>{customer.tier.replace(/_/g, ' ')}</span>
              </span>
            </div>
            <p className="text-[11px] font-mono text-stone-500 mt-0.5">
              Patron ID: {customer.id} • Active {customer.lastActive} • Silk Loyalty VIP Tier
            </p>
          </div>
        </div>

        {/* Quick Concierge Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Send VIP WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVideoModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-[#E8DCC9] bg-white hover:bg-[#FAF6F0] text-stone-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Video className="w-3.5 h-3.5 text-[#7A1C30]" />
            <span>Book Video Call</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVoucherModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5 text-amber-200" />
            <span>Issue Gift Voucher</span>
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. THREE-COLUMN / SPLIT WORKSTATION GRID           */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================== */}
        {/* LEFT COLUMN (28% - 3.5 Cols) - DOSSIER         */}
        {/* ============================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Dossier Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-4 text-xs font-sans">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${customer.avatarBg} text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0 relative`}
              >
                {customer.initials}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-stone-900 rounded-full flex items-center justify-center text-[10px] font-bold">
                  ★
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[#1F1B16] text-sm truncate">{customer.name}</h3>
                <div className="text-stone-500 font-mono text-[11px]">{customer.city}, {customer.state}</div>
                <div className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5">
                  Low RTO Risk (98% Delivery Rate)
                </div>
              </div>
            </div>

            {/* Financial Intelligence Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 font-mono">
              <div className="p-3 bg-[#FAF6F0] rounded-xl space-y-0.5 border border-[#E8DCC9]/60">
                <span className="text-[10px] uppercase text-stone-400 block">Total Spend</span>
                <span className="font-bold text-stone-900 text-sm">
                  ₹{customer.totalSpend.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-[#FAF6F0] rounded-xl space-y-0.5 border border-[#E8DCC9]/60">
                <span className="text-[10px] uppercase text-stone-400 block">Avg Order Value</span>
                <span className="font-bold text-emerald-700 text-sm">
                  ₹{Math.round(customer.totalSpend / customer.totalOrders).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            
            {/* Preferred Weaves & Colors */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Preferred Weave Traditions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {customer.preferredWeaves.map((w) => (
                  <span
                    key={w}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Bridal Milestone Tag */}
            {customer.bridalTag && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-amber-950">
                <div className="font-bold text-xs flex items-center gap-1.5 text-amber-800">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bridal Milestone Inscription</span>
                </div>
                <div className="font-semibold">{customer.bridalTag}</div>
                {customer.weddingDate && (
                  <div className="text-[11px] font-mono text-amber-700">
                    Target Event: {customer.weddingDate}
                  </div>
                )}
              </div>
            )}

            {/* Direct Contact Details */}
            <div className="space-y-2 pt-2 border-t border-slate-100 font-mono text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{customer.phone}</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyText(customer.phone, 'phone')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedField === 'phone' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyText(customer.email, 'email')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Staff Internal Notes Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center justify-between">
              <span>Stylist & Salon Notes</span>
              <span className="text-[10px] font-mono text-slate-400">{staffNotes.length} Notes</span>
            </h4>

            {/* Add Note Form */}
            <form onSubmit={handleAddStaffNote} className="space-y-2">
              <textarea
                rows={2}
                value={newStaffNote}
                onChange={(e) => setNewStaffNote(e.target.value)}
                placeholder="Log private notes from showroom visit or WhatsApp chat..."
                className="w-full p-2 border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Private Stylist Note</span>
              </button>
            </form>

            {/* List */}
            <div className="space-y-2.5 pt-2 max-h-56 overflow-y-auto">
              {staffNotes.map((sn) => (
                <div
                  key={sn.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans space-y-0.5"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold text-slate-800">{sn.author}</span>
                    <span className="text-slate-400">{sn.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{sn.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================== */}
        {/* CENTER TABBED PANEL (72% - 8 Cols)             */}
        {/* ============================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
            {[
              { key: 'ORDERS', label: 'Order History (4)', icon: ShoppingBag },
              { key: 'BAG_WISHLIST', label: 'Bag & Wishlist (3 Items)', icon: Heart },
              { key: 'VIDEO_CALLS', label: 'Salon Styling Logs (2)', icon: Sparkles },
              { key: 'ADDRESSES', label: 'Saved Addresses', icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ============================================ */}
          {/* TAB 1: ORDER HISTORY                         */}
          {/* ============================================ */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-3">
              {[
                {
                  id: 'NSH-2026-8941',
                  date: '22 Aug 2026',
                  title: 'Royal Wodeyar Crimson Crepe Silk',
                  weave: 'Mysore Silk',
                  sku: 'NSH-SKU-MYS-01',
                  price: 28500,
                  status: 'READY_TO_SHIP',
                  awb: 'BD-BLR-884920',
                  image:
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
                },
                {
                  id: 'NSH-2026-8102',
                  date: '14 Jun 2026',
                  title: 'Bridal Kanchipuram Korvai Gold Brocade',
                  weave: 'Kanchipuram',
                  sku: 'NSH-SKU-KAN-04',
                  price: 68000,
                  status: 'DELIVERED',
                  awb: 'BD-BLR-449120',
                  image:
                    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
                },
                {
                  id: 'NSH-2026-7781',
                  date: '02 Apr 2026',
                  title: 'Mysuru Sandalwood Crepe Gold Kasuti',
                  weave: 'Mysore Silk',
                  sku: 'NSH-SKU-MYS-07',
                  price: 32000,
                  status: 'DELIVERED',
                  awb: 'BD-BLR-221980',
                  image:
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
                },
                {
                  id: 'NSH-2025-5491',
                  date: '18 Nov 2025',
                  title: 'Royal Mysuru Vintage Twilight Silk',
                  weave: 'Mysore Silk',
                  sku: 'NSH-SKU-MYS-02',
                  price: 20000,
                  status: 'DELIVERED',
                  awb: 'BD-BLR-119280',
                  image:
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
                },
              ].map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={order.image}
                      alt={order.title}
                      className="w-14 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-slate-900 hover:text-blue-600"
                        >
                          #{order.id}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-400">• {order.date}</span>
                        {order.status === 'READY_TO_SHIP' ? (
                          <span className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded font-bold">
                            Ready to Ship
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded font-bold">
                            Delivered
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 text-xs mt-0.5">
                        {order.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {order.weave} • SKU: {order.sku} • AWB: {order.awb}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="font-bold text-slate-900 text-sm">
                      ₹{order.price.toLocaleString('en-IN')}
                    </div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-[11px] font-semibold flex items-center gap-0.5 mt-1"
                    >
                      <span>Inspect Order File</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============================================ */}
          {/* TAB 2: WISHLIST & CART BAG ITEMS             */}
          {/* ============================================ */}
          {activeTab === 'BAG_WISHLIST' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
                  Live Items Saved in Patron Bag & Wishlist
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Last updated 2 hours ago
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Yeola Paithani Royal Peacock Asawali',
                    weave: 'Paithani Pure Zari',
                    sku: 'NSH-SKU-PAI-02',
                    price: 46000,
                    location: 'Active in Shopping Bag (1 Unit)',
                    image:
                      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
                  },
                  {
                    title: 'Varanasi Kadwa Katan Meenakari Boota',
                    weave: 'Banarasi Kadwa',
                    sku: 'NSH-SKU-BAN-03',
                    price: 54000,
                    location: 'Saved in Wishlist',
                    image:
                      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
                  },
                  {
                    title: 'Champagne Tissue Georgette Floral Zari',
                    weave: 'Tissue Georgette',
                    sku: 'NSH-SKU-TIS-08',
                    price: 36000,
                    location: 'Saved in Wishlist',
                    image:
                      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-14 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {item.weave} • {item.sku}
                        </div>
                        <span className="inline-block mt-1 text-[9px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                          {item.location}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900 text-xs">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsWhatsAppModalOpen(true);
                        }}
                        className="mt-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Send Offer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB 3: SALON STYLING & CONSULTATION LOGS     */}
          {/* ============================================ */}
          {activeTab === 'VIDEO_CALLS' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
                    VIP Salon Consultation & Styling Logs
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500">
                    Boutique drape and styling sessions with Mysuru master drapers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Salon Consultation</span>
                </button>
              </div>

              <div className="space-y-3">
                {videoLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-sans"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900">{log.date}</span>
                        <span className="text-slate-400">({log.duration})</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          log.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Stylist: <strong className="text-slate-800">{log.stylist}</strong>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                      {log.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* TAB 4: SAVED ADDRESSES                       */}
          {/* ============================================ */}
          {activeTab === 'ADDRESSES' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-blue-600 shadow-2xs space-y-2 text-xs font-sans relative">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-blue-700 font-mono">
                    DEFAULT HOME ADDRESS
                  </span>
                  <span className="text-[9px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                    Primary
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">Dr. Ananya Rao</div>
                <div className="text-slate-700">#402, Heritage Palms, Lavelle Road</div>
                <div className="text-slate-700">Near UB City Mall, Shanthala Nagar</div>
                <div className="font-mono text-slate-900">
                  Bengaluru, Karnataka — <strong>560001</strong>
                </div>
                <div className="font-mono text-slate-500 pt-1">+91 98450 12345</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-700 font-mono">
                    WEDDING VENUE / TROUSSEAU DELIV
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">Dr. Ananya Rao (C/o Palace Grounds)</div>
                <div className="text-slate-700">Gayathri Vihar Gate #4, Bellary Road</div>
                <div className="font-mono text-slate-900">
                  Bengaluru, Karnataka — <strong>560080</strong>
                </div>
                <div className="font-mono text-slate-500 pt-1">+91 98450 12345</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. MODALS (VIDEO CALL, GIFT VOUCHER, WHATSAPP)     */}
      {/* ================================================== */}

      {/* Video Call Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Book 1-on-1 Live Video Drape Call
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleVideoCall} className="p-6 space-y-3.5 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Date & Time Slot (IST)
                </label>
                <input
                  type="text"
                  required
                  value={videoSlot}
                  onChange={(e) => setVideoSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Bridal Stylist
                </label>
                <select
                  value={videoStylist}
                  onChange={(e) => setVideoStylist(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-900"
                >
                  <option value="Meenakshi (Senior Bridal Draper)">Meenakshi (Senior Bridal Draper)</option>
                  <option value="Suresh (Sayyaji Rao Salon Lead)">Suresh (Sayyaji Rao Salon Lead)</option>
                  <option value="Radha (Heritage Silk Curator)">Radha (Heritage Silk Curator)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Focus Weaves to Pre-Arrange on Salon Mannequins
                </label>
                <input
                  type="text"
                  value={videoWeaves}
                  onChange={(e) => setVideoWeaves(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift Voucher Modal */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Issue VIP Store Credit Voucher
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVoucherModalOpen(false);
                  setGeneratedVoucherCode(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateVoucher} className="p-6 space-y-3.5 text-xs font-sans">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Voucher Credit Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={voucherAmount}
                  onChange={(e) => setVoucherAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Credit
                </label>
                <input
                  type="text"
                  required
                  value={voucherReason}
                  onChange={(e) => setVoucherReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              {generatedVoucherCode && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 font-mono">
                  <span className="text-[10px] text-amber-800 uppercase block font-bold">
                    Active Voucher Code:
                  </span>
                  <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>{generatedVoucherCode}</span>
                    <button
                      type="button"
                      onClick={() => copyText(generatedVoucherCode, 'voucher')}
                      className="text-amber-800 hover:text-amber-950"
                    >
                      {copiedField === 'voucher' ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Valid for 90 days on online storefront & Mysuru flagship salon.
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsVoucherModalOpen(false);
                    setGeneratedVoucherCode(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold"
                >
                  Generate & Send Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Send Direct VIP WhatsApp Concierge
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
                  <span>VIP Bridal Concierge Template</span>
                </div>
                <p className="leading-relaxed">
                  Namaste <strong>{customer.name}</strong>! We have curated 3 exclusive pure gold zari
                  masterpieces based on your preference for <strong>{customer.preferredWeaves.join(' & ')}</strong>.
                </p>
                <p className="font-mono text-[11px] text-emerald-800">
                  Curated Private Lookbook: https://neelsareehouse.com/bridal/curation/{customer.id}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWhatsAppModalOpen(false);
                  triggerToast(`WhatsApp message dispatched to ${customer.phone}.`);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
