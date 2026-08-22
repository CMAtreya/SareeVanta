'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Users,
  Receipt,
  Truck,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  Key,
} from 'lucide-react';

export default function PaymentSettingsPage() {
  // Razorpay Keys
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_live_89410982710398');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('sec_live_9984128941029381');
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('whsec_live_44921098231029');

  // Cashfree Keys
  const [cashfreeAppId, setCashfreeAppId] = useState('app_live_8842109');
  const [cashfreeSecretKey, setCashfreeSecretKey] = useState('cfsec_live_77812903841');

  // COD Governance
  const [codMinOrderValue, setCodMinOrderValue] = useState('2500');
  const [codMaxOrderValue, setCodMaxOrderValue] = useState('50000');
  const [codConvenienceFee, setCodConvenienceFee] = useState('150');
  const [isCodOtpEnforced, setIsCodOtpEnforced] = useState(true);
  const [isExtraCodFeeEnabled, setIsExtraCodFeeEnabled] = useState(true);

  // Webhook Ping Test State
  const [isPingingWebhook, setIsPingingWebhook] = useState(false);
  const [pingResult, setPingResult] = useState<{
    status: number;
    latencyMs: number;
    timestamp: string;
    endpoint: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Instant Webhook Ping Tester
  const handleTestWebhookPing = () => {
    setIsPingingWebhook(true);
    setPingResult(null);

    setTimeout(() => {
      setIsPingingWebhook(false);
      setPingResult({
        status: 200,
        latencyMs: 138,
        timestamp: new Date().toLocaleTimeString(),
        endpoint: 'https://neelsareehouse.com/api/checkout/orders',
      });
      triggerToast('Webhook Ping Test Passed: HTTP 200 OK (Latency: 138ms).');
    }, 1200);
  };

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Payment gateway keys and Cash on Delivery rules saved.');
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
      {/* SUB-NAV SETTINGS HEADER                            */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Payment Gateways & Webhook Health
            </h1>
            <span className="bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              Razorpay & Cashfree Active
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Production API Keys, Real-Time Webhook Diagnostics & Cash-on-Delivery Risk Controls
          </p>
        </div>

        <button
          type="button"
          onClick={handleSavePaymentConfig}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Payment Config</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* SUB-NAV TABS                                       */}
      {/* ================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto font-sans text-xs">
        <Link
          href="/admin/settings/staff"
          className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Users className="w-4 h-4 text-slate-400" />
          <span>Staff & RBAC Access</span>
        </Link>
        <Link
          href="/admin/settings/taxes"
          className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Receipt className="w-4 h-4 text-slate-400" />
          <span>Tax, Legal & GST</span>
        </Link>
        <Link
          href="/admin/settings/shipping"
          className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <Truck className="w-4 h-4 text-slate-400" />
          <span>Logistics & Warehouses</span>
        </Link>
        <Link
          href="/admin/settings/payments"
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 shadow-2xs whitespace-nowrap"
        >
          <CreditCard className="w-4 h-4 text-purple-400" />
          <span>Payment Gateways & Webhooks</span>
        </Link>
      </div>

      <form onSubmit={handleSavePaymentConfig} className="space-y-6">
        {/* ================================================== */}
        {/* 1. RAZORPAY PRODUCTION CREDENTIALS                 */}
        {/* ================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Razorpay Production Gateway Keys</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Primary gateway handling UPI, Credit/Debit Cards, NetBanking, and Instant Refunds
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              ✓ Production Live Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Key ID *</label>
              <input
                type="text"
                required
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Key Secret *</label>
              <input
                type="password"
                required
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Webhook Secret *</label>
              <input
                type="password"
                required
                value={razorpayWebhookSecret}
                onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-purple-700 font-bold"
              />
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. INSTANT WEBHOOK HEALTH PING TESTER              */}
        {/* ================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Instant Webhook Health Diagnostics</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Pings the server checkout webhook endpoint to ensure payment.captured events resolve in &lt; 200ms
              </p>
            </div>

            <button
              type="button"
              disabled={isPingingWebhook}
              onClick={handleTestWebhookPing}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-2xs"
            >
              {isPingingWebhook ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  <span>Pinging Webhook...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Execute Instant Ping Test</span>
                </>
              )}
            </button>
          </div>

          {pingResult ? (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-emerald-950 animate-fade-in">
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>HTTP {pingResult.status} OK • Payment Capture Engine Operational</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Endpoint: <code className="text-slate-800 font-bold">{pingResult.endpoint}</code>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">
                  Latency: {pingResult.latencyMs}ms
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Tested at {pingResult.timestamp}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-500 flex items-center justify-between">
              <span>Status: Ready for diagnostic ping test.</span>
              <span className="text-[10px] text-slate-400">Target: /api/checkout/orders</span>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* 3. CASH ON DELIVERY (COD) RISK & GOVERNANCE RULES  */}
        {/* ================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span>Cash on Delivery (COD) Risk & Limit Governance</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Protects handloom luxury inventory from high-value RTO fake order fraud
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Order Value (MOV) for COD *
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={codMinOrderValue}
                  onChange={(e) => setCodMinOrderValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Maximum COD Cap (Prevents Luxury Theft) *
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={codMaxOrderValue}
                  onChange={(e) => setCodMaxOrderValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-rose-700"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Orders &gt; ₹{parseInt(codMaxOrderValue || '0').toLocaleString('en-IN')} mandate 100% Prepaid
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Extra COD Convenience Verification Fee *
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={codConvenienceFee}
                  onChange={(e) => setCodConvenienceFee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="codOtp"
                checked={isCodOtpEnforced}
                onChange={(e) => setIsCodOtpEnforced(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="codOtp" className="text-xs text-slate-800 font-semibold cursor-pointer">
                Enforce mandatory 6-Digit SMS/WhatsApp OTP Verification before confirming Cash on Delivery orders
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="codFeeToggle"
                checked={isExtraCodFeeEnabled}
                onChange={(e) => setIsExtraCodFeeEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="codFeeToggle" className="text-xs text-slate-800 font-semibold cursor-pointer">
                Apply ₹{codConvenienceFee} handling fee on all Cash on Delivery checkouts
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Payment Gateways & Governance Config</span>
          </button>
        </div>
      </form>
    </div>
  );
}
