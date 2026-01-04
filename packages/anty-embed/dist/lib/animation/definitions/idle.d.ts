/**
 * Idle Animation Definitions
 * Pure functions that create GSAP timelines for idle/breathing animations
 *
 * Includes built-in periodic blinking scheduler for natural secondary motion
 */
export interface IdleAnimationElements {
    character: HTMLElement;
    shadow: HTMLElement;
    eyeLeft?: HTMLElement;
    eyeRight?: HTMLElement;
    eyeLeftPath?: SVGPathElement;
    eyeRightPath?: SVGPathElement;
    eyeLeftSvg?: SVGSVGElement;
    eyeRightSvg?: SVGSVGElement;
}
export interface IdleAnimationOptions {
    /** Delay before starting animation (seconds) */
    delay?: number;
    /** Base scale for character (default: 1, use 1.45 for super mode) */
    baseScale?: number;
}
/**
 * Return type for createIdleAnimation
 * Includes timeline and blink scheduler controls
 */
export interface IdleAnimationResult {
    /** The GSAP timeline for idle float/breathe animation */
    timeline: gsap.core.Timeline;
    /** Pause the blink scheduler (call when emotion starts) */
    pauseBlinks: () => void;
    /** Resume the blink scheduler (call when emotion ends) */
    resumeBlinks: () => void;
    /** Kill the blink scheduler entirely (call on cleanup) */
    killBlinks: () => void;
}
/**
 * Creates the idle breathing animation timeline
 *
 * Coordinates three synchronized animations:
 * 1. Vertical floating (up/down motion)
 * 2. Gentle rotation (synchronized with float)
 * 3. Breathing scale (subtle size changes)
 * 4. Periodic blinking (5-12 second intervals, 20% chance of double blink)
 *
 * Shadow inversely follows character movement (shrinks when character floats up)
 *
 * @param elements - Character and shadow DOM elements (plus optional eye elements for blinking)
 * @param options - Optional delay configuration
 * @returns Object with timeline and blink scheduler controls
 */
export declare function createIdleAnimation(elements: IdleAnimationElements, options?: IdleAnimationOptions): IdleAnimationResult;
