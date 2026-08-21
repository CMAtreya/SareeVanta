'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <footer
      id="journal"
      className="bg-[#151413] text-[#FAF3E4] border-t border-[#C87F4A]/30 pt-16 sm:pt-20 pb-12"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
        {/* Flagship Salon Showcase Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#24201E] to-[#1C1A18] border border-[#C87F4A]/30 p-6 sm:p-10 mb-16 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C87F4A] font-semibold mb-2 font-mono">
                <MapPin className="w-3.5 h-3.5" />
                <span>Mysuru Heritage Flagship Destination</span>
              </div>
              <h3 className="font-editorial text-2xl sm:text-3xl text-white font-medium mb-3">
                Visit the Neelsareehouse Salon
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl mb-4 font-sans">
                Step into our heritage salon in the royal city of Mysuru. Experience over 600 curated silk drapes unfolded by master curators in private bridal styling suites.
              </p>
              <div className="space-y-1 text-xs text-stone-400 font-sans">
                <p className="text-white font-medium">
                  #104/A, Sayyaji Rao Road, Opp. Royal Palace North Gate, Mysuru, Karnataka 570001
                </p>
                <p>Monday – Sunday: 10:30 AM – 8:30 PM IST</p>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col sm:flex-row gap-3">
              <Link
                href="/visit-us"
                className="flex-1 bg-[#C87F4A] hover:bg-[#B36737] text-white py-3 px-5 rounded-xl text-center text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Book Salon Visit</span>
              </Link>
              <a
                href="https://wa.me/918212423344"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3 px-5 rounded-xl text-center text-xs font-medium uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#C87F4A]" />
                <span>Video Concierge</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Dossier (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#865E1E] overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Neelsareehouse Mysuru"
                  className="w-full h-full object-contain bg-[#FAF3E4] rounded-full p-0.5"
                />
              </div>
              <div>
                <h4 className="font-editorial text-2xl text-white uppercase tracking-wider font-semibold">
                  Neelsareehouse
                </h4>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#C87F4A] font-mono block">
                  Mysuru • Estd. 2021
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm font-sans">
              Dedicated to the preservation and elevation of Indian handloom heritage. Each weave is an authentic work of silk craftsmanship, certified under Govt. Silk Mark India standards.
            </p>

            <div className="flex items-center space-x-3 text-stone-400 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#C87F4A] hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#C87F4A] hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/918212423344"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#C87F4A] hover:text-white border border-white/10 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Royal Weaves */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-bold font-mono text-[#C87F4A] mb-4">
              Royal Weaves
            </h5>
            <ul className="space-y-2.5 text-xs text-stone-400 font-sans">
              <li>
                <Link href="/products?weave=Mysore%20Silk" className="hover:text-white transition-colors">
                  Mysore Crepe Silk
                </Link>
              </li>
              <li>
                <Link href="/products?weave=Kanchipuram" className="hover:text-white transition-colors">
                  Kanchipuram Bridal Brocade
                </Link>
              </li>
              <li>
                <Link href="/products?weave=Banarasi" className="hover:text-white transition-colors">
                  Banarasi Katan Jaal
                </Link>
              </li>
              <li>
                <Link href="/products?weave=Organza" className="hover:text-white transition-colors">
                  Pure Silk Organza
                </Link>
              </li>
              <li>
                <Link href="/products?weave=Paithani" className="hover:text-white transition-colors">
                  Paithani Shot Tones
                </Link>
              </li>
              <li>
                <Link href="/products?weave=Ikkat" className="hover:text-white transition-colors">
                  Pochampally & Patola
                </Link>
              </li>
            </ul>
          </div>

          {/* Patron Services & Story */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-bold font-mono text-[#C87F4A] mb-4">
              Patron Services
            </h5>
            <ul className="space-y-2.5 text-xs text-stone-400 font-sans">
              <li>
                <Link href="/our-story" className="hover:text-white transition-colors font-semibold text-[#C87F4A]">
                  Our Craft Story (6-Stage Journey)
                </Link>
              </li>
              <li>
                <Link href="/try-on" className="hover:text-white transition-colors">
                  AI Avatar Try-On Studio
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Track Your Dispatch
                </Link>
              </li>
              <li>
                <Link href="/returns/new" className="hover:text-white transition-colors">
                  7-Day Return & Exchange
                </Link>
              </li>
              <li>
                <Link href="/visit-us" className="hover:text-white transition-colors">
                  Flagship Salon & Concierge
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Patron Portal & Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Heritage Gazette */}
          <div>
            <h5 className="text-xs uppercase tracking-[0.2em] font-bold font-mono text-[#C87F4A] mb-4">
              Heritage Gazette
            </h5>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed font-sans">
              Receive private invitations to limited loom launches and bridal curations.
            </p>

            {!subscribed ? (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C87F4A]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="bg-[#C87F4A]/20 border border-[#C87F4A]/40 p-3.5 rounded-xl text-center">
                <CheckCircle2 className="w-4 h-4 text-[#C87F4A] mx-auto mb-1" />
                <span className="text-[11px] text-[#FAF3E4] font-medium block">
                  Welcome to our heirloom circle.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Rights & Policy Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 font-mono gap-4">
          <p>© 2021 – {new Date().getFullYear()} Neelsareehouse Mysuru. All rights reserved.</p>

          <div className="flex items-center space-x-6">
            <Link href="/products" className="hover:text-stone-400 transition-colors">
              Authenticity Registry
            </Link>
            <Link href="/returns/new" className="hover:text-stone-400 transition-colors">
              Return Policy
            </Link>
            <Link href="/visit-us" className="hover:text-stone-400 transition-colors">
              Salon Concierge
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
