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
import { type EyeShapeName } from './eye-shapes';
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
export declare function createEyeAnimation(elements: EyeAnimationElements, shapeSpec: EyeShapeName | EyeShapeSpec, config?: EyeAnimationConfig): gsap.core.Timeline;
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
export declare function createBlinkAnimation(elements: EyeAnimationElements, config?: BlinkAnimationConfig): gsap.core.Timeline;
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
export declare function createDoubleBlinkAnimation(elements: EyeAnimationElements, config?: BlinkAnimationConfig): gsap.core.Timeline;
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
export declare function createLookAnimation(elements: EyeAnimationElements, config: LookAnimationConfig): gsap.core.Timeline;
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
export declare function createReturnFromLookAnimation(elements: EyeAnimationElements, config?: EyeAnimationConfig): gsap.core.Timeline;
