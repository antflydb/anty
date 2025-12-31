'use client';

import { motion } from 'framer-motion';
import { type ButtonName } from '@/lib/anty/ui-types';

interface ActionButtonsProps {
  moodsButtonRef?: React.RefObject<HTMLButtonElement | null>;
  onButtonClick: (button: ButtonName) => void;
  isOff: boolean;
}

const buttons: Array<{ name: ButtonName; svg: string; alt: string }> = [
  { name: 'search', svg: '/button-search.svg', alt: 'Answer' },
  { name: 'chat', svg: '/button-chat.svg', alt: 'Chat' },
  { name: 'moods', svg: '/button-moods.svg', alt: 'Moods' },
  { name: 'feed', svg: '/button-eat.svg', alt: 'Eat' },
];

export function ActionButtons({ onButtonClick, isOff, moodsButtonRef }: ActionButtonsProps) {
  return (
    <div className="flex gap-5 justify-center pb-8">
      {buttons.map((button, index) => (
        <motion.button
          key={button.name}
          ref={button.name === 'moods' ? moodsButtonRef : undefined}
          whileHover={!isOff ? { scale: 1.08 } : {}}
          whileTap={!isOff ? { scale: 0.92 } : {}}
          transition={{ duration: 0.15 }}
          onClick={() => onButtonClick(button.name)}
          className="p-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
          animate={
            isOff
              ? {
                  y: 80,
                  opacity: 0,
                  transition: {
                    y: {
                      delay: index * 0.03, // Super fast cascade: 30ms spacing
                      duration: 0.2,
                      ease: 'easeIn',
                    },
                    opacity: {
                      delay: index * 0.03 + 0.02, // Fade starts almost immediately (20ms after)
                      duration: 0.1,
                      ease: 'linear',
                    }
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
