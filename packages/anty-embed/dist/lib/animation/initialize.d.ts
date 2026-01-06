/**
 * Character Initialization
 *
 * Single function that sets ALL animatable properties once on mount.
 * This is the SINGLE SOURCE OF TRUTH for initial animation state.
 *
 * Call this once when elements are registered to ensure clean starting state.
 */
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
    /** Scale factor for the character (size / 160) */
    sizeScale?: number;
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
export declare function initializeCharacter(elements: CharacterElements, options?: InitializeOptions): void;
/**
 * Reset eyes to IDLE state
 *
 * Used after emotion animations to return eyes to neutral.
 * This is a common pattern extracted to avoid duplication.
 *
 * @param elements - Eye elements to reset
 * @param duration - Animation duration (0 for instant)
 */
export declare function resetEyesToIdle(elements: Pick<CharacterElements, 'eyeLeft' | 'eyeRight' | 'eyeLeftPath' | 'eyeRightPath' | 'eyeLeftSvg' | 'eyeRightSvg'>, duration?: number, sizeScale?: number): gsap.core.Timeline | void;
