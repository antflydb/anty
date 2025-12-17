'use client';

import { motion } from 'framer-motion';
import { type ButtonName } from '@/lib/anty-v3/animation-state';

interface ActionButtonsV3Props {
  onButtonClick: (button: ButtonName) => void;
}

const buttons: Array<{ name: ButtonName; svg: string; alt: string }> = [
  { name: 'chat', svg: '/button-chat.svg', alt: 'Chat' },
  { name: 'moods', svg: '/button-moods.svg', alt: 'Moods' },
  { name: 'play', svg: '/button-play.svg', alt: 'Play' },
  { name: 'feed', svg: '/button-eat.svg', alt: 'Eat' },
];

export function ActionButtonsV3({ onButtonClick }: ActionButtonsV3Props) {
  return (
    <div className="flex gap-5 justify-center pb-8">
      {buttons.map((button) => (
        <motion.button
          key={button.name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={() => onButtonClick(button.name)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <img
            src={button.svg}
            alt={button.alt}
            className="w-[57.6px] h-[57.6px]"
          />
        </motion.button>
      ))}
    </div>
  );
}
