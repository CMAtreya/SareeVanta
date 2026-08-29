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
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CommandPalette from '@/components/admin/CommandPalette';
import ShortcutsModal from '@/components/admin/ShortcutsModal';
import NewProductModal from '@/components/admin/NewProductModal';
import { useBrand } from '@/context/BrandContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { brandUpper, brandName } = useBrand();
  const pathname = usePathname();
  const router = useRouter();

  // Auth & UI States
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<string>('Smt. Chandrakala Devi');
  const [adminRole, setAdminRole] = useState<string>('Master Guild SuperAdmin');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
      desc: '14 parcels ready for pickup at Mysuru Flagship Store.',
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

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (⌘K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Keyboard Shortcuts Cheat Sheet (Alt+?)
      if (
        (e.altKey && e.key === '?') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }

      // Quick New Handloom SKU (Alt+N / ⌘N)
      if (
        ((e.metaKey || e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'n') &&
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
    <div className="bg-[#FAF6F0] min-h-screen text-[#1F1B16] font-sans flex relative overflow-x-hidden">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#18110E]/80 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ================================================== */}
      {/* 1. COLLAPSIBLE LEFT NAVIGATION (#18110E)           */}
      {/* ================================================== */}
      <aside
        className={`bg-[#18110E] text-[#DBCBBF] border-r border-[#2C1D17] flex flex-col flex-shrink-0 h-screen fixed inset-y-0 left-0 z-40 transition-all duration-300 overflow-hidden ${
          isMobileSidebarOpen
            ? 'translate-x-0 w-72 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header & Environment Badge */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2C1D17] flex-shrink-0 bg-[#18110E] z-10">
          {!isSidebarCollapsed || isMobileSidebarOpen ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex-shrink-0 shadow-xs">
                <picture>
                  <source srcSet="/assets/logo.webp" type="image/webp" />
                  <img
                    src="/assets/logo.jpg"
                    alt="NEELSAREEHOUSE"
                    className="w-full h-full object-cover bg-[#18110E] rounded-md"
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
                <div className="font-bold text-xs text-[#FAF3E4] uppercase tracking-wider truncate">
                  {brandUpper}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      environment === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#E2CE9F] font-bold">
                    {environment} Console
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg p-0.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 mx-auto shadow-xs">
              <picture>
                <source srcSet="/assets/logo.webp" type="image/webp" />
                <img
                  src="/assets/logo.jpg"
                  alt="NEELSAREEHOUSE"
                  className="w-full h-full object-cover bg-[#18110E] rounded-md"
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

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1 rounded-lg text-stone-400 hover:text-white hover:bg-[#281A14] transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#281A14] transition-colors"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Store Switcher Dropdown */}
        {(!isSidebarCollapsed || isMobileSidebarOpen) && (
          <div className="px-3 pt-3 pb-1 flex-shrink-0 bg-[#18110E] relative z-10">
            <div className="w-full px-2.5 py-1.5 bg-[#241712] border border-[#38231B] rounded-xl text-xs flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-[#C87F4A] flex-shrink-0" />
              <div className="min-w-0">
                <span className="truncate text-[11px] font-bold text-[#FAF3E4] block">Mysuru Sayyaji Rao Studio</span>
                <span className="text-[9px] font-mono text-stone-400 block">Single V1 Fulfillment Hub</span>
              </div>
            </div>
          </div>
        )}

        {/* Smooth Scrollable Navigation Container */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 admin-sidebar-scroll px-3 py-2 space-y-4 text-xs font-sans"
        >
          {/* Section 1: Commerce & Orders */}
          <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#9C8270] font-bold">
                  Commerce
                </div>
              )}
              <Link
                href="/admin"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin'
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Dashboard</span>}
              </Link>

              <Link
                href="/admin/orders"
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/orders'
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Orders"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShoppingCart className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                  {!isSidebarCollapsed && <span>Orders</span>}
                </div>
              </Link>

              <Link
                href="/admin/shipments"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/shipments')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Shipments"
              >
                <Truck className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Shipments</span>}
              </Link>

              <Link
                href="/admin/returns"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/returns')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Returns & Claims"
              >
                <RotateCcw className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Returns & Claims</span>}
              </Link>
            </div>

            {/* Section 2: Products & Inventory */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#9C8270] font-bold">
                  Catalog & Inventory
                </div>
              )}
              <Link
                href="/admin/catalog"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/catalog'
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Products / Catalog"
              >
                <Package className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Products / Catalog</span>}
              </Link>

              <Link
                href="/admin/inventory"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/inventory'
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Inventory"
              >
                <Layers className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Inventory</span>}
              </Link>

              <Link
                href="/admin/catalog/collections"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.includes('/collections')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Collections & Taxonomy"
              >
                <FolderOpen className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Collections & Taxonomy</span>}
              </Link>
            </div>

            {/* Section 3: Content & Marketing */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#9C8270] font-bold">
                  Content & Marketing
                </div>
              )}
              <Link
                href="/admin/marketing/coupons"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/marketing/coupons')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Discounts & Coupons"
              >
                <Tag className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Discounts & Coupons</span>}
              </Link>

              <Link
                href="/admin/marketing/banners"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/marketing/banners')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Homepage Content"
              >
                <Megaphone className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Homepage Content</span>}
              </Link>

              <Link
                href="/admin/marketing/instagram-reels"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname === '/admin/marketing/instagram-reels'
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Instagram Reels"
              >
                <Film className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Instagram Reels</span>}
              </Link>

              <Link
                href="/admin/customerreviews"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/customerreviews')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Reviews / UGC"
              >
                <Star className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Reviews / UGC</span>}
              </Link>
            </div>

            {/* Section 4: Operations & System */}
            <div className="space-y-0.5">
              {!isSidebarCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#9C8270] font-bold">
                  Operations & System
                </div>
              )}
              <Link
                href="/admin/customers"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/customers')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Customers"
              >
                <Users className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Customers</span>}
              </Link>

              <Link
                href="/admin/analytics"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/analytics')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Analytics & Reports"
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Analytics & Reports</span>}
              </Link>

              <Link
                href="/admin/settings/staff"
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/admin/settings')
                    ? 'bg-gradient-to-r from-[#7A1C30] to-[#9E2A3B] text-white font-semibold shadow-xs border border-[#C87F4A]/30'
                    : 'text-[#D6C7B7] hover:bg-[#281A14] hover:text-[#FAF3E4]'
                }`}
                title="Staff & RBAC"
              >
                <UserCog className="w-4 h-4 flex-shrink-0 text-[#C87F4A]" />
                {!isSidebarCollapsed && <span>Staff & RBAC</span>}
              </Link>
            </div>
          </div>

        {/* Bottom Profile Chip */}
        <div className="p-3 border-t border-[#2C1D17] flex-shrink-0 bg-[#120D0A]">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#7A1C30]/40 text-[#E2CE9F] flex items-center justify-center font-bold text-xs border border-[#C87F4A]/40 flex-shrink-0">
                  SC
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#FAF3E4] truncate">{adminUser}</div>
                  <div className="text-[10px] font-mono text-[#C87F4A] truncate">{adminRole}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-[#281A14] transition-colors"
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
              className="w-full p-2 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-[#281A14] flex items-center justify-center transition-colors"
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
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#FAF6F0] transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Workspace Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#E8DCC9] px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-2 flex-1 max-w-lg mr-2 sm:mr-4 min-w-0">
            {/* Mobile Hamburger Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-[#1F1B16] hover:bg-[#FAF3E4] flex-shrink-0 transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search with ⌘K Trigger */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full px-2.5 sm:px-3.5 py-2 bg-[#FAF6F0] hover:bg-white text-stone-600 hover:text-stone-900 border border-[#E8DCC9] hover:border-[#C87F4A]/40 rounded-xl text-xs flex items-center justify-between transition-all shadow-2xs group min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-4 h-4 text-stone-400 group-hover:text-[#7A1C30] flex-shrink-0 transition-colors" />
                <span className="font-sans truncate hidden sm:inline">Search orders, patrons, SKUs, weavers...</span>
                <span className="font-sans truncate sm:hidden">Search...</span>
              </div>
              <div className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono bg-white border border-[#E8DCC9] px-2 py-0.5 rounded text-stone-600 shadow-2xs flex-shrink-0">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live Storefront Shortcut */}
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF3E4] hover:bg-[#F3E8D0] text-[#7A1C30] text-xs font-semibold border border-[#C87F4A]/25 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C87F4A]" />
              <span>Live Site</span>
            </Link>

            {/* System Notifications Bell & Slide-Over Tray */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg bg-[#FAF3E4] hover:bg-[#F3E8D0] text-stone-700 border border-[#E8DCC9] transition-colors"
                title="System Notifications"
              >
                <Bell className="w-4 h-4 text-stone-600" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#7A1C30] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notifications Slide-Over Tray */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E8DCC9] p-4 z-40 space-y-3 animate-fade-in text-[#1F1B16]">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-sans">System Alerts</span>
                      <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#FAF3E4] text-[#7A1C30] border border-[#C87F4A]/30 rounded font-bold">
                        {unreadNotifCount} New
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto font-sans">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-stone-900">{notif.title}</span>
                          <span className="text-[10px] font-mono text-stone-400">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 font-sans">{notif.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                      className="text-[#7A1C30] font-bold hover:underline"
                    >
                      Mark all as read
                    </button>
                    <span className="text-stone-400">Mysuru Node</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick New Handloom SKU CTA */}
            <button
              type="button"
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7A1C30] to-[#A33B45] hover:from-[#5F1424] hover:to-[#7A1C30] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-200" />
              <span className="hidden sm:inline">New Saree SKU</span>
              <span className="sm:hidden">New SKU</span>
            </button>
          </div>
        </header>

        {/* Dynamic Breadcrumbs & Context Sync Bar */}
        <div className="h-10 bg-[#FAF3E4]/70 border-b border-[#E8DCC9] px-3 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-mono text-stone-600 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 truncate mr-2">
            <Link href="/admin" className="hover:text-[#7A1C30] transition-colors flex-shrink-0 font-medium">
              Console
            </Link>
            <span>/</span>
            <span className="font-semibold text-stone-900 truncate">
              {pathname === '/admin'
                ? 'Commerce & Orders'
                : pathname.replace('/admin/', '').replace('-', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3 h-3 text-[#C87F4A]" />
              <span>Loom sync: {lastSyncTime}</span>
            </div>
            <button
              type="button"
              onClick={handleTriggerSync}
              className="p-1 text-stone-400 hover:text-[#7A1C30] hover:bg-[#FAF3E4] rounded transition-colors"
              title="Trigger Immediate Sync"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#7A1C30]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Content Area with Smooth Page Transitions */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 w-full max-w-7xl mx-auto min-w-0 overflow-x-hidden">
          <AnimatePresence>
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
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
