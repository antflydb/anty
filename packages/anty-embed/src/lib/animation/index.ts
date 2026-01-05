/**
 * Animation System
 *
 * Core animation infrastructure for Anty character.
 */

// Types
export {
  AnimationState,
  type EmotionType,
  type ExpressionName,
  type SearchMode,
  type EasingFunction,
  type EmotionOptions,
  type TransitionOptions,
  type AnimationConfig,
  type TimelineConfig,
  type AnimationMetrics,
  type AnimationContext,
  type UseAnimationReturn,
  type AnimationSystemConfig,
  type AnimationEvent,
  type AnimationEventCallback,
  type SpringConfig,
  type GestureConfig,
  type StateTransition,
  type TimelineRef,
  type QueuedAnimation,
  type ElementOwnership,
  type AnimationCallbacks,
  type ControllerConfig,
  type AnimationOptions,
  type EyeConfig,
  type CharacterPhase,
  type GlowConfig,
  type BodyConfig,
  type EyePhase,
  type EmotionConfig,
  type SearchBarConfig,
  DEFAULT_SEARCH_BAR_CONFIG,
  isEmotionType,
  isAnimationState,
  isSearchMode,
} from './types';

// Controller
export { AnimationController } from './controller';

// State Machine
export { StateMachine } from './state-machine';

// Glow System
export { createGlowSystem, type GlowSystemControls } from './glow-system';

// Shadow Tracker
export { createShadowTracker, type ShadowTrackerControls } from './shadow';

// Constants
export * from './constants';

// Feature Flags
export { ENABLE_ANIMATION_DEBUG_LOGS, logAnimationEvent } from './feature-flags';

// Initialize
export { initializeCharacter, resetEyesToIdle } from './initialize';

// Definitions
export { EMOTION_CONFIGS, getEmotionConfig, GLOW_CONSTANTS } from './definitions/emotions';
export { createIdleAnimation } from './definitions/idle';
export { createEyeAnimation, createLookAnimation, createReturnFromLookAnimation } from './definitions/eye-animations';
export { getEyeShape, getEyeDimensions, EYE_SHAPES, EYE_DIMENSIONS, type EyeShapeName } from './definitions/eye-shapes';
export { interpretEmotionConfig } from './definitions/emotion-interpreter';
export { createWakeUpAnimation, createPowerOffAnimation } from './definitions/transitions';
