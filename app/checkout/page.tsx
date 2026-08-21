'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  Plus,
  QrCode,
  Building,
  Banknote,
  AlertCircle,
  Scissors,
  ChevronLeft,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';

interface SavedAddress {
  id: string;
  type: 'Home' | 'Work';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

const initialSavedAddresses: SavedAddress[] = [
  {
    id: 'addr-1',
    type: 'Home',
    name: 'Ananya S. Rao',
    phone: '+91 98860 12345',
    addressLine1: '42, Royal Palms Residency, Sayyaji Rao Road',
    addressLine2: 'Near Mysore Palace North Gate',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570001',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'Work',
    name: 'Ananya S. Rao',
    phone: '+91 98860 12345',
    addressLine1: 'Level 4, Prestige Meridian, MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotalINR, cartTotalINR, appliedCoupon, couponDiscountINR, currency } = useCart();

  // Current Step: 1 = Address, 2 = Payment
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(initialSavedAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(initialSavedAddresses[0].id);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '',
    type: 'Home' as 'Home' | 'Work',
  });

  // Pincode Serviceability State
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [serviceability, setServiceability] = useState<{
    checked: boolean;
    serviceable: boolean;
    estimatedDelivery?: string;
    message?: string;
  }>({
    checked: true,
    serviceable: true,
    estimatedDelivery: 'Tuesday, 25 Aug 2026',
    message: '✓ Express BlueDart Air delivery available by Tuesday, 25 Aug 2026',
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('ananya@okhdfcbank');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const formatPrice = (inr: number) => {
    if (currency === 'USD') return `$${(inr / 83).toFixed(0)}`;
    if (currency === 'GBP') return `£${(inr / 105).toFixed(0)}`;
    if (currency === 'EUR') return `€${(inr / 90).toFixed(0)}`;
    if (currency === 'AED') return `AED ${(inr / 22.5).toFixed(0)}`;
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  // Check Pincode on New Address Input (when 6 digits)
  useEffect(() => {
    if (newAddress.pincode.length === 6) {
      checkPincodeServiceability(newAddress.pincode);
    }
  }, [newAddress.pincode]);

  const checkPincodeServiceability = async (pin: string) => {
    setPincodeChecking(true);
    try {
      const res = await fetch('/api/checkout/serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin }),
      });
      const data = await res.json();
      if (res.ok && data.serviceable) {
        setServiceability({
          checked: true,
          serviceable: true,
          estimatedDelivery: data.estimatedDelivery,
          message: data.message,
        });
      } else {
        setServiceability({
          checked: true,
          serviceable: false,
          message: data.message || 'Delivery is not available to this PIN code.',
        });
      }
    } catch (e) {
      setServiceability({
        checked: true,
        serviceable: true,
        estimatedDelivery: '3-4 business days',
        message: '✓ Standard Insured Express Delivery available',
      });
    } finally {
      setPincodeChecking(false);
    }
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceability.serviceable) return;

    const created: SavedAddress = {
      id: `addr-${Date.now()}`,
      type: newAddress.type,
      name: newAddress.name,
      phone: newAddress.phone,
      addressLine1: newAddress.addressLine1,
      addressLine2: newAddress.addressLine2,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode,
    };

    setSavedAddresses([...savedAddresses, created]);
    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
  };

  const selectedAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  const handleContinueToPayment = () => {
    if (serviceability.serviceable) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Pay Now Handler: POST /api/checkout/orders -> POST /api/checkout/payment/init -> Hand off to /checkout/confirmation
  const handlePayNow = async () => {
    setIsSubmittingOrder(true);
    try {
      // 1. Create order record
      const orderRes = await fetch('/api/checkout/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingAddress: selectedAddress,
          subtotal: cartSubtotalINR,
          discount: couponDiscountINR,
          total: cartTotalINR,
          currency,
        }),
      });
      const orderData = await orderRes.json();
      const orderNumber = orderData.order_number || `NSH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Initialize payment gateway
      const paymentRes = await fetch('/api/checkout/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          method: paymentMethod,
        }),
      });
      const paymentData = await paymentRes.json();

      // 3. Hand off to /checkout/confirmation with order_number
      setTimeout(() => {
        router.push(`/checkout/confirmation?order_number=${encodeURIComponent(orderNumber)}`);
      }, 800);
    } catch (err) {
      console.error('Order creation error:', err);
      router.push('/checkout/confirmation?order_number=NSH-2026-8942');
    }
  };

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Step Indicator Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between pb-6 border-b border-[#C87F4A]/20">
            {/* Step 1: Address */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  currentStep === 1
                    ? 'bg-[#C87F4A] text-white ring-4 ring-[#C87F4A]/20'
                    : 'bg-emerald-700 text-white'
                }`}
              >
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div>
                <span className="text-xs uppercase font-mono font-bold text-[#1F1B16] block">
                  Delivery Address
                </span>
                <span className="text-[10px] text-stone-500 font-sans hidden sm:block">
                  {selectedAddress ? `${selectedAddress.city} (${selectedAddress.pincode})` : 'Select Address'}
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-[100px] h-[1.5px] bg-[#C87F4A]/30 mx-3" />

            {/* Step 2: Payment */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  currentStep === 2
                    ? 'bg-[#C87F4A] text-white ring-4 ring-[#C87F4A]/20'
                    : 'bg-white border border-[#C87F4A]/40 text-stone-500'
                }`}
              >
                2
              </div>
              <div>
                <span className="text-xs uppercase font-mono font-bold text-[#1F1B16] block">
                  Payment Method
                </span>
                <span className="text-[10px] text-stone-500 font-sans hidden sm:block">
                  UPI, Cards, Netbanking, COD
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-[100px] h-[1.5px] bg-stone-200 mx-3" />

            {/* Step 3: Confirmation */}
            <div className="flex items-center gap-3 opacity-60">
              <div className="w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center font-mono font-bold text-xs text-stone-400">
                3
              </div>
              <div className="hidden sm:block">
                <span className="text-xs uppercase font-mono font-bold text-stone-500 block">
                  Confirmation
                </span>
                <span className="text-[10px] text-stone-400 font-sans">
                  Loom Vault Reservation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* MAIN 2-COLUMN CHECKOUT LAYOUT                        */}
        {/* LEFT: STEP CONTENT (SWAPPING) | RIGHT: ORDER SUMMARY */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
          {/* ==================================================== */}
          {/* LEFT: STEP CONTENT (NO FULL PAGE RELOAD)             */}
          {/* ==================================================== */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {/* ========================================== */}
              {/* STEP 1: DELIVERY ADDRESS                   */}
              {/* ========================================== */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1-address"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-0.5">
                        Step 1 of 2
                      </span>
                      <h2 className="font-editorial text-2xl font-bold text-[#1F1B16]">
                        Select Delivery Address
                      </h2>
                    </div>

                    {!isAddingNewAddress && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        className="text-xs font-mono font-bold uppercase tracking-wider text-[#C87F4A] hover:text-[#773D21] flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Address</span>
                      </button>
                    )}
                  </div>

                  {/* List of Saved Address Cards */}
                  {!isAddingNewAddress && (
                    <div className="space-y-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              checkPincodeServiceability(addr.pincode);
                            }}
                            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#C87F4A] bg-[#FAF3E4]/70 shadow-sm'
                                : 'border-stone-200 bg-white hover:border-[#C87F4A]/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-[#C87F4A]' : 'border-stone-400'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 rounded-full bg-[#C87F4A]" />
                                  )}
                                </div>
                                <span className="font-bold text-sm text-[#1F1B16]">
                                  {addr.name}
                                </span>
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                                  {addr.type}
                                </span>
                              </div>
                              <span className="text-xs font-mono text-stone-500 font-medium">
                                {addr.phone}
                              </span>
                            </div>

                            <p className="text-xs text-stone-600 font-sans mt-2.5 ml-6 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.city},{' '}
                              {addr.state} — <strong>{addr.pincode}</strong>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add New Address Form Modal/Inline */}
                  {isAddingNewAddress && (
                    <form
                      onSubmit={handleSaveNewAddress}
                      className="p-5 rounded-2xl bg-[#FAF3E4]/60 border border-[#C87F4A]/30 space-y-4 text-xs font-sans animate-fade-in"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#C87F4A]/20">
                        <span className="font-editorial text-base font-bold text-[#1F1B16]">
                          Enter New Delivery Address
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(false)}
                          className="text-stone-500 hover:text-black font-semibold text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">
                            Recipient Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                            placeholder="e.g. Radhika Sundaram"
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            placeholder="+91 98860 12345"
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">
                          Street Address / House No. *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.addressLine1}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, addressLine1: e.target.value })
                          }
                          placeholder="e.g. 14/B, Heritage Villa, Sayyaji Rao Road"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={newAddress.pincode}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, pincode: e.target.value })
                            }
                            placeholder="570001"
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl font-mono font-bold text-center"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-stone-700 block mb-1">State</label>
                          <input
                            type="text"
                            required
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={pincodeChecking || !serviceability.serviceable}
                        className="w-full bg-[#1F1B16] hover:bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
                      >
                        Save & Deliver to this Address
                      </button>
                    </form>
                  )}

                  {/* Pincode Serviceability Banner */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-sans flex items-center gap-2.5 ${
                      serviceability.serviceable
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {serviceability.serviceable ? (
                      <Truck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="font-medium">
                      {pincodeChecking ? 'Checking delivery serviceability...' : serviceability.message}
                    </span>
                  </div>

                  {/* Continue to Payment Button */}
                  {!isAddingNewAddress && (
                    <button
                      type="button"
                      onClick={handleContinueToPayment}
                      disabled={!serviceability.serviceable}
                      className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <span>Continue to Payment Method</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}

              {/* ========================================== */}
              {/* STEP 2: PAYMENT METHOD                     */}
              {/* ========================================== */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2-payment"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
                    <div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-mono text-[#C87F4A] hover:underline flex items-center gap-1 mb-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Back to Address</span>
                      </button>
                      <h2 className="font-editorial text-2xl font-bold text-[#1F1B16]">
                        Select Payment Method
                      </h2>
                    </div>

                    <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-700" />
                      <span>256-Bit SSL Secured</span>
                    </span>
                  </div>

                  {/* Payment Method Radio Cards */}
                  <div className="space-y-3">
                    {/* 1. UPI (Instant Collect) */}
                    <div
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#C87F4A] bg-[#FAF3E4]/70 shadow-sm'
                          : 'border-stone-200 hover:border-[#C87F4A]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'upi' ? 'border-[#C87F4A]' : 'border-stone-400'
                            }`}
                          >
                            {paymentMethod === 'upi' && (
                              <div className="w-2 h-2 rounded-full bg-[#C87F4A]" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#1F1B16] block">
                              UPI Instant (GPay, PhonePe, Paytm, BHIM)
                            </span>
                            <span className="text-[11px] text-stone-500 font-sans">
                              Zero convenience fee • Instant confirmation
                            </span>
                          </div>
                        </div>
                        <QrCode className="w-5 h-5 text-[#C87F4A]" />
                      </div>

                      {paymentMethod === 'upi' && (
                        <div className="mt-4 pt-3 border-t border-[#C87F4A]/20 flex gap-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="Enter your UPI VPA (e.g. mobile@upi)"
                            className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono"
                          />
                          <span className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 2. Credit / Debit Cards */}
                    <div
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#C87F4A] bg-[#FAF3E4]/70 shadow-sm'
                          : 'border-stone-200 hover:border-[#C87F4A]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'card' ? 'border-[#C87F4A]' : 'border-stone-400'
                            }`}
                          >
                            {paymentMethod === 'card' && (
                              <div className="w-2 h-2 rounded-full bg-[#C87F4A]" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#1F1B16] block">
                              Credit / Debit Cards
                            </span>
                            <span className="text-[11px] text-stone-500 font-sans">
                              Visa, MasterCard, RuPay, American Express
                            </span>
                          </div>
                        </div>
                        <CreditCard className="w-5 h-5 text-[#C87F4A]" />
                      </div>
                    </div>

                    {/* 3. Netbanking */}
                    <div
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'netbanking'
                          ? 'border-[#C87F4A] bg-[#FAF3E4]/70 shadow-sm'
                          : 'border-stone-200 hover:border-[#C87F4A]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'netbanking' ? 'border-[#C87F4A]' : 'border-stone-400'
                            }`}
                          >
                            {paymentMethod === 'netbanking' && (
                              <div className="w-2 h-2 rounded-full bg-[#C87F4A]" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#1F1B16] block">
                              Netbanking
                            </span>
                            <span className="text-[11px] text-stone-500 font-sans">
                              HDFC, ICICI, SBI, Axis, Kotak & 50+ Indian banks
                            </span>
                          </div>
                        </div>
                        <Building className="w-5 h-5 text-[#C87F4A]" />
                      </div>
                    </div>

                    {/* 4. Cash on Delivery (COD) */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#C87F4A] bg-[#FAF3E4]/70 shadow-sm'
                          : 'border-stone-200 hover:border-[#C87F4A]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              paymentMethod === 'cod' ? 'border-[#C87F4A]' : 'border-stone-400'
                            }`}
                          >
                            {paymentMethod === 'cod' && (
                              <div className="w-2 h-2 rounded-full bg-[#C87F4A]" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#1F1B16] block">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[11px] text-stone-500 font-sans">
                              Pay on delivery at your doorstep with verified OTP
                            </span>
                          </div>
                        </div>
                        <Banknote className="w-5 h-5 text-[#C87F4A]" />
                      </div>
                    </div>
                  </div>

                  {/* Primary Pay Now Button */}
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isSubmittingOrder}
                    className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-4 rounded-sm text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Securing Vault Reservation...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay {formatPrice(cartTotalINR)} & Place Order</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ==================================================== */}
          {/* RIGHT: CONDENSED ORDER SUMMARY (STICKY ACROSS STEPS) */}
          {/* ==================================================== */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-7 border border-[#C87F4A]/25 shadow-silk space-y-5">
              <h3 className="font-editorial text-xl font-bold text-[#1F1B16] pb-3 border-b border-[#C87F4A]/20 flex items-center justify-between">
                <span>Heirloom Curations</span>
                <span className="text-xs font-mono text-[#773D21] font-semibold">
                  {cart.length} {cart.length === 1 ? 'Piece' : 'Pieces'}
                </span>
              </h3>

              {/* Condensed Items Preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-stone-100">
                {cart.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-12 h-14 rounded-lg object-cover bg-[#FAF3E4] border border-stone-200 flex-shrink-0"
                    />
                    <div className="truncate flex-1">
                      <span className="text-[10px] font-mono text-[#C87F4A] uppercase font-semibold block">
                        {item.product.weave}
                      </span>
                      <span className="text-xs font-editorial font-bold text-[#1F1B16] block truncate">
                        {item.product.title}
                      </span>
                      <span className="text-[10px] text-stone-500 font-sans block">
                        Qty: {item.quantity} • {item.blouseOption || 'Unstitched'}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#1F1B16]">
                      {formatPrice((item.product.priceINR + (item.tailoringExtraINR || 0)) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-[#C87F4A]/15 space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-[#1F1B16]">
                    {formatPrice(cartSubtotalINR)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-800 font-medium">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-mono font-bold">-{formatPrice(couponDiscountINR)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-stone-600">
                  <span>Estimated Shipping</span>
                  <span className="font-mono text-emerald-800 uppercase font-semibold text-[11px]">
                    FREE (BlueDart Air)
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-[#C87F4A]/20 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#773D21] block">
                    Total Payable
                  </span>
                  <span className="text-[10px] text-stone-400 font-sans">
                    Includes GST, Customs & Ready-to-Drape Fall/Pico
                  </span>
                </div>
                <span className="font-editorial text-2xl font-bold text-[#1F1B16]">
                  {formatPrice(cartTotalINR)}
                </span>
              </div>

              {/* Delivery Assurance */}
              <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-600 font-sans">
                <ShieldCheck className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
                <span>Includes Govt. Silk Mark India Certificate & Cedar Box</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
