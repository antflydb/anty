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
        className="flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOff ? (
          // Grey button with grey icon when OFF
          <div className="relative w-[45px] h-[45px] flex items-center justify-center">
            <svg width="45" height="45" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute">
              <g filter="url(#filter0_d_off_button)">
                <path d="M2.03906 35.1262C2.03906 16.4773 17.157 1.35938 35.8059 1.35938V1.35938C54.4548 1.35938 69.5727 16.4773 69.5727 35.1262V35.1262C69.5727 53.7751 54.4548 68.893 35.8059 68.893V68.893C17.157 68.893 2.03906 53.7751 2.03906 35.1262V35.1262Z" fill="#F4F4F4"/>
              </g>
              <defs>
                <filter id="filter0_d_off_button" x="-0.0009377" y="-0.000625193" width="71.6132" height="71.6132" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="0.68"/>
                  <feGaussianBlur stdDeviation="1.02"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.19 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_off_button"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_off_button" result="shape"/>
                </filter>
              </defs>
            </svg>
            <Power className="w-5 h-5 text-gray-400 relative z-10" strokeWidth={2.5} />
          </div>
        ) : (
          // Grey button with orange icon when ON
          <div className="relative w-[45px] h-[45px] flex items-center justify-center">
            <svg width="45" height="45" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute">
              <g filter="url(#filter0_d_on_button)">
                <path d="M2.03906 35.1262C2.03906 16.4773 17.157 1.35938 35.8059 1.35938V1.35938C54.4548 1.35938 69.5727 16.4773 69.5727 35.1262V35.1262C69.5727 53.7751 54.4548 68.893 35.8059 68.893V68.893C17.157 68.893 2.03906 53.7751 2.03906 35.1262V35.1262Z" fill="#F4F4F4"/>
              </g>
              <defs>
                <filter id="filter0_d_on_button" x="-0.0009377" y="-0.000625193" width="71.6132" height="71.6132" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="0.68"/>
                  <feGaussianBlur stdDeviation="1.02"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.19 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_on_button"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_on_button" result="shape"/>
                </filter>
              </defs>
            </svg>
            <Power className="w-5 h-5 text-orange-500 relative z-10" strokeWidth={2.5} />
          </div>
        )}
      </motion.button>
    </div>
  );
}
