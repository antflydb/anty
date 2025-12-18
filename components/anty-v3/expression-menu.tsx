'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExpressionName } from '@/lib/anty-v3/animation-state';

interface ExpressionMenuProps {
  onExpressionSelect: (expression: ExpressionName) => void;
}

const EXPRESSIONS: { name: ExpressionName; emoji: string; label: string }[] = [
  { name: 'happy', emoji: '😊', label: 'Happy' },
  { name: 'excited', emoji: '🎉', label: 'Excited' },
  { name: 'spin', emoji: '🌀', label: 'Spin' },
  { name: 'shocked', emoji: '😲', label: 'Shocked' },
  { name: 'wink', emoji: '😉', label: 'Wink' },
];

export function ExpressionMenu({ onExpressionSelect }: ExpressionMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleExpressionClick = (expression: ExpressionName) => {
    onExpressionSelect(expression);
    // Don't auto-collapse - keep menu open
  };

  return (
    <div ref={menuRef} className="fixed bottom-8 right-8 flex flex-col items-end gap-2">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3 max-h-96 overflow-y-auto"
            style={{ width: '200px' }}
          >
            <div className="grid grid-cols-2 gap-2">
              {EXPRESSIONS.map((expr) => (
                <motion.button
                  key={expr.name}
                  onClick={() => handleExpressionClick(expr.name)}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">{expr.emoji}</span>
                  <span className="text-xs text-gray-600 font-medium">{expr.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button with menu SVG */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="56" height="56" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_592_702)">
              <path d="M2.03906 35.1262C2.03906 16.4773 17.157 1.35938 35.8059 1.35938V1.35938C54.4548 1.35938 69.5727 16.4773 69.5727 35.1262V35.1262C69.5727 53.7751 54.4548 68.893 35.8059 68.893V68.893C17.157 68.893 2.03906 53.7751 2.03906 35.1262V35.1262Z" fill="#F4F4F4"/>
            </g>
            <rect x="23.0391" y="32.7051" width="5.27686" height="5.27686" fill="#606060" fillOpacity="0.57"/>
            <rect x="33.123" y="32.7051" width="5.27686" height="5.27686" fill="#606060" fillOpacity="0.57"/>
            <rect x="43.2715" y="32.7051" width="5.27686" height="5.27686" fill="#606060" fillOpacity="0.57"/>
            <defs>
              <filter id="filter0_d_592_702" x="-0.0009377" y="-0.000625193" width="71.6132" height="71.6132" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="0.68"/>
                <feGaussianBlur stdDeviation="1.02"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.19 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_592_702"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_592_702" result="shape"/>
              </filter>
            </defs>
          </svg>
        </motion.div>
      </motion.button>
    </div>
  );
}
