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

// Emotion animations
export {
  createEmotionAnimation,
  type EmotionAnimationElements,
  type EmotionAnimationOptions,
} from './emotions';

// Gesture animations
export {
  createGestureAnimation,
  type GestureAnimationElements,
  type GestureType,
} from './gestures';

// Transition animations
export {
  createWakeUpAnimation,
  createPowerOffAnimation,
  type TransitionAnimationElements,
} from './transitions';

// Search morph animations
export {
  createSearchMorphAnimation,
  type MorphAnimationElements,
  type MorphDirection,
  type MorphAnimationCallbacks,
} from './morph';

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
