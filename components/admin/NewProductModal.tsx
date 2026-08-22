'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles, Check, Package, Image as ImageIcon } from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct?: (product: any) => void;
}

export default function NewProductModal({ isOpen, onClose, onAddProduct }: NewProductModalProps) {
  const [title, setTitle] = useState('');
  const [weave, setWeave] = useState('Mysore Silk');
  const [color, setColor] = useState('Royal Crimson');
  const [priceINR, setPriceINR] = useState('');
  const [originalPriceINR, setOriginalPriceINR] = useState('');
  const [stockCount, setStockCount] = useState('5');
  const [artisanCluster, setArtisanCluster] = useState('Mysuru Royal Weavers Guild');
  const [silkMark, setSilkMark] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !priceINR) return;

    setIsSubmitting(true);
    const newSku = `NSH-SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProd = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      weave,
      color,
      priceINR: parseInt(priceINR, 10) || 28000,
      originalPriceINR: parseInt(originalPriceINR, 10) || parseInt(priceINR, 10) * 1.15,
      sku: newSku,
      stockCount: parseInt(stockCount, 10) || 1,
      artisanCluster,
      silkMarkCertified: silkMark,
      inStock: true,
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop'],
    };

    setTimeout(() => {
      if (onAddProduct) onAddProduct(newProd);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Add New Handloom Saree SKU
              </h3>
              <p className="text-[11px] font-mono text-slate-500">
                Register loom piece with Silk Mark certification
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Saree Title / Masterpiece Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Mysuru Vintage Gold Zari Crepe Silk"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Weave Tradition
              </label>
              <select
                value={weave}
                onChange={(e) => setWeave(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
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
              <label className="block text-slate-700 font-semibold mb-1">
                Primary Color / Shade
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Crimson"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="28500"
                value={priceINR}
                onChange={(e) => setPriceINR(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                placeholder="32000"
                value={originalPriceINR}
                onChange={(e) => setOriginalPriceINR(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Loom Stock Qty
              </label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Artisan Cluster & Provenance
            </label>
            <input
              type="text"
              value={artisanCluster}
              onChange={(e) => setArtisanCluster(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={silkMark}
                onChange={(e) => setSilkMark(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="font-semibold text-slate-700">
                100% Central Silk Board Silk Mark Certified
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Registering SKU...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Saree to Loom Registry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
