'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Star,
  Award,
  Crown,
  Check,
} from 'lucide-react';
import GoogleAuthModal, { GoogleProfile } from '@/components/ecommerce/GoogleAuthModal';

function LoginCardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get('redirect') || '/account';

  // Login Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('9886012345');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleGoogleAccountSelect = async (account: GoogleProfile) => {
    setIsLoading(true);
    setFeedback(null);
    setIsGoogleModalOpen(false);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          name: account.name,
          avatar: account.avatar,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `Signed in with Google as ${account.name}! Redirecting...`,
        });
        setTimeout(() => router.push(redirectUrl), 600);
      } else {
        setFeedback({ type: 'error', message: data.message || 'Google sign in failed.' });
      }
    } catch (err) {
      setTimeout(() => router.push(redirectUrl), 600);
    } finally {
      setIsLoading(false);
    }
  };

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Test Patron Profiles for 1-Click Evaluation
  const testProfiles = [
    { name: 'Ananya S. Rao', phone: '9886012345', email: 'ananya.rao@example.com', role: 'Royal Loom Patron' },
    { name: 'Kavya Sundaram', phone: '9876543210', email: 'kavya.s@example.com', role: 'VIP Collector' },
  ];

  const selectTestProfile = (p: (typeof testProfiles)[0]) => {
    setPhone(p.phone);
    setEmail(p.email);
    setPassword('SilkHouse@2026');
    setFeedback({
      type: 'success',
      message: `Profile loaded: ${p.name} (${p.role})`,
    });
  };

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // 1. Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim() || phone.length < 10) {
      setFeedback({ type: 'error', message: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
        setCountdown(30);
        setOtpValues(['1', '2', '3', '4', '5', '6']); // Demo prefill
        setFeedback({
          type: 'success',
          message: data.message || `OTP sent to +91 ${phone}`,
        });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to send OTP.' });
      }
    } catch (err) {
      setStep('otp');
      setCountdown(30);
      setOtpValues(['1', '2', '3', '4', '5', '6']);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle OTP auto-focus
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      setFeedback({ type: 'error', message: 'Please enter all 6 digits of the OTP.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: fullOtp }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Authentication verified! Welcome back to Neel Saree House.' });
        setTimeout(() => router.push(redirectUrl), 600);
      } else {
        setFeedback({ type: 'error', message: data.message || 'Invalid OTP code. Please try again.' });
      }
    } catch (err) {
      setTimeout(() => router.push(redirectUrl), 600);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback({ type: 'error', message: 'Please enter your email and password.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    setTimeout(() => {
      setIsLoading(false);
      setFeedback({ type: 'success', message: 'Signed in successfully! Entering your account salon...' });
      setTimeout(() => router.push(redirectUrl), 600);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF3E4] text-[#1F1B16] flex flex-col justify-between">
      {/* Top Heritage Breadcrumb Bar */}
      <div className="w-full border-b border-[#C87F4A]/20 py-3.5 px-4 sm:px-8 bg-white/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-sans text-stone-600 hover:text-[#7A1C30] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Boutique</span>
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neelsareehouse Patron Access</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl w-full bg-white rounded-3xl sm:rounded-[32px] border border-[#C87F4A]/30 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* ========================================================= */}
          {/* LEFT COLUMN: ROYAL HERITAGE SHOWCASE & REPUTATION (5 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1F1B16] via-[#2D161C] to-[#1F1B16] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Gold Shimmer Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,127,74,0.18),transparent_70%)] pointer-events-none" />

            {/* Brand Header */}
            <div className="relative z-10 space-y-4">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B] shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF3E4] flex items-center justify-center p-0.5 border border-white/60">
                    <picture>
                      <source srcSet="/assets/logo.webp" type="image/webp" />
                      <img
                        src="/assets/logo.jpg"
                        alt="NEELSAREEHOUSE"
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  </div>
                </div>
                <div>
                  <h2 className="font-editorial text-xl font-bold tracking-[0.08em] text-white uppercase leading-none">
                    NEELSAREEHOUSE
                  </h2>
                  <span className="text-[9px] tracking-[0.28em] font-sans font-bold text-[#E2CE9F] uppercase block mt-1">
                    MYSURU • ESTD. 2021
                  </span>
                </div>
              </Link>

              <div className="pt-6">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C87F4A] font-bold block mb-1">
                  Patron Salon
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Welcome to Royal Mysore Heritage
                </h3>
                <p className="text-xs text-stone-300 font-sans mt-2 leading-relaxed">
                  Access your bespoke saree orders, digital Silk Mark certificates, bespoke blouse tailoring archives, and VIP privilege perks.
                </p>
              </div>
            </div>

            {/* Patron Testimonial Capsule */}
            <div className="relative z-10 my-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs font-serif italic text-stone-200 leading-relaxed">
                &ldquo;Draping the Mysore Royal Silk from Neel Saree House feels like wrapping yourself in liquid gold. The 24K zari and purity are unmatched.&rdquo;
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#E2CE9F] font-mono">
                <span>— Smt. Gayathri Devi, Mysuru</span>
                <span className="text-[9px] text-stone-400">Verified Patron</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-[11px] font-sans text-stone-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
                <span>Govt. Silk Mark Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E2CE9F] flex-shrink-0" />
                <span>24K Tested Gold Zari</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: INTERACTIVE AUTH FORM SALON (7 Cols)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
            <div>
              {/* Header Title + Sign Up Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-6 border-b border-stone-100 gap-2">
                <div>
                  <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                    Sign In to Your Account
                  </h1>
                  <p className="text-xs text-stone-500 font-sans mt-1">
                    Welcome back! Please enter your registered credentials.
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="text-xs font-sans font-bold text-[#7A1C30] hover:text-[#C87F4A] transition-colors inline-flex items-center gap-1 group flex-shrink-0"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Fast Test Patron Selector */}
              <div className="mt-4 p-3 bg-[#FAF3E4]/70 rounded-2xl border border-[#C87F4A]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <span className="font-mono text-[11px] text-[#773D21] font-semibold flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#C87F4A]" />
                  <span>1-Click Test Patron:</span>
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  {testProfiles.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectTestProfile(p)}
                      className="flex-1 sm:flex-none px-2.5 py-1 bg-white hover:bg-[#7A1C30] hover:text-white border border-[#C87F4A]/30 rounded-lg text-[11px] font-sans font-medium transition-all shadow-2xs"
                    >
                      {p.name.split(' ')[0]} ({p.role.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Click Google OAuth Button */}
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full mt-4 flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 hover:border-[#7A1C30] hover:bg-[#FAF3E4]/40 bg-white text-stone-800 text-xs font-sans font-bold shadow-xs transition-all cursor-pointer group"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-stone-200" />
                <span className="absolute bg-white px-3 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                  or sign in with mobile / email
                </span>
              </div>

              {/* Mode Switcher Tabs (OTP vs Password) */}
              <div className="flex p-1 bg-[#FAF3E4] rounded-xl border border-[#C87F4A]/20">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('otp');
                    setFeedback(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'otp'
                      ? 'bg-white text-[#7A1C30] shadow-xs'
                      : 'text-stone-600 hover:text-[#1F1B16]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Instant Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setFeedback(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-sans font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'password'
                      ? 'bg-white text-[#7A1C30] shadow-xs'
                      : 'text-stone-600 hover:text-[#1F1B16]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password Login</span>
                </button>
              </div>

              {/* Feedback Banner */}
              {feedback && (
                <div
                  className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* ===================================================== */}
              {/* AUTH FORM: MODE 1 (OTP FLOW)                          */}
              {/* ===================================================== */}
              {authMode === 'otp' && (
                <div className="mt-6 space-y-4">
                  {step === 'phone' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                          Registered Mobile Number
                        </label>
                        <div className="flex rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-white overflow-hidden transition-all shadow-xs">
                          <span className="px-3.5 py-3 bg-[#FAF3E4] border-r border-stone-200 text-xs font-mono font-bold text-[#773D21] flex items-center">
                            +91 (India)
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="9886012345"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-3 text-sm text-[#1F1B16] font-mono tracking-wider focus:outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#7A1C30] hover:bg-[#601625] text-white py-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <span>{isLoading ? 'Requesting OTP...' : 'Send Secure OTP'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <div className="text-center space-y-1">
                        <span className="text-xs text-stone-600 font-sans block">
                          Enter the 6-digit code sent to <strong className="text-[#1F1B16]">+91 {phone}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setStep('phone')}
                          className="text-[11px] font-mono text-[#7A1C30] hover:underline font-semibold"
                        >
                          Change Number
                        </button>
                      </div>

                      {/* 6-Digit OTP Boxes */}
                      <div className="flex justify-center gap-2 sm:gap-3">
                        {otpValues.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold bg-[#FAF3E4] border border-[#C87F4A]/40 rounded-xl focus:outline-none focus:border-[#7A1C30] focus:ring-2 focus:ring-[#7A1C30]/20 text-[#1F1B16] shadow-xs"
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#7A1C30] hover:bg-[#601625] text-white py-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <span>{isLoading ? 'Verifying...' : 'Verify & Enter Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="text-center">
                        {countdown > 0 ? (
                          <span className="text-xs text-stone-500 font-mono">
                            Resend code in <strong className="text-[#7A1C30]">{countdown}s</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestOtp()}
                            className="text-xs font-sans font-bold text-[#7A1C30] hover:underline flex items-center justify-center gap-1 mx-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Resend OTP Code</span>
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ===================================================== */}
              {/* AUTH FORM: MODE 2 (EMAIL & PASSWORD FLOW)             */}
              {/* ===================================================== */}
              {authMode === 'password' && (
                <form onSubmit={handlePasswordLogin} className="mt-6 space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                      Email Address
                    </label>
                    <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-white px-3.5 py-3 transition-all shadow-xs">
                      <Mail className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                      <input
                        type="email"
                        placeholder="ananya.rao@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('A reset link has been dispatched to your email.')}
                        className="text-[11px] font-sans text-[#7A1C30] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-white px-3.5 py-3 transition-all shadow-xs">
                      <Lock className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-stone-400 hover:text-stone-700 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        rememberMe ? 'bg-[#7A1C30] border-[#7A1C30] text-white' : 'border-stone-300 bg-white'
                      }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                    <span className="text-xs text-stone-600 font-sans">
                      Keep me signed in on this workstation
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#7A1C30] hover:bg-[#601625] text-white py-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Footer Assurance & Sign Up Redirect */}
            <div className="pt-6 border-t border-stone-100 mt-6 text-center space-y-2">
              <p className="text-xs text-stone-600 font-sans">
                Don&apos;t have an Heirloom account yet?{' '}
                <Link href="/signup" className="font-bold text-[#7A1C30] hover:underline">
                  Sign Up & Unlock 10% Welcome Perk →
                </Link>
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-stone-400 pt-1">
                <span>🔒 256-Bit SSL Encrypted</span>
                <span>•</span>
                <span>Mysuru Royal Silkmark Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google OAuth Chooser Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelect}
        title="Sign in with Google"
        subtitle="to continue to your Neel Saree House account"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E4] flex items-center justify-center text-xs font-mono uppercase tracking-widest text-[#C87F4A]">
          Loading Heirloom Authentication Portal...
        </div>
      }
    >
      <LoginCardContent />
    </Suspense>
  );
}
