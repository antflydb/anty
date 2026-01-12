'use client';

import { type RefObject, useState, useEffect } from 'react';
import { type SearchBarConfig, DEFAULT_SEARCH_BAR_CONFIG } from '../types';

// Detect touch device - memoized to avoid repeated checks
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Responsive typography constants - aligned with iOS/Material/Tailwind
const RESPONSIVE_BREAKPOINT = 480;
const MIN_SEARCH_WIDTH = 280;

const TYPOGRAPHY = {
  mobile: { fontSize: 16, padding: 16 },   // Standard body, 8px grid
  desktop: { fontSize: 18, padding: 24 },  // Large body, comfortable spacing
};

// Inline Kbd component (no external dependencies)
function Kbd({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <kbd
      style={{
        backgroundColor: '#f4f4f5',
        color: '#71717a',
        pointerEvents: 'none',
        display: 'inline-flex',
        height: '20px',
        minWidth: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        borderRadius: '4px',
        padding: '0 4px',
        fontFamily: 'sans-serif',
        fontSize: '12px',
        fontWeight: 500,
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </kbd>
  );
}

export interface AntySearchBarProps {
  active: boolean;
  value: string;
  onChange: (value: string) => void;
  /** Callback when search is submitted (Enter pressed) */
  onSubmit?: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  barRef: RefObject<HTMLDivElement | null>;
  borderRef: RefObject<HTMLDivElement | null>;
  borderGradientRef: RefObject<HTMLDivElement | null>;
  placeholderRef: RefObject<HTMLDivElement | null>;
  kbdRef: RefObject<HTMLDivElement | null>;
  glowRef: RefObject<HTMLDivElement | null>;
  /** Search bar configuration - controls dimensions and corner radius */
  config?: SearchBarConfig;
  /** Placeholder text shown when input is empty */
  placeholder?: string;
  /** Keyboard shortcut indicator (e.g., "⌘K") */
  keyboardShortcut?: string;
}

export function AntySearchBar({
  active,
  value,
  onChange,
  onSubmit,
  inputRef,
  barRef,
  borderRef,
  borderGradientRef,
  placeholderRef,
  kbdRef,
  glowRef,
  config = DEFAULT_SEARCH_BAR_CONFIG,
  placeholder = 'Search...',
  keyboardShortcut,
}: AntySearchBarProps) {
  // Only hide placeholder when there's actual text typed
  const showPlaceholder = !value;

  // Detect touch device after hydration to avoid SSR mismatch
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  // Track viewport width for responsive sizing (SSR-safe)
  const [viewportWidth, setViewportWidth] = useState(1024);
  useEffect(() => {
    setViewportWidth(window.innerWidth);

    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Extract config values
  const { width, height, borderRadius, innerRadius, borderWidth } = config;

  // Responsive calculations
  const isMobile = viewportWidth < RESPONSIVE_BREAKPOINT;
  const { fontSize, padding: sidePadding } = isMobile ? TYPOGRAPHY.mobile : TYPOGRAPHY.desktop;
  const actualWidth = Math.max(MIN_SEARCH_WIDTH, Math.min(width, viewportWidth * 0.9));
  const glowWidth = actualWidth * 0.92;

  // Determine whether to show keyboard shortcut (default: hide on touch devices)
  const shouldShowShortcut = config.showShortcut ?? !isTouch;

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
      style={{
        position: 'absolute',
        width: `${actualWidth}px`,
        height: `${height}px`,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0, // GSAP controls opacity
        pointerEvents: active ? 'auto' : 'none',
        zIndex: 2,
      }}
    >
      {/* AI Gradient Glow - positioned behind search bar, slightly smaller so blur peeks out */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: `${glowWidth}px`,
          height: `${height * 1.8}px`, // Taller to create elongated ellipse effect
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0, // GSAP controls opacity and animation
          zIndex: -1,
          background: 'radial-gradient(ellipse 100% 50%, rgba(147, 197, 253, 0.5) 0%, rgba(167, 139, 250, 0.4) 30%, rgba(229, 237, 255, 0.2) 60%, transparent 85%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      {/* Animated gradient border wrapper */}
      <div
        ref={borderGradientRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: `${borderRadius}px`,
          padding: `${borderWidth}px`,
          background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box',
          border: `${borderWidth}px solid transparent`,
          opacity: 0, // GSAP controls opacity
        }}
      >
        <div
          ref={borderRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            borderRadius: `${innerRadius}px`,
          }}
        >
          {/* Content container - centered for single-line, top-aligned for multi-line */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: `${defaultHeight - borderWidth * 2}px`,
              ...(isMultiLineHeight
                ? { top: `${contentTopPadding}px` }
                : { top: '50%', transform: 'translateY(-50%)' }
              ),
            }}
          >
            {/* Fake animated placeholder */}
            <div
              ref={placeholderRef}
              style={{
                position: 'absolute',
                left: `${sidePadding}px`,
                top: 0,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: showPlaceholder ? 1 : 0,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: `${fontSize}px`,
                color: '#D4D3D3',
                transition: showPlaceholder ? 'none' : 'opacity 0.15s ease-out',
              }}
            >
              {placeholder}
            </div>

            {/* Animated keyboard shortcut indicator - hidden on touch devices by default */}
            <div
              ref={kbdRef}
              style={{
                position: 'absolute',
                right: `${sidePadding}px`,
                top: 0,
                height: '100%',
                display: shouldShowShortcut ? 'flex' : 'none',
                alignItems: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: showPlaceholder ? 1 : 0,
                transition: showPlaceholder ? 'none' : 'opacity 0.15s ease-out',
              }}
            >
              {keyboardShortcut && (
                <Kbd style={{ fontSize: '12px', color: '#9ca3af' }}>{keyboardShortcut}</Kbd>
              )}
            </div>

            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSubmit) {
                  onSubmit(e.currentTarget.value);
                }
              }}
              placeholder="" // Empty placeholder since we use fake one
              style={{
                width: '100%',
                height: '100%',
                padding: `0 ${sidePadding}px`,
                backgroundColor: 'transparent',
                outline: 'none',
                border: 'none',
                color: '#052333',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: `${fontSize}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
