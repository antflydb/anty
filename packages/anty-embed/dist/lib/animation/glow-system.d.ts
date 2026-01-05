/**
 * Glow System - Physics-based glow tracking with snake-like oscillation
 *
 * Two glow layers (inner/outer) that:
 * 1. Track character position via spring physics (delayed, natural response)
 * 2. Oscillate on X-axis with phase offsets (snake-like wave effect)
 * 3. Chain together: Anty → Outer glow → Inner glow
 *
 * The chained springs + phase-offset oscillation creates an ethereal,
 * snake-like trailing effect behind the character.
 */
export interface GlowSystemConfig {
    /** Spring stiffness for outer glow following character (0-1, higher = snappier) */
    outerStiffness: number;
    /** Spring stiffness for inner glow following outer glow (0-1, higher = snappier) */
    innerStiffness: number;
    /** Damping factor to prevent infinite oscillation (0-1, higher = more damping) */
    damping: number;
    /** X-axis oscillation amplitude for outer glow (pixels) */
    outerOscillationAmplitudeX: number;
    /** X-axis oscillation amplitude for inner glow (pixels) */
    innerOscillationAmplitudeX: number;
    /** Y-axis oscillation amplitude for outer glow (pixels) - bobs down from base */
    outerOscillationAmplitudeY: number;
    /** Y-axis oscillation amplitude for inner glow (pixels) - bobs down from base */
    innerOscillationAmplitudeY: number;
    /** Oscillation frequency (radians per second) */
    oscillationFrequency: number;
    /** Phase offset for inner glow oscillation (radians) */
    innerPhaseOffset: number;
    /** Base opacity when visible */
    visibleOpacity: number;
    /** Opacity when hidden */
    hiddenOpacity: number;
}
export interface GlowSystemControls {
    /** Start the tracking system (adds to GSAP ticker) */
    start: () => void;
    /** Stop the tracking system completely (removes from ticker) */
    stop: () => void;
    /** Pause tracking (keeps ticker but doesn't update) */
    pause: () => void;
    /** Resume tracking after pause */
    resume: () => void;
    /** Check if system is currently active */
    isActive: () => boolean;
    /** Fade glows in over duration (seconds) */
    fadeIn: (duration?: number) => gsap.core.Tween;
    /** Fade glows out over duration (seconds) */
    fadeOut: (duration?: number) => gsap.core.Tween;
    /** Instantly show glows */
    show: () => void;
    /** Instantly hide glows */
    hide: () => void;
    /** Reset positions to character position (no spring lag) */
    snapToCharacter: () => void;
}
/**
 * Creates a glow tracking system with spring physics and oscillation
 *
 * @param character - The character element to track position from
 * @param outerGlow - The outer (larger, softer) glow element
 * @param innerGlow - The inner (smaller, tighter) glow element
 * @param config - Optional configuration overrides
 * @returns Controls for the glow system
 */
export declare function createGlowSystem(character: HTMLElement, outerGlow: HTMLElement, innerGlow: HTMLElement, config?: Partial<GlowSystemConfig>): GlowSystemControls;
