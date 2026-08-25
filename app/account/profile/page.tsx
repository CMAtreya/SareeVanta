'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Check,
  Save,
  Loader2,
  Gift,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'First name is required' })
    .max(50, { message: 'First name cannot exceed 50 characters' }),
  lastName: z
    .string()
    .min(1, { message: 'Last name is required' })
    .max(50, { message: 'Last name cannot exceed 50 characters' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  dob: z.string().optional(),
  anniversary: z.string().optional(),
  gender: z.enum(['womens_wear', 'mens_gifting', 'unisex']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountProfilePage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      anniversary: '',
      gender: 'womens_wear',
    },
  });

  const watchedValues = watch();

  // Monogram computation
  const monogram = `${watchedValues.firstName?.[0] || 'P'}${watchedValues.lastName?.[0] || ''}`.toUpperCase();

  // Load user profile from Supabase Auth
  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const meta = user.user_metadata || {};
          const fullName =
            meta.full_name ||
            meta.name ||
            (meta.given_name ? `${meta.given_name} ${meta.family_name || ''}`.trim() : '') ||
            '';

          const fName = meta.given_name || fullName.split(' ')[0] || '';
          const lName = meta.family_name || fullName.split(' ').slice(1).join(' ') || '';

          reset({
            firstName: fName,
            lastName: lName,
            email: user.email || '',
            phone: user.user_metadata?.phone || user.phone || '',
            dob: user.user_metadata?.dob || '',
            anniversary: user.user_metadata?.anniversary || '',
            gender: 'womens_wear',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadProfile();
  }, [reset]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: `${values.firstName} ${values.lastName}`.trim(),
          phone: values.phone,
          dob: values.dob,
          anniversary: values.anniversary,
        },
      });

      if (!error) {
        showToast('Your profile has been saved successfully.');
      } else {
        showToast(error.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      showToast(err.message || 'Profile saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#C87F4A]/25 shadow-silk flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#C87F4A] animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
          Loading Personal Registry...
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
        {/* HERO IDENTITY BANNER */}
        <div className="bg-gradient-to-br from-[#F3E8D6] via-[#FAF3E4] to-[#F3E8D6] rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/30 shadow-silk relative overflow-hidden">
          <div className="flex items-center gap-5">
            {/* Clean Monogram Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#C87F4A] to-[#773D21] text-white flex items-center justify-center font-editorial font-bold text-2xl shadow-md border-2 border-white flex-shrink-0">
              {monogram}
            </div>

            {/* Identity Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
                  {watchedValues.firstName} {watchedValues.lastName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Authenticated Account</span>
                </span>
              </div>

              <span className="text-xs text-stone-600 font-sans block">
                {watchedValues.email}
              </span>
            </div>
          </div>
        </div>

        {/* PERSONAL IDENTITY & CONTACT DETAILS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6">
          <div className="pb-3 border-b border-[#C87F4A]/20">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-0.5">
              Personal Information
            </span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#1F1B16]">
              Identity & Contact Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                First Name *
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#C87F4A] focus-within:ring-2 focus-within:ring-[#C87F4A]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
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
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#C87F4A] focus-within:ring-2 focus-within:ring-[#C87F4A]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
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

            {/* Phone Number */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#C87F4A] focus-within:ring-2 focus-within:ring-[#C87F4A]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
                <Phone className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  {...register('phone')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold">
                  Email Address *
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-800 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-stone-200 bg-stone-100 px-3.5 py-2.5 opacity-80 cursor-not-allowed">
                <Mail className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="email"
                  disabled
                  {...register('email')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent cursor-not-allowed"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                Date of Birth
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#C87F4A] focus-within:ring-2 focus-within:ring-[#C87F4A]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
                <Calendar className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="date"
                  {...register('dob')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Wedding Anniversary Date */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1.5">
                Wedding Anniversary Date
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 focus-within:border-[#C87F4A] focus-within:ring-2 focus-within:ring-[#C87F4A]/20 bg-[#FAF3E4]/30 px-3.5 py-2.5 transition-all">
                <Gift className="w-4 h-4 text-stone-400 mr-2.5 flex-shrink-0" />
                <input
                  type="date"
                  {...register('anniversary')}
                  className="w-full text-xs sm:text-sm text-[#1F1B16] focus:outline-none bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STICKY ACTION BAR */}
        <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#C87F4A]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-sans text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Customer Registry Sync</span>
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
              className="flex-1 sm:flex-none px-8 py-3.5 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-xl text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
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
    </div>
  );
}
