'use client';

export default function ProductDetailSkeleton() {
  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10 animate-pulse">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* 1. Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-12 h-3.5 bg-stone-300/60 rounded" />
          <div className="w-3 h-3.5 bg-stone-300/40 rounded" />
          <div className="w-16 h-3.5 bg-stone-300/60 rounded" />
          <div className="w-3 h-3.5 bg-stone-300/40 rounded" />
          <div className="w-36 h-3.5 bg-stone-300/80 rounded" />
        </div>

        {/* 2. Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Gallery Skeleton */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnail Strip */}
            <div className="flex md:flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-stone-200/80 border border-stone-300/50 flex-shrink-0" />
              ))}
            </div>

            {/* Main Stage Image Skeleton */}
            <div className="relative flex-1 rounded-2xl h-[520px] sm:h-[600px] bg-stone-200/80 border border-[#C87F4A]/25 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              <div className="absolute top-4 left-4 w-44 h-7 bg-stone-300/90 rounded-full" />
            </div>
          </div>

          {/* RIGHT: Product Details Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="w-32 h-4 bg-stone-300/60 rounded" />
              <div className="w-full h-8 bg-stone-300/80 rounded" />
              <div className="w-3/4 h-8 bg-stone-300/80 rounded" />
              <div className="w-48 h-4 bg-stone-200 rounded" />
            </div>

            {/* Price Box Skeleton */}
            <div className="p-4 rounded-2xl bg-white border border-[#C87F4A]/20 space-y-2">
              <div className="w-24 h-4 bg-stone-200 rounded" />
              <div className="w-40 h-8 bg-stone-300 rounded" />
            </div>

            {/* Color Variants Skeleton */}
            <div className="space-y-2">
              <div className="w-28 h-3.5 bg-stone-300/60 rounded" />
              <div className="flex gap-2">
                <div className="w-24 h-8 bg-stone-200 rounded-full" />
                <div className="w-24 h-8 bg-stone-200 rounded-full" />
              </div>
            </div>

            {/* Quantity + Add to Cart Button Skeleton */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-28 h-[50px] bg-stone-200 rounded-xl" />
              <div className="flex-1 h-[50px] bg-[#C87F4A]/30 rounded-xl" />
            </div>

            {/* Trust Badges Skeleton */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200">
              <div className="h-12 bg-white/70 rounded-xl border border-stone-200" />
              <div className="h-12 bg-white/70 rounded-xl border border-stone-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
