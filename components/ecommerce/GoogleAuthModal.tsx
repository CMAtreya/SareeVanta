'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export interface GoogleProfile {
  name: string;
  email: string;
  avatar: string;
  role?: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleProfile) => void;
  title?: string;
  subtitle?: string;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
  title = 'Choose an account',
  subtitle = 'to continue to Neel Saree House',
}: GoogleAuthModalProps) {
  const defaultAccounts: GoogleProfile[] = [
    {
      name: 'Sri Chinmaya',
      email: 'chinmaya.m@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      role: 'Royal Patron',
    },
    {
      name: 'Ananya S. Rao',
      email: 'ananya.rao@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      role: 'VIP Collector',
    },
    {
      name: 'Kavya Sundaram',
      email: 'kavya.sundaram@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      role: 'Privilege Guild Member',
    },
  ];

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (account: GoogleProfile) => {
    setLoadingEmail(account.email);
    setTimeout(() => {
      onSelectAccount(account);
      setLoadingEmail(null);
    }, 450);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const profile: GoogleProfile = {
      name: customName || customEmail.split('@')[0],
      email: customEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customName || customEmail)}&background=7A1C30&color=FAF3E4`,
    };
    handleSelect(profile);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 font-sans"
        >
          {/* Google Top Bar */}
          <div className="p-6 pb-4 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="text-xs font-medium text-stone-600">Sign in with Google</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 pt-5">
            {/* Header Text */}
            <div className="mb-5">
              <h3 className="text-lg font-bold text-stone-900">{title}</h3>
              <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
            </div>

            {!isCustomMode ? (
              <div className="space-y-2">
                {defaultAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={!!loadingEmail}
                    onClick={() => handleSelect(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-200 hover:border-[#7A1C30] hover:bg-[#FAF3E4]/50 transition-all text-left group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-9 h-9 rounded-full object-cover border border-stone-200 flex-shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-stone-900 group-hover:text-[#7A1C30] transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">{acc.email}</div>
                      </div>
                    </div>

                    {loadingEmail === acc.email ? (
                      <Loader2 className="w-4 h-4 text-[#7A1C30] animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#7A1C30] group-hover:translate-x-0.5 transition-all" />
                    )}
                  </button>
                ))}

                {/* Use Another Account Button */}
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-left text-xs font-medium text-stone-700 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 flex-shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span>Use another Google account</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                    Google Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Smt. Radhika Sharma"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#7A1C30]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-700 font-bold block mb-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="radhika.sharma@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#7A1C30]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="flex-1 py-2.5 border border-stone-300 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#7A1C30] hover:bg-[#601625] text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Google Notice Disclaimer */}
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-start gap-2 text-[10px] text-stone-500 leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C87F4A] flex-shrink-0 mt-0.5" />
              <span>
                To continue, Google will share your name, email address, and language preference with Neel Saree House.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
