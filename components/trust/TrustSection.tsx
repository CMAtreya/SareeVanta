'use client';

import {
  ShieldCheck,
  Award,
  Scissors,
  Truck,
  Sparkles,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function TrustSection() {
  return (
    <section
      id="store"
      className="py-24 bg-[#1C1A18] text-[#FAF3E4] border-y border-[#C87F4A]/30 relative overflow-hidden"
    >
      {/* Subtle Mysore royal geometric backdrop */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FAF3E4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 border border-[#C49746]/40 text-[#C49746] text-xs font-mono uppercase tracking-[0.25em] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Neelsareehouse Hallmark</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl text-[#FAF3E4] font-normal tracking-tight">
            Preserving Four Decades of Trust
          </h2>

          <p className="mt-4 text-sm sm:text-base text-stone-300 font-light leading-relaxed">
            In an era of powerloom replicas and artificial blends, we remain steadfast in our
            commitment to pure mulberry silk, tested real zari, and direct artisan livelihoods.
          </p>
        </div>

        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Pillar 1 */}
          <div className="bg-white/5 border border-white/10 hover:border-[#C87F4A]/60 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-[#C87F4A]/20 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl text-white font-medium mb-2">
              Silk Mark Certified
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Every saree bears the official Government of India Silk Mark tag, guaranteeing 100% natural silk fiber purity without synthetic adulteration.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white/5 border border-white/10 hover:border-[#C87F4A]/60 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-[#C87F4A]/20 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl text-white font-medium mb-2">
              Loom-to-Drape Provenance
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              We work directly with 120+ master weaver families across Karnataka and Tamil Nadu, ensuring fair artisan wages and documented provenance.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white/5 border border-white/10 hover:border-[#C87F4A]/60 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-[#C87F4A]/20 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-5">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl text-white font-medium mb-2">
              Complimentary Fall & Pico
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Every heirloom saree arrives ready-to-wear with premium hand-stitched fall and rolled interlocking pico edging.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white/5 border border-white/10 hover:border-[#C87F4A]/60 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-[#C87F4A]/20 border border-[#C87F4A]/40 flex items-center justify-center text-[#C87F4A] mb-5">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl text-white font-medium mb-2">
              Insured Worldwide Express
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              Delivered safely in climate-shielded heirloom packaging to 45+ countries with real-time tracking and full transit insurance coverage.
            </p>
          </div>
        </div>

        {/* Highlight Banner: Mysore Heritage Flagship Store */}
        <div className="relative rounded-2xl bg-gradient-to-r from-[#2A2826] to-[#1C1A18] border border-[#C87F4A]/40 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#C87F4A_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-10 pointer-events-none hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C49746] font-semibold mb-2">
                <MapPin className="w-4 h-4" />
                <span>Mysuru Heritage Flagship Destination</span>
              </div>
              <h3 className="font-editorial text-2xl sm:text-4xl text-white font-medium mb-3">
                Experience the Royal Weaves of Mysuru in Person
              </h3>
              <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
                Step into our Flagship Store on Sayyaji Rao Road, Mysuru. Explore over 600 handloom silk creations curated across royal crepe, Kanchipuram bridal brocades, and tested pure zari masterpieces.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C87F4A]" />
                  <span>Private bridal styling suites</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C87F4A]" />
                  <span>100% Genuine Silk Mark certified</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-[#C87F4A]" />
                  <span>Insured tamper-proof security delivery</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href="https://maps.google.com/?q=Sayyaji+Rao+Road+Mysuru"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-4 px-6 rounded-sm text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/40 text-center"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Store Directions</span>
              </a>

              <a
                href="https://wa.me/918212423344?text=Hello%20Neelsareehouse%2C%20I%20would%20like%20to%20inquire%20about%20curated%20saree%20pieces."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3.5 px-6 rounded-sm text-xs font-medium uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-4 h-4 text-[#C49746]" />
                <span>Contact Flagship Concierge</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
