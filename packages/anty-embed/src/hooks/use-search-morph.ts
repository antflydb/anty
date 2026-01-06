'use client';

import { useRef, useCallback, type RefObject } from 'react';
import gsap from 'gsap';
import type { AntyCharacterHandle } from '../components/AntyCharacter';
import type { SearchBarConfig } from '../types';
import { DEFAULT_SEARCH_BAR_CONFIG } from '../types';
import { ENABLE_ANIMATION_DEBUG_LOGS } from '../lib/animation/feature-flags';

export interface SearchBarRefs {
  bar: RefObject<HTMLDivElement | null>;
  border: RefObject<HTMLDivElement | null>;
  borderGradient: RefObject<HTMLDivElement | null>;
  placeholder: RefObject<HTMLDivElement | null>;
  kbd: RefObject<HTMLDivElement | null>;
  glow: RefObject<HTMLDivElement | null>;
  input: RefObject<HTMLInputElement | null>;
}

export interface UseSearchMorphOptions {
  characterRef: RefObject<AntyCharacterHandle | null>;
  searchBarRefs: SearchBarRefs;
  config?: SearchBarConfig;
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
  onMorphStart,
  onMorphComplete,
  onReturnStart,
  onReturnComplete,
}: UseSearchMorphOptions): UseSearchMorphReturn {
  const morphingRef = useRef(false);

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

    const tl = gsap.timeline({
      onComplete: () => {
        morphingRef.current = false;
        searchBarRefs.input.current?.focus();
        onMorphComplete?.();
      }
    });

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

    if (!leftBody || !rightBody || !searchBar) return;

    // CRITICAL: Notify AnimationController BEFORE killing animations
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

    // Set shadow to 0 immediately
    if (shadow) {
      gsap.killTweensOf(shadow);
      gsap.set(shadow, { xPercent: -50, opacity: 0, scaleX: 1, scaleY: 1 });
    }

    // STEP 1: Body halves separate, scale down, move to corners
    const { bracketScale } = config;

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
      console.log('[MORPH] Direct from bracket positions:', {
        leftBracket: { size: leftBracketSize, scaledSize: scaledLeftBracketSize },
        rightBracket: { size: rightBracketSize, scaledSize: scaledRightBracketSize },
        transforms: { left: { x: leftTransformX, y: leftTransformY }, right: { x: rightTransformX, y: rightTransformY } }
      });
    }

    // Set z-index on character container AND brackets
    const characterContainer = leftBody.parentElement;
    gsap.set(characterContainer, { zIndex: 10 });
    gsap.set([leftBody, rightBody], {
      zIndex: 3,
      transformOrigin: '50% 50%'
    });

    // Shadow fades out immediately
    if (shadow) {
      tl.to(shadow, {
        opacity: 0,
        duration: 0.1,
        ease: 'power2.in'
      }, 0);
    }

    // Anticipation: slight squash down (80ms)
    tl.to([leftBody, rightBody], {
      y: 5,
      scaleY: 0.92,
      scaleX: 1.08,
      duration: 0.08,
      ease: 'power2.in'
    }, 0);

    // Eyes fade out during anticipation
    const fadeTargets = [leftEye, rightEye].filter(Boolean);
    if (fadeTargets.length > 0) {
      tl.to(fadeTargets, {
        opacity: 0,
        y: -18,
        duration: 0.15,
        ease: 'power1.in',
        overwrite: true
      }, 0);
    }

    // Leap up with stretch (120ms)
    tl.to([leftBody, rightBody], {
      y: -25,
      scaleY: 1.1,
      scaleX: 0.95,
      duration: 0.12,
      ease: 'power2.out'
    }, 0.08);

    // Morph out to corners while in the air (350ms)
    tl.to(leftBody, {
      x: leftTransformX,
      y: leftTransformY,
      scale: bracketScale,
      scaleX: bracketScale,
      scaleY: bracketScale,
      rotation: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      overwrite: 'auto'
    }, 0.2);

    tl.to(rightBody, {
      x: rightTransformX,
      y: rightTransformY,
      scale: bracketScale,
      scaleX: bracketScale,
      scaleY: bracketScale,
      rotation: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      overwrite: 'auto'
    }, 0.2);

    // Search bar fades in (250ms)
    tl.to(searchBar, {
      opacity: 1,
      duration: 0.25,
      ease: 'power1.out'
    }, 0.2);

    // Animated gradient border fades in and starts rotating
    const searchBorderGradient = searchBarRefs.borderGradient.current;
    if (searchBorderGradient) {
      searchBorderGradient.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
      gsap.set(searchBorderGradient, { opacity: 0 });

      const rotationAnim = { deg: 0 };
      gsap.to(rotationAnim, {
        deg: 360,
        duration: 4,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          if (searchBorderGradient) {
            searchBorderGradient.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from ${rotationAnim.deg}deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
          }
        }
      });

      tl.to(searchBorderGradient, {
        opacity: 1,
        duration: 0.3,
        ease: 'power1.out'
      }, 0.45);
    }

    // Placeholder reveals with subtle blur and upward drift
    const searchPlaceholder = searchBarRefs.placeholder.current;
    if (searchPlaceholder) {
      gsap.set(searchPlaceholder, {
        opacity: 0,
        filter: 'blur(6px)',
        y: 4,
      });

      tl.to(searchPlaceholder, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.18,
        ease: 'power2.out'
      }, 0.42);
    }

    // CMD+K indicator reveals
    const searchKbd = searchBarRefs.kbd.current;
    if (searchKbd) {
      gsap.set(searchKbd, {
        opacity: 0,
        filter: 'blur(6px)',
        y: 4,
      });

      tl.to(searchKbd, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.18,
        ease: 'power2.out'
      }, 0.42);
    }

    // AI gradient glow fades in
    const searchGlow = searchBarRefs.glow.current;
    if (searchGlow) {
      gsap.set(searchGlow, { opacity: 0, scale: 0.95 });

      tl.to(searchGlow, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 0.45);

      // Start continuous breathing animation
      tl.call(() => {
        gsap.to(searchGlow, {
          scale: 1.12,
          opacity: 0.7,
          duration: 2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }, [], 0.85);
    }

    // Large glow appears
    tl.call(() => {
      characterRef.current?.showSearchGlow?.();
    }, [], 0.25);
  }, [characterRef, searchBarRefs, config, onMorphStart, onMorphComplete]);

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

    // Show glows when halves come back together
    setTimeout(() => {
      characterRef.current?.showGlows?.(true);
    }, 500);

    const tl = gsap.timeline({
      onComplete: () => {
        morphingRef.current = false;
        onReturnComplete?.();
      }
    });

    const leftBody = characterRef.current?.leftBodyRef?.current;
    const rightBody = characterRef.current?.rightBodyRef?.current;
    const leftEye = characterRef.current?.leftEyeRef?.current;
    const rightEye = characterRef.current?.rightEyeRef?.current;
    const searchBar = searchBarRefs.bar.current;
    const shadow = characterRef.current?.shadowRef?.current;

    if (!leftBody || !rightBody || !searchBar) return;

    // Notify AnimationController
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

    // Border gradient fades out
    if (searchBorderGradient) {
      tl.to(searchBorderGradient, {
        opacity: 0,
        duration: 0.15,
        ease: 'power1.in'
      }, 0);
    }

    // Placeholder and kbd blur out
    const textElements = [searchPlaceholder, searchKbd].filter(Boolean);
    if (textElements.length > 0) {
      tl.to(textElements, {
        opacity: 0,
        filter: 'blur(6px)',
        y: -4,
        duration: 0.15,
        ease: 'power2.in'
      }, 0);
    }

    // Search glow fades
    if (searchGlow) {
      tl.to(searchGlow, {
        opacity: 0,
        scale: 0.85,
        duration: 0.15,
        ease: 'power1.out'
      }, 0);
    }

    // Search bar container fades out
    tl.to(searchBar, {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in'
    }, 0.15);

    // Hide search glow canvas effect
    tl.call(() => {
      characterRef.current?.hideSearchGlow?.();
    }, [], 0);

    // Clear z-index from character container
    const characterContainer = leftBody.parentElement;
    if (characterContainer) {
      gsap.set(characterContainer, { clearProps: 'zIndex' });
    }

    // Snap back to center with upward leap
    tl.to([leftBody, rightBody], {
      x: 0,
      y: -25,
      scale: 1,
      scaleX: 0.95,
      scaleY: 1.1,
      duration: 0.25,
      ease: 'power2.out',
      clearProps: 'zIndex'
    }, 0.3);

    // Settle down to rest
    tl.to([leftBody, rightBody], {
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.17,
      ease: 'power2.in'
    }, 0.55);

    // Eyes fade in
    if (leftEye && rightEye) {
      gsap.set([leftEye, rightEye], { y: -18 });

      tl.to([leftEye, rightEye], {
        opacity: 1,
        y: 0,
        duration: 0.17,
        ease: 'power2.in'
      }, 0.55);
    }

    // Shadow fades back in
    if (shadow) {
      tl.to(shadow, {
        opacity: 0.7,
        scaleX: 1,
        scaleY: 1,
        duration: 0.22,
        ease: 'power1.out'
      }, 0.67);
    }

    // Force final states when timeline completes
    tl.call(() => {
      if (leftEye) gsap.set(leftEye, { opacity: 1, y: 0 });
      if (rightEye) gsap.set(rightEye, { opacity: 1, y: 0 });
      if (shadow) gsap.set(shadow, { xPercent: -50, opacity: 0.7, scaleX: 1, scaleY: 1 });
      if (searchBorderGradient) gsap.set(searchBorderGradient, { opacity: 0 });
      if (searchPlaceholder) gsap.set(searchPlaceholder, { opacity: 0, filter: 'blur(0px)', y: 0 });
      if (searchKbd) gsap.set(searchKbd, { opacity: 0, filter: 'blur(0px)', y: 0 });
      if (searchGlow) gsap.set(searchGlow, { opacity: 0, scale: 1 });
      gsap.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0, scaleX: 1, scaleY: 1 });
    }, [], 0.72);
  }, [characterRef, searchBarRefs, onReturnStart, onReturnComplete]);

  return {
    morphToSearchBar,
    morphToCharacter,
    isMorphing: morphingRef.current,
  };
}
