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
import { createIdleAnimation } from './definitions/idle';
import { createEyeAnimation } from './definitions/eye-animations';
import { interpretEmotionConfig } from './definitions/emotion-interpreter';
import { EMOTION_CONFIGS } from './definitions/emotions';
import { initializeCharacter } from './initialize';
import { createWakeUpAnimation, createPowerOffAnimation } from './definitions/transitions';
import { createShadowTracker, type ShadowTrackerControls } from './shadow';
import { createGlowSystem, type GlowSystemControls } from './glow-system';

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
  /** Glow effect (deprecated - use outerGlow) */
  glow?: HTMLElement | null;
  /** Search bar */
  searchBar?: HTMLElement | null;
  /** Inner glow element */
  innerGlow?: HTMLElement | null;
  /** Outer glow element */
  outerGlow?: HTMLElement | null;
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
  /** Check if idle is active (started but may be paused) */
  isIdle: () => boolean;
  /** Check if idle is actively playing (not paused) */
  isIdlePlaying: () => boolean;
  /** Get debug information */
  getDebugInfo: () => ReturnType<AnimationController['getDebugInfo']>;
  /** Set super mode scale (null to exit super mode) */
  setSuperMode: (scale: number | null) => void;
  /** Check if controller is ready */
  isReady: boolean;
  /** Show glows (for search exit) */
  showGlows: (fadeIn?: boolean) => void;
  /** Hide glows (for search enter) */
  hideGlows: () => void;
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

  // Shadow tracker - dynamically updates shadow based on character Y position
  const shadowTrackerRef = useRef<ShadowTrackerControls | null>(null);

  // Glow system - physics-based glow tracking with snake-like oscillation
  const glowSystemRef = useRef<GlowSystemControls | null>(null);

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
        // Eye-only actions (look-left, look-right) are secondary animations like blinks
        // They shouldn't trigger position tracking or verbose logging
        const isEyeOnlyAction = emotion === 'look-left' || emotion === 'look-right';

        if (enableLogging && !isEyeOnlyAction) {
          console.log(`[useAnimationController] Emotion motion START: ${emotion}`);
        }
        // Only notify position tracker for body-moving animations
        if (!isEyeOnlyAction) {
          onAnimationSequenceChange?.(`MOTION_START:${emotion.toUpperCase()}`);
        }
        callbacks.onEmotionMotionStart?.(emotion, timelineId);
      },
      onEmotionMotionComplete: (emotion, timelineId, duration) => {
        // Eye-only actions (look-left, look-right) are secondary animations like blinks
        // They shouldn't trigger position tracking or verbose logging
        const isEyeOnlyAction = emotion === 'look-left' || emotion === 'look-right';

        if (enableLogging && !isEyeOnlyAction) {
          console.log(`[useAnimationController] Emotion motion COMPLETE: ${emotion} (${duration}ms)`);
        }
        // Only notify position tracker for body-moving animations
        if (!isEyeOnlyAction) {
          onAnimationSequenceChange?.(`MOTION_COMPLETE:${emotion.toUpperCase()}:${duration}`);
        }

        // Call BOTH the callback from options AND any parent callback
        callbacks.onEmotionMotionComplete?.(emotion, timelineId, duration);

        // Reset to IDLE after a brief delay (allows position tracker to capture MOTION_COMPLETE)
        // Skip delay for eye-only actions since there's no position tracking
        if (!isEyeOnlyAction) {
          setTimeout(() => {
            onAnimationSequenceChange?.('CONTROLLER: Idle animation');
          }, 100);
        }
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
      // Stop shadow tracker
      shadowTrackerRef.current?.stop();
      shadowTrackerRef.current = null;
      // Stop glow system
      glowSystemRef.current?.stop();
      glowSystemRef.current = null;
      // Controller.destroy() kills all timelines including idle
      controllerRef.current?.destroy();
      controllerRef.current = null;
      isInitialized.current = false;
      isReady.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          innerGlow: elements.innerGlow || null,
          outerGlow: elements.outerGlow || null,
          leftBody: elements.leftBody,
          rightBody: elements.rightBody,
        },
        { isOff }
      );

      // Create shadow tracker - dynamically updates shadow based on character Y position
      // This replaces all the disjointed shadow animations in idle, emotions, etc.
      if (elements.shadow && !shadowTrackerRef.current) {
        shadowTrackerRef.current = createShadowTracker(
          elements.character,
          elements.shadow
        );
        // Start immediately (will track character Y at 60fps)
        // Don't start if in OFF mode - wake-up transition handles shadow
        if (!isOff) {
          shadowTrackerRef.current.start();
        }
        if (enableLogging) {
          console.log('[useAnimationController] Shadow tracker created and started');
        }
      }

      // Create glow system - physics-based tracking with snake-like oscillation
      // This replaces all the disjointed glow animations scattered throughout
      if (elements.innerGlow && elements.outerGlow && !glowSystemRef.current) {
        glowSystemRef.current = createGlowSystem(
          elements.character,
          elements.outerGlow,
          elements.innerGlow
        );
        // Start immediately (will track character position at 60fps)
        // Don't start if in OFF mode - wake-up transition handles glow fade-in
        if (!isOff) {
          glowSystemRef.current.start();
          glowSystemRef.current.show();
        } else {
          glowSystemRef.current.hide();
        }
        if (enableLogging) {
          console.log('[useAnimationController] Glow system created and started');
        }
      }
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
      if (elements.character && elements.shadow) {
        // Create and play wake-up timeline with CORRECT signature (expects object)
        const wakeUpTl = createWakeUpAnimation({
          character: elements.character,
          shadow: elements.shadow,
          innerGlow: elements.innerGlow || undefined,
          outerGlow: elements.outerGlow || undefined,
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
          if (autoStartIdle && elements.character && elements.shadow && controllerRef.current) {
            const baseScale = controllerRef.current.getSuperModeScale() ?? 1;
            const idleResult = createIdleAnimation(
              {
                character: elements.character,
                shadow: elements.shadow,
                eyeLeft: elements.eyeLeft || undefined,
                eyeRight: elements.eyeRight || undefined,
                eyeLeftPath: elements.eyeLeftPath || undefined,
                eyeRightPath: elements.eyeRightPath || undefined,
                eyeLeftSvg: elements.eyeLeftSvg || undefined,
                eyeRightSvg: elements.eyeRightSvg || undefined,
              },
              { delay: 0, baseScale }
            );

            // Register with controller - controller owns idle and blink scheduler
            const idleElements = [elements.character, elements.shadow].filter(Boolean) as Element[];
            controllerRef.current.startIdle(idleResult.timeline, idleElements, {
              pauseBlinks: idleResult.pauseBlinks,
              resumeBlinks: idleResult.resumeBlinks,
              killBlinks: idleResult.killBlinks,
            });

            // Notify debug overlay
            onAnimationSequenceChange?.('CONTROLLER: Idle animation');
          }

          // Start shadow tracker after wake-up (shadow fade-in is handled by wake-up animation)
          if (shadowTrackerRef.current) {
            shadowTrackerRef.current.start();
            if (enableLogging) {
              console.log('[useAnimationController] Shadow tracker started after wake-up');
            }
          }

          // Start glow system and fade in after wake-up
          if (glowSystemRef.current) {
            glowSystemRef.current.snapToCharacter(); // Reset spring positions
            glowSystemRef.current.start();
            glowSystemRef.current.fadeIn(0.6); // Match wake-up timing
            if (enableLogging) {
              console.log('[useAnimationController] Glow system started after wake-up');
            }
          }
        });

        wakeUpTl.play();
      } else {
        console.error('[useAnimationController] Wake-up failed - missing elements', {
          hasCharacter: !!elements.character,
          hasShadow: !!elements.shadow
        });
      }
    }

    // Power-off sequence (ON → OFF)
    if (!wasOff && isNowOff) {
      if (enableLogging) {
        console.log('[useAnimationController] Power-off sequence: ON → OFF - CALLING POWER-OFF ANIMATION');
      }

      // Stop shadow tracker - power-off animation handles its own shadow fade
      if (shadowTrackerRef.current) {
        shadowTrackerRef.current.stop();
        if (enableLogging) {
          console.log('[useAnimationController] Shadow tracker stopped for power-off');
        }
      }

      // Fade out and stop glow system for power-off (gradual like shadow)
      if (glowSystemRef.current) {
        glowSystemRef.current.fadeOut(0.7); // Slower fade out
        // Stop after fade completes
        setTimeout(() => {
          glowSystemRef.current?.stop();
        }, 700);
        if (enableLogging) {
          console.log('[useAnimationController] Glow system fading out for power-off');
        }
      }

      // Notify debug overlay
      onAnimationSequenceChange?.('CONTROLLER: Power-off (ON → OFF)');

      // Kill all animations via controller (single source of truth)
      controllerRef.current.killAll();

      // CRITICAL FIX: Actually call the power-off animation!
      if (elements.character && elements.shadow) {
        // Create and play power-off timeline
        const powerOffTl = createPowerOffAnimation({
          character: elements.character,
          shadow: elements.shadow,
          innerGlow: elements.innerGlow || undefined,
          outerGlow: elements.outerGlow || undefined,
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
          hasShadow: !!elements.shadow
        });
      }
    }
    // Only re-run when isOff changes - other deps are stable or captured in refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Pause shadow tracker - shadow is hidden during search
      if (shadowTrackerRef.current) {
        shadowTrackerRef.current.pause();
      }

      // Pause and hide glow system during search
      if (glowSystemRef.current) {
        glowSystemRef.current.pause();
        glowSystemRef.current.hide(); // Instant hide for search mode
      }
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

        // NOTE: Glow show is now triggered from page.tsx via showGlows() for earlier timing

        restoreTl.eventCallback('onComplete', () => {
          controllerRef.current?.resumeIdle();
          // Resume shadow tracker after exiting search
          if (shadowTrackerRef.current) {
            shadowTrackerRef.current.resume();
          }
        });

        restoreTl.play();
      } else {
        // Fallback if eye elements are not available
        controllerRef.current.resumeIdle();
        // Resume shadow tracker
        if (shadowTrackerRef.current) {
          shadowTrackerRef.current.resume();
        }
        // NOTE: Glow show is now triggered from page.tsx via showGlows()
      }
    }
    // Only re-run when searchMode changes - eye elements are stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const baseScale = controllerRef.current.getSuperModeScale() ?? 1;
    const idleResult = createIdleAnimation(
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
      { delay: 0, baseScale }
    );

    // Register idle with controller - controller owns idle and blink scheduler
    const idleElements = Array.from(new Set([
      elements.character,
      elements.shadow,
    ].filter(Boolean))) as Element[];

    controllerRef.current.startIdle(idleResult.timeline, idleElements, {
      pauseBlinks: idleResult.pauseBlinks,
      resumeBlinks: idleResult.resumeBlinks,
      killBlinks: idleResult.killBlinks,
    });
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

      // Get emotion config from declarative system
      const emotionConfig = EMOTION_CONFIGS[emotion];
      if (!emotionConfig) {
        console.error(`[useAnimationController] Unknown emotion: ${emotion}`);
        return false;
      }

      if (enableLogging) {
        console.log(`[useAnimationController] Playing emotion: ${emotion}`);
      }

      // CLEANUP: Kill any existing eye tweens for clean handoff on interruption
      const eyeElements = [
        elements.eyeLeft,
        elements.eyeRight,
        elements.eyeLeftPath,
        elements.eyeRightPath,
        elements.eyeLeftSvg,
        elements.eyeRightSvg,
      ].filter(Boolean);
      if (eyeElements.length > 0) {
        gsap.killTweensOf(eyeElements);
      }

      // CLEANUP: Reset character transforms to baseline on interruption
      // Preserves super mode scale if active
      const superModeScale = controllerRef.current.getSuperModeScale();
      gsap.set(elements.character!, {
        rotation: 0,
        rotationY: 0,
        rotationX: 0,
        transformPerspective: 0,
        x: 0,
        y: 0,
        scale: superModeScale ?? 1,
      });

      const tl = interpretEmotionConfig(emotionConfig, {
        character: elements.character!,
        eyeLeft: elements.eyeLeft,
        eyeRight: elements.eyeRight,
        eyeLeftPath: elements.eyeLeftPath,
        eyeRightPath: elements.eyeRightPath,
        eyeLeftSvg: elements.eyeLeftSvg,
        eyeRightSvg: elements.eyeRightSvg,
        innerGlow: elements.innerGlow,
        outerGlow: elements.outerGlow,
        leftBody: elements.leftBody,
        rightBody: elements.rightBody,
      });

      // Collect elements for this emotion (deduplicate to avoid double acquisition)
      const emotionElements = Array.from(new Set([
        elements.character,
        elements.eyeLeft,
        elements.eyeRight,
      ].filter(Boolean))) as Element[];

      // Pass resetIdle flag from emotion config (default: true for clean idle restart)
      const optionsWithResetIdle = {
        ...animationOptions,
        resetIdle: emotionConfig.resetIdle,
      };

      return controllerRef.current.playEmotion(emotion, tl, emotionElements, optionsWithResetIdle);
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
    const baseScale = controllerRef.current.getSuperModeScale() ?? 1;
    const idleResult = createIdleAnimation(
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
      { delay: 0, baseScale }
    );

    // Register with controller - controller owns idle and blink scheduler
    const idleElements = [
      elements.character,
      elements.shadow,
    ].filter(Boolean) as Element[];

    controllerRef.current.startIdle(idleResult.timeline, idleElements, {
      pauseBlinks: idleResult.pauseBlinks,
      resumeBlinks: idleResult.resumeBlinks,
      killBlinks: idleResult.killBlinks,
    });
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
   * Check if idle is active (started but may be paused)
   */
  const isIdleActive = useCallback((): boolean => {
    if (!controllerRef.current) {
      return false;
    }
    return controllerRef.current.isIdle();
  }, []);

  /**
   * Check if idle is actively playing (not paused)
   */
  const isIdlePlaying = useCallback((): boolean => {
    if (!controllerRef.current) {
      return false;
    }
    return controllerRef.current.isIdlePlaying();
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

  /**
   * Set super mode scale (preserves scale during emotions)
   * @param scale - Scale value (e.g., 1.45) or null to disable
   */
  const setSuperMode = useCallback((scale: number | null) => {
    if (!controllerRef.current) return;

    if (enableLogging) {
      console.log(`[useAnimationController] Setting super mode scale: ${scale}`);
    }

    controllerRef.current.setSuperMode(scale);
  }, [enableLogging]);

  /**
   * Show glows (for search exit - call early in morph animation)
   */
  const showGlows = useCallback((fadeIn = true) => {
    if (!glowSystemRef.current) return;
    glowSystemRef.current.resume();
    if (fadeIn) {
      glowSystemRef.current.fadeIn(0.3);
    } else {
      glowSystemRef.current.show();
    }
  }, []);

  /**
   * Hide glows (for search enter)
   */
  const hideGlows = useCallback(() => {
    if (!glowSystemRef.current) return;
    glowSystemRef.current.pause();
    glowSystemRef.current.hide();
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
    isIdlePlaying,
    getDebugInfo,
    setSuperMode,
    showGlows,
    hideGlows,
    isReady: isReady.current,
  }), [playEmotion, transitionTo, startIdle, pause, resume, killAll, getState, getEmotion, isIdleActive, isIdlePlaying, getDebugInfo, setSuperMode, showGlows, hideGlows]);
}
