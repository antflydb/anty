/**
 * Search Morph Animation Definitions
 * Pure functions that create GSAP timelines for character ↔ search bar morphing
 */

import gsap from 'gsap';
import { type SearchBarConfig, DEFAULT_SEARCH_BAR_CONFIG } from '../types';

export interface MorphAnimationElements {
  character: HTMLElement;
  leftBody: HTMLElement;
  rightBody: HTMLElement;
  leftEye?: HTMLElement;
  rightEye?: HTMLElement;
  shadow: HTMLElement;
  innerGlow?: HTMLElement;
  outerGlow?: HTMLElement;
  searchBar: HTMLElement;
  searchBorderGradient?: HTMLElement;
  searchPlaceholder?: HTMLElement;
  searchKbd?: HTMLElement;
  searchGlow?: HTMLElement;
}

export type MorphDirection = 'in' | 'out';

export interface MorphAnimationCallbacks {
  onShowSearchGlow?: () => void;
  onHideSearchGlow?: () => void;
  onComplete?: () => void;
}

export interface MorphAnimationOptions {
  /** Search bar configuration for dimensions and bracket scale */
  config?: SearchBarConfig;
  /** Animation callbacks */
  callbacks?: MorphAnimationCallbacks;
}

/**
 * Creates search morph animation timeline
 *
 * Direction 'in' (character → search):
 * Multi-phase choreography:
 * 1. Anticipation squash (80ms)
 * 2. Leap up with stretch (120ms)
 * 3. Morph out to corners (350ms) - brackets scale down and move to search bar corners
 * 4. Search bar fades in (250ms) - during morph
 * 5. Border gradient, placeholder, kbd reveal (180-300ms)
 * 6. Search glow breathing animation starts
 *
 * Direction 'out' (search → character):
 * Reverse choreography:
 * 1. Border, text, glows fade out (150ms)
 * 2. Search bar fades out (200ms)
 * 3. Brackets snap back to center with leap (250ms)
 * 4. Settle down (170ms)
 * 5. Eyes, shadow, glows fade in during settle
 *
 * @param direction - 'in' for character→search, 'out' for search→character
 * @param elements - All DOM elements involved in morph
 * @param options - Optional config and callback functions
 * @returns GSAP timeline for morph animation
 */
export function createSearchMorphAnimation(
  direction: MorphDirection,
  elements: MorphAnimationElements,
  options: MorphAnimationOptions = {}
): gsap.core.Timeline {
  const {
    leftBody,
    rightBody,
    leftEye,
    rightEye,
    shadow,
    innerGlow,
    outerGlow,
    searchBar,
    searchBorderGradient,
    searchPlaceholder,
    searchKbd,
    searchGlow,
  } = elements;

  const { config = DEFAULT_SEARCH_BAR_CONFIG, callbacks = {} } = options;
  const { onShowSearchGlow, onHideSearchGlow, onComplete } = callbacks;
  const { bracketScale } = config;

  const timeline = gsap.timeline({
    onComplete,
  });

  const eyeElements = [leftEye, rightEye].filter(Boolean) as HTMLElement[];
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];

  if (direction === 'in') {
    // ============================================
    // MORPH TO SEARCH BAR (character → search)
    // ============================================

    // Kill ALL idle animations including character container
    const characterContainer = leftBody.parentElement;
    if (characterContainer) {
      gsap.killTweensOf(characterContainer);
      gsap.set(characterContainer, { x: 0, y: 0, rotation: 0, scale: 1, zIndex: 10 });
    }

    gsap.killTweensOf([leftBody, rightBody, shadow]);
    gsap.set([leftBody, rightBody], {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      zIndex: 3,
      transformOrigin: '50% 50%',
    });

    // Set eyes to visible
    if (eyeElements.length > 0) {
      gsap.killTweensOf(eyeElements);
      gsap.set(eyeElements, { opacity: 1 });
    }

    // Hide glows and shadow immediately
    if (glowElements.length > 0) {
      gsap.killTweensOf(glowElements);
      gsap.set(glowElements, { opacity: 0 });
    }
    gsap.killTweensOf(shadow);
    gsap.set(shadow, { xPercent: -50, opacity: 0, scaleX: 1, scaleY: 1 });

    // Set search bar to final scale before reading position
    gsap.set(searchBar, { scale: 1, opacity: 0 });

    // Calculate bracket target positions
    // Brackets scale to 0.14 and align outer edges with search bar corners
    const searchBarRect = searchBar.getBoundingClientRect();
    const leftBracketRect = leftBody.getBoundingClientRect();
    const rightBracketRect = rightBody.getBoundingClientRect();

    const leftBracketSize = leftBracketRect.width;
    const rightBracketSize = rightBracketRect.width;
    const scaledLeftBracketSize = leftBracketSize * bracketScale;
    const scaledRightBracketSize = rightBracketSize * bracketScale;

    // Current bracket centers (viewport-relative)
    const leftCurrentCenterX = leftBracketRect.left + leftBracketRect.width / 2;
    const leftCurrentCenterY = leftBracketRect.top + leftBracketRect.height / 2;
    const rightCurrentCenterX = rightBracketRect.left + rightBracketRect.width / 2;
    const rightCurrentCenterY = rightBracketRect.top + rightBracketRect.height / 2;

    // Target bracket centers (outer edges align with search bar)
    const leftTargetCenterX = searchBarRect.left + scaledLeftBracketSize / 2;
    const leftTargetCenterY = searchBarRect.top + scaledLeftBracketSize / 2;
    const rightTargetCenterX = searchBarRect.right - scaledRightBracketSize / 2;
    const rightTargetCenterY = searchBarRect.bottom - scaledRightBracketSize / 2;

    // Calculate transforms
    const leftTransformX = leftTargetCenterX - leftCurrentCenterX;
    const leftTransformY = leftTargetCenterY - leftCurrentCenterY;
    const rightTransformX = rightTargetCenterX - rightCurrentCenterX;
    const rightTransformY = rightTargetCenterY - rightCurrentCenterY;

    // PHASE 1: Anticipation - slight squash down (80ms)
    timeline.to(
      [leftBody, rightBody],
      {
        y: 5,
        scaleY: 0.92,
        scaleX: 1.08,
        duration: 0.08,
        ease: 'power2.in',
      },
      0
    );

    // Eyes fade out during anticipation and move up
    if (eyeElements.length > 0) {
      timeline.to(
        eyeElements,
        {
          opacity: 0,
          y: -18, // Move up with leap
          duration: 0.15,
          ease: 'power1.in',
          overwrite: true,
        },
        0
      );
    }

    // PHASE 2: Leap up with stretch (120ms)
    timeline.to(
      [leftBody, rightBody],
      {
        y: -25,
        scaleY: 1.1,
        scaleX: 0.95,
        duration: 0.12,
        ease: 'power2.out',
      },
      0.08
    );

    // PHASE 3: Morph out to corners (350ms)
    timeline.to(
      leftBody,
      {
        x: leftTransformX,
        y: leftTransformY,
        scale: bracketScale,
        scaleX: bracketScale,
        scaleY: bracketScale,
        rotation: 0,
        duration: 0.35,
        ease: 'power2.inOut',
        overwrite: true,
      },
      0.2
    );

    timeline.to(
      rightBody,
      {
        x: rightTransformX,
        y: rightTransformY,
        scale: bracketScale,
        scaleX: bracketScale,
        scaleY: bracketScale,
        rotation: 0,
        duration: 0.35,
        ease: 'power2.inOut',
        overwrite: true,
      },
      0.2
    );

    // PHASE 4: Search bar fades in (250ms)
    timeline.to(
      searchBar,
      {
        opacity: 1,
        duration: 0.25,
        ease: 'power1.out',
      },
      0.2
    );

    // PHASE 5: Border gradient fades in and starts rotating
    if (searchBorderGradient) {
      gsap.set(searchBorderGradient, { opacity: 0 });

      timeline.to(
        searchBorderGradient,
        {
          opacity: 1,
          duration: 0.3,
          ease: 'power1.out',
        },
        0.45
      );

      // Start continuous rotation (separate from timeline)
      timeline.call(
        () => {
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
            },
          });
        },
        [],
        0.75
      );
    }

    // PHASE 6: Placeholder and kbd reveal (180ms)
    const textElements = [searchPlaceholder, searchKbd].filter(Boolean) as HTMLElement[];
    if (textElements.length > 0) {
      textElements.forEach((el) => {
        gsap.set(el, {
          opacity: 0,
          filter: 'blur(6px)',
          y: 4,
        });
      });

      timeline.to(
        textElements,
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 0.18,
          ease: 'power2.out',
        },
        0.42
      );
    }

    // PHASE 7: Search glow fades in and starts breathing
    if (searchGlow) {
      gsap.set(searchGlow, { opacity: 0, scale: 0.95 });

      timeline.to(
        searchGlow,
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        0.45
      );

      // Start breathing animation (separate from timeline)
      timeline.call(
        () => {
          gsap.to(searchGlow, {
            scale: 1.12,
            opacity: 0.7,
            duration: 2,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });
        },
        [],
        0.85
      );
    }

    // PHASE 8: Show large search glow
    if (onShowSearchGlow) {
      timeline.call(onShowSearchGlow, [], 0.25);
    }
  } else {
    // ============================================
    // MORPH TO CHARACTER (search → character)
    // ============================================

    // Kill any ongoing animations
    const characterContainer = leftBody.parentElement;
    if (characterContainer) {
      gsap.killTweensOf(characterContainer);
      gsap.set(characterContainer, { clearProps: 'zIndex' });
    }
    gsap.killTweensOf([leftBody, rightBody, searchBar]);

    // Set starting states
    if (eyeElements.length > 0) {
      gsap.killTweensOf(eyeElements);
      gsap.set(eyeElements, { opacity: 0 }); // Keep y position from opening
    }
    gsap.killTweensOf(shadow);
    gsap.set(shadow, { xPercent: -50, opacity: 0, scaleX: 1, scaleY: 1 });
    if (glowElements.length > 0) {
      gsap.killTweensOf(glowElements);
      gsap.set(glowElements, { opacity: 0 });
    }

    // Kill search element animations
    [searchBorderGradient, searchPlaceholder, searchKbd, searchGlow]
      .filter(Boolean)
      .forEach((el) => gsap.killTweensOf(el!));

    // PHASE 1: Border gradient fades out (150ms)
    if (searchBorderGradient) {
      timeline.to(
        searchBorderGradient,
        {
          opacity: 0,
          duration: 0.15,
          ease: 'power1.in',
        },
        0
      );
    }

    // PHASE 2: Text elements blur out (150ms)
    const textElements = [searchPlaceholder, searchKbd].filter(Boolean) as HTMLElement[];
    if (textElements.length > 0) {
      timeline.to(
        textElements,
        {
          opacity: 0,
          filter: 'blur(6px)',
          y: -4, // Upward drift
          duration: 0.15,
          ease: 'power2.in',
        },
        0
      );
    }

    // PHASE 3: Search glow crossfades
    if (searchGlow) {
      timeline.to(
        searchGlow,
        {
          opacity: 0,
          scale: 0.85,
          duration: 0.35,
          ease: 'power1.out',
        },
        0.05
      );
    }

    // PHASE 4: Search bar fades out (200ms)
    timeline.to(
      searchBar,
      {
        opacity: 0,
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.in',
      },
      0.15
    );

    // PHASE 5: Hide search glow
    if (onHideSearchGlow) {
      timeline.call(onHideSearchGlow, [], 0);
    }

    // PHASE 6: Brackets snap back to center with leap (250ms)
    timeline.to(
      [leftBody, rightBody],
      {
        x: 0,
        y: -25,
        scale: 1,
        scaleX: 0.95,
        scaleY: 1.1,
        duration: 0.25,
        ease: 'power2.out',
        clearProps: 'zIndex',
      },
      0.3
    );

    // PHASE 7: Settle down (170ms)
    timeline.to(
      [leftBody, rightBody],
      {
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: 0.17,
        ease: 'power2.in',
      },
      0.55 // 0.3 + 0.25
    );

    // Eyes fade in and move down WITH body settle
    if (eyeElements.length > 0) {
      gsap.set(eyeElements, { y: -18 }); // Match leap height

      timeline.to(
        eyeElements,
        {
          opacity: 1,
          y: 0,
          duration: 0.17,
          ease: 'power2.in',
        },
        0.55
      );
    }

    // Shadow fades in
    timeline.to(
      shadow,
      {
        opacity: 0.7,
        scaleX: 1,
        scaleY: 1,
        duration: 0.22,
        ease: 'power1.out',
      },
      0.67
    );

    // Glows fade in during settle
    if (glowElements.length > 0) {
      timeline.to(
        glowElements,
        {
          opacity: 1,
          duration: 0.25,
          ease: 'power1.out',
        },
        0.6
      );
    }

    // PHASE 8: Force final states
    timeline.call(
      () => {
        if (eyeElements.length > 0) {
          eyeElements.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }));
        }
        gsap.set(shadow, { xPercent: -50, opacity: 0.7, scaleX: 1, scaleY: 1 });
        if (glowElements.length > 0) {
          glowElements.forEach((el) => gsap.set(el, { opacity: 1 }));
        }
        if (searchBorderGradient) gsap.set(searchBorderGradient, { opacity: 0 });
        if (searchPlaceholder) gsap.set(searchPlaceholder, { opacity: 0, filter: 'blur(0px)', y: 0 });
        if (searchKbd) gsap.set(searchKbd, { opacity: 0, filter: 'blur(0px)', y: 0 });
        if (searchGlow) gsap.set(searchGlow, { opacity: 0, scale: 1 });
        gsap.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0, scaleX: 1, scaleY: 1 });
      },
      [],
      0.72
    );
  }

  return timeline;
}
