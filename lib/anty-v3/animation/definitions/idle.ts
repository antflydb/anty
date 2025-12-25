/**
 * Idle Animation Definitions
 * Pure functions that create GSAP timelines for idle/breathing animations
 *
 * Includes built-in periodic blinking scheduler for natural secondary motion
 */

import gsap from 'gsap';
import { idleAnimationConfig } from '../../gsap-configs';
import { createEyeAnimation, createBlinkAnimation, createDoubleBlinkAnimation, type EyeAnimationElements } from './eye-animations';

export interface IdleAnimationElements {
  character: HTMLElement;
  shadow: HTMLElement;
  // Eye elements for morphing
  eyeLeft?: HTMLElement;
  eyeRight?: HTMLElement;
  eyeLeftPath?: SVGPathElement;
  eyeRightPath?: SVGPathElement;
  eyeLeftSvg?: SVGSVGElement;
  eyeRightSvg?: SVGSVGElement;
}

export interface IdleAnimationOptions {
  /** Delay before starting animation (seconds) */
  delay?: number;
}

/**
 * Creates the idle breathing animation timeline
 *
 * Coordinates three synchronized animations:
 * 1. Vertical floating (up/down motion)
 * 2. Gentle rotation (synchronized with float)
 * 3. Breathing scale (subtle size changes)
 * 4. **NEW:** Periodic blinking (5-12 second intervals, 20% chance of double blink)
 *
 * Shadow inversely follows character movement (shrinks when character floats up)
 *
 * @param elements - Character and shadow DOM elements (plus optional eye elements for blinking)
 * @param options - Optional delay configuration
 * @returns GSAP timeline with infinite repeat + blink scheduler cleanup function
 */
export function createIdleAnimation(
  elements: IdleAnimationElements,
  options: IdleAnimationOptions = {}
): gsap.core.Timeline {
  const { character, shadow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
  const { delay = 0.2 } = options;

  const { float, rotation, breathe } = idleAnimationConfig;

  // Create coordinated timeline with infinite repeat
  const timeline = gsap.timeline({
    repeat: -1,
    yoyo: true,
    delay,
  });

  // Reset character to base state immediately (important when coming from super mode)
  gsap.set(character, {
    scale: 1,
    rotation: 0,
    y: 0,
  });

  // Set eyes to IDLE shape immediately (not animated, to avoid yoyo oscillation)
  if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
    const idleShape = 'IDLE';
    const idlePath = require('./eye-shapes').EYE_SHAPES[idleShape];
    const idleDimensions = require('./eye-shapes').EYE_DIMENSIONS[idleShape];

    // Use gsap.set() to immediately set eyes to IDLE without animation
    gsap.set([eyeLeftPath, eyeRightPath], {
      attr: { d: idlePath },
    });

    // Set ONLY viewBox - no width/height properties
    // Container stays fixed at 18.63×44.52px via CSS
    gsap.set([eyeLeftSvg, eyeRightSvg], {
      attr: { viewBox: idleDimensions.viewBox },
    });

    // Reset eye transforms
    gsap.set([eyeLeft, eyeRight], {
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      x: 0,
      y: 0,
    });

    // REMOVED: width/height properties - containers stay fixed at CSS defaults
  }

  // Character floats up with rotation and breathing
  timeline.to(
    character,
    {
      y: -float.amplitude, // Float up by amplitude (12px)
      rotation: rotation.degrees, // Gentle rotation (2°)
      scale: breathe.scaleMax, // Subtle breathing (1.02)
      duration: float.duration, // Smooth timing (2.5s)
      ease: float.ease, // Sine easing for smoothness
    },
    0 // Start at timeline beginning
  );

  // Shadow inversely follows character
  // - Stays fixed on ground (no Y movement)
  // - Only opacity and scale change
  // - Shrinks and fades when character floats up
  timeline.to(
    shadow,
    {
      xPercent: -50, // Keep centered (static positioning)
      scaleX: 0.7, // Shrink horizontally when character is up
      scaleY: 0.55, // Shrink vertically when character is up
      opacity: 0.2, // Fade when character is far
      duration: float.duration,
      ease: float.ease,
    },
    0 // Synchronized with character movement
  );

  // ===========================
  // Built-in Blink Scheduler
  // ===========================
  // Add periodic blinking to idle animation for natural secondary motion
  // Only runs if eye elements are provided
  if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
    let blinkSchedulerActive = true;
    const blinkDelayedCalls: gsap.core.Tween[] = [];

    const scheduleNextBlink = () => {
      if (!blinkSchedulerActive) return;

      const delay = gsap.utils.random(5, 12); // 5-12 seconds between blinks

      const delayedCall = gsap.delayedCall(delay, () => {
        if (!blinkSchedulerActive) return;

        // 20% chance of double blink, 80% single blink
        const isDoubleBlink = Math.random() < 0.2;

        const eyeElements: EyeAnimationElements = {
          leftEye: eyeLeft,
          rightEye: eyeRight,
          leftEyePath: eyeLeftPath,
          rightEyePath: eyeRightPath,
          leftEyeSvg: eyeLeftSvg,
          rightEyeSvg: eyeRightSvg,
        };

        const blinkTl = isDoubleBlink
          ? createDoubleBlinkAnimation(eyeElements)
          : createBlinkAnimation(eyeElements);

        blinkTl.play();

        // Schedule next blink
        scheduleNextBlink();
      });

      blinkDelayedCalls.push(delayedCall);
    };

    // Start the blink scheduler
    scheduleNextBlink();

    // Cleanup: Kill blink scheduler when idle timeline is killed
    timeline.eventCallback('onComplete', () => {
      blinkSchedulerActive = false;
      blinkDelayedCalls.forEach(call => call.kill());
      blinkDelayedCalls.length = 0;
    });

    // Also cleanup on kill (for manual timeline.kill())
    const originalKill = timeline.kill.bind(timeline);
    timeline.kill = function() {
      blinkSchedulerActive = false;
      blinkDelayedCalls.forEach(call => call.kill());
      blinkDelayedCalls.length = 0;
      return originalKill();
    } as any;
  }

  return timeline;
}
