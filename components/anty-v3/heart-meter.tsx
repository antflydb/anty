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
            <motion.div
              className="w-7 h-7"
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
            >
              <svg width="28" height="28" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 7.20312H6.08634V13.2895H0V7.20312Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M0 14.4004H6.08634V20.4867H0V14.4004Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M7.19922 7.20312H13.2856V13.2895H7.19922V7.20312Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M14.3984 7.20312H20.4848V13.2895H14.3984V7.20312Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M7.19922 0.00195312H13.2856V6.08829H7.19922V0.00195312Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M7.19922 14.4004H13.2856V20.4867H7.19922V14.4004Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M7.19922 21.6016H13.2856V27.6879H7.19922V21.6016Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M14.3984 28.8008H20.4848V34.8871H14.3984V28.8008Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M14.3984 21.6016H20.4848V27.6879H14.3984V21.6016Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M14.3984 14.4004H20.4848V20.4867H14.3984V14.4004Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M21.5996 7.20117H27.6859V13.2875H21.5996V7.20117Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M21.5996 0H27.6859V6.08634H21.5996V0Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M21.5996 14.4004H27.6859V20.4867H21.5996V14.4004Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M28.7988 14.4004H34.8852V20.4867H28.7988V14.4004Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M21.5996 21.6016H27.6859V27.6879H21.5996V21.6016Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
                <path d="M28.7988 7.20117H34.8852V13.2875H28.7988V7.20117Z" fill={isEarned ? '#8B5CF6' : '#A09F9F'} />
              </svg>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
