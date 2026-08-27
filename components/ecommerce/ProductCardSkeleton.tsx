'use client';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#C87F4A]/15 shadow-silk flex flex-col justify-between animate-pulse">
      {/* 1. Image Skeleton */}
      <div className="relative aspect-[3/4] bg-stone-200/70 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        {/* Top Floating Badge Skeleton */}
        <div className="absolute top-3 left-3 w-20 h-5 bg-stone-300/80 rounded-full" />
        {/* Wishlist Button Skeleton */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-stone-300/80 rounded-full" />
      </div>

      {/* 2. Content Skeleton */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Weave / Fabric Tag */}
          <div className="w-24 h-3 bg-stone-200 rounded" />
          {/* Title Line 1 & Line 2 */}
          <div className="w-full h-4 bg-stone-300/70 rounded" />
          <div className="w-2/3 h-4 bg-stone-300/70 rounded" />
        </div>

        {/* Rating & Stock Line */}
        <div className="flex items-center justify-between pt-1">
          <div className="w-16 h-3 bg-stone-200 rounded" />
          <div className="w-20 h-3 bg-stone-200 rounded" />
        </div>

        {/* Price & Add to Cart Button Skeleton */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <div className="w-14 h-2.5 bg-stone-200 rounded" />
            <div className="w-20 h-5 bg-stone-300 rounded" />
          </div>
          <div className="w-28 h-9 bg-stone-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
