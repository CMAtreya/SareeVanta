'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  ShoppingCart,
  Film,
  Plus,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Command,
  X,
  TrendingUp,
  Users,
  Layers,
  Tag,
  Megaphone,
  Wand2,
  RotateCcw,
  BarChart3,
  Settings,
  Receipt,
  Truck,
  CreditCard,
  UserCog,
  Star,
  FolderOpen,
} from 'lucide-react';
import { products } from '@/lib/products';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewProductModal?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenNewProductModal,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape, Navigate on Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter items
  const cleanQ = query.trim().toLowerCase();

  const navigationCommands = [
    { title: 'Dashboard', category: 'Navigation', icon: TrendingUp, href: '/admin' },
    { title: 'Products / Catalog', category: 'Navigation', icon: Package, href: '/admin/catalog' },
    { title: 'Inventory', category: 'Navigation', icon: Layers, href: '/admin/inventory' },
    { title: 'Collections & Taxonomy', category: 'Navigation', icon: FolderOpen, href: '/admin/catalog/collections' },
    { title: 'Orders', category: 'Navigation', icon: ShoppingCart, href: '/admin/orders' },
    { title: 'Shipments', category: 'Navigation', icon: Truck, href: '/admin/shipments' },
    { title: 'Returns & Claims', category: 'Navigation', icon: RotateCcw, href: '/admin/returns' },
    { title: 'Customers', category: 'Navigation', icon: Users, href: '/admin/customers' },
    { title: 'Reviews / UGC', category: 'Navigation', icon: Star, href: '/admin/customerreviews' },
    { title: 'Discounts & Coupons', category: 'Navigation', icon: Tag, href: '/admin/marketing/coupons' },
    { title: 'Homepage Content', category: 'Navigation', icon: Megaphone, href: '/admin/marketing/banners' },
    { title: 'Instagram Reels', category: 'Navigation', icon: Film, href: '/admin/marketing/instagram-reels' },
    { title: 'Analytics & Reports', category: 'Navigation', icon: BarChart3, href: '/admin/analytics' },
    { title: 'Staff & RBAC', category: 'Navigation', icon: UserCog, href: '/admin/settings/staff' },
  ];

  const quickActions = [
    {
      title: 'Add New Handloom Saree SKU',
      category: 'Actions',
      icon: Plus,
      action: () => {
        onClose();
        if (onOpenNewProductModal) onOpenNewProductModal();
      },
    },
    {
      title: 'View Mysore Flagship Store Storefront',
      category: 'Actions',
      icon: ExternalLink,
      action: () => {
        window.open('/', '_blank');
        onClose();
      },
    },
  ];

  // Search through sarees
  const matchedProducts = products
    .filter(
      (p) =>
        p.title.toLowerCase().includes(cleanQ) ||
        p.weave.toLowerCase().includes(cleanQ) ||
        p.color.toLowerCase().includes(cleanQ) ||
        ((p as any).sku && (p as any).sku.toLowerCase().includes(cleanQ))
    )
    .slice(0, 5)
    .map((p) => ({
      title: `${p.title} (${p.weave})`,
      category: 'Products & SKUs',
      sku: (p as any).sku || `NSH-SKU-${p.id.slice(0, 4)}`,
      price: `₹${p.priceINR.toLocaleString('en-IN')}`,
      icon: Package,
      href: `/products/${p.slug}`,
    }));

  const allItems = [
    ...navigationCommands.filter((c) => c.title.toLowerCase().includes(cleanQ)),
    ...quickActions.filter((c) => c.title.toLowerCase().includes(cleanQ)),
    ...matchedProducts,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#18110E]/80 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in select-none">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E8DCC9] overflow-hidden text-[#1F1B16]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="flex items-center px-4 border-b border-[#E8DCC9] bg-[#FAF6F0]">
          <Search className="w-5 h-5 text-stone-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, SKU, order ID, or search sarees... (Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-4 text-sm bg-transparent placeholder:text-stone-400 font-sans focus:outline-none text-[#1F1B16] font-medium"
          />
          <div className="flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-white border border-[#E8DCC9] px-2 py-0.5 rounded-md flex-shrink-0 shadow-2xs">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-[#FAF3E4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-stone-100">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-stone-400">
              No matching commands or SKUs found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {allItems.map((item: any, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.href) {
                        router.push(item.href);
                        onClose();
                      }
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF3E4] cursor-pointer transition-colors group text-xs font-sans"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#FAF6F0] text-stone-600 border border-[#E8DCC9] group-hover:bg-[#7A1C30] group-hover:border-[#7A1C30] group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 truncate group-hover:text-[#7A1C30]">
                          {item.title}
                        </div>
                        <div className="text-[10px] font-mono text-stone-400 flex items-center gap-2">
                          <span className="uppercase text-[#C87F4A] font-bold">{item.category}</span>
                          {item.sku && <span>• {item.sku}</span>}
                          {item.price && <span className="text-emerald-700 font-bold">• {item.price}</span>}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#7A1C30] transition-colors flex-shrink-0 ml-2" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2.5 bg-[#FAF6F0] border-t border-[#E8DCC9] flex items-center justify-between text-[11px] font-mono text-stone-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="text-[#7A1C30] font-bold">NEELSAREEHOUSE Admin Console</span>
        </div>
      </div>
    </div>
  );
}
