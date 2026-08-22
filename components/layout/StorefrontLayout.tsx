'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/ecommerce/Header';
import Footer from '@/components/ecommerce/Footer';
import CartDrawer from '@/components/ecommerce/CartDrawer';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="flex-grow w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
