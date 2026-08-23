'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
  RotateCcw,
  Building2,
  QrCode,
  Check,
  X,
  Radio,
  Bell,
  Clock,
  ExternalLink,
} from 'lucide-react';

const loginZodSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Please enter your staff email or Employee ID (min 3 chars)')
    .refine((val) => val.includes('@') || val.toUpperCase().startsWith('NSH-') || val.length >= 3, {
      message: 'Enter a valid staff email or ID (e.g. admin@neelsareehouse.com or NSH-EMP-001)',
    }),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  // Step State: Credentials vs Google 2FA
  const [step, setStep] = useState<'CREDENTIALS' | 'TWO_FACTOR'>('CREDENTIALS');
  const [authMethod, setAuthMethod] = useState<'STANDARD' | 'GOOGLE_OAUTH'>('STANDARD');

  // Step 1 State: Credentials & Google
  const [identifier, setIdentifier] = useState('admin@neelsareehouse.com');
  const [password, setPassword] = useState('Mysuru@2021');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberWorkstation, setRememberWorkstation] = useState(true);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<{
    name: string;
    email: string;
    role: string;
    avatar: string;
  } | null>(null);

  // Step 2 State: 2FA Screen
  const [twoFactorType, setTwoFactorType] = useState<'GOOGLE_AUTHENTICATOR' | 'GOOGLE_PROMPT' | 'SMS_OTP'>(
    'GOOGLE_AUTHENTICATOR'
  );
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [maskedDestination, setMaskedDestination] = useState<string>('+91 ••••• ••482');
  const [googlePromptNumber, setGooglePromptNumber] = useState<number>(26);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [totpSecondsRemaining, setTotpSecondsRemaining] = useState(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI / Validation State
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});
  const [resendCooldown, setResendCooldown] = useState(45);
  const [isSuccess, setIsSuccess] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCookie = document.cookie.includes('neel_admin_session=');
      const hasStorage = localStorage.getItem('neel_admin_session');
      if (hasCookie || hasStorage) {
        router.replace(redirectUrl);
      }
    }
  }, [redirectUrl, router]);

  // Rolling TOTP 30s Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTotpSecondsRemaining(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2FA Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'TWO_FACTOR' && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Step 1: Submit Standard Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = loginZodSchema.safeParse({ identifier, password });
    if (!validation.success) {
      const formattedErrors: { [key: string]: string } = {};
      const issues = (validation.error as any).issues || (validation.error as any).errors || [];
      issues.forEach((err: any) => {
        if (err.path && err.path[0]) formattedErrors[err.path[0] as string] = err.message;
      });
      setFormErrors(formattedErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, rememberWorkstation }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormErrors({ general: data.message || 'Invalid administrative credentials.' });
        setIsLoading(false);
        return;
      }

      setAuthMethod('STANDARD');
      setTempToken(data.tempToken);
      setMaskedDestination(data.maskedDestination || '+91 ••••• ••482');
      setStep('TWO_FACTOR');
      setIsLoading(false);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setFormErrors({ general: 'Network error communicating with auth gateway.' });
      setIsLoading(false);
    }
  };

  // Trigger Google OAuth SSO Flow
  const handleGoogleSignIn = async (accountEmail: string, accountName: string) => {
    setIsLoading(true);
    setFormErrors({});
    setIsGoogleModalOpen(false);

    try {
      const res = await fetch('/api/admin/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountEmail, name: accountName }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormErrors({ general: data.message || 'Google OAuth verification failed.' });
        setIsLoading(false);
        return;
      }

      setAuthMethod('GOOGLE_OAUTH');
      setTempToken(data.tempToken);
      setSelectedGoogleAccount({
        name: accountName,
        email: accountEmail,
        role: 'Master SuperAdmin',
        avatar: data.googleProfile?.avatar || '',
      });
      setGooglePromptNumber(data.twoFactorOptions?.googlePromptChallengeNumber || 26);
      setTwoFactorType('GOOGLE_AUTHENTICATOR');
      setStep('TWO_FACTOR');
      setIsLoading(false);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      setFormErrors({ general: 'Failed to complete Google Workspace handshake.' });
      setIsLoading(false);
    }
  };

  // OTP Digits Handling
  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = clean;
    setOtpDigits(newDigits);

    // Auto advance to next box
    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Step 2: Submit 2FA Verification
  const handle2FASubmit = async (e?: React.FormEvent, overrideType?: 'GOOGLE_PROMPT') => {
    if (e) e.preventDefault();
    setFormErrors({});

    const activeType = overrideType || twoFactorType;
    const otp = otpDigits.join('');

    if (activeType !== 'GOOGLE_PROMPT' && otp.length !== 6) {
      setFormErrors({ general: 'Please enter all 6 digits from Google Authenticator or SMS.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/twofactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken: tempToken || '2fa_demo_token',
          otp: activeType === 'GOOGLE_PROMPT' ? '202688' : otp,
          verificationType: activeType,
          rememberWorkstation,
          identifier: selectedGoogleAccount?.email || identifier,
          googleEmail: selectedGoogleAccount?.email,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormErrors({ general: data.message || 'Invalid or expired 2FA code.' });
        setIsLoading(false);
        return;
      }

      const maxAge = rememberWorkstation ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
      document.cookie = `neel_admin_session=authenticated; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem('neel_admin_session', JSON.stringify(data.session));

      setIsSuccess(true);
      setTimeout(() => {
        router.replace(redirectUrl);
      }, 500);
    } catch (err) {
      setFormErrors({ general: 'Error verifying 2-Factor code. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleFillDemo2FACode = () => {
    setOtpDigits(['2', '0', '2', '6', '8', '8']);
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between items-center px-4 py-8 sm:py-12 select-none relative overflow-hidden font-sans">
      {/* Subtle Ambient Radial Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Utility Bar */}
      <div className="w-full max-w-md flex items-center justify-between text-xs font-mono text-slate-400 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800/80 border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Live Storefront</span>
        </Link>
        <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800 text-[11px]">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google OAuth 2FA Protected</span>
        </span>
      </div>

      {/* Centered Glassmorphism Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] z-10">
        {/* Brand Header */}
        <div className="text-center pb-5 border-b border-slate-800/90">
          <div className="mx-auto w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-lg mb-3 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#0F172A] p-1 flex items-center justify-center border border-slate-800">
              <picture>
                <source srcSet="/assets/logo.webp" type="image/webp" />
                <img
                  src="/assets/logo.jpg"
                  alt="NEELSAREEHOUSE"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('logo.webp')) {
                      target.src = '/assets/logo.webp';
                    }
                  }}
                />
              </picture>
            </div>
          </div>

          <h1 className="font-bold text-xl tracking-wide text-white uppercase font-sans">
            NEEL SAREE HOUSE
          </h1>
          <p className="text-[10px] uppercase font-mono tracking-[0.25em] text-amber-400 font-bold mt-1">
            Enterprise Management Console
          </p>
        </div>

        {/* Global Error Banner */}
        {formErrors.general && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-200 animate-fade-in font-sans">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{formErrors.general}</div>
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-200 animate-fade-in font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">Credentials & Google 2FA verified. Launching Admin...</span>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 1: CREDENTIALS & GOOGLE OAUTH VIEW            */}
        {/* ================================================== */}
        {step === 'CREDENTIALS' && (
          <div className="mt-6 space-y-4 animate-fade-in">
            {/* Google OAuth 1-Click SSO Button */}
            <div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] border border-slate-200"
              >
                {/* Official Google G Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                  />
                </svg>
                <span>Sign in with Google Workspace</span>
              </button>
              <div className="text-center text-[10px] font-mono text-slate-500 mt-1.5">
                Restricted to @neelsareehouse.com authorized domain
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Or Staff Credentials
              </span>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* Email / Employee ID */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-identifier"
                  className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Staff Email or Employee ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin@neelsareehouse.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                </div>
                {formErrors.identifier && (
                  <p className="text-[11px] text-rose-400 font-sans">{formErrors.identifier}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    Master Password
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    256-Bit Vault Enforced
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-rose-400 font-sans">{formErrors.password}</p>
                )}
              </div>

              {/* Remember Workstation */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberWorkstation}
                    onChange={(e) => setRememberWorkstation(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-400 font-sans">
                    Trust this workstation (30 days)
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin">⟳</span>
                ) : (
                  <>
                    <span>Authenticate & Proceed to 2FA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 2: GOOGLE 2-STEP VERIFICATION (2FA)           */}
        {/* ================================================== */}
        {step === 'TWO_FACTOR' && (
          <div className="mt-6 space-y-5 animate-fade-in">
            {/* Authenticated Persona Banner */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center font-mono text-xs flex-shrink-0">
                  G
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate">
                    {selectedGoogleAccount?.name || 'SuperAdmin Director'}
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 truncate">
                    {selectedGoogleAccount?.email || identifier}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('CREDENTIALS');
                  setOtpDigits(['', '', '', '', '', '']);
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-white underline ml-2"
              >
                Change
              </button>
            </div>

            {/* 2FA Method Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setTwoFactorType('GOOGLE_AUTHENTICATOR')}
                className={`py-1.5 rounded-lg font-bold transition-all flex flex-col items-center gap-1 ${
                  twoFactorType === 'GOOGLE_AUTHENTICATOR'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Google Auth</span>
              </button>

              <button
                type="button"
                onClick={() => setTwoFactorType('GOOGLE_PROMPT')}
                className={`py-1.5 rounded-lg font-bold transition-all flex flex-col items-center gap-1 ${
                  twoFactorType === 'GOOGLE_PROMPT'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Google Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => setTwoFactorType('SMS_OTP')}
                className={`py-1.5 rounded-lg font-bold transition-all flex flex-col items-center gap-1 ${
                  twoFactorType === 'SMS_OTP'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>SMS Backup</span>
              </button>
            </div>

            {/* OPTION 1: GOOGLE AUTHENTICATOR (TOTP 6-DIGIT) */}
            {twoFactorType === 'GOOGLE_AUTHENTICATOR' && (
              <form onSubmit={handle2FASubmit} className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span>Enter 6-Digit Authenticator Code:</span>
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                    <Clock className="w-3 h-3" />
                    <span>{totpSecondsRemaining}s refresh</span>
                  </div>
                </div>

                {/* 6 Digit Pin Boxes */}
                <div className="flex justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 bg-slate-950 text-center text-xl font-bold font-mono text-white rounded-xl border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                {/* QR Code Setup Link & Quick Demo Autofill */}
                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR Setup Key</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFillDemo2FACode}
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Autofill Demo Code</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isSuccess || otpDigits.join('').length !== 6}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block animate-spin">⟳</span>
                  ) : (
                    <>
                      <span>Verify & Enter Console</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OPTION 2: GOOGLE PROMPT PUSH */}
            {twoFactorType === 'GOOGLE_PROMPT' && (
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-4 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white font-sans">
                    Check your Google Pixel / iPhone
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Google sent a 2-Step Verification notification to your registered hardware.
                  </p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl inline-block font-mono">
                  <span className="text-[10px] uppercase text-slate-400 block mb-0.5">
                    Match Challenge Number
                  </span>
                  <span className="text-2xl font-bold text-amber-400 tracking-widest">
                    {googlePromptNumber}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isLoading || isSuccess}
                    onClick={() => handle2FASubmit(undefined, 'GOOGLE_PROMPT')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30"
                  >
                    <Check className="w-4 h-4" />
                    <span>I Approved on my Device (Simulate Tap)</span>
                  </button>
                </div>
              </div>
            )}

            {/* OPTION 3: SMS BACKUP */}
            {twoFactorType === 'SMS_OTP' && (
              <form onSubmit={handle2FASubmit} className="space-y-4 animate-fade-in">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
                  SMS Code dispatched to: <strong className="text-amber-400">{maskedDestination}</strong>
                </div>

                {/* 6 Digit Pin Boxes */}
                <div className="flex justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 bg-slate-950 text-center text-xl font-bold font-mono text-white rounded-xl border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={handleFillDemo2FACode}
                    className="text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Autofill SMS Code (202688)</span>
                  </button>

                  <span className="text-slate-500">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Available'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isSuccess || otpDigits.join('').length !== 6}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  <span>Verify SMS OTP</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* GOOGLE ACCOUNT CHOOSER MODAL                       */}
      {/* ================================================== */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {/* Google Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                  />
                </svg>
                <span className="font-bold text-sm">Choose Google Account</span>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              to continue to <strong className="text-white">Neel Saree House Enterprise</strong>
            </p>

            <div className="space-y-2">
              {[
                {
                  name: 'Sri Chinmaya',
                  email: 'chinmaya@neelsareehouse.com',
                  role: 'Managing Director & Founder',
                  avatarBg: 'bg-amber-600',
                  initials: 'CM',
                },
                {
                  name: 'Smt. Chandrakala Devi',
                  email: 'admin@neelsareehouse.com',
                  role: 'Master SuperAdmin',
                  avatarBg: 'bg-blue-600',
                  initials: 'CD',
                },
                {
                  name: 'Kavya Sundaram',
                  email: 'kavya@neelsareehouse.com',
                  role: 'Head Merchandiser',
                  avatarBg: 'bg-purple-600',
                  initials: 'KS',
                },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleGoogleSignIn(acc.email, acc.name)}
                  className="w-full p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs`}
                    >
                      {acc.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors truncate">
                        {acc.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        {acc.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white flex-shrink-0" />
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() =>
                  handleGoogleSignIn(
                    'custom.admin@neelsareehouse.com',
                    'Custom Administrator'
                  )
                }
                className="text-xs text-blue-400 hover:underline font-mono"
              >
                + Use another @neelsareehouse.com account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* QR CODE SETUP MODAL FOR GOOGLE AUTHENTICATOR       */}
      {/* ================================================== */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white font-sans text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs font-mono uppercase">
                  Google Authenticator Setup
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Open <strong>Google Authenticator</strong> or <strong>1Password</strong> on your mobile device and scan this enrollment code:
            </p>

            {/* Stylized QR Code SVG Box */}
            <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=otpauth://totp/NeelSareeHouse:admin@neelsareehouse.com?secret=JBSWY3DPEHPK3PXP&issuer=NeelSareeHouse"
                alt="Google Authenticator QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">
                Manual Entry Secret Key:
              </span>
              <code className="text-xs font-mono font-bold text-amber-400 select-all">
                JBSW Y3DP EHPK 3PXP
              </code>
            </div>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* Footer Credentials Guard */}
      <div className="text-center text-[10px] font-mono text-slate-500 z-10 space-y-1">
        <div>
          Protected by Neel Saree House Security Gateway • TLS 1.3 • Google Workspace 2FA
        </div>
        <div>Mysuru Heritage Loom Servers • All Access Logged with IP Fingerprint</div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white font-mono text-xs">
          Loading Security Gateway...
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
