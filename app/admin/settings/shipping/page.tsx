'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Users,
  Receipt,
  CreditCard,
  Building2,
  MapPin,
  Key,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Package,
  Layers,
} from 'lucide-react';

export default function ShippingSettingsPage() {
  // Warehouse Origin Form
  const [warehouseName, setWarehouseName] = useState('Mysuru Central Silk Vault & Hub');
  const [warehouseAddress, setWarehouseAddress] = useState('No. 42, Devaraja Market Silk Corridor, Sayyaji Rao Road');
  const [warehouseCity, setWarehouseCity] = useState('Mysuru');
  const [warehouseState, setWarehouseState] = useState('Karnataka');
  const [warehousePincode, setWarehousePincode] = useState('570001');
  const [pickupContactPhone, setPickupContactPhone] = useState('+91 98801 12345');

  // Carrier API Keys
  const [delhiveryApiKey, setDelhiveryApiKey] = useState('live_del_99841209381029');
  const [delhiveryClientId, setDelhiveryClientId] = useState('NEELSAREE_MYS_01');
  const [bluedartCustomerCode, setBluedartCustomerCode] = useState('BLR_NSH_8820');
  const [bluedartLicenseKey, setBluedartLicenseKey] = useState('key_bd_live_44921098');
  const [shiprocketToken, setShiprocketToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

  // Shipping Rules
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('10000');
  const [standardShippingFee, setStandardShippingFee] = useState('250');
  const [expressAirFee, setExpressAirFee] = useState('450');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveShippingConfig = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Warehouse origin address & carrier API integrations updated.');
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1B16] font-sans">
              Logistics & Warehouse Locations
            </h1>
            <span className="bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              Delhivery & BlueDart Integrated
            </span>
          </div>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Primary Dispatch Origin Pincode, Carrier Production Credentials & Shipping Fee Tiers
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveShippingConfig}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-amber-200" />
          <span>Save Logistics Config</span>
        </button>
      </div>

      {/* ================================================== */}
      {/* SUB-NAV TABS                                       */}
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
          className="px-3.5 py-2 rounded-xl bg-[#7A1C30] text-white font-bold flex items-center gap-2 shadow-2xs whitespace-nowrap cursor-pointer"
        >
          <Truck className="w-4 h-4 text-amber-200" />
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

      <form onSubmit={handleSaveShippingConfig} className="space-y-6">
        {/* ================================================== */}
        {/* 1. PRIMARY DISPATCH WAREHOUSE ORIGIN               */}
        {/* ================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCC9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-bold text-sm text-[#1F1B16] font-sans flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7A1C30]" />
                <span>Primary Dispatch Vault & Pickup Origin</span>
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Used by courier pickup vehicles (BlueDart/Delhivery) for daily afternoon manifest collections
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              ✓ Pincode 570001 Serviceable
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Warehouse / Vault Name *</label>
              <input
                type="text"
                required
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pickup Floor Supervisor Phone *
              </label>
              <input
                type="text"
                required
                value={pickupContactPhone}
                onChange={(e) => setPickupContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Physical Street Address *</label>
              <input
                type="text"
                required
                value={warehouseAddress}
                onChange={(e) => setWarehouseAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City & State *</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={warehouseCity}
                  onChange={(e) => setWarehouseCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
                <input
                  type="text"
                  required
                  value={warehouseState}
                  onChange={(e) => setWarehouseState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin Pickup Pincode *</label>
              <input
                type="text"
                required
                value={warehousePincode}
                onChange={(e) => setWarehousePincode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-700"
              />
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. CARRIER API INTEGRATION CREDENTIALS             */}
        {/* ================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-600" />
                <span>Carrier Production API Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Automates real-time AWB generation, thermal label PDFs, and courier tracking webhooks
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            {/* Delhivery API */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">Delhivery Surface & Reverse API</span>
                <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Connected
                </span>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">API Token Key</label>
                <input
                  type="password"
                  value={delhiveryApiKey}
                  onChange={(e) => setDelhiveryApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Client ID / Account Code</label>
                <input
                  type="text"
                  value={delhiveryClientId}
                  onChange={(e) => setDelhiveryClientId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-900 font-bold"
                />
              </div>
            </div>

            {/* BlueDart API */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">BlueDart Air Apex (Fragile Silk)</span>
                <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Connected
                </span>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Customer / Merchant Code</label>
                <input
                  type="text"
                  value={bluedartCustomerCode}
                  onChange={(e) => setBluedartCustomerCode(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">License Key Secret</label>
                <input
                  type="password"
                  value={bluedartLicenseKey}
                  onChange={(e) => setBluedartLicenseKey(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-mono bg-white text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. SHIPPING RULE TIERS & CHARGES                   */}
        {/* ================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Storefront Shipping Fee & Free Delivery Thresholds</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Applied automatically on the storefront customer bag & checkout pages
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Free Express Shipping Threshold (MOV) *
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Orders &gt; ₹{parseInt(freeShippingThreshold || '0').toLocaleString('en-IN')} receive 100% Free Insured BlueDart Air
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Flat Standard Shipping Fee (Orders below threshold) *
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={standardShippingFee}
                  onChange={(e) => setStandardShippingFee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Express Priority 24-Hour Air Surcharge *
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  required
                  value={expressAirFee}
                  onChange={(e) => setExpressAirFee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Shipping & Warehouse Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
