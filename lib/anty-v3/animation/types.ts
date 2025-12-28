/**
 * Animation System Types
 *
 * Type definitions for the Anty V3 animation system.
 * Provides strict typing for animation states, emotions, and configurations.
 */

import type gsap from 'gsap';

/**
 * Animation state machine states
 */
export enum AnimationState {
  /** Default idle state with ambient animations */
  IDLE = 'IDLE',
  /** Playing an emotion animation */
  EMOTION = 'EMOTION',
  /** Transitioning between states */
  TRANSITION = 'TRANSITION',
  /** Morphing between shapes/forms */
  MORPH = 'MORPH',
  /** Responding to user interaction */
  INTERACTION = 'INTERACTION',
  /** Powered off state */
  OFF = 'OFF',
}

/**
 * Available emotion types as string literals for type safety
 * Each emotion MUST have a corresponding config in EMOTION_CONFIGS
 */
export type EmotionType =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'shocked'
  | 'excited'
  | 'spin'
  | 'jump'
  | 'idea'
  | 'back-forth'
  | 'wink'
  | 'nod'
  | 'headshake'
  | 'look-left'
  | 'look-right'
  | 'super'
  | 'chant';

/**
 * Expression name includes EmotionType plus special states
 * Used for component props that can also accept 'idle' or 'off'
 */
export type ExpressionName = EmotionType | 'idle' | 'off';

/**
 * Search mode types for search-specific animations
 */
export type SearchMode =
  | 'inactive'
  | 'focusing'
  | 'active'
  | 'searching'
  | 'results'
  | 'closing';

/**
 * Animation easing functions
 */
export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'
  | 'spring'
  | 'bounce'
  | 'power1.in'
  | 'power1.out'
  | 'power1.inOut'
  | 'power2.in'
  | 'power2.out'
  | 'power2.inOut'
  | 'power3.in'
  | 'power3.out'
  | 'power3.inOut'
  | 'power4.in'
  | 'power4.out'
  | 'power4.inOut'
  | 'back.in'
  | 'back.out'
  | 'back.inOut'
  | 'elastic.in'
  | 'elastic.out'
  | 'elastic.inOut';

/**
 * Options for playing emotion animations
 */
export interface EmotionOptions {
  /** Whether this emotion can interrupt the current animation */
  interrupt?: boolean;
  /** Duration of the emotion in milliseconds */
  duration?: number;
  /** Number of times to repeat the emotion (1 = play once, 2 = play twice, etc.) */
  repeat?: number;
  /** Delay before starting the emotion in milliseconds */
  delay?: number;
  /** Callback when emotion starts */
  onStart?: () => void;
  /** Callback when emotion completes */
  onComplete?: () => void;
  /** Custom easing function */
  easing?: EasingFunction;
  /** Priority level (higher can interrupt lower) */
  priority?: number;
  /** Force play even if same emotion is active */
  force?: boolean;
  /** Additional metadata for the emotion */
  metadata?: Record<string, unknown>;
  /** For 'jump' emotion: whether to show lightbulb emoji (default: true) */
  showLightbulb?: boolean;
  /** For 'jump' emotion: use quicker descent timing for jump vs float (default: false) */
  quickDescent?: boolean;
}

/**
 * Options for state transitions
 */
export interface TransitionOptions {
  /** Duration of the transition in milliseconds */
  duration?: number;
  /** Easing function for the transition */
  easing?: EasingFunction;
  /** Callback when transition starts */
  onStart?: () => void;
  /** Callback when transition completes */
  onComplete?: () => void;
  /** Whether to skip the transition and jump immediately */
  immediate?: boolean;
  /** Priority level for the transition */
  priority?: number;
}

/**
 * Single keyframe in an animation timeline
 */
export interface AnimationKeyframe {
  /** Time offset in milliseconds or percentage (0-1) */
  time: number | string;
  /** CSS properties or SVG attributes to animate */
  properties: Record<string, string | number>;
  /** Easing function for this keyframe */
  easing?: EasingFunction;
}

/**
 * Configuration for a declarative animation
 */
export interface AnimationConfig {
  /** Target element selector or ref */
  target: string | SVGElement | HTMLElement;
  /** Animation keyframes */
  keyframes: AnimationKeyframe[];
  /** Total duration in milliseconds */
  duration: number;
  /** Easing function (can be overridden per keyframe) */
  easing?: EasingFunction;
  /** Number of iterations (Infinity for loop) */
  iterations?: number;
  /** Delay before starting in milliseconds */
  delay?: number;
  /** Fill mode (forwards, backwards, both, none) */
  fill?: 'forwards' | 'backwards' | 'both' | 'none';
  /** Unique identifier for this animation */
  id?: string;
}

/**
 * Timeline configuration for complex multi-element animations
 */
export interface TimelineConfig {
  /** Unique identifier for this timeline */
  id: string;
  /** Array of animations in this timeline */
  animations: AnimationConfig[];
  /** Whether animations run in parallel or sequence */
  mode?: 'parallel' | 'sequence';
  /** Callback when timeline starts */
  onStart?: () => void;
  /** Callback when timeline completes */
  onComplete?: () => void;
  /** Callback on each timeline update */
  onUpdate?: (progress: number) => void;
  /** Default easing for all animations */
  defaultEasing?: EasingFunction;
  /** Repeat count for the entire timeline */
  repeat?: number;
  /** Delay before timeline starts */
  delay?: number;
}

/**
 * Performance metrics for animation monitoring
 */
export interface AnimationMetrics {
  /** Current frames per second */
  fps: number;
  /** Average frame time in milliseconds */
  frameTime: number;
  /** Number of dropped frames */
  droppedFrames: number;
  /** Current animation state */
  state: AnimationState;
  /** Active emotion (if any) */
  activeEmotion: EmotionType | null;
  /** Total animations played */
  totalAnimations: number;
  /** Timestamp of last update */
  lastUpdate: number;
  /** Number of active timelines */
  activeTimelines: number;
  /** Queue size */
  queueSize: number;
  /** Memory usage (if available) */
  memory?: {
    used: number;
    total: number;
  };
}

/**
 * Animation context for state management
 */
export interface AnimationContext {
  /** Current animation state */
  state: AnimationState;
  /** Previous animation state */
  previousState: AnimationState | null;
  /** Current emotion being played */
  currentEmotion: EmotionType | null;
  /** Animation queue */
  queue: Array<{
    id: string;
    emotion: EmotionType;
    options: EmotionOptions;
    queuedAt: number;
  }>;
  /** Whether animations are paused */
  isPaused: boolean;
  /** Current search mode */
  searchMode: SearchMode;
  /** Performance metrics */
  metrics: AnimationMetrics;
  /** Active timelines */
  activeTimelines: Map<string, gsap.core.Timeline>;
}

/**
 * Hook return type for useAnimation
 */
export interface UseAnimationReturn {
  /** Play an emotion animation */
  playEmotion: (emotion: EmotionType, options?: EmotionOptions) => Promise<void>;
  /** Transition to a new state */
  transitionTo: (state: AnimationState, options?: TransitionOptions) => Promise<void>;
  /** Get current animation context */
  getContext: () => AnimationContext;
  /** Pause all animations */
  pause: () => void;
  /** Resume animations */
  resume: () => void;
  /** Clear animation queue */
  clearQueue: () => void;
  /** Check if animation system is ready */
  isReady: boolean;
  /** Current animation state */
  currentState: AnimationState;
  /** Current emotion (if any) */
  currentEmotion: EmotionType | null;
  /** Set search mode */
  setSearchMode: (mode: SearchMode) => void;
  /** Kill all animations */
  killAll: () => void;
}

/**
 * Configuration for the animation system
 */
export interface AnimationSystemConfig {
  /** Enable debug mode with console logging */
  debug?: boolean;
  /** Enable performance monitoring */
  enableMetrics?: boolean;
  /** Default emotion duration in milliseconds */
  defaultEmotionDuration?: number;
  /** Default transition duration in milliseconds */
  defaultTransitionDuration?: number;
  /** Maximum queue size (0 = unlimited) */
  maxQueueSize?: number;
  /** Whether to auto-play idle animations */
  autoIdle?: boolean;
  /** Idle animation interval in milliseconds */
  idleInterval?: number;
  /** Enable reduced motion for accessibility */
  reducedMotion?: boolean;
  /** Default priority for animations */
  defaultPriority?: number;
  /** Enable animation queue */
  enableQueue?: boolean;
}

/**
 * Event emitted by the animation system
 */
export interface AnimationEvent {
  /** Event type */
  type:
    | 'stateChange'
    | 'emotionStart'
    | 'emotionEnd'
    | 'transitionStart'
    | 'transitionEnd'
    | 'error'
    | 'queueUpdate'
    | 'pause'
    | 'resume'
    | 'metricsUpdate';
  /** Event timestamp */
  timestamp: number;
  /** Event payload */
  payload: {
    state?: AnimationState;
    previousState?: AnimationState;
    emotion?: EmotionType;
    error?: Error;
    queueSize?: number;
    metrics?: AnimationMetrics;
    [key: string]: unknown;
  };
}

/**
 * Callback for animation events
 */
export type AnimationEventCallback = (event: AnimationEvent) => void;

/**
 * Spring animation configuration
 */
export interface SpringConfig {
  /** Mass of the object */
  mass?: number;
  /** Tension/stiffness of the spring */
  tension?: number;
  /** Friction/damping of the spring */
  friction?: number;
  /** Velocity of the spring */
  velocity?: number;
  /** Precision threshold for completion */
  precision?: number;
}

/**
 * Gesture configuration for interactive animations
 */
export interface GestureConfig {
  /** Enable drag gestures */
  enableDrag?: boolean;
  /** Enable hover gestures */
  enableHover?: boolean;
  /** Enable click gestures */
  enableClick?: boolean;
  /** Drag bounds */
  dragBounds?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  /** Callback when gesture starts */
  onGestureStart?: (type: 'drag' | 'hover' | 'click') => void;
  /** Callback when gesture ends */
  onGestureEnd?: (type: 'drag' | 'hover' | 'click') => void;
}

/**
 * Valid state transitions with priorities
 */
export interface StateTransition {
  /** Source state */
  from: AnimationState;
  /** Target state */
  to: AnimationState;
  /** Whether transition is allowed */
  allowed: boolean;
  /** Priority level (higher can interrupt lower) */
  priority: number;
}

/**
 * Animation timeline reference for tracking
 */
export interface TimelineRef {
  /** GSAP timeline instance */
  timeline: gsap.core.Timeline;
  /** Target element or selector */
  element: Element | string;
  /** Associated animation state */
  state: AnimationState;
  /** Timestamp when timeline started */
  startedAt: number;
  /** Priority level */
  priority: number;
  /** Unique identifier */
  id: string;
  /** Associated emotion (if any) */
  emotion?: EmotionType;
}

/**
 * Queued animation waiting to be played
 */
export interface QueuedAnimation {
  /** Unique identifier */
  id: string;
  /** Target animation state */
  state: AnimationState;
  /** Emotion to play (if applicable) */
  emotion?: EmotionType;
  /** Animation callback function */
  callback: () => void | Promise<void>;
  /** Priority level */
  priority: number;
  /** Timestamp when queued */
  queuedAt: number;
  /** Options for the animation */
  options?: EmotionOptions | TransitionOptions;
}

/**
 * Element ownership tracking for conflict resolution
 */
export interface ElementOwnership {
  /** Target element or selector */
  element: Element | string;
  /** ID of animation that owns this element */
  owner: string;
  /** Associated timeline */
  timeline: gsap.core.Timeline;
  /** Timestamp when acquired */
  acquiredAt: number;
  /** Priority level of owner */
  priority: number;
}

/**
 * Animation lifecycle callbacks
 */
export interface AnimationCallbacks {
  /** Called when animation starts */
  onStart?: (state: AnimationState, emotion?: EmotionType) => void;
  /** Called when animation completes */
  onComplete?: (state: AnimationState, emotion?: EmotionType) => void;
  /** Called when animation is interrupted */
  onInterrupt?: (state: AnimationState, emotion?: EmotionType) => void;
  /** Called when state changes */
  onStateChange?: (from: AnimationState, to: AnimationState) => void;
  /** Called when animation is added to queue */
  onQueueAdd?: (animation: QueuedAnimation) => void;
  /** Called when queued animation starts processing */
  onQueueProcess?: (animation: QueuedAnimation) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Called when emotion GSAP timeline actually starts (motion begins) */
  onEmotionMotionStart?: (emotion: EmotionType, timelineId: string) => void;
  /** Called when emotion GSAP timeline actually completes (motion ends) */
  onEmotionMotionComplete?: (emotion: EmotionType, timelineId: string, duration: number) => void;
}

/**
 * Controller configuration options
 */
export interface ControllerConfig {
  /** Enable debug logging */
  enableLogging?: boolean;
  /** Enable animation queue */
  enableQueue?: boolean;
  /** Maximum queue size (0 = unlimited) */
  maxQueueSize?: number;
  /** Default priority level */
  defaultPriority?: number;
  /** Animation callbacks */
  callbacks?: AnimationCallbacks;
  /** System configuration */
  system?: AnimationSystemConfig;
}

/**
 * Animation options for individual animations
 */
export interface AnimationOptions {
  /** Priority level */
  priority?: number;
  /** Force animation even if same state/emotion */
  force?: boolean;
  /** Completion callback */
  onComplete?: () => void;
  /** Start callback */
  onStart?: () => void;
  /** Duration override */
  duration?: number;
  /** Easing override */
  easing?: EasingFunction;
  /** Delay before start */
  delay?: number;
  /** Whether to restart idle from origin after emotion completes (default: true) */
  resetIdle?: boolean;
}

/**
 * Type guard to check if a value is a valid emotion
 */
export function isEmotionType(value: string): value is EmotionType {
  // Legacy alias support
  if (value === 'idea') return true; // 'idea' was renamed to 'jump'

  const emotions: EmotionType[] = [
    'happy',
    'sad',
    'angry',
    'shocked',
    'excited',
    'spin',
    'jump',
    'back-forth',
    'wink',
    'nod',
    'headshake',
    'look-left',
    'look-right',
    'super',
    'chant',
  ];
  return emotions.includes(value as EmotionType);
}

/**
 * Type guard to check if a value is a valid animation state
 */
export function isAnimationState(value: string): value is AnimationState {
  return Object.values(AnimationState).includes(value as AnimationState);
}

/**
 * Type guard to check if a value is a valid search mode
 */
export function isSearchMode(value: string): value is SearchMode {
  const modes: SearchMode[] = [
    'inactive',
    'focusing',
    'active',
    'searching',
    'results',
    'closing',
  ];
  return modes.includes(value as SearchMode);
}

// ============================================================================
// Emotion Configuration Types (declarative system)
// ============================================================================

import type { EyeShapeName } from './definitions/eye-shapes';

/**
 * Eye configuration for an emotion
 */
export interface EyeConfig {
  /** Target eye shape (from EYE_SHAPES) */
  shape: EyeShapeName | { left: EyeShapeName; right: EyeShapeName };
  /** Duration of eye morph animation */
  duration: number;
  /** Delay before eye animation starts (seconds) */
  delay?: number;
  /** Y offset for eyes (negative = up). Can be number for both or {left, right} for asymmetric */
  yOffset?: number | { left: number; right: number };
  /** X offset for eyes (negative = left). Can be number for both or {left, right} for asymmetric */
  xOffset?: number | { left: number; right: number };
  /** Scale multiplier for eyes */
  scale?: number;
  /** Bunching effect - eyes move closer together (for look animations) */
  bunch?: number;
  /** Rotation for left eye */
  leftRotation?: number;
  /** Rotation for right eye (use opposite sign of leftRotation for mirror effect) */
  rightRotation?: number;
  /** When eyes return to normal (timeline position) - resets scale/offset */
  returnPosition?: number | string;
  /** Duration of return animation */
  returnDuration?: number;
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
    rotationX?: number;
    transformPerspective?: number;
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
  /** When brackets return (timeline position, e.g. 0.8 or '+=1') */
  returnPosition?: number | string;
  /** Duration of return animation */
  returnDuration?: number;
  /** Easing for return */
  returnEase?: string;
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
  /** Hold duration before returning to idle (for look animations) */
  holdDuration?: number;
  /** Whether rotation should be reset at end */
  resetRotation?: boolean;
  /** Whether rotationY should be reset at end */
  resetRotationY?: boolean;
  /** Whether to show lightbulb emoji above character (idea animation) */
  showLightbulb?: boolean;
  /** Whether to show teardrop emoji beside character (sad animation) */
  showTeardrop?: boolean;
  /** Duration for eye reset transition at end (0 = instant, default) */
  eyeResetDuration?: number;
  /** Whether to restart idle from origin after emotion completes (default: true)
   *  Set to false for subtle emotions like wink that shouldn't disrupt breathing */
  resetIdle?: boolean;
}
