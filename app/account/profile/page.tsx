'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  CheckCircle2,
  Bell,
  MessageSquare,
  ShieldCheck,
  Save,
  Sparkles,
} from 'lucide-react';

export default function AccountProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Ananya S. Rao',
    email: 'ananya.rao@example.com',
    phone: '+91 98860 12345',
    phone_verified: true,
    tier: 'Royal Loom Patron',
    member_since: 'October 2021',
  });

  const [notifications, setNotifications] = useState({
    whatsapp_dispatch: true,
    email_invoices: true,
    festive_early_access: true,
    sms_delivery_otp: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name,
            email: data.email,
            phone: data.phone,
            phone_verified: data.phone_verified,
            tier: data.tier,
            member_since: data.member_since,
          });
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block mb-1">
            Personal Registry
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16]">
            Profile & Notifications
          </h1>
          <span className="text-xs text-stone-500 font-sans block mt-1">
            Manage your authenticated patron credentials and real-time dispatch alerts.
          </span>
        </div>

        <span className="text-xs font-mono text-[#773D21] bg-[#FAF3E4] border border-[#C87F4A]/30 px-3 py-1.5 rounded-full font-semibold hidden sm:inline-block">
          Patron Estd. {profile.member_since}
        </span>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6 text-xs font-sans">
          <h2 className="font-editorial text-xl font-bold text-[#1F1B16] pb-3 border-b border-[#C87F4A]/20">
            Account Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-3 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-3 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Primary Mobile Number</label>
            <div className="relative flex items-center">
              <input
                type="tel"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full pl-9 pr-28 py-3 bg-[#FAF3E4]/50 border border-stone-300 rounded-xl text-xs font-mono"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />

              {/* Verified Badge */}
              <div className="absolute right-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
              </div>
            </div>
            <span className="text-[11px] text-stone-400 font-sans mt-1 block">
              Used for instant BlueDart delivery OTP and WhatsApp dispatch tracking.
            </span>
          </div>
        </div>

        {/* Notification Preferences Toggle Group */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C87F4A]/25 shadow-silk space-y-6 text-xs font-sans">
          <h2 className="font-editorial text-xl font-bold text-[#1F1B16] pb-3 border-b border-[#C87F4A]/20">
            Dispatch & Communication Preferences
          </h2>

          <div className="divide-y divide-stone-100 space-y-4">
            {/* 1. WhatsApp Dispatch */}
            <div className="pt-4 first:pt-0 flex items-center justify-between">
              <div className="space-y-0.5 max-w-md">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-sm text-[#1F1B16]">
                    WhatsApp Live Dispatch Updates
                  </span>
                </div>
                <p className="text-stone-500 text-xs">
                  Receive live BlueDart tracking links and delivery executive contact directly on WhatsApp.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleNotification('whatsapp_dispatch')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  notifications.whatsapp_dispatch ? 'bg-[#C87F4A]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.whatsapp_dispatch ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2. Email Invoices */}
            <div className="pt-4 flex items-center justify-between">
              <div className="space-y-0.5 max-w-md">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C87F4A]" />
                  <span className="font-bold text-sm text-[#1F1B16]">
                    Email Invoices & Silk Mark Certificates
                  </span>
                </div>
                <p className="text-stone-500 text-xs">
                  Receive official GST invoices, certificates of origin, and care guides via email.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleNotification('email_invoices')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  notifications.email_invoices ? 'bg-[#C87F4A]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.email_invoices ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Festive Early Access */}
            <div className="pt-4 flex items-center justify-between">
              <div className="space-y-0.5 max-w-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B8892B]" />
                  <span className="font-bold text-sm text-[#1F1B16]">
                    Festive Loom Previews & VIP Salons
                  </span>
                </div>
                <p className="text-stone-500 text-xs">
                  Early 24-hour access to Mysore Dasara, Diwali, and Wedding Trousseau releases.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleNotification('festive_early_access')}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  notifications.festive_early_access ? 'bg-[#C87F4A]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    notifications.festive_early_access ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile Preferences Updated Successfully!</span>
            </span>
          )}

          <button
            type="submit"
            className="ml-auto px-6 py-3.5 bg-[#C87F4A] hover:bg-[#B36737] text-white rounded-sm text-xs font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
