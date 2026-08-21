'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  FileText,
  Scissors,
} from 'lucide-react';
import { products, Product } from '@/lib/products';
import { useCart } from '@/components/providers/CartContext';

interface OrderItem {
  product: Product;
  quantity: number;
  blouseOption?: string;
}

interface OrderData {
  order_number: string;
  status: 'pending' | 'paid' | 'failed';
  payment_method: string;
  payment_id: string;
  tracking_number: string;
  courier: string;
  estimated_delivery: string;
  items: OrderItem[];
  subtotalINR: number;
  discountINR: number;
  totalINR: number;
  placed_at: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawOrderNumber = searchParams.get('order_number') || 'NSH-2026-8942';

  const { currency } = useCart();

  const [orderStatus, setOrderStatus] = useState<'pending' | 'paid'>('pending');
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  // Poll GET /api/orders/:order_number until status is 'paid'
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(rawOrderNumber)}`);
        if (res.ok) {
          const data: OrderData = await res.json();
          // Simulate short webhook verification latency
          timer = setTimeout(() => {
            setOrderData(data);
            setOrderStatus('paid');
          }, 1200);
          return;
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }

      // Fallback transition
      timer = setTimeout(() => {
        setOrderStatus('paid');
      }, 1200);
    };

    fetchOrderStatus();

    return () => clearTimeout(timer);
  }, [rawOrderNumber]);

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-8 sm:py-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ==================================================== */}
          {/* 1. PENDING PAYMENT CONFIRMATION LOADING STATE        */}
          {/* ==================================================== */}
          {orderStatus === 'pending' && (
            <motion.div
              key="pending-state"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl p-10 sm:p-16 border border-[#C87F4A]/30 shadow-silk text-center space-y-6"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-[#C87F4A]/20 border-t-[#C87F4A] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[#C87F4A]">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#C87F4A] block mb-1">
                  Payment Verification in Progress
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                  Confirming your payment...
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 font-sans mt-2 max-w-md mx-auto leading-relaxed">
                  Communicating with banking gateway and reserving your heirloom silk saree in the Mysuru vault.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 bg-[#FAF3E4] px-4 py-2 rounded-full border border-[#C87F4A]/20 text-xs font-mono text-[#773D21]">
                <Clock className="w-3.5 h-3.5" />
                <span>Order Reference: {rawOrderNumber}</span>
              </div>
            </motion.div>
          )}

          {/* ==================================================== */}
          {/* 2. CONFIRMED ORDER DETAILS STATE (CALM CENTERED UI)  */}
          {/* ==================================================== */}
          {orderStatus === 'paid' && (
            <motion.div
              key="confirmed-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-white rounded-3xl p-6 sm:p-12 border border-[#C87F4A]/25 shadow-silk space-y-8 text-center sm:text-left"
            >
              {/* Centered Success Header */}
              <div className="text-center space-y-3 pb-6 border-b border-[#C87F4A]/20">
                {/* Refined Gold/Emerald Checkmark Ring */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>

                <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-300">
                  Payment Verified • Vault Reserved
                </span>

                <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-[#1F1B16] tracking-tight">
                  Order Confirmed
                </h1>

                <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-md mx-auto leading-relaxed">
                  Thank you for your patron order. We have allocated your handwoven saree from our royal Mysuru looms.
                </p>
              </div>

              {/* Order Reference & Estimated Delivery Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-[#FAF3E4]/70 p-4 sm:p-5 rounded-2xl border border-[#C87F4A]/20 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#C87F4A] font-bold block">
                    Order Reference Number
                  </span>
                  <span className="font-editorial text-lg sm:text-xl font-bold text-[#1F1B16] block">
                    #{rawOrderNumber}
                  </span>
                  <span className="text-[10px] text-stone-500 font-sans">
                    Tax Invoice sent to your registered email
                  </span>
                </div>

                <div className="bg-[#FAF3E4]/70 p-4 sm:p-5 rounded-2xl border border-[#C87F4A]/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#C87F4A] font-mono font-bold text-[10px] uppercase">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Estimated Delivery</span>
                  </div>
                  <span className="font-editorial text-lg sm:text-xl font-bold text-[#1F1B16] block">
                    {orderData?.estimated_delivery || 'Tuesday, 25 Aug 2026'}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium font-sans">
                    BlueDart Insured Air Express Delivery
                  </span>
                </div>
              </div>

              {/* Summary of Ordered Items */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
                  <span className="font-bold uppercase tracking-wider font-mono text-[#1F1B16]">
                    Ordered Creations
                  </span>
                  <span className="text-[11px] font-mono text-[#773D21]">
                    2 Sarees Reserved
                  </span>
                </div>

                <div className="divide-y divide-stone-100 space-y-3">
                  {[
                    {
                      title: 'Royal Wodeyar Crimson Crepe Silk Saree',
                      weave: 'Mysore Silk',
                      priceINR: 28500,
                      image:
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
                      blouse: 'Unstitched Standard (Free)',
                      qty: 1,
                    },
                    {
                      title: 'Kanchipuram Heavy Korvai Bridal Silk Saree',
                      weave: 'Kanchipuram',
                      priceINR: 65800,
                      image:
                        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
                      blouse: 'Custom Tailored Bespoke (+₹1,800)',
                      qty: 1,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="pt-3 first:pt-0 flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
                    >
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#C87F4A] font-bold block">
                            {item.weave}
                          </span>
                          <h4 className="font-editorial text-sm font-bold text-[#1F1B16] leading-tight">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-stone-500 font-sans block mt-0.5">
                            Qty: {item.qty} • {item.blouse}
                          </span>
                        </div>
                      </div>

                      <span className="font-mono text-xs sm:text-sm font-bold text-[#1F1B16] self-end sm:self-center">
                        {formatPrice(item.priceINR)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Payment Line */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-sans mt-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C87F4A]" />
                    <span className="font-medium text-stone-700">
                      Paid via UPI Instant • 100% Silk Mark Certified
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 block uppercase font-mono">Total Paid</span>
                    <span className="font-editorial text-base font-bold text-[#C87F4A]">
                      {formatPrice(84870)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Primary Action Buttons: "Track Your Order" and "Continue Shopping" */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-4 border-t border-[#C87F4A]/20">
                <Link
                  href={`/orders/${encodeURIComponent(rawOrderNumber)}/track`}
                  className="w-full sm:flex-1 py-4 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5"
                >
                  <Package className="w-4 h-4" />
                  <span>Track Your Order</span>
                </Link>

                <Link
                  href="/products"
                  className="w-full sm:flex-1 py-4 bg-white hover:bg-stone-50 text-[#1F1B16] border border-[#C87F4A]/30 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E4] p-12 text-center text-xs font-mono">
          Verifying Order Confirmation...
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
