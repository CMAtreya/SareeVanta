'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { fabricFilters, occasionFilters, weaveCategories } from '@/lib/products';

export interface FilterCounts {
  weaves?: Record<string, number>;
  fabrics?: Record<string, number>;
  occasions?: Record<string, number>;
  colors?: Record<string, number>;
}

export interface AvailableColor {
  name: string;
  hex: string;
  matchKey: string;
}

export const availableColors: AvailableColor[] = [
  { name: 'Crimson Red', hex: '#8B1E28', matchKey: 'crimson' },
  { name: 'Pure Gold', hex: '#D4AF37', matchKey: 'gold' },
  { name: 'Emerald Green', hex: '#1B4D3E', matchKey: 'emerald' },
  { name: 'Royal Violet', hex: '#4A154B', matchKey: 'violet' },
  { name: 'Powder Blue', hex: '#B0E0E6', matchKey: 'blue' },
  { name: 'Rani Pink', hex: '#C2185B', matchKey: 'pink' },
  { name: 'Ruby Red', hex: '#9B111E', matchKey: 'ruby' },
  { name: 'Peacock Teal', hex: '#005F73', matchKey: 'teal' },
  { name: 'Sandalwood Beige', hex: '#C2B280', matchKey: 'sandalwood' },
];

interface ProductFiltersProps {
  selectedWeaves: string[];
  setSelectedWeaves: (weaves: string[]) => void;
  selectedFabrics: string[];
  setSelectedFabrics: (fabrics: string[]) => void;
  selectedOccasions: string[];
  setSelectedOccasions: (occasions: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  silkMarkOnly: boolean;
  setSilkMarkOnly: (silkMark: boolean) => void;
  onClearAll: () => void;
  totalFilteredCount: number;
  counts?: FilterCounts;
}

export default function ProductFilters({
  selectedWeaves,
  setSelectedWeaves,
  selectedFabrics,
  setSelectedFabrics,
  selectedOccasions,
  setSelectedOccasions,
  selectedColors,
  setSelectedColors,
  priceRange,
  setPriceRange,
  silkMarkOnly,
  setSilkMarkOnly,
  onClearAll,
  totalFilteredCount,
  counts,
}: ProductFiltersProps) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    weaves: true,
    price: true,
    fabrics: true,
    occasions: true,
    colors: true,
    cert: true,
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleWeaveToggle = (weaveName: string) => {
    if (selectedWeaves.includes(weaveName)) {
      setSelectedWeaves(selectedWeaves.filter((w) => w !== weaveName));
    } else {
      setSelectedWeaves([...selectedWeaves, weaveName]);
    }
  };

  const handleFabricToggle = (fabric: string) => {
    if (selectedFabrics.includes(fabric)) {
      setSelectedFabrics(selectedFabrics.filter((f) => f !== fabric));
    } else {
      setSelectedFabrics([...selectedFabrics, fabric]);
    }
  };

  const handleOccasionToggle = (occ: string) => {
    if (selectedOccasions.includes(occ)) {
      setSelectedOccasions(selectedOccasions.filter((o) => o !== occ));
    } else {
      setSelectedOccasions([...selectedOccasions, occ]);
    }
  };

  const handleColorToggle = (colorMatch: string) => {
    if (selectedColors.includes(colorMatch)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorMatch));
    } else {
      setSelectedColors([...selectedColors, colorMatch]);
    }
  };

  const activeFiltersCount =
    selectedWeaves.length +
    selectedFabrics.length +
    selectedOccasions.length +
    selectedColors.length +
    (silkMarkOnly ? 1 : 0) +
    (priceRange[0] > 10000 || priceRange[1] < 100000 ? 1 : 0);

  const FilterBody = (
    <div className="space-y-5 text-[#1F1B16]">
      {/* 1. Header & Reset Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#C87F4A]/20">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C87F4A]" />
          <span className="text-xs uppercase tracking-widest font-bold font-mono text-[#1F1B16]">
            Filters
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-[#C87F4A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-[#C87F4A] hover:text-[#773D21] font-sans font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* 2. Weave Filter Section (Flipkart / Amazon style with item counts) */}
      <div className="border-b border-[#C87F4A]/15 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('weaves')}
          className="flex items-center justify-between w-full py-1 text-xs uppercase tracking-wider font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
        >
          <span>Weave Tradition</span>
          {openSections.weaves ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#C87F4A]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#C87F4A]" />
          )}
        </button>

        {openSections.weaves && (
          <div className="mt-2.5 space-y-1.5 pl-0.5">
            {weaveCategories.map((cat) => {
              const count = counts?.weaves?.[cat.name] || 0;
              const isChecked = selectedWeaves.includes(cat.name);
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between text-xs font-sans text-stone-700 hover:text-[#1F1B16] cursor-pointer py-1 select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleWeaveToggle(cat.name)}
                      className="w-3.5 h-3.5 rounded text-[#C87F4A] border-stone-300 focus:ring-[#C87F4A] cursor-pointer"
                    />
                    <span className={`group-hover:text-[#C87F4A] transition-colors ${isChecked ? 'font-bold text-[#1F1B16]' : ''}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    ({count || 0})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Dual Drag Price Range Slider & Preset Chips */}
      <div className="border-b border-[#C87F4A]/15 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full py-1 text-xs uppercase tracking-wider font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
        >
          <span>Price Range</span>
          {openSections.price ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#C87F4A]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#C87F4A]" />
          )}
        </button>

        {openSections.price && (() => {
          const roundPrice = (val: number) => Math.round(val / 1000) * 1000;
          const minPercent = Math.min(100, Math.max(0, ((priceRange[0] - 10000) / (100000 - 10000)) * 100));
          const maxPercent = Math.min(100, Math.max(0, ((priceRange[1] - 10000) / (100000 - 10000)) * 100));

          const handleMinChange = (val: number) => {
            const rounded = roundPrice(val);
            const safeMin = Math.min(Math.max(10000, rounded), priceRange[1] - 2000);
            setPriceRange([safeMin, priceRange[1]]);
          };

          const handleMaxChange = (val: number) => {
            const rounded = roundPrice(val);
            const safeMax = Math.max(Math.min(100000, rounded), priceRange[0] + 2000);
            setPriceRange([priceRange[0], safeMax]);
          };

          return (
            <div className="mt-3 space-y-3.5">
              {/* Min & Max Price Display Box */}
              <div className="flex items-center justify-between text-xs font-mono text-stone-700">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-sans text-stone-400 font-semibold mb-0.5">Starting Price</span>
                  <span className="bg-white px-2.5 py-1 rounded-md border border-[#C87F4A]/30 font-bold text-[#7A1C30]">
                    ₹{priceRange[0].toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-stone-400 text-xs font-serif mt-3">—</span>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-sans text-stone-400 font-semibold mb-0.5">Ending Price</span>
                  <span className="bg-white px-2.5 py-1 rounded-md border border-[#C87F4A]/30 font-bold text-[#7A1C30]">
                    ₹{priceRange[1].toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Dual Range Drag Slider Track */}
              <div className="relative w-full h-8 flex items-center select-none py-2">
                {/* Background Track */}
                <div className="absolute left-0 right-0 h-2 bg-stone-200 rounded-full" />
                {/* Active Highlighted Range Bar */}
                <div
                  className="absolute h-2 bg-gradient-to-r from-[#7A1C30] via-[#A33B45] to-[#C87F4A] rounded-full shadow-xs"
                  style={{
                    left: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />

                {/* Starting Price Drag Thumb */}
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="1000"
                  value={priceRange[0]}
                  onChange={(e) => handleMinChange(parseInt(e.target.value, 10))}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer z-20 
                    [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 
                    [&::-webkit-slider-thumb]:border-[#7A1C30] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                    [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 
                    [&::-moz-range-thumb]:border-[#7A1C30] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
                  aria-label="Starting price drag slider"
                />

                {/* Ending Price Drag Thumb */}
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  step="1000"
                  value={priceRange[1]}
                  onChange={(e) => handleMaxChange(parseInt(e.target.value, 10))}
                  className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer z-30 
                    [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 
                    [&::-webkit-slider-thumb]:border-[#C87F4A] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                    [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 
                    [&::-moz-range-thumb]:border-[#C87F4A] [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
                  aria-label="Ending price drag slider"
                />
              </div>

              {/* Rounded Off Price Preset Chips */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { label: 'Under ₹25k', range: [10000, 25000] },
                  { label: '₹25k – ₹50k', range: [25000, 50000] },
                  { label: '₹50k – ₹75k', range: [50000, 75000] },
                  { label: 'Above ₹75k', range: [75000, 100000] },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPriceRange(preset.range as [number, number])}
                    className={`text-[10px] font-sans py-1 px-2 rounded-md border text-center transition-all ${
                      priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1]
                        ? 'bg-[#7A1C30] text-white border-[#7A1C30] font-semibold shadow-xs'
                        : 'bg-white/70 text-stone-600 border-stone-200 hover:border-[#C87F4A]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 4. Fabric Types with Item Counts */}
      <div className="border-b border-[#C87F4A]/15 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('fabrics')}
          className="flex items-center justify-between w-full py-1 text-xs uppercase tracking-wider font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
        >
          <span>Fabric Texture</span>
          {openSections.fabrics ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#C87F4A]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#C87F4A]" />
          )}
        </button>

        {openSections.fabrics && (
          <div className="mt-2.5 space-y-1.5 pl-0.5 max-h-48 overflow-y-auto pr-1">
            {fabricFilters.map((fabric, idx) => {
              const count = counts?.fabrics?.[fabric] || 0;
              const isChecked = selectedFabrics.includes(fabric);
              return (
                <label
                  key={idx}
                  className="flex items-center justify-between text-xs font-sans text-stone-700 hover:text-[#1F1B16] cursor-pointer py-1 select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleFabricToggle(fabric)}
                      className="w-3.5 h-3.5 rounded text-[#C87F4A] border-stone-300 focus:ring-[#C87F4A] cursor-pointer"
                    />
                    <span className={`group-hover:text-[#C87F4A] transition-colors ${isChecked ? 'font-bold text-[#1F1B16]' : ''}`}>
                      {fabric}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    ({count || 0})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Occasion Filter with Item Counts */}
      <div className="border-b border-[#C87F4A]/15 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('occasions')}
          className="flex items-center justify-between w-full py-1 text-xs uppercase tracking-wider font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
        >
          <span>Occasion</span>
          {openSections.occasions ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#C87F4A]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#C87F4A]" />
          )}
        </button>

        {openSections.occasions && (
          <div className="mt-2.5 space-y-1.5 pl-0.5">
            {occasionFilters.map((occ, idx) => {
              const count = counts?.occasions?.[occ] || 0;
              const isChecked = selectedOccasions.includes(occ);
              return (
                <label
                  key={idx}
                  className="flex items-center justify-between text-xs font-sans text-stone-700 hover:text-[#1F1B16] cursor-pointer py-1 select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleOccasionToggle(occ)}
                      className="w-3.5 h-3.5 rounded text-[#C87F4A] border-stone-300 focus:ring-[#C87F4A] cursor-pointer"
                    />
                    <span className={`group-hover:text-[#C87F4A] transition-colors ${isChecked ? 'font-bold text-[#1F1B16]' : ''}`}>
                      {occ}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    ({count || 0})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Color Swatches Section */}
      <div className="border-b border-[#C87F4A]/15 pb-4">
        <button
          type="button"
          onClick={() => toggleSection('colors')}
          className="flex items-center justify-between w-full py-1 text-xs uppercase tracking-wider font-bold text-[#1F1B16] hover:text-[#C87F4A] transition-colors"
        >
          <span>Color Palette</span>
          {openSections.colors ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#C87F4A]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#C87F4A]" />
          )}
        </button>

        {openSections.colors && (
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {availableColors.map((col, idx) => {
              const isSelected = selectedColors.includes(col.matchKey);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleColorToggle(col.matchKey)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left text-[10px] font-sans transition-all ${
                    isSelected
                      ? 'border-[#C87F4A] bg-white font-bold text-[#1F1B16] shadow-xs'
                      : 'border-stone-200/80 bg-white/50 text-stone-600 hover:border-[#C87F4A]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-black/15 shadow-xs"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="truncate">{col.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Authenticity / Silk Mark Filter */}
      <div>
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#C87F4A]/25 cursor-pointer hover:border-[#C87F4A] transition-all select-none">
          <input
            type="checkbox"
            checked={silkMarkOnly}
            onChange={(e) => setSilkMarkOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#C87F4A] border-stone-300 focus:ring-[#C87F4A] cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
            <span className="text-xs font-semibold text-[#1F1B16]">
              Silk Mark Certified Only
            </span>
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar Filter Panel */}
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-24 bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-[#C87F4A]/25 shadow-sm">
          {FilterBody}
        </div>
      </aside>

      {/* Mobile Floating Filter Drawer Trigger */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="flex items-center gap-2 bg-[#1F1B16] text-[#FAF3E4] px-5 py-3.5 rounded-full shadow-2xl border border-[#C87F4A]/40 text-xs uppercase font-bold tracking-widest"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#C87F4A]" />
          <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
        </button>
      </div>

      {/* Mobile Bottom-Sheet Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative bg-[#FAF3E4] rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl border-t border-[#C87F4A]/30 z-10 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#C87F4A]/20 mb-4">
              <span className="font-editorial text-lg font-bold">Filter Options</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-full text-stone-500 hover:text-black bg-white border border-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {FilterBody}

            <div className="mt-6 pt-4 border-t border-[#C87F4A]/20 sticky bottom-0 bg-[#FAF3E4] pb-2">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest shadow-md"
              >
                Apply Filters ({totalFilteredCount} Sarees)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
