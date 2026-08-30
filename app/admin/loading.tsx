export default function AdminLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-stone-200/80 rounded-xl" />
          <div className="h-4 w-96 bg-stone-100 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-stone-200/80 rounded-xl" />
          <div className="h-9 w-32 bg-[#7A1C30]/20 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-stone-200/70 rounded" />
              <div className="h-8 w-8 bg-stone-100 rounded-xl" />
            </div>
            <div className="h-7 w-32 bg-stone-200 rounded" />
            <div className="h-3 w-40 bg-stone-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Skeleton */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-stone-100">
          <div className="h-9 w-72 bg-stone-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-stone-100 rounded-lg" />
            <div className="h-8 w-20 bg-stone-100 rounded-lg" />
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between gap-4 p-3 bg-stone-50/70 rounded-xl border border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 bg-stone-200 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-stone-200 rounded" />
                  <div className="h-3 w-32 bg-stone-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-24 bg-stone-100 rounded hidden md:block" />
              <div className="h-4 w-20 bg-stone-100 rounded hidden sm:block" />
              <div className="h-6 w-16 bg-stone-200/80 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
