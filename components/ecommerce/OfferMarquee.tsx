import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useCart } from '@/components/providers/CartContext';

export default function OfferMarquee() {
  const { isMarqueeDismissed, setIsMarqueeDismissed } = useCart();
  const [liveMessages, setLiveMessages] = useState<string[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/marquee')
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          const activeOnly = data.messages.filter((m: any) => m.is_active).map((m: any) => m.message_text);
          if (activeOnly.length > 0) {
            setLiveMessages(activeOnly);
          }
        }
      })
      .catch((err) => console.error('[OfferMarquee] Error fetching marquee messages:', err));
  }, []);

  if (isMarqueeDismissed) return null;

  const defaultMessages = [
    '✦ FESTIVE WEAVE EDIT NOW LIVE',
    '✦ FREE INSURED EXPRESS SHIPPING ON ORDERS ABOVE ₹10,000',
    '✦ 100% KARNATAKA MULBERRY SILK MARK CERTIFIED',
    '✦ COMPLIMENTARY FALL, PICO & CUSTOM BLOUSE STITCHING',
    '✦ SAYYAJI RAO RD MYSURU FLAGSHIP SALON OPEN 10:30 AM – 8:30 PM',
    '✦ WORLDWIDE EXPRESS DELIVERY TO 45+ COUNTRIES',
  ];

  const messages = liveMessages || defaultMessages;

  return (
    <div className="relative bg-[#C87F4A] text-[#FAF3E4] py-1.5 px-4 overflow-hidden z-50 border-b border-[#FAF3E4]/15 w-full">
      <div className="flex items-center justify-between w-full px-2 sm:px-4 lg:px-8">
        {/* Infinite scrolling marquee track */}
        <div className="flex-1 overflow-hidden whitespace-nowrap mask-marquee">
          <div className="inline-flex animate-marquee space-x-8 text-[11px] font-sans font-semibold tracking-[0.16em] uppercase">
            {[...messages, ...messages].map((text, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span>{text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setIsMarqueeDismissed(true)}
          className="ml-4 p-1 text-[#FAF3E4]/80 hover:text-white transition-colors rounded-sm flex-shrink-0"
          aria-label="Dismiss promotional marquee"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
