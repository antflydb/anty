/**
 * Character Initialization
 *
 * Single function that sets ALL animatable properties once on mount.
 * This is the SINGLE SOURCE OF TRUTH for initial animation state.
 *
 * Call this once when elements are registered to ensure clean starting state.
 */

import gsap from 'gsap';
import { getEyeShape, getEyeDimensions, type EyeShapeName } from './definitions/eye-shapes';

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
  // Eye containers - position and transforms
  // ===========================
  // OFF state: eyes move closer together (logo position)
  const eyeOffsetX = isOff ? 3 : 0; // px toward center
  const eyeOffsetY = isOff ? 3 : 0; // px down

  if (eyeLeft) {
    gsap.set(eyeLeft, {
      x: eyeOffsetX,  // Move right toward center when OFF
      y: eyeOffsetY,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      transformOrigin: 'center center',
    });
  }
  if (eyeRight) {
    gsap.set(eyeRight, {
      x: -eyeOffsetX, // Move left toward center when OFF
      y: eyeOffsetY,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      transformOrigin: 'center center',
    });
  }

  // ===========================
  // Eye SVG paths - IDLE or OFF shape based on state
  // ===========================
  if (eyeLeftPath) {
    const leftShape: EyeShapeName = isOff ? 'OFF_LEFT' : 'IDLE';
    gsap.set(eyeLeftPath, {
      attr: { d: getEyeShape(leftShape, 'left') },
    });
  }
  if (eyeRightPath) {
    const rightShape: EyeShapeName = isOff ? 'OFF_RIGHT' : 'IDLE';
    gsap.set(eyeRightPath, {
      attr: { d: getEyeShape(rightShape, 'right') },
    });
  }

  // ===========================
  // Eye SVG viewBox - IDLE or OFF dimensions
  // ===========================
  if (eyeLeftSvg && eyeRightSvg) {
    const dimensions = isOff ? getEyeDimensions('OFF_LEFT') : getEyeDimensions('IDLE');
    gsap.set([eyeLeftSvg, eyeRightSvg], {
      attr: { viewBox: dimensions.viewBox },
    });
  }

  // ===========================
  // Eye container dimensions - match the shape
  // ===========================
  if (eyeLeft && eyeRight) {
    const dimensions = isOff ? getEyeDimensions('OFF_LEFT') : getEyeDimensions('IDLE');
    gsap.set([eyeLeft, eyeRight], {
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  // ===========================
  // Shadow - initial state before ShadowTracker takes over
  // When ON: grounded state (full size, visible)
  // When OFF: shrunk state (wake-up will fade it in)
  // After init, ShadowTracker dynamically updates based on character Y
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

  const idleDimensions = getEyeDimensions('IDLE');

  if (duration === 0) {
    // Instant reset - use mirrored path for right eye
    gsap.set(eyeLeftPath, {
      attr: { d: getEyeShape('IDLE', 'left') },
    });
    gsap.set(eyeRightPath, {
      attr: { d: getEyeShape('IDLE', 'right') },
    });
    gsap.set([eyeLeftSvg, eyeRightSvg], {
      attr: { viewBox: idleDimensions.viewBox },
    });
    // Reset container dimensions to IDLE size
    gsap.set([eyeLeft, eyeRight], {
      width: idleDimensions.width,
      height: idleDimensions.height,
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

  // Animated reset - use mirrored path for right eye
  const timeline = gsap.timeline();

  timeline.to(eyeLeftPath, {
    attr: { d: getEyeShape('IDLE', 'left') },
    duration,
    ease: 'power2.inOut',
  }, 0);

  timeline.to(eyeRightPath, {
    attr: { d: getEyeShape('IDLE', 'right') },
    duration,
    ease: 'power2.inOut',
  }, 0);

  timeline.to([eyeLeftSvg, eyeRightSvg], {
    attr: { viewBox: idleDimensions.viewBox },
    duration,
    ease: 'power2.inOut',
  }, 0);

  timeline.to([eyeLeft, eyeRight], {
    width: idleDimensions.width,
    height: idleDimensions.height,
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
