'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  X,
  Check,
  CreditCard,
  Gift,
  Send,
  User,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  ChevronRight,
  Download,
  AlertCircle,
  ExternalLink,
  Package,
} from 'lucide-react';

export type ReturnStatus =
  | 'RETURN_REQUESTED'
  | 'PICKUP_SCHEDULED'
  | 'IN_TRANSIT'
  | 'QC_PENDING'
  | 'REFUND_PROCESSED'
  | 'REJECTED';

export interface ReturnRequestItem {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCity: string;
  requestDate: string;
  sareeTitle: string;
  sareeSku: string;
  sareeWeave: string;
  sareeImage: string;
  amountPaid: number;
  paymentGateway: 'Razorpay UPI' | 'Credit Card' | 'COD';
  returnReason: string;
  customerNotes: string;
  proofImages: string[];
  status: ReturnStatus;
  reverseAwb?: string;
  reverseCarrier?: string;
  qcChecklist?: {
    silkMarkIntact: boolean;
    unwornFoldIntact: boolean;
    defectVerified: boolean;
    inspectedBy?: string;
    inspectionNotes?: string;
  };
  resolution?: {
    type: 'REFUND_SOURCE' | 'STORE_CREDIT' | 'REJECTED';
    refundRef?: string;
    resolvedAt?: string;
    rejectionReason?: string;
  };
}

const INITIAL_RETURNS: ReturnRequestItem[] = [
  {
    id: 'RET-2026-0891',
    orderId: 'NSH-2026-8940',
    customerName: 'Smt. Radhika Reddy',
    customerPhone: '+91 99890 98765',
    customerEmail: 'radhika.reddy@gmail.com',
    customerCity: 'Hyderabad, Telangana',
    requestDate: '22 Aug 2026, 02:15 PM',
    sareeTitle: 'Bridal Kanchipuram Korvai Gold Brocade',
    sareeSku: 'NSH-SKU-KAN-04',
    sareeWeave: 'Kanchipuram Raw Silk',
    sareeImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
    amountPaid: 68000,
    paymentGateway: 'Razorpay UPI',
    returnReason: 'Color shade differs slightly under natural daylight vs indoor salon photos',
    customerNotes: 'Looking for a more vermilion crimson rather than deep maroon. Saree is completely unworn with tag intact.',
    proofImages: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    ],
    status: 'RETURN_REQUESTED',
  },
  {
    id: 'RET-2026-0889',
    orderId: 'NSH-2026-8720',
    customerName: 'Pooja Singhania',
    customerPhone: '+91 98110 33221',
    customerEmail: 'pooja.singhania@delhicorp.in',
    customerCity: 'New Delhi, Delhi',
    requestDate: '21 Aug 2026, 11:30 AM',
    sareeTitle: 'Varanasi Kadwa Katan Meenakari Boota',
    sareeSku: 'NSH-SKU-BAN-03',
    sareeWeave: 'Banarasi Pure Katan',
    sareeImage: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
    amountPaid: 54000,
    paymentGateway: 'Credit Card',
    returnReason: 'Zari thread snagging observed on lower border jaal',
    customerNotes: 'Received parcel yesterday. Discovered 2 loose warp zari threads upon unfolding the pleats.',
    proofImages: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
    ],
    status: 'PICKUP_SCHEDULED',
    reverseAwb: 'DEL-REV-9948201',
    reverseCarrier: 'Delhivery Reverse Logistics',
  },
  {
    id: 'RET-2026-0885',
    orderId: 'NSH-2026-8519',
    customerName: 'Meera Deshmukh',
    customerPhone: '+91 98200 44556',
    customerEmail: 'meera.deshmukh@outlook.com',
    customerCity: 'Mumbai, Maharashtra',
    requestDate: '19 Aug 2026, 04:45 PM',
    sareeTitle: 'Yeola Paithani Royal Peacock Asawali',
    sareeSku: 'NSH-SKU-PAI-02',
    sareeWeave: 'Paithani Pure Silk',
    sareeImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
    amountPaid: 46000,
    paymentGateway: 'Razorpay UPI',
    returnReason: 'Ordered alternative weave option for wedding reception',
    customerNotes: 'Family opted for Banarasi instead. Box unopened.',
    proofImages: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop',
    ],
    status: 'IN_TRANSIT',
    reverseAwb: 'SF-BOM-7782190',
    reverseCarrier: 'Shadowfax Reverse Express',
  },
  {
    id: 'RET-2026-0881',
    orderId: 'NSH-2026-8310',
    customerName: 'Kavitha Sundaram',
    customerPhone: '+91 94440 88990',
    customerEmail: 'kavitha.sundaram@gmail.com',
    customerCity: 'Chennai, Tamil Nadu',
    requestDate: '18 Aug 2026, 10:00 AM',
    sareeTitle: 'Mysuru Sandalwood Crepe Gold Kasuti',
    sareeSku: 'NSH-SKU-MYS-07',
    sareeWeave: 'Mysore Silk Crepe',
    sareeImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    amountPaid: 32000,
    paymentGateway: 'COD',
    returnReason: 'Saree drape length preference',
    customerNotes: 'Looking for 6.3m length with blouse piece.',
    proofImages: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
    ],
    status: 'QC_PENDING',
    reverseAwb: 'DEL-REV-6619022',
    reverseCarrier: 'Delhivery Reverse Logistics',
  },
  {
    id: 'RET-2026-0870',
    orderId: 'NSH-2026-8102',
    customerName: 'Deepak Varma',
    customerPhone: '+91 98300 77889',
    customerEmail: 'deepak.varma@tata.com',
    customerCity: 'Kolkata, West Bengal',
    requestDate: '14 Aug 2026, 03:00 PM',
    sareeTitle: 'Champagne Tissue Georgette Floral Zari',
    sareeSku: 'NSH-SKU-TIS-08',
    sareeWeave: 'Tissue Georgette',
    sareeImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    amountPaid: 36000,
    paymentGateway: 'Credit Card',
    returnReason: 'Event postponed',
    customerNotes: 'Family wedding postponed to late December.',
    proofImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
    ],
    status: 'REFUND_PROCESSED',
    reverseAwb: 'BD-REV-4482011',
    reverseCarrier: 'BlueDart Air Return',
    resolution: {
      type: 'REFUND_SOURCE',
      refundRef: 'rfnd_Rzp992810482',
      resolvedAt: '17 Aug 2026',
    },
  },
];

export default function ReverseLogisticsPage() {
  const [returns, setReturns] = useState<ReturnRequestItem[]>(INITIAL_RETURNS);
  const [activeQueueTab, setActiveQueueTab] = useState<ReturnStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingReturn, setInspectingReturn] = useState<ReturnRequestItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inspection Form State
  const [qcSilkMark, setQcSilkMark] = useState(true);
  const [qcUnworn, setQcUnworn] = useState(true);
  const [qcDefectVerified, setQcDefectVerified] = useState(true);
  const [qcInspector, setQcInspector] = useState('Suresh (QC Specialist)');
  const [qcNotes, setQcNotes] = useState('');
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [isRejectingState, setIsRejectingState] = useState(false);

  // Reverse Carrier Generator State
  const [selectedCarrier, setSelectedCarrier] = useState('Delhivery Reverse Logistics');

  // Queue Counts
  const counts = useMemo(() => {
    return {
      ALL: returns.length,
      RETURN_REQUESTED: returns.filter((r) => r.status === 'RETURN_REQUESTED').length,
      PICKUP_SCHEDULED: returns.filter((r) => r.status === 'PICKUP_SCHEDULED').length,
      IN_TRANSIT: returns.filter((r) => r.status === 'IN_TRANSIT').length,
      QC_PENDING: returns.filter((r) => r.status === 'QC_PENDING').length,
      REFUND_PROCESSED: returns.filter((r) => r.status === 'REFUND_PROCESSED').length,
      REJECTED: returns.filter((r) => r.status === 'REJECTED').length,
    };
  }, [returns]);

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (activeQueueTab !== 'ALL' && r.status !== activeQueueTab) return false;

      if (searchQuery.trim()) {
        const cleanQ = searchQuery.toLowerCase().trim();
        const matches =
          r.id.toLowerCase().includes(cleanQ) ||
          r.orderId.toLowerCase().includes(cleanQ) ||
          r.customerName.toLowerCase().includes(cleanQ) ||
          r.customerPhone.includes(cleanQ) ||
          r.sareeTitle.toLowerCase().includes(cleanQ) ||
          r.sareeSku.toLowerCase().includes(cleanQ);

        if (!matches) return false;
      }

      return true;
    });
  }, [returns, activeQueueTab, searchQuery]);

  // Action: Generate Reverse AWB
  const handleGenerateReverseAwb = (returnId: string) => {
    const randomAwb = `DEL-REV-${Math.floor(1000000 + Math.random() * 9000000)}`;
    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? {
              ...r,
              status: 'PICKUP_SCHEDULED',
              reverseAwb: randomAwb,
              reverseCarrier: selectedCarrier,
            }
          : r
      )
    );
    if (inspectingReturn && inspectingReturn.id === returnId) {
      setInspectingReturn({
        ...inspectingReturn,
        status: 'PICKUP_SCHEDULED',
        reverseAwb: randomAwb,
        reverseCarrier: selectedCarrier,
      });
    }
    triggerToast(`Reverse AWB ${randomAwb} generated via ${selectedCarrier}. Pickup scheduled.`);
  };

  // Action: Approve & Refund to Source
  const handleApproveSourceRefund = (returnId: string) => {
    const ref = `rfnd_Rzp${Date.now().toString().slice(-8)}`;
    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? {
              ...r,
              status: 'REFUND_PROCESSED',
              resolution: {
                type: 'REFUND_SOURCE',
                refundRef: ref,
                resolvedAt: 'Just now',
              },
            }
          : r
      )
    );
    triggerToast(`Refund of ₹${inspectingReturn?.amountPaid.toLocaleString('en-IN')} initiated (Ref: ${ref}).`);
    setInspectingReturn(null);
  };

  // Action: Issue Store Credit Voucher
  const handleIssueStoreCredit = (returnId: string) => {
    const code = `CREDIT-${inspectingReturn?.customerName.split(' ')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setReturns((prev) =>
      prev.map((r) =>
        r.id === returnId
          ? {
              ...r,
              status: 'REFUND_PROCESSED',
              resolution: {
                type: 'STORE_CREDIT',
                refundRef: code,
                resolvedAt: 'Just now',
              },
            }
          : r
      )
    );
    triggerToast(`Store Credit Voucher ${code} generated and dispatched to ${inspectingReturn?.customerPhone}.`);
    setInspectingReturn(null);
  };

  // Action: Reject Return
  const handleRejectReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingReturn || !rejectionReasonText.trim()) return;

    setReturns((prev) =>
      prev.map((r) =>
        r.id === inspectingReturn.id
          ? {
              ...r,
              status: 'REJECTED',
              resolution: {
                type: 'REJECTED',
                rejectionReason: rejectionReasonText.trim(),
                resolvedAt: 'Just now',
              },
            }
          : r
      )
    );
    triggerToast(`Return request ${inspectingReturn.id} rejected. Formal audit email dispatched.`);
    setInspectingReturn(null);
    setIsRejectingState(false);
    setRejectionReasonText('');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
      {/* 1. TOP HEADER & BREADCRUMBS                        */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Reverse Logistics & Returns Hub
            </h1>
            {counts.RETURN_REQUESTED > 0 && (
              <span className="bg-rose-50 text-rose-900 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>{counts.RETURN_REQUESTED} Awaiting Triage (P0)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Reverse Pickup Courier AWBs, Central Hub Silk Mark QC Inspection & Instant Refunds
          </p>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. SEARCH & QUEUE SEGMENT TABS                     */}
      {/* ================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Return ID, Order #, Customer Name, Phone, or Saree Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs text-slate-900 focus:outline-none"
            />
          </div>

          <div className="text-xs font-mono text-slate-500">
            Showing <strong className="text-slate-900">{filteredReturns.length}</strong> of{' '}
            {returns.length} Return Files
          </div>
        </div>

        {/* Queue Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {[
            { key: 'ALL', label: 'All Returns', count: counts.ALL },
            {
              key: 'RETURN_REQUESTED',
              label: 'Return Requested',
              count: counts.RETURN_REQUESTED,
              urgent: counts.RETURN_REQUESTED > 0,
            },
            { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', count: counts.PICKUP_SCHEDULED },
            { key: 'IN_TRANSIT', label: 'In-Transit to Hub', count: counts.IN_TRANSIT },
            { key: 'QC_PENDING', label: 'QC Inspection Pending', count: counts.QC_PENDING },
            { key: 'REFUND_PROCESSED', label: 'Refund Processed', count: counts.REFUND_PROCESSED },
            { key: 'REJECTED', label: 'Rejected', count: counts.REJECTED },
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
                    ? 'bg-rose-100 text-rose-800'
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
      {/* 3. RETURNS WORKSTATION DATA TABLE                  */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-3.5">Return & Order File</th>
                <th className="p-3.5">Customer & City</th>
                <th className="p-3.5">Saree & Value</th>
                <th className="p-3.5">Customer Claimed Reason</th>
                <th className="p-3.5 text-center">Fulfillment Stage</th>
                <th className="p-3.5">Reverse Courier AWB</th>
                <th className="p-3.5 text-right">Inspect File</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-mono text-xs">
                    No return records in this queue.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Return & Order File */}
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-blue-700 text-xs">{item.id}</div>
                      <div className="text-[10px] text-slate-500">Order: #{item.orderId}</div>
                      <div className="text-[10px] text-slate-400">{item.requestDate}</div>
                    </td>

                    {/* Customer & City */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs">{item.customerName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{item.customerPhone}</div>
                      <div className="text-[10px] text-slate-400">{item.customerCity}</div>
                    </td>

                    {/* Saree & Value */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.sareeImage}
                          alt={item.sareeTitle}
                          className="w-10 h-12 rounded-lg object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 text-xs line-clamp-1">
                            {item.sareeTitle}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 font-bold">
                            ₹{item.amountPaid.toLocaleString('en-IN')} • {item.paymentGateway}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="p-3.5 max-w-[220px]">
                      <div className="text-slate-800 font-medium text-xs line-clamp-2">
                        "{item.returnReason}"
                      </div>
                    </td>

                    {/* Fulfillment Stage Pill */}
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          item.status === 'RETURN_REQUESTED'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : item.status === 'PICKUP_SCHEDULED'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : item.status === 'IN_TRANSIT'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : item.status === 'QC_PENDING'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : item.status === 'REFUND_PROCESSED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.status === 'RETURN_REQUESTED' && 'Return Requested'}
                        {item.status === 'PICKUP_SCHEDULED' && 'Pickup Scheduled'}
                        {item.status === 'IN_TRANSIT' && 'In-Transit to Hub'}
                        {item.status === 'QC_PENDING' && 'QC Pending'}
                        {item.status === 'REFUND_PROCESSED' && 'Refund Processed'}
                        {item.status === 'REJECTED' && 'Rejected'}
                      </span>
                    </td>

                    {/* Reverse AWB */}
                    <td className="p-3.5 font-mono text-[11px]">
                      {item.reverseAwb ? (
                        <div>
                          <div className="font-bold text-slate-900">{item.reverseAwb}</div>
                          <div className="text-[10px] text-slate-400">{item.reverseCarrier}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Inspect Button */}
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setInspectingReturn(item);
                          setIsRejectingState(false);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 ml-auto"
                      >
                        <span>QC & Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. RETURN INSPECTION & RESOLUTION WORKFLOW MODAL   */}
      {/* ================================================== */}
      {inspectingReturn && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-sans">
                    Return Inspection & QC Dossier: {inspectingReturn.id}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500">
                    Order Ref: #{inspectingReturn.orderId} • Customer: {inspectingReturn.customerName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingReturn(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Inspection Content */}
            <div className="p-6 space-y-6 overflow-y-auto text-xs font-sans">
              {/* Product & Claim Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={inspectingReturn.sareeImage}
                    alt={inspectingReturn.sareeTitle}
                    className="w-14 h-16 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {inspectingReturn.sareeTitle}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {inspectingReturn.sareeWeave} • SKU: {inspectingReturn.sareeSku}
                    </div>
                    <div className="text-xs font-mono text-emerald-800 font-bold mt-1">
                      Paid Amount: ₹{inspectingReturn.amountPaid.toLocaleString('en-IN')} (
                      {inspectingReturn.paymentGateway})
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono sm:border-l border-slate-200 sm:pl-4">
                  <span className="text-[10px] text-slate-400 block uppercase">Current Stage</span>
                  <span className="font-bold text-slate-900">{inspectingReturn.status}</span>
                </div>
              </div>

              {/* Customer Reason & Attached Proof Photos */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
                  1. Customer Reason & Proof Evidence
                </h4>
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                  <div className="font-bold text-amber-900">"{inspectingReturn.returnReason}"</div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {inspectingReturn.customerNotes}
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5 font-bold">
                      Attached Proof Photos (Click to Zoom):
                    </span>
                    <div className="flex gap-2">
                      {inspectingReturn.proofImages.map((imgUrl, i) => (
                        <a
                          key={i}
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="relative group rounded-lg overflow-hidden border border-slate-300"
                        >
                          <img
                            src={imgUrl}
                            alt="Proof"
                            className="w-16 h-16 object-cover group-hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reverse Logistics AWB Dispatch Card */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider">
                  2. Reverse Pickup Courier Dispatch
                </h4>
                {inspectingReturn.reverseAwb ? (
                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between font-mono">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        Reverse AWB: {inspectingReturn.reverseAwb}
                      </div>
                      <div className="text-[11px] text-blue-800">
                        Carrier: {inspectingReturn.reverseCarrier}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold">
                      Manifest Synced
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Select Reverse Logistics Partner
                      </label>
                      <select
                        value={selectedCarrier}
                        onChange={(e) => setSelectedCarrier(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 font-medium"
                      >
                        <option value="Delhivery Reverse Logistics">
                          Delhivery Reverse Logistics (Surface Express)
                        </option>
                        <option value="Shadowfax Reverse Express">
                          Shadowfax Reverse Express (Hyperlocal Return)
                        </option>
                        <option value="BlueDart Air Return">
                          BlueDart Air Return (High-Value Luxury Fragile)
                        </option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateReverseAwb(inspectingReturn.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs self-end sm:self-auto"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Generate Reverse AWB</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Warehouse QC Inspection Checklist Form */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Warehouse Central Hub QC Inspection Checklist</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setQcSilkMark(!qcSilkMark)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      qcSilkMark
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950'
                        : 'border-rose-300 bg-rose-50/40 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Silk Mark Tag</span>
                      <span className="font-mono font-bold text-xs">
                        {qcSilkMark ? '✓ INTACT' : '✗ MISSING'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Physical metallic QR tag verified on pallu
                    </p>
                  </div>

                  <div
                    onClick={() => setQcUnworn(!qcUnworn)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      qcUnworn
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950'
                        : 'border-rose-300 bg-rose-50/40 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Fold & Odor Free</span>
                      <span className="font-mono font-bold text-xs">
                        {qcUnworn ? '✓ UNWORN' : '✗ USED/WORN'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Factory warp folds and cedar scent intact
                    </p>
                  </div>

                  <div
                    onClick={() => setQcDefectVerified(!qcDefectVerified)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      qcDefectVerified
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950'
                        : 'border-amber-300 bg-amber-50/40 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">Zari / Weave QC</span>
                      <span className="font-mono font-bold text-xs">
                        {qcDefectVerified ? '✓ VERIFIED' : '✗ DISPUTED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Condition matched to claim notes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      QC Inspector Name
                    </label>
                    <input
                      type="text"
                      value={qcInspector}
                      onChange={(e) => setQcInspector(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Inspection Audit Remarks
                    </label>
                    <input
                      type="text"
                      value={qcNotes}
                      onChange={(e) => setQcNotes(e.target.value)}
                      placeholder="e.g. Saree re-folded and sealed in muslin bag."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Rejection Form Box if active */}
              {isRejectingState && (
                <form onSubmit={handleRejectReturn} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                  <div className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Mandatory Customer Rejection Explanation</span>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={rejectionReasonText}
                    onChange={(e) => setRejectionReasonText(e.target.value)}
                    placeholder="State reason: e.g. Silk Mark tag was physically detached / Saree exhibits perfume fragrance..."
                    className="w-full p-2.5 border border-rose-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejectingState(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      Confirm Rejection & Return to Client
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setInspectingReturn(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-100"
              >
                Close Dossier
              </button>

              {/* Resolution Action Trigger Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsRejectingState(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Reject Return
                </button>

                <button
                  type="button"
                  onClick={() => handleIssueStoreCredit(inspectingReturn.id)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>Issue Store Credit Voucher</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApproveSourceRefund(inspectingReturn.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & 100% Refund to Source</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
