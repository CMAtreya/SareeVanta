'use client';

import HeroSequence from '@/components/hero/HeroSequence';
import PinnedStory from '@/components/story/PinnedStory';
import CategoryGrid from '@/components/collections/CategoryGrid';
import TrustSection from '@/components/trust/TrustSection';
import ProductGrid from '@/components/products/ProductGrid';

export default function OurStoryPage() {
  return (
    <div className="relative w-full bg-[#FAF3E4] text-[#1C1A18]">
      {/* 1. Hero Section: Canvas Scroll-Scrubbed Unfolding Saree Sequence */}
      <HeroSequence />

      {/* 2. Story Section: Pinned Scrollytelling of the Royal Weaving Craft (6 Pinned Video Chapters) */}
      <PinnedStory />

      {/* 3. Shop by Royal Weave Category Grid */}
      <CategoryGrid />

      {/* 4. Trust, Silk Mark Authenticity & Mysuru Heritage Salon */}
      <TrustSection />

      {/* 5. Heirloom Bestsellers & Fast Functional Product Discovery */}
      <ProductGrid />
    </div>
  );
}
