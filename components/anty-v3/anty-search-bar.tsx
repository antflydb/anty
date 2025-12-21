'use client';

import { type RefObject } from 'react';
import { Kbd } from '@/components/ui/kbd';

interface AntySearchBarProps {
  active: boolean;
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  barRef: RefObject<HTMLDivElement | null>;
  borderRef: RefObject<HTMLDivElement | null>;
  borderGradientRef: RefObject<HTMLDivElement | null>;
  placeholderRef: RefObject<HTMLDivElement | null>;
  kbdRef: RefObject<HTMLDivElement | null>;
  glowRef: RefObject<HTMLDivElement | null>;
}

export function AntySearchBar({ active, value, onChange, inputRef, barRef, borderRef, borderGradientRef, placeholderRef, kbdRef, glowRef }: AntySearchBarProps) {
  // Only hide placeholder when there's actual text typed
  const showPlaceholder = !value;

  return (
    <div
      ref={barRef}
      className="absolute"
      style={{
        width: '642px',
        height: '69px',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0, // GSAP controls opacity
        pointerEvents: active ? 'auto' : 'none',
        zIndex: 2,
      }}
    >
      {/* AI Gradient Glow - positioned behind search bar */}
      <div
        ref={glowRef}
        className="absolute pointer-events-none"
        style={{
          width: '750px',
          height: '100px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0, // GSAP controls opacity and animation
          zIndex: -1,
          background: 'radial-gradient(ellipse, rgba(147, 197, 253, 0.4) 0%, rgba(167, 139, 250, 0.35) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Animated gradient border wrapper */}
      <div
        ref={borderGradientRef}
        className="relative w-full h-full rounded-[10px] p-[2.75px]"
        style={{
          background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box',
          border: '2.75px solid transparent',
          opacity: 0, // GSAP controls opacity
        }}
      >
        <div
          ref={borderRef}
          className="relative w-full h-full bg-white rounded-[8px]"
          style={{
            // Border color animated by GSAP for fade-in
          }}
        >
        {/* Fake animated placeholder */}
        <div
          ref={placeholderRef}
          className="absolute left-6 pointer-events-none select-none flex items-center"
          style={{
            opacity: showPlaceholder ? 1 : 0,
            top: 0,
            height: '100%',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '17.85px',
            color: '#D4D3D3',
            transition: showPlaceholder ? 'none' : 'opacity 0.15s ease-out',
          }}
        >
          Ask about SearchAF
        </div>

        {/* Animated CMD+K indicator */}
        <div
          ref={kbdRef}
          className="absolute right-6 pointer-events-none select-none flex items-center"
          style={{
            opacity: showPlaceholder ? 1 : 0,
            top: 0,
            height: '100%',
            transition: showPlaceholder ? 'none' : 'opacity 0.15s ease-out',
          }}
        >
          <Kbd className="text-xs text-gray-400">⌘K</Kbd>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="" // Empty placeholder since we use fake one
          className="w-full h-full px-6 bg-transparent outline-none text-[#052333]"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '17.85px',
          }}
        />
        </div>
      </div>
    </div>
  );
}
