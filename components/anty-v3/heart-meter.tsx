'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface HeartMeterProps {
  hearts: number; // 0-3
}

export function HeartMeter({ hearts }: HeartMeterProps) {
  const maxHearts = 3;

  return (
    <div className="absolute top-8 right-8 flex gap-2.5">
      {Array.from({ length: maxHearts }).map((_, index) => {
        const isActive = index < hearts;

        return (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0.3 }}
            animate={{
              scale: isActive ? 1 : 0.8,
              opacity: isActive ? 1 : 0.3,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            <motion.img
              src="/heart.svg"
              alt="heart"
              className="w-7 h-7"
              animate={
                isActive
                  ? {
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: isActive ? Infinity : 0,
                repeatDelay: 1.5,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
