'use client';

import { type RefObject } from 'react';
import { Kbd } from '@/components/ui/kbd';
import { type SearchBarConfig, DEFAULT_SEARCH_BAR_CONFIG } from '@antfly/anty-embed';

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
  /** Search bar configuration - controls dimensions and corner radius */
  config?: SearchBarConfig;
}

export function AntySearchBar({
  active,
  value,
  onChange,
  inputRef,
  barRef,
  borderRef,
  borderGradientRef,
  placeholderRef,
  kbdRef,
  glowRef,
  config = DEFAULT_SEARCH_BAR_CONFIG,
}: AntySearchBarProps) {
  // Only hide placeholder when there's actual text typed
  const showPlaceholder = !value;

  // Extract config values
  const { width, height, borderRadius, innerRadius, borderWidth } = config;

  // Default height for content area (input stays at standard size)
  const defaultHeight = DEFAULT_SEARCH_BAR_CONFIG.height;

  // Calculate if we should center content or top-align
  // Single line height ~= font size (17.85px) + padding (~24px top/bottom) ≈ 65px
  // If bar is tall enough for 2+ lines, top-align; otherwise center
  const singleLineThreshold = 90; // px - anything above this is considered multi-line capable
  const isMultiLineHeight = height > singleLineThreshold;
  const contentTopPadding = 2; // px - top padding when top-aligned

  return (
    <div
      ref={barRef}
      className="absolute"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: '50%',
        // Vertically centered regardless of height
        top: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0, // GSAP controls opacity
        pointerEvents: active ? 'auto' : 'none',
        zIndex: 2,
      }}
    >
      {/* AI Gradient Glow - positioned behind search bar, scales with box */}
      <div
        ref={glowRef}
        className="absolute pointer-events-none"
        style={{
          width: `${width}px`,
          height: `${height}px`,
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
        className="relative w-full h-full"
        style={{
          borderRadius: `${borderRadius}px`,
          padding: `${borderWidth}px`,
          background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box',
          border: `${borderWidth}px solid transparent`,
          opacity: 0, // GSAP controls opacity
        }}
      >
        <div
          ref={borderRef}
          className="relative w-full h-full bg-white"
          style={{
            borderRadius: `${innerRadius}px`,
          }}
        >
          {/* Content container - centered for single-line, top-aligned for multi-line */}
          <div
            className="absolute left-0 right-0"
            style={{
              height: `${defaultHeight - borderWidth * 2}px`,
              // Center vertically for single-line, top-align with padding for multi-line
              ...(isMultiLineHeight
                ? { top: `${contentTopPadding}px` }
                : { top: '50%', transform: 'translateY(-50%)' }
              ),
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
    </div>
  );
}
