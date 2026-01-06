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
export { AntyCharacter, type AntyCharacterProps, type AntyCharacterHandle, AntyParticleCanvas, type ParticleCanvasHandle, AntySearchBar, type AntySearchBarProps, } from './components';
export { AntyChatPanel, type AntyChatPanelProps } from './components/AntyChatPanel';
export { AntyChat, createAntyChat, type ChatMessage, type ChatResponse } from './lib/chat/openai-client';
export { mapEmotionToExpression, extractEmotion, stripEmotionTags, stripEmotionTagsStreaming, } from './lib/chat/emotion-mapper';
export { type ChatSession, type ChatMessage as StoredChatMessage, getSessions, getSession, saveSession, deleteSession, createNewSession, getCurrentSessionId, setCurrentSessionId, clearCurrentSessionId, generateTitle, formatSessionDate, } from './lib/chat/history';
export { useAnimationController } from './hooks/use-animation-controller';
export { useSearchMorph, type UseSearchMorphOptions, type UseSearchMorphReturn, type SearchBarRefs } from './hooks/use-search-morph';
export { AnimationState, type EmotionType, type ExpressionName, type SearchMode, type EmotionOptions, type AnimationCallbacks, type EmotionConfig, type SearchBarConfig, DEFAULT_SEARCH_BAR_CONFIG, isEmotionType, type Particle, type ParticleType, type ParticleConfig, } from './types';
import { EMOTION_CONFIGS as _EMOTION_CONFIGS } from './lib/animation';
export { EMOTION_CONFIGS, getEmotionConfig, createIdleAnimation, createEyeAnimation, createLookAnimation, createReturnFromLookAnimation, createWakeUpAnimation, createPowerOffAnimation, getEyeShape, getEyeDimensions, EYE_SHAPES, EYE_DIMENSIONS, type EyeShapeName, } from './lib/animation';
export declare const AVAILABLE_EMOTIONS: (keyof typeof _EMOTION_CONFIGS)[];
export { PARTICLE_CONFIGS } from './lib/particles';
export { ANTY_STYLES, type AntyStyles } from './lib/styles';
export { ENABLE_ANIMATION_DEBUG_LOGS, logAnimationEvent, logAnimationSystemInfo } from './lib/animation/feature-flags';
