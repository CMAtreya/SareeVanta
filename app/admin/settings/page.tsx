'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Receipt,
  Truck,
  CreditCard,
  ShieldCheck,
  Building2,
  Lock,
  Zap,
  ArrowRight,
  Sparkles,
  Settings,
  ChevronRight,
} from 'lucide-react';

export default function MasterSettingsHubPage() {
  const settingsSections = [
    {
      title: 'Staff & Role-Based Access (RBAC)',
      href: '/admin/settings/staff',
      icon: Users,
      badge: '5 Team Members',
      badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
      description:
        'Staff directory, active session monitoring, 2FA gate enforcement, and granular permission matrices for Super Admins, Catalog Managers, and Concierge reps.',
      highlights: ['Super Admin & Catalog Manager', 'Fulfillment & Dispatch Staff', 'Customer Care & Salon Concierge'],
    },
    {
      title: 'Tax, Legal & GST Configuration',
      href: '/admin/settings/taxes',
      icon: Receipt,
      badge: 'HSN 5007 • 5% GST',
      badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      description:
        'GSTIN registration, Mysore silk legal entity credentials, and automated State of Origin split engine (Intra-state CGST+SGST vs Inter-state IGST).',
      highlights: ['GSTIN: 29AAACN8912K1Z5', 'HSN 5007 Silk Council Rule', 'Automated PDF Tax Invoices'],
    },
    {
      title: 'Logistics & Warehouse Locations',
      href: '/admin/settings/shipping',
      icon: Truck,
      badge: 'Delhivery & BlueDart',
      badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
      description:
        'Primary dispatch origin address (Mysuru Pincode 570001), carrier production API tokens, free shipping threshold (₹10,000 MOV), and priority air fees.',
      highlights: ['Origin: Mysuru Central Vault', 'Carrier Production Tokens', 'Free Shipping & Surcharge Rules'],
    },
    {
      title: 'Payment Gateways & Webhook Health',
      href: '/admin/settings/payments',
      icon: CreditCard,
      badge: 'Razorpay • Webhook 200 OK',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
      description:
        'Razorpay & Cashfree API keys, instant webhook diagnostic ping tester (&lt;200ms latency), and Cash-on-Delivery (COD) fraud prevention caps.',
      highlights: ['Production Razorpay Key Secrets', 'Instant Webhook Ping Diagnostics', 'COD ₹50,000 Cap & OTP Verification'],
    },
  ];

  return (
    <div className="font-sans text-[#1F1B16] select-none pb-28 space-y-6 animate-fade-in">
      {/* ================================================== */}
      {/* 1. TOP HEADER                                      */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DCC9]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Master Configuration & Governance Center
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              Production Admin Hub
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Role-Based Access Control, GST Legal Entity, Carrier Logistics & Payment Gateway Webhooks
          </p>
        </div>
      </div>

      {/* ================================================== */}
      {/* 2. SUB-NAV TABS                                    */}
      {/* ================================================== */}
      <div className="flex items-center gap-2 border-b border-[#E8DCC9] pb-2 overflow-x-auto font-sans text-xs">
        <Link
          href="/admin/settings/staff"
          className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4] font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Users className="w-4 h-4 text-stone-400" />
          <span>Staff & RBAC Access</span>
        </Link>
        <Link
          href="/admin/settings/taxes"
          className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4] font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Receipt className="w-4 h-4 text-stone-400" />
          <span>Tax, Legal & GST</span>
        </Link>
        <Link
          href="/admin/settings/shipping"
          className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4] font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Truck className="w-4 h-4 text-stone-400" />
          <span>Logistics & Warehouses</span>
        </Link>
        <Link
          href="/admin/settings/payments"
          className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-[#FAF3E4] font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <CreditCard className="w-4 h-4 text-stone-400" />
          <span>Payment Gateways & Webhooks</span>
        </Link>
      </div>

      {/* ================================================== */}
      {/* 3. SETTINGS DIRECTORY MODULE CARDS                 */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((sec) => (
          <Link
            key={sec.title}
            href={sec.href}
            className="group bg-white p-6 rounded-3xl border border-[#E8DCC9] shadow-2xs hover:shadow-md hover:border-[#7A1C30]/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] border border-[#E8DCC9] flex items-center justify-center text-[#7A1C30] group-hover:bg-[#7A1C30] group-hover:text-white transition-colors">
                  <sec.icon className="w-5 h-5" />
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${sec.badgeColor}`}
                >
                  {sec.badge}
                </span>
              </div>

              <h3 className="font-bold text-base text-[#1F1B16] group-hover:text-[#7A1C30] transition-colors font-sans flex items-center justify-between">
                <span>{sec.title}</span>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform group-hover:text-[#7A1C30]" />
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                {sec.description}
              </p>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-stone-100">
              {sec.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
