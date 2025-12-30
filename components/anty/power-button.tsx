'use client';

import { motion } from 'framer-motion';
import { Power } from 'lucide-react';

interface PowerButtonProps {
  isOff: boolean;
  onToggle: () => void;
}

export function PowerButton({ isOff, onToggle }: PowerButtonProps) {
  return (
    <div className="fixed bottom-8 right-8">
      <motion.button
        onClick={onToggle}
        className="p-3 rounded-xl flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
      >
        <Power
          className={`w-6 h-6 ${isOff ? 'text-gray-400' : 'text-orange-500'}`}
          strokeWidth={2.5}
        />
      </motion.button>
    </div>
  );
}
