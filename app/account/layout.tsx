'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  Heart,
  MapPin,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';
import { createClient } from '@/lib/supabase/client';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { wishlistCount } = useCart();

  const [userInfo, setUserInfo] = useState<{ name: string; email: string; initials: string }>({
    name: 'Patron',
    email: '',
    initials: 'P',
  });

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const meta = user.user_metadata || {};
        const fullName =
          meta.full_name ||
          meta.name ||
          (meta.given_name ? `${meta.given_name} ${meta.family_name || ''}`.trim() : '') ||
          user.email?.split('@')[0] ||
          'Patron';

        const parts = fullName.split(' ');
        const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : fullName.substring(0, 2).toUpperCase();

        setUserInfo({
          name: fullName,
          email: user.email || '',
          initials,
        });
      }
    }

    loadUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    {
      href: '/account/orders',
      label: 'My Orders',
      icon: Package,
      exact: false,
    },
    {
      href: '/account/wishlist',
      label: 'Wishlist & Saved Sarees',
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : undefined,
    },
    {
      href: '/account/addresses',
      label: 'Saved Address Book',
      icon: MapPin,
    },
    {
      href: '/account/profile',
      label: 'Profile & Notifications',
      icon: User,
    },
  ];

  return (
    <div className="bg-[#FAF3E4] min-h-screen text-[#1F1B16] py-6 sm:py-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
        {/* Breadcrumb Header */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500 font-sans mb-6">
          <Link href="/" className="hover:text-[#C87F4A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-[#1F1B16] font-semibold">Patron Account Salon</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==================================================== */}
          {/* PERSISTENT LEFT ACCOUNT SIDEBAR (COL-4)              */}
          {/* ==================================================== */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#C87F4A]/25 shadow-silk space-y-6">
            {/* User Profile Card Header */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-[#C87F4A]/20">
              <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#C87F4A] to-[#773D21] text-white flex items-center justify-center font-editorial font-bold text-xl shadow-md border-2 border-white">
                {userInfo.initials}
              </div>
              <div className="truncate">
                <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[#C87F4A] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Patron Account</span>
                </div>
                <h2 className="font-editorial text-lg font-bold text-[#1F1B16] truncate">
                  {userInfo.name}
                </h2>
                <span className="text-xs text-stone-500 font-sans block truncate">
                  {userInfo.email}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 text-xs font-sans font-medium">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === '/account/orders' && pathname.startsWith('/account/orders')) ||
                  (item.href === '/account/orders' && pathname === '/account');

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#C87F4A] text-white font-bold shadow-sm'
                        : 'text-stone-700 hover:bg-[#FAF3E4] hover:text-[#C87F4A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#C87F4A]'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-[#C87F4A]'
                            : 'bg-[#FAF3E4] text-[#773D21] border border-[#C87F4A]/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Logout Button */}
              <div className="pt-4 border-t border-stone-100 mt-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-stone-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>

            {/* Silk Mark Patronage Badge */}
            <div className="p-3.5 rounded-2xl bg-[#FAF3E4]/70 border border-[#C87F4A]/25 flex items-center gap-2.5 text-[11px] text-stone-700 font-sans">
              <ShieldCheck className="w-4 h-4 text-[#C87F4A] flex-shrink-0" />
              <span>Silk Mark Patron Membership Estd. 2021</span>
            </div>
          </aside>

          {/* ==================================================== */}
          {/* MAIN CONTENT AREA PER ROUTE (COL-8)                  */}
          {/* ==================================================== */}
          <main className="lg:col-span-8 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
