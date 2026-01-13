'use client';

import { useRef, useCallback, type RefObject, useState, useEffect } from 'react';
import gsap from 'gsap';
import type { AntyCharacterHandle } from '../components/AntyCharacter';
import type { SearchBarConfig } from '../types';
import { DEFAULT_SEARCH_BAR_CONFIG } from '../types';
import { ENABLE_ANIMATION_DEBUG_LOGS } from '../lib/animation/feature-flags';

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
  /** CSS-positioned left bracket duplicate (for glued resize behavior) */
  leftBracket: RefObject<HTMLDivElement | null>;
  /** CSS-positioned right bracket duplicate (for glued resize behavior) */
  rightBracket: RefObject<HTMLDivElement | null>;
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
  /** Show search bar instantly without morph animation (for searchOnly mode) */
  showInstant: () => void;
  /** Hide search bar instantly without morph animation (for searchOnly mode) */
  hideInstant: () => void;
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

  const morphToSearchBar = useCallback(() => {
    // Prevent multiple simultaneous morphs
    if (morphingRef.current) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[SEARCH] Already morphing, ignoring');
      }
      return;
    }

    morphingRef.current = true;
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
        // Centering is via CSS margins, so GSAP can animate scale freely (from center)
        gsap.set(searchGlow, { opacity: 0, scale: 0.92, transformOrigin: 'center center' });
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

    // 550ms: CROSSFADE - Switch from GSAP-animated originals to CSS-positioned duplicates
    // This is when original brackets have reached their final positions
    // CSS duplicates are glued to search bar corners and handle resize automatically
    setTimeout(() => {
      const leftDupe = searchBarRefs.leftBracket.current;
      const rightDupe = searchBarRefs.rightBracket.current;

      if (leftDupe && rightDupe && leftBody && rightBody) {
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
          console.log('[SEARCH] Crossfade: switching to CSS-positioned duplicates');
        }
        // Crossfade: fade in CSS duplicates, fade out GSAP originals
        gsap.to([leftDupe, rightDupe], { opacity: 1, duration: 0.05, ease: 'power1.out' });
        gsap.to([leftBody, rightBody], { opacity: 0, duration: 0.05, ease: 'power1.in' });
      }
    }, 550);

    // 850ms: Start breathing animation on glow
    setTimeout(() => {
      if (searchGlow) {
        // Breathing animation - xPercent/yPercent already set, just animate scale
        gsap.to(searchGlow, { scale: 1.12, opacity: 0.7, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true });
      }
    }, 850);

    // Complete callback after animation duration (~900ms)
    setTimeout(() => {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[SEARCH] Animation complete (timeout)');
      }
      morphingRef.current = false;
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
    onReturnStart?.();

    // Kill any existing tweens
    activeTweensRef.current.forEach(tween => tween.kill());
    activeTweensRef.current = [];

    // Get duplicate bracket refs for crossfade
    const leftDupe = searchBarRefs.leftBracket.current;
    const rightDupe = searchBarRefs.rightBracket.current;

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

    // REVERSE CROSSFADE: Switch back from CSS duplicates to GSAP originals
    // Originals still have their transforms from when morph completed, so they're at the corners
    if (leftDupe && rightDupe && leftBody && rightBody) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[SEARCH] Reverse crossfade: switching back to GSAP originals');
      }
      // Make originals visible (still at corner positions via transforms)
      gsap.set([leftBody, rightBody], { opacity: 1 });
      // Hide CSS duplicates
      gsap.to([leftDupe, rightDupe], { opacity: 0, duration: 0.05, ease: 'power1.in' });
    }

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
      // Reset original brackets
      gsap.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 });
      // Ensure CSS duplicates are hidden
      if (leftDupe) gsap.set(leftDupe, { opacity: 0 });
      if (rightDupe) gsap.set(rightDupe, { opacity: 0 });

      // Resume idle animations after morph back is complete
      if (characterRef.current?.resumeIdle) {
        characterRef.current.resumeIdle();
      }

      morphingRef.current = false;
      onReturnComplete?.();
    }, 750);
  }, [characterRef, searchBarRefs, onReturnStart, onReturnComplete]);

  /**
   * Show search bar instantly without morph animation.
   * Used for searchOnly mode where there's no character to morph from.
   * Sets the same final state as morphToSearchBar but immediately.
   */
  const showInstant = useCallback(() => {
    const searchBar = searchBarRefs.bar.current;
    const searchBorderGradient = searchBarRefs.borderGradient.current;
    const searchPlaceholder = searchBarRefs.placeholder.current;
    const searchKbd = searchBarRefs.kbd.current;
    const searchGlow = searchBarRefs.glow.current;
    const leftDupe = searchBarRefs.leftBracket.current;
    const rightDupe = searchBarRefs.rightBracket.current;

    if (!searchBar) return;

    // Kill any existing animations
    gsap.killTweensOf([searchBar, searchBorderGradient, searchPlaceholder, searchKbd, searchGlow, leftDupe, rightDupe].filter(Boolean));

    // Set search bar visible
    gsap.set(searchBar, { opacity: 1, scale: 1 });

    // Set border gradient visible and start rotation (if gradient style)
    if (searchBorderGradient) {
      const borderStyle = config.borderStyle ?? 'gradient';
      if (borderStyle === 'gradient') {
        searchBorderGradient.style.background = 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box';
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
      gsap.set(searchBorderGradient, { opacity: 1 });
    }

    // Set placeholder and kbd visible
    if (searchPlaceholder) {
      gsap.set(searchPlaceholder, { opacity: 1, filter: 'blur(0px)', y: 0 });
    }
    if (searchKbd) {
      gsap.set(searchKbd, { opacity: 1, filter: 'blur(0px)', y: 0 });
    }

    // Set glow visible with breathing animation (if showGlow)
    if (searchGlow && (config.showGlow ?? true)) {
      // Centering is via CSS margins, so GSAP can animate scale freely (from center)
      gsap.set(searchGlow, { opacity: 1, scale: 1, transformOrigin: 'center center' });
      // Start breathing animation
      gsap.to(searchGlow, { scale: 1.12, opacity: 0.7, duration: 2, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }

    // Set bracket duplicates visible (if showBrackets)
    if ((config.showBrackets ?? true) && leftDupe && rightDupe) {
      gsap.set([leftDupe, rightDupe], { opacity: 1 });
    }

    // Auto-focus if enabled
    if (shouldAutoFocus) {
      searchBarRefs.input.current?.focus();
    }

    onMorphComplete?.();
  }, [searchBarRefs, config, shouldAutoFocus, onMorphComplete]);

  /**
   * Hide search bar instantly without morph animation.
   * Used for searchOnly mode cleanup.
   */
  const hideInstant = useCallback(() => {
    const searchBar = searchBarRefs.bar.current;
    const searchBorderGradient = searchBarRefs.borderGradient.current;
    const searchPlaceholder = searchBarRefs.placeholder.current;
    const searchKbd = searchBarRefs.kbd.current;
    const searchGlow = searchBarRefs.glow.current;
    const leftDupe = searchBarRefs.leftBracket.current;
    const rightDupe = searchBarRefs.rightBracket.current;

    // Kill all animations
    gsap.killTweensOf([searchBar, searchBorderGradient, searchPlaceholder, searchKbd, searchGlow, leftDupe, rightDupe].filter(Boolean));

    // Hide everything
    if (searchBar) gsap.set(searchBar, { opacity: 0 });
    if (searchBorderGradient) gsap.set(searchBorderGradient, { opacity: 0 });
    if (searchPlaceholder) gsap.set(searchPlaceholder, { opacity: 0 });
    if (searchKbd) gsap.set(searchKbd, { opacity: 0 });
    if (searchGlow) gsap.set(searchGlow, { opacity: 0, scale: 1 });
    if (leftDupe) gsap.set(leftDupe, { opacity: 0 });
    if (rightDupe) gsap.set(rightDupe, { opacity: 0 });

    onReturnComplete?.();
  }, [searchBarRefs, onReturnComplete]);

  return {
    morphToSearchBar,
    morphToCharacter,
    showInstant,
    hideInstant,
    isMorphing: morphingRef.current,
  };
}
