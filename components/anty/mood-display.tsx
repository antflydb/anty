'use client';

/**
 * Mood Display - Shows 0-3 hearts representing mood level
 */

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export interface MoodDisplayProps {
  /** Current mood level (0-3) */
  mood: number;
  /** Optional className */
  className?: string;
}

export function MoodDisplay({ mood, className = '' }: MoodDisplayProps) {
  const maxHearts = 3;
  const hearts = Array.from({ length: maxHearts }, (_, i) => i < mood);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hearts.map((filled, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: index * 0.1,
            type: 'spring',
            stiffness: 200,
          }}
        >
          <Heart
            className={`w-8 h-8 ${
              filled
                ? 'fill-red-500 text-red-500'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}
