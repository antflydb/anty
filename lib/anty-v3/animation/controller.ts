/**
 * Animation Controller
 *
 * Main controller using Finite State Machine pattern.
 * Manages animation state, prevents conflicts, queues animations,
 * and guarantees idle always restarts.
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
import { ElementRegistry } from './element-registry';
import { StateMachine } from './state-machine';

export class AnimationController {
  private stateMachine: StateMachine;
  private elementRegistry: ElementRegistry;
  private callbacks: AnimationCallbacks;
  private config: Required<Omit<ControllerConfig, 'callbacks' | 'system'>>;

  // Timeline tracking
  private activeTimelines = new Map<string, TimelineRef>();
  private idleTimeline: gsap.core.Timeline | null = null;
  private idleElements: (Element | string)[] = [];

  // Animation queue
  private queue: QueuedAnimation[] = [];
  private isProcessingQueue = false;

  // State tracking
  private currentEmotion: EmotionType | null = null;
  private isIdleActive = false;

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
    this.elementRegistry = new ElementRegistry(this.config.enableLogging);

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
  startIdle(timeline: gsap.core.Timeline, elements: (Element | string)[]): void {
    if (this.config.enableLogging) {
      console.log('[AnimationController] Starting idle animation');
    }

    // Store idle elements for later re-acquisition
    this.idleElements = elements;

    // Transition to idle state
    if (!this.stateMachine.transition(AnimationState.IDLE)) {
      if (this.config.enableLogging) {
        console.warn('[AnimationController] Failed to transition to idle');
      }
      return;
    }

    // Kill existing idle timeline
    if (this.idleTimeline) {
      this.idleTimeline.kill();
      this.elementRegistry.releaseByOwner('idle');
    }

    // Acquire elements
    let acquiredAll = true;
    elements.forEach(element => {
      if (!this.elementRegistry.acquire(element, 'idle', timeline, true)) {
        acquiredAll = false;
      }
    });

    if (!acquiredAll && this.config.enableLogging) {
      console.warn('[AnimationController] Some idle elements could not be acquired');
    }

    // Store timeline
    this.idleTimeline = timeline;
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
   * Pause idle animation
   */
  pauseIdle(): void {
    if (this.idleTimeline && this.idleTimeline.isActive()) {
      this.idleTimeline.pause();
      // Release elements so other animations can use them
      this.elementRegistry.releaseByOwner('idle');
      if (this.config.enableLogging) {
        console.log('[AnimationController] Paused idle animation and released elements');
      }
    }
  }

  /**
   * Resume idle animation
   */
  resumeIdle(): void {
    if (this.idleTimeline && !this.idleTimeline.isActive()) {
      // Re-acquire elements for idle
      this.idleElements.forEach(element => {
        this.elementRegistry.acquire(element, 'idle', this.idleTimeline!, true);
      });

      this.idleTimeline.resume();
      if (this.config.enableLogging) {
        console.log('[AnimationController] Resumed idle animation and re-acquired elements');
      }
    }
  }

  /**
   * Kill idle animation
   */
  killIdle(): void {
    if (this.idleTimeline) {
      this.idleTimeline.kill();
      this.elementRegistry.releaseByOwner('idle');
      this.idleTimeline = null;
      this.isIdleActive = false;
      if (this.config.enableLogging) {
        console.log('[AnimationController] Killed idle animation');
      }
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
        this.elementRegistry.releaseByOwner(id);
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

    // Acquire elements (force=true since we just killed previous owner)
    const animationId = `emotion-${emotion}-${Date.now()}`;
    let acquiredAll = true;
    elements.forEach(element => {
      if (!this.elementRegistry.acquire(element, animationId, timeline, true)) {
        acquiredAll = false;
      }
    });

    if (!acquiredAll && this.config.enableLogging) {
      console.warn(`[AnimationController] Some elements could not be acquired for ${emotion}`);
    }

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

    // CRITICAL: Clear any existing callbacks from timeline creation to prevent duplicates
    timeline.eventCallback('onStart', null);
    timeline.eventCallback('onComplete', null);
    timeline.eventCallback('onInterrupt', null);

    // Setup callbacks
    const animationStartTime = Date.now();

    timeline.eventCallback('onStart', () => {
      if (this.config.enableLogging) {
        console.log(`[AnimationController] Emotion ${emotion} motion START`);
      }

      // Notify that GSAP motion has actually started
      this.callbacks.onEmotionMotionStart?.(emotion, animationId);
    });

    timeline.eventCallback('onComplete', () => {
      const duration = Date.now() - animationStartTime;

      if (this.config.enableLogging) {
        console.log(`[AnimationController] Emotion ${emotion} completed (${duration}ms)`);
      }

      // Cleanup
      this.activeTimelines.delete(animationId);
      this.elementRegistry.releaseByOwner(animationId);

      // Return to idle (force transition to bypass priority check)
      this.stateMachine.transition(AnimationState.IDLE, true);
      this.resumeIdle();

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

      // Cleanup
      this.activeTimelines.delete(animationId);
      this.elementRegistry.releaseByOwner(animationId);

      this.callbacks.onInterrupt?.(AnimationState.EMOTION, emotion);
    });

    this.callbacks.onStart?.(AnimationState.EMOTION, emotion);

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

    // Acquire elements
    const animationId = `${state}-${emotion || 'none'}-${Date.now()}`;
    elements.forEach(element => {
      this.elementRegistry.acquire(element, animationId, timeline, force);
    });

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
      this.elementRegistry.releaseByOwner(animationId);

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

    // Release all elements
    this.elementRegistry.releaseAll();

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
    elements: ReturnType<ElementRegistry['getDebugInfo']>;
    activeTimelines: number;
    queueSize: number;
    isIdleActive: boolean;
    currentEmotion: EmotionType | null;
  } {
    return {
      state: this.stateMachine.getDebugInfo(),
      elements: this.elementRegistry.getDebugInfo(),
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
