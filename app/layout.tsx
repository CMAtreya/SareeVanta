import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from '@/components/providers/SmoothScroll';
import { CartProvider } from '@/components/providers/CartContext';
import StorefrontLayout from '@/components/layout/StorefrontLayout';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#FAF3E4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'NEELSAREEHOUSE | Heritage Silk Sarees of Mysuru',
  description:
    'Purveyors of heirloom pure silk sarees since 2021. Handwoven Kanchipuram, Royal Mysore Silk, Banarasi, and Paithani masterpieces from the royal looms of Mysuru.',
  keywords: [
    'NEELSAREEHOUSE',
    'Neel Saree House',
    'Mysore Silk Saree',
    'Kanchipuram Silk Saree',
    'Banarasi Saree',
    'Pure Zari Saree',
    'Bridal Silk Sarees',
    'Mysuru Heritage',
  ],
  openGraph: {
    title: 'NEELSAREEHOUSE | Heritage Silk Sarees of Mysuru',
    description:
      'Where every drape tells a story. Discover royal Mysore silk, heirloom Kanchipuram, and pure zari weaves.',
    url: 'https://neelsareehouse.com',
    siteName: 'NEELSAREEHOUSE Mysuru',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/logo.png', width: 800, height: 800, alt: 'NEELSAREEHOUSE Logo' }],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${plusJakarta.variable}`}
    >
      <body className="bg-[#FAF3E4] text-[#1F1B16] selection:bg-[#C87F4A] selection:text-white min-h-screen flex flex-col antialiased">
        <CartProvider>
          <SmoothScrollProvider>
            <StorefrontLayout>{children}</StorefrontLayout>
          </SmoothScrollProvider>
        </CartProvider>
        {/* Global Instagram oEmbed script loaded once asynchronously */}
        <script async src="https://www.instagram.com/embed.js" />
      </body>
    </html>
  );
}
