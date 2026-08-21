'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, ShieldCheck, TrendingUp, Users, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { products } from '@/lib/products';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="pb-6 border-b border-[#C87F4A]/20 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-[#C87F4A] font-bold">
              Neelsareehouse Flagship Administration
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#1F1B16]">
              Salon & Inventory Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-mono font-bold">
              ● Mysore Live Server Active
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="p-6 rounded-2xl bg-white border border-[#C87F4A]/20 shadow-sm">
            <TrendingUp className="w-6 h-6 text-[#C87F4A] mb-2" />
            <span className="text-[10px] uppercase font-mono text-stone-500 block">Today's Revenue</span>
            <span className="font-editorial text-2xl font-bold text-[#1F1B16]">₹3,42,500</span>
            <span className="text-[10px] text-emerald-700 font-mono font-semibold">+18.4% vs last week</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#C87F4A]/20 shadow-sm">
            <Package className="w-6 h-6 text-[#C87F4A] mb-2" />
            <span className="text-[10px] uppercase font-mono text-stone-500 block">Orders in Queue</span>
            <span className="font-editorial text-2xl font-bold text-[#1F1B16]">14 Parcels</span>
            <span className="text-[10px] text-amber-700 font-mono font-semibold">6 Ready for BlueDart</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#C87F4A]/20 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#C87F4A] mb-2" />
            <span className="text-[10px] uppercase font-mono text-stone-500 block">Silk Mark Stock</span>
            <span className="font-editorial text-2xl font-bold text-[#1F1B16]">642 Sarees</span>
            <span className="text-[10px] text-emerald-700 font-mono font-semibold">100% Authenticated</span>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#C87F4A]/20 shadow-sm">
            <Users className="w-6 h-6 text-[#C87F4A] mb-2" />
            <span className="text-[10px] uppercase font-mono text-stone-500 block">VIP Consultations</span>
            <span className="font-editorial text-2xl font-bold text-[#1F1B16]">5 Bookings</span>
            <span className="text-[10px] text-[#773D21] font-mono font-semibold">Next call at 11:00 AM</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 mb-6 border-b border-stone-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'orders' ? 'bg-[#C87F4A] text-white' : 'text-stone-600 hover:text-black'
            }`}
          >
            Live Order Pipeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'inventory' ? 'bg-[#C87F4A] text-white' : 'text-stone-600 hover:text-black'
            }`}
          >
            Loom Inventory Catalog
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' ? (
          <div className="bg-white rounded-3xl border border-[#C87F4A]/25 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F3E8D6] text-[#773D21] font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Patron & Destination</th>
                  <th className="p-4">Saree Weave</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[
                  { id: 'NSH-2026-8942', patron: 'Dr. Ananya Rao (Bengaluru)', saree: 'Royal Wodeyar Crimson Crepe', amount: '₹28,500', status: 'Out for Delivery' },
                  { id: 'NSH-2026-8943', patron: 'Meenakshi S. (San Jose, USA)', saree: 'Kanchipuram Heavy Korvai Bridal', amount: '₹64,000', status: 'Stitching Fall & Pico' },
                  { id: 'NSH-2026-8944', patron: 'Pooja Hegde (Mysuru)', saree: 'Banarasi Pure Katan Silk', amount: '₹46,000', status: 'Order Confirmed' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF3E4]/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#1F1B16]">#{row.id}</td>
                    <td className="p-4 font-medium">{row.patron}</td>
                    <td className="p-4 font-editorial font-bold text-stone-800">{row.saree}</td>
                    <td className="p-4 font-mono font-bold text-[#773D21]">{row.amount}</td>
                    <td className="p-4 font-semibold text-emerald-800">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-2xl border border-[#C87F4A]/20 shadow-sm space-y-3">
                <img src={p.images[0]} alt={p.title} className="w-full aspect-[3/4] object-cover rounded-xl bg-[#FAF3E4]" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#773D21]">{p.weave}</span>
                  <h4 className="font-editorial text-sm font-bold text-[#1F1B16] line-clamp-1">{p.title}</h4>
                  <span className="text-xs font-mono font-bold text-[#1F1B16]">₹{p.priceINR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-emerald-800 pt-2 border-t border-stone-100 font-semibold">
                  <span>Stock: 8 Pieces in Salon</span>
                  <span>Silk Mark: Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
