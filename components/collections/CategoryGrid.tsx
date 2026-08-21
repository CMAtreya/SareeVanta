'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowUpRight, Info, X, Shield, Award, Check } from 'lucide-react';

interface WeaveCategory {
  id: string;
  name: string;
  kannadaName?: string;
  origin: string;
  tagline: string;
  image: string;
  accentColor: string;
  sareeCount: string;
  gsm: string;
  zariGrade: string;
  drapeFeel: string;
  occasion: string;
  description: string;
  features: string[];
}

const weaveCategories: WeaveCategory[] = [
  {
    id: 'mysore-silk',
    name: 'Mysore Royal Crepe Silk',
    kannadaName: 'ಮೈಸೂರು ರೇಷ್ಮೆ',
    origin: 'Mysuru, Karnataka',
    tagline: 'Liquid luster, pure 100% mulberry crepe with royal Wodeyar seal borders.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
    accentColor: '#C87F4A',
    sareeCount: '48 Heirloom Pieces',
    gsm: '85 - 110 GSM (Ultra Lightweight)',
    zariGrade: 'Tested Pure Gold & Silver Ribbon',
    drapeFeel: 'Liquid drape, molds effortlessly to body contours',
    occasion: 'Royal Weddings, Formal Receptions, Heritage Pujas',
    description:
      'Woven under royal patronage since the reign of Maharaja Nalwadi Krishnaraja Wadiyar IV. Made from 100% natural mulberry silk with twisted warp yarns that yield its iconic pebbled crepe texture and rich drape.',
    features: [
      'Genuine Karnataka Sericulture Certified',
      'Solid Contrast Pallu with Kasturi Mango Motifs',
      'Silk Mark & Geographical Indication (GI) Protected',
    ],
  },
  {
    id: 'kanchipuram',
    name: 'Kanchipuram Temple Brocade',
    kannadaName: 'ಕಾಂಚೀಪುರಂ ರೇಷ್ಮೆ',
    origin: 'Kanchipuram, Tamil Nadu',
    tagline: 'Heavy three-shuttle Korvai weaves with authentic temple spire borders.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80',
    accentColor: '#B36737',
    sareeCount: '62 Bridal Creations',
    gsm: '160 - 220 GSM (Substantial Bridal Weight)',
    zariGrade: '57% Silver / 0.6% 24K Pure Gold',
    drapeFeel: 'Stately architectural drape with regal fall',
    occasion: 'Muhurtham, Grand Bridal Wear, Milestones',
    description:
      'Renowned for its distinctive Korvai technique where the body and contrast border are woven separately and locked together using interlocking warp threads for unbreakable heirloom strength.',
    features: [
      'Traditional Korvai interlocking border craft',
      'Heirloom motifs: Mayil (peacock), Yanai (elephant), Rudraksha',
      'Dual-side pure zari luster that never dulls',
    ],
  },
  {
    id: 'banarasi',
    name: 'Banarasi Pure Katan Silk',
    kannadaName: 'ಬನಾರಸಿ ರೇಷ್ಮೆ',
    origin: 'Varanasi, Uttar Pradesh',
    tagline: 'Opulent Kadwa jaal with Persian floral vines and antique zari kalga.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
    accentColor: '#944D26',
    sareeCount: '34 Masterpieces',
    gsm: '140 - 180 GSM (Supple Richness)',
    zariGrade: 'Fine Antique Micro-Zari',
    drapeFeel: 'Sumptuous, flowing silhouette with rich weight',
    occasion: 'Sangeet, Royal Receptions, Trousseau',
    description:
      'Handcrafted using the ancient Kadwa technique where each floral motif is individually engraved and woven onto the loom without loose float threads on the reverse, ensuring unparalleled comfort against the skin.',
    features: [
      'Kadwa handloom engraving (No rough reverse floats)',
      'Intricate Shikargah & Jangla royal court motifs',
      'Hand-twisted pure mulberry Katan warp',
    ],
  },
  {
    id: 'chanderi-tussar',
    name: 'Chanderi & Tussar Gold',
    kannadaName: 'ಚಂದೇರಿ ತುಸ್ಸಾರ್',
    origin: 'Chanderi & Vidarbha Looms',
    tagline: 'Featherlight sheer gossamer silk enriched with delicate zari bootas.',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80',
    accentColor: '#C49746',
    sareeCount: '29 Curations',
    gsm: '65 - 85 GSM (Gossamer Featherlight)',
    zariGrade: 'Tested Fine Gold Dust Wire',
    drapeFeel: 'Ethereal, crisp yet whisper-soft',
    occasion: 'Morning Rituals, Gallery Openings, Summer Weddings',
    description:
      'Celebrated for its transparency and sheer elegance, Chanderi combines raw unbleached wild silk with fine zari bootas for a luminous daytime glow that breathes in tropical warmth.',
    features: [
      'Wild Tussar & Degummed Mulberry blend',
      'Extra-weft gold boota detailing',
      'Natural porous weave offering exceptional breathability',
    ],
  },
  {
    id: 'paithani',
    name: 'Paithani & Tissue Radiance',
    kannadaName: 'ಪೈಠಣಿ ಮತ್ತು ಟಿಶ್ಯೂ',
    origin: 'Yeola Looms, Maharashtra',
    tagline: 'Prismatic shot-color silken tapestry with tapestry-woven peacock pallu.',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80',
    accentColor: '#72202F',
    sareeCount: '22 Exclusive Drapes',
    gsm: '130 - 170 GSM (Prismatic Sheen)',
    zariGrade: 'Full Tissue Gold Warp & Weft',
    drapeFeel: 'Sculptural metallic drape with shifting two-tone sheen',
    occasion: 'Bridal Festivities, Royal Banquets, Anniversaries',
    description:
      'Characterized by borders of an oblique square design and a pallu with a Peacock motif. Woven without using a mechanical jacquard, every color transition in the pallu is executed completely by hand using small bamboo shuttles.',
    features: [
      'Tapestry weave technique (Tilli / Kadi)',
      'Kaleidoscopic Dhoop-Chhaon (sun & shade) dual-tone effect',
      'Single saree takes over 30 days of master loom hand-knotting',
    ],
  },
];

export default function CategoryGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedWeave, setSelectedWeave] = useState<WeaveCategory | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const cards = grid.children;

    const ctx = gsap.context(() => {
      // Staggered reveal for weave cards
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 45,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="collections"
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#C87F4A]/20"
    >
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C87F4A] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Loom Specializations</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1C1A18] font-normal tracking-tight">
            Shop by Royal Weave
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mt-3">
            Each saree is handpicked from certified master artisan clusters across
            Mysuru, Kanchipuram, and Varanasi with documented yarn provenance.
          </p>
        </div>

        <div className="mt-6 md:mt-0">
          <span className="text-xs uppercase tracking-widest text-[#888888] font-mono">
            5 Distinct Weave Lineages
          </span>
        </div>
      </div>

      {/* Grid: 2 columns top, 3 columns bottom for editorial cadence */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {weaveCategories.map((weave, index) => {
          // Feature the first two categories as slightly wider on larger screens
          const isFeatured = index === 0 || index === 1;

          return (
            <div
              key={weave.id}
              className={`group relative rounded-2xl overflow-hidden bg-[#FAF3E4] border border-[#C87F4A]/25 hover:border-[#C87F4A] shadow-sm hover:shadow-silk-lg transition-all duration-500 flex flex-col justify-between cursor-pointer ${
                isFeatured ? 'lg:col-span-1' : ''
              }`}
              onClick={() => setSelectedWeave(weave)}
            >
              {/* Image Container with Luxury Zoom */}
              <div className="relative h-80 w-full overflow-hidden bg-stone-200">
                <img
                  src={weave.image}
                  alt={weave.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/85 via-[#1C1A18]/20 to-transparent" />

                {/* Origin Pill */}
                <div className="absolute top-4 left-4 bg-[#FAF3E4]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-[#773D21] border border-[#C87F4A]/30">
                  {weave.origin}
                </div>

                {/* Saree Count Pill */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-[#FAF3E4] border border-white/20">
                  {weave.sareeCount}
                </div>

                {/* Floating Bottom Card Details inside Image */}
                <div className="absolute bottom-4 left-4 right-4 text-[#FAF3E4]">
                  <div className="flex items-center justify-between">
                    <div>
                      {weave.kannadaName && (
                        <span className="text-xs text-[#E8D5A3] font-medium block">
                          {weave.kannadaName}
                        </span>
                      )}
                      <h3 className="font-editorial text-2xl font-medium tracking-wide">
                        {weave.name}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#C87F4A] text-white flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Meta Body */}
              <div className="p-6 flex flex-col justify-between flex-1 bg-white">
                <p className="text-xs sm:text-sm text-[#5D5D5D] leading-relaxed mb-5">
                  {weave.tagline}
                </p>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#C87F4A] font-semibold">
                    {weave.gsm}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWeave(weave);
                    }}
                    className="text-xs text-[#1C1A18] hover:text-[#C87F4A] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-[#C87F4A]" />
                    <span>View Weave Guide</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Weave Knowledge Modal */}
      {selectedWeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedWeave(null)}
          />

          <div className="relative bg-[#FAF3E4] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#C87F4A]/40 p-6 sm:p-8 z-10 animate-fade-in">
            <button
              type="button"
              onClick={() => setSelectedWeave(null)}
              className="absolute top-5 right-5 text-stone-500 hover:text-[#1C1A18] p-1.5 rounded-full bg-white/80 border border-stone-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#C87F4A] font-semibold mb-1">
              <Award className="w-4 h-4" />
              <span>Authentic Handloom Heritage Dossier</span>
            </div>

            <h3 className="font-editorial text-3xl text-[#1C1A18] font-semibold">
              {selectedWeave.name}
            </h3>
            <span className="text-xs font-mono text-[#888888] tracking-widest uppercase block mb-4">
              Loom Origin: {selectedWeave.origin}
            </span>

            <p className="text-sm sm:text-base text-[#44403C] leading-relaxed mb-6 font-normal">
              {selectedWeave.description}
            </p>

            {/* Spec Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-[#C87F4A]/20 mb-6">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#888888]">
                  Weight & Density
                </span>
                <p className="text-xs font-semibold text-[#1C1A18] mt-0.5">
                  {selectedWeave.gsm}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#888888]">
                  Zari Specification
                </span>
                <p className="text-xs font-semibold text-[#1C1A18] mt-0.5">
                  {selectedWeave.zariGrade}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#888888]">
                  Drape & Fall Feel
                </span>
                <p className="text-xs font-semibold text-[#1C1A18] mt-0.5">
                  {selectedWeave.drapeFeel}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#888888]">
                  Recommended Occasion
                </span>
                <p className="text-xs font-semibold text-[#1C1A18] mt-0.5">
                  {selectedWeave.occasion}
                </p>
              </div>
            </div>

            {/* Authenticity Hallmark List */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-widest font-semibold text-[#773D21] mb-3">
                Key Craftsmanship Hallmarks
              </h4>
              <div className="space-y-2">
                {selectedWeave.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#2A2826]">
                    <Check className="w-4 h-4 text-[#C87F4A] flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#C87F4A]/20">
              <a
                href="#bestsellers"
                onClick={() => setSelectedWeave(null)}
                className="w-full sm:flex-1 bg-[#C87F4A] hover:bg-[#B36737] text-white py-3 rounded-sm text-center text-xs font-semibold uppercase tracking-widest transition-colors"
              >
                Explore Curated Sarees In This Weave
              </a>
              <a
                href="https://wa.me/918212423344"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 border border-[#C87F4A] text-[#773D21] hover:bg-[#C87F4A]/10 rounded-sm text-xs font-medium uppercase tracking-wider text-center transition-colors"
              >
                Inquire on Loom Stock
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
