'use client';

import { type RefObject } from 'react';

interface AntySearchBarProps {
  active: boolean;
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  barRef: RefObject<HTMLDivElement | null>;
}

export function AntySearchBar({ active, value, onChange, inputRef, barRef }: AntySearchBarProps) {
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
      <div
        className="relative w-full h-full bg-white rounded-[13px]"
        style={{
          border: '2.75px solid #E5EDFF',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your search..."
          className="w-full h-full px-6 bg-transparent outline-none text-[#052333]"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontSize: '17.85px',
          }}
        />
      </div>
    </div>
  );
}
