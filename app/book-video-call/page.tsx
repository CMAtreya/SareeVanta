'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  User,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TIME_SLOTS = [
  '11:00 AM – 11:45 AM (IST)',
  '01:00 PM – 01:45 PM (IST)',
  '03:00 PM – 03:45 PM (IST)',
  '05:00 PM – 05:45 PM (IST)',
  '07:00 PM – 07:45 PM (IST)',
];

const WEAVE_PREFERENCES = [
  'Pure Mysore Silk Crepe (24K Gold Zari)',
  'Bridal Kanchipuram Korvai Temple Silks',
  'Banarasi Katan Silk with Meenakari',
  'Yeola Paithani Silk with Peacock Pallu',
  'Heritage Tissue & Organza Drapes',
  'Custom Wedding Trousseau Curation',
];

export default function BookVideoCallPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [selectedWeaves, setSelectedWeaves] = useState<string[]>([WEAVE_PREFERENCES[0]]);
  const [occasion, setOccasion] = useState('Wedding / Muhurtham');
  const [platform, setPlatform] = useState<'Google Meet' | 'WhatsApp Video'>('Google Meet');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tomorrow's date as min date
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 1. Check Authentication on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setCurrentUser(session.user);
          setName(session.user.user_metadata?.full_name || session.user.user_metadata?.name || '');
          setEmail(session.user.email || '');
          setPhone(session.user.phone || session.user.user_metadata?.phone || '');
        } else {
          // Check local stored session
          const storedUser = localStorage.getItem('sareevanta_user') || localStorage.getItem('neel_user_session');
          if (storedUser) {
            try {
              const parsed = JSON.parse(storedUser);
              setCurrentUser(parsed);
              setName(parsed.name || parsed.full_name || '');
              setEmail(parsed.email || '');
              setPhone(parsed.phone || '');
            } catch (e) {
              // fallback
            }
          }
        }
      } catch (err) {
        console.error('[BookVideoCall] Auth check error:', err);
      } finally {
        setAuthChecked(true);
      }
    }

    checkAuth();
  }, []);

  const toggleWeaveSelection = (weave: string) => {
    setSelectedWeaves((prev) =>
      prev.includes(weave) ? prev.filter((w) => w !== weave) : [...prev, weave]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setErrorMessage('You must be logged in to schedule a video appointment.');
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim() || !selectedDate || !selectedSlot) {
      setErrorMessage('Please fill in all mandatory fields (Name, Email, Phone, Date, and Slot).');
      return;
    }

    if (phone.trim().length < 10) {
      setErrorMessage('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/video-appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date: selectedDate,
          timeSlot: selectedSlot,
          weaves: selectedWeaves,
          occasion,
          platform,
          notes: notes.trim(),
          userId: currentUser?.id || currentUser?.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setConfirmedBooking(data.appointment || {
        id: `va-${Date.now()}`,
        customer_name: name,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        platform,
      });
    } catch (err: any) {
      console.error('[Video Appointment Error]:', err);
      setErrorMessage(err.message || 'An error occurred while booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E4] text-[#1F1B16]">
      {/* 1. Breadcrumbs */}
      <div className="bg-[#141210] text-[#FAF3E4]/80 text-xs py-3 border-b border-[#C87F4A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C87F4A]" />
          <span className="text-white font-medium">Video Shopping Concierge</span>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section className="bg-gradient-to-b from-[#141210] via-[#2A1117] to-[#141210] text-[#FAF3E4] py-14 sm:py-20 text-center px-4 border-b border-[#C87F4A]/30 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl mx-auto space-y-4 relative z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF3E4]/10 backdrop-blur-md border border-[#E2CE9F]/30 text-[#FAF3E4] text-[11px] font-mono font-bold uppercase tracking-[0.25em] shadow-sm">
            <Video className="w-3.5 h-3.5 text-[#C87F4A]" />
            <span>Virtual Loom Concierge</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal text-white leading-tight tracking-tight">
            Book a Personal Video Shopping Appointment
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 font-sans max-w-xl mx-auto leading-relaxed">
            Experience our royal Mysore Silk looms in high-definition. A dedicated Master Draper will showcase custom tested zari sarees live on camera for your special occasion.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-amber-200/90">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1-on-1 Confidential Viewing</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Real-time Drape & Texture Testing</span>
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Form Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {confirmedBooking ? (
          /* Booking Confirmation Screen */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C87F4A]/30 shadow-2xl space-y-6 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-[#7A1C30] text-white flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-9 h-9 text-amber-200" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C87F4A] font-bold block">
                Appointment Registered
              </span>
              <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#1F1B16]">
                Your Virtual Loom Session is Scheduled!
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-sans max-w-md mx-auto">
                Our Master Concierge has received your appointment request for{' '}
                <strong>{confirmedBooking.appointment_date}</strong> during the{' '}
                <strong>{confirmedBooking.time_slot}</strong> window.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF3E4]/70 border border-[#C87F4A]/25 max-w-md mx-auto text-left space-y-2 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-stone-500">Patron:</span>
                <span className="font-bold text-stone-900">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Phone Contact:</span>
                <span className="font-mono font-bold text-[#7A1C30]">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Platform:</span>
                <span className="font-bold text-stone-900">{platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status:</span>
                <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  PENDING CONFIRMATION
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 font-sans max-w-sm mx-auto">
              Our team will reach out via WhatsApp at <strong>{phone}</strong> with your official video invite link before the appointment.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#7A1C30] hover:bg-[#5F1424] text-white text-xs font-bold font-sans uppercase tracking-widest transition-all shadow-md"
              >
                Browse Saree Collections
              </Link>
              <a
                href={`https://wa.me/918212423344?text=Hello%20SareeVanta%2C%20I%20have%20scheduled%20a%20video%20call%20for%20${encodeURIComponent(
                  confirmedBooking.appointment_date
                )}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-stone-50 text-stone-800 border border-[#C87F4A]/30 text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Message Concierge on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C87F4A]/25 shadow-silk space-y-8">
            {/* Auth Gate Warning */}
            {authChecked && !currentUser && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-amber-950">
                      Patron Login Required
                    </h3>
                    <p className="text-[11px] sm:text-xs text-amber-800 font-sans">
                      Please log in or create an account to schedule video appointments with our master weavers.
                    </p>
                  </div>
                </div>

                <Link
                  href="/login?redirect=/book-video-call"
                  className="px-4 py-2 rounded-full bg-[#7A1C30] hover:bg-[#5F1424] text-white text-xs font-bold font-sans uppercase tracking-wider transition-all shadow-xs flex-shrink-0"
                >
                  Log In to Continue
                </Link>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-sans">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Patron Contact Details */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A1C30] block">
                  1. Patron Contact Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Smt. Ananya Rao"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50/60 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#7A1C30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50/60 border border-stone-200 rounded-2xl text-xs text-stone-900 font-mono focus:bg-white focus:outline-none focus:border-[#7A1C30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patron@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50/60 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#7A1C30]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Date & Time Slot Selection */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A1C30] block">
                  2. Select Consultation Date & Time
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        required
                        min={tomorrowStr}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50/60 border border-stone-200 rounded-2xl text-xs font-mono text-stone-900 focus:bg-white focus:outline-none focus:border-[#7A1C30]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Platform Preference *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Google Meet', 'WhatsApp Video'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(p)}
                          className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                            platform === p
                              ? 'border-[#7A1C30] bg-[#FAF3E4] text-[#7A1C30] shadow-2xs'
                              : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Select Available Time Slot (45-Minute Window) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'border-[#7A1C30] bg-[#FAF3E4] text-[#7A1C30] font-bold shadow-2xs ring-1 ring-[#7A1C30]'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-xs font-mono">{slot}</span>
                        {selectedSlot === slot && (
                          <CheckCircle2 className="w-4 h-4 text-[#7A1C30]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Weave & Occasion Preferences */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A1C30] block">
                  3. Weaves & Drape Interests
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WEAVE_PREFERENCES.map((w) => (
                    <label
                      key={w}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2.5 text-xs transition-all ${
                        selectedWeaves.includes(w)
                          ? 'border-[#7A1C30] bg-[#FAF3E4]/80 text-[#1F1B16] font-semibold shadow-2xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWeaves.includes(w)}
                        onChange={() => toggleWeaveSelection(w)}
                        className="rounded text-[#7A1C30] focus:ring-[#7A1C30]"
                      />
                      <span>{w}</span>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Occasion / Celebration Goal
                    </label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50/60 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none"
                    >
                      <option value="Wedding / Muhurtham">Wedding / Muhurtham</option>
                      <option value="Bridal Trousseau">Bridal Trousseau Curation</option>
                      <option value="Temple Festive & Pooja">Temple Festive & Pooja</option>
                      <option value="Reception / Evening Soirée">Reception / Evening Soirée</option>
                      <option value="Royal Heirloom Gifting">Royal Heirloom Gifting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Specific Colour or Motif Preferences (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Royal Maroon Mysore Silk with Gandaberunda motif"
                      className="w-full px-3 py-2.5 bg-stone-50/60 border border-stone-200 rounded-2xl text-xs text-stone-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={isSubmitting || (authChecked && !currentUser)}
                  className="w-full bg-[#7A1C30] hover:bg-[#5F1424] text-white py-4 rounded-2xl text-xs font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Reserving Loom Consultation Slot...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Confirm Video Shopping Appointment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
