/**
 * React Hook for Animation Controller
 *
 * Provides a clean React API for the AnimationController.
 * Manages lifecycle, initialization, and state synchronization.
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { AnimationController } from './controller';
import {
  AnimationState,
  type EmotionType,
  type AnimationCallbacks,
  type ControllerConfig,
  type AnimationOptions,
  isEmotionType,
} from './types';
import { idleAnimationConfig } from '../gsap-configs';
import { createIdleAnimation } from './definitions/idle';
import { createEyeAnimation } from './definitions/eye-animations';
import { interpretEmotionConfig } from './definitions/emotion-interpreter';
import { EMOTION_CONFIGS } from './definitions/emotion-configs';
import { initializeCharacter } from './initialize';

/**
 * Elements required by the animation controller
 */
export interface AnimationElements {
  /** Main container */
  container?: HTMLElement | null;
  /** Character wrapper */
  character?: HTMLElement | null;
  /** Shadow element */
  shadow?: HTMLElement | null;
  /** Left eye */
  eyeLeft?: HTMLElement | null;
  /** Right eye */
  eyeRight?: HTMLElement | null;
  /** Left eye SVG path */
  eyeLeftPath?: SVGPathElement | null;
  /** Right eye SVG path */
  eyeRightPath?: SVGPathElement | null;
  /** Left eye SVG container */
  eyeLeftSvg?: SVGSVGElement | null;
  /** Right eye SVG container */
  eyeRightSvg?: SVGSVGElement | null;
  /** Left antenna */
  antennaLeft?: HTMLElement | null;
  /** Right antenna */
  antennaRight?: HTMLElement | null;
  /** Glow effect */
  glow?: HTMLElement | null;
  /** Search bar */
  searchBar?: HTMLElement | null;
  /** Left body */
  leftBody?: HTMLElement | null;
  /** Right body */
  rightBody?: HTMLElement | null;
  /** Custom elements */
  [key: string]: HTMLElement | SVGPathElement | SVGSVGElement | null | undefined;
}

/**
 * Options for the useAnimationController hook
 */
export interface UseAnimationControllerOptions extends ControllerConfig {
  /** Callback when state changes */
  onStateChange?: (from: AnimationState, to: AnimationState) => void;
  /** Callback when animation sequence changes (for debug tracking) */
  onAnimationSequenceChange?: (sequence: string) => void;
  /** Whether character is powered off */
  isOff?: boolean;
  /** Whether in search mode */
  searchMode?: boolean;
  /** Auto-start idle on mount */
  autoStartIdle?: boolean;
}

/**
 * Return type of the hook
 */
export interface UseAnimationControllerReturn {
  /** Play an emotion animation */
  playEmotion: (emotion: EmotionType, options?: AnimationOptions) => boolean;
  /** Transition to a new state */
  transitionTo: (state: AnimationState, options?: AnimationOptions) => boolean;
  /** Start idle animation */
  startIdle: () => void;
  /** Pause all animations */
  pause: () => void;
  /** Resume animations */
  resume: () => void;
  /** Kill all animations */
  killAll: () => void;
  /** Get current state */
  getState: () => AnimationState;
  /** Get current emotion */
  getEmotion: () => EmotionType | null;
  /** Check if idle is active */
  isIdle: () => boolean;
  /** Get debug information */
  getDebugInfo: () => ReturnType<AnimationController['getDebugInfo']>;
  /** Check if controller is ready */
  isReady: boolean;
}

/**
 * React hook that wraps AnimationController
 *
 * @param elements - DOM elements to animate
 * @param options - Controller configuration and callbacks
 * @returns Animation control methods
 *
 * @example
 * ```tsx
 * const {
 *   playEmotion,
 *   startIdle,
 *   getState,
 *   isReady
 * } = useAnimationController(
 *   {
 *     container: containerRef.current,
 *     character: characterRef.current,
 *     eyeLeft: leftEyeRef.current,
 *     eyeRight: rightEyeRef.current,
 *   },
 *   {
 *     enableLogging: true,
 *     isOff: false,
 *     searchMode: false,
 *   }
 * );
 *
 * // Play an emotion
 * playEmotion('happy', { priority: 3 });
 *
 * // Start idle
 * startIdle();
 * ```
 */
export function useAnimationController(
  elements: AnimationElements,
  options: UseAnimationControllerOptions = {}
): UseAnimationControllerReturn {
  const {
    enableLogging = false,
    enableQueue = true,
    maxQueueSize = 10,
    defaultPriority = 2,
    callbacks = {},
    onStateChange,
    onAnimationSequenceChange,
    isOff = false,
    searchMode = false,
    autoStartIdle = true,
  } = options;

  // Controller instance (persistent across renders)
  const controllerRef = useRef<AnimationController | null>(null);

  // Track initialization state
  const isInitialized = useRef(false);
  const isReady = useRef(false);

  // Track previous states for change detection
  const previousIsOffRef = useRef(isOff);
  const previousSearchModeRef = useRef(searchMode);

  // NOTE: idleTimelineRef REMOVED - controller is single owner of idle
  // The controller manages idle internally, hook just calls controller methods

  /**
   * Initialize controller
   */
  useEffect(() => {
    if (isInitialized.current) return;

    if (enableLogging) {
      console.log('[useAnimationController] Initializing controller');
    }

    // Merge callbacks with state change handler
    const mergedCallbacks: AnimationCallbacks = {
      ...callbacks,
      onStateChange: (from, to) => {
        callbacks.onStateChange?.(from, to);
        onStateChange?.(from, to);
      },
      onEmotionMotionStart: (emotion, timelineId) => {
        if (enableLogging) {
          console.log(`[useAnimationController] Emotion motion START: ${emotion}`);
        }
        // Notify position tracker via special sequence message
        onAnimationSequenceChange?.(`MOTION_START:${emotion.toUpperCase()}`);
        callbacks.onEmotionMotionStart?.(emotion, timelineId);
      },
      onEmotionMotionComplete: (emotion, timelineId, duration) => {
        if (enableLogging) {
          console.log(`[useAnimationController] Emotion motion COMPLETE: ${emotion} (${duration}ms)`);
        }
        // Notify position tracker that motion actually completed
        onAnimationSequenceChange?.(`MOTION_COMPLETE:${emotion.toUpperCase()}:${duration}`);

        // Call BOTH the callback from options AND any parent callback
        callbacks.onEmotionMotionComplete?.(emotion, timelineId, duration);

        // Reset to IDLE after a brief delay (allows position tracker to capture MOTION_COMPLETE)
        setTimeout(() => {
          onAnimationSequenceChange?.('CONTROLLER: Idle animation');
        }, 100);
      },
    };

    // Create controller
    controllerRef.current = new AnimationController(mergedCallbacks, {
      enableLogging,
      enableQueue,
      maxQueueSize,
      defaultPriority,
    });

    isInitialized.current = true;

    if (enableLogging) {
      console.log('[useAnimationController] Controller initialized');
    }

    // Cleanup on unmount
    return () => {
      if (enableLogging) {
        console.log('[useAnimationController] Cleaning up controller');
      }
      // Controller.destroy() kills all timelines including idle
      controllerRef.current?.destroy();
      controllerRef.current = null;
      isInitialized.current = false;
      isReady.current = false;
    };
  }, []); // Empty deps - only initialize once

  /**
   * Check if elements are available and initialize character
   */
  useEffect(() => {
    const hasRequiredElements =
      elements.container !== null &&
      elements.container !== undefined &&
      elements.character !== null &&
      elements.character !== undefined;

    const wasReady = isReady.current;
    isReady.current = hasRequiredElements;

    if (enableLogging && wasReady !== isReady.current) {
      console.log('[useAnimationController] Ready state changed:', isReady.current);
    }

    // Initialize character when elements become ready
    if (hasRequiredElements && !wasReady && elements.character) {
      if (enableLogging) {
        console.log('[useAnimationController] Calling initializeCharacter()');
      }

      // Get glow elements for initialization
      const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
      const glowElements = document.querySelectorAll('[class*="glow"]');
      const outerGlow = Array.from(glowElements).find(el => !el.classList.contains('inner-glow')) as HTMLElement;

      initializeCharacter(
        {
          character: elements.character,
          shadow: elements.shadow || null,
          eyeLeft: elements.eyeLeft,
          eyeRight: elements.eyeRight,
          eyeLeftPath: elements.eyeLeftPath,
          eyeRightPath: elements.eyeRightPath,
          eyeLeftSvg: elements.eyeLeftSvg,
          eyeRightSvg: elements.eyeRightSvg,
          innerGlow: innerGlow,
          outerGlow: outerGlow,
          leftBody: elements.leftBody,
          rightBody: elements.rightBody,
        },
        { isOff }
      );
    }
  }, [elements, enableLogging, isOff]);

  /**
   * Handle OFF state changes (wake-up and power-off sequences)
   */
  useEffect(() => {
    if (!controllerRef.current) return;

    const wasOff = previousIsOffRef.current;
    const isNowOff = isOff;
    previousIsOffRef.current = isOff;

    // Wake-up sequence (OFF → ON)
    if (wasOff && !isNowOff) {
      if (enableLogging) {
        console.log('[useAnimationController] Wake-up sequence: OFF → ON - CALLING WAKE-UP ANIMATION');
      }

      // Notify debug overlay
      onAnimationSequenceChange?.('CONTROLLER: Wake-up (OFF → ON)');

      // Kill all animations via controller (single source of truth)
      controllerRef.current.killAll();

      // CRITICAL FIX: Actually call the wake-up animation!
      const shadow = document.getElementById('anty-shadow');
      if (elements.character && shadow) {
        // Get glow elements
        const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
        const glowElements = document.querySelectorAll('[class*="glow"]');
        const outerGlow = Array.from(glowElements).find(el => !el.classList.contains('inner-glow')) as HTMLElement;

        // Import the wake-up animation function
        const { createWakeUpAnimation } = require('@/lib/anty-v3/animation/definitions/transitions');

        // Create and play wake-up timeline with CORRECT signature (expects object)
        const wakeUpTl = createWakeUpAnimation({
          character: elements.character,
          shadow: shadow,
          innerGlow: innerGlow,
          outerGlow: outerGlow,
          // Pass eye elements
          eyeLeft: elements.eyeLeft || undefined,
          eyeRight: elements.eyeRight || undefined,
          eyeLeftPath: elements.eyeLeftPath || undefined,
          eyeRightPath: elements.eyeRightPath || undefined,
          eyeLeftSvg: elements.eyeLeftSvg || undefined,
          eyeRightSvg: elements.eyeRightSvg || undefined,
        });

        // Start idle when wake-up completes - use controller's startIdle
        wakeUpTl.eventCallback('onComplete', () => {
          if (enableLogging) {
            console.log('[useAnimationController] Wake-up complete, starting idle via controller');
          }

          // Create idle timeline and register with controller
          if (autoStartIdle && elements.character && shadow && controllerRef.current) {
            const idleTl = createIdleAnimation(
              {
                character: elements.character,
                shadow: shadow,
                eyeLeft: elements.eyeLeft || undefined,
                eyeRight: elements.eyeRight || undefined,
                eyeLeftPath: elements.eyeLeftPath || undefined,
                eyeRightPath: elements.eyeRightPath || undefined,
                eyeLeftSvg: elements.eyeLeftSvg || undefined,
                eyeRightSvg: elements.eyeRightSvg || undefined,
              },
              { delay: 0 }
            );

            // Register with controller - controller is single owner of idle
            const idleElements = [elements.character, shadow].filter(Boolean) as Element[];
            controllerRef.current.startIdle(idleTl, idleElements);

            // Notify debug overlay
            onAnimationSequenceChange?.('CONTROLLER: Idle animation');
          }
        });

        wakeUpTl.play();
      } else {
        console.error('[useAnimationController] Wake-up failed - missing elements', {
          hasCharacter: !!elements.character,
          hasShadow: !!shadow
        });
      }
    }

    // Power-off sequence (ON → OFF)
    if (!wasOff && isNowOff) {
      if (enableLogging) {
        console.log('[useAnimationController] Power-off sequence: ON → OFF - CALLING POWER-OFF ANIMATION');
      }

      // Notify debug overlay
      onAnimationSequenceChange?.('CONTROLLER: Power-off (ON → OFF)');

      // Kill all animations via controller (single source of truth)
      controllerRef.current.killAll();

      // CRITICAL FIX: Actually call the power-off animation!
      const shadow = document.getElementById('anty-shadow');
      if (elements.character && shadow) {
        // Get glow elements
        const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
        const glowElements = document.querySelectorAll('[class*="glow"]');
        const outerGlow = Array.from(glowElements).find(el => !el.classList.contains('inner-glow')) as HTMLElement;

        // Import the power-off animation function
        const { createPowerOffAnimation } = require('@/lib/anty-v3/animation/definitions/transitions');

        // Create and play power-off timeline
        const powerOffTl = createPowerOffAnimation({
          character: elements.character,
          shadow: shadow,
          innerGlow: innerGlow,
          outerGlow: outerGlow,
          // Pass eye elements
          eyeLeft: elements.eyeLeft || undefined,
          eyeRight: elements.eyeRight || undefined,
          eyeLeftPath: elements.eyeLeftPath || undefined,
          eyeRightPath: elements.eyeRightPath || undefined,
          eyeLeftSvg: elements.eyeLeftSvg || undefined,
          eyeRightSvg: elements.eyeRightSvg || undefined,
        });

        powerOffTl.play();

        if (enableLogging) {
          console.log('[useAnimationController] Power-off animation started');
        }
      } else {
        console.error('[useAnimationController] Power-off failed - missing elements', {
          hasCharacter: !!elements.character,
          hasShadow: !!shadow
        });
      }
    }
  }, [isOff, enableLogging]);

  /**
   * Handle search mode changes
   */
  useEffect(() => {
    if (!controllerRef.current) return;

    const wasSearching = previousSearchModeRef.current;
    const isNowSearching = searchMode;
    previousSearchModeRef.current = searchMode;

    // Entering search mode
    if (!wasSearching && isNowSearching) {
      if (enableLogging) {
        console.log('[useAnimationController] Entering search mode - pausing idle');
      }

      // Pause idle animation
      controllerRef.current.pauseIdle();
    }

    // Exiting search mode
    if (wasSearching && !isNowSearching) {
      if (enableLogging) {
        console.log('[useAnimationController] Exiting search mode - restoring eyes and resuming idle');
      }

      // Restore eyes to IDLE before resuming idle
      if (elements.eyeLeft && elements.eyeRight && elements.eyeLeftPath && elements.eyeRightPath && elements.eyeLeftSvg && elements.eyeRightSvg) {
        // FIXED: Use static import instead of dynamic import for better performance
        const restoreTl = createEyeAnimation(
          {
            leftEye: elements.eyeLeft,
            rightEye: elements.eyeRight,
            leftEyePath: elements.eyeLeftPath,
            rightEyePath: elements.eyeRightPath,
            leftEyeSvg: elements.eyeLeftSvg,
            rightEyeSvg: elements.eyeRightSvg,
          },
          'IDLE',
          { duration: 0.3 }
        );

        restoreTl.eventCallback('onComplete', () => {
          controllerRef.current?.resumeIdle();
        });

        restoreTl.play();
      } else {
        // Fallback if eye elements are not available
        controllerRef.current.resumeIdle();
      }
    }
  }, [searchMode, enableLogging]);

  /**
   * Auto-start idle animation when ready
   */
  useEffect(() => {
    if (!autoStartIdle || !isReady.current || !controllerRef.current) return;
    if (isOff || searchMode) return;
    // Check controller's idle state, not a local ref
    if (controllerRef.current.isIdle()) return; // Already running

    if (enableLogging) {
      console.log('[useAnimationController] Auto-starting idle animation');
    }

    // Create idle timeline using createIdleAnimation with eye elements
    const tl = createIdleAnimation(
      {
        character: elements.character!,
        shadow: elements.shadow!,
        // Pass eye elements
        eyeLeft: elements.eyeLeft || undefined,
        eyeRight: elements.eyeRight || undefined,
        eyeLeftPath: elements.eyeLeftPath || undefined,
        eyeRightPath: elements.eyeRightPath || undefined,
        eyeLeftSvg: elements.eyeLeftSvg || undefined,
        eyeRightSvg: elements.eyeRightSvg || undefined,
      },
      { delay: 0 }
    );

    // Register idle with controller - controller is single owner of idle
    const idleElements = Array.from(new Set([
      elements.character,
      elements.shadow,
    ].filter(Boolean))) as Element[];

    controllerRef.current.startIdle(tl, idleElements);
  }, [autoStartIdle, isOff, searchMode, elements, enableLogging]);

  /**
   * Play emotion animation
   */
  const playEmotion = useCallback(
    (emotion: EmotionType, animationOptions: AnimationOptions = {}): boolean => {
      if (!controllerRef.current) {
        if (enableLogging) {
          console.warn('[useAnimationController] Controller not initialized');
        }
        return false;
      }

      if (!isReady.current) {
        if (enableLogging) {
          console.warn('[useAnimationController] Elements not ready');
        }
        return false;
      }

      // Validate emotion
      if (!isEmotionType(emotion)) {
        console.error(`[useAnimationController] Invalid emotion: ${emotion}`);
        return false;
      }

      if (enableLogging) {
        console.log(`[useAnimationController] Playing emotion: ${emotion}`);
      }

      // Get glow elements
      const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
      const glowElements = document.querySelectorAll('[class*="glow"]');
      const outerGlow = Array.from(glowElements).find(el => !el.classList.contains('inner-glow')) as HTMLElement;

      // Get emotion config from declarative system
      const emotionConfig = EMOTION_CONFIGS[emotion];
      if (!emotionConfig) {
        console.error(`[useAnimationController] Unknown emotion: ${emotion}`);
        return false;
      }

      if (enableLogging) {
        console.log(`[useAnimationController] Playing emotion: ${emotion}`);
      }

      const tl = interpretEmotionConfig(emotionConfig, {
        character: elements.character!,
        eyeLeft: elements.eyeLeft,
        eyeRight: elements.eyeRight,
        eyeLeftPath: elements.eyeLeftPath,
        eyeRightPath: elements.eyeRightPath,
        eyeLeftSvg: elements.eyeLeftSvg,
        eyeRightSvg: elements.eyeRightSvg,
        innerGlow: innerGlow,
        outerGlow: outerGlow,
        leftBody: elements.leftBody,
        rightBody: elements.rightBody,
      });

      // Collect elements for this emotion (deduplicate to avoid double acquisition)
      const emotionElements = Array.from(new Set([
        elements.character,
        elements.eyeLeft,
        elements.eyeRight,
      ].filter(Boolean))) as Element[];

      return controllerRef.current.playEmotion(emotion, tl, emotionElements, animationOptions);
    },
    [elements, enableLogging]
  );

  /**
   * Transition to a new state
   */
  const transitionTo = useCallback(
    (state: AnimationState, animationOptions: AnimationOptions = {}): boolean => {
      if (!controllerRef.current) {
        if (enableLogging) {
          console.warn('[useAnimationController] Controller not initialized');
        }
        return false;
      }

      if (!isReady.current) {
        if (enableLogging) {
          console.warn('[useAnimationController] Elements not ready');
        }
        return false;
      }

      if (enableLogging) {
        console.log(`[useAnimationController] Transitioning to: ${state}`);
      }

      // Create timeline for transition
      const tl = gsap.timeline();

      // Collect elements for transition
      const transitionElements = [
        elements.character,
        elements.container,
      ].filter(Boolean) as Element[];

      return controllerRef.current.transitionTo(state, null, tl, transitionElements, animationOptions);
    },
    [elements, enableLogging]
  );

  /**
   * Start idle animation
   */
  const startIdle = useCallback(() => {
    if (!controllerRef.current) {
      if (enableLogging) {
        console.warn('[useAnimationController] Controller not initialized');
      }
      return;
    }

    if (!isReady.current) {
      if (enableLogging) {
        console.warn('[useAnimationController] Elements not ready');
      }
      return;
    }

    if (enableLogging) {
      console.log('[useAnimationController] Starting idle animation');
    }

    // Controller's startIdle already kills existing idle first
    // Create new idle timeline using createIdleAnimation with eye elements
    const tl = createIdleAnimation(
      {
        character: elements.character!,
        shadow: elements.shadow!,
        // Pass eye elements
        eyeLeft: elements.eyeLeft || undefined,
        eyeRight: elements.eyeRight || undefined,
        eyeLeftPath: elements.eyeLeftPath || undefined,
        eyeRightPath: elements.eyeRightPath || undefined,
        eyeLeftSvg: elements.eyeLeftSvg || undefined,
        eyeRightSvg: elements.eyeRightSvg || undefined,
      },
      { delay: 0 }
    );

    // Register with controller - controller is single owner of idle
    const idleElements = [
      elements.character,
      elements.shadow,
    ].filter(Boolean) as Element[];

    controllerRef.current.startIdle(tl, idleElements);
  }, [elements, enableLogging]);

  /**
   * Pause all animations
   */
  const pause = useCallback(() => {
    if (!controllerRef.current) return;

    if (enableLogging) {
      console.log('[useAnimationController] Pausing animations');
    }

    controllerRef.current.pauseIdle();
  }, [enableLogging]);

  /**
   * Resume animations
   */
  const resume = useCallback(() => {
    if (!controllerRef.current) return;

    if (enableLogging) {
      console.log('[useAnimationController] Resuming animations');
    }

    controllerRef.current.resumeIdle();
  }, [enableLogging]);

  /**
   * Kill all animations
   */
  const killAll = useCallback(() => {
    if (!controllerRef.current) return;

    if (enableLogging) {
      console.log('[useAnimationController] Killing all animations');
    }

    // Controller.killAll() handles killing idle (single source of truth)
    controllerRef.current.killAll();
  }, [enableLogging]);

  /**
   * Get current state
   */
  const getState = useCallback((): AnimationState => {
    if (!controllerRef.current) {
      return AnimationState.IDLE;
    }
    return controllerRef.current.getCurrentState();
  }, []);

  /**
   * Get current emotion
   */
  const getEmotion = useCallback((): EmotionType | null => {
    if (!controllerRef.current) {
      return null;
    }
    return controllerRef.current.getCurrentEmotion();
  }, []);

  /**
   * Check if idle is active
   */
  const isIdleActive = useCallback((): boolean => {
    if (!controllerRef.current) {
      return false;
    }
    return controllerRef.current.isIdle();
  }, []);

  /**
   * Get debug information
   */
  const getDebugInfo = useCallback(() => {
    if (!controllerRef.current) {
      throw new Error('Controller not initialized');
    }
    return controllerRef.current.getDebugInfo();
  }, []);

  // CRITICAL: Memoize return object to prevent useEffect re-firing in consumers
  return useMemo(() => ({
    playEmotion,
    transitionTo,
    startIdle,
    pause,
    resume,
    killAll,
    getState,
    getEmotion,
    isIdle: isIdleActive,
    getDebugInfo,
    isReady: isReady.current,
  }), [playEmotion, transitionTo, startIdle, pause, resume, killAll, getState, getEmotion, isIdleActive, getDebugInfo]);
}
