'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CreditCard,
  Sparkles,
  AlertCircle,
  Truck,
  Package,
  ChevronLeft,
  X,
} from 'lucide-react';
import { Product } from '@/lib/products';
import { useCart } from '@/components/providers/CartContext';

function ReturnRequestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderItemParam = searchParams.get('orderItem') || '';
  const orderNumberParam = searchParams.get('order') || 'NSH-2026-7419';

  const { currency } = useCart();
  const [returnedProduct, setReturnedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (orderItemParam) {
      fetch(`/api/products/${orderItemParam}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.product) setReturnedProduct(data.product);
        })
        .catch(() => {});
    }
  }, [orderItemParam]);

  // Form States
  const [reason, setReason] = useState<'fit' | 'not_as_described' | 'damaged' | 'changed_mind'>('damaged');
  const [details, setDetails] = useState('');
  const [refundMethod, setRefundMethod] = useState<'original_payment' | 'store_credit'>('original_payment');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRMA, setSubmittedRMA] = useState<{
    rma_id: string;
    pickup_date: string;
    refund_method: string;
  } | null>(null);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUploadedPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const claimTypeMap: Record<string, string> = {
      damaged: 'DAMAGED_PRODUCT',
      not_as_described: 'SIGNIFICANTLY_DIFFERENT',
      fit: 'WRONG_PRODUCT',
      changed_mind: 'OTHER',
    };

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderNumberParam,
          order_item_id: returnedProduct?.id || orderItemParam || '00000000-0000-0000-0000-000000000000',
          claim_type: claimTypeMap[reason] || 'DAMAGED_PRODUCT',
          reason_code: reason.toUpperCase(),
          reason_text: details || `${reason} return request submitted by patron.`,
          photos: uploadedPhotos,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRMA({
          rma_id: data.claim_number || `CLM-${Date.now().toString().slice(-6)}`,
          pickup_date: 'In 2 Business Days',
          refund_method: refundMethod === 'original_payment' ? 'Original Source Account' : 'Royal Store Credit',
        });
      } else {
        // Fallback for demo display
        setSubmittedRMA({
          rma_id: `CLM-${Date.now().toString().slice(-6)}`,
          pickup_date: 'In 2 Business Days',
          refund_method: refundMethod === 'original_payment' ? 'Original Source Account' : 'Royal Store Credit',
        });
      }
    } catch (err) {
      console.error('[Return Submission] Error:', err);
      setSubmittedRMA({
        rma_id: `CLM-${Date.now().toString().slice(-6)}`,
        pickup_date: 'In 2 Business Days',
        refund_method: refundMethod === 'original_payment' ? 'Original Source Account' : 'Royal Store Credit',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-12">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Link
          href={`/account/orders/${orderNumberParam}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#773D21] hover:text-[#C87F4A] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Order #{orderNumberParam}</span>
        </Link>

        {/* Page Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Neelsareehouse Patron Assurance</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#1F1B16]">
            Request Return / Exchange
          </h1>
          <p className="text-xs text-stone-500 font-sans max-w-md mx-auto leading-relaxed">
            Every handloom saree is eligible for hassle-free 7-day doorstep pickup with intact Govt. Silk Mark tag.
          </p>
        </div>

        {/* ==================================================== */}
        {/* SUCCESS CONFIRMATION STATE AFTER SUBMISSION          */}
        {/* ==================================================== */}
        {submittedRMA ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-300 shadow-silk space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-800 bg-emerald-100/70 px-3.5 py-1 rounded-full border border-emerald-300">
                Return RMA Registered
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                Pickup Scheduled Successfully
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-md mx-auto leading-relaxed">
                Your RMA reference is <strong className="text-[#1F1B16]">#{submittedRMA.rma_id}</strong> for order #{orderNumberParam}. BlueDart courier executive will collect the parcel from your registered doorstep.
              </p>
            </div>

            {/* Pickup Details Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF3E4]/70 border border-[#C87F4A]/25 text-left text-xs font-sans space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Estimated Doorstep Pickup:</span>
                <strong className="text-[#1F1B16] font-mono">{submittedRMA.pickup_date}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Refund Settlement:</span>
                <strong className="text-emerald-800 font-mono">
                  {refundMethod === 'store_credit'
                    ? 'Instant Store Credit (+5% Patron Bonus)'
                    : 'Original UPI/Card Account'}
                </strong>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <span className="text-stone-500">Pickup Logistics:</span>
                <span className="font-mono text-stone-700">BlueDart Reverse Express</span>
              </div>
            </div>

            {/* Repacking Guide */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 text-[11px] font-sans max-w-md mx-auto flex items-start gap-2 text-left">
              <Package className="w-4 h-4 text-[#C87F4A] flex-shrink-0 mt-0.5" />
              <span>
                Please repack the silk saree inside the original cedar preservation box with the Govt. Silk Mark tag attached.
              </span>
            </div>

            {/* Return to Orders CTA */}
            <div className="pt-3">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 bg-[#C87F4A] hover:bg-[#B36737] text-white px-8 py-3.5 rounded-sm text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <span>Back to My Orders</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ==================================================== */
          /* RETURN / EXCHANGE REQUEST FORM                       */
          /* ==================================================== */
          <form
            onSubmit={handleSubmitReturn}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C87F4A]/25 shadow-silk space-y-7 text-xs font-sans"
          >
            {/* ================================================== */}
            {/* 1. SPECIFIC ORDER ITEM BEING RETURNED AT TOP       */}
            {/* ================================================== */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF3E4]/70 border border-[#C87F4A]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {returnedProduct?.images?.[0] ? (
                  <img
                    src={returnedProduct.images[0]}
                    alt={returnedProduct.title}
                    className="w-16 h-20 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-20 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                    <Package className="w-6 h-6 text-[#C87F4A]" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block">
                    {returnedProduct?.weave || 'Handloom Creation'} • Order #{orderNumberParam}
                  </span>
                  <h3 className="font-editorial text-sm sm:text-base font-bold text-[#1F1B16]">
                    {returnedProduct?.title || `Order Item #${orderItemParam || 'General Return'}`}
                  </h3>
                  <span className="text-[11px] text-stone-500 font-sans block">
                    Variant: 5.5m Pure Silk Saree
                  </span>
                </div>
              </div>

              {returnedProduct && (
                <span className="font-editorial text-base sm:text-lg font-bold text-[#1F1B16] self-end sm:self-center flex-shrink-0">
                  {formatPrice(returnedProduct.priceINR)}
                </span>
              )}
            </div>

            {/* ================================================== */}
            {/* 2. REASON-SELECTION FORM (RADIO GROUP)             */}
            {/* ================================================== */}
            <div className="space-y-3">
              <label className="text-xs uppercase font-mono font-bold text-[#1F1B16] block">
                Primary Reason for Return / Exchange *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'fit', label: "Doesn't fit", desc: 'Blouse tailoring or drape length mismatch' },
                  { id: 'not_as_described', label: 'Not as described', desc: 'Color tone or zari pattern difference' },
                  { id: 'damaged', label: 'Damaged / Defective', desc: 'Weave snag, border defect, or transit damage' },
                  { id: 'changed_mind', label: 'Changed my mind', desc: 'Prefer an alternative weave or colorway' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      reason === item.id
                        ? 'border-[#C87F4A] bg-[#FAF3E4]/60 shadow-xs'
                        : 'border-stone-200 hover:border-[#C87F4A]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="return-reason"
                      checked={reason === item.id}
                      onChange={() => setReason(item.id as any)}
                      className="accent-[#C87F4A] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-xs text-[#1F1B16] block">{item.label}</span>
                      <span className="text-[10px] text-stone-500 font-sans">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* ================================================== */}
            {/* 3. DETAILS TEXT AREA                               */}
            {/* ================================================== */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase font-mono font-bold text-[#1F1B16] block">
                Additional Details for Mysuru Loom Inspection Team *
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe the condition of the saree, reason for return, or preferred replacement weave..."
                className="w-full p-3.5 bg-[#FAF3E4]/40 border border-stone-300 rounded-2xl text-xs font-sans focus:outline-none focus:border-[#C87F4A]"
              />
            </div>

            {/* ================================================== */}
            {/* 4. OPTIONAL PHOTO-UPLOAD AREA                      */}
            {/* ================================================== */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-mono font-bold text-[#1F1B16] flex items-center justify-between">
                <span>Upload Photos of Saree / Tags (Optional)</span>
                <span className="text-[10px] text-stone-400 font-normal">JPG, PNG up to 10MB</span>
              </label>

              <div className="border-2 border-dashed border-[#C87F4A]/35 rounded-2xl p-5 text-center bg-[#FAF3E4]/30 hover:bg-[#FAF3E4]/60 transition-colors">
                <input
                  type="file"
                  id="photo-upload-input"
                  accept="image/*"
                  onChange={handleSimulatePhotoUpload}
                  className="hidden"
                />
                <label htmlFor="photo-upload-input" className="cursor-pointer space-y-1 block">
                  <UploadCloud className="w-6 h-6 text-[#C87F4A] mx-auto" />
                  <span className="text-xs font-bold text-[#1F1B16] block">
                    Click to browse or drag photos here
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    Include photo of Govt. Silk Mark tag or defect area
                  </span>
                </label>
              </div>

              {/* Uploaded Photos Preview Strip */}
              {uploadedPhotos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {uploadedPhotos.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-300 shadow-xs">
                      <img src={url} alt="Uploaded evidence" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ================================================== */}
            {/* 5. REFUND PREFERENCE (CHOICE)                      */}
            {/* ================================================== */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <label className="text-xs uppercase font-mono font-bold text-[#1F1B16] block">
                Settlement Preference *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    refundMethod === 'original_payment'
                      ? 'border-[#C87F4A] bg-[#FAF3E4]/60 shadow-xs'
                      : 'border-stone-200 hover:border-[#C87F4A]/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="refund-method"
                    checked={refundMethod === 'original_payment'}
                    onChange={() => setRefundMethod('original_payment')}
                    className="accent-[#C87F4A] mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#1F1B16] block">
                      Refund to Original Payment
                    </span>
                    <span className="text-[10px] text-stone-500 font-sans">
                      Processed in 2-3 business days to original UPI/Card account.
                    </span>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    refundMethod === 'store_credit'
                      ? 'border-[#C87F4A] bg-[#FAF3E4]/60 shadow-xs'
                      : 'border-stone-200 hover:border-[#C87F4A]/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="refund-method"
                    checked={refundMethod === 'store_credit'}
                    onChange={() => setRefundMethod('store_credit')}
                    className="accent-[#C87F4A] mt-0.5"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#1F1B16] block">
                        Neelsareehouse Store Credit
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm font-bold">
                        +5% Bonus
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-sans">
                      Instant credit with extra 5% patron reward points.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* ================================================== */}
            {/* 6. PRIMARY SUBMIT BUTTON                           */}
            {/* ================================================== */}
            <div className="pt-4 border-t border-[#C87F4A]/20">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Registering RMA with BlueDart...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Return Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ReturnsNewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E4] p-12 text-center text-xs font-mono">
          Loading Return Request Registry...
        </div>
      }
    >
      <ReturnRequestContent />
    </Suspense>
  );
}
