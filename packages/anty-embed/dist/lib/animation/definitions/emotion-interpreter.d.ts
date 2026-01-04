/**
 * Emotion Animation Interpreter
 *
 * Generic interpreter that builds GSAP timelines from declarative EmotionConfig.
 * This is the ONLY place where emotion animations are created from configs.
 *
 * ~100 lines replacing the 960-line createEmotionAnimation function.
 */
import type { EmotionConfig } from '../types';
/**
 * Kill any pending eye reset from a previous emotion
 * Call this before starting a new emotion animation
 */
export declare function killPendingEyeReset(): void;
/**
 * Elements required for emotion animations
 */
export interface EmotionElements {
    character: HTMLElement;
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
 * Interpret an EmotionConfig and build a GSAP timeline
 *
 * @param config - Declarative emotion configuration
 * @param elements - DOM elements to animate
 * @returns GSAP timeline ready to play
 */
export declare function interpretEmotionConfig(config: EmotionConfig, elements: EmotionElements): gsap.core.Timeline;
