/**
 * @antfly/anty-embed
 *
 * Embeddable Anty character animation for web applications.
 *
 * @example
 * ```tsx
 * import { AntyCharacter } from '@antfly/anty-embed';
 *
 * function App() {
 *   const antyRef = useRef<AntyCharacterHandle>(null);
 *
 *   const handleClick = () => {
 *     antyRef.current?.playEmotion('happy');
 *   };
 *
 *   return (
 *     <AntyCharacter
 *       ref={antyRef}
 *       size={160}
 *       expression="idle"
 *       showShadow={true}
 *       showGlow={true}
 *     />
 *   );
 * }
 * ```
 */

// Main components
export {
  AntyCharacter,
  type AntyCharacterProps,
  type AntyCharacterHandle,
  AntyParticleCanvas,
  type ParticleCanvasHandle,
} from './components';

// Hooks
export { useAnimationController } from './hooks/use-animation-controller';

// Types
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
  type Particle,
  type ParticleType,
  type ParticleConfig,
} from './types';

// Animation utilities (for advanced usage)
export {
  EMOTION_CONFIGS,
  getEmotionConfig,
  createIdleAnimation,
  createEyeAnimation,
  createLookAnimation,
  createReturnFromLookAnimation,
  createWakeUpAnimation,
  createPowerOffAnimation,
  getEyeShape,
  getEyeDimensions,
  EYE_SHAPES,
  EYE_DIMENSIONS,
  type EyeShapeName,
} from './lib/animation';

// Particle utilities
export { PARTICLE_CONFIGS } from './lib/particles';

// Debug utilities
export { ENABLE_ANIMATION_DEBUG_LOGS, logAnimationEvent, logAnimationSystemInfo } from './lib/animation/feature-flags';
