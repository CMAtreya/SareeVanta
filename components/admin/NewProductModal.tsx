'use client';

import React, { useState, useMemo } from 'react';
import { X, Plus, Check, ShieldCheck, Tag } from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct?: (product: any) => void;
}

const Code128ModalBarcode = ({ value }: { value: string }) => {
  const bars = useMemo(() => {
    const pattern: number[] = [2, 1, 1, 2, 3, 2, 1, 1, 2, 2, 1, 3];
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      pattern.push((charCode % 3) + 1, ((charCode * 2) % 4) + 1, (charCode % 2) + 1);
    }
    pattern.push(2, 3, 3, 1, 1, 1, 2);
    return pattern;
  }, [value]);

  return (
    <div className="bg-white p-2 rounded-lg border border-amber-300 flex flex-col items-center justify-center space-y-0.5 shadow-2xs">
      <svg className="h-7 w-full max-w-[180px]" viewBox="0 0 160 36" preserveAspectRatio="none">
        {bars.map((width, idx) => {
          const isBlack = idx % 2 === 0;
          const x = bars.slice(0, idx).reduce((acc, w) => acc + w * 1.8, 4);
          return isBlack ? (
            <rect key={idx} x={x} y={0} width={width * 1.5} height={36} fill="#1F1B16" />
          ) : null;
        })}
      </svg>
      <span className="font-mono text-[10px] font-bold text-amber-950 tracking-widest">{value}</span>
    </div>
  );
};

export default function NewProductModal({ isOpen, onClose, onAddProduct }: NewProductModalProps) {
  // Generate random 4-digit SKU number NSH-XXXX
  const autoSku = `NSH-${Math.floor(1000 + Math.random() * 9000)}`;
  const autoBarcode = `890${Math.floor(100000000 + Math.random() * 900000000)}`;

  const [sku] = useState(autoSku);
  const [barcode] = useState(autoBarcode);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weave, setWeave] = useState('Mysore Silk');
  const [fabric, setFabric] = useState('100% Pure Mulberry Silk');
  const [color, setColor] = useState('Royal Crimson');
  const [zariSpec, setZariSpec] = useState('Pure 24K Tested Zari');
  const [occasion, setOccasion] = useState('Bridal / Wedding');

  // Pricing (Order: Cost Price (Internal) -> MRP -> Selling Price -> Stock)
  const [costPrice, setCostPrice] = useState('18500');
  const [mrp, setMrp] = useState('34000');
  const [sellingPrice, setSellingPrice] = useState('28000');
  const [stockCount, setStockCount] = useState('5');
  const [gstRate, setGstRate] = useState('18');
  const [hsn, setHsn] = useState('5007');

  // Blouse & Dimensions
  const [blouseIncluded, setBlouseIncluded] = useState(true);
  const [blouseLength, setBlouseLength] = useState('0.80m');
  const [blouseWidth, setBlouseWidth] = useState('1.14m');
  const [sareeLength, setSareeLength] = useState('5.5m');
  const [sareeWidth, setSareeWidth] = useState('1.14m');

  const [silkMark, setSilkMark] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sellingPrice) return;

    setIsSubmitting(true);
    const sp = parseInt(sellingPrice, 10) || 28000;
    const originalMrp = parseInt(mrp, 10) || Math.round(sp * 1.18);
    const cp = parseInt(costPrice, 10) || Math.round(sp * 0.65);

    const newProd = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `${title} crafted in authentic ${weave} with ${zariSpec}.`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku,
      barcode,
      weave,
      fabric,
      color,
      zariSpec,
      occasion,
      costPrice: cp, // Admin only
      mrp: originalMrp,
      priceINR: sp,
      originalPriceINR: originalMrp,
      stockCount: parseInt(stockCount, 10) || 1,
      gstRate: parseInt(gstRate, 10) || 18,
      hsn,
      blouseIncluded,
      blouseLength: blouseIncluded ? blouseLength : null,
      blouseWidth: blouseIncluded ? blouseWidth : null,
      sareeLength,
      sareeWidth,
      silkMarkCertified: silkMark,
      inStock: true,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop'],
      status: 'Published',
    };

    setTimeout(() => {
      if (onAddProduct) onAddProduct(newProd);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#7A1C30] text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Create New Saree / Product SKU
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Configure Product Metadata & Inventory Details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans overflow-y-auto flex-1">
          {/* Read-Only System Identifiers: SKU & Code128 Visual Barcode */}
          <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold mb-1">
                System SKU (Immutable) *
              </label>
              <input
                type="text"
                readOnly
                value={sku}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-900 select-all cursor-default"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold mb-1">
                Scannable Internal Barcode (Code128) *
              </label>
              <Code128ModalBarcode value={barcode} />
            </div>
          </div>

          {/* Product Basic Info */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Saree Title / Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kanchipuram Heavy Korvai Bridal Silk Saree"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1C30] text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Detailed weaving craftsmanship, pallu design, and motif notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1C30] text-slate-900 resize-none"
            />
          </div>

          {/* Weaving Specifications */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Weave Tradition</label>
              <select
                value={weave}
                onChange={(e) => setWeave(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1C30] text-slate-900 bg-white"
              >
                <option value="Mysore Silk">Mysore Silk</option>
                <option value="Kanchipuram">Kanchipuram</option>
                <option value="Banarasi">Banarasi</option>
                <option value="Paithani">Paithani</option>
                <option value="Chanderi">Chanderi</option>
                <option value="Tissue Georgette">Tissue Georgette</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fabric</label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1C30] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Color / Shade</label>
              <input
                type="text"
                placeholder="Royal Crimson"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1C30] text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Zari Specification</label>
              <input
                type="text"
                value={zariSpec}
                onChange={(e) => setZariSpec(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1C30] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Occasion</label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7A1C30] text-slate-900"
              />
            </div>
          </div>

          {/* Pricing Grid (Order: Cost Price (Internal) -> MRP -> Selling Price -> Physical Stock) */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#7A1C30]" />
                <span>Pricing & Inventory</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">18% Handloom GST default</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cost Price (Internal)</label>
                <input
                  type="number"
                  placeholder="18500"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">MRP (₹)</label>
                <input
                  type="number"
                  placeholder="34000"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="28000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Physical Stock *</label>
                <input
                  type="number"
                  required
                  value={stockCount}
                  onChange={(e) => setStockCount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Blouse Configuration */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={blouseIncluded}
                  onChange={(e) => setBlouseIncluded(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7A1C30] focus:ring-[#7A1C30]"
                />
                <span>Blouse Piece Included</span>
              </label>
              <span className="text-[10px] text-stone-500 font-mono">Mandatory measurements if Yes</span>
            </div>

            {blouseIncluded && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Blouse Length *</label>
                  <input
                    type="text"
                    required={blouseIncluded}
                    value={blouseLength}
                    onChange={(e) => setBlouseLength(e.target.value)}
                    placeholder="e.g. 0.80m"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Blouse Width *</label>
                  <input
                    type="text"
                    required={blouseIncluded}
                    value={blouseWidth}
                    onChange={(e) => setBlouseWidth(e.target.value)}
                    placeholder="e.g. 1.14m"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Central Silk Board Certification */}
          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={silkMark}
                onChange={(e) => setSilkMark(e.target.checked)}
                className="w-4 h-4 rounded text-[#7A1C30] focus:ring-[#7A1C30]"
              />
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Central Silk Board Silk Mark Certified</span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#7A1C30] hover:bg-[#601625] text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Registering Product SKU...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Product SKU</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
