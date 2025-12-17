'use client';

/**
 * Faces Menu - Expression selector popup
 */

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AntyCharacterExact } from './anty-character-exact';
import { getAllExpressions } from '@/lib/anty/expressions-figma';
import type { ExpressionName } from '@/lib/anty/expressions-figma';

export interface FacesMenuProps {
  /** Whether menu is open */
  isOpen: boolean;
  /** Current selected expression */
  currentExpression: ExpressionName;
  /** Callback when expression is selected */
  onSelectExpression: (expression: ExpressionName) => void;
  /** Callback to close menu */
  onClose: () => void;
}

export function FacesMenu({
  isOpen,
  currentExpression,
  onSelectExpression,
  onClose,
}: FacesMenuProps) {
  const expressions = getAllExpressions();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              bg-white rounded-2xl shadow-2xl
              p-6 z-50
              max-w-2xl w-full mx-4
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Choose Expression
              </h2>
              <button
                onClick={onClose}
                className="
                  p-2 rounded-full
                  hover:bg-gray-100
                  transition-colors
                "
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Expression Grid */}
            <div className="grid grid-cols-3 gap-4">
              {expressions.map((expression) => (
                <motion.button
                  key={expression}
                  onClick={() => {
                    onSelectExpression(expression);
                    onClose();
                  }}
                  className={`
                    relative p-4 rounded-xl
                    border-2 transition-all
                    ${
                      currentExpression === expression
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Expression preview */}
                  <div className="flex justify-center mb-2">
                    <AntyCharacterExact expression={expression} size={80} />
                  </div>

                  {/* Label */}
                  <div className="text-center text-sm font-medium text-gray-700 capitalize">
                    {expression}
                  </div>

                  {/* Selected indicator */}
                  {currentExpression === expression && (
                    <motion.div
                      layoutId="selected"
                      className="
                        absolute inset-0 rounded-xl
                        border-2 border-blue-500
                        pointer-events-none
                      "
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
