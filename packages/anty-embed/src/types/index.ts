/**
 * Anty Embed Types
 *
 * Re-exports all public types from the animation and particle systems.
 */

// Animation types
export {
  AnimationState,
  type EmotionType,
  type ExpressionName,
  type SearchMode,
  type EmotionOptions,
  type AnimationCallbacks,
  type EmotionConfig,
  type SearchBarConfig,
  DEFAULT_SEARCH_BAR_CONFIG,
  isEmotionType,
} from '../lib/animation/types';

// Particle types
export type { Particle, ParticleType, ParticleConfig } from '../lib/particles';
