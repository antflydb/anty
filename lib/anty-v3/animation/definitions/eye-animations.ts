/**
 * Eye Animation Definitions
 * Pure functions that create GSAP timelines for eye animations
 *
 * This file provides declarative eye animation functions for:
 * - Eye shape morphing (idle ↔ happy, angry, sad, wink, looking, off)
 * - Blink animations (single and double)
 * - Look animations (left/right with morphing)
 *
 * All functions return GSAP timelines that can be merged into emotion timelines
 * or played independently.
 */

import gsap from 'gsap';
import { EYE_SHAPES, EYE_DIMENSIONS, type EyeShapeName } from './eye-shapes';

// ===========================
// Types & Interfaces
// ===========================

/**
 * DOM elements required for eye animations
 */
export interface EyeAnimationElements {
  /** Left eye container element */
  leftEye?: HTMLElement;
  /** Right eye container element */
  rightEye?: HTMLElement;
  /** Left eye SVG path element (for morphing) */
  leftEyePath?: SVGPathElement;
  /** Right eye SVG path element (for morphing) */
  rightEyePath?: SVGPathElement;
  /** Left eye SVG element (for viewBox/dimensions) */
  leftEyeSvg?: SVGSVGElement;
  /** Right eye SVG element (for viewBox/dimensions) */
  rightEyeSvg?: SVGSVGElement;
}

/**
 * Configuration for eye animations
 */
export interface EyeAnimationConfig {
  /** Animation duration in seconds */
  duration?: number;
  /** GSAP easing function */
  ease?: string | gsap.EaseFunction;
  /** Delay before animation starts */
  delay?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * Configuration for blink animations
 */
export interface BlinkAnimationConfig extends EyeAnimationConfig {
  /** Scale factor when eyes are closed (0.05 = nearly flat) */
  closedScale?: number;
  /** Duration for closing phase */
  closeDuration?: number;
  /** Duration for opening phase */
  openDuration?: number;
}

/**
 * Configuration for look animations
 */
export interface LookAnimationConfig extends EyeAnimationConfig {
  /** Direction to look */
  direction: 'left' | 'right';
  /** X offset in pixels */
  xOffset?: number;
  /** Bunching effect (eyes move closer together) */
  bunch?: number;
}

/**
 * Eye shape specification for asymmetric animations
 * Allows left and right eyes to have different shapes (for wink, confused, etc.)
 */
export interface EyeShapeSpec {
  /** Shape for left eye */
  left: EyeShapeName;
  /** Shape for right eye (defaults to same as left if not specified) */
  right?: EyeShapeName;
}

// ===========================
// Constants
// ===========================

/**
 * Default animation timings
 */
const DEFAULTS = {
  /** Default morph duration */
  MORPH_DURATION: 0.2,
  /** Default morph ease */
  MORPH_EASE: 'power2.inOut',

  /** Blink closed scale (nearly flat) */
  BLINK_CLOSED_SCALE: 0.05,
  /** Single blink close duration */
  BLINK_CLOSE_DURATION: 0.1,
  /** Single blink open duration */
  BLINK_OPEN_DURATION: 0.15,

  /** Double blink close duration (slightly faster) */
  DOUBLE_BLINK_CLOSE_DURATION: 0.08,
  /** Double blink open duration */
  DOUBLE_BLINK_OPEN_DURATION: 0.12,
  /** Pause between blinks in double blink */
  DOUBLE_BLINK_PAUSE: 0.1,

  /** Look animation duration */
  LOOK_DURATION: 0.25,
  /** Look animation X offset */
  LOOK_X_OFFSET: 12,
  /** Look animation bunch (eyes move closer) */
  LOOK_BUNCH: 4,
} as const;

// ===========================
// Core Animation Functions
// ===========================

/**
 * Creates eye animation timeline that morphs eyes to specified shapes
 *
 * Supports asymmetric animations where left and right eyes can have different shapes.
 * Morphs both the SVG path data AND the container dimensions for proper scaling.
 *
 * @param elements - DOM elements for eyes
 * @param shapeSpec - Target eye shape(s). Can be a string for symmetric or object for asymmetric
 * @param config - Animation configuration
 * @returns GSAP timeline for eye morph animation
 *
 * @example
 * // Symmetric animation (both eyes same)
 * createEyeAnimation(elements, 'HAPPY_LEFT', { duration: 0.3 });
 *
 * @example
 * // Asymmetric animation (wink)
 * createEyeAnimation(elements, { left: 'WINK_LEFT', right: 'IDLE' }, { duration: 0.2 });
 */
export function createEyeAnimation(
  elements: EyeAnimationElements,
  shapeSpec: EyeShapeName | EyeShapeSpec,
  config: EyeAnimationConfig = {}
): gsap.core.Timeline {
  const {
    duration = DEFAULTS.MORPH_DURATION,
    ease = DEFAULTS.MORPH_EASE,
    delay = 0,
    onComplete,
  } = config;

  const timeline = gsap.timeline({
    delay,
    onComplete,
  });

  // Normalize shape spec to object form
  const shapes: EyeShapeSpec = typeof shapeSpec === 'string'
    ? { left: shapeSpec, right: shapeSpec }
    : { left: shapeSpec.left, right: shapeSpec.right ?? shapeSpec.left };

  // Animate left eye
  if (elements.leftEyePath && elements.leftEyeSvg) {
    const leftShape = shapes.left;
    const leftPath = EYE_SHAPES[leftShape];
    const leftDimensions = EYE_DIMENSIONS[leftShape];

    // Morph SVG path
    timeline.to(
      elements.leftEyePath,
      {
        attr: { d: leftPath },
        duration,
        ease,
      },
      0
    );

    // Morph ONLY viewBox, NOT width/height
    // Container stays fixed at 18.63×44.52px, preserveAspectRatio="none" handles scaling
    timeline.to(
      elements.leftEyeSvg,
      {
        attr: {
          viewBox: leftDimensions.viewBox,
        },
        duration,
        ease,
      },
      0
    );

    // REMOVED: container dimension morphing - containers stay fixed at CSS defaults
  }

  // Animate right eye
  if (elements.rightEyePath && elements.rightEyeSvg) {
    const rightShape = shapes.right ?? shapes.left;
    const rightPath = EYE_SHAPES[rightShape];
    const rightDimensions = EYE_DIMENSIONS[rightShape];

    // Morph SVG path
    timeline.to(
      elements.rightEyePath,
      {
        attr: { d: rightPath },
        duration,
        ease,
      },
      0
    );

    // Morph ONLY viewBox, NOT width/height
    // Container stays fixed at 18.63×44.52px, preserveAspectRatio="none" handles scaling
    timeline.to(
      elements.rightEyeSvg,
      {
        attr: {
          viewBox: rightDimensions.viewBox,
        },
        duration,
        ease,
      },
      0
    );

    // REMOVED: container dimension morphing - containers stay fixed at CSS defaults
  }

  return timeline;
}

/**
 * Creates a single blink animation timeline
 *
 * Blinks both eyes simultaneously by scaling vertically to nearly flat (0.05)
 * then expanding back to normal. This is a stackable animation that can be
 * played on top of other eye states.
 *
 * **Transform Origin Fix:** Ensures eyes scale from center (50% 50%) to prevent
 * shape distortion during blink.
 *
 * @param elements - DOM elements for eyes
 * @param config - Blink animation configuration
 * @returns GSAP timeline for blink animation
 *
 * @example
 * const blinkTl = createBlinkAnimation(elements);
 * blinkTl.play();
 */
export function createBlinkAnimation(
  elements: EyeAnimationElements,
  config: BlinkAnimationConfig = {}
): gsap.core.Timeline {
  const {
    closedScale = DEFAULTS.BLINK_CLOSED_SCALE,
    closeDuration = DEFAULTS.BLINK_CLOSE_DURATION,
    openDuration = DEFAULTS.BLINK_OPEN_DURATION,
    delay = 0,
    onComplete,
  } = config;

  const timeline = gsap.timeline({
    delay,
    onComplete,
  });

  const eyeElements = [elements.leftEye, elements.rightEye].filter(Boolean) as HTMLElement[];

  if (eyeElements.length === 0) {
    return timeline;
  }

  // Close eyes (collapse to horizontal line)
  timeline.to(eyeElements, {
    scaleY: closedScale,
    transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
    duration: closeDuration,
    ease: 'power2.in',
  });

  // Open eyes (expand back to normal)
  timeline.to(eyeElements, {
    scaleY: 1,
    transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
    duration: openDuration,
    ease: 'power2.out',
  });

  return timeline;
}

/**
 * Creates a double blink animation timeline
 *
 * Two quick blinks in succession with a brief pause between them.
 * Uses slightly faster timing than single blink for snappier feel.
 *
 * @param elements - DOM elements for eyes
 * @param config - Blink animation configuration
 * @returns GSAP timeline for double blink animation
 *
 * @example
 * const doubleBlinkTl = createDoubleBlinkAnimation(elements);
 * doubleBlinkTl.play();
 */
export function createDoubleBlinkAnimation(
  elements: EyeAnimationElements,
  config: BlinkAnimationConfig = {}
): gsap.core.Timeline {
  const {
    closedScale = DEFAULTS.BLINK_CLOSED_SCALE,
    closeDuration = DEFAULTS.DOUBLE_BLINK_CLOSE_DURATION,
    openDuration = DEFAULTS.DOUBLE_BLINK_OPEN_DURATION,
    delay = 0,
    onComplete,
  } = config;

  const timeline = gsap.timeline({
    delay,
    onComplete,
  });

  const eyeElements = [elements.leftEye, elements.rightEye].filter(Boolean) as HTMLElement[];

  if (eyeElements.length === 0) {
    return timeline;
  }

  // First blink - close
  timeline.to(eyeElements, {
    scaleY: closedScale,
    transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
    duration: closeDuration,
    ease: 'power2.in',
  });

  // First blink - open
  timeline.to(eyeElements, {
    scaleY: 1,
    transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
    duration: openDuration,
    ease: 'power2.out',
  });

  // Pause between blinks
  timeline.to(eyeElements, {
    scaleY: 1,
    transformOrigin: '50% 50%',
    duration: DEFAULTS.DOUBLE_BLINK_PAUSE,
  });

  // Second blink - close
  timeline.to(eyeElements, {
    scaleY: closedScale,
    transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
    duration: closeDuration,
    ease: 'power2.in',
  });

  // Second blink - open
  timeline.to(eyeElements, {
    scaleY: 1,
    transformOrigin: '50% 50%', // FIX: Scale from center to preserve shape
    duration: openDuration,
    ease: 'power2.out',
  });

  return timeline;
}

/**
 * Creates a look left/right animation timeline
 *
 * Morphs eyes from IDLE to LOOKING shape (shorter, wider) and moves them
 * left or right with a bunching effect (eyes move closer together).
 *
 * This animation combines:
 * 1. Eye shape morphing (IDLE → LOOKING)
 * 2. Horizontal translation (left or right)
 * 3. Bunching effect (eyes move closer to center)
 *
 * @param elements - DOM elements for eyes
 * @param config - Look animation configuration
 * @returns GSAP timeline for look animation
 *
 * @example
 * // Look left
 * const lookLeftTl = createLookAnimation(elements, { direction: 'left' });
 *
 * @example
 * // Look right with custom offset
 * const lookRightTl = createLookAnimation(elements, {
 *   direction: 'right',
 *   xOffset: 15,
 *   bunch: 5
 * });
 */
export function createLookAnimation(
  elements: EyeAnimationElements,
  config: LookAnimationConfig
): gsap.core.Timeline {
  const {
    direction,
    duration = DEFAULTS.LOOK_DURATION,
    ease = DEFAULTS.MORPH_EASE,
    xOffset = DEFAULTS.LOOK_X_OFFSET,
    bunch = DEFAULTS.LOOK_BUNCH,
    delay = 0,
    onComplete,
  } = config;

  const timeline = gsap.timeline({
    delay,
    onComplete,
  });

  // Calculate direction multiplier
  const directionMultiplier = direction === 'left' ? -1 : 1;

  // Morph eyes to LOOK shape
  const morphTimeline = createEyeAnimation(
    elements,
    'LOOK',
    { duration, ease }
  );
  timeline.add(morphTimeline, 0);

  // Move eyes horizontally with bunching
  if (elements.leftEye) {
    timeline.to(
      elements.leftEye,
      {
        x: directionMultiplier * xOffset + bunch, // Move in direction + bunch towards center
        duration,
        ease,
      },
      0
    );
  }

  if (elements.rightEye) {
    timeline.to(
      elements.rightEye,
      {
        x: directionMultiplier * xOffset - bunch, // Move in direction - bunch towards center
        duration,
        ease,
      },
      0
    );
  }

  return timeline;
}

/**
 * Creates a return from look animation (back to idle)
 *
 * Morphs eyes back to IDLE shape and resets horizontal position.
 *
 * @param elements - DOM elements for eyes
 * @param config - Animation configuration
 * @returns GSAP timeline for return animation
 *
 * @example
 * const returnTl = createReturnFromLookAnimation(elements);
 */
export function createReturnFromLookAnimation(
  elements: EyeAnimationElements,
  config: EyeAnimationConfig = {}
): gsap.core.Timeline {
  const {
    duration = DEFAULTS.LOOK_DURATION,
    ease = DEFAULTS.MORPH_EASE,
    delay = 0,
    onComplete,
  } = config;

  const timeline = gsap.timeline({
    delay,
    onComplete,
  });

  // Morph eyes back to IDLE shape
  const morphTimeline = createEyeAnimation(
    elements,
    'IDLE',
    { duration, ease }
  );
  timeline.add(morphTimeline, 0);

  // Reset horizontal position
  const eyeElements = [elements.leftEye, elements.rightEye].filter(Boolean) as HTMLElement[];

  if (eyeElements.length > 0) {
    timeline.to(
      eyeElements,
      {
        x: 0,
        duration,
        ease,
      },
      0
    );
  }

  return timeline;
}
