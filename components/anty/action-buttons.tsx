'use client';

/**
 * Action Buttons - 4 circular buttons for Chat, Faces, Game, Eat
 */

import { MessageCircle, Smile, Gamepad2, Candy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ActionName } from '@/lib/anty/types-v2';

export interface ActionButtonsProps {
  /** Callback when action is clicked */
  onAction: (action: ActionName) => void;
  /** Optional className */
  className?: string;
}

interface ActionButton {
  action: ActionName;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

const ACTIONS: ActionButton[] = [
  {
    action: 'chat',
    icon: MessageCircle,
    label: 'Chat',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    hoverColor: 'hover:bg-blue-200',
  },
  {
    action: 'faces',
    icon: Smile,
    label: 'Faces',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    hoverColor: 'hover:bg-purple-200',
  },
  {
    action: 'game',
    icon: Gamepad2,
    label: 'Game',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    hoverColor: 'hover:bg-green-200',
  },
  {
    action: 'eat',
    icon: Candy,
    label: 'Eat',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    hoverColor: 'hover:bg-orange-200',
  },
];

export function ActionButtons({ onAction, className = '' }: ActionButtonsProps) {
  return (
    <div className={`flex items-center justify-center gap-6 ${className}`}>
      {ACTIONS.map(({ action, icon: Icon, label, color, bgColor, hoverColor }) => (
        <motion.button
          key={action}
          onClick={() => onAction(action)}
          className={`
            relative rounded-full w-16 h-16
            ${bgColor} ${hoverColor}
            flex items-center justify-center
            shadow-md hover:shadow-lg
            transition-all duration-200
            group
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className={`w-8 h-8 ${color}`} />

          {/* Tooltip */}
          <div
            className="
              absolute -bottom-8 left-1/2 -translate-x-1/2
              bg-gray-800 text-white text-xs px-2 py-1 rounded
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              pointer-events-none whitespace-nowrap
            "
          >
            {label}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
