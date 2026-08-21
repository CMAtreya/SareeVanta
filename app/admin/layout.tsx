'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  TrendingUp,
  Users,
  Film,
  Megaphone,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isMarketingActive = pathname.startsWith('/admin/marketing');
  const isReelsActive = pathname === '/admin/marketing/instagram-reels';

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16]">
      {/* Top Admin Navigation Bar */}
      <header className="bg-white border-b border-[#C87F4A]/25 sticky top-0 z-40 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B] flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="Neelsareehouse"
                  className="w-full h-full object-contain bg-[#FAF3E4] rounded-full p-0.5"
                />
              </div>
              <div>
                <span className="font-editorial text-lg font-bold text-[#1F1B16] block leading-tight">
                  Neelsareehouse
                </span>
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#C87F4A] block">
                  Admin Salon Console
                </span>
              </div>
            </Link>

            <span className="h-6 w-px bg-stone-200 hidden sm:block" />

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#C87F4A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mysuru Hub Live</span>
            </div>

            <a
              href="https://www.instagram.com/neelsareehouse/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl border border-[#C87F4A]/30 text-xs font-mono font-semibold text-[#1F1B16] hover:bg-[#FAF3E4] transition-colors flex items-center gap-1.5"
            >
              <span>@neelsareehouse</span>
              <ExternalLink className="w-3 h-3 text-[#C87F4A]" />
            </a>
          </div>
        </div>
      </header>

      {/* 2-Column Admin Workspace */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================================================== */}
          {/* LEFT: ADMIN PERSISTENT SIDEBAR                     */}
          {/* ================================================== */}
          <aside className="lg:col-span-3 bg-white rounded-3xl p-5 border border-[#C87F4A]/25 shadow-silk space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block px-3 mb-2">
                Core Console
              </span>

              <nav className="space-y-1">
                <Link
                  href="/admin"
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all ${
                    pathname === '/admin'
                      ? 'bg-[#C87F4A] text-white shadow-sm'
                      : 'text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview & Metrics</span>
                </Link>

                <Link
                  href="/admin"
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-semibold text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A] transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span>Orders & Dispatches</span>
                </Link>

                <Link
                  href="/admin"
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-semibold text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A] transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Loom Silk Mark Stock</span>
                </Link>
              </nav>
            </div>

            {/* Marketing Section (Active Group) */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold block">
                  Marketing & Studio
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C87F4A]" />
              </div>

              <nav className="space-y-1">
                <Link
                  href="/admin/marketing/instagram-reels"
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all ${
                    isReelsActive
                      ? 'bg-[#C87F4A] text-white shadow-md'
                      : isMarketingActive
                      ? 'bg-[#FAF3E4] text-[#C87F4A] font-bold'
                      : 'text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-4 h-4" />
                    <span>Instagram Reels</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isReelsActive ? 'text-white' : 'text-stone-400'}`} />
                </Link>
              </nav>
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-stone-100 px-3">
              <span className="text-[10px] font-mono text-stone-400 block mb-2">
                Neelsareehouse Flagship
              </span>
              <div className="text-[11px] text-stone-500 font-sans space-y-1">
                <p>Sayyaji Rao Road, Mysuru</p>
                <p className="font-mono text-[#773D21]">Estd. October 2021</p>
              </div>
            </div>
          </aside>

          {/* ================================================== */}
          {/* RIGHT: MAIN CONTENT AREA                           */}
          {/* ================================================== */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
