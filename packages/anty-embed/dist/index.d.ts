/**
 * @searchaf/anty-embed
 *
 * Embeddable Anty character animation for web applications.
 *
 * @example
 * ```tsx
 * import { AntyCharacter } from '@searchaf/anty-embed';
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
export { AntyCharacter, type AntyCharacterProps, type AntyCharacterHandle, AntyParticleCanvas, type ParticleCanvasHandle, } from './components';
export { useAnimationController } from './hooks/use-animation-controller';
export { AnimationState, type EmotionType, type ExpressionName, type SearchMode, type EmotionOptions, type AnimationCallbacks, type EmotionConfig, type SearchBarConfig, DEFAULT_SEARCH_BAR_CONFIG, isEmotionType, type Particle, type ParticleType, type ParticleConfig, } from './types';
export { EMOTION_CONFIGS, getEmotionConfig, createIdleAnimation, createEyeAnimation, createLookAnimation, createReturnFromLookAnimation, createWakeUpAnimation, createPowerOffAnimation, getEyeShape, getEyeDimensions, EYE_SHAPES, EYE_DIMENSIONS, type EyeShapeName, } from './lib/animation';
export { PARTICLE_CONFIGS } from './lib/particles';
export { ENABLE_ANIMATION_DEBUG_LOGS, logAnimationEvent, logAnimationSystemInfo } from './lib/animation/feature-flags';
