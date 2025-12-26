/**
 * Character Initialization
 *
 * Single function that sets ALL animatable properties once on mount.
 * This is the SINGLE SOURCE OF TRUTH for initial animation state.
 *
 * Call this once when elements are registered to ensure clean starting state.
 */

import gsap from 'gsap';
import { EYE_SHAPES, EYE_DIMENSIONS } from './definitions/eye-shapes';

/**
 * Elements that can be animated on the character
 */
export interface CharacterElements {
  character: HTMLElement;
  shadow?: HTMLElement | null;
  eyeLeft?: HTMLElement | null;
  eyeRight?: HTMLElement | null;
  eyeLeftPath?: SVGPathElement | null;
  eyeRightPath?: SVGPathElement | null;
  eyeLeftSvg?: SVGSVGElement | null;
  eyeRightSvg?: SVGSVGElement | null;
  innerGlow?: HTMLElement | null;
  outerGlow?: HTMLElement | null;
  leftBody?: HTMLElement | null;
  rightBody?: HTMLElement | null;
}

/**
 * Initial state options
 */
export interface InitializeOptions {
  /** Whether character starts in OFF state */
  isOff?: boolean;
}

/**
 * Initialize all animatable properties on the character
 *
 * Sets ALL properties that GSAP will animate to their base values.
 * This ensures:
 * 1. No conflicts with inline CSS styles
 * 2. Consistent starting state for all animations
 * 3. Single source of truth for initial values
 *
 * @param elements - All character elements to initialize
 * @param options - Initial state configuration
 */
export function initializeCharacter(
  elements: CharacterElements,
  options: InitializeOptions = {}
): void {
  const { isOff = false } = options;
  const {
    character,
    shadow,
    eyeLeft,
    eyeRight,
    eyeLeftPath,
    eyeRightPath,
    eyeLeftSvg,
    eyeRightSvg,
    innerGlow,
    outerGlow,
    leftBody,
    rightBody,
  } = elements;

  // ===========================
  // Character transforms
  // ===========================
  gsap.set(character, {
    x: 0,
    y: 0,
    scale: isOff ? 0.65 : 1,
    rotation: 0,
    rotationY: 0,
    opacity: isOff ? 0.45 : 1,
    transformOrigin: 'center center',
  });

  // ===========================
  // Eye containers - IDLE shape
  // ===========================
  // Note: Container dimensions stay fixed at 20x45 via CSS
  // GSAP only animates transforms and SVG attributes
  if (eyeLeft && eyeRight) {
    gsap.set([eyeLeft, eyeRight], {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      transformOrigin: 'center center',
    });
  }

  // ===========================
  // Eye SVG paths - IDLE shape
  // ===========================
  if (eyeLeftPath && eyeRightPath) {
    gsap.set([eyeLeftPath, eyeRightPath], {
      attr: { d: EYE_SHAPES.IDLE },
    });
  }

  // ===========================
  // Eye SVG viewBox - IDLE dimensions
  // ===========================
  if (eyeLeftSvg && eyeRightSvg) {
    gsap.set([eyeLeftSvg, eyeRightSvg], {
      attr: { viewBox: EYE_DIMENSIONS.IDLE.viewBox },
    });
  }

  // ===========================
  // Shadow - ground-fixed, only scale/opacity animate
  // ===========================
  if (shadow) {
    gsap.set(shadow, {
      xPercent: -50,
      scaleX: isOff ? 0.7 : 1,
      scaleY: isOff ? 0.55 : 1,
      opacity: isOff ? 0.2 : 0.7,
    });
  }

  // ===========================
  // Glows - follow character at 75% distance
  // ===========================
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];
  if (glowElements.length > 0) {
    gsap.set(glowElements, {
      x: 0,
      y: 0,
      scale: isOff ? 0.65 : 1,
      opacity: isOff ? 0 : 1,
    });
  }

  // ===========================
  // Body brackets - for shocked animation
  // ===========================
  if (leftBody && rightBody) {
    gsap.set([leftBody, rightBody], {
      x: 0,
      y: 0,
    });
  }
}

/**
 * Reset eyes to IDLE state
 *
 * Used after emotion animations to return eyes to neutral.
 * This is a common pattern extracted to avoid duplication.
 *
 * @param elements - Eye elements to reset
 * @param duration - Animation duration (0 for instant)
 */
export function resetEyesToIdle(
  elements: Pick<CharacterElements, 'eyeLeft' | 'eyeRight' | 'eyeLeftPath' | 'eyeRightPath' | 'eyeLeftSvg' | 'eyeRightSvg'>,
  duration = 0
): gsap.core.Timeline | void {
  const { eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;

  if (!eyeLeft || !eyeRight || !eyeLeftPath || !eyeRightPath || !eyeLeftSvg || !eyeRightSvg) {
    return;
  }

  if (duration === 0) {
    // Instant reset
    gsap.set([eyeLeftPath, eyeRightPath], {
      attr: { d: EYE_SHAPES.IDLE },
    });
    gsap.set([eyeLeftSvg, eyeRightSvg], {
      attr: { viewBox: EYE_DIMENSIONS.IDLE.viewBox },
    });
    gsap.set([eyeLeft, eyeRight], {
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      x: 0,
      y: 0,
    });
    return;
  }

  // Animated reset
  const timeline = gsap.timeline();

  timeline.to([eyeLeftPath, eyeRightPath], {
    attr: { d: EYE_SHAPES.IDLE },
    duration,
    ease: 'power2.inOut',
  }, 0);

  timeline.to([eyeLeftSvg, eyeRightSvg], {
    attr: { viewBox: EYE_DIMENSIONS.IDLE.viewBox },
    duration,
    ease: 'power2.inOut',
  }, 0);

  timeline.to([eyeLeft, eyeRight], {
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    x: 0,
    y: 0,
    duration,
    ease: 'power2.inOut',
  }, 0);

  return timeline;
}
