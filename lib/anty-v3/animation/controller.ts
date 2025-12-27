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

import gsap from 'gsap';
import {
  AnimationState,
  type EmotionType,
  type TimelineRef,
  type QueuedAnimation,
  type AnimationCallbacks,
  type ControllerConfig,
  type AnimationOptions,
} from './types';
import { StateMachine } from './state-machine';

/**
 * Blink scheduler controls returned from createIdleAnimation
 */
interface BlinkControls {
  pauseBlinks: () => void;
  resumeBlinks: () => void;
  killBlinks: () => void;
}

export class AnimationController {
  private stateMachine: StateMachine;
  private callbacks: AnimationCallbacks;
  private config: Required<Omit<ControllerConfig, 'callbacks' | 'system'>>;

  // Timeline tracking
  private activeTimelines = new Map<string, TimelineRef>();
  private idleTimeline: gsap.core.Timeline | null = null;
  private blinkControls: BlinkControls | null = null;

  // Animation queue
  private queue: QueuedAnimation[] = [];
  private isProcessingQueue = false;

  // State tracking
  private currentEmotion: EmotionType | null = null;
  private isIdleActive = false;

  // Super mode scale (when set, preserves scale during emotions)
  private superModeScale: number | null = null;

  constructor(
    callbacks: AnimationCallbacks = {},
    config: ControllerConfig = {}
  ) {
    this.callbacks = callbacks;
    this.config = {
      enableLogging: config.enableLogging ?? false,
      enableQueue: config.enableQueue ?? true,
      maxQueueSize: config.maxQueueSize ?? 10,
      defaultPriority: config.defaultPriority ?? 2,
    };

    this.stateMachine = new StateMachine(this.config.enableLogging);

    if (this.config.enableLogging) {
      console.log('[AnimationController] Initialized', this.config);
    }
  }

  /**
   * Get current state
   */
  getCurrentState(): AnimationState {
    return this.stateMachine.getCurrentState();
  }

  /**
   * Get current emotion
   */
  getCurrentEmotion(): EmotionType | null {
    return this.currentEmotion;
  }

  /**
   * Check if idle is currently active
   */
  isIdle(): boolean {
    return this.isIdleActive;
  }

  /**
   * Start idle animation
   */
  startIdle(
    timeline: gsap.core.Timeline,
    _elements: (Element | string)[],
    blinkControls?: BlinkControls
  ): void {
    if (this.config.enableLogging) {
      console.log('[AnimationController] Starting idle animation');
    }

    // Transition to idle state
    if (!this.stateMachine.transition(AnimationState.IDLE)) {
      if (this.config.enableLogging) {
        console.warn('[AnimationController] Failed to transition to idle');
      }
      return;
    }

    // Kill existing idle timeline and blink scheduler
    if (this.idleTimeline) {
      this.idleTimeline.kill();
    }
    if (this.blinkControls) {
      this.blinkControls.killBlinks();
    }

    // Store timeline and blink controls
    this.idleTimeline = timeline;
    this.blinkControls = blinkControls || null;
    this.isIdleActive = true;
    this.currentEmotion = null;

    // Setup callbacks
    timeline.eventCallback('onComplete', () => {
      if (this.config.enableLogging) {
        console.log('[AnimationController] Idle animation completed, restarting');
      }
      // Idle should always restart
      this.isIdleActive = false;
      this.callbacks.onComplete?.(AnimationState.IDLE);
    });

    this.callbacks.onStart?.(AnimationState.IDLE);
  }

  /**
   * Pause idle animation (and blink scheduler)
   */
  pauseIdle(): void {
    if (this.idleTimeline && this.idleTimeline.isActive()) {
      this.idleTimeline.pause();
    }
    // Pause blinks - this kills the pending timer entirely
    if (this.blinkControls) {
      this.blinkControls.pauseBlinks();
    }
    if (this.config.enableLogging) {
      console.log('[AnimationController] Paused idle animation and blink scheduler');
    }
  }

  /**
   * Resume idle animation (and blink scheduler)
   */
  resumeIdle(): void {
    if (this.idleTimeline && !this.idleTimeline.isActive()) {
      this.idleTimeline.resume();
    }
    // Resume blinks - schedules a fresh random delay
    if (this.blinkControls) {
      this.blinkControls.resumeBlinks();
    }
    if (this.config.enableLogging) {
      console.log('[AnimationController] Resumed idle animation and blink scheduler');
    }
  }

  /**
   * Restart idle animation from origin (seek to 0)
   * Use this for a clean handoff after emotions that significantly move the character
   */
  restartIdle(): void {
    if (this.idleTimeline) {
      this.idleTimeline.seek(0);
      this.idleTimeline.play();
    }
    // Fresh blink timer
    if (this.blinkControls) {
      this.blinkControls.resumeBlinks();
    }
    if (this.config.enableLogging) {
      console.log('[AnimationController] Restarted idle animation from origin');
    }
  }

  /**
   * Set super mode scale (preserves scale during emotions)
   * @param scale - Scale value (e.g., 1.45) or null to disable
   */
  setSuperMode(scale: number | null): void {
    this.superModeScale = scale;
    if (this.config.enableLogging) {
      console.log(`[AnimationController] Super mode scale: ${scale}`);
    }
  }

  /**
   * Get current super mode scale
   */
  getSuperModeScale(): number | null {
    return this.superModeScale;
  }

  /**
   * Kill idle animation (and blink scheduler)
   */
  killIdle(): void {
    if (this.idleTimeline) {
      this.idleTimeline.kill();
      this.idleTimeline = null;
    }
    if (this.blinkControls) {
      this.blinkControls.killBlinks();
      this.blinkControls = null;
    }
    this.isIdleActive = false;
    if (this.config.enableLogging) {
      console.log('[AnimationController] Killed idle animation and blink scheduler');
    }
  }

  /**
   * Play an emotion animation
   */
  playEmotion(
    emotion: EmotionType,
    timeline: gsap.core.Timeline,
    elements: (Element | string)[],
    options: AnimationOptions = {}
  ): boolean {
    const priority = options.priority ?? this.config.defaultPriority;
    const force = options.force ?? false;

    if (this.config.enableLogging) {
      console.log(`[AnimationController] Play emotion: ${emotion} (priority: ${priority})`);
    }

    // Check if we can transition
    if (!this.stateMachine.canInterrupt(AnimationState.EMOTION, force)) {
      // Queue if enabled
      if (this.config.enableQueue) {
        this.enqueue(AnimationState.EMOTION, emotion, () => {
          this.playEmotion(emotion, timeline, elements, options);
        }, priority);
      }
      return false;
    }

    // Kill any existing emotion timelines before starting new one
    for (const [id, ref] of this.activeTimelines.entries()) {
      if (id.startsWith('emotion-')) {
        if (this.config.enableLogging) {
          console.log(`[AnimationController] Killing previous emotion: ${id}`);
        }
        ref.timeline.kill();
        this.activeTimelines.delete(id);
      }
    }

    // Transition to emotion state
    if (!this.stateMachine.transition(AnimationState.EMOTION, force)) {
      if (this.config.enableLogging) {
        console.warn(`[AnimationController] Failed to transition to emotion: ${emotion}`);
      }
      return false;
    }

    // Pause idle
    this.pauseIdle();

    const animationId = `emotion-${emotion}-${Date.now()}`;

    // Store timeline
    this.activeTimelines.set(animationId, {
      timeline,
      element: elements[0],
      state: AnimationState.EMOTION,
      startedAt: Date.now(),
      priority,
      id: animationId,
      emotion,
    });

    this.currentEmotion = emotion;

    // CRITICAL FIX: Pause timeline immediately to prevent auto-play before callbacks are set
    // GSAP timelines auto-play by default, which can cause onStart to fire before callbacks are registered
    timeline.pause();

    // CRITICAL: Capture original callbacks from emotion timeline BEFORE clearing them
    // This preserves eye reset and rotation cleanup logic from emotions.ts
    const originalOnStart = timeline.eventCallback('onStart');
    const originalOnComplete = timeline.eventCallback('onComplete');
    const originalOnInterrupt = timeline.eventCallback('onInterrupt');

    // Clear existing callbacks to prevent duplicates
    timeline.eventCallback('onStart', null);
    timeline.eventCallback('onComplete', null);
    timeline.eventCallback('onInterrupt', null);

    // Setup callbacks BEFORE playing timeline
    const animationStartTime = Date.now();

    timeline.eventCallback('onStart', () => {
      if (this.config.enableLogging) {
        console.log(`[AnimationController] Emotion ${emotion} motion START`);
      }

      // Call original onStart callback if it exists
      if (originalOnStart) {
        originalOnStart.call(timeline);
      }

      // Notify that GSAP motion has actually started
      this.callbacks.onEmotionMotionStart?.(emotion, animationId);
    });

    timeline.eventCallback('onComplete', () => {
      const duration = Date.now() - animationStartTime;

      if (this.config.enableLogging) {
        console.log(`[AnimationController] Emotion ${emotion} completed (${duration}ms)`);
      }

      // Call original onComplete callback FIRST (eye reset, rotation cleanup)
      if (originalOnComplete) {
        originalOnComplete.call(timeline);
      }

      // Cleanup
      this.activeTimelines.delete(animationId);

      // Return to idle (force transition to bypass priority check)
      this.stateMachine.transition(AnimationState.IDLE, true);

      // Restart or resume idle based on resetIdle flag (default: restart for clean handoff)
      const shouldResetIdle = options.resetIdle !== false;
      if (shouldResetIdle) {
        this.restartIdle();
      } else {
        this.resumeIdle();
      }

      // Process queue
      this.processQueue();

      // Notify that GSAP motion has actually completed
      this.callbacks.onEmotionMotionComplete?.(emotion, animationId, duration);
      this.callbacks.onComplete?.(AnimationState.EMOTION, emotion);
      options.onComplete?.();
    });

    timeline.eventCallback('onInterrupt', () => {
      if (this.config.enableLogging) {
        console.log(`[AnimationController] Emotion ${emotion} interrupted`);
      }

      // Call original onInterrupt callback if exists
      if (originalOnInterrupt) {
        originalOnInterrupt.call(timeline);
      }

      // CRITICAL: Also call onComplete to reset eyes when interrupted
      // When timeline.kill() is called, onComplete doesn't fire, but we still need eye reset
      if (originalOnComplete) {
        originalOnComplete.call(timeline);
      }

      // Cleanup
      this.activeTimelines.delete(animationId);

      this.callbacks.onInterrupt?.(AnimationState.EMOTION, emotion);
    });

    this.callbacks.onStart?.(AnimationState.EMOTION, emotion);

    // CRITICAL: Now play the timeline after all callbacks are set
    timeline.play();

    return true;
  }

  /**
   * Transition to a new state
   */
  transitionTo(
    state: AnimationState,
    emotion: EmotionType | null,
    timeline: gsap.core.Timeline,
    elements: (Element | string)[],
    options: AnimationOptions = {}
  ): boolean {
    const priority = options.priority ?? this.config.defaultPriority;
    const force = options.force ?? false;

    if (this.config.enableLogging) {
      console.log(`[AnimationController] Transition to: ${state}${emotion ? ` / ${emotion}` : ''} (priority: ${priority})`);
    }

    // Check if we can interrupt
    if (!this.stateMachine.canInterrupt(state, force)) {
      if (this.config.enableQueue) {
        this.enqueue(state, emotion, () => {
          this.transitionTo(state, emotion, timeline, elements, options);
        }, priority);
      }
      return false;
    }

    // Perform transition
    if (!this.stateMachine.transition(state, force)) {
      if (this.config.enableLogging) {
        console.warn(`[AnimationController] Failed to transition to ${state}`);
      }
      return false;
    }

    // Pause idle if not transitioning to idle
    if (state !== AnimationState.IDLE) {
      this.pauseIdle();
    }

    const animationId = `${state}-${emotion || 'none'}-${Date.now()}`;

    // Store timeline
    this.activeTimelines.set(animationId, {
      timeline,
      element: elements[0],
      state,
      startedAt: Date.now(),
      priority,
      id: animationId,
      emotion: emotion || undefined,
    });

    this.currentEmotion = emotion;

    // Setup callbacks
    timeline.eventCallback('onComplete', () => {
      if (this.config.enableLogging) {
        console.log(`[AnimationController] ${state}${emotion ? ` / ${emotion}` : ''} completed`);
      }

      // Cleanup
      this.activeTimelines.delete(animationId);

      // Return to idle if not already there (force transition to bypass priority check)
      if (state !== AnimationState.IDLE) {
        this.stateMachine.transition(AnimationState.IDLE, true);
        this.resumeIdle();
      }

      // Process queue
      this.processQueue();

      this.callbacks.onComplete?.(state, emotion || undefined);
      options.onComplete?.();
    });

    this.callbacks.onStart?.(state, emotion || undefined);

    return true;
  }

  /**
   * Kill all active animations
   */
  killAll(): void {
    if (this.config.enableLogging) {
      console.log('[AnimationController] Killing all animations');
    }

    // Kill all active timelines
    this.activeTimelines.forEach(ref => {
      if (ref.timeline.isActive()) {
        ref.timeline.kill();
      }
    });
    this.activeTimelines.clear();

    // Kill idle
    this.killIdle();

    // Clear queue
    this.queue = [];

    // Reset state
    this.stateMachine.reset();
  }

  /**
   * Enqueue an animation
   */
  private enqueue(
    state: AnimationState,
    emotion: EmotionType | null,
    callback: () => void,
    priority: number
  ): void {
    if (this.queue.length >= this.config.maxQueueSize) {
      if (this.config.enableLogging) {
        console.warn('[AnimationController] Queue full, dropping oldest item');
      }
      this.queue.shift();
    }

    const animation: QueuedAnimation = {
      id: `queued-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      state,
      emotion: emotion || undefined,
      callback,
      priority,
      queuedAt: Date.now(),
    };

    this.queue.push(animation);

    // Sort by priority (highest first)
    this.queue.sort((a, b) => b.priority - a.priority);

    if (this.config.enableLogging) {
      console.log(`[AnimationController] Queued ${state}${emotion ? `/${emotion}` : ''} (${this.queue.length} in queue)`);
    }

    this.callbacks.onQueueAdd?.(animation);
  }

  /**
   * Process animation queue
   */
  private processQueue(): void {
    if (this.isProcessingQueue || this.queue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    const animation = this.queue.shift();
    if (!animation) {
      this.isProcessingQueue = false;
      return;
    }

    if (this.config.enableLogging) {
      console.log(`[AnimationController] Processing queued ${animation.state}${animation.emotion ? `/${animation.emotion}` : ''}`);
    }

    this.callbacks.onQueueProcess?.(animation);

    // Execute callback
    animation.callback();

    this.isProcessingQueue = false;
  }

  /**
   * Get debug information
   */
  getDebugInfo(): {
    state: ReturnType<StateMachine['getDebugInfo']>;
    activeTimelines: number;
    queueSize: number;
    isIdleActive: boolean;
    currentEmotion: EmotionType | null;
  } {
    return {
      state: this.stateMachine.getDebugInfo(),
      activeTimelines: this.activeTimelines.size,
      queueSize: this.queue.length,
      isIdleActive: this.isIdleActive,
      currentEmotion: this.currentEmotion,
    };
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    if (this.config.enableLogging) {
      console.log('[AnimationController] Destroying controller');
    }

    this.killAll();
  }
}
