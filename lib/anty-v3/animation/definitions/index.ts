/**
 * Animation Definitions Index
 * Exports all declarative animation functions for Anty V3
 */

// Idle animations
export {
  createIdleAnimation,
  type IdleAnimationElements,
  type IdleAnimationOptions,
} from './idle';

// Declarative emotion system
export { EMOTION_CONFIGS } from './emotions';
export { interpretEmotionConfig, killPendingEyeReset } from './emotion-interpreter';
export type {
  EmotionConfig,
  EyeConfig,
  CharacterPhase,
  GlowConfig,
  BodyConfig,
} from '../types';

// Transition animations
export {
  createWakeUpAnimation,
  createPowerOffAnimation,
  type TransitionAnimationElements,
} from './transitions';

// Eye animations
export {
  createEyeAnimation,
  createBlinkAnimation,
  createDoubleBlinkAnimation,
  createLookAnimation,
  createReturnFromLookAnimation,
  type EyeAnimationElements,
  type EyeAnimationConfig,
  type BlinkAnimationConfig,
  type LookAnimationConfig,
  type EyeShapeSpec,
} from './eye-animations';

// Eye shapes
export {
  EYE_SHAPES,
  EYE_DIMENSIONS,
  type EyeShapeName,
} from './eye-shapes';
