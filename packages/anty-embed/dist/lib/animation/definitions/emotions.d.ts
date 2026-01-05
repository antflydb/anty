/**
 * Declarative Emotion Configurations
 *
 * All emotions defined as DATA, not code.
 * Each emotion is a configuration object that the interpreter uses
 * to build GSAP timelines.
 *
 * This makes emotions:
 * 1. Easy to understand at a glance
 * 2. Easy to modify without touching animation logic
 * 3. Easy to test in isolation
 * 4. Easy to add new emotions
 */
import type { EmotionConfig } from '../types';
import type { EmotionType } from '../types';
/**
 * Glow coordination constants
 * Glows follow character at 75% distance with 0.05s lag
 */
export declare const GLOW_CONSTANTS: {
    readonly DISTANCE_RATIO: 0.75;
    readonly LAG_SECONDS: 0.05;
};
/**
 * All emotion configurations
 */
export declare const EMOTION_CONFIGS: Partial<Record<EmotionType, EmotionConfig>>;
/**
 * Get emotion config by type
 */
export declare function getEmotionConfig(emotion: EmotionType): EmotionConfig | undefined;
