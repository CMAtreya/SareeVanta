'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
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

  // Step 1 State: Credentials
  const [identifier, setIdentifier] = useState('admin@neelsareehouse.com');
  const [password, setPassword] = useState('Mysuru@2021');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberWorkstation, setRememberWorkstation] = useState(true);

  // Step 2 State: 2FA Screen
  const [step, setStep] = useState<'CREDENTIALS' | 'TWO_FACTOR'>('CREDENTIALS');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [maskedDestination, setMaskedDestination] = useState<string>('+91 ••••• ••482');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
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

  // Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side Zod validation
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

      if (data.requires2FA) {
        setTempToken(data.tempToken);
        setMaskedDestination(data.maskedDestination || '+91 ••••• ••482');
        setStep('TWO_FACTOR');
        setIsLoading(false);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        // Direct entry
        document.cookie = `neel_admin_session=authenticated; path=/; max-age=${rememberWorkstation ? 2592000 : 86400}; SameSite=Lax`;
        localStorage.setItem('neel_admin_session', JSON.stringify(data.user));
        setIsSuccess(true);
        setTimeout(() => router.replace(redirectUrl), 500);
      }
    } catch (err: any) {
      setFormErrors({ general: 'Network error communicating with auth gateway.' });
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

  // Step 2: Submit 2FA Code
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setFormErrors({ general: 'Please enter all 6 digits of the 2FA verification code.' });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          otp,
          rememberWorkstation,
          identifier,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormErrors({ general: data.message || 'Invalid or expired 2FA code.' });
        setIsLoading(false);
        return;
      }

      // Store auth session
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
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
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
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Restricted Admin Gateway</span>
        </span>
      </div>

      {/* Centered Glassmorphism Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] z-10">
        {/* Brand Header */}
        <div className="text-center pb-6 border-b border-slate-800/90">
          <div className="mx-auto w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-lg mb-3 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#0F172A] p-1 flex items-center justify-center border border-slate-800">
              <img
                src="/logo.png"
                alt="NEELSAREEHOUSE"
                className="w-full h-full object-contain"
              />
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
          <div className="mt-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-200 animate-fade-in font-sans">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{formErrors.general}</div>
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="mt-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-200 animate-fade-in font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">Credentials verified. Initializing secure workspace...</span>
          </div>
        )}

        {/* ================================================== */}
        {/* STEP 1: CREDENTIALS VIEW                           */}
        {/* ================================================== */}
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-4 animate-fade-in">
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
                  placeholder="admin@neelsareehouse.com or NSH-EMP-001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading || isSuccess}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    formErrors.identifier ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>
              {formErrors.identifier && (
                <p className="text-[11px] text-rose-400 font-mono">{formErrors.identifier}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-pass"
                className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider"
              >
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isSuccess}
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 font-sans transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    formErrors.password ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-[11px] text-rose-400 font-mono">{formErrors.password}</p>
              )}
            </div>

            {/* Remember Workstation for 30 Days */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberWorkstation}
                  onChange={(e) => setRememberWorkstation(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-950"
                />
                <span className="text-xs text-slate-300 font-sans">
                  Remember this workstation for 30 days
                </span>
              </label>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-sans text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Staff Credentials...</span>
                  </div>
                ) : (
                  <>
                    <span>Proceed to 2-Factor Authentication</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================================================== */}
        {/* STEP 2: 2-FACTOR AUTHENTICATION VIEW               */}
        {/* ================================================== */}
        {step === 'TWO_FACTOR' && (
          <form onSubmit={handle2FASubmit} className="mt-6 space-y-5 animate-fade-in">
            {/* Header info */}
            <div className="text-center space-y-1 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center mb-1.5 border border-blue-500/30">
                <Smartphone className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Enter 6-Digit 2FA Security Code</p>
              <p className="text-[11px] font-mono text-slate-400">
                Sent to: <span className="text-amber-300 font-semibold">{maskedDestination}</span>
              </p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div>
              <label className="block text-center text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-2 font-bold">
                Verification Code (TOTP / SMS)
              </label>
              <div className="flex items-center justify-center gap-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpInputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={isLoading || isSuccess}
                    className="w-11 h-12 text-center text-lg font-mono font-bold bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Helper shortcuts & Resend */}
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <button
                type="button"
                onClick={handleFillDemo2FACode}
                className="text-amber-400 hover:text-amber-300 underline font-semibold text-[11px]"
              >
                Fill Demo OTP (202688)
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={() => setResendCooldown(45)}
                className="text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-[11px]"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend OTP Code'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess || otpDigits.join('').length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-sans text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying 2FA Code...</span>
                  </div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify & Enter Console</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('CREDENTIALS')}
                className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-sans transition-colors"
              >
                ← Back to Credential Entry
              </button>
            </div>
          </form>
        )}

        {/* Security Footnote */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>FIPS-140 Level 3 Encrypted</span>
          </span>
          <span>Mysuru Salon Flagship Node</span>
        </div>
      </div>

      {/* Bottom Disclaimer */}
      <div className="w-full max-w-md text-center text-[11px] font-sans text-slate-500 mt-6 z-10">
        <p>© {new Date().getFullYear()} NEELSAREEHOUSE. Restricted internal staff portal.</p>
        <p className="text-[10px] font-mono text-slate-600 mt-0.5">
          All administrative sessions and IP logs are audited in compliance with CSB regulations.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
