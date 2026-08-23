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
    { title: 'Overview & Revenue Metrics', category: 'Navigation', icon: TrendingUp, href: '/admin' },
    { title: 'Master Product Catalog Suite', category: 'Navigation', icon: Package, href: '/admin/catalog' },
    { title: 'Curated Collections & Taxonomy', category: 'Navigation', icon: FolderOpen, href: '/admin/catalog/collections' },
    { title: 'Loom Inventory Control Matrix', category: 'Navigation', icon: Layers, href: '/admin/inventory' },
    { title: 'Live Orders & BlueDart Dispatches', category: 'Navigation', icon: ShoppingCart, href: '/admin/orders' },
    { title: 'Reverse Logistics & Returns Hub', category: 'Navigation', icon: RotateCcw, href: '/admin/returns' },
    { title: 'Performance Analytics & BI Suite', category: 'Navigation', icon: BarChart3, href: '/admin/analytics' },
    { title: 'Customer Reviews & UGC Moderation', category: 'Navigation', icon: Star, href: '/admin/customerreviews' },
    { title: 'Staff & Role-Based Access (RBAC)', category: 'Navigation', icon: UserCog, href: '/admin/settings/staff' },
    { title: 'Tax, Legal & GST Configuration', category: 'Navigation', icon: Receipt, href: '/admin/settings/taxes' },
    { title: 'Logistics & Warehouse Locations', category: 'Navigation', icon: Truck, href: '/admin/settings/shipping' },
    { title: 'Payment Gateways & Webhooks', category: 'Navigation', icon: CreditCard, href: '/admin/settings/payments' },
    { title: 'Master Store Configuration Center', category: 'Navigation', icon: Settings, href: '/admin/settings' },
    { title: 'Client Directory & Bridal CRM', category: 'Navigation', icon: Users, href: '/admin/customers' },
    { title: 'Discounts & Promotional Engine', category: 'Navigation', icon: Tag, href: '/admin/marketing/coupons' },
    { title: 'Storefront Banners & Marquee Ticker', category: 'Navigation', icon: Megaphone, href: '/admin/marketing/banners' },
    { title: 'Artisan Clusters & Provenance', category: 'Navigation', icon: ShieldCheck, href: '/admin?tab=clusters' },
    { title: 'Instagram Marketing Reels', category: 'Navigation', icon: Film, href: '/admin/marketing/instagram-reels' },
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
      title: 'View Mysore Flagship Salon Storefront',
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
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-fade-in select-none">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, SKU, order ID, or search sarees... (Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-4 text-sm bg-transparent placeholder:text-slate-400 font-sans focus:outline-none text-slate-900"
          />
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md flex-shrink-0 shadow-2xs">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-400">
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
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 cursor-pointer transition-colors group text-xs font-sans"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors flex-shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate group-hover:text-blue-600">
                          {item.title}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span className="uppercase text-slate-500 font-semibold">{item.category}</span>
                          {item.sku && <span>• {item.sku}</span>}
                          {item.price && <span className="text-emerald-700 font-bold">• {item.price}</span>}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="text-blue-600 font-semibold">NEELSAREEHOUSE Admin Console</span>
        </div>
      </div>
    </div>
  );
}
