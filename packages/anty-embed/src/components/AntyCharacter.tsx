'use client';

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AntyParticleCanvas, type ParticleCanvasHandle } from './AntyParticleCanvas';
import { AntySearchBar } from './AntySearchBar';
import { useAnimationController } from '../hooks/use-animation-controller';
import { useSearchMorph, type SearchBarRefs } from '../hooks/use-search-morph';
import { type EmotionType, type ExpressionName } from '../lib/animation/types';
import { type SearchBarConfig, DEFAULT_SEARCH_BAR_CONFIG } from '../types';
import { type Particle } from '../lib/particles';
import {
  ENABLE_ANIMATION_DEBUG_LOGS,
  logAnimationEvent,
} from '../lib/animation/feature-flags';
import { getEyeShape, getEyeDimensions } from '../lib/animation/definitions/eye-shapes';
import { createLookAnimation, createReturnFromLookAnimation } from '../lib/animation/definitions/eye-animations';

gsap.registerPlugin(useGSAP);

// ============================================================================
// Types
// ============================================================================

export interface AntyCharacterProps {
  /** Current expression/emotion to display */
  expression?: ExpressionName;
  /** Character size in pixels (default: 160) */
  size?: number;
  /** Whether super mode is active */
  isSuperMode?: boolean;
  /** Whether search mode is active (external control - deprecated, use searchEnabled instead) */
  searchMode?: boolean;
  /** Whether to show debug overlays */
  debugMode?: boolean;
  /** Whether to show shadow (default: true) */
  showShadow?: boolean;
  /** Whether to show glow effects (default: true) */
  showGlow?: boolean;
  /** Callback when a spontaneous expression occurs */
  onSpontaneousExpression?: (expression: ExpressionName) => void;
  /** Callback when an emotion animation completes */
  onEmotionComplete?: (emotion: string) => void;
  /** Callback when animation sequence changes (for debugging) */
  onAnimationSequenceChange?: (sequence: string) => void;
  /** Callback for random actions (for debugging) */
  onRandomAction?: (action: string) => void;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  // Optional external refs (for playground/advanced usage where shadow/glow are external)
  /** External ref for shadow element (if managing shadow externally) */
  shadowRef?: React.RefObject<HTMLDivElement | null>;
  /** External ref for inner glow element (if managing glow externally) */
  innerGlowRef?: React.RefObject<HTMLDivElement | null>;
  /** External ref for outer glow element (if managing glow externally) */
  outerGlowRef?: React.RefObject<HTMLDivElement | null>;

  // === INTEGRATED SEARCH BAR ===
  /** Enable integrated search bar (renders internally, controlled via ref) */
  searchEnabled?: boolean;
  /** Current search value (controlled) */
  searchValue?: string;
  /** Callback when search value changes */
  onSearchChange?: (value: string) => void;
  /** Callback when search is submitted (Enter pressed) */
  onSearchSubmit?: (value: string) => void;
  /** Search bar placeholder text */
  searchPlaceholder?: string;
  /** Keyboard shortcut indicator (e.g., "⌘K") */
  searchShortcut?: string;
  /** Search bar configuration */
  searchConfig?: SearchBarConfig;
  /** Callback when morph to search starts */
  onSearchOpen?: () => void;
  /** Callback when morph to search completes */
  onSearchOpenComplete?: () => void;
  /** Callback when morph back to character starts */
  onSearchClose?: () => void;
  /** Callback when morph back to character completes */
  onSearchCloseComplete?: () => void;
}

export interface AntyCharacterHandle {
  // Particle effects
  spawnFeedingParticles: () => void;
  spawnSparkle?: (x: number, y: number, color?: string) => void;
  spawnLoveHearts?: () => void;
  spawnConfetti?: (x: number, y: number, count?: number) => void;
  // Search glow
  showSearchGlow?: () => void;
  hideSearchGlow?: () => void;
  // Emotion control
  playEmotion?: (emotion: ExpressionName, options?: { isChatOpen?: boolean; showLightbulb?: boolean; quickDescent?: boolean }) => boolean;
  killAll?: () => void;
  pauseIdle?: () => void;
  resumeIdle?: () => void;
  // Eye control (for hold-style keyboard look)
  startLook?: (direction: 'left' | 'right') => void;
  endLook?: () => void;
  // Super mode
  setSuperMode?: (scale: number | null) => void;
  // Glow control
  showGlows?: (fadeIn?: boolean) => void;
  hideGlows?: () => void;
  // Shadow control
  hideShadow?: () => void;
  showShadow?: () => void;

  // === SEARCH BAR MORPH (when searchEnabled) ===
  /** Morph character into search bar */
  morphToSearchBar?: () => void;
  /** Morph search bar back to character */
  morphToCharacter?: () => void;
  /** Check if currently in search mode */
  isSearchMode?: () => boolean;

  // Refs for external animation (search morph)
  leftBodyRef?: React.RefObject<HTMLDivElement | null>;
  rightBodyRef?: React.RefObject<HTMLDivElement | null>;
  leftEyeRef?: React.RefObject<HTMLDivElement | null>;
  rightEyeRef?: React.RefObject<HTMLDivElement | null>;
  leftEyePathRef?: React.RefObject<SVGPathElement | null>;
  rightEyePathRef?: React.RefObject<SVGPathElement | null>;
  // Internal element refs for morph animations
  shadowRef?: React.RefObject<HTMLDivElement | null>;
  innerGlowRef?: React.RefObject<HTMLDivElement | null>;
  outerGlowRef?: React.RefObject<HTMLDivElement | null>;
  characterRef?: React.RefObject<HTMLDivElement | null>;
}

// ============================================================================
// Inline Style Helpers (replacing Tailwind)
// ============================================================================

const styles = {
  // Container: relative positioning with visible overflow
  container: (size: number): React.CSSProperties => ({
    position: 'relative',
    width: size,
    height: size,
    overflow: 'visible',
  }),

  // Full container wrapper with shadow/glow space
  fullContainer: (size: number): React.CSSProperties => ({
    position: 'relative',
    width: size,
    height: size * 1.5, // Extra height for shadow
    overflow: 'visible',
  }),

  // Inner wrapper to position character at top of fullContainer
  characterArea: (size: number): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: size,
    height: size,
    overflow: 'visible',
  }),

  // Character wrapper
  character: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    willChange: 'transform',
    overflow: 'visible' as const,
  },

  // Super mode golden glow
  superGlow: {
    position: 'absolute' as const,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none' as const,
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 165, 0, 0.4) 50%, rgba(255, 215, 0, 0) 100%)',
    filter: 'blur(20px)',
    zIndex: 0,
  },

  // Body parts - using inset percentages from Figma
  rightBody: {
    position: 'absolute' as const,
    top: '13.46%',
    right: '0',
    bottom: '0',
    left: '13.46%',
  },

  leftBody: {
    position: 'absolute' as const,
    top: '0',
    right: '13.15%',
    bottom: '13.15%',
    left: '0',
  },

  bodyImage: {
    display: 'block',
    maxWidth: 'none',
    width: '100%',
    height: '100%',
  },

  // Eye containers - using inset percentages from Figma
  leftEyeContainer: {
    position: 'absolute' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '33.44%',
    right: '56.93%',
    bottom: '38.44%',
    left: '30.57%',
  },

  rightEyeContainer: {
    position: 'absolute' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '33.44%',
    right: '31.21%',
    bottom: '38.44%',
    left: '56.29%',
  },

  eyeWrapper: (width: number, height: number, scale: number = 1): React.CSSProperties => ({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: `${width * scale}px`,
    height: `${height * scale}px`,
    transformOrigin: 'center center',
  }),

  // Inner glow (behind character)
  innerGlow: (scale: number = 1): React.CSSProperties => ({
    position: 'absolute' as const,
    left: '50%',
    transform: 'translate(-50%, -50%)',
    top: `${80 * scale}px`,
    width: `${120 * scale}px`,
    height: `${90 * scale}px`,
    borderRadius: '50%',
    opacity: 1,
    background: 'linear-gradient(90deg, #C5D4FF 0%, #E0C5FF 100%)',
    filter: `blur(${25 * scale}px)`,
    transformOrigin: 'center center',
    pointerEvents: 'none' as const,
  }),

  // Outer glow (behind character, larger)
  outerGlow: (scale: number = 1): React.CSSProperties => ({
    position: 'absolute' as const,
    left: '50%',
    transform: 'translate(-50%, -50%)',
    top: `${80 * scale}px`,
    width: `${170 * scale}px`,
    height: `${130 * scale}px`,
    borderRadius: '50%',
    opacity: 1,
    background: 'linear-gradient(90deg, #D5E2FF 0%, #EED5FF 100%)',
    filter: `blur(${32 * scale}px)`,
    transformOrigin: 'center center',
    pointerEvents: 'none' as const,
  }),

  // Shadow (below character) - positioned at bottom of fullContainer
  shadow: (scale: number = 1): React.CSSProperties => ({
    position: 'absolute' as const,
    left: '50%',
    transform: 'translateX(-50%) scaleX(1) scaleY(1)',
    bottom: '0px', // At bottom of fullContainer, not outside bounds
    width: `${160 * scale}px`,
    height: `${40 * scale}px`,
    background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
    filter: `blur(${12 * scale}px)`,
    borderRadius: '50%',
    opacity: 0.7,
    transformOrigin: 'center center',
    pointerEvents: 'none' as const,
  }),

  // Debug overlays
  debugBorder: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    border: '3px solid lime',
    pointerEvents: 'none' as const,
    zIndex: 9999,
  },

  debugCrosshair: (top: string, left: string, color: string, isHorizontal: boolean): React.CSSProperties => ({
    position: 'absolute',
    top,
    left,
    width: isHorizontal ? '12px' : '2px',
    height: isHorizontal ? '2px' : '12px',
    backgroundColor: color,
    pointerEvents: 'none',
    zIndex: 9999,
  }),
};

// ============================================================================
// Component
// ============================================================================

/**
 * Main Anty Character component with GSAP animations
 *
 * Features:
 * - Continuous idle animations (floating, rotation, breathing)
 * - Emotion animations with eye morphing
 * - Canvas-based particle system
 * - Self-contained shadow and glow effects
 * - Power on/off animations
 */
export const AntyCharacter = forwardRef<AntyCharacterHandle, AntyCharacterProps>(({
  expression = 'idle',
  size = 160,
  isSuperMode = false,
  searchMode = false,
  debugMode = false,
  showShadow = true,
  showGlow = true,
  onSpontaneousExpression,
  onEmotionComplete,
  onAnimationSequenceChange,
  onRandomAction,
  className = '',
  style,
  // Optional external refs (for playground where shadow/glow are rendered externally)
  shadowRef: externalShadowRef,
  innerGlowRef: externalInnerGlowRef,
  outerGlowRef: externalOuterGlowRef,
  // Search bar integration
  searchEnabled = false,
  searchValue: externalSearchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search...',
  searchShortcut = '⌘K',
  searchConfig = DEFAULT_SEARCH_BAR_CONFIG,
  onSearchOpen,
  onSearchOpenComplete,
  onSearchClose,
  onSearchCloseComplete,
}, ref) => {
  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftEyePathRef = useRef<SVGPathElement>(null);
  const rightEyePathRef = useRef<SVGPathElement>(null);
  const leftEyeSvgRef = useRef<SVGSVGElement>(null);
  const rightEyeSvgRef = useRef<SVGSVGElement>(null);
  const leftBodyRef = useRef<HTMLDivElement>(null);
  const rightBodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<ParticleCanvasHandle>(null);

  // Internal search bar refs (when searchEnabled)
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchBorderRef = useRef<HTMLDivElement>(null);
  const searchBorderGradientRef = useRef<HTMLDivElement>(null);
  const searchPlaceholderRef = useRef<HTMLDivElement>(null);
  const searchKbdRef = useRef<HTMLDivElement>(null);
  const searchGlowRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Internal search state
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Use external value if provided, otherwise internal
  const searchValueState = externalSearchValue !== undefined ? externalSearchValue : internalSearchValue;
  const handleSearchChange = useCallback((value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchValue(value);
    }
  }, [onSearchChange]);

  // Build search bar refs object for the hook
  const searchBarRefs: SearchBarRefs = {
    bar: searchBarRef,
    border: searchBorderRef,
    borderGradient: searchBorderGradientRef,
    placeholder: searchPlaceholderRef,
    kbd: searchKbdRef,
    glow: searchGlowRef,
    input: searchInputRef,
  };

  // Internal refs for shadow/glow (self-contained, used if external refs not provided)
  const internalShadowRef = useRef<HTMLDivElement>(null);
  const internalInnerGlowRef = useRef<HTMLDivElement>(null);
  const internalOuterGlowRef = useRef<HTMLDivElement>(null);

  // Use external refs if provided, otherwise use internal
  const shadowRef = externalShadowRef || internalShadowRef;
  const innerGlowRef = externalInnerGlowRef || internalInnerGlowRef;
  const outerGlowRef = externalOuterGlowRef || internalOuterGlowRef;

  // Track whether we're using external refs (if so, don't render internal shadow/glow)
  const hasExternalShadow = !!externalShadowRef;
  const hasExternalGlow = !!externalInnerGlowRef || !!externalOuterGlowRef;

  // Super mode glow
  const superGlowRef = useRef<HTMLDivElement>(null);
  const superGlowTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // State
  const [currentExpression, setCurrentExpression] = useState<ExpressionName>(expression);
  const [particles] = useState<Particle[]>([]);
  const isOff = expression === 'off';
  const initialEyeDimensions = getEyeDimensions('IDLE');
  const sizeScale = size / 160; // Scale factor based on default 160px size

  const [refsReady, setRefsReady] = useState(false);
  useEffect(() => {
    if (containerRef.current && characterRef.current && !refsReady) {
      setRefsReady(true);
    }
  }, [refsReady]);

  // Animation controller
  const animationController = useAnimationController(
    {
      container: containerRef.current,
      character: characterRef.current,
      shadow: shadowRef.current,
      eyeLeft: leftEyeRef.current,
      eyeRight: rightEyeRef.current,
      eyeLeftPath: leftEyePathRef.current,
      eyeRightPath: rightEyePathRef.current,
      eyeLeftSvg: leftEyeSvgRef.current,
      eyeRightSvg: rightEyeSvgRef.current,
      leftBody: leftBodyRef.current,
      rightBody: rightBodyRef.current,
      innerGlow: innerGlowRef.current,
      outerGlow: outerGlowRef.current,
    },
    {
      enableLogging: ENABLE_ANIMATION_DEBUG_LOGS,
      enableQueue: true,
      maxQueueSize: 10,
      defaultPriority: 2,
      isOff,
      searchMode: searchMode || isSearchActive, // Include internal search state
      autoStartIdle: true,
      onStateChange: (from, to) => {
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
          logAnimationEvent('State Change', { from, to });
        }
        if (onAnimationSequenceChange) {
          onAnimationSequenceChange(`CONTROLLER: ${from} → ${to}`);
        }
      },
      onAnimationSequenceChange: onAnimationSequenceChange,
      callbacks: {
        onEmotionMotionStart: (emotion) => {
          // Spawn confetti for celebrate animation
          if (emotion === 'celebrate' && canvasRef.current?.spawnParticle) {
            setTimeout(() => {
              const count = 40;
              const canvasCenterX = (size * 5) / 2;
              const canvasCenterY = (size * 5) / 2;

              for (let i = 0; i < count; i++) {
                setTimeout(() => {
                  canvasRef.current?.spawnParticle?.('confetti', canvasCenterX, canvasCenterY - 50);
                }, i * 10);
              }
            }, 550);
          }

          // Spawn yellow sparkles from right eye during wink
          if (emotion === 'wink' && canvasRef.current?.spawnParticle) {
            const canvasCenterX = (size * 5) / 2;
            const canvasCenterY = (size * 5) / 2;
            const rightEyeX = canvasCenterX + 25;
            const rightEyeY = canvasCenterY - 15;

            for (let i = 0; i < 6; i++) {
              setTimeout(() => {
                const spawnX = rightEyeX + (Math.random() - 0.5) * 30;
                const spawnY = rightEyeY + (Math.random() - 0.5) * 30;
                canvasRef.current?.spawnParticle?.(
                  'sparkle',
                  spawnX,
                  spawnY,
                  '#FFD700'
                );
              }, 50 + i * 40);
            }
          }

          // Spawn lightbulb emoji for idea animation
          if (emotion === 'idea' && containerRef.current) {
            setTimeout(() => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const lightbulb = document.createElement('div');
              lightbulb.textContent = '💡';
              const bulbSize = isSuperMode ? 70 : 48;
              const bulbOffset = isSuperMode ? 32 : 22;
              lightbulb.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2 - bulbOffset}px;
                top: ${rect.top - 80}px;
                font-size: ${bulbSize}px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
              `;
              document.body.appendChild(lightbulb);
              const bulbTl = gsap.timeline({ onComplete: () => lightbulb.remove() });
              bulbTl.to(lightbulb, { y: -25, duration: 0.9, ease: 'power2.out' }, 0);
              bulbTl.to(lightbulb, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0);
              bulbTl.to(lightbulb, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.65);
            }, 180);
          }

          // Spawn teardrop emoji for sad animation
          if (emotion === 'sad' && containerRef.current) {
            setTimeout(() => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const teardrop = document.createElement('div');
              teardrop.textContent = '💧';
              const dropSize = isSuperMode ? 52 : 36;
              const dropOffset = isSuperMode ? 24 : 16;
              const xOffset = rect.width * 0.35;
              teardrop.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2 + xOffset - dropOffset}px;
                top: ${rect.top - 20}px;
                font-size: ${dropSize}px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
              `;
              document.body.appendChild(teardrop);
              const dropTl = gsap.timeline({ onComplete: () => teardrop.remove() });
              dropTl.to(teardrop, { y: 35, duration: 1.2, ease: 'power2.in' }, 0);
              dropTl.to(teardrop, { opacity: 1, duration: 0.15, ease: 'power2.out' }, 0);
              dropTl.to(teardrop, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.85);
            }, 250);
          }

          // Spawn exclamation emoji for shocked animation
          if (emotion === 'shocked' && containerRef.current) {
            setTimeout(() => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const exclamation = document.createElement('div');
              exclamation.textContent = '❗';
              const emojiSize = isSuperMode ? 70 : 48;
              const emojiOffset = isSuperMode ? 32 : 22;
              const xOffset = rect.width * 0.35;
              exclamation.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2 + xOffset - emojiOffset}px;
                top: ${rect.top - 50}px;
                font-size: ${emojiSize}px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
              `;
              document.body.appendChild(exclamation);
              const exclamationTl = gsap.timeline({ onComplete: () => exclamation.remove() });
              exclamationTl.to(exclamation, { y: -25, duration: 0.9, ease: 'power2.out' }, 0);
              exclamationTl.to(exclamation, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0);
              exclamationTl.to(exclamation, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.65);
            }, 180);
          }
        },
        onEmotionMotionComplete: (emotion, timelineId, duration) => {
          const isEyeOnlyAction = emotion === 'look-left' || emotion === 'look-right';

          if (ENABLE_ANIMATION_DEBUG_LOGS && !isEyeOnlyAction) {
            logAnimationEvent('Emotion Motion Complete', { emotion, timelineId, duration });
          }
          if (onEmotionComplete) {
            onEmotionComplete(emotion);
          }
        },
      },
    }
  );

  // Log controller initialization
  useEffect(() => {
    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      logAnimationEvent('Controller Initialization', {
        isReady: animationController.isReady,
        currentState: animationController.getState(),
      });
    }
  }, [animationController.isReady]);

  // Log when props change
  useEffect(() => {
    if (!ENABLE_ANIMATION_DEBUG_LOGS) return;

    logAnimationEvent('Props Changed', {
      expression,
      isOff,
      searchMode,
      controllerState: animationController.getState(),
      controllerEmotion: animationController.getEmotion(),
      isIdle: animationController.isIdle(),
    });
  }, [expression, isOff, searchMode]);

  // Create a self-ref object for the search morph hook
  // This mimics the AntyCharacterHandle interface so the hook can access internal refs
  const selfRef = useRef<AntyCharacterHandle>({
    spawnFeedingParticles: () => {},
    leftBodyRef,
    rightBodyRef,
    leftEyeRef,
    rightEyeRef,
    leftEyePathRef,
    rightEyePathRef,
    shadowRef,
    innerGlowRef,
    outerGlowRef,
    characterRef,
    killAll: () => animationController.killAll(),
    pauseIdle: () => animationController.pause(),
    resumeIdle: () => animationController.resume(),
    hideGlows: () => animationController.hideGlows(),
    showGlows: (fadeIn?: boolean) => animationController.showGlows(fadeIn),
    hideShadow: () => animationController.hideShadow(),
    showShadow: () => animationController.showShadow(),
  });

  // Keep self-ref updated with latest refs
  useEffect(() => {
    selfRef.current = {
      ...selfRef.current,
      killAll: () => animationController.killAll(),
      pauseIdle: () => animationController.pause(),
      resumeIdle: () => animationController.resume(),
      hideGlows: () => animationController.hideGlows(),
      showGlows: (fadeIn?: boolean) => animationController.showGlows(fadeIn),
      hideShadow: () => animationController.hideShadow(),
      showShadow: () => animationController.showShadow(),
    };
  }, [animationController]);

  // Use search morph hook (when searchEnabled)
  const { morphToSearchBar: internalMorphToSearchBar, morphToCharacter: internalMorphToCharacter, isMorphing } = useSearchMorph({
    characterRef: selfRef,
    searchBarRefs,
    config: searchConfig,
    onMorphStart: () => {
      setIsSearchActive(true);
      onSearchOpen?.();
    },
    onMorphComplete: onSearchOpenComplete,
    onReturnStart: onSearchClose,
    onReturnComplete: () => {
      setIsSearchActive(false);
      onSearchCloseComplete?.();
    },
  });

  // Expose methods and refs to parent
  useImperativeHandle(ref, () => ({
    spawnSparkle: (x: number, y: number, color?: string) => {
      if (canvasRef.current && canvasRef.current.spawnParticle) {
        canvasRef.current.spawnParticle('sparkle', x, y, color);
      }
    },
    leftBodyRef,
    rightBodyRef,
    shadowRef,
    innerGlowRef,
    outerGlowRef,
    characterRef,
    spawnLoveHearts: () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const antyX = containerRect.left + containerRect.width / 2;
      const antyY = containerRect.top + containerRect.height / 2;

      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 7.20312H6.08634V13.2895H0V7.20312Z" fill="#8B5CF6"/>
              <path d="M0 14.4004H6.08634V20.4867H0V14.4004Z" fill="#8B5CF6"/>
              <path d="M7.19922 7.20312H13.2856V13.2895H7.19922V7.20312Z" fill="#8B5CF6"/>
              <path d="M14.3984 7.20312H20.4848V13.2895H14.3984V7.20312Z" fill="#8B5CF6"/>
              <path d="M7.19922 0.00195312H13.2856V6.08829H7.19922V0.00195312Z" fill="#8B5CF6"/>
              <path d="M7.19922 14.4004H13.2856V20.4867H7.19922V14.4004Z" fill="#8B5CF6"/>
              <path d="M7.19922 21.6016H13.2856V27.6879H7.19922V21.6016Z" fill="#8B5CF6"/>
              <path d="M14.3984 28.8008H20.4848V34.8871H14.3984V28.8008Z" fill="#8B5CF6"/>
              <path d="M14.3984 21.6016H20.4848V27.6879H14.3984V21.6016Z" fill="#8B5CF6"/>
              <path d="M14.3984 14.4004H20.4848V20.4867H14.3984V14.4004Z" fill="#8B5CF6"/>
              <path d="M21.5996 7.20117H27.6859V13.2875H21.5996V7.20117Z" fill="#8B5CF6"/>
              <path d="M21.5996 0H27.6859V6.08634H21.5996V0Z" fill="#8B5CF6"/>
              <path d="M21.5996 14.4004H27.6859V20.4867H21.5996V14.4004Z" fill="#8B5CF6"/>
              <path d="M28.7988 14.4004H34.8852V20.4867H28.7988V14.4004Z" fill="#8B5CF6"/>
              <path d="M21.5996 21.6016H27.6859V27.6879H21.5996V21.6016Z" fill="#8B5CF6"/>
              <path d="M28.7988 7.20117H34.8852V13.2875H28.7988V7.20117Z" fill="#8B5CF6"/>
            </svg>
          `;
          heart.style.position = 'fixed';
          heart.style.left = `${antyX}px`;
          heart.style.top = `${antyY}px`;
          heart.style.pointerEvents = 'none';
          heart.style.zIndex = '1000';

          document.body.appendChild(heart);

          const angle = (i / 8) * Math.PI * 2;
          const distance = gsap.utils.random(60, 100);

          gsap.fromTo(heart,
            { x: 0, y: 0, scale: 0.5, opacity: 0 },
            {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: 1,
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to(heart, {
                  opacity: 0,
                  scale: 0.3,
                  duration: 0.3,
                  ease: 'power2.in',
                  onComplete: () => heart.remove()
                });
              }
            }
          );
        }, i * 80);
      }
    },
    spawnFeedingParticles: () => {
      const container = containerRef.current;
      if (!container) return;

      const emojiFood = ['🧁', '🍪', '🍩', '🍰', '🎂', '🍬', '🍭', '🍫', '🍓', '🍌', '🍎', '🍊', '⭐', '✨', '💖', '🌟'];
      const particleCount = 60;

      const particles: HTMLDivElement[] = [];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.textContent = emojiFood[Math.floor(Math.random() * emojiFood.length)];
        particle.style.position = 'fixed';
        particle.style.fontSize = `${gsap.utils.random(32, 56)}px`;
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';

        const angle = (i / particleCount) * Math.PI * 2;
        const startDistance = gsap.utils.random(400, 800);
        const startX = window.innerWidth / 2 + Math.cos(angle) * startDistance;
        const startY = window.innerHeight / 2 + Math.sin(angle) * startDistance;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;

        document.body.appendChild(particle);
        particles.push(particle);
      }

      const containerRect = container.getBoundingClientRect();
      const antyX = containerRect.left + containerRect.width / 2 - 12;
      const antyY = containerRect.top + containerRect.height / 2 - 30;

      particles.forEach((particle, i) => {
        const currentX = parseFloat(particle.style.left);
        const currentY = parseFloat(particle.style.top);

        const tl = gsap.timeline({ onComplete: () => particle.remove() });

        tl.fromTo(particle,
          {
            x: 0,
            y: 0,
            scale: 0.3,
            opacity: 0,
            rotation: gsap.utils.random(-180, 180),
          },
          {
            duration: gsap.utils.random(0.8, 1.4),
            x: antyX - currentX,
            y: antyY - currentY,
            rotation: gsap.utils.random(180, 540),
            scale: gsap.utils.random(0.8, 1.3),
            opacity: 1,
            ease: 'power2.in',
          }
        );

        tl.to(particle, {
          duration: 0.15,
          scale: 0,
          opacity: 0,
          ease: 'power4.in',
        });

        tl.delay(i * 0.01);
      });
    },
    spawnConfetti: (x: number, y: number, count = 30) => {
      if (!canvasRef.current || !canvasRef.current.spawnParticle || !containerRef.current) {
        return;
      }

      const canvasWidth = size * 5;
      const canvasHeight = size * 5;
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      const containerRect = containerRef.current.getBoundingClientRect();
      const charCenterX = containerRect.left + containerRect.width / 2;
      const charCenterY = containerRect.top + containerRect.height / 2;

      const offsetX = x - charCenterX;
      const offsetY = y - charCenterY;

      const canvasX = canvasCenterX + offsetX;
      const canvasY = canvasCenterY + offsetY;

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          if (canvasRef.current?.spawnParticle) {
            canvasRef.current.spawnParticle('confetti', canvasX, canvasY);
          }
        }, i * 15);
      }
    },
    showSearchGlow: () => {
      if (canvasRef.current && canvasRef.current.showSearchGlow) {
        canvasRef.current.showSearchGlow();
      }
    },
    hideSearchGlow: () => {
      if (canvasRef.current && canvasRef.current.hideSearchGlow) {
        canvasRef.current.hideSearchGlow();
      }
    },
    playEmotion: (emotion: ExpressionName, options?: { isChatOpen?: boolean }) => {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        logAnimationEvent('playEmotion called via handle', { emotion, options });
      }

      const validEmotions: Record<string, EmotionType> = {
        'happy': 'happy',
        'excited': 'excited',
        'celebrate': 'celebrate',
        'pleased': 'pleased',
        'smize': 'smize',
        'sad': 'sad',
        'angry': 'angry',
        'shocked': 'shocked',
        'spin': 'spin',
        'wink': 'wink',
        'jump': 'jump',
        'idea': 'idea',
        'back-forth': 'back-forth',
        'look-around': 'look-around',
        'nod': 'nod',
        'headshake': 'headshake',
        'look-left': 'look-left',
        'look-right': 'look-right',
        'super': 'super',
      };

      const emotionType = validEmotions[emotion];
      if (emotionType) {
        return animationController.playEmotion(emotionType, { priority: options?.isChatOpen ? 3 : 2 });
      }

      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[AnimationController] Emotion not supported:', emotion);
      }
      return false;
    },
    startLook: (direction: 'left' | 'right') => {
      if (!leftEyeRef.current || !rightEyeRef.current || !leftEyePathRef.current || !rightEyePathRef.current || !leftEyeSvgRef.current || !rightEyeSvgRef.current) {
        return;
      }

      animationController.pause();

      const lookTl = createLookAnimation(
        {
          leftEye: leftEyeRef.current,
          rightEye: rightEyeRef.current,
          leftEyePath: leftEyePathRef.current,
          rightEyePath: rightEyePathRef.current,
          leftEyeSvg: leftEyeSvgRef.current,
          rightEyeSvg: rightEyeSvgRef.current,
        },
        { direction }
      );
      lookTl.play();
    },
    endLook: () => {
      if (!leftEyeRef.current || !rightEyeRef.current || !leftEyePathRef.current || !rightEyePathRef.current || !leftEyeSvgRef.current || !rightEyeSvgRef.current) {
        return;
      }

      const returnTl = createReturnFromLookAnimation({
        leftEye: leftEyeRef.current,
        rightEye: rightEyeRef.current,
        leftEyePath: leftEyePathRef.current,
        rightEyePath: rightEyePathRef.current,
        leftEyeSvg: leftEyeSvgRef.current,
        rightEyeSvg: rightEyeSvgRef.current,
      });
      returnTl.eventCallback('onComplete', () => {
        animationController.resume();
      });
      returnTl.play();
    },
    killAll: () => {
      animationController.killAll();
    },
    pauseIdle: () => {
      animationController.pause();
    },
    resumeIdle: () => {
      animationController.resume();
    },
    setSuperMode: (scale: number | null) => {
      animationController.setSuperMode(scale);
    },
    showGlows: (fadeIn = true) => {
      animationController.showGlows(fadeIn);
    },
    hideGlows: () => {
      animationController.hideGlows();
    },
    // Search bar morph (when searchEnabled)
    morphToSearchBar: searchEnabled ? internalMorphToSearchBar : undefined,
    morphToCharacter: searchEnabled ? internalMorphToCharacter : undefined,
    isSearchMode: () => isSearchActive,
    leftEyeRef,
    rightEyeRef,
    leftEyePathRef,
    rightEyePathRef,
  }), [size, animationController, isSuperMode, searchEnabled, internalMorphToSearchBar, internalMorphToCharacter, isSearchActive]);

  useEffect(() => {
    setCurrentExpression(expression);
  }, [expression]);

  // Play emotion when expression changes
  useEffect(() => {
    if (!animationController.isReady) return;
    if (isOff) return;

    const validEmotions: Record<string, EmotionType> = {
      'happy': 'happy',
      'excited': 'excited',
      'celebrate': 'celebrate',
      'pleased': 'pleased',
      'smize': 'smize',
      'sad': 'sad',
      'angry': 'angry',
      'shocked': 'shocked',
      'spin': 'spin',
      'wink': 'wink',
      'jump': 'jump',
      'idea': 'idea',
      'back-forth': 'back-forth',
      'look-around': 'look-around',
      'nod': 'nod',
      'headshake': 'headshake',
      'look-left': 'look-left',
      'look-right': 'look-right',
      'super': 'super',
    };

    const emotionType = validEmotions[expression];
    if (emotionType) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        logAnimationEvent('Expression changed → playEmotion', { expression, emotionType });
      }
      // Allow re-triggers - controller handles deduplication if needed
      animationController.playEmotion(emotionType, { priority: 2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, isOff]);

  // Super mode glow animation
  useEffect(() => {
    if (!superGlowRef.current) return;

    if (isSuperMode) {
      superGlowTimelineRef.current?.kill();
      const glowTl = gsap.timeline({ repeat: -1, yoyo: true });
      glowTl.to(superGlowRef.current, { opacity: 0.9, scale: 1.1, duration: 0.8, ease: 'sine.inOut' });
      superGlowTimelineRef.current = glowTl;
    } else {
      superGlowTimelineRef.current?.kill();
      superGlowTimelineRef.current = null;
      gsap.set(superGlowRef.current, { opacity: 0, scale: 1 });
    }

    return () => { superGlowTimelineRef.current?.kill(); };
  }, [isSuperMode]);

  // Track expression in ref for scheduler
  const currentExpressionRef = useRef(expression);
  useEffect(() => {
    currentExpressionRef.current = expression;
  }, [expression]);

  const searchModeRef = useRef(searchMode);
  useEffect(() => {
    searchModeRef.current = searchMode;
  }, [searchMode]);

  const onSpontaneousExpressionRef = useRef(onSpontaneousExpression);
  useEffect(() => {
    onSpontaneousExpressionRef.current = onSpontaneousExpression;
  }, [onSpontaneousExpression]);

  // Idle duration tracking
  const idleStartTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    if (expression === 'idle') {
      idleStartTimeRef.current = Date.now();
    }
  }, [expression]);

  // Bored behavior scheduler
  useGSAP(
    () => {
      let isActive = true;
      const MIN_IDLE_TIME_MS = 120000; // 2 minutes

      const scheduleRandomBehavior = () => {
        if (!isActive) return;

        gsap.delayedCall(gsap.utils.random(60, 120), () => {
          if (!isActive) return;

          const isIdlePlaying = animationController.isIdlePlaying();
          const hasBeenIdleLongEnough = (Date.now() - idleStartTimeRef.current) >= MIN_IDLE_TIME_MS;

          if (currentExpressionRef.current !== 'idle' || searchModeRef.current || !isIdlePlaying || !hasBeenIdleLongEnough) {
            scheduleRandomBehavior();
            return;
          }

          // TODO: Add bored emotions here
          scheduleRandomBehavior();
        });
      };

      scheduleRandomBehavior();
      return () => { isActive = false; };
    },
    { scope: containerRef, dependencies: [] }
  );

  // SVG paths for body
  const bodyRightSvg = "/anty/body-right.svg";
  const bodyLeftSvg = "/anty/body-left.svg";

  // Use fullContainer (1.5x height) when rendering internal shadow/glow
  // Use regular container when using external refs (main page manages its own container size)
  const useFullContainer = (showShadow && !hasExternalShadow) || (showGlow && !hasExternalGlow);
  const containerStyle = useFullContainer ? styles.fullContainer(size) : styles.container(size);

  return (
    <div
      ref={containerRef}
      style={{
        ...containerStyle,
        ...style,
      }}
      className={className}
    >
      {/* Canvas overlay for particles */}
      <AntyParticleCanvas ref={canvasRef} particles={particles} width={size * 5} height={size * 5} />

      {/* Character area - positioned at top of fullContainer, or fills regular container */}
      <div style={useFullContainer ? styles.characterArea(size) : { position: 'relative', width: size, height: size }}>
        {/* Outer glow (behind everything) - only render if not using external ref */}
        {showGlow && !hasExternalGlow && (
          <div
            ref={internalOuterGlowRef}
            style={styles.outerGlow(sizeScale)}
          />
        )}

        {/* Inner glow - only render if not using external ref */}
        {showGlow && !hasExternalGlow && (
          <div
            ref={internalInnerGlowRef}
            style={styles.innerGlow(sizeScale)}
          />
        )}

        {/* Super Mode Golden Glow */}
        {isSuperMode && (
          <div
            ref={superGlowRef}
            style={styles.superGlow}
          />
        )}

        {/* Character body with animations */}
        <div
          ref={characterRef}
          className={isSuperMode ? 'super-mode' : undefined}
          style={styles.character}
        >
          {/* Anty body layers from Figma */}
          <div ref={rightBodyRef} style={styles.rightBody}>
            <img alt="" style={styles.bodyImage} src={bodyRightSvg} />
          </div>
          <div ref={leftBodyRef} style={styles.leftBody}>
            <img alt="" style={styles.bodyImage} src={bodyLeftSvg} />
          </div>

          {/* Left eye */}
          <div style={styles.leftEyeContainer}>
            <div
              ref={leftEyeRef}
              style={styles.eyeWrapper(initialEyeDimensions.width, initialEyeDimensions.height, sizeScale)}
            >
              <svg
                ref={leftEyeSvgRef}
                width="100%"
                height="100%"
                viewBox={initialEyeDimensions.viewBox}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <path
                  ref={leftEyePathRef}
                  d={getEyeShape('IDLE', 'left')}
                  fill="#052333"
                />
              </svg>
            </div>
          </div>

          {/* Right eye */}
          <div style={styles.rightEyeContainer}>
            <div
              ref={rightEyeRef}
              style={styles.eyeWrapper(initialEyeDimensions.width, initialEyeDimensions.height, sizeScale)}
            >
              <svg
                ref={rightEyeSvgRef}
                width="100%"
                height="100%"
                viewBox={initialEyeDimensions.viewBox}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <path
                  ref={rightEyePathRef}
                  d={getEyeShape('IDLE', 'right')}
                  fill="#052333"
                />
              </svg>
            </div>
          </div>

          {/* Debug overlays */}
          {debugMode && (
            <>
              <div style={styles.debugBorder} />

              {!isOff && (
                <>
                  <div style={styles.debugCrosshair('calc(33.41% + 13.915% - 1px)', 'calc(31.63% + 5.825% - 7px)', 'yellow', true)} />
                  <div style={styles.debugCrosshair('calc(33.41% + 13.915% - 6px)', 'calc(31.63% + 5.825% - 2px)', 'yellow', false)} />
                </>
              )}

              {!isOff && (
                <>
                  <div style={styles.debugCrosshair('calc(33.41% + 13.915% - 1px)', 'calc(57.36% + 5.82% - 7px)', 'orange', true)} />
                  <div style={styles.debugCrosshair('calc(33.41% + 13.915% - 6px)', 'calc(57.36% + 5.82% - 2px)', 'orange', false)} />
                </>
              )}
            </>
          )}
        </div>

        {/* Integrated search bar (when searchEnabled) */}
        {searchEnabled && (
          <AntySearchBar
            active={isSearchActive}
            value={searchValueState}
            onChange={handleSearchChange}
            inputRef={searchInputRef}
            barRef={searchBarRef}
            borderRef={searchBorderRef}
            borderGradientRef={searchBorderGradientRef}
            placeholderRef={searchPlaceholderRef}
            kbdRef={searchKbdRef}
            glowRef={searchGlowRef}
            config={searchConfig}
            placeholder={searchPlaceholder}
            keyboardShortcut={searchShortcut}
          />
        )}
      </div>

      {/* Shadow (below character) - only render if not using external ref */}
      {showShadow && !hasExternalShadow && (
        <div
          ref={internalShadowRef}
          style={styles.shadow(sizeScale)}
        />
      )}
    </div>
  );
});

AntyCharacter.displayName = 'AntyCharacter';
