'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';
import type { ExpressionName } from '@/lib/anty-v3/animation-state';

interface ExpressionMenuProps {
  onExpressionSelect: (expression: ExpressionName) => void;
  currentExpression: ExpressionName;
}

const EXPRESSIONS: { name: ExpressionName; emoji: string; label: string; hotkey: string }[] = [
  { name: 'happy', emoji: '😊', label: 'Happy', hotkey: '1' },
  { name: 'excited', emoji: '🎉', label: 'Excited', hotkey: '2' },
  { name: 'spin', emoji: '🌀', label: 'Spin', hotkey: '3' },
  { name: 'shocked', emoji: '😲', label: 'Shocked', hotkey: '4' },
  { name: 'wink', emoji: '😉', label: 'Wink', hotkey: '5' },
  { name: 'angry', emoji: '😠', label: 'Angry', hotkey: '6' },
  { name: 'sad', emoji: '😢', label: 'Sad', hotkey: '7' },
  { name: 'idea', emoji: '💡', label: 'Idea', hotkey: '8' },
  { name: 'lookaround', emoji: '👀', label: 'Look Around', hotkey: '9' },
  { name: 'nod', emoji: '👍', label: 'Nod', hotkey: '0' },
  { name: 'headshake', emoji: '👎', label: 'Headshake', hotkey: '-' },
  { name: 'look-left', emoji: '👈', label: 'Look Left', hotkey: '←' },
  { name: 'look-right', emoji: '👉', label: 'Look Right', hotkey: '→' },
];

interface ExpressionMenuInternalProps extends ExpressionMenuProps {
  isExpanded: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isChatOpen?: boolean;
  isSearchActive?: boolean;
}

export function ExpressionMenu({ onExpressionSelect, currentExpression, isExpanded, onClose, buttonRef, isChatOpen, isSearchActive }: ExpressionMenuInternalProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, onClose, buttonRef]);

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable all keyboard shortcuts when chat or search is open
      if (isChatOpen || isSearchActive) {
        return;
      }

      const expression = EXPRESSIONS.find((expr) => {
        if (expr.hotkey === '←') return e.key === 'ArrowLeft';
        if (expr.hotkey === '→') return e.key === 'ArrowRight';
        return e.key === expr.hotkey;
      });

      if (expression) {
        e.preventDefault();
        onExpressionSelect(expression.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExpressionSelect, isChatOpen, isSearchActive]);

  const handleExpressionClick = (expression: ExpressionName) => {
    onExpressionSelect(expression);
    // Don't auto-collapse - keep menu open
  };

  // Calculate position relative to button
  const [position, setPosition] = useState({ bottom: 0, left: 0 });

  useEffect(() => {
    if (buttonRef.current && isExpanded && menuRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Wait for menu to render to get its width
      setTimeout(() => {
        if (menuRef.current) {
          const menuWidth = menuRef.current.offsetWidth;
          setPosition({
            bottom: window.innerHeight - rect.top + 10, // Position above button
            left: rect.left + rect.width / 2 - menuWidth / 2, // Center over button
          });
        }
      }, 0);
    }
  }, [isExpanded, buttonRef]);

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bg-white rounded-2xl shadow-lg border border-gray-200 p-3 z-50"
          style={{ bottom: `${position.bottom}px`, left: `${position.left}px` }}
        >
          <div className="flex flex-row gap-2">
            {EXPRESSIONS.map((expr) => (
              <motion.button
                key={expr.name}
                onClick={() => handleExpressionClick(expr.name)}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors min-w-[60px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Kbd className="text-[9px] px-1 py-0.5">{expr.hotkey}</Kbd>
                <span className="text-xl">{expr.emoji}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
