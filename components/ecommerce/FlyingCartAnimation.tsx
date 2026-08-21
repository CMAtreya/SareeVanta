'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  destX: number;
  destY: number;
}

interface FlyingCartAnimationProps {
  items: FlyingItem[];
  onComplete: (id: string) => void;
}

export default function FlyingCartAnimation({ items, onComplete }: FlyingCartAnimationProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {items.map((item) => {
          // Midpoint arched upward control point for parabolic flight
          const midX = (item.startX + item.destX) / 2;
          const midY = Math.min(item.startY, item.destY) - 120;

          return (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX - 36,
                y: item.startY - 44,
                scale: 1,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: [item.startX - 36, midX - 25, item.destX - 14],
                y: [item.startY - 44, midY, item.destY - 14],
                scale: [1, 0.75, 0.2],
                rotate: [0, -12, 15],
                opacity: [1, 0.95, 0.1],
              }}
              transition={{
                duration: 0.85,
                ease: [0.25, 1, 0.5, 1], // Smooth cubic-bezier flight curve
                times: [0, 0.55, 1],
              }}
              onAnimationComplete={() => onComplete(item.id)}
              className="absolute top-0 left-0 w-[72px] h-[88px] rounded-2xl overflow-hidden border-2 border-[#C87F4A] shadow-[0_0_30px_rgba(200,127,74,0.85)] bg-[#FAF3E4] z-50 pointer-events-none"
            >
              <img
                src={item.image}
                alt="Adding saree to bag"
                className="w-full h-full object-cover select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#C87F4A]/30 to-transparent pointer-events-none" />
              <div className="absolute -top-1 -right-1 p-1 bg-[#C87F4A] text-white rounded-full shadow-md">
                <Sparkles className="w-3 h-3 animate-spin" />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
