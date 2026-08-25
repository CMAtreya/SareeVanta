'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Gift,
  Award,
  Crown,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Check,
  Scissors,
  Truck,
  MapPin,
} from 'lucide-react';
import GoogleAuthModal, { GoogleProfile } from '@/components/ecommerce/GoogleAuthModal';
import { createClient } from '@/lib/supabase/client';

function SignUpCardContent() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Mysuru');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [subscribeNews, setSubscribeNews] = useState(true);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackUrl = `${origin}/api/auth/callback?next=${encodeURIComponent('/account')}`;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Google sign in failed.' });
      setIsLoading(false);
    }
  };



  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculatePasswordStrength(password);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Strong', 'Unbreakable'];
  const strengthColors = ['bg-stone-300', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-[#7A1C30]'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setFeedback({ type: 'error', message: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    if (!email || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    if (!password || password.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    if (!agreeTerms) {
      setFeedback({ type: 'error', message: 'Please accept the Terms of Service to create an account.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
            city,
          },
        },
      });

      if (error) {
        setFeedback({ type: 'error', message: error.message || 'Registration failed. Please try again.' });
      } else {
        setFeedback({
          type: 'success',
          message: 'Account created successfully! Entering account area...',
        });
        setTimeout(() => router.push('/account'), 800);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Registration error.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E4] text-[#1F1B16] flex flex-col justify-between">
      {/* Top Heritage Navigation Bar */}
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
            <Crown className="w-3.5 h-3.5" />
            <span>Privilege Club Invitation</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl w-full bg-white rounded-3xl sm:rounded-[32px] border border-[#C87F4A]/30 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          {/* ========================================================= */}
          {/* LEFT COLUMN: PRIVILEGE GUILD PERKS & HERITAGE (5 Cols)   */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1F1B16] via-[#2A151C] to-[#1F1B16] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle Gold Shimmer Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,127,74,0.22),transparent_70%)] pointer-events-none" />

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

              <div className="pt-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C87F4A]/20 border border-[#C87F4A]/40 text-[10px] font-mono uppercase tracking-wider text-[#E2CE9F] font-bold mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Exclusive Welcome Privilege</span>
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Join the Neel Saree House Privilege Guild
                </h3>
                <p className="text-xs text-stone-300 font-sans mt-2 leading-relaxed">
                  Become a registered patron to receive privileged royal benefits, loom drop invites, and complimentary bespoke tailoring.
                </p>
              </div>
            </div>

            {/* Privilege Benefits Checklist */}
            <div className="relative z-10 my-6 space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-start gap-2.5 text-xs text-stone-200">
                <div className="w-5 h-5 rounded-full bg-[#C87F4A]/30 text-[#E2CE9F] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  <Gift className="w-3 h-3" />
                </div>
                <div>
                  <strong className="text-white block font-sans">10% Welcome Voucher (ROYAL10)</strong>
                  <span className="text-[11px] text-stone-400">Instantly credited to your first saree purchase.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-200">
                <div className="w-5 h-5 rounded-full bg-[#C87F4A]/30 text-[#E2CE9F] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  <Scissors className="w-3 h-3" />
                </div>
                <div>
                  <strong className="text-white block font-sans">Complimentary Fall & Pico Hemming</strong>
                  <span className="text-[11px] text-stone-400">Artisan hand-finished ready-to-drape sarees.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-stone-200">
                <div className="w-5 h-5 rounded-full bg-[#C87F4A]/30 text-[#E2CE9F] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                  <Truck className="w-3 h-3" />
                </div>
                <div>
                  <strong className="text-white block font-sans">Insured Express Global Delivery</strong>
                  <span className="text-[11px] text-stone-400">Complimentary on all orders above ₹10,000.</span>
                </div>
              </div>
            </div>

            {/* Authenticity Guarantee Footer */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-sans text-stone-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C87F4A]" />
                <span>Govt. Silk Mark Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#E2CE9F]" />
                <span>100% Pure Zari Looms</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: SIGN UP REGISTRATION FORM SALON (7 Cols)   */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
            <div>
              {/* Header Title + Sign In Link */}
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-5 border-b border-stone-100 gap-2">
                <div>
                  <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                    Create Your Account
                  </h1>
                  <p className="text-xs text-stone-500 font-sans mt-1">
                    Begin your handcrafted royal silk journey with us.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="text-xs font-sans font-bold text-[#7A1C30] hover:text-[#C87F4A] transition-colors inline-flex items-center gap-1 group flex-shrink-0"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
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

              {/* 1-Click Google OAuth Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
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
                <span>Sign up with Google Workspace</span>
              </button>

              {/* Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-stone-200" />
                <span className="absolute bg-white px-3 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                  or register with details below
                </span>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                    Full Legal Name
                  </label>
                  <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-white px-3.5 py-2.5 transition-all shadow-xs">
                    <User className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Shruti Krishnamurthy"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* 2-Col: Mobile Number & Preferred City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Mobile Number */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                      Mobile Number
                    </label>
                    <div className="flex rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-white overflow-hidden transition-all shadow-xs">
                      <span className="px-2.5 py-2.5 bg-[#FAF3E4] border-r border-stone-200 text-xs font-mono font-bold text-[#773D21] flex items-center">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9845012345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm text-[#1F1B16] font-mono focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Preferred City / Hub */}
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                      Primary Delivery City
                    </label>
                    <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-white px-3 py-2.5 transition-all shadow-xs">
                      <MapPin className="w-4 h-4 text-stone-400 mr-2 flex-shrink-0" />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent cursor-pointer font-sans"
                      >
                        <option value="Mysuru">Mysuru (Flagship Hub)</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="International">International (USA/UK/UAE)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-white px-3.5 py-2.5 transition-all shadow-xs">
                    <Mail className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                    <input
                      type="email"
                      placeholder="shruti.k@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Password + Strength Indicator */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                    Create Password
                  </label>
                  <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-white px-3.5 py-2.5 transition-all shadow-xs">
                    <Lock className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
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

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-stone-200 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 h-full rounded-full transition-all ${
                              strengthScore >= step ? strengthColors[strengthScore] : 'bg-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 font-bold">
                        {strengthLabels[strengthScore]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Privilege Checkboxes */}
                <div className="pt-2 space-y-2 text-xs">
                  {/* Voucher Auto-Claim */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setSubscribeNews(!subscribeNews)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        subscribeNews ? 'bg-[#7A1C30] border-[#7A1C30] text-white' : 'border-stone-300 bg-white'
                      }`}
                    >
                      {subscribeNews && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                    <span className="text-stone-700 font-sans">
                      Claim <strong className="text-[#7A1C30]">10% Welcome Voucher (ROYAL10)</strong> & VIP Loom Updates
                    </span>
                  </label>

                  {/* Terms & Privacy */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        agreeTerms ? 'bg-[#7A1C30] border-[#7A1C30] text-white' : 'border-stone-300 bg-white'
                      }`}
                    >
                      {agreeTerms && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </button>
                    <span className="text-stone-600 font-sans text-[11px]">
                      I agree to the{' '}
                      <span className="underline hover:text-[#7A1C30]">Terms of Service</span> &{' '}
                      <span className="underline hover:text-[#7A1C30]">Privacy Protocol</span>
                    </span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7A1C30] hover:bg-[#601625] text-white py-3.5 rounded-xl text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  <span>{isLoading ? 'Creating Heirloom Account...' : 'Create Account & Unlock 10% Off'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Bottom Footer Assurance */}
            <div className="pt-4 border-t border-stone-100 mt-5 text-center space-y-1.5">
              <p className="text-xs text-stone-600 font-sans">
                Already registered?{' '}
                <Link href="/login" className="font-bold text-[#7A1C30] hover:underline">
                  Sign In to your account →
                </Link>
              </p>
              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-stone-400">
                <span>🔒 256-Bit SSL Encrypted</span>
                <span>•</span>
                <span>Direct Weaver Provenance Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF3E4] flex items-center justify-center text-xs font-mono uppercase tracking-widest text-[#C87F4A]">
          Loading Privilege Guild Registration...
        </div>
      }
    >
      <SignUpCardContent />
    </Suspense>
  );
}
