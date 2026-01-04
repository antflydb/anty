/**
 * Animation Controller
 *
 * Main controller using Finite State Machine pattern.
 * Manages animation state, prevents conflicts, queues animations,
 * and guarantees idle always restarts.
 *
 * REFACTORED: Removed ElementRegistry and DebugTracker dependencies.
 * These were overengineered - element locking always used force=true anyway.
 */
import { AnimationState, type EmotionType, type AnimationCallbacks, type ControllerConfig, type AnimationOptions } from './types';
import { StateMachine } from './state-machine';
/**
 * Blink scheduler controls returned from createIdleAnimation
 */
interface BlinkControls {
    pauseBlinks: () => void;
    resumeBlinks: () => void;
    killBlinks: () => void;
}
export declare class AnimationController {
    private stateMachine;
    private callbacks;
    private config;
    private activeTimelines;
    private idleTimeline;
    private blinkControls;
    private queue;
    private isProcessingQueue;
    private currentEmotion;
    private isIdleActive;
    private superModeScale;
    constructor(callbacks?: AnimationCallbacks, config?: ControllerConfig);
    /**
     * Get current state
     */
    getCurrentState(): AnimationState;
    /**
     * Get current emotion
     */
    getCurrentEmotion(): EmotionType | null;
    /**
     * Check if idle is currently active (started but may be paused)
     */
    isIdle(): boolean;
    /**
     * Check if idle is actively playing (not paused)
     */
    isIdlePlaying(): boolean;
    /**
     * Start idle animation
     */
    startIdle(timeline: gsap.core.Timeline, _elements: (Element | string)[], blinkControls?: BlinkControls): void;
    /**
     * Pause idle animation (and blink scheduler)
     */
    pauseIdle(): void;
    /**
     * Resume idle animation (and blink scheduler)
     */
    resumeIdle(): void;
    /**
     * Restart idle animation from origin
     * Use this for a clean handoff after emotions that significantly move the character
     *
     * Uses invalidate() to force GSAP to recapture starting values.
     * This is critical for super mode: the idle timeline uses relative scale (*=1.02),
     * so we need it to recapture the current scale (1.45 in super mode) as the base.
     */
    restartIdle(): void;
    /**
     * Set super mode scale (preserves scale during emotions)
     * @param scale - Scale value (e.g., 1.45) or null to disable
     */
    setSuperMode(scale: number | null): void;
    /**
     * Get current super mode scale
     */
    getSuperModeScale(): number | null;
    /**
     * Kill idle animation (and blink scheduler)
     */
    killIdle(): void;
    /**
     * Play an emotion animation
     */
    playEmotion(emotion: EmotionType, timeline: gsap.core.Timeline, elements: (Element | string)[], options?: AnimationOptions): boolean;
    /**
     * Transition to a new state
     */
    transitionTo(state: AnimationState, emotion: EmotionType | null, timeline: gsap.core.Timeline, elements: (Element | string)[], options?: AnimationOptions): boolean;
    /**
     * Kill all active animations
     */
    killAll(): void;
    /**
     * Enqueue an animation
     */
    private enqueue;
    /**
     * Process animation queue
     */
    private processQueue;
    /**
     * Get debug information
     */
    getDebugInfo(): {
        state: ReturnType<StateMachine['getDebugInfo']>;
        activeTimelines: number;
        queueSize: number;
        isIdleActive: boolean;
        currentEmotion: EmotionType | null;
    };
    /**
     * Cleanup on destroy
     */
    destroy(): void;
}
export {};
