'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  RotateCcw,
  Package,
  Layers,
  Sparkles,
  Film,
  Tag,
  Megaphone,
  Wand2,
  Users,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Command,
  Bell,
  ExternalLink,
  RefreshCw,
  LogOut,
  Shield,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Store,
  Clock,
  Moon,
  Sun,
  Star,
  FolderOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from '@/components/admin/CommandPalette';
import ShortcutsModal from '@/components/admin/ShortcutsModal';
import NewProductModal from '@/components/admin/NewProductModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Auth & UI States
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<string>('Smt. Chandrakala Devi');
  const [adminRole, setAdminRole] = useState<string>('Master Guild SuperAdmin');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentStore, setCurrentStore] = useState('Mysuru Sayyaji Rao Flagship');
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [environment, setEnvironment] = useState<'LIVE' | 'STAGING'>('LIVE');

  // Modals & Panels
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isSyncing, setIsSyncing] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'HIGH_VALUE',
      title: 'High-Value Bridal Order Received',
      desc: 'Smt. Radhika Reddy purchased 3-Shuttle Kanchipuram Brocade (₹68,000).',
      time: '4 mins ago',
      unread: true,
    },
    {
      id: 'notif-2',
      type: 'LOW_STOCK',
      title: 'Low Stock Alert on Looms',
      desc: 'Royal Wodeyar Crimson Crepe Silk has only 2 pieces remaining.',
      time: '18 mins ago',
      unread: true,
    },
    {
      id: 'notif-3',
      type: 'WEBHOOK',
      title: 'BlueDart Manifest Synced',
      desc: '14 parcels ready for pickup at Mysuru Flagship Salon.',
      time: '1 hour ago',
      unread: false,
    },
  ]);

  // Check auth on every navigation / mount
  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthorized(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const hasCookie = document.cookie.includes('neel_admin_session=');
      const stored = localStorage.getItem('neel_admin_session');

      if (hasCookie || stored) {
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.user) setAdminUser(parsed.user);
            if (parsed.role) setAdminRole(parsed.role);
          } catch (e) {}
        }
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, router]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (⌘K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Keyboard Shortcuts Cheat Sheet (?)
      if (
        e.key === '?' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }

      // Quick New Handloom SKU (N)
      if (
        (e.key === 'n' || e.key === 'N') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsNewProductModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Manual Data Sync
  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime('Just now');
    }, 650);
  };

  // Handle Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'neel_admin_session=; path=/; max-age=0; SameSite=Lax';
      localStorage.removeItem('neel_admin_session');
    }
    router.replace('/admin/login');
  };

  // If on admin login page, bypass layout shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If checking authentication, render secure barrier screen
  if (isAuthorized === null || isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="bg-slate-900/90 rounded-2xl p-8 border border-slate-800 shadow-2xl max-w-sm w-full text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Authenticating Admin Workspace
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Establishing 256-bit encrypted master session...
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 font-sans flex select-none">
      {/* ================================================== */}
      {/* 1. COLLAPSIBLE LEFT NAVIGATION (#0F172A)           */}
      {/* ================================================== */}
      <aside
        className={`bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col flex-shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 overflow-hidden ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header & Environment Badge */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 flex-shrink-0 bg-[#0F172A] z-10">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex-shrink-0">
                <picture>
                  <source srcSet="/assets/logo.webp" type="image/webp" />
                  <img
                    src="/assets/logo.jpg"
                    alt="NEELSAREEHOUSE"
                    className="w-full h-full object-cover bg-[#0F172A] rounded-md"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('logo.webp')) {
                        target.src = '/assets/logo.webp';
                      }
                    }}
                  />
                </picture>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white uppercase tracking-wider truncate">
                  NEEL SAREE HOUSE
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      environment === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    {environment} Console
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 mx-auto">
              <picture>
                <source srcSet="/assets/logo.webp" type="image/webp" />
                <img
                  src="/assets/logo.jpg"
                  alt="NEELSAREEHOUSE"
                  className="w-full h-full object-cover bg-[#0F172A] rounded-md"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('logo.webp')) {
                      target.src = '/assets/logo.webp';
                    }
                  }}
                />
              </picture>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Store Switcher Dropdown */}
        {!isSidebarCollapsed && (
          <div className="px-3 pt-3 pb-1 flex-shrink-0 bg-[#0F172A] relative z-10">
            <button
              type="button"
              onClick={() => setIsStoreSwitcherOpen(!isStoreSwitcherOpen)}
              className="w-full px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800/90 text-left border border-slate-800 rounded-xl text-xs flex items-center justify-between transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Store className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate text-[11px] font-medium text-slate-200">{currentStore}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
            </button>

            {isStoreSwitcherOpen && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-40 space-y-1 text-xs">
                {[
                  'Mysuru Sayyaji Rao Flagship',
                  'Bengaluru Showcase Salon',
                  'Global Online Boutique',
                ].map((store) => (
                  <button
                    key={store}
                    type="button"
                    onClick={() => {
                      setCurrentStore(store);
                      setIsStoreSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-colors flex items-center justify-between ${
                      currentStore === store
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{store}</span>
                    {currentStore === store && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Smooth Scrollable Navigation Container */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 admin-sidebar-scroll px-3 py-2 space-y-4 text-xs font-sans select-none"
        >
          {/* Section 1: Commerce */}
          <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  Commerce
                </div>
              )}
              <Link
                href="/admin"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Dashboard Overview"
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </Link>

              <Link
                href="/admin/orders"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/orders'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Live Orders"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Orders</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                    14
                  </span>
                )}
              </Link>

              <Link
                href="/admin/orders"
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
                title="BlueDart Shipments"
              >
                <Truck className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Shipments</span>}
              </Link>

              <Link
                href="/admin/returns"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/returns')
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Returns & Exchanges"
              >
                <RotateCcw className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Returns & Exchanges</span>}
              </Link>
            </div>

            {/* Section 2: Merchandising */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  Merchandising
                </div>
              )}
              <Link
                href="/admin/catalog"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/catalog'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Catalog & Products"
              >
                <Package className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Catalog / Products</span>}
              </Link>

              <Link
                href="/admin/inventory"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/inventory'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Silk Mark Inventory Matrix"
              >
                <Layers className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Inventory Matrix</span>}
              </Link>

              <Link
                href="/admin/catalog/collections"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.includes('/collections')
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Curated Collections & Heritage Taxonomy"
              >
                <FolderOpen className="w-4 h-4 flex-shrink-0 text-amber-400" />
                {!isSidebarCollapsed && <span>Collections & Taxonomy</span>}
              </Link>
            </div>

            {/* Section 3: Growth & Studio */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  Growth & Studio
                </div>
              )}
              <Link
                href="/admin/marketing/instagram-reels"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/marketing/instagram-reels'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Live Shopping & Reels Manager"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>Live Shopping Manager</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </Link>

              <Link
                href="/admin/marketing/coupons"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/marketing/coupons')
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Marketing & Discounts"
              >
                <Tag className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Marketing & Discounts</span>}
              </Link>

              <Link
                href="/admin/marketing/banners"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/marketing/banners')
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Banners & Marquee"
              >
                <Megaphone className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Banners & Marquee</span>}
              </Link>



              <Link
                href="/admin/customerreviews"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/customerreviews')
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Review Moderation & UGC Hub"
              >
                <Star className="w-4 h-4 flex-shrink-0 text-amber-400" />
                {!isSidebarCollapsed && <span>Customer Reviews & UGC</span>}
              </Link>
            </div>

            {/* Section 4: Operations */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  Operations
                </div>
              )}
              <Link
                href="/admin/customers"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/customers')
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Customers & CRM"
              >
                <Users className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Customers & CRM</span>}
              </Link>

              <Link
                href="/admin/analytics"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/analytics')
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Performance Analytics & Reports"
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Analytics & Reports</span>}
              </Link>

              <Link
                href="/admin/settings/staff"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/settings/staff')
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Staff & Roles (RBAC)"
              >
                <UserCog className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Staff & Roles</span>}
              </Link>

              <Link
                href="/admin/settings"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/settings' || (pathname.startsWith('/admin/settings') && !pathname.startsWith('/admin/settings/staff'))
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                title="Master Store Configuration"
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>Store Settings</span>}
              </Link>
            </div>
          </div>

        {/* Bottom Profile Chip */}
        <div className="p-3 border-t border-slate-800/80 flex-shrink-0 bg-slate-950/60">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/40 flex-shrink-0">
                  SC
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{adminUser}</div>
                  <div className="text-[10px] font-mono text-amber-400 truncate">{adminRole}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Sign Out of Admin Console"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ================================================== */}
      {/* 2. MAIN CONTENT AREA & TOP WORKSPACE BAR           */}
      {/* ================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Workspace Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Global Search with ⌘K Trigger */}
          <div className="flex-1 max-w-lg mr-4">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl text-xs flex items-center justify-between transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                <span className="font-sans">Search orders, patrons, SKUs, weavers...</span>
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-mono bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-600 shadow-2xs">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Live Storefront Shortcut */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>View Live Site</span>
            </Link>

            {/* System Notifications Bell & Slide-Over Tray */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notifications Slide-Over Tray */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-40 space-y-3 animate-fade-in text-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-sans">System Alerts & Notifications</span>
                      <span className="px-1.5 py-0.2 text-[10px] font-mono bg-blue-50 text-blue-700 rounded font-bold">
                        {unreadNotifCount} New
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900">{notif.title}</span>
                          <span className="text-[10px] font-mono text-slate-400">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-sans">{notif.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                      className="text-blue-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                    <span className="text-slate-400">Mysuru Node Sync</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick New Handloom SKU CTA */}
            <button
              type="button"
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Saree SKU</span>
            </button>
          </div>
        </header>

        {/* Dynamic Breadcrumbs & Context Sync Bar */}
        <div className="h-10 bg-slate-50/80 border-b border-[#E2E8F0] px-6 lg:px-8 flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="hover:text-blue-600 transition-colors">
              Console
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">
              {pathname === '/admin'
                ? 'Commerce & Orders'
                : pathname.replace('/admin/', '').replace('-', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Loom sync: {lastSyncTime}</span>
            </div>
            <button
              type="button"
              onClick={handleTriggerSync}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 rounded transition-colors"
              title="Trigger Immediate Sync"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Content Area with Smooth Page Transitions */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Command Palette & Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenNewProductModal={() => setIsNewProductModalOpen(true)}
      />
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />
    </div>
  );
}
