import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Home,
  ShoppingBag,
  Search,
  Compass,
  Crown,
} from 'lucide-react';

export default function NotFound() {
  const quickLinks = [
    {
      title: 'Royal Mysore Silk',
      desc: 'Tested 24K pure gold zari borders',
      href: '/products?weave=Mysore+Silk',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Bridal Kanchipuram',
      desc: 'Heavy Korvai interlocking weaves',
      href: '/products?weave=Kanchipuram',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Varanasi Kadwa Katan',
      desc: 'Hand-loomed Meenakari floral jaal',
      href: '/products?weave=Banarasi',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="bg-[#FAF3E4] min-h-[90vh] relative overflow-hidden flex flex-col justify-between text-[#1F1B16]">
      {/* 1. Subtle Heritage Background Ambient Glows & Watermark */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-radial from-[#C87F4A]/10 via-[#7A1C30]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-0 w-96 h-96 bg-[#7A1C30]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Grand 404 Watermark Typography */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 select-none pointer-events-none font-serif text-[12rem] sm:text-[18rem] md:text-[22rem] font-bold text-[#C87F4A]/10 leading-none tracking-widest z-0">
        404
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full flex-1 flex flex-col justify-center">
        {/* Top Atelier Badge */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#C87F4A]/30 text-xs font-mono font-semibold text-[#7A1C30] shadow-xs backdrop-blur-md">
            <Crown className="w-3.5 h-3.5 text-[#C87F4A]" />
            <span>NEEL SAREE HOUSE • ATELIER ARCHIVE</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15]">
            The Drape You Seek Has Drifted Into Our Archives
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed max-w-lg mx-auto">
            Like a rare vintage weave retired to our Mysore vaults, this specific page or saree listing is no longer in our active gallery. Let us guide you back to our living collections.
          </p>

          {/* Search Box on 404 Page */}
          <form action="/products" method="GET" className="pt-2 max-w-md mx-auto relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                name="search"
                placeholder="Search by weave, fabric, color, or occasion..."
                className="w-full pl-11 pr-24 py-3 bg-white/95 backdrop-blur-md rounded-full border border-[#C87F4A]/30 focus:outline-none focus:border-[#7A1C30] focus:ring-2 focus:ring-[#7A1C30]/20 text-xs text-[#1F1B16] shadow-sm transition-all font-sans"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-2 bg-[#7A1C30] hover:bg-[#5F1424] text-white text-[11px] font-mono font-bold uppercase tracking-wider rounded-full transition-colors shadow-sm cursor-pointer"
              >
                Find
              </button>
            </div>
          </form>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#7A1C30] hover:bg-[#5F1424] text-white text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-md group cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#E2CE9F] group-hover:scale-110 transition-transform" />
              <span>Return to Homepage</span>
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#FAF3E4] text-[#1F1B16] border border-[#C87F4A]/40 text-xs font-sans font-bold uppercase tracking-widest transition-all shadow-xs cursor-pointer group"
            >
              <ShoppingBag className="w-4 h-4 text-[#C87F4A] group-hover:scale-110 transition-transform" />
              <span>Explore All Sarees</span>
            </Link>
          </div>
        </div>

        {/* Curated Recommendations Grid */}
        <div className="mt-14 pt-10 border-t border-[#C87F4A]/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#7A1C30]" />
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-900">
                Curated Living Collections
              </h3>
            </div>
            <Link
              href="/products"
              className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A1C30] hover:text-[#C87F4A] flex items-center gap-1 transition-colors"
            >
              <span>View Full Vault</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {quickLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="group relative bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#C87F4A]/20 hover:border-[#7A1C30]/50 hover:shadow-silk-lg transition-all duration-300 flex items-center gap-4 overflow-hidden"
              >
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#FAF3E4] border border-[#C87F4A]/20 flex-shrink-0 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C87F4A] font-semibold block">
                    Handloom Edit
                  </span>
                  <h4 className="font-editorial text-sm font-bold text-[#1F1B16] group-hover:text-[#7A1C30] transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-sans truncate">
                    {item.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#7A1C30] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Heritage Footer Note */}
      <div className="py-4 border-t border-[#E8DCC9]/70 text-center text-[10px] font-mono text-stone-500 tracking-widest uppercase bg-white/40 backdrop-blur-xs">
        Neel Saree House • Sayyaji Rao Road, Mysuru Flagship Store • Estd. 2021
      </div>
    </div>
  );
}
