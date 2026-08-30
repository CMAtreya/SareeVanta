'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';
import { INITIAL_COLLECTIONS, SareeCollection } from '@/lib/taxonomy';

export default function CollectionsIndexPage() {
  const [collections, setCollections] = useState<SareeCollection[]>(INITIAL_COLLECTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (data.collections && Array.isArray(data.collections) && data.collections.length > 0) {
          setCollections(data.collections);
        }
      })
      .catch((err) => console.error('[Collections Index] Fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF3E4] text-[#1F1B16]">
      {/* 1. Breadcrumbs */}
      <div className="bg-[#1F1B16] text-[#FAF3E4]/80 text-xs py-3 border-b border-[#C87F4A]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C87F4A]" />
          <span className="text-white font-medium">Curated Handloom Lookbooks</span>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section className="bg-radial from-[#3A0F18] via-[#1F1B16] to-[#0D0B0A] text-[#FAF3E4] py-14 sm:py-20 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3E4]/15 backdrop-blur-md border border-white/20 text-[#FAF3E4] text-[11px] font-mono font-semibold uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
            <span>Royal Atelier Lookbooks</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl font-normal text-white leading-tight tracking-tight">
            Curated Saree Collections
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 font-sans max-w-xl mx-auto leading-relaxed">
            Thematic handloom curations bringing together certified Silk Mark weaves, pure 24K tested zari, and royal heritage drapes for auspicious celebrations.
          </p>
        </div>
      </section>

      {/* 3. Collections Showcase Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {collections.map((col) => (
            <div
              key={col.id}
              className="group bg-white rounded-3xl overflow-hidden border border-[#C87F4A]/25 shadow-silk hover:shadow-2xl transition-all duration-500 flex flex-col"
            >
              {/* Cover Image Container */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-stone-900">
                <img
                  src={col.coverImage}
                  alt={col.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-[#7A1C30]/90 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
                    {col.badge}
                  </span>
                </div>

                {/* Saree Count Pill */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                  <span className="font-mono text-[11px] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    {col.assignedSkuCount || 12} Royal Designs
                  </span>
                  <span className="font-mono text-[11px] text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pure Silk</span>
                  </span>
                </div>
              </div>

              {/* Editorial Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1F1B16] group-hover:text-[#7A1C30] transition-colors">
                    {col.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
                    {col.tagline}
                  </p>
                  {col.description && (
                    <p className="text-[11px] text-stone-500 font-sans line-clamp-2">
                      {col.description}
                    </p>
                  )}
                </div>

                {/* Action CTA */}
                <div className="pt-3 border-t border-[#C87F4A]/20">
                  <Link
                    href={`/collections/${col.slug}`}
                    className="inline-flex items-center justify-between w-full bg-[#FAF3E4] group-hover:bg-[#7A1C30] text-[#7A1C30] group-hover:text-white px-5 py-3.5 rounded-2xl text-xs font-sans font-bold uppercase tracking-widest transition-all duration-300"
                  >
                    <span>Explore Lookbook Collection</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
