/**
 * Animation Definitions Index
 * Exports all declarative animation functions for Anty V3
 */
export { createIdleAnimation, type IdleAnimationElements, type IdleAnimationOptions, } from './idle';
export { EMOTION_CONFIGS } from './emotions';
export { interpretEmotionConfig, killPendingEyeReset } from './emotion-interpreter';
export type { EmotionConfig, EyeConfig, CharacterPhase, GlowConfig, BodyConfig, } from '../types';
export { createWakeUpAnimation, createPowerOffAnimation, type TransitionAnimationElements, } from './transitions';
export { createEyeAnimation, createBlinkAnimation, createDoubleBlinkAnimation, createLookAnimation, createReturnFromLookAnimation, type EyeAnimationElements, type EyeAnimationConfig, type BlinkAnimationConfig, type LookAnimationConfig, type EyeShapeSpec, } from './eye-animations';
export { EYE_SHAPES, EYE_DIMENSIONS, type EyeShapeName, } from './eye-shapes';
