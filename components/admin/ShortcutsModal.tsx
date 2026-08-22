'use client';

import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ K / Ctrl K', desc: 'Open Global Command Palette' },
    { key: '/', desc: 'Focus Quick Filter / Table Search' },
    { key: 'N', desc: 'Create New Handloom SKU / Saree' },
    { key: 'R', desc: 'Refresh Live Order Pipeline' },
    { key: '?', desc: 'Open Keyboard Shortcuts Cheat Sheet' },
    { key: 'Esc', desc: 'Close any active modal or drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Admin Console Keyboard Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 divide-y divide-slate-100">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-sans">
              <span className="text-slate-600 font-medium">{sc.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-md font-mono text-[11px] font-bold text-slate-800 shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] font-mono text-slate-500">
          Press <kbd className="font-bold text-slate-700">Esc</kbd> anytime to dismiss
        </div>
      </div>
    </div>
  );
}
