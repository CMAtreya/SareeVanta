'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowRight, ShieldCheck, Award, Phone, Compass } from 'lucide-react';

const TOTAL_FRAMES = 90;

export default function HeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Overlay phase refs
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const phase3Ref = useRef<HTMLDivElement>(null);
  const phase4Ref = useRef<HTMLDivElement>(null);
  const phase5Ref = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  // Preload frames
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `/hero-sequence/frame_${frameNum}.webp`;

      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsLoading(false);
          renderCanvas(0);
        }
      };

      img.onerror = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === TOTAL_FRAMES) {
          imagesRef.current = images;
          setIsLoading(false);
          renderCanvas(0);
        }
      };

      images.push(img);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // Seamless Canvas rendering with cover math
  const renderCanvas = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex] || imagesRef.current[0];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = canvas.width;
    const height = canvas.height;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let drawWidth: number;
    let drawHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (canvasRatio > imgRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imgRatio;
      drawHeight = height;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Resize listener
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;

      renderCanvas(currentFrameRef.current);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // Master GSAP ScrollTrigger Sequence with continuous mathematical precision
  useEffect(() => {
    if (isLoading || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    const p1 = phase1Ref.current;
    const p2 = phase2Ref.current;
    const p3 = phase3Ref.current;
    const p4 = phase4Ref.current;
    const p5 = phase5Ref.current;
    const ind = indicatorRef.current;

    // Initialize initial phase states
    if (p1) {
      p1.style.opacity = '1';
      p1.style.transform = 'translate3d(0, 0, 0)';
    }
    if (p2) {
      p2.style.opacity = '0';
      p2.style.transform = 'translate3d(0, 40px, 0)';
      p2.style.pointerEvents = 'none';
    }
    if (p3) {
      p3.style.opacity = '0';
      p3.style.transform = 'translate3d(0, 40px, 0)';
      p3.style.pointerEvents = 'none';
    }
    if (p4) {
      p4.style.opacity = '0';
      p4.style.transform = 'translate3d(0, 40px, 0)';
      p4.style.pointerEvents = 'none';
    }
    if (p5) {
      p5.style.opacity = '0';
      p5.style.transform = 'translate3d(0, 40px, 0)';
      p5.style.pointerEvents = 'none';
    }

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress; // 0.0 to 1.0

        // 1. Advance Canvas Frame
        const frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(p * TOTAL_FRAMES)
        );
        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          renderCanvas(frameIndex);
        }

        // 2. Phase 1 (0.00 to 0.15): Folded Saree Title
        if (p1) {
          const op1 = Math.max(0, 1 - p / 0.13);
          p1.style.opacity = op1.toFixed(3);
          p1.style.transform = `translate3d(0, ${(-35 * (p / 0.13)).toFixed(1)}px, 0)`;
          p1.style.pointerEvents = op1 > 0.4 ? 'auto' : 'none';
        }

        // Scroll indicator
        if (ind) {
          const opInd = Math.max(0, 1 - p / 0.07);
          ind.style.opacity = opInd.toFixed(3);
        }

        // 3. Phase 2 (0.15 to 0.38): "Woven, not manufactured" (Left)
        if (p2) {
          let op2 = 0;
          let y2 = 40;
          if (p >= 0.14 && p <= 0.22) {
            const factor = (p - 0.14) / 0.08;
            op2 = factor;
            y2 = 40 * (1 - factor);
          } else if (p > 0.22 && p < 0.32) {
            op2 = 1;
            y2 = 0;
          } else if (p >= 0.32 && p <= 0.39) {
            const factor = (p - 0.32) / 0.07;
            op2 = Math.max(0, 1 - factor);
            y2 = -40 * factor;
          }
          p2.style.opacity = op2.toFixed(3);
          p2.style.transform = `translate3d(0, ${y2.toFixed(1)}px, 0)`;
          p2.style.pointerEvents = op2 > 0.4 ? 'auto' : 'none';
        }

        // 4. Phase 3 (0.39 to 0.60): "Zari that catches the light" (Right)
        if (p3) {
          let op3 = 0;
          let y3 = 40;
          if (p >= 0.38 && p <= 0.46) {
            const factor = (p - 0.38) / 0.08;
            op3 = factor;
            y3 = 40 * (1 - factor);
          } else if (p > 0.46 && p < 0.54) {
            op3 = 1;
            y3 = 0;
          } else if (p >= 0.54 && p <= 0.61) {
            const factor = (p - 0.54) / 0.07;
            op3 = Math.max(0, 1 - factor);
            y3 = -40 * factor;
          }
          p3.style.opacity = op3.toFixed(3);
          p3.style.transform = `translate3d(0, ${y3.toFixed(1)}px, 0)`;
          p3.style.pointerEvents = op3 > 0.4 ? 'auto' : 'none';
        }

        // 5. Phase 4 (0.61 to 0.80): "Made to move, made to last" (Left)
        if (p4) {
          let op4 = 0;
          let y4 = 40;
          if (p >= 0.60 && p <= 0.67) {
            const factor = (p - 0.60) / 0.07;
            op4 = factor;
            y4 = 40 * (1 - factor);
          } else if (p > 0.67 && p < 0.74) {
            op4 = 1;
            y4 = 0;
          } else if (p >= 0.74 && p <= 0.81) {
            const factor = (p - 0.74) / 0.07;
            op4 = Math.max(0, 1 - factor);
            y4 = -40 * factor;
          }
          p4.style.opacity = op4.toFixed(3);
          p4.style.transform = `translate3d(0, ${y4.toFixed(1)}px, 0)`;
          p4.style.pointerEvents = op4 > 0.4 ? 'auto' : 'none';
        }

        // 6. Phase 5 (0.80 to 1.00): Final Hero Drape & Grand CTA (Centered)
        if (p5) {
          let op5 = 0;
          let y5 = 40;
          if (p >= 0.79) {
            const factor = Math.min(1, (p - 0.79) / 0.08);
            op5 = factor;
            y5 = 40 * (1 - factor);
          }
          p5.style.opacity = op5.toFixed(3);
          p5.style.transform = `translate3d(0, ${y5.toFixed(1)}px, 0)`;
          p5.style.pointerEvents = op5 > 0.4 ? 'auto' : 'none';
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [isLoading, prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className={`relative w-full ${
        prefersReducedMotion ? 'h-screen' : 'h-[460vh]'
      } bg-[#FAF3E4]`}
    >
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#FAF3E4]">
        {/* Subtle Radial Gradient Backdrop (#FAF3E4 to #F0E2CC) */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,#FAF3E4_40%,#F0E2CC_100%)]" />

        {/* Lightweight Silk Preloader */}
        {isLoading && (
          <div className="absolute inset-0 z-40 bg-[#FAF3E4] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-2 border-[#C87F4A]/30 border-t-[#C87F4A] animate-spin" />
              <div className="w-14 h-14 rounded-full overflow-hidden absolute inset-0 m-auto p-1 bg-[#FAF3E4] shadow-sm">
                <img
                  src="/logo.png"
                  alt="Neelsareehouse"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <h2 className="font-editorial text-3xl text-[#1F1B16] font-medium tracking-wide">
              Neelsareehouse
            </h2>
            <p className="text-xs uppercase tracking-[0.25em] text-[#773D21] mt-1.5 mb-6 font-mono">
              Unfolding the Royal Mysore Silk Heritage
            </p>

            {/* Silk Thread Loading Track */}
            <div className="w-64 max-w-full h-1 bg-[#E2CE9F]/50 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#C87F4A] to-[#B8892B] transition-all duration-200 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono tracking-widest text-[#773D21] mt-3">
              {loadProgress}% Drape Initialized
            </span>
          </div>
        )}

        {/* The Scroll-Scrubbed Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover block relative z-10"
          style={{ width: '100vw', height: '100vh' }}
        />

        {/* Edge-Free Feathering Vignette Overlays: Melts Canvas into #FAF3E4 space */}
        <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,#FAF3E4_95%)] opacity-85" />
        <div className="absolute inset-0 z-15 pointer-events-none bg-gradient-to-t from-[#FAF3E4] via-transparent to-[#FAF3E4]/70" />

        {/* ---------------------------------------------------- */}
        {/* PHASE 1 (0% - 15%): Folded Resting Saree Editorial */}
        {/* ---------------------------------------------------- */}
        <div
          ref={phase1Ref}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Heritage Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF3E4]/80 backdrop-blur-md border border-[#C87F4A]/30 text-[#773D21] text-[11px] tracking-[0.28em] uppercase font-sans font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
              <span>Royal Looms of Mysuru • Estd. 1984</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-editorial text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#1F1B16] font-normal tracking-tight leading-[0.98]">
              Neelsareehouse
            </h1>

            {/* Subheadline */}
            <p className="mt-4 sm:mt-5 font-editorial italic text-2xl sm:text-3xl md:text-4xl text-[#773D21] font-light">
              Where every drape tells a story.
            </p>

            {/* Supporting Line */}
            <p className="mt-4 max-w-xl text-xs sm:text-sm md:text-base text-[#1F1B16]/70 font-sans font-normal leading-relaxed tracking-wide">
              Heritage silk, handwoven in Mysuru, for the moments that deserve it.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          ref={indicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-[#1F1B16]/60 pointer-events-none"
        >
          <span className="text-[9px] tracking-[0.3em] uppercase mb-2 font-mono text-[#773D21]">
            Scroll to Unfold Saree
          </span>
          <div className="w-5 h-8 rounded-full border border-[#C87F4A]/40 flex items-start justify-center p-1 bg-[#FAF3E4]/60 backdrop-blur-sm">
            <div className="w-1 h-2 bg-[#C87F4A] rounded-full animate-bounce" />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PHASE 2 (15% - 40%): Saree Unfolding / "Woven, not manufactured" (Left) */}
        {/* ---------------------------------------------------- */}
        <div
          ref={phase2Ref}
          className="absolute inset-0 z-20 flex items-center justify-start px-6 sm:px-12 lg:px-20 pointer-events-none"
        >
          <div className="max-w-md sm:max-w-lg bg-[#FAF3E4]/90 backdrop-blur-md rounded-2xl p-7 sm:p-9 border border-[#C87F4A]/25 shadow-silk-lg">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-semibold mb-2">
              <span>01 • Pure Mulberry Sericulture</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1F1B16] font-normal leading-tight mb-3">
              Woven, not manufactured.
            </h2>

            <p className="text-xs sm:text-sm text-[#1F1B16]/75 font-sans leading-relaxed mb-5">
              Hand-spun pure Mulberry silk intertwined with tested real zari. Each piece takes up to
              180 hours of rhythmic handloom shuttle movement by master multigenerational weaver
              lineages in Karnataka and Tamil Nadu.
            </p>

            <div className="pt-4 border-t border-[#C87F4A]/20 flex items-center justify-between text-[11px] font-mono text-[#773D21]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C87F4A]" />
                <span>100% Pure Silk Mark Certified</span>
              </span>
              <span className="text-[#B8892B] font-semibold">120 Ends/Inch</span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PHASE 3 (40% - 65%): Zari Focus / "Zari that catches the light" (Right) */}
        {/* ---------------------------------------------------- */}
        <div
          ref={phase3Ref}
          className="absolute inset-0 z-20 flex items-center justify-end px-6 sm:px-12 lg:px-20 pointer-events-none"
        >
          <div className="max-w-md sm:max-w-lg bg-[#FAF3E4]/90 backdrop-blur-md rounded-2xl p-7 sm:p-9 border border-[#B8892B]/30 shadow-silk-lg">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#B8892B] font-mono font-semibold mb-2">
              <span>02 • 24K Tested Zari Metallurgy</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1F1B16] font-normal leading-tight mb-3">
              Zari that catches the light, <br />
              <span className="italic font-light text-[#773D21]">not just the eye.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#1F1B16]/75 font-sans leading-relaxed mb-5">
              Genuine silver wire wrapped around fine silk filaments, electroplated in molten 24-karat
              gold baths. Woven with sacred Mayil (peacock), Yanai (elephant), and Mysore Palace
              Gandaberunda motifs that never oxidize or dull across generations.
            </p>

            <div className="pt-4 border-t border-[#B8892B]/20 flex items-center justify-between text-[11px] font-mono text-[#773D21]">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#B8892B]" />
                <span>Tested Pure Gold & Silver</span>
              </span>
              <span className="text-[#B8892B] font-semibold">Korvai Interlock</span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PHASE 4 (65% - 85%): Pallu Pleat / "Made to move, made to last" (Left) */}
        {/* ---------------------------------------------------- */}
        <div
          ref={phase4Ref}
          className="absolute inset-0 z-20 flex items-center justify-start px-6 sm:px-12 lg:px-20 pointer-events-none"
        >
          <div className="max-w-md sm:max-w-lg bg-[#FAF3E4]/90 backdrop-blur-md rounded-2xl p-7 sm:p-9 border border-[#C87F4A]/25 shadow-silk-lg">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#C87F4A] font-mono font-semibold mb-2">
              <span>03 • The Heirloom Drape</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#1F1B16] font-normal leading-tight mb-3">
              Made to move, <br />
              <span className="italic font-light text-[#773D21]">made to last.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#1F1B16]/75 font-sans leading-relaxed mb-5">
              Natural sericin protein gives our Mysore and Kanchipuram silks an incomparable fluid fall
              that molds gracefully to the body. An heirloom engineered to be passed down through
              generations without losing its tactile softness or luster.
            </p>

            <div className="pt-4 border-t border-[#C87F4A]/20 flex items-center justify-between text-[11px] font-mono text-[#773D21]">
              <span>Bridal to Festive Elegance</span>
              <span className="text-[#C87F4A] font-semibold">50+ Year Lifespan</span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* PHASE 5 (85% - 100%): Final Draped Hero Pose & Grand CTA */}
        {/* ---------------------------------------------------- */}
        <div
          ref={phase5Ref}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-none"
        >
          <div className="max-w-3xl mx-auto bg-[#FAF3E4]/92 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-[#C87F4A]/30 shadow-2xl">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#773D21] font-mono font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#C87F4A]" />
              <span>Neelsareehouse Mysuru • Heritage Curation</span>
            </div>

            {/* Headline */}
            <h2 className="font-editorial text-3xl sm:text-5xl md:text-6xl text-[#1F1B16] font-normal tracking-tight leading-[1.08]">
              Crafted to be worn. <br />
              <span className="italic font-light text-[#773D21]">Woven to be cherished.</span>
            </h2>

            {/* Subheadline */}
            <p className="mt-4 max-w-xl mx-auto text-xs sm:text-sm md:text-base text-[#1F1B16]/75 font-sans leading-relaxed">
              Neelsareehouse. Heritage silk for the moments you’ll tell stories about.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 pointer-events-auto">
              <a
                href="#collections"
                className="inline-flex items-center gap-2.5 bg-[#C87F4A] hover:bg-[#B36737] text-white px-8 py-4 rounded-sm text-xs font-sans font-semibold uppercase tracking-[0.2em] transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-[#C87F4A]/20"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="https://wa.me/918212423344"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FAF3E4] hover:bg-white text-[#1F1B16] border border-[#C87F4A]/40 px-6 py-4 rounded-sm text-xs font-sans font-medium uppercase tracking-[0.16em] transition-all duration-300"
              >
                <Phone className="w-3.5 h-3.5 text-[#B8892B]" />
                <span>Chat with us on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
