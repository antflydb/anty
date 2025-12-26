/**
 * Emotion Configuration Types
 *
 * Declarative type definitions for emotion animations.
 * Emotions are defined as DATA, not code - making them easy to
 * understand, modify, and test.
 */

import type { EyeShapeName } from './eye-shapes';

/**
 * Eye configuration for an emotion
 */
export interface EyeConfig {
  /** Target eye shape (from EYE_SHAPES) */
  shape: EyeShapeName | { left: EyeShapeName; right: EyeShapeName };
  /** Duration of eye morph animation */
  duration: number;
  /** Y offset for eyes (negative = up) */
  yOffset?: number;
  /** X offset for eyes (negative = left) */
  xOffset?: number;
  /** Scale multiplier for eyes */
  scale?: number;
  /** Rotation for left eye */
  leftRotation?: number;
  /** Rotation for right eye */
  rightRotation?: number;
  /** Whether to flip right eye horizontally */
  flipRightX?: boolean;
}

/**
 * Single animation phase for character movement
 */
export interface CharacterPhase {
  /** Properties to animate */
  props: {
    x?: number;
    y?: number;
    scale?: number;
    rotation?: number;
    rotationY?: number;
  };
  /** Duration in seconds */
  duration: number;
  /** GSAP easing function */
  ease: string;
  /** Position in timeline (optional, for parallel animations) */
  position?: string | number;
}

/**
 * Glow configuration - glows follow character at 75% distance with 0.05s lag
 */
export interface GlowConfig {
  /** Whether glows should follow character movement */
  follow: boolean;
  /** Custom distance ratio (default: 0.75) */
  distanceRatio?: number;
  /** Custom lag in seconds (default: 0.05) */
  lag?: number;
}

/**
 * Body bracket configuration (for shocked animation)
 */
export interface BodyConfig {
  /** Left bracket X offset */
  leftX?: number;
  /** Left bracket Y offset */
  leftY?: number;
  /** Right bracket X offset */
  rightX?: number;
  /** Right bracket Y offset */
  rightY?: number;
  /** Duration of separation */
  duration?: number;
  /** Easing for movement */
  ease?: string;
}

/**
 * Complete emotion configuration
 */
export interface EmotionConfig {
  /** Unique emotion identifier */
  id: string;
  /** Eye animation configuration */
  eyes?: EyeConfig;
  /** Character movement phases */
  character: CharacterPhase[];
  /** Glow following configuration */
  glow?: GlowConfig;
  /** Body bracket configuration (shocked) */
  body?: BodyConfig;
  /** Total animation duration in seconds */
  totalDuration: number;
  /** Whether rotation should be reset at end */
  resetRotation?: boolean;
  /** Whether rotationY should be reset at end */
  resetRotationY?: boolean;
}
