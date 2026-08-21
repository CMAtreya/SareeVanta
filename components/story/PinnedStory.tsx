'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Scissors,
  CheckCircle2,
  Package,
  Layers,
  Feather,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface CraftStep {
  id: string;
  number: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  videoSrc: string;
  metrics: { label: string; value: string }[];
  highlight: string;
}

const craftSteps: CraftStep[] = [
  {
    id: 'sourcing',
    number: '01',
    tag: '01 • Pure Mulberry Sericulture',
    title: 'The Golden Harvest of Karnataka',
    subtitle: 'Cultivated in Southern Karnataka Valleys',
    description:
      'Nurtured in the fertile climate of Karnataka, our 4A+ grade pure mulberry silk filaments are naturally coated in organic sericin protein. This gives the raw yarn its signature liquid luster and incomparable tensile strength before it ever touches a dye bath.',
    videoSrc: '/craft-journey/section-01-sourcing.mp4',
    metrics: [
      { label: 'Silk Grade', value: '4A+ Extra Fine Mulberry' },
      { label: 'Natural Protein', value: '100% Organic Sericin' },
    ],
    highlight: 'Naturally radiant fibers that soften and enrich with age rather than dull.',
  },
  {
    id: 'weaving',
    number: '02',
    tag: '02 • The Rhythm of the Handloom',
    title: '14 Days on the Jacquard Loom',
    subtitle: 'Ancestral Loom Craftsmanship',
    description:
      'Over 14,000 rhythmic pedal passes and shuttle beats. Master multigenerational artisans intertwine fine warp threads with double-twisted crepe wefts, controlling each warp thread manually to create an unbreakable heirloom weave structure.',
    videoSrc: '/craft-journey/section-02-weaving.mp4',
    metrics: [
      { label: 'Weave Density', value: '120 Ends/Inch' },
      { label: 'Loom Duration', value: '14 to 21 Days' },
    ],
    highlight: 'Ancestral handloom technique passed down through five generations.',
  },
  {
    id: 'zari-detail',
    number: '03',
    tag: '03 • Metallurgical Alchemy',
    title: '24-Karat Tested Pure Zari',
    subtitle: 'Genuine Silver & Gold Electroplating',
    description:
      'Unlike plastic metallic threads, our genuine zari consists of 57% pure silver wire wrapped around fine silk filaments, passed through molten 24-karat gold baths. Woven with sacred Mayil (peacock) and Mysore Palace Gandaberunda motifs that never oxidize.',
    videoSrc: '/craft-journey/section-03-zari-detail.mp4',
    metrics: [
      { label: 'Silver Purity', value: '57% Tested Silver' },
      { label: 'Gold Electroplate', value: '0.6% 24K Pure Gold' },
    ],
    highlight: 'Tested real zari that retains its golden radiance across half a century.',
  },
  {
    id: 'finished-saree',
    number: '04',
    tag: '04 • The Masterpiece Unveiled',
    title: 'Rigorous Provenance Inspection',
    subtitle: 'Silk Mark India & GI Certification',
    description:
      'Every 6-yard creation is inspected centimeter by centimeter for warp tension, zari alignment, and uniform pallu weight. Each piece receives the official Government of India Silk Mark tag with an individual artisan registry number.',
    videoSrc: '/craft-journey/section-04-finished-saree.mp4',
    metrics: [
      { label: 'Quality Standard', value: 'Govt. Silk Mark Certified' },
      { label: 'Artisan Traceability', value: 'Individual Loom Serial' },
    ],
    highlight: 'Complete loom-to-drape provenance verifying authentic artisan origin.',
  },
  {
    id: 'draping',
    number: '05',
    tag: '05 • The Heirloom Silhouette',
    title: 'Fluid Drape & Sculptural Fall',
    subtitle: 'Architectural Pleats & Regal Motion',
    description:
      'Molds effortlessly to the body with sculptural grace. The weight distribution of the pure zari pallu and Korvai temple border ensures effortless pleat discipline, moving with fluid elegance from royal bridal mandaps to evening galas.',
    videoSrc: '/craft-journey/section-05-draping.mp4',
    metrics: [
      { label: 'Drape Feel', value: 'Fluid Architectural Fall' },
      { label: 'Occasion', value: 'Bridal to Festive Elegance' },
    ],
    highlight: 'Engineered for all-day comfort without compromising stately structure.',
  },
  {
    id: 'packing',
    number: '06',
    tag: '06 • Heirloom Preservation',
    title: 'Bespoke Cedar Packaging & Dispatch',
    subtitle: 'Muslin Shielding & Worldwide Insurance',
    description:
      'Folded by hand in breathable, acid-free organic muslin accompanied by aromatic Himalayan cedar blocks to protect against moisture and air contaminants. Dispatched worldwide in tamper-proof climate boxes with full transit insurance.',
    videoSrc: '/craft-journey/section-06-packing.mp4',
    metrics: [
      { label: 'Storage Box', value: 'Acid-Free Muslin & Cedar' },
      { label: 'Delivery', value: 'Insured Global Express' },
    ],
    highlight: 'Arrives ready-to-wear with hand-rolled pico and bespoke fall stitching.',
  },
];

export default function PinnedStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sections = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    const ctx = gsap.context(() => {
      sections.forEach((section, index) => {
        const video = videos[index];
        const card = cards[index];

        // 1. Video Autoplay Trigger on 50% view
        ScrollTrigger.create({
          trigger: section,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => {
            if (video) video.play().catch(() => {});
          },
          onEnterBack: () => {
            if (video) video.play().catch(() => {});
          },
          onLeave: () => {
            if (video) video.pause();
          },
          onLeaveBack: () => {
            if (video) video.pause();
          },
        });

        // 2. Pinning & Story-Beat Animation Timeline (~110vh duration)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=110%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        // Animate card entrance and subtle elevation
        if (card) {
          tl.fromTo(
            card,
            { opacity: 0, y: 50, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
          )
            .to(card, { opacity: 1, y: 0, duration: 0.35 }) // Hold
            .to(card, {
              opacity: 0,
              y: -40,
              scale: 0.98,
              duration: 0.3,
              ease: 'power2.in',
            });
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="craft"
      ref={containerRef}
      className="relative w-full bg-[#FAF3E4] text-[#1F1B16]"
    >
      {/* Editorial Section Introduction Banner */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#C87F4A]/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[#C87F4A] font-semibold mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Six Chapters of Silk Architecture</span>
            </div>
            <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-[#1F1B16] font-normal tracking-tight">
              Our Craft Journey
            </h2>
            <p className="text-[#1F1B16]/70 text-sm sm:text-base max-w-xl mt-3 font-sans leading-relaxed">
              From the sericulture valleys of Karnataka to the rhythmic beat of ancestral handlooms.
              Explore the six disciplined stages behind every Neelsareehouse drape.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <span className="text-xs uppercase tracking-widest text-[#773D21] font-mono bg-[#FAF3E4] px-4 py-2 rounded-full border border-[#C87F4A]/30">
              6 Pinned Cinema Chapters
            </span>
          </div>
        </div>
      </div>

      {/* 6 Pinned Video Sections */}
      {craftSteps.map((step, idx) => {
        const isEven = idx % 2 === 0;

        return (
          <div
            key={step.id}
            ref={(el) => {
              sectionRefs.current[idx] = el;
            }}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#FAF3E4] border-t border-[#C87F4A]/15"
          >
            {/* Fullscreen Video Background with Ambient Cream Vignette */}
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#181615]">
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={step.videoSrc}
                muted
                playsInline
                loop
                preload="metadata"
                className="w-full h-full object-cover opacity-90 transition-opacity duration-700"
              />

              {/* Edge-Free Vignette & Gradients blending into #FAF3E4 */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF3E4] via-transparent to-[#FAF3E4]/60 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#FAF3E4_95%)] opacity-80 pointer-events-none" />
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            </div>

            {/* Stage Content Container */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 flex items-center justify-between">
              {/* Grid: Video focus on one side, Editorial Story-Beat card on the other */}
              <div
                className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Left/Right Editorial Card Container */}
                <div
                  className={`lg:col-span-6 xl:col-span-5 ${
                    isEven ? 'lg:col-start-1' : 'lg:col-start-7 xl:col-start-8'
                  }`}
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    className="bg-[#FAF3E4]/95 backdrop-blur-md rounded-2xl p-7 sm:p-9 border border-[#C87F4A]/30 shadow-silk-lg"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {/* Header with Step Counter */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#C87F4A]/20">
                      <div className="flex items-center gap-2">
                        <span className="font-editorial text-3xl font-bold text-[#C87F4A]">
                          {step.number}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[#773D21] font-mono">
                          Chapter {step.number} of 06
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-stone-500 bg-white/80 px-2.5 py-1 rounded-full border border-stone-200">
                        Autoplay Cinema
                      </span>
                    </div>

                    <span className="text-xs uppercase tracking-widest text-[#B8892B] font-semibold block mb-1">
                      {step.subtitle}
                    </span>

                    <h3 className="font-editorial text-2xl sm:text-3xl lg:text-4xl text-[#1F1B16] font-medium leading-tight mb-3">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#1F1B16]/80 leading-relaxed mb-6 font-sans">
                      {step.description}
                    </p>

                    {/* Metrics Matrix */}
                    <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-white/70 rounded-xl border border-[#C87F4A]/20 mb-4">
                      {step.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-wider text-stone-500 font-mono">
                            {m.label}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-[#1F1B16] font-editorial mt-0.5">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Highlight Quote */}
                    <div className="flex items-center gap-2 text-xs text-[#773D21] italic font-serif">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C87F4A] flex-shrink-0" />
                      <span>"{step.highlight}"</span>
                    </div>
                  </div>
                </div>

                {/* Counterbalance Floating Badge (Opposite Side) */}
                <div
                  className={`hidden lg:flex flex-col items-center justify-center lg:col-span-6 xl:col-span-7 ${
                    isEven ? 'items-end pr-8' : 'items-start pl-8'
                  }`}
                >
                  <div className="bg-black/40 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 text-[#FAF3E4] text-xs font-mono tracking-widest flex items-center gap-3 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-[#C87F4A] animate-pulse" />
                    <span>NEELSAREEHOUSE MYSURU • {step.tag.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section Progress Ticker */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#FAF3E4]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#C87F4A]/30 text-[11px] font-mono text-[#773D21]">
              <span>Section {step.number} of 06</span>
              <span className="text-stone-400">•</span>
              <span>Scroll to proceed to next craft chapter ↓</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
