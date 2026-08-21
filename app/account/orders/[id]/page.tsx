'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Truck,
  RotateCcw,
  Download,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  MapPin,
  CreditCard,
  Scissors,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';
import { products, Product } from '@/lib/products';

export default function AccountOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.id as string) || 'NSH-2026-8942';

  const { currency, addToCart } = useCart();
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [reordered, setReordered] = useState(false);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  // Mock order details
  const isDelivered = orderId === 'NSH-2026-7419' || orderId === 'NSH-2026-6102';
  const isEligibleForReturn = orderId === 'NSH-2026-7419'; // Delivered within 7 days

  const order = {
    order_number: orderId,
    date: '20 Aug 2026',
    status: isDelivered ? 'Delivered' : 'Out for Delivery',
    status_type: isDelivered ? 'delivered' : 'in_transit',
    delivered_date: isDelivered ? '15 Aug 2026' : undefined,
    payment_method: 'UPI Instant Verified (GPay)',
    transaction_id: 'pay_nsh_982147192',
    tracking_number: `BD-AIR-78294-${orderId.slice(-4) || '8942'}`,
    courier: 'BlueDart Air Express (Insured Security Transit)',
    shipping_address: {
      name: 'Ananya S. Rao',
      phone: '+91 98860 12345',
      addressLine1: '42, Royal Palms Residency, Sayyaji Rao Road',
      addressLine2: 'Near Mysore Palace North Gate',
      city: 'Mysuru',
      state: 'Karnataka',
      pincode: '570001',
    },
    items: [
      {
        product: products[0],
        quantity: 1,
        blouseOption: 'Unstitched Standard (Free)',
      },
      {
        product: products[1],
        quantity: 1,
        blouseOption: 'Custom Tailored Bespoke (+₹1,800)',
      },
    ],
    subtotalINR: 94300,
    discountINR: 9430,
    shippingINR: 0,
    totalINR: 84870,
  };

  const handleDownloadInvoice = () => {
    setDownloadingInvoice(true);
    setTimeout(() => {
      setDownloadingInvoice(false);
      alert(`Tax Invoice PDF for Order #${orderId} generated.`);
    }, 700);
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      addToCart(item.product, item.quantity, item.blouseOption);
    });
    setReordered(true);
    setTimeout(() => {
      router.push('/cart');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Back to Orders */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#773D21] hover:text-[#C87F4A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Orders</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#C87F4A]/20 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold">
                Order Details
              </span>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-3 py-0.5 rounded-full border ${
                  order.status_type === 'delivered'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-900 border-amber-300'
                }`}
              >
                {order.status}
              </span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-normal text-[#1F1B16]">
              Order <span className="text-[#C87F4A]">#{order.order_number}</span>
            </h1>
            <span className="text-xs text-stone-500 font-sans block mt-1">
              Placed on {order.date} • Paid via {order.payment_method}
            </span>
          </div>

          {/* Conditional Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/orders/${encodeURIComponent(order.order_number)}/track`}
              className="px-4 py-2.5 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Dispatch</span>
            </Link>

            {/* Return/Exchange: Only shown if status is Delivered and within return window */}
            {isEligibleForReturn && (
              <Link
                href={`/returns/new?order=${encodeURIComponent(order.order_number)}`}
                className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return / Exchange</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="px-4 py-2.5 bg-[#FAF3E4] hover:bg-[#1F1B16] hover:text-white text-[#1F1B16] border border-[#C87F4A]/30 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingInvoice ? 'Downloading...' : 'Invoice'}</span>
            </button>

            <button
              type="button"
              onClick={handleReorder}
              className="px-4 py-2.5 bg-[#1F1B16] hover:bg-black text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{reordered ? 'Added to Bag!' : 'Reorder'}</span>
            </button>
          </div>
        </div>

        {/* Ordered Handlooms List */}
        <div className="space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 block">
            Shipment Items ({order.items.length})
          </span>

          <div className="divide-y divide-stone-100 space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="w-18 h-22 rounded-2xl overflow-hidden bg-[#FAF3E4] border border-[#C87F4A]/20 flex-shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-semibold block">
                      {item.product.weave} • {item.product.fabric}
                    </span>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-editorial text-base font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors block"
                    >
                      {item.product.title}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 font-sans">
                      <Scissors className="w-3 h-3 text-[#C87F4A]" />
                      <span>{item.blouseOption || 'Unstitched Standard (Free)'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 block">
                      Govt. Silk Mark Certified • 24K Tested Zari
                    </span>
                  </div>
                </div>

                <div className="text-right self-end sm:self-center">
                  <span className="font-editorial text-lg font-bold text-[#1F1B16] block">
                    {formatPrice(item.product.priceINR * item.quantity)}
                  </span>
                  <span className="text-[11px] font-mono text-stone-400">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address & Payment Metadata 2-Column */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-stone-100 text-xs font-sans">
          {/* Shipping Address */}
          <div className="p-4 rounded-2xl bg-[#FAF3E4]/70 border border-[#C87F4A]/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#C87F4A] font-mono font-bold text-[10px] uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Delivery Address</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              <strong>{order.shipping_address.name}</strong> ({order.shipping_address.phone})<br />
              {order.shipping_address.addressLine1}, {order.shipping_address.addressLine2}<br />
              {order.shipping_address.city}, {order.shipping_address.state} — <strong>{order.shipping_address.pincode}</strong>
            </p>
          </div>

          {/* Payment & Breakdown */}
          <div className="p-4 rounded-2xl bg-[#FAF3E4]/70 border border-[#C87F4A]/20 space-y-2">
            <div className="flex items-center gap-1.5 text-[#C87F4A] font-mono font-bold text-[10px] uppercase">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Summary</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatPrice(order.subtotalINR)}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Privilege Discount:</span>
                <span className="font-mono">-{formatPrice(order.discountINR)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Insured Express Shipping:</span>
                <span className="font-mono text-emerald-800 font-bold uppercase text-[10px]">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-[#1F1B16] pt-1.5 border-t border-[#C87F4A]/20 text-sm">
                <span>Total Paid:</span>
                <span className="font-editorial text-base text-[#C87F4A]">
                  {formatPrice(order.totalINR)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
