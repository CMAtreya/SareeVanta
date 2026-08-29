'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Instagram,
  Facebook,
  Youtube,
} from 'lucide-react';

import { useBrand } from '@/context/BrandContext';

export default function Footer() {
  const { brandName, brandUpper, brand } = useBrand();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-[#1C1A18] text-[#FAF3E4] border-t border-[#C87F4A]/30 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Four Authenticity & Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-16 border-b border-stone-800">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-[#C87F4A]/20 flex items-center justify-center flex-shrink-0 text-[#C87F4A]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-editorial text-lg font-semibold text-white">
                100% Silk Mark India
              </h4>
              <p className="text-xs text-stone-400 mt-1 font-sans leading-relaxed">
                Govt. certified pure natural mulberry silk filaments with tested authentic zari.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-[#B8892B]/20 flex items-center justify-center flex-shrink-0 text-[#B8892B]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-editorial text-lg font-semibold text-white">
                Loom-to-Drape Provenance
              </h4>
              <p className="text-xs text-stone-400 mt-1 font-sans leading-relaxed">
                Direct master weaver traceability across Mysuru, Kanchipuram, and Varanasi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-[#C87F4A]/20 flex items-center justify-center flex-shrink-0 text-[#C87F4A]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-editorial text-lg font-semibold text-white">
                Free Fall & Pico Service
              </h4>
              <p className="text-xs text-stone-400 mt-1 font-sans leading-relaxed">
                Complimentary pre-stitching and tassels ready for wear on every order.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-[#B8892B]/20 flex items-center justify-center flex-shrink-0 text-[#B8892B]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-editorial text-lg font-semibold text-white">
                Worldwide Express
              </h4>
              <p className="text-xs text-stone-400 mt-1 font-sans leading-relaxed">
                Insured priority dispatch to 45+ countries with real-time tracking.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Main Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-16 border-b border-stone-800">
          {/* Brand & Mysuru Heritage Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B]">
                <picture>
                  <source srcSet="/assets/logo.webp" type="image/webp" />
                  <img
                    src="/assets/logo.jpg"
                    alt={`${brandName} Logo`}
                    className="w-full h-full object-cover bg-[#FAF3E4] rounded-full p-0.5"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('logo.webp')) {
                        target.src = '/assets/logo.webp';
                      }
                    }}
                  />
                </picture>
              </div>
              <div>
                <h3 className="font-editorial text-2xl font-bold tracking-tight text-white uppercase">
                  {brandUpper}
                </h3>
                <span className="text-[9px] tracking-[0.28em] uppercase text-[#C87F4A] font-mono block">
                  A MYSURU ROYAL PRODUCT
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-400 max-w-sm font-sans leading-relaxed">
              Curators of authentic handloom silk sarees since 2021. Dedicated to preserving the royal weaving traditions of Mysuru and South India.
            </p>

            <div className="pt-2 space-y-2 text-xs text-stone-300 font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C87F4A] flex-shrink-0 mt-0.5" />
                <span>Flagship Store: Sayyaji Rao Road, Near Royal Palace, Mysuru 570001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
                <span>VIP Concierge: +91 821 242 3344</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
                <span>concierge@{brand === 'sareevanta' ? 'sareevanta.com' : 'neelsareehouse.com'}</span>
              </div>
            </div>
          </div>

          {/* Shop Shortcuts */}
          <div>
            <h4 className="font-editorial text-sm font-bold uppercase tracking-widest text-[#C87F4A] mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 font-sans">
              <li>
                <Link href="/products?weave=Mysore+Silk" className="hover:text-white transition-colors">
                  Mysore Silk
                </Link>
              </li>
              <li>
                <Link href="/products?weave=Kanchipuram" className="hover:text-white transition-colors">
                  Kanchipuram Brocades
                </Link>
              </li>
              <li>
                <Link href="/products?weave=Banarasi" className="hover:text-white transition-colors">
                  Banarasi Katan Silk
                </Link>
              </li>
              <li>
                <Link href="/products?weave=Paithani" className="hover:text-white transition-colors">
                  Paithani Treasures
                </Link>
              </li>
              <li>
                <Link href="/products?filter=bridal" className="hover:text-white transition-colors">
                  Bridal Muhurtham Trousseau
                </Link>
              </li>
              <li>
                <Link href="/products?filter=new" className="hover:text-white transition-colors">
                  New Loom Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Heritage & Direct Craft */}
          <div>
            <h4 className="font-editorial text-sm font-bold uppercase tracking-widest text-[#C87F4A] mb-4">
              Heritage & Craft
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 font-sans">
              <li>
                <Link href="/our-story" className="hover:text-white transition-colors">
                  Our Royal Legacy
                </Link>
              </li>
              <li>
                <Link href="/silk-mark" className="hover:text-white transition-colors">
                  Central Silk Board Mark
                </Link>
              </li>
              <li>
                <Link href="/visit-us" className="hover:text-white transition-colors">
                  Visit Mysuru Flagship
                </Link>
              </li>
              <li>
                <Link href="/our-story#craftsmanship" className="hover:text-white transition-colors">
                  24K Tested Zari Purity
                </Link>
              </li>
              <li>
                <Link href="/our-story#artisans" className="hover:text-white transition-colors">
                  Master Weavers Guild
                </Link>
              </li>
            </ul>
          </div>

          {/* Patron Services & Newsletter */}
          <div className="space-y-4">
            <h4 className="font-editorial text-sm font-bold uppercase tracking-widest text-[#C87F4A] mb-4">
              VIP Patron Concierge
            </h4>
            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              Subscribe to receive private preview access to newly released loom masterworks.
            </p>

            {subscribed ? (
              <div className="p-3 bg-[#C87F4A]/10 border border-[#C87F4A]/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Thank you for joining our royal inner circle.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C87F4A] pr-10 font-sans"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bg-[#C87F4A] hover:bg-[#B36737] text-white p-1.5 rounded-md transition-colors"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-5">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#C87F4A] flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#C87F4A] flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#C87F4A] flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-sans gap-4">
          <p>© {new Date().getFullYear()} {brandName} Mysuru Pvt. Ltd. All Rights Reserved.</p>
          <div className="flex space-x-6 text-[11px]">
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/silk-mark" className="hover:text-stone-300 transition-colors">
              Silk Mark Verification
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
