'use client';

import { motion } from 'framer-motion';
import { type ButtonName } from '@/lib/anty-v3/animation-state';

interface ActionButtonsV3Props {
  onButtonClick: (button: ButtonName) => void;
  isOff: boolean;
}

const buttons: Array<{ name: ButtonName; svg: string; alt: string }> = [
  { name: 'chat', svg: '/button-chat.svg', alt: 'Chat' },
  { name: 'moods', svg: '/button-moods.svg', alt: 'Moods' },
  { name: 'play', svg: '/button-play.svg', alt: 'Play' },
  { name: 'feed', svg: '/button-eat.svg', alt: 'Eat' },
];

export function ActionButtonsV3({ onButtonClick, isOff }: ActionButtonsV3Props) {
  return (
    <div className="flex gap-5 justify-center pb-8">
      {buttons.map((button, index) => (
        <motion.button
          key={button.name}
          whileHover={!isOff ? { scale: 1.05 } : {}}
          whileTap={!isOff ? { scale: 0.95 } : {}}
          transition={{ duration: 0.2 }}
          onClick={() => onButtonClick(button.name)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
          animate={
            isOff
              ? {
                  y: 100,
                  opacity: 0,
                  transition: {
                    delay: index * 0.08, // Cascade: each button delayed by 80ms
                    duration: 0.4,
                    ease: 'easeIn',
                  },
                }
              : {
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: index * 0.05, // Faster snap back with slight cascade
                    duration: 0.35,
                    ease: [0.34, 1.56, 0.64, 1], // Bouncy ease
                  },
                }
          }
        >
          <img
            src={button.svg}
            alt={button.alt}
            className="w-[46px] h-[46px]"
          />
        </motion.button>
      ))}
    </div>
  );
}
