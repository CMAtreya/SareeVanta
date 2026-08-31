'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { numberToWordsINR } from '@/lib/numberToWords';

export interface InvoiceItem {
  title: string;
  sku?: string;
  hsn?: string;
  quantity: number;
  price: number; // Unit price including or excluding tax
}

export interface InvoiceData {
  orderId: string;
  orderDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  customerName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  items: InvoiceItem[];
  subtotalAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  totalAmount: number;
  paymentGateway?: string;
  paymentStatus?: string;
}

export default function TaxInvoiceModal({
  invoice,
  onClose,
}: {
  invoice: InvoiceData | null;
  onClose: () => void;
}) {
  if (!invoice) return null;

  const invoiceNumber =
    invoice.invoiceNumber ||
    `NSH-INV-2026-${invoice.orderId.replace(/[^0-9]/g, '').slice(-5) || '8942'}`;
  const invoiceDate = invoice.invoiceDate || invoice.orderDate || new Date().toLocaleDateString('en-IN');
  const orderDate = invoice.orderDate || invoiceDate;
  const isInterstate =
    invoice.state && !invoice.state.toLowerCase().includes('karnataka');

  // Compute GST Taxable Base and Tax Values (Assuming 18% GST or 5% pure handloom silk GST)
  // For luxury handloom pure silk sarees, standard GST is 5% or 18% with zari/tailoring.
  // Standard breakdown calculation:
  const grandTotal = invoice.totalAmount || 0;
  const taxableValue = Math.round((grandTotal / 1.18) * 100) / 100;
  const totalTax = Math.round((grandTotal - taxableValue) * 100) / 100;
  const cgst = isInterstate ? 0 : Math.round((totalTax / 2) * 100) / 100;
  const sgst = isInterstate ? 0 : Math.round((totalTax / 2) * 100) / 100;
  const igst = isInterstate ? totalTax : 0;

  const fullAddress = [
    invoice.address,
    invoice.city,
    invoice.state,
    invoice.pincode ? `- ${invoice.pincode}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/75 backdrop-blur-xs flex justify-center items-start sm:items-center p-2 sm:p-6 print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:border-0 print:shadow-none print:max-w-none print:w-full print:rounded-none my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white print:hidden flex-shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              GST Tax Invoice Portal
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">• {invoice.orderId}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-[#C87F4A] hover:bg-[#B36737] text-white text-xs font-mono font-bold rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Sheet */}
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-10 text-slate-800 font-sans text-xs sm:text-sm bg-white space-y-6 print:p-6 print:space-y-4 print:text-xs print:overflow-visible"
        >
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-300">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-wider text-slate-900 uppercase">
              TAX INVOICE
            </h1>
            <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Neel Saree House / SareeVanta E-Commerce Marketplace
            </p>
          </div>

          {/* Seller Details */}
          <div className="space-y-1 pb-3 border-b border-slate-300 text-xs leading-relaxed">
            <h2 className="font-mono font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1">
              Seller Details
            </h2>
            <div className="font-bold text-slate-900">Neel Saree House Private Limited</div>
            <div className="text-slate-600">
              #42, Devaraja Urs Road, Heritage Quarter, Mysuru, Karnataka - 570001, India
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
              <div><strong className="text-slate-900">GSTIN:</strong> 29AAACN8810K1Z9</div>
              <div><strong className="text-slate-900">PAN:</strong> AAACN8810K</div>
              <div><strong className="text-slate-900">State / Code:</strong> Karnataka (29)</div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-1 pb-3 border-b border-slate-300 text-xs font-mono">
            <h2 className="font-mono font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1 font-sans">
              Invoice Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6 text-[12px]">
              <div><strong className="text-slate-900">Invoice Number:</strong> {invoiceNumber}</div>
              <div><strong className="text-slate-900">Invoice Date:</strong> {invoiceDate}</div>
              <div><strong className="text-slate-900">Order ID:</strong> {invoice.orderId}</div>
              <div><strong className="text-slate-900">Order Date:</strong> {orderDate}</div>
            </div>
          </div>

          {/* Bill To & Ship To Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-slate-300 text-xs leading-relaxed">
            {/* Bill To */}
            <div className="space-y-1">
              <h3 className="font-mono font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Bill To
              </h3>
              <div className="font-bold text-slate-900">{invoice.customerName}</div>
              <div className="text-slate-600">{fullAddress || 'Customer Address on Record'}</div>
              <div className="font-mono text-[11px] text-slate-500">
                State / State Code: {invoice.state || 'Karnataka'} (
                {isInterstate ? 'Inter-State' : '29'})
              </div>
              {invoice.phone && (
                <div className="font-mono text-[11px] text-slate-500">
                  Phone: {invoice.phone}
                </div>
              )}
            </div>

            {/* Ship To */}
            <div className="space-y-1">
              <h3 className="font-mono font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Ship To
              </h3>
              <div className="font-bold text-slate-900">{invoice.customerName}</div>
              <div className="text-slate-600">{fullAddress || 'Delivery Address on Record'}</div>
              <div className="font-mono text-[11px] text-slate-500">
                State / State Code: {invoice.state || 'Karnataka'} (
                {isInterstate ? 'Inter-State' : '29'})
              </div>
              {invoice.phone && (
                <div className="font-mono text-[11px] text-slate-500">
                  Phone: {invoice.phone}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 pb-4 border-b border-slate-300">
            <h3 className="font-mono font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-y border-slate-300 bg-slate-50 font-mono text-[11px] text-slate-700">
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-center">HSN/SAC</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Price (₹)</th>
                    <th className="py-2 px-3 text-right">Tax (₹)</th>
                    <th className="py-2 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoice.items.map((item, idx) => {
                    const itemTotal = item.price * item.quantity;
                    const itemTaxable = Math.round((itemTotal / 1.18) * 100) / 100;
                    const itemTax = Math.round((itemTotal - itemTaxable) * 100) / 100;

                    return (
                      <tr key={idx} className="text-slate-800">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          {item.sku && (
                            <div className="text-[10px] font-mono text-slate-500">
                              SKU: {item.sku}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {item.hsn || '5007'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          ₹{itemTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          ₹{itemTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax Details & Summary Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pb-4 border-b border-slate-300 text-xs">
            {/* Amount in Words */}
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Amount in Words
              </h3>
              <p className="font-serif italic text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs leading-relaxed">
                {numberToWordsINR(grandTotal)}
              </p>
              <div className="pt-2 text-[11px] text-slate-500 font-mono">
                Payment Mode: {invoice.paymentGateway || 'Prepaid (Razorpay / UPI)'} • Status: {invoice.paymentStatus || 'PAID'}
              </div>
            </div>

            {/* Tax Details Table */}
            <div className="space-y-1.5 font-mono text-xs">
              <h3 className="font-mono font-bold text-slate-900 uppercase text-[11px] tracking-wider font-sans mb-1">
                Tax Details
              </h3>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Taxable Value:</span>
                <span>₹{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>CGST (9%):</span>
                <span>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>SGST (9%):</span>
                <span>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>IGST (18%):</span>
                <span>₹{igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-800 font-bold text-sm text-slate-900">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="flex flex-col sm:flex-row items-end justify-between pt-4 text-xs">
            <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
              <div>This is a computer-generated tax invoice and requires no physical signature.</div>
              <div>Certified Handloom Silk Mark CSB/IA/2026/0091. Tested 24K Real Zari.</div>
            </div>

            <div className="text-center mt-6 sm:mt-0">
              <div className="w-48 border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-700">
                Neel Saree House Atelier
              </div>
              <div className="font-mono text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                Seller's Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
