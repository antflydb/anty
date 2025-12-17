'use client';

import { motion } from 'framer-motion';

export interface EarnedHeart {
  index: number;
  earnedAt: number; // timestamp
  isPulsing?: boolean; // for the earning animation
}

interface HeartMeterProps {
  hearts: number; // 0-3
  earnedHearts: EarnedHeart[]; // array of earned hearts with timestamps
}

export function HeartMeter({ hearts, earnedHearts }: HeartMeterProps) {
  const maxHearts = 3;

  return (
    <div className="absolute top-8 right-8 flex gap-2.5">
      {Array.from({ length: maxHearts }).map((_, index) => {
        const isActive = index < hearts;
        const earnedHeart = earnedHearts.find((h) => h.index === index);
        const isEarned = !!earnedHeart;
        const isPulsing = earnedHeart?.isPulsing || false;

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
              style={{
                filter: isEarned
                  ? 'brightness(0) saturate(100%) invert(33%) sepia(88%) saturate(2567%) hue-rotate(256deg) brightness(91%) contrast(95%)'
                  : 'grayscale(100%) brightness(0.6)',
              }}
              animate={
                isPulsing
                  ? {
                      opacity: [1, 0.4, 1, 0.4, 1],
                      scale: [1, 1.15, 1, 1.15, 1],
                    }
                  : isActive
                  ? {
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={
                isPulsing
                  ? {
                      duration: 1.2,
                      ease: 'easeInOut',
                    }
                  : {
                      duration: 0.5,
                      repeat: isActive ? Infinity : 0,
                      repeatDelay: 1.5,
                    }
              }
            />
          </motion.div>
        );
      })}
    </div>
  );
}
