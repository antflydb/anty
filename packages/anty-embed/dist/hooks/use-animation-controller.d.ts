/**
 * React Hook for Animation Controller
 *
 * Provides a clean React API for the AnimationController.
 * Manages lifecycle, initialization, and state synchronization.
 */
import { AnimationController } from '../lib/animation/controller';
import { AnimationState, type EmotionType, type ControllerConfig, type AnimationOptions } from '../lib/animation/types';
/**
 * Elements required by the animation controller
 */
export interface AnimationElements {
    /** Main container */
    container?: HTMLElement | null;
    /** Character wrapper */
    character?: HTMLElement | null;
    /** Shadow element */
    shadow?: HTMLElement | null;
    /** Left eye */
    eyeLeft?: HTMLElement | null;
    /** Right eye */
    eyeRight?: HTMLElement | null;
    /** Left eye SVG path */
    eyeLeftPath?: SVGPathElement | null;
    /** Right eye SVG path */
    eyeRightPath?: SVGPathElement | null;
    /** Left eye SVG container */
    eyeLeftSvg?: SVGSVGElement | null;
    /** Right eye SVG container */
    eyeRightSvg?: SVGSVGElement | null;
    /** Left antenna */
    antennaLeft?: HTMLElement | null;
    /** Right antenna */
    antennaRight?: HTMLElement | null;
    /** Glow effect (deprecated - use outerGlow) */
    glow?: HTMLElement | null;
    /** Search bar */
    searchBar?: HTMLElement | null;
    /** Inner glow element */
    innerGlow?: HTMLElement | null;
    /** Outer glow element */
    outerGlow?: HTMLElement | null;
    /** Left body */
    leftBody?: HTMLElement | null;
    /** Right body */
    rightBody?: HTMLElement | null;
    /** Custom elements */
    [key: string]: HTMLElement | SVGPathElement | SVGSVGElement | null | undefined;
}
/**
 * Options for the useAnimationController hook
 */
export interface UseAnimationControllerOptions extends ControllerConfig {
    /** Callback when state changes */
    onStateChange?: (from: AnimationState, to: AnimationState) => void;
    /** Callback when animation sequence changes (for debug tracking) */
    onAnimationSequenceChange?: (sequence: string) => void;
    /** Whether character is powered off */
    isOff?: boolean;
    /** Whether in search mode */
    searchMode?: boolean;
    /** Auto-start idle on mount */
    autoStartIdle?: boolean;
    /** Scale factor for the character (size / 160) */
    sizeScale?: number;
}
/**
 * Return type of the hook
 */
export interface UseAnimationControllerReturn {
    /** Play an emotion animation */
    playEmotion: (emotion: EmotionType, options?: AnimationOptions) => boolean;
    /** Transition to a new state */
    transitionTo: (state: AnimationState, options?: AnimationOptions) => boolean;
    /** Start idle animation */
    startIdle: () => void;
    /** Pause all animations */
    pause: () => void;
    /** Resume animations */
    resume: () => void;
    /** Kill all animations */
    killAll: () => void;
    /** Get current state */
    getState: () => AnimationState;
    /** Get current emotion */
    getEmotion: () => EmotionType | null;
    /** Check if idle is active (started but may be paused) */
    isIdle: () => boolean;
    /** Check if idle is actively playing (not paused) */
    isIdlePlaying: () => boolean;
    /** Get debug information */
    getDebugInfo: () => ReturnType<AnimationController['getDebugInfo']>;
    /** Set super mode scale (null to exit super mode) */
    setSuperMode: (scale: number | null) => void;
    /** Check if controller is ready */
    isReady: boolean;
    /** Show glows (for search exit) */
    showGlows: (fadeIn?: boolean) => void;
    /** Hide glows (for search enter) */
    hideGlows: () => void;
    /** Hide shadow (for search enter - pauses tracker and hides) */
    hideShadow: () => void;
    /** Show shadow (for search exit - resumes tracker) */
    showShadow: () => void;
}
/**
 * React hook that wraps AnimationController
 *
 * @param elements - DOM elements to animate
 * @param options - Controller configuration and callbacks
 * @returns Animation control methods
 *
 * @example
 * ```tsx
 * const {
 *   playEmotion,
 *   startIdle,
 *   getState,
 *   isReady
 * } = useAnimationController(
 *   {
 *     container: containerRef.current,
 *     character: characterRef.current,
 *     eyeLeft: leftEyeRef.current,
 *     eyeRight: rightEyeRef.current,
 *   },
 *   {
 *     enableLogging: true,
 *     isOff: false,
 *     searchMode: false,
 *   }
 * );
 *
 * // Play an emotion
 * playEmotion('happy', { priority: 3 });
 *
 * // Start idle
 * startIdle();
 * ```
 */
export declare function useAnimationController(elements: AnimationElements, options?: UseAnimationControllerOptions): UseAnimationControllerReturn;
