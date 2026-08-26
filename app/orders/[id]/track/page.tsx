'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  Check,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Download,
  Copy,
  MapPin,
  Phone,
  ArrowLeft,
  Sparkles,
  Scissors,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Product, products } from '@/lib/products';
import { useCart } from '@/components/providers/CartContext';

interface TrackingStage {
  id: string;
  label: string;
  title: string;
  timestamp: string;
  location: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface OrderTrackingData {
  order_number: string;
  status: string;
  current_stage: string;
  current_stage_index: number;
  payment_method: string;
  payment_id: string;
  tracking_number: string;
  courier: string;
  estimated_delivery: string;
  shipping_address: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    product: Product;
    quantity: number;
    blouseOption?: string;
  }[];
  subtotalINR: number;
  discountINR: number;
  totalINR: number;
  placed_at: string;
  stages: TrackingStage[];
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || 'NSH-2026-8942';

  const { currency } = useCart();

  const [orderData, setOrderData] = useState<OrderTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          setOrderData(data);
        } else {
          setOrderData(null);
        }
      } catch (e) {
        console.error('Error fetching order tracking:', e);
        setOrderData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracking();
  }, [orderId]);

  const handleCopyAwb = () => {
    if (orderData?.tracking_number) {
      navigator.clipboard.writeText(orderData.tracking_number);
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2000);
    }
  };

  const handleDownloadInvoice = () => {
    setDownloadingInvoice(true);
    setTimeout(() => {
      setDownloadingInvoice(false);
      alert(`Invoice for Order #${orderId} generated and downloaded successfully.`);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-16 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#C87F4A] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-stone-500">
          Connecting to BlueDart live courier telemetry...
        </p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="bg-[#FAF3E4] min-h-screen py-16 px-4">
        <div className="bg-white rounded-3xl border border-[#E8DCC9] p-8 sm:p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FAF3E4] border border-[#C87F4A]/30 flex items-center justify-center mx-auto text-[#7A1C30]">
            <Package className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Tracking Record Not Found
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-md mx-auto">
            No live courier shipment tracking telemetry found for AWB or Order <span className="font-mono font-bold text-[#7A1C30] bg-[#FAF3E4] px-2 py-0.5 rounded">#{orderId}</span>.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Link
              href="/account/orders"
              className="px-6 py-2.5 rounded-full bg-[#7A1C30] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#5F1424] transition-all shadow-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5 Stages array
  const stages = orderData.stages || [];
  const currentIndex = orderData.current_stage_index ?? 3;

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 font-sans">
          <Link href="/" className="hover:text-[#C87F4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link href="/account" className="hover:text-[#C87F4A] transition-colors">
            My Account
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-[#1F1B16] font-semibold">Order Tracking</span>
        </nav>

        {/* ==================================================== */}
        {/* TOP SECTION: ORDER NUMBER & ITEM SUMMARY             */}
        {/* ==================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#C87F4A]/20 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Heirloom Dispatch Radar</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-4xl font-normal text-[#1F1B16]">
                Order <span className="text-[#C87F4A]">#{orderData.order_number}</span>
              </h1>
              <span className="text-xs text-stone-500 font-sans block mt-1">
                Placed on {orderData.placed_at} • {orderData.payment_method}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-900 border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Status: Out for Delivery</span>
              </span>
            </div>
          </div>

          {/* Ordered Items Row */}
          <div>
            <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-stone-500 block mb-3">
              Included Handlooms in Shipment ({orderData.items.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {orderData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF3E4]/60 border border-[#C87F4A]/20 flex items-center gap-3"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-14 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                  />
                  <div className="truncate flex-1">
                    <span className="text-[10px] font-mono uppercase text-[#C87F4A] font-bold block">
                      {item.product.weave}
                    </span>
                    <h4 className="font-editorial text-xs font-bold text-[#1F1B16] truncate">
                      {item.product.title}
                    </h4>
                    <span className="text-[10px] text-stone-500 font-sans block">
                      Qty: {item.quantity} • Pure Silk
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#1F1B16] flex-shrink-0">
                    {formatPrice(item.product.priceINR * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* HORIZONTAL TIMELINE: 5 STAGES                        */}
        {/* Placed -> Packed -> Shipped -> Out for Delivery -> Delivered */}
        {/* ==================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C87F4A]/25 shadow-silk space-y-8">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-1">
              5-Stage Handloom Journey
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#1F1B16]">
              Shipment Progress
            </h2>
          </div>

          {/* Desktop & Tablet Horizontal Timeline */}
          <div className="relative py-4">
            {/* Background connecting track */}
            <div className="absolute top-9 left-6 right-6 h-1 bg-stone-200 rounded-full z-0 hidden md:block" />

            {/* Completed active progress bar */}
            <div
              className="absolute top-9 left-6 h-1 bg-[#C87F4A] rounded-full z-0 transition-all duration-700 hidden md:block"
              style={{
                width: `${(currentIndex / (stages.length - 1)) * 90}%`,
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2 relative z-10">
              {stages.map((stage, idx) => {
                const isCompleted = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const isUpcoming = idx > currentIndex;

                return (
                  <div
                    key={stage.id}
                    className="flex md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-2 group"
                  >
                    {/* Stage Icon Node */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-700 text-white shadow-md'
                          : isCurrent
                          ? 'bg-[#C87F4A] text-white ring-4 ring-[#C87F4A]/30 scale-110 shadow-lg'
                          : 'bg-white border-2 border-stone-300 text-stone-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Truck className="w-5 h-5 animate-pulse" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    {/* Stage Label & Details */}
                    <div className="space-y-0.5">
                      <span
                        className={`text-xs font-mono font-bold block ${
                          isCurrent
                            ? 'text-[#C87F4A]'
                            : isCompleted
                            ? 'text-[#1F1B16]'
                            : 'text-stone-400'
                        }`}
                      >
                        {stage.label}
                      </span>
                      <span className="text-[10px] text-stone-500 font-sans block leading-tight">
                        {stage.timestamp}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono hidden md:block">
                        {stage.location}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Stage Highlight Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF3E4] border border-[#C87F4A]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C87F4A] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#773D21] font-bold block">
                  Current Milestone
                </span>
                <h4 className="font-editorial text-sm sm:text-base font-bold text-[#1F1B16]">
                  {stages[currentIndex]?.title || 'Out for Delivery to Your Doorstep'}
                </h4>
                <p className="text-xs text-stone-600 font-sans mt-0.5">
                  {stages[currentIndex]?.description}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-[#C87F4A] bg-white px-3 py-1.5 rounded-lg border border-[#C87F4A]/30 font-semibold flex-shrink-0 self-end sm:self-center">
              {stages[currentIndex]?.timestamp}
            </span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* BENEATH: COURIER DETAILS, AWB & DOWNLOAD INVOICE     */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Courier Card (Col 8) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#C87F4A]/25 shadow-silk space-y-4">
            <h3 className="font-editorial text-lg font-bold text-[#1F1B16] pb-3 border-b border-[#C87F4A]/20 flex items-center justify-between">
              <span>Courier & Transit Details</span>
              <ShieldCheck className="w-4 h-4 text-[#C87F4A]" />
            </h3>

            <div className="space-y-3 text-xs font-sans">
              <div className="flex items-start justify-between">
                <span className="text-stone-500">Logistics Partner:</span>
                <span className="font-bold text-[#1F1B16] text-right">
                  {orderData.courier}
                </span>
              </div>

              {/* AWB Tracking Number with Copy */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-500">AWB Tracking Number:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-[#1F1B16] bg-[#FAF3E4] px-2.5 py-1 rounded-md border border-[#C87F4A]/20">
                    {orderData.tracking_number}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAwb}
                    className="p-1 rounded text-stone-500 hover:text-[#C87F4A] hover:bg-stone-100 transition-colors"
                    aria-label="Copy AWB number"
                    title="Copy AWB Number"
                  >
                    {copiedAwb ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Estimated Delivery Date */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className="text-stone-500">Estimated Delivery Date:</span>
                <span className="font-bold text-sm text-[#C87F4A] font-editorial">
                  {orderData.estimated_delivery}
                </span>
              </div>

              {/* Delivery Address */}
              <div className="pt-3 border-t border-stone-100 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                  Delivery Destination
                </span>
                <p className="text-stone-700 font-sans leading-relaxed">
                  <strong>{orderData.shipping_address.name}</strong> ({orderData.shipping_address.phone})<br />
                  {orderData.shipping_address.addressLine1}, {orderData.shipping_address.city},{' '}
                  {orderData.shipping_address.state} — {orderData.shipping_address.pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Download Invoice & Actions Card (Col 4) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#C87F4A]/25 shadow-silk space-y-4">
            <h3 className="font-editorial text-lg font-bold text-[#1F1B16] pb-3 border-b border-[#C87F4A]/20">
              Documents & Receipts
            </h3>

            <p className="text-xs text-stone-500 font-sans leading-relaxed">
              Official GST Tax Invoice, Silk Mark India Authentication Certificate, and 24K Pure Zari Assay Guarantee.
            </p>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="w-full py-3.5 bg-[#1F1B16] hover:bg-black text-[#FAF3E4] rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {downloadingInvoice ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#FAF3E4] border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#C87F4A]" />
                  <span>Download Tax Invoice (PDF)</span>
                </>
              )}
            </button>

            <Link
              href="/products"
              className="w-full py-3 bg-[#FAF3E4] hover:bg-[#C87F4A] hover:text-white text-[#1F1B16] border border-[#C87F4A]/30 rounded-sm text-xs font-sans font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 block text-center"
            >
              <span>Explore More Creations</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
