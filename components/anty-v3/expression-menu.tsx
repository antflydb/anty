'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExpressionName } from '@/lib/anty-v3/animation-state';

interface ExpressionMenuProps {
  onExpressionSelect: (expression: ExpressionName) => void;
}

const EXPRESSIONS: { name: ExpressionName; emoji: string; label: string }[] = [
  { name: 'idle', emoji: '😐', label: 'Idle' },
  { name: 'happy', emoji: '😊', label: 'Happy' },
  { name: 'excited', emoji: '🤩', label: 'Excited' },
  { name: 'wink', emoji: '😉', label: 'Wink' },
  { name: 'thinking', emoji: '🤔', label: 'Thinking' },
  { name: 'curious', emoji: '🧐', label: 'Curious' },
  { name: 'proud', emoji: '😌', label: 'Proud' },
  { name: 'sad', emoji: '😢', label: 'Sad' },
  { name: 'tired', emoji: '😴', label: 'Tired' },
  { name: 'sleepy', emoji: '🥱', label: 'Sleepy' },
  { name: 'confused', emoji: '😕', label: 'Confused' },
  { name: 'angry', emoji: '😠', label: 'Angry' },
  { name: 'sick', emoji: '🤢', label: 'Sick' },
  { name: 'talking', emoji: '💬', label: 'Talking' },
  { name: 'blink', emoji: '👀', label: 'Blink' },
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

      {/* Toggle button with pixel ellipsis */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white rounded-full shadow-lg border border-gray-200 w-14 h-14 flex items-center justify-center hover:bg-gray-50 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex gap-1"
        >
          {/* Pixel-style three squares (ellipsis) */}
          <div className="w-1.5 h-1.5 bg-gray-700 rounded-sm" />
          <div className="w-1.5 h-1.5 bg-gray-700 rounded-sm" />
          <div className="w-1.5 h-1.5 bg-gray-700 rounded-sm" />
        </motion.div>
      </motion.button>
    </div>
  );
}
