'use client';

import { useRef, useCallback, type RefObject, useState, useEffect } from 'react';
import gsap from 'gsap';
import type { AntyCharacterHandle } from '../components/AntyCharacter';
import type { SearchBarConfig } from '../types';
import { DEFAULT_SEARCH_BAR_CONFIG } from '../types';
import { ENABLE_ANIMATION_DEBUG_LOGS } from '../lib/animation/feature-flags';
import { type BracketTargets } from '../lib/animation/bracket-positions';

// Detect touch device
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export interface SearchBarRefs {
  bar: RefObject<HTMLDivElement | null>;
  border: RefObject<HTMLDivElement | null>;
  borderGradient: RefObject<HTMLDivElement | null>;
  placeholder: RefObject<HTMLDivElement | null>;
  kbd: RefObject<HTMLDivElement | null>;
  glow: RefObject<HTMLDivElement | null>;
  input: RefObject<HTMLInputElement | null>;
}

// Reference size at which bracketScale produces the desired visual size
const BRACKET_REFERENCE_SIZE = 160;

export interface UseSearchMorphOptions {
  characterRef: RefObject<AntyCharacterHandle | null>;
  searchBarRefs: SearchBarRefs;
  config?: SearchBarConfig;
  /** Character size in pixels - used to maintain consistent bracket size */
  characterSize?: number;
  onMorphStart?: () => void;
  onMorphComplete?: () => void;
  onReturnStart?: () => void;
  onReturnComplete?: () => void;
}

export interface UseSearchMorphReturn {
  morphToSearchBar: () => void;
  morphToCharacter: () => void;
  isMorphing: boolean;
}

export function useSearchMorph({
  characterRef,
  searchBarRefs,
  config = DEFAULT_SEARCH_BAR_CONFIG,
  characterSize = BRACKET_REFERENCE_SIZE,
  onMorphStart,
  onMorphComplete,
  onReturnStart,
  onReturnComplete,
}: UseSearchMorphOptions): UseSearchMorphReturn {
  const morphingRef = useRef(false);
  // Track all active tweens so we can kill them if needed
  const activeTweensRef = useRef<gsap.core.Tween[]>([]);

  // Detect touch device after mount to avoid SSR mismatch
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);
  const shouldAutoFocus = config.autoFocusOnMorph ?? !isTouch;

  // Track search mode state for resize handling
  const [isSearchActive, setIsSearchActive] = useState(false);
  const isAnimatingRef = useRef(false);
  const lastTargetsRef = useRef<BracketTargets | null>(null);
  // Store original bracket sizes for recalculation (before any transforms)
  const originalBracketSizeRef = useRef<{ left: DOMRect; right: DOMRect } | null>(null);

  // Recalculate bracket positions on resize (only when search is active)
  // Uses delta-based approach: NO reset, just calculate difference and apply
  const recalculateWithValidation = useCallback(() => {
    // Guard: Don't recalc during active animation
    if (isAnimatingRef.current) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[RESIZE] Skipped - animation in progress');
      }
      return;
    }

    const leftBody = characterRef.current?.leftBodyRef?.current;
    const rightBody = characterRef.current?.rightBodyRef?.current;
    const searchBar = searchBarRefs.bar.current;

    if (!leftBody || !rightBody || !searchBar) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.warn('[RESIZE] Missing refs - cannot recalculate');
      }
      return;
    }

    // === DELTA-BASED APPROACH ===
    // Key insight: We can derive home position without resetting
    // home = visualPosition - currentTransform
    // This eliminates the visible reset that causes jank

    // 1. Get current transform values
    const currentLeftX = gsap.getProperty(leftBody, 'x') as number;
    const currentLeftY = gsap.getProperty(leftBody, 'y') as number;
    const currentRightX = gsap.getProperty(rightBody, 'x') as number;
    const currentRightY = gsap.getProperty(rightBody, 'y') as number;

    // 2. Get current visual positions (WITH transforms applied)
    const leftRect = leftBody.getBoundingClientRect();
    const rightRect = rightBody.getBoundingClientRect();
    const searchBarRect = searchBar.getBoundingClientRect();

    // Current visual centers
    const leftVisualCenterX = leftRect.left + leftRect.width / 2;
    const leftVisualCenterY = leftRect.top + leftRect.height / 2;
    const rightVisualCenterX = rightRect.left + rightRect.width / 2;
    const rightVisualCenterY = rightRect.top + rightRect.height / 2;

    // 3. Calculate target positions (search bar corners)
    // Brackets are already scaled, so use their current visual size
    const scaledLeftSize = leftRect.width;
    const scaledRightSize = rightRect.width;

    // Target: bracket centers positioned so outer edges align with search bar corners
    const leftTargetCenterX = searchBarRect.left + scaledLeftSize / 2;
    const leftTargetCenterY = searchBarRect.top + scaledLeftSize / 2;
    const rightTargetCenterX = searchBarRect.right - scaledRightSize / 2;
    const rightTargetCenterY = searchBarRect.bottom - scaledRightSize / 2;

    // 4. Calculate deltas (how much to adjust)
    const leftDeltaX = leftTargetCenterX - leftVisualCenterX;
    const leftDeltaY = leftTargetCenterY - leftVisualCenterY;
    const rightDeltaX = rightTargetCenterX - rightVisualCenterX;
    const rightDeltaY = rightTargetCenterY - rightVisualCenterY;

    // Log if significant adjustment needed
    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log('[RESIZE] Delta adjustment:', {
        left: `(${leftDeltaX.toFixed(1)}, ${leftDeltaY.toFixed(1)})`,
        right: `(${rightDeltaX.toFixed(1)}, ${rightDeltaY.toFixed(1)})`,
        viewport: window.innerWidth,
      });
    }

    // 5. Apply deltas to current transforms (NO RESET - single visual change)
    gsap.set(leftBody, {
      x: currentLeftX + leftDeltaX,
      y: currentLeftY + leftDeltaY,
    });
    gsap.set(rightBody, {
      x: currentRightX + rightDeltaX,
      y: currentRightY + rightDeltaY,
    });

    // Update stored targets for reference
    const currentScale = gsap.getProperty(leftBody, 'scale') as number;
    lastTargetsRef.current = {
      left: { x: currentLeftX + leftDeltaX, y: currentLeftY + leftDeltaY, scale: currentScale },
      right: { x: currentRightX + rightDeltaX, y: currentRightY + rightDeltaY, scale: currentScale },
    };

    // Also update glow size to match search bar
    const searchGlow = searchBarRefs.glow.current;
    if (searchGlow) {
      gsap.set(searchGlow, { width: searchBarRect.width * 0.92 });
    }
  }, [characterRef, searchBarRefs]);

  // Resize listener - only active when search mode is open
  useEffect(() => {
    if (!isSearchActive) return;

    let timeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeout);
      // Debounce to avoid excessive recalculations
      timeout = setTimeout(recalculateWithValidation, 50);
    };

    window.addEventListener('resize', handleResize);

    // Also use ResizeObserver for more precise detection (handles zoom, etc.)
    let observer: ResizeObserver | null = null;
    if (searchBarRefs.bar.current) {
      observer = new ResizeObserver(handleResize);
      observer.observe(searchBarRefs.bar.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) {
        observer.disconnect();
      }
      clearTimeout(timeout);
    };
  }, [isSearchActive, recalculateWithValidation, searchBarRefs.bar]);

  const morphToSearchBar = useCallback(() => {
    // Prevent multiple simultaneous morphs
    if (morphingRef.current) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[SEARCH] Already morphing, ignoring');
      }
      return;
    }

    morphingRef.current = true;
    isAnimatingRef.current = true; // Prevent resize recalculation during animation
    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log('[SEARCH] Opening search mode');
    }
    onMorphStart?.();

    // Kill any existing tweens
    activeTweensRef.current.forEach(tween => tween.kill());
    activeTweensRef.current = [];

    const leftBody = characterRef.current?.leftBodyRef?.current;
    const rightBody = characterRef.current?.rightBodyRef?.current;
    const leftEye = characterRef.current?.leftEyeRef?.current;
    const rightEye = characterRef.current?.rightEyeRef?.current;
    const searchBar = searchBarRefs.bar.current;
    const shadow = characterRef.current?.shadowRef?.current;

    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log('[SEARCH] Elements:', {
        leftBody: !!leftBody,
        rightBody: !!rightBody,
        searchBar: !!searchBar,
        shadow: !!shadow,
      });
    }

    if (!leftBody || !rightBody || !searchBar) {
      morphingRef.current = false;
      return;
    }

    // CRITICAL: Pause idle BEFORE killing animations to prevent auto-restart
    if (characterRef.current?.pauseIdle) {
      characterRef.current.pauseIdle();
    }
    // Kill any running animations
    if (characterRef.current?.killAll) {
      characterRef.current.killAll();
    }

    // Kill ALL idle animations including character container
    const character = leftBody.parentElement;
    if (character) {
      gsap.killTweensOf(character);
      gsap.set(character, { x: 0, y: 0, rotation: 0, scale: 1 });
    }
    gsap.killTweensOf([leftBody, rightBody, shadow]);

    // Reset bracket positions to 0 before starting
    gsap.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0 });

    // Kill any ongoing animations on eyes
    if (leftEye) {
      gsap.killTweensOf(leftEye);
      gsap.set(leftEye, { opacity: 1 });
    }
    if (rightEye) {
      gsap.killTweensOf(rightEye);
      gsap.set(rightEye, { opacity: 1 });
    }

    // Note: Shadow is now handled by hideShadow() which pauses tracker and animates out

    // Calculate positions
    // Compensate bracket scale so brackets are always the same visual size regardless of character size
    const baseBracketScale = config.bracketScale;
    const bracketScale = baseBracketScale * (BRACKET_REFERENCE_SIZE / characterSize);

    // Set search bar to final scale BEFORE reading position
    gsap.set(searchBar, { scale: 1, opacity: 0 });

    // Get actual search bar position (at final scale)
    const searchBarRect = searchBar.getBoundingClientRect();

    // Get current bracket sizes (BEFORE scaling)
    const leftBracketRect = leftBody.getBoundingClientRect();
    const rightBracketRect = rightBody.getBoundingClientRect();

    // Store original bracket sizes for resize recalculation
    originalBracketSizeRef.current = { left: leftBracketRect, right: rightBracketRect };

    const leftBracketSize = leftBracketRect.width;
    const rightBracketSize = rightBracketRect.width;

    const scaledLeftBracketSize = leftBracketSize * bracketScale;
    const scaledRightBracketSize = rightBracketSize * bracketScale;

    // Get CURRENT center positions of brackets
    const leftCurrentCenterX = leftBracketRect.left + (leftBracketRect.width / 2);
    const leftCurrentCenterY = leftBracketRect.top + (leftBracketRect.height / 2);
    const rightCurrentCenterX = rightBracketRect.left + (rightBracketRect.width / 2);
    const rightCurrentCenterY = rightBracketRect.top + (rightBracketRect.height / 2);

    // Calculate target bracket centers (so OUTER EDGES align with search bar)
    const leftTargetCenterX = searchBarRect.left + (scaledLeftBracketSize / 2);
    const leftTargetCenterY = searchBarRect.top + (scaledLeftBracketSize / 2);
    const rightTargetCenterX = searchBarRect.right - (scaledRightBracketSize / 2);
    const rightTargetCenterY = searchBarRect.bottom - (scaledRightBracketSize / 2);

    // Calculate transforms
    const leftTransformX = leftTargetCenterX - leftCurrentCenterX;
    const leftTransformY = leftTargetCenterY - leftCurrentCenterY;
    const rightTransformX = rightTargetCenterX - rightCurrentCenterX;
    const rightTransformY = rightTargetCenterY - rightCurrentCenterY;

    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log('[MORPH] Transforms:', {
        left: { x: leftTransformX, y: leftTransformY },
        right: { x: rightTransformX, y: rightTransformY }
      });
    }

    // Store targets for resize validation
    lastTargetsRef.current = {
      left: { x: leftTransformX, y: leftTransformY, scale: bracketScale },
      right: { x: rightTransformX, y: rightTransformY, scale: bracketScale },
    };

    // Set z-index on character container AND brackets
    const characterContainer = leftBody.parentElement;
    gsap.set(characterContainer, { zIndex: 10 });
    gsap.set([leftBody, rightBody], {
      zIndex: 3,
      transformOrigin: '50% 50%'
    });

    // === ANIMATIONS using setTimeout for delays (GSAP delay was being killed) ===
    const searchBorderGradient = searchBarRefs.borderGradient.current;
    const searchPlaceholder = searchBarRefs.placeholder.current;
    const searchKbd = searchBarRefs.kbd.current;
    const searchGlow = searchBarRefs.glow.current;

    // Immediate animations (0ms)
    // Hide shadow (pauses tracker and fades out)
    characterRef.current?.hideShadow?.();

    // Hide character glows (innerGlow/outerGlow) - they shouldn't show during search
    characterRef.current?.hideGlows?.();

    // Squash brackets
    gsap.to([leftBody, rightBody], { y: 5, scaleY: 0.92, scaleX: 1.08, duration: 0.08, ease: 'power2.in' });

    // Fade out eyes
    const fadeTargets = [leftEye, rightEye].filter(Boolean);
    if (fadeTargets.length > 0) {
      gsap.to(fadeTargets, { opacity: 0, y: -18, duration: 0.15, ease: 'power1.in' });
    }

    // 80ms: Leap up with stretch
    setTimeout(() => {
      gsap.to([leftBody, rightBody], { y: -25, scaleY: 1.1, scaleX: 0.95, duration: 0.12, ease: 'power2.out' });
    }, 80);

    // 200ms: Morph out to corners + search bar fade in
    setTimeout(() => {
      gsap.to(leftBody, {
        x: leftTransformX, y: leftTransformY,
        scale: bracketScale, scaleX: bracketScale, scaleY: bracketScale,
        duration: 0.35, ease: 'power2.inOut'
      });
      gsap.to(rightBody, {
        x: rightTransformX, y: rightTransformY,
        scale: bracketScale, scaleX: bracketScale, scaleY: bracketScale,
        duration: 0.35, ease: 'power2.inOut'
      });
      gsap.to(searchBar, { opacity: 1, duration: 0.25, ease: 'power1.out' });
    }, 200);

    // 300ms: Search bar ellipse glow starts fading in (after search bar bg is partly visible)
    setTimeout(() => {
      if (searchGlow) {
        // Start glow fade-in - glow element is sized to match search bar, blur creates the peek effect
        gsap.set(searchGlow, { opacity: 0, scale: 0.92 });
        gsap.to(searchGlow, { opacity: 0.7, scale: 0.95, duration: 0.35, ease: 'power2.out' });
      }
    }, 300);

    // 420ms: Placeholder and kbd reveal
    setTimeout(() => {
      if (searchPlaceholder) {
        gsap.set(searchPlaceholder, { opacity: 0, filter: 'blur(6px)', y: 4 });
        gsap.to(searchPlaceholder, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.18, ease: 'power2.out' });
      }
      if (searchKbd) {
        gsap.set(searchKbd, { opacity: 0, filter: 'blur(6px)', y: 4 });
        gsap.to(searchKbd, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.18, ease: 'power2.out' });
      }
    }, 420);

    // 450ms: Border gradient fade in
    setTimeout(() => {
      if (searchBorderGradient) {
        searchBorderGradient.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
        gsap.set(searchBorderGradient, { opacity: 0 });
        gsap.to(searchBorderGradient, { opacity: 1, duration: 0.3, ease: 'power1.out' });

        // Start rotating gradient
        const rotationAnim = { deg: 0 };
        gsap.to(rotationAnim, {
          deg: 360, duration: 4, ease: 'none', repeat: -1,
          onUpdate: () => {
            if (searchBorderGradient) {
              searchBorderGradient.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from ${rotationAnim.deg}deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
            }
          }
        });
      }
      // Glow continues to full opacity
      if (searchGlow) {
        gsap.to(searchGlow, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
      }
    }, 450);

    // 850ms: Start breathing animation on glow
    setTimeout(() => {
      if (searchGlow) {
        gsap.to(searchGlow, { scale: 1.12, opacity: 0.7, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true });
      }
    }, 850);

    // Complete callback after animation duration (~850ms)
    setTimeout(() => {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[SEARCH] Animation complete (timeout)');
      }
      morphingRef.current = false;
      isAnimatingRef.current = false; // Allow resize recalculation
      setIsSearchActive(true); // Enable resize listener
      // Conditionally auto-focus (default: true on desktop, false on touch)
      if (shouldAutoFocus) {
        searchBarRefs.input.current?.focus();
      }
      onMorphComplete?.();
    }, 900);

    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log('[SEARCH] Animations started with delays');
    }
  }, [characterRef, searchBarRefs, config, onMorphStart, onMorphComplete, shouldAutoFocus]);

  const morphToCharacter = useCallback(() => {
    // Prevent multiple simultaneous morphs
    if (morphingRef.current) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[SEARCH] Already morphing, ignoring close');
      }
      return;
    }

    morphingRef.current = true;
    isAnimatingRef.current = true; // Prevent resize recalculation during animation
    setIsSearchActive(false); // Disable resize listener
    onReturnStart?.();

    // Kill any existing tweens
    activeTweensRef.current.forEach(tween => tween.kill());
    activeTweensRef.current = [];

    // Show glows when halves come back together
    setTimeout(() => {
      characterRef.current?.showGlows?.(true);
    }, 500);

    const leftBody = characterRef.current?.leftBodyRef?.current;
    const rightBody = characterRef.current?.rightBodyRef?.current;
    const leftEye = characterRef.current?.leftEyeRef?.current;
    const rightEye = characterRef.current?.rightEyeRef?.current;
    const searchBar = searchBarRefs.bar.current;
    const shadow = characterRef.current?.shadowRef?.current;

    if (!leftBody || !rightBody || !searchBar) {
      morphingRef.current = false;
      return;
    }

    // Pause idle and kill running animations
    if (characterRef.current?.pauseIdle) {
      characterRef.current.pauseIdle();
    }
    if (characterRef.current?.killAll) {
      characterRef.current.killAll();
    }

    // Kill ongoing animations
    const searchBorderGradient = searchBarRefs.borderGradient.current;
    if (searchBorderGradient) {
      gsap.killTweensOf(searchBorderGradient);
    }
    const searchPlaceholder = searchBarRefs.placeholder.current;
    if (searchPlaceholder) {
      gsap.killTweensOf(searchPlaceholder);
    }
    const searchKbd = searchBarRefs.kbd.current;
    if (searchKbd) {
      gsap.killTweensOf(searchKbd);
    }
    const searchGlow = searchBarRefs.glow.current;
    if (searchGlow) {
      gsap.killTweensOf(searchGlow);
    }

    // Hide search glow canvas effect immediately
    characterRef.current?.hideSearchGlow?.();

    // Border gradient fades out (0s)
    if (searchBorderGradient) {
      activeTweensRef.current.push(
        gsap.to(searchBorderGradient, {
          opacity: 0,
          duration: 0.15,
          ease: 'power1.in'
        })
      );
    }

    // Placeholder and kbd blur out (0s)
    const textElements = [searchPlaceholder, searchKbd].filter(Boolean);
    if (textElements.length > 0) {
      activeTweensRef.current.push(
        gsap.to(textElements, {
          opacity: 0,
          filter: 'blur(6px)',
          y: -4,
          duration: 0.15,
          ease: 'power2.in'
        })
      );
    }

    // Search glow fades (0s)
    if (searchGlow) {
      activeTweensRef.current.push(
        gsap.to(searchGlow, {
          opacity: 0,
          scale: 0.85,
          duration: 0.15,
          ease: 'power1.out'
        })
      );
    }

    // Search bar container fades out (150ms delay)
    activeTweensRef.current.push(
      gsap.to(searchBar, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        delay: 0.15,
        ease: 'power2.in'
      })
    );

    // Clear z-index from character container
    const characterContainer = leftBody.parentElement;
    if (characterContainer) {
      gsap.set(characterContainer, { clearProps: 'zIndex' });
    }

    // Snap back to center with upward leap (300ms delay)
    activeTweensRef.current.push(
      gsap.to([leftBody, rightBody], {
        x: 0,
        y: -25,
        scale: 1,
        scaleX: 0.95,
        scaleY: 1.1,
        duration: 0.25,
        delay: 0.3,
        ease: 'power2.out',
        clearProps: 'zIndex'
      })
    );

    // Settle down to rest (550ms delay)
    activeTweensRef.current.push(
      gsap.to([leftBody, rightBody], {
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.17,
        delay: 0.55,
        ease: 'power2.in'
      })
    );

    // Eyes fade in (550ms delay)
    if (leftEye && rightEye) {
      gsap.set([leftEye, rightEye], { y: -18 });

      activeTweensRef.current.push(
        gsap.to([leftEye, rightEye], {
          opacity: 1,
          y: 0,
          duration: 0.17,
          delay: 0.55,
          ease: 'power2.in'
        })
      );
    }

    // Shadow fades back in (670ms delay) - resume tracker which handles opacity
    setTimeout(() => {
      characterRef.current?.showShadow?.();
    }, 670);

    // Complete and cleanup (720ms delay)
    setTimeout(() => {
      if (leftEye) gsap.set(leftEye, { opacity: 1, y: 0 });
      if (rightEye) gsap.set(rightEye, { opacity: 1, y: 0 });
      // Note: shadow is now managed by the shadow tracker (showShadow resumes it)
      if (searchBorderGradient) gsap.set(searchBorderGradient, { opacity: 0 });
      if (searchPlaceholder) gsap.set(searchPlaceholder, { opacity: 0, filter: 'blur(0px)', y: 0 });
      if (searchKbd) gsap.set(searchKbd, { opacity: 0, filter: 'blur(0px)', y: 0 });
      if (searchGlow) gsap.set(searchGlow, { opacity: 0, scale: 1 });
      gsap.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0, scaleX: 1, scaleY: 1 });

      // Resume idle animations after morph back is complete
      if (characterRef.current?.resumeIdle) {
        characterRef.current.resumeIdle();
      }

      morphingRef.current = false;
      isAnimatingRef.current = false;
      // Clear stored bracket data
      lastTargetsRef.current = null;
      originalBracketSizeRef.current = null;
      onReturnComplete?.();
    }, 750);
  }, [characterRef, searchBarRefs, onReturnStart, onReturnComplete]);

  return {
    morphToSearchBar,
    morphToCharacter,
    isMorphing: morphingRef.current,
  };
}
