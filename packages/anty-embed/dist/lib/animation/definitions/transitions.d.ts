/**
 * Transition Animation Definitions
 * Pure functions that create GSAP timelines for state transitions (wake-up, power-off)
 */
export interface TransitionAnimationElements {
    character: HTMLElement;
    shadow: HTMLElement;
    innerGlow?: HTMLElement;
    outerGlow?: HTMLElement;
    eyeLeft?: HTMLElement;
    eyeRight?: HTMLElement;
    eyeLeftPath?: SVGPathElement;
    eyeRightPath?: SVGPathElement;
    eyeLeftSvg?: SVGSVGElement;
    eyeRightSvg?: SVGSVGElement;
}
/**
 * Creates wake-up animation (OFF → ON transition)
 *
 * "Blink Awake" animation (~0.5s):
 * 1. Body smoothly rises (scale 0.65→1, y 50→0, opacity 0.45→1)
 * 2. Eyes snap from OFF arrows to CLOSED partway through
 * 3. Eyes morph from CLOSED → IDLE (opening like waking up)
 *
 * @param elements - Character, shadow, and optional glow elements
 * @returns GSAP timeline for wake-up animation
 */
export declare function createWakeUpAnimation(elements: TransitionAnimationElements): gsap.core.Timeline;
/**
 * Creates power-off animation (ON → OFF transition)
 *
 * Dramatic three-phase choreography:
 * 1. Climb up (0.5s) - controlled rise to y: -60
 * 2. SNAP down HARD (0.1s) - explosive drop to y: 50, scale: 0.65 with expo.in easing
 * 3. Fade out (0.05-0.06s) - character to 0.45 opacity, glows/shadow to 0
 *
 * Shadow shrinks to 0.65 (NOT zero) and stays on ground
 * Glows follow character movement and fade out
 *
 * Total duration: ~0.66s
 *
 * @param elements - Character, shadow, and optional glow elements
 * @returns GSAP timeline for power-off animation
 */
export declare function createPowerOffAnimation(elements: TransitionAnimationElements): gsap.core.Timeline;
