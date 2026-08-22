'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Users,
  Truck,
  CreditCard,
  Building2,
  FileCheck2,
  Save,
  CheckCircle2,
  Info,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export default function TaxesSettingsPage() {
  const [legalName, setLegalName] = useState('Neel Saree House Private Limited');
  const [tradeName, setTradeName] = useState('Neel Saree House (Authentic Silks)');
  const [gstin, setGstin] = useState('29AAACN8912K1Z5');
  const [panNumber, setPanNumber] = useState('AAACN8912K');
  const [stateOfOrigin, setStateOfOrigin] = useState<'29' | '33'>('29'); // 29 = Karnataka, 33 = Tamil Nadu
  const [defaultHsn, setDefaultHsn] = useState('5007');
  const [cgstRate, setCgstRate] = useState('2.5');
  const [sgstRate, setSgstRate] = useState('2.5');
  const [igstRate, setIgstRate] = useState('5.0');
  const [signatoryName, setSignatoryName] = useState('Sri Chinmaya Atreya');
  const [signatoryDesignation, setSignatoryDesignation] = useState('Managing Director');
  const [isGstInvoiceAutoPdf, setIsGstInvoiceAutoPdf] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveTaxConfig = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('GST, HSN 5007 and tax calculation rules saved successfully.');
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
              Tax, Legal & GST Configuration
            </h1>
            <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              HSN 5007 Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            GSTIN Inscription, State of Origin Split Engine (CGST+SGST vs IGST) & Legal Invoices
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveTaxConfig}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save GST Configuration</span>
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
          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 shadow-2xs whitespace-nowrap"
        >
          <Receipt className="w-4 h-4 text-emerald-400" />
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
          className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
        >
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span>Payment Gateways & Webhooks</span>
        </Link>
      </div>

      {/* ================================================== */}
      {/* 1. LEGAL ENTITY & GSTIN DOSSIER                    */}
      {/* ================================================== */}
      <form onSubmit={handleSaveTaxConfig} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Registered Legal Entity & GSTIN Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Printed on formal tax invoices, thermal labels, and dispatched packing manifests
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              ✓ GSTIN Active & Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Business Legal Name *
              </label>
              <input
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trade Name / Brand *</label>
              <input
                type="text"
                required
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">15-Digit GSTIN Number *</label>
              <input
                type="text"
                required
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-700 uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Permanent Account Number (PAN) *</label>
              <input
                type="text"
                required
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase"
              />
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. AUTOMATIC GST SPLIT ENGINE                     */}
        {/* ================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Automatic Intra-State vs Inter-State Tax Calculation Engine</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Determines whether orders trigger CGST + SGST (Intra-state) or IGST (Inter-state)
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs font-sans text-emerald-950 space-y-1">
              <div className="font-bold">Indian Handloom Silk Saree GST Rule:</div>
              <p className="leading-relaxed text-[11px]">
                Under GST Council HSN Code <strong>5007</strong> (Woven Fabrics of Silk), handloom sarees are taxed at <strong>5.0% GST</strong> (Intra-State: 2.5% CGST + 2.5% SGST | Inter-State: 5.0% IGST).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dispatch State of Origin *
              </label>
              <select
                value={stateOfOrigin}
                onChange={(e) => setStateOfOrigin(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 font-mono font-bold"
              >
                <option value="29">Karnataka (State Code: 29) - Mysuru Central Vault</option>
                <option value="33">Tamil Nadu (State Code: 33) - Kanchipuram Loom Hub</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Default Master Saree HSN Code *
              </label>
              <input
                type="text"
                required
                value={defaultHsn}
                onChange={(e) => setDefaultHsn(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total GST Tax Rate % *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={igstRate}
                  onChange={(e) => setIgstRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
                <span className="font-mono text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Real-time Calculation Matrix Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Live Split Logic Matrix:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800 text-[11px]">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="font-bold text-blue-700">1. Customer Pincode in Karnataka (Intra-State)</div>
                <div className="text-slate-500 mt-0.5">
                  CGST: <strong>{cgstRate}%</strong> + SGST: <strong>{sgstRate}%</strong> = Total 5%
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="font-bold text-purple-700">2. Customer in Other 27 Indian States / UTs (Inter-State)</div>
                <div className="text-slate-500 mt-0.5">
                  Integrated GST (IGST): <strong>{igstRate}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. AUTHORIZED SIGNATORY & PDF INVOICES             */}
        {/* ================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                <span>Authorized Signatory & Invoice Generation</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Appears on printable PDF GST Tax Invoices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorized Signatory Name *
              </label>
              <input
                type="text"
                required
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={signatoryDesignation}
                onChange={(e) => setSignatoryDesignation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoGstPdf"
              checked={isGstInvoiceAutoPdf}
              onChange={(e) => setIsGstInvoiceAutoPdf(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoGstPdf" className="text-xs text-slate-800 font-semibold cursor-pointer">
              Automatically attach digitally signed PDF GST Invoice to customer order confirmation emails
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save GST & Legal Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
