/**
 * React Hook for Animation Controller
 *
 * Provides a clean React API for the AnimationController.
 * Manages lifecycle, initialization, and state synchronization.
 */

import { useRef, useEffect, useCallback } from 'react';
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
  /** Left antenna */
  antennaLeft?: HTMLElement | null;
  /** Right antenna */
  antennaRight?: HTMLElement | null;
  /** Glow effect */
  glow?: HTMLElement | null;
  /** Search bar */
  searchBar?: HTMLElement | null;
  /** Custom elements */
  [key: string]: HTMLElement | null | undefined;
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

  // Idle timeline reference
  const idleTimelineRef = useRef<gsap.core.Timeline | null>(null);

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
      if (idleTimelineRef.current) {
        idleTimelineRef.current.kill();
        idleTimelineRef.current = null;
      }
      controllerRef.current?.destroy();
      controllerRef.current = null;
      isInitialized.current = false;
      isReady.current = false;
    };
  }, []); // Empty deps - only initialize once

  /**
   * Check if elements are available
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
  }, [elements, enableLogging]);

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

      // Kill any existing animations
      if (idleTimelineRef.current) {
        idleTimelineRef.current.kill();
        idleTimelineRef.current = null;
      }
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
        });

        // Start idle when wake-up completes
        wakeUpTl.eventCallback('onComplete', () => {
          if (enableLogging) {
            console.log('[useAnimationController] Wake-up complete, manually starting idle');
          }

          // MANUALLY create idle timeline (controller.startIdle has wrong signature)
          // Add 0.65s delay to match legacy system
          if (autoStartIdle && elements.character && shadow) {
            const idleTl = gsap.timeline({
              repeat: -1,
              yoyo: true,
              delay: 0.65 // Match legacy system delay after wake-up
            });

            // Get config values
            const { float, rotation, breathe } = idleAnimationConfig;

            // Character floats up
            idleTl.to(elements.character, {
              y: -float.amplitude,
              rotation: rotation.degrees,
              scale: breathe.scaleMax,
              duration: float.duration,
              ease: float.ease,
            }, 0);

            // Shadow shrinks (inverse relationship)
            idleTl.to(shadow, {
              xPercent: -50,
              scaleX: 0.7,
              scaleY: 0.55,
              opacity: 0.2,
              duration: float.duration,
              ease: float.ease,
            }, 0);

            idleTimelineRef.current = idleTl;

            if (enableLogging) {
              console.log('[useAnimationController] Idle animation started with 0.65s delay');
            }

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

      // Kill all animations
      if (idleTimelineRef.current) {
        idleTimelineRef.current.kill();
        idleTimelineRef.current = null;
      }
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
        console.log('[useAnimationController] Exiting search mode - resuming idle');
      }

      // Resume idle animation
      controllerRef.current.resumeIdle();
    }
  }, [searchMode, enableLogging]);

  /**
   * Auto-start idle animation when ready
   */
  useEffect(() => {
    if (!autoStartIdle || !isReady.current || !controllerRef.current) return;
    if (isOff || searchMode) return;
    if (idleTimelineRef.current) return; // Already started

    if (enableLogging) {
      console.log('[useAnimationController] Auto-starting idle animation');
    }

    // Create idle timeline
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    // Get config values
    const { float, rotation, breathe } = idleAnimationConfig;

    // Add basic idle animations if elements are available
    if (elements.character) {
      tl.to(elements.character, {
        y: -float.amplitude,
        rotation: rotation.degrees,
        scale: breathe.scaleMax,
        duration: float.duration,
        ease: float.ease,
      }, 0);
    }

    if (elements.shadow) {
      tl.to(elements.shadow, {
        xPercent: -50,
        scaleX: 0.7,
        scaleY: 0.55,
        opacity: 0.2,
        duration: float.duration,
        ease: float.ease,
      }, 0);
    }

    // Register idle with controller
    const idleElements = [
      elements.character,
      elements.shadow,
    ].filter(Boolean) as Element[];

    controllerRef.current.startIdle(tl, idleElements);
    idleTimelineRef.current = tl;
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

      // Create timeline for emotion
      const tl = gsap.timeline();

      // Collect elements for this emotion
      const emotionElements = [
        elements.character,
        elements.eyeLeft,
        elements.eyeRight,
      ].filter(Boolean) as Element[];

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

    // Kill existing idle
    if (idleTimelineRef.current) {
      idleTimelineRef.current.kill();
      idleTimelineRef.current = null;
    }

    // Create new idle timeline
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    // Get config values
    const { float, rotation, breathe } = idleAnimationConfig;

    // Add basic idle animations
    if (elements.character) {
      tl.to(elements.character, {
        y: -float.amplitude,
        rotation: rotation.degrees,
        scale: breathe.scaleMax,
        duration: float.duration,
        ease: float.ease,
      }, 0);
    }

    if (elements.shadow) {
      tl.to(elements.shadow, {
        xPercent: -50,
        scaleX: 0.7,
        scaleY: 0.55,
        opacity: 0.2,
        duration: float.duration,
        ease: float.ease,
      }, 0);
    }

    // Register with controller
    const idleElements = [
      elements.character,
      elements.shadow,
    ].filter(Boolean) as Element[];

    controllerRef.current.startIdle(tl, idleElements);
    idleTimelineRef.current = tl;
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

    if (idleTimelineRef.current) {
      idleTimelineRef.current.kill();
      idleTimelineRef.current = null;
    }

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

  return {
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
  };
}
