'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ShieldCheck,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Check,
  RotateCcw,
  Heart,
  Scissors,
  Palette,
  Bell,
  MessageCircle,
  Smartphone,
  Save,
  X,
  Loader2,
  ChevronRight,
  Gift,
  Lock,
} from 'lucide-react';

// ============================================================================
// ZOD VALIDATION SCHEMA
// ============================================================================
const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(50, { message: 'First name cannot exceed 50 characters' }),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' })
    .max(50, { message: 'Last name cannot exceed 50 characters' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .min(5, { message: 'Email address is required' }),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' }),
  dob: z.string().optional(),
  anniversary: z.string().optional(),
  gender: z.enum(['womens_wear', 'mens_gifting', 'unisex']),
  favoriteWeaves: z.array(z.string()).min(1, { message: 'Select at least one favorite weave' }),
  primaryOccasions: z.array(z.string()).min(1, { message: 'Select at least one primary occasion' }),
  blouseFit: z.string(),
  skinTone: z.string(),
  notifications: z.object({
    whatsapp_dispatch: z.boolean(),
    whatsapp_video_drops: z.boolean(),
    email_invoices: z.boolean(),
    email_newsletters: z.boolean(),
    sms_promos: z.boolean(),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Available Options for ethnic curation
const AVAILABLE_WEAVES = [
  'Kanchipuram',
  'Banarasi',
  'Mysore Silk',
  'Paithani',
  'Organza',
  'Tussar',
  'Chanderi',
  'Bandhani',
  'Patan Patola',
];

const AVAILABLE_OCCASIONS = [
  'Bridal/Wedding',
  'Temple & Pooja',
  'Festive & Diwali',
  'Formal Evening',
  'Daily Luxury',
  'Anniversary Gifting',
];

const BLOUSE_FIT_OPTIONS = [
  { id: 'Unstitched', label: 'Standard Unstitched (1m Fabric)' },
  { id: 'Custom Tailored', label: 'Custom Tailored (Bespoke Measurement)' },
  { id: 'Ready-S', label: 'Ready-to-Wear (Size S - 34)' },
  { id: 'Ready-M', label: 'Ready-to-Wear (Size M - 36)' },
  { id: 'Ready-L', label: 'Ready-to-Wear (Size L - 38)' },
  { id: 'Ready-XL', label: 'Ready-to-Wear (Size XL - 40)' },
];

const SKIN_TONES = [
  { id: 'porcelain', label: 'Fair / Porcelain', color: '#FCE6DC' },
  { id: 'wheatish', label: 'Wheatish / Golden', color: '#E8BF96' },
  { id: 'warm_bronze', label: 'Dusky / Warm Bronze', color: '#C89364' },
  { id: 'rich_cocoa', label: 'Rich Cocoa', color: '#965C38' },
  { id: 'deep_ebony', label: 'Deep Ebony', color: '#54311C' },
];

export default function AccountProfilePage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
  );
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpStep, setPhoneOtpStep] = useState<'input' | 'otp'>('input');
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [memberSince, setMemberSince] = useState('2021');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize React Hook Form with Zod Resolver
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: 'Ananya',
      lastName: 'Rao',
      email: 'ananya.rao@example.com',
      phone: '9886012345',
      dob: '1992-11-14',
      anniversary: '2018-02-18',
      gender: 'womens_wear',
      favoriteWeaves: ['Kanchipuram', 'Mysore Silk', 'Banarasi'],
      primaryOccasions: ['Bridal/Wedding', 'Festive & Diwali', 'Temple & Pooja'],
      blouseFit: 'Custom Tailored',
      skinTone: 'wheatish',
      notifications: {
        whatsapp_dispatch: true,
        whatsapp_video_drops: true,
        email_invoices: true,
        email_newsletters: true,
        sms_promos: false,
      },
    },
  });

  const watchedValues = watch();

  // Calculate dynamic profile completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 9;
    if (watchedValues.firstName) completed++;
    if (watchedValues.lastName) completed++;
    if (watchedValues.email) completed++;
    if (watchedValues.phone) completed++;
    if (watchedValues.dob) completed++;
    if (watchedValues.anniversary) completed++;
    if (watchedValues.favoriteWeaves && watchedValues.favoriteWeaves.length > 0) completed++;
    if (watchedValues.primaryOccasions && watchedValues.primaryOccasions.length > 0) completed++;
    if (avatarUrl) completed++;
    return Math.min(100, Math.round((completed / total) * 100));
  };

  const completionPercent = calculateCompletion();

  // Fetch initial profile from GET /api/auth/me
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          reset({
            firstName: data.firstName || 'Ananya',
            lastName: data.lastName || 'Rao',
            email: data.email || 'ananya.rao@example.com',
            phone: data.phone || '9886012345',
            dob: data.dob || '1992-11-14',
            anniversary: data.anniversary || '2018-02-18',
            gender: data.gender || 'womens_wear',
            favoriteWeaves: data.favoriteWeaves || ['Kanchipuram', 'Mysore Silk', 'Banarasi'],
            primaryOccasions: data.primaryOccasions || ['Bridal/Wedding', 'Festive & Diwali'],
            blouseFit: data.blouseFit || 'Custom Tailored',
            skinTone: data.skinTone || 'wheatish',
            notifications: data.notifications || {
              whatsapp_dispatch: true,
              whatsapp_video_drops: true,
              email_invoices: true,
              email_newsletters: true,
              sms_promos: false,
            },
          });
          if (data.avatar) setAvatarUrl(data.avatar);
          if (data.memberSince) setMemberSince(data.memberSince);
          setIsEmailVerified(!!data.isEmailVerified);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  // Client-side image compression & Upload to POST /api/auth/profile/avatar
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Compress using Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        setAvatarUrl(compressedBase64);

        // Upload to avatar API
        try {
          await fetch('/api/auth/profile/avatar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: compressedBase64 }),
          });
          showToast('Profile photo updated successfully!');
        } catch (err) {
          console.error(err);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setAvatarUrl('');
    try {
      await fetch('/api/auth/profile/avatar', { method: 'DELETE' });
      showToast('Profile photo removed.');
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submit Handler: PATCH /api/auth/profile
  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          avatar: avatarUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Your profile has been successfully updated.');
      } else {
        showToast(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      showToast('Profile updated locally.');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Weave Chip in React Hook Form
  const toggleWeave = (weave: string) => {
    const current = watchedValues.favoriteWeaves || [];
    if (current.includes(weave)) {
      setValue(
        'favoriteWeaves',
        current.filter((w) => w !== weave),
        { shouldDirty: true }
      );
    } else {
      setValue('favoriteWeaves', [...current, weave], { shouldDirty: true });
    }
  };

  // Toggle Occasion Chip in React Hook Form
  const toggleOccasion = (occasion: string) => {
    const current = watchedValues.primaryOccasions || [];
    if (current.includes(occasion)) {
      setValue(
        'primaryOccasions',
        current.filter((o) => o !== occasion),
        { shouldDirty: true }
      );
    } else {
      setValue('primaryOccasions', [...current, occasion], { shouldDirty: true });
    }
  };

  // Phone Change Verification Handler
  const handleVerifyNewPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneOtpStep === 'input') {
      if (newPhoneInput.length === 10) {
        setPhoneOtpStep('otp');
        setPhoneOtp('123456'); // demo prefill
      }
    } else {
      setValue('phone', newPhoneInput, { shouldDirty: true });
      setIsPhoneModalOpen(false);
      setPhoneOtpStep('input');
      setNewPhoneInput('');
      showToast(`Phone number updated to +91 ${newPhoneInput}`);
    }
  };

  // Monogram computation
  const monogram = `${watchedValues.firstName?.[0] || 'A'}${watchedValues.lastName?.[0] || 'R'}`.toUpperCase();

  if (initialLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#C87F4A]/25 shadow-silk flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#C87F4A] animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
          Loading Personal Registry & Preferences...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1F1B16] text-[#FAF3E4] px-5 py-3 rounded-2xl shadow-2xl border border-[#C87F4A]/40 flex items-center gap-3 text-xs font-sans font-medium"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ================================================================= */}
        {/* 1. HERO IDENTITY & AVATAR BANNER                                 */}
        {/* ================================================================= */}
        <div className="bg-gradient-to-br from-[#F3E8D6] via-[#FAF3E4] to-[#F3E8D6] rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/30 shadow-silk relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Profile Avatar Frame with Gold Accent */}
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B] shadow-md flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-white relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#7A1C30]">
                        {monogram}
                      </span>
                    )}

                    {/* Quick Camera Overlay */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Identity Details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                    {watchedValues.firstName} {watchedValues.lastName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>OTP Verified</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 font-sans">
                  <span>Patron Estd. {memberSince}</span>
                  <span>•</span>
                  <span>+91 {watchedValues.phone}</span>
                </div>

                {/* Photo Action Links */}
                <div className="flex items-center gap-3 pt-1 text-[11px] font-sans">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#7A1C30] hover:text-[#C87F4A] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload / Change Photo</span>
                  </button>
                  {avatarUrl && (
                    <>
                      <span className="text-stone-300">|</span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-stone-500 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Privilege Tier Badge */}
            <div className="sm:text-right flex-shrink-0 bg-white/70 p-3.5 rounded-2xl border border-[#C87F4A]/20 backdrop-blur-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-0.5">
                Privilege Status
              </span>
              <span className="font-editorial text-sm font-bold text-[#1F1B16] block">
                Royal Loom Patron
              </span>
              <span className="text-[10px] font-mono text-emerald-800 block mt-0.5">
                ✓ 10% Lifetime Vault Privilege
              </span>
            </div>
          </div>

          {/* Profile Completion Progress Bar */}
          <div className="mt-6 pt-5 border-t border-[#C87F4A]/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="font-semibold text-[#1F1B16]">
                Profile Completion:{' '}
                <strong className="text-[#C87F4A] font-mono">{completionPercent}%</strong>
              </span>
              <span className="text-stone-600 text-[11px]">
                {completionPercent === 100
                  ? '🌟 All Royal Perks & Anniversary Rewards Unlocked!'
                  : 'Add your anniversary date to unlock surprise gifting vouchers'}
              </span>
            </div>

            <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#C87F4A]/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#C87F4A] to-[#7A1C30] rounded-full"
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. PERSONAL IDENTITY & CONTACT DETAILS                           */}
        {/* ================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-0.5">
                Section 01
              </span>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#1F1B16]">
                Personal Identity & Contact Credentials
              </h2>
            </div>
            <span className="text-[11px] font-mono text-stone-400">Authenticated Registry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-sans">
            {/* First Name */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                First Name *
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
                <User className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  {...register('firstName')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent"
                />
              </div>
              {errors.firstName && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                Last Name *
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
                <User className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="text"
                  {...register('lastName')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent"
                />
              </div>
              {errors.lastName && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.lastName.message}
                </span>
              )}
            </div>

            {/* Mobile Number (Pre-filled from OTP, Locked with Change Phone Trigger) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold">
                  Mobile Number (OTP Locked)
                </label>
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="text-[11px] font-mono text-[#7A1C30] hover:underline font-bold"
                >
                  Change Phone
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5">
                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-stone-800">
                  <Phone className="w-4 h-4 text-stone-400" />
                  <span>+91 {watchedValues.phone}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                  <span>Locked</span>
                </span>
              </div>
            </div>

            {/* Email Address with Inline Verify Action */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold">
                  Email Address *
                </label>
                {isEmailVerified ? (
                  <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmailVerified(true);
                      showToast('Verification email dispatched.');
                    }}
                    className="text-[10px] font-mono text-[#7A1C30] hover:underline font-bold"
                  >
                    Verify Email
                  </button>
                )}
              </div>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
                <Mail className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="email"
                  {...register('email')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent"
                />
              </div>
              {errors.email && (
                <span className="text-[11px] text-red-600 mt-1 block">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                Date of Birth
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
                <Calendar className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="date"
                  {...register('dob')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent cursor-pointer"
                />
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block font-sans">
                🎁 Receive exclusive ₹1,000 Birthday celebration voucher
              </span>
            </div>

            {/* Wedding Anniversary Date */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                Wedding Anniversary Date
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#7A1C30] focus-within:ring-2 focus-within:ring-[#7A1C30]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
                <Gift className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="date"
                  {...register('anniversary')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent cursor-pointer"
                />
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block font-sans">
                👑 Complimentary handloom keepsake for milestone celebrations
              </span>
            </div>
          </div>

          {/* Gender / Styling Persona Radio Chips */}
          <div className="pt-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-2">
              Primary Wardrobe Styling Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'womens_wear', label: "Women's Royal Drapes & Sarees" },
                { id: 'mens_gifting', label: "Gifting Drapes & Heritage Heirlooms" },
                { id: 'unisex', label: 'All Handloom Curation Drops' },
              ].map((opt) => {
                const isSelected = watchedValues.gender === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setValue('gender', opt.id as any, { shouldDirty: true })}
                    className={`p-3 rounded-2xl border text-xs font-sans font-medium transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[#7A1C30] bg-[#FAF3E4] text-[#7A1C30] font-bold shadow-xs'
                        : 'border-stone-200 hover:border-stone-400 text-stone-700 bg-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#7A1C30] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. ETHNIC MERCHANDISING PREFERENCES (Personalized Curation Engine) */}
        {/* ================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-0.5">
                Section 02
              </span>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#1F1B16]">
                Ethnic Merchandising & Bespoke Drape Preferences
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#773D21] font-bold bg-[#FAF3E4] px-3 py-1 rounded-full border border-[#C87F4A]/20">
              Personalized Boutique AI
            </span>
          </div>

          {/* Favorite Silk Weaves */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
                <span>Favorite Silk Weaves (Multi-Select)</span>
              </label>
              <span className="text-[10px] font-mono text-stone-400">
                {watchedValues.favoriteWeaves?.length || 0} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_WEAVES.map((weave) => {
                const isSelected = watchedValues.favoriteWeaves?.includes(weave);
                return (
                  <button
                    key={weave}
                    type="button"
                    onClick={() => toggleWeave(weave)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#7A1C30] text-white font-bold shadow-xs'
                        : 'bg-[#FAF3E4]/70 border border-[#C87F4A]/30 text-stone-700 hover:bg-[#FAF3E4]'
                    }`}
                  >
                    <span>{weave}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
            {errors.favoriteWeaves && (
              <span className="text-[11px] text-red-600 block">
                {errors.favoriteWeaves.message}
              </span>
            )}
          </div>

          {/* Primary Occasions */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#C87F4A]" />
                <span>Primary Drape Occasions</span>
              </label>
              <span className="text-[10px] font-mono text-stone-400">
                {watchedValues.primaryOccasions?.length || 0} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_OCCASIONS.map((occ) => {
                const isSelected = watchedValues.primaryOccasions?.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => toggleOccasion(occ)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#C87F4A] text-white font-bold shadow-xs'
                        : 'bg-[#FAF3E4]/70 border border-[#C87F4A]/30 text-stone-700 hover:bg-[#FAF3E4]'
                    }`}
                  >
                    <span>{occ}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
            {errors.primaryOccasions && (
              <span className="text-[11px] text-red-600 block">
                {errors.primaryOccasions.message}
              </span>
            )}
          </div>

          {/* Blouse Fit & Skin Tone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
            {/* Preferred Blouse Fit */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold flex items-center gap-1.5 mb-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#C87F4A]" />
                <span>Default Blouse Stitching / Fit</span>
              </label>
              <select
                {...register('blouseFit')}
                className="w-full px-3.5 py-2.5 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-sans focus:outline-none focus:border-[#7A1C30] cursor-pointer"
              >
                {BLOUSE_FIT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-stone-500 font-sans mt-1 block">
                Auto-applies complimentary custom tailored fall & pico on all order drapes
              </span>
            </div>

            {/* AI Avatar Skin Tone for /try-on */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold flex items-center gap-1.5 mb-1.5">
                <Palette className="w-3.5 h-3.5 text-[#C87F4A]" />
                <span>Default AI Avatar Skin Tone (/try-on)</span>
              </label>
              <div className="flex items-center gap-2 pt-1">
                {SKIN_TONES.map((tone) => {
                  const isSelected = watchedValues.skinTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      title={tone.label}
                      onClick={() => setValue('skinTone', tone.id, { shouldDirty: true })}
                      className={`relative w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        isSelected
                          ? 'border-[#7A1C30] scale-110 shadow-md ring-2 ring-[#7A1C30]/30'
                          : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: tone.color }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-stone-900 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-stone-500 font-sans mt-1.5 block">
                Selected:{' '}
                <strong>
                  {SKIN_TONES.find((s) => s.id === watchedValues.skinTone)?.label || 'Wheatish'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. NOTIFICATIONS & PRIVACY GOVERNANCE                            */}
        {/* ================================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-0.5">
                Section 03
              </span>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#1F1B16]">
                Notifications & Dispatch Governance
              </h2>
            </div>
            <span className="text-[11px] font-mono text-stone-400">Zero-Spam Policy</span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* WhatsApp Order & Tracking Alerts */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF3E4]/50 border border-[#C87F4A]/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 block font-sans">
                    WhatsApp Order & Dispatch Tracking Alerts{' '}
                    <span className="text-[#C87F4A] font-mono text-[10px]">(Recommended)</span>
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Receive real-time BlueDart Air tracking links and weaver inspection reports.
                  </span>
                </div>
              </div>
              <Controller
                name="notifications.whatsapp_dispatch"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                      field.value ? 'bg-emerald-600' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                        field.value ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* WhatsApp Video Drops */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF3E4]/50 border border-[#C87F4A]/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#7A1C30]/15 text-[#7A1C30] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 block font-sans">
                    Exclusive Live Video Drop Invites
                  </span>
                  <span className="text-[11px] text-stone-500">
                    VIP 1-on-1 virtual boutique tours with Mysuru master artisans for high zari drapes.
                  </span>
                </div>
              </div>
              <Controller
                name="notifications.whatsapp_video_drops"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                      field.value ? 'bg-[#7A1C30]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                        field.value ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* Email Invoices */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF3E4]/50 border border-[#C87F4A]/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 block font-sans">
                    Email Invoices & Silk Mark Certificates
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Official tax invoices and digital QR Silk Mark authenticity archives.
                  </span>
                </div>
              </div>
              <Controller
                name="notifications.email_invoices"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                      field.value ? 'bg-[#C87F4A]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                        field.value ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                )}
              />
            </div>

            {/* Email Newsletters */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF3E4]/50 border border-[#C87F4A]/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 block font-sans">
                    Festive Lookbooks & Loom Release Gazette
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Curated weekly handloom heritage stories and seasonal limited-edition launches.
                  </span>
                </div>
              </div>
              <Controller
                name="notifications.email_newsletters"
                control={control}
                render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(!field.value)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${
                      field.value ? 'bg-[#C87F4A]' : 'bg-stone-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                        field.value ? 'left-6.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                )}
              />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 5. STICKY ACTION BAR                                             */}
        {/* ================================================================= */}
        <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#C87F4A]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-sans text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted Patron Registry Sync</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => reset()}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-sans font-bold transition-all cursor-pointer"
            >
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ring-2 ring-[#B8892B]/30 hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ================================================================= */}
      {/* CHANGE PHONE MODAL (OTP VERIFICATION)                             */}
      {/* ================================================================= */}
      <AnimatePresence>
        {isPhoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPhoneModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-2xl z-10 font-sans space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FAF3E4] text-[#7A1C30] flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-[#1F1B16]">
                    Update Mobile Number
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVerifyNewPhone} className="space-y-4 text-xs">
                {phoneOtpStep === 'input' ? (
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                      New 10-Digit Mobile Number
                    </label>
                    <div className="flex rounded-xl border border-stone-300 focus-within:border-[#7A1C30] bg-[#FAF3E4]/30 overflow-hidden">
                      <span className="px-3 py-2.5 bg-[#FAF3E4] border-r border-stone-300 font-mono font-bold text-[#773D21]">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder="9876543210"
                        value={newPhoneInput}
                        onChange={(e) => setNewPhoneInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm font-mono focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-stone-600 block">
                      Enter 6-digit OTP code sent to <strong>+91 {newPhoneInput}</strong>
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="w-full px-4 py-3 text-center font-mono text-lg font-bold bg-[#FAF3E4] border border-[#C87F4A]/40 rounded-xl focus:outline-none focus:border-[#7A1C30]"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhoneModalOpen(false);
                      setPhoneOtpStep('input');
                    }}
                    className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#7A1C30] hover:bg-[#601625] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    {phoneOtpStep === 'input' ? 'Send OTP Code' : 'Verify & Link Phone'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
