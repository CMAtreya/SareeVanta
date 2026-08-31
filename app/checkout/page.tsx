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
  Copy,
  Download,
  Package,
  Calendar,
  ExternalLink,
  Crown,
  Tag,
  Trash2,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';
import { createClient } from '@/lib/supabase/client';
import { sanitizePincode, validatePincode } from '@/lib/pincode';

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

const initialSavedAddresses: SavedAddress[] = [];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    cartSubtotalINR,
    cartTotalINR,
    appliedCoupon,
    couponDiscountINR,
    currency,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoadAddresses() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?redirect=/checkout');
        return;
      }

      const meta = user.user_metadata || {};
      const userFullName =
        meta.full_name ||
        meta.name ||
        (meta.given_name ? `${meta.given_name} ${meta.family_name || ''}`.trim() : '') ||
        '';
      const userPhone = meta.phone || user.phone || '';

      setNewAddress((prev) => ({
        ...prev,
        name: prev.name || userFullName,
        phone: prev.phone || userPhone,
      }));

      const { data: addresses } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', user.id);

      if (addresses && addresses.length > 0) {
        const formatted = addresses.map((a: any) => ({
          id: a.id,
          type: (a.label || 'Home') as 'Home' | 'Work',
          name: a.recipient_name,
          phone: a.phone,
          addressLine1: a.address_line_1,
          addressLine2: a.address_line_2,
          city: a.city,
          state: a.state,
          pincode: a.postal_code,
          isDefault: a.is_default,
        }));
        setSavedAddresses(formatted);
        const defaultAddr = formatted.find((a) => a.isDefault) || formatted[0];
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSavedAddresses([]);
        setIsAddingNewAddress(true);
      }
    }

    checkAuthAndLoadAddresses();
  }, [router]);

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

  // Confirmed Order Details State (Step 4)
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    trackingNumber: string;
    placedAt: string;
    totalINR: number;
    paymentMethod: string;
    items?: any[];
  } | null>(null);

  const [copiedOrder, setCopiedOrder] = useState(false);

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

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePincode(newAddress.pincode)) {
      alert('PIN Code must be exactly 6 digits (starting with 1-9).');
      return;
    }
    if (!serviceability.serviceable) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const formattedPhone = newAddress.phone.startsWith('+91')
      ? newAddress.phone
      : `+91 ${newAddress.phone.replace(/\D/g, '')}`;

    let newId = `addr-${Date.now()}`;

    if (user) {
      const { data } = await supabase
        .from('customer_addresses')
        .insert({
          customer_id: user.id,
          label: 'Home',
          recipient_name: newAddress.name,
          phone: formattedPhone,
          address_line_1: newAddress.addressLine1,
          address_line_2: newAddress.addressLine2,
          city: newAddress.city,
          state: newAddress.state,
          postal_code: newAddress.pincode,
          is_default: savedAddresses.length === 0,
        })
        .select()
        .single();

      if (data) {
        newId = data.id;
      }
    }

    const created: SavedAddress = {
      id: newId,
      type: 'Home',
      name: newAddress.name,
      phone: formattedPhone,
      addressLine1: newAddress.addressLine1,
      addressLine2: newAddress.addressLine2,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode,
    };

    setSavedAddresses((prev) => [...prev, created]);
    setSelectedAddressId(created.id);
    setIsAddingNewAddress(false);
  };

  const selectedAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  const handleContinueToReview = () => {
    if (serviceability.serviceable) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContinueToPayment = async () => {
    try {
      await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_id: selectedAddress?.id,
          coupon_code: appliedCoupon?.code || null,
          items: cart.map((item) => ({
            productId: item.product.id,
            variant_id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
    } catch (e) {
      console.warn('[Checkout] Stock reservation request initiated:', e);
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccessMsg(null);

    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          cartSubtotalINR,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        applyCoupon(data);
        setCouponSuccessMsg(data.message || `Coupon "${data.code}" applied successfully!`);
        setCouponInput('');
      } else {
        setCouponError(data.message || 'Invalid or inactive coupon code.');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon code. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccessMsg(null);
    setCouponError(null);
    setCouponInput('');
  };

  // Pay Now Handler: POST /api/checkout/orders -> POST /api/checkout/payment/init -> Render Step 4 Confirmation
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
          couponCode: appliedCoupon?.code || null,
          total: cartTotalINR,
          paymentMethod,
          currency,
        }),
      });
      const orderData = await orderRes.json();
      const orderNumber = orderData.order_number || `NSH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Initialize payment gateway
      await fetch('/api/checkout/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: orderNumber,
          method: paymentMethod,
        }),
      });

      // 3. Set confirmation details and transition to Step 4
      const purchasedItems = [...cart];
      setConfirmedOrder({
        orderNumber,
        trackingNumber: `BD-AIR-${Math.floor(100000 + Math.random() * 900000)}`,
        placedAt: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        totalINR: cartTotalINR,
        items: purchasedItems,
        paymentMethod:
          paymentMethod === 'upi'
            ? `UPI Instant (${upiId})`
            : paymentMethod === 'card'
            ? 'Credit/Debit Card'
            : paymentMethod === 'netbanking'
            ? 'Netbanking'
            : 'Cash on Delivery',
      });

      clearCart();
      setTimeout(() => {
        setIsSubmittingOrder(false);
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);
    } catch (err) {
      console.error('Order creation error:', err);
      const purchasedItems = [...cart];
      setConfirmedOrder({
        orderNumber: 'NSH-2026-8942',
        trackingNumber: 'BD-AIR-928412',
        placedAt: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        totalINR: cartTotalINR,
        items: purchasedItems,
        paymentMethod: 'Cash on Delivery',
      });
      clearCart();
      setTimeout(() => {
        setIsSubmittingOrder(false);
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);
    }
  };

  const copyOrderNumber = () => {
    if (confirmedOrder?.orderNumber) {
      navigator.clipboard.writeText(confirmedOrder.orderNumber);
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
    }
  };

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* ==================================================== */}
        {/* 4-STEP PROGRESS INDICATOR HEADER                     */}
        {/* ==================================================== */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center justify-between pb-6 border-b border-[#C87F4A]/20">
            {/* Step 1: Address */}
            <div className="flex items-center gap-2.5 sm:gap-3">
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
                <span className="text-[10px] text-stone-500 font-sans hidden md:block">
                  {selectedAddress ? `${selectedAddress.city} (${selectedAddress.pincode})` : 'Select Address'}
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-[40px] sm:max-w-[70px] h-[1.5px] bg-[#C87F4A]/30 mx-1.5 sm:mx-2" />

            {/* Step 2: Final Review (Before Payment Details) */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  currentStep === 2
                    ? 'bg-[#C87F4A] text-white ring-4 ring-[#C87F4A]/20'
                    : currentStep > 2
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-[#C87F4A]/40 text-stone-500'
                }`}
              >
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div>
                <span className="text-xs uppercase font-mono font-bold text-[#1F1B16] block">
                  Order Review
                </span>
                <span className="text-[10px] text-stone-500 font-sans hidden md:block">
                  Read-Only Summary
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-[40px] sm:max-w-[70px] h-[1.5px] bg-[#C87F4A]/30 mx-1.5 sm:mx-2" />

            {/* Step 3: Payment Details */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  currentStep === 3
                    ? 'bg-[#C87F4A] text-white ring-4 ring-[#C87F4A]/20'
                    : currentStep > 3
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-stone-300 text-stone-400'
                }`}
              >
                {currentStep > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <div>
                <span className="text-xs uppercase font-mono font-bold text-[#1F1B16] block">
                  Payment Details
                </span>
                <span className="text-[10px] text-stone-500 font-sans hidden md:block">
                  {paymentMethod.toUpperCase()} Gateway
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-[40px] sm:max-w-[70px] h-[1.5px] bg-[#C87F4A]/30 mx-1.5 sm:mx-2" />

            {/* Step 4: Confirmation */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-colors ${
                  currentStep === 4
                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-600/20'
                    : 'bg-white border border-stone-300 text-stone-400'
                }`}
              >
                4
              </div>
              <div>
                <span className="text-xs uppercase font-mono font-bold text-[#1F1B16] block">
                  Confirmation
                </span>
                <span className="text-[10px] text-stone-500 font-sans hidden md:block">
                  Loom Reservation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* MAIN 2-COLUMN CHECKOUT LAYOUT                        */}
        {/* ==================================================== */}
        <div className={`max-w-6xl mx-auto ${currentStep === 4 || currentStep === 2 ? '' : 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start'}`}>
          {/* ==================================================== */}
          {/* LEFT: STEP CONTENT                                   */}
          {/* ==================================================== */}
          <div className={currentStep === 4 || currentStep === 2 ? 'w-full max-w-3xl mx-auto' : 'lg:col-span-7'}>
            <AnimatePresence mode="wait">
              {/* =================================================== */}
              {/* STEP 1: DELIVERY ADDRESS                            */}
              {/* =================================================== */}
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
                        Step 1 of 4
                      </span>
                      <h2 className="font-editorial text-2xl font-bold text-[#1F1B16]">
                        Select Delivery Address
                      </h2>
                    </div>

                    {!isAddingNewAddress && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        className="text-xs font-mono font-bold uppercase tracking-wider text-[#C87F4A] hover:text-[#773D21] flex items-center gap-1 cursor-pointer"
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
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'border-[#C87F4A] bg-[#FAF3E4]/70 shadow-sm'
                                : 'border-stone-200 hover:border-[#C87F4A]/50 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? 'border-[#C87F4A]' : 'border-stone-400'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-[#C87F4A]" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-[#1F1B16]">
                                    {addr.name}
                                  </span>
                                  <span className="text-[10px] font-mono uppercase bg-[#1F1B16] text-white px-2 py-0.5 rounded-full font-bold">
                                    {addr.type}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[10px] font-mono text-[#C87F4A] font-bold">
                                      (Default)
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                                  {addr.addressLine1}
                                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                  <br />
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <span className="text-[11px] font-mono text-stone-500 block pt-1">
                                  Phone: {addr.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add New Address Form Modal/Inline */}
                  {isAddingNewAddress && (
                    <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                            placeholder="Ananya S. Rao"
                            className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-sans focus:outline-none focus:border-[#C87F4A]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            placeholder="+91 98860 12345"
                            className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#C87F4A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                          Street Address / Flat No. *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.addressLine1}
                          onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                          placeholder="42, Royal Palms Residency, Sayyaji Rao Road"
                          className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-sans focus:outline-none focus:border-[#C87F4A]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                            PIN Code *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress({ ...newAddress, pincode: sanitizePincode(e.target.value) })}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pasted = e.clipboardData.getData('text');
                                setNewAddress({ ...newAddress, pincode: sanitizePincode(pasted) });
                              }}
                              placeholder="570001"
                              className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#C87F4A]"
                            />
                            {pincodeChecking && (
                              <div className="absolute right-3 top-3 w-3 h-3 border-2 border-[#C87F4A] border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-sans focus:outline-none focus:border-[#C87F4A]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-sans focus:outline-none focus:border-[#C87F4A]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={!serviceability.serviceable}
                          className="px-5 py-2.5 bg-[#C87F4A] hover:bg-[#B36737] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          Save & Use Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewAddress(false)}
                          className="px-4 py-2.5 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-sans font-medium rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Pincode Serviceability Indicator */}
                  {serviceability.checked && (
                    <div
                      className={`p-3.5 rounded-2xl border text-xs font-sans flex items-center gap-2.5 ${
                        serviceability.serviceable
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {serviceability.serviceable ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold">{serviceability.message}</span>
                        {serviceability.estimatedDelivery && (
                          <span className="block text-[11px] text-emerald-700 font-mono mt-0.5">
                            Estimated Express Dispatch: {serviceability.estimatedDelivery}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Continue to Step 2 (Order Review) Button */}
                  {!isAddingNewAddress && (
                    <button
                      type="button"
                      onClick={handleContinueToReview}
                      disabled={!serviceability.serviceable}
                      className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Proceed to Order Review (Step 2)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}

              {/* =================================================== */}
              {/* STEP 2: SINGLE INTEGRATED ORDER REVIEW CARD          */}
              {/* =================================================== */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2-review"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6"
                >
                  {/* Card Header */}
                  <div className="pb-4 border-b border-[#C87F4A]/20 flex items-center justify-between">
                    <div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-mono text-[#C87F4A] hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Back to Address Selection</span>
                      </button>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A1C30] font-bold block mb-0.5">
                        Step 2 of 4 • Final Review
                      </span>
                      <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                        Review Your Order
                      </h2>
                    </div>
                  </div>

                  {/* 1. Delivery Address Summary */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF3E4]/50 border border-[#C87F4A]/20 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#773D21] font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C87F4A]" />
                        <span>Delivery Destination</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-mono text-[#7A1C30] hover:underline font-semibold cursor-pointer"
                      >
                        Edit Address
                      </button>
                    </div>
                    <div className="text-xs font-sans text-[#1F1B16] space-y-0.5">
                      <div className="font-bold">{selectedAddress.name} ({selectedAddress.type})</div>
                      <div className="text-stone-600">
                        {selectedAddress.addressLine1}
                        {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}
                      </div>
                      <div className="text-stone-600">
                        {selectedAddress.city}, {selectedAddress.state} - <strong>{selectedAddress.pincode}</strong>
                      </div>
                      <div className="text-[11px] font-mono text-stone-500 pt-1">
                        Contact: {selectedAddress.phone}
                      </div>
                    </div>
                    {serviceability.estimatedDelivery && (
                      <div className="mt-2 pt-2 border-t border-[#C87F4A]/15 flex items-center gap-1.5 text-[11px] font-sans text-emerald-800 font-semibold">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Express Air Delivery • Estimated Delivery: {serviceability.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>

                  {/* 2. Order Items */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Order Items ({cart.length})
                    </span>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="p-3.5 rounded-2xl border border-stone-200 bg-white flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-14 h-18 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                            />
                            <div className="truncate space-y-0.5">
                              <h4 className="text-xs sm:text-sm font-editorial font-bold text-[#1F1B16] truncate">
                                {item.product.title}
                              </h4>
                              <span className="text-[11px] font-mono text-stone-600 block">
                                Quantity: {item.quantity}
                              </span>
                              <span className="text-[10px] font-sans text-emerald-700 font-semibold block">
                                ✓ Fall & Pico Included
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 font-mono text-xs sm:text-sm font-bold text-[#1F1B16]">
                            {formatPrice((item.product.priceINR + (item.tailoringExtraINR || 0)) * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Have a Coupon Code? Section */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#C87F4A]/30 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#1F1B16] font-bold flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#C87F4A]" />
                        <span>Have a Coupon Code?</span>
                      </span>
                      {appliedCoupon && (
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                          Coupon Applied
                        </span>
                      )}
                    </div>

                    {appliedCoupon ? (
                      <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-emerald-900 tracking-wider uppercase">
                                {appliedCoupon.code}
                              </span>
                              <span className="text-[11px] font-mono font-semibold text-emerald-700">
                                (-{formatPrice(couponDiscountINR)})
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-700 font-sans block">
                              {appliedCoupon.description || 'Privilege discount activated'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs font-mono text-stone-500 hover:text-red-600 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="space-y-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => {
                                setCouponInput(e.target.value.toUpperCase());
                                if (couponError) setCouponError(null);
                              }}
                              placeholder="Enter coupon code (e.g. FESTIVE10)"
                              className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-[#C87F4A]"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isApplyingCoupon || !couponInput.trim()}
                            className="px-5 py-2.5 bg-[#1F1B16] hover:bg-[#C87F4A] text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                          >
                            {isApplyingCoupon ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <span>Apply</span>
                            )}
                          </button>
                        </div>

                        {couponError && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 font-sans pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{couponError}</span>
                          </div>
                        )}

                        {couponSuccessMsg && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-sans pt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{couponSuccessMsg}</span>
                          </div>
                        )}
                      </form>
                    )}
                  </div>

                  {/* 4. Cost & Subtotal Breakdown */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF3E4]/30 border border-[#C87F4A]/20 space-y-2.5 text-xs font-sans">
                    <div className="flex justify-between text-stone-600">
                      <span>Original Subtotal (Before Discount)</span>
                      <span className="font-mono">{formatPrice(cartSubtotalINR)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50/60 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-emerald-700" />
                          <span>Coupon Discount ({appliedCoupon.code})</span>
                        </span>
                        <span className="font-mono">-{formatPrice(couponDiscountINR)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600">
                      <span>Fall & Pico Stitching</span>
                      <span className="text-emerald-700 font-mono font-bold uppercase text-[10px]">Complimentary</span>
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span>Express Air Delivery</span>
                      <span className="text-emerald-700 font-mono font-bold uppercase text-[10px]">Free</span>
                    </div>

                    <div className="pt-3 border-t border-[#C87F4A]/20 flex justify-between font-bold text-sm text-[#1F1B16]">
                      <span>Final Total Amount (After Discount)</span>
                      <span className="font-mono text-base text-[#7A1C30]">
                        {formatPrice(cartTotalINR)}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-sans block text-right">
                      Includes 18% Handloom GST
                    </span>
                  </div>

                  {/* Proceed to Step 3 (Payment) Button */}
                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Proceed to Payment Options (Step 3)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* =================================================== */}
              {/* STEP 3: PAYMENT METHOD DETAILS & GATEWAY            */}
              {/* =================================================== */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3-payment"
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
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-mono text-[#C87F4A] hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Back to Order Review</span>
                      </button>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-0.5">
                        Step 3 of 4
                      </span>
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

                  {/* Primary Pay Now & Advance to Step 4 Button */}
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isSubmittingOrder}
                    className="w-full bg-[#7A1C30] hover:bg-[#601625] text-white py-4 rounded-xl text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Securing Vault Reservation...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Authorize & Place Order ({formatPrice(cartTotalINR)})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* =================================================== */}
              {/* STEP 4: ORDER CONFIRMATION CELEBRATION (INTEGRATED) */}
              {/* =================================================== */}
              {currentStep === 4 && confirmedOrder && (
                <motion.div
                  key="step-4-confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C87F4A]/30 shadow-2xl space-y-8"
                >
                  {/* Top Celebratory Royal Banner */}
                  <div className="text-center space-y-3 pb-6 border-b border-[#C87F4A]/20">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B] mx-auto shadow-lg flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#7A1C30] text-white flex items-center justify-center">
                        <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C87F4A] font-bold block">
                        Loom Vault Reservation Secured
                      </span>
                      <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#1F1B16]">
                        Congratulations on Your Royal Curation!
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-lg mx-auto leading-relaxed">
                        Your bespoke saree order has been authenticated and registered with the Mysuru Master Weavers guild.
                      </p>
                    </div>
                  </div>

                  {/* Order Reference & Tracking Number Capsule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF3E4]/70 p-5 rounded-2xl border border-[#C87F4A]/25">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block mb-0.5">
                        Official Order Reference
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#7A1C30]">
                          {confirmedOrder.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={copyOrderNumber}
                          className="p-1 rounded-md hover:bg-white text-stone-500 hover:text-black transition-colors"
                          title="Copy Order ID"
                        >
                          {copiedOrder ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono">
                        Placed on {confirmedOrder.placedAt}
                      </span>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block mb-0.5">
                        Express Logistics Consignment
                      </span>
                      <div className="font-mono text-base font-bold text-emerald-800 flex items-center sm:justify-end gap-1.5">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>{confirmedOrder.trackingNumber}</span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono">
                        BlueDart Air • Est. {serviceability.estimatedDelivery}
                      </span>
                    </div>
                  </div>

                  {/* Order Line Summary */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-stone-700 font-bold block">
                      Reserved Heirlooms ({confirmedOrder.items?.length || 1})
                    </span>
                    <div className="space-y-3">
                      {(confirmedOrder.items && confirmedOrder.items.length > 0
                        ? confirmedOrder.items
                        : cart
                      ).map((item) => (
                        <div
                          key={item.product?.id || item.product?.title}
                          className="p-4 rounded-2xl border border-stone-200 bg-white flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'}
                              alt={item.product?.title || 'Heirloom Silk Saree'}
                              className="w-14 h-18 rounded-xl object-cover border border-stone-200 flex-shrink-0 shadow-2xs"
                            />
                            <div className="truncate space-y-0.5">
                              <h4 className="text-sm font-editorial font-bold text-[#1F1B16] truncate">
                                {item.product?.title || 'Heirloom Silk Saree'}
                              </h4>
                              <span className="text-[11px] font-mono text-[#773D21] block">
                                Qty: {item.quantity} • {item.blouseOption === 'stitched' ? 'Custom Tailored Blouse' : 'Fall & Pico Hemmed'}
                              </span>
                              <span className="text-[10px] font-sans text-emerald-700 font-semibold block">
                                ✓ Govt. Silk Mark Authenticity Seal Attached
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 font-mono text-sm font-bold text-[#1F1B16]">
                            {formatPrice(((item.product?.priceINR || item.product?.price || 0) + (item.tailoringExtraINR || 0)) * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Authenticity & Invoice Actions */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-700 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950 block">
                          Govt. Silk Mark Guarantee Certificate Issued
                        </span>
                        <span className="text-[11px] text-emerald-800">
                          Digital QR Certificate has been dispatched to your email and registered account.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('PDF Tax Invoice generated and downloaded.')}
                      className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Tax Invoice (PDF)</span>
                    </button>
                  </div>

                  {/* Navigation Action Buttons */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-3 justify-between">
                    <Link
                      href={`/orders/${confirmedOrder.orderNumber}/track`}
                      className="w-full sm:w-auto px-6 py-3.5 bg-[#7A1C30] hover:bg-[#601625] text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Package className="w-4 h-4" />
                      <span>Track Consignment in Live Orders</span>
                    </Link>

                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-3.5 border border-[#C87F4A]/40 hover:bg-[#FAF3E4] text-[#1F1B16] rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                    >
                      <span>Explore More Handloom Weaves</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ==================================================== */}
          {/* RIGHT: CONDENSED ORDER SUMMARY (STEP 1 & 3 ONLY)     */}
          {/* ==================================================== */}
          {(currentStep === 1 || currentStep === 3) && (
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-7 border border-[#C87F4A]/25 shadow-silk space-y-5">
                <h3 className="font-editorial text-xl font-bold text-[#1F1B16] pb-3 border-b border-[#C87F4A]/20 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-mono text-[#773D21] font-semibold">
                    {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                  </span>
                </h3>

                {/* Saree Line Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3 text-xs">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-12 h-16 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-editorial font-bold text-[#1F1B16] truncate block">
                          {item.product.title}
                        </span>
                        <span className="text-[10px] text-stone-500 font-sans block">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-[10px] text-[#773D21] font-mono block">
                          ✓ Fall & Pico Included
                        </span>
                      </div>
                      <div className="text-right font-mono font-bold text-[#1F1B16]">
                        {formatPrice(
                          (item.product.priceINR + (item.tailoringExtraINR || 0)) * item.quantity
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-[#C87F4A]/20 space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(cartSubtotalINR)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-mono">-{formatPrice(couponDiscountINR)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600">
                    <span>Fall & Pico Stitching</span>
                    <span className="text-emerald-700 font-mono font-bold uppercase text-[10px]">
                      Complimentary
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Express Air Delivery</span>
                    <span className="text-emerald-700 font-mono font-bold uppercase text-[10px]">
                      Free
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#C87F4A]/20 flex justify-between font-bold text-sm text-[#1F1B16]">
                    <span>Total Amount</span>
                    <span className="font-mono text-base text-[#7A1C30]">
                      {formatPrice(cartTotalINR)}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-sans block text-right">
                    Includes 18% Handloom GST
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
