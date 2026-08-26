'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Truck, ChevronRight, CheckCircle2, RotateCcw, Clock, ArrowRight } from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';
import { Product } from '@/lib/products';

interface OrderItem {
  product: Product;
  quantity: number;
  blouseOption?: string;
}

interface OrderRecord {
  order_number: string;
  date: string;
  status: string;
  status_type: 'delivered' | 'in_transit' | 'processing';
  delivered_date?: string;
  payment_method: string;
  totalINR: number;
  item_count: number;
  can_return?: boolean;
  items: OrderItem[];
}

export default function AccountOrdersPage() {
  const { currency } = useCart();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-1">
            Order Ledger
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
            Past Orders & Dispatches
          </h1>
          <span className="text-xs text-stone-500 font-sans block mt-1">
            Track live BlueDart courier telemetry or request returns within the 7-day window.
          </span>
        </div>

        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF3E4] hover:bg-[#C87F4A] hover:text-white text-[#1F1B16] border border-[#C87F4A]/30 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors"
        >
          <span>Explore Looms</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#C87F4A]/20">
          <div className="w-8 h-8 border-3 border-[#C87F4A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-stone-500">Retrieving past royal order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#C87F4A]/20 shadow-silk space-y-4">
          <Package className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="font-editorial text-xl font-bold text-[#1F1B16]">No Orders Placed Yet</h3>
          <p className="text-xs text-stone-500 font-sans max-w-sm mx-auto">
            Discover our Mysore, Kanchipuram, and Banarasi silk sarees to place your first heirloom order.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-[#C87F4A] text-white rounded-sm text-xs font-bold uppercase tracking-wider"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_number}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-[#C87F4A]/25 shadow-silk space-y-5"
            >
              {/* Top Row: Date, Order #, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-editorial text-lg font-bold text-[#1F1B16]">
                      Order #{order.order_number}
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
                  <span className="text-xs text-stone-500 font-sans block">
                    Placed on {order.date} • {order.payment_method}
                  </span>
                </div>

                <span className="font-editorial text-xl font-bold text-[#1F1B16]">
                  {formatPrice(order.totalINR)}
                </span>
              </div>

              {/* Thumbnails Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-md">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
                        alt={item.product?.title || 'Heirloom Silk Saree'}
                        className="w-14 h-16 rounded-xl object-cover border border-stone-200 bg-[#FAF3E4]"
                      />
                      <div className="max-w-[200px] truncate">
                        <span className="text-[10px] font-mono uppercase text-[#C87F4A] font-bold block">
                          {item.product?.weave || 'Mysore Silk'}
                        </span>
                        <span className="text-xs font-editorial font-bold text-[#1F1B16] block truncate">
                          {item.product?.title || 'Heirloom Silk Saree'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-sans block">
                          Qty: {item.quantity} • Pure Silk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <Link
                    href={`/orders/${order.order_number}/track`}
                    className="px-4 py-2 bg-[#FAF3E4] hover:bg-[#C87F4A] hover:text-white text-[#1F1B16] rounded-xl text-xs font-sans font-bold transition-colors"
                  >
                    Track Dispatch
                  </Link>

                  <Link
                    href={`/account/orders/${order.order_number}`}
                    className="px-4 py-2 bg-[#1F1B16] hover:bg-black text-white rounded-xl text-xs font-sans font-bold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
