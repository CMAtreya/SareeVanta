'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  Phone,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bagCount, setBagCount] = useState(2);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Slim, Minimal Glassmorphic Fixed Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'bg-[#FAF3E4]/90 backdrop-blur-md shadow-sm border-b border-[#C87F4A]/15 py-3.5'
            : 'bg-transparent backdrop-blur-none border-b border-transparent py-5 sm:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between">
            {/* Left: Brand Monogram & Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              {/* Brand Logo Emblem */}
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-full p-0.5 bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-[#FAF3E4] overflow-hidden flex items-center justify-center p-0.5">
                  <img
                    src="/logo.png"
                    alt="Neelsareehouse Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Wordmark */}
              <div className="flex flex-col">
                <span className="font-editorial text-xl sm:text-2xl font-semibold tracking-wide text-[#1F1B16] leading-none">
                  Neelsareehouse
                </span>
                <span className="text-[9px] tracking-[0.28em] uppercase text-[#773D21] font-sans font-medium mt-0.5">
                  Mysuru • Estd. 2021
                </span>
              </div>
            </Link>

            {/* Center: Editorial Links */}
            <nav className="hidden lg:flex items-center space-x-7 xl:space-x-9 text-[13px] tracking-[0.14em] uppercase font-sans font-medium text-[#1F1B16]/85">
              {/* Mandatory OUR STORY link pointing to /our-story */}
              <Link
                href="/our-story"
                className="text-[#C87F4A] hover:text-[#9E471D] font-semibold transition-colors py-1 relative group"
              >
                <span>Our Story</span>
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C87F4A]"></span>
              </Link>

              <Link
                href="/our-story#collections"
                className="hover:text-[#C87F4A] transition-colors py-1 relative group"
              >
                <span>Collections</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C87F4A] transition-all duration-300 group-hover:w-full"></span>
              </Link>

              <Link
                href="/our-story#craft"
                className="hover:text-[#C87F4A] transition-colors py-1 relative group"
              >
                <span>Our Craft</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C87F4A] transition-all duration-300 group-hover:w-full"></span>
              </Link>

              <Link
                href="/our-story#bridal"
                className="hover:text-[#C87F4A] transition-colors py-1 relative group"
              >
                <span>Bridal</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C87F4A] transition-all duration-300 group-hover:w-full"></span>
              </Link>

              <Link
                href="/our-story#store"
                className="hover:text-[#C87F4A] transition-colors py-1 relative group"
              >
                <span>Store</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C87F4A] transition-all duration-300 group-hover:w-full"></span>
              </Link>

              <Link
                href="/our-story#journal"
                className="hover:text-[#C87F4A] transition-colors py-1 relative group"
              >
                <span>Journal</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#C87F4A] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Right: CTA Button with Terracotta-to-Gold Gradient Border */}
            <div className="flex items-center space-x-4">
              {/* Bag Trigger */}
              <Link
                href="/our-story#collections"
                className="relative text-[#1F1B16] hover:text-[#C87F4A] transition-colors p-1.5 hidden sm:block"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 bg-[#C87F4A] text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {bagCount}
                </span>
              </Link>

              {/* Gradient Border CTA Button: "Shop the Edit" */}
              <Link
                href="/our-story#collections"
                className="relative group p-[1px] rounded-sm transition-all duration-300 hover:shadow-silk hidden sm:inline-block"
              >
                {/* Gradient Border Background */}
                <span className="absolute inset-0 rounded-sm bg-gradient-to-r from-[#C87F4A] via-[#B8892B] to-[#C87F4A] transition-opacity duration-300" />
                {/* Inner Button */}
                <span className="relative block px-5 py-2.5 rounded-[1px] bg-[#FAF3E4] group-hover:bg-[#C87F4A] text-[#1F1B16] group-hover:text-white text-[11px] font-sans font-semibold uppercase tracking-[0.18em] transition-all duration-300">
                  Shop the Edit
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="text-[#1F1B16] hover:text-[#C87F4A] transition-colors p-1.5 lg:hidden rounded-sm"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF3E4] shadow-2xl p-7 flex flex-col justify-between border-l border-[#C87F4A]/25 z-10">
            <div>
              {/* Mobile Header Brand */}
              <div className="flex items-center justify-between pb-6 border-b border-[#C87F4A]/20">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-[#E2CE9F] via-[#C87F4A] to-[#B8892B]">
                    <img
                      src="/logo.png"
                      alt="Neelsareehouse Logo"
                      className="w-full h-full object-contain bg-[#FAF3E4] rounded-full p-0.5"
                    />
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-semibold text-[#1F1B16]">
                      Neelsareehouse
                    </h3>
                    <span className="text-[9px] tracking-widest text-[#773D21] uppercase font-mono block">
                      Mysuru • Estd. 2021
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-stone-700 hover:text-[#C87F4A] p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="mt-8 flex flex-col space-y-5 text-xs tracking-[0.2em] uppercase font-medium">
                <Link
                  href="/our-story"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#C87F4A] font-bold py-2 border-b border-[#C87F4A]/30 flex justify-between items-center"
                >
                  <span>Our Story (Loom Journey)</span>
                  <span className="text-[10px] text-[#C87F4A] font-mono">01</span>
                </Link>
                <Link
                  href="/our-story#collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F1B16] hover:text-[#C87F4A] transition-colors py-2 border-b border-stone-200/50 flex justify-between items-center"
                >
                  <span>Collections</span>
                  <span className="text-[10px] text-[#C87F4A] font-mono">02</span>
                </Link>
                <Link
                  href="/our-story#craft"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F1B16] hover:text-[#C87F4A] transition-colors py-2 border-b border-stone-200/50 flex justify-between items-center"
                >
                  <span>Our Craft</span>
                  <span className="text-[10px] text-[#C87F4A] font-mono">03</span>
                </Link>
                <Link
                  href="/our-story#bridal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F1B16] hover:text-[#C87F4A] transition-colors py-2 border-b border-stone-200/50 flex justify-between items-center"
                >
                  <span>Bridal</span>
                  <span className="text-[10px] text-[#C87F4A] font-mono">04</span>
                </Link>
                <Link
                  href="/our-story#store"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F1B16] hover:text-[#C87F4A] transition-colors py-2 border-b border-stone-200/50 flex justify-between items-center"
                >
                  <span>Store</span>
                  <span className="text-[10px] text-[#C87F4A] font-mono">05</span>
                </Link>
                <Link
                  href="/our-story#journal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#1F1B16] hover:text-[#C87F4A] transition-colors py-2 border-b border-stone-200/50 flex justify-between items-center"
                >
                  <span>Journal</span>
                  <span className="text-[10px] text-[#C87F4A] font-mono">06</span>
                </Link>
              </div>
            </div>

            {/* Mobile Bottom Actions */}
            <div className="pt-6 border-t border-[#C87F4A]/20 flex flex-col gap-3">
              <Link
                href="/our-story#collections"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-[#C87F4A] hover:bg-[#B36737] text-white py-3.5 rounded-sm text-xs font-semibold tracking-widest uppercase transition-colors text-center shadow-md"
              >
                <span>Shop the Edit</span>
              </Link>
              <a
                href="https://wa.me/918212423344"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#1F1B16] text-[#FAF3E4] py-2.5 rounded-sm text-xs font-medium tracking-wider uppercase transition-colors text-center"
              >
                <Phone className="w-3.5 h-3.5 text-[#B8892B]" />
                <span>Sayyaji Rao Rd Salon</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
