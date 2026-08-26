import Link from 'next/link';
import { PackageSearch, ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#FAF3E4] min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 text-[#1F1B16]">
      <div className="max-w-xl w-full bg-white/90 backdrop-blur-md rounded-3xl border border-[#E8DCC9] shadow-[0_20px_50px_rgba(122,28,48,0.08)] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
        {/* Ambient Gold & Maroon Radial Shimmer */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-[#7A1C30]/15 via-[#C87F4A]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-gradient-to-tr from-[#C87F4A]/15 via-amber-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* 404 Emblem Badge */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FAF5EE] to-[#FAF3E4] border border-[#C87F4A]/40 shadow-inner text-[#7A1C30] mx-auto">
          <PackageSearch className="w-9 h-9 stroke-[1.5]" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#7A1C30] text-[#E2CE9F] flex items-center justify-center text-[10px] font-mono font-bold">
            404
          </div>
        </div>

        <div className="space-y-2 relative">
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-mono font-bold tracking-[0.25em] text-[#C87F4A]">
            <Sparkles className="w-3 h-3 text-[#7A1C30]" />
            <span>Neelsareehouse Mysuru Archive</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Heirloom Piece Not Found
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed max-w-md mx-auto pt-1">
            The page or saree collection archive you are looking for has been relocated or is no longer available in our active registry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 relative">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#7A1C30] hover:bg-[#5F1424] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group"
          >
            <Home className="w-4 h-4 text-[#E2CE9F] group-hover:scale-110 transition-transform" />
            <span>Return to Salon Homepage</span>
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF3E4] hover:bg-white text-stone-800 border border-[#C87F4A]/40 hover:border-[#7A1C30]/60 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-stone-500" />
            <span>Explore Handlooms</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#E8DCC9]/60 text-[10px] font-mono text-stone-600 tracking-wider">
          Mysuru Flagship Guild Registry • Estd. 2021
        </div>
      </div>
    </div>
  );
}
