/**
 * Transition Animation Definitions
 * Pure functions that create GSAP timelines for state transitions (wake-up, power-off)
 */

import gsap from 'gsap';
import { createEyeAnimation } from './eye-animations';
import { getEyeShape } from './eye-shapes';

export interface TransitionAnimationElements {
  character: HTMLElement;
  shadow: HTMLElement;
  innerGlow?: HTMLElement;
  outerGlow?: HTMLElement;
  // Eye elements for morphing
  eyeLeft?: HTMLElement;
  eyeRight?: HTMLElement;
  eyeLeftPath?: SVGPathElement;
  eyeRightPath?: SVGPathElement;
  eyeLeftSvg?: SVGSVGElement;
  eyeRightSvg?: SVGSVGElement;
}

/**
 * Glow lag configuration
 * Glows follow character at 75% distance with 0.05s delay
 */
const GLOW_DISTANCE_RATIO = 0.75;
const GLOW_LAG_SECONDS = 0.05;

/**
 * Creates wake-up animation (OFF → ON transition)
 *
 * TEMPORARILY INSTANT: Just snaps to idle state immediately.
 * The full animation will be rebuilt later.
 *
 * @param elements - Character, shadow, and optional glow elements
 * @returns GSAP timeline for wake-up animation
 */
export function createWakeUpAnimation(
  elements: TransitionAnimationElements
): gsap.core.Timeline {
  const { character, shadow, innerGlow, outerGlow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];

  const timeline = gsap.timeline();

  // Kill any existing animations on character, shadow, eyes
  gsap.killTweensOf([character, shadow]);
  if (glowElements.length > 0) {
    gsap.killTweensOf(glowElements);
  }
  if (eyeLeft && eyeRight) {
    gsap.killTweensOf([eyeLeft, eyeRight]);
  }
  if (eyeLeftPath && eyeRightPath) {
    gsap.killTweensOf([eyeLeftPath, eyeRightPath]);
  }

  // INSTANT RESET: Snap to idle state immediately
  gsap.set(character, {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    rotation: 0,
    rotationX: 0,
    rotationY: 0,
    clearProps: 'willChange',
  });

  gsap.set(shadow, {
    xPercent: -50,
    scaleX: 1,
    scaleY: 1,
    opacity: 0.7,
  });

  if (glowElements.length > 0) {
    gsap.set(glowElements, {
      y: 0,
      scale: 1,
      opacity: 1,
    });
  }

  // Set eyes to IDLE instantly (no animation)
  if (eyeLeftPath && eyeRightPath) {
    gsap.set(eyeLeftPath, { attr: { d: getEyeShape('IDLE', 'left') } });
    gsap.set(eyeRightPath, { attr: { d: getEyeShape('IDLE', 'right') } });
  }
  if (eyeLeft && eyeRight) {
    gsap.set([eyeLeft, eyeRight], { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 });
  }

  // Tiny delay so timeline has something to complete
  timeline.to({}, { duration: 0.01 });

  return timeline;
}

/**
 * Creates power-off animation (ON → OFF transition)
 *
 * Dramatic three-phase choreography:
 * 1. Climb up (0.5s) - controlled rise to y: -60
 * 2. SNAP down HARD (0.1s) - explosive drop to y: 50, scale: 0.65 with expo.in easing
 * 3. Fade out (0.05-0.06s) - character to 0.45 opacity, glows/shadow to 0
 *
 * Shadow shrinks to 0.65 (NOT zero) and stays on ground
 * Glows follow character movement and fade out
 *
 * Total duration: ~0.66s
 *
 * @param elements - Character, shadow, and optional glow elements
 * @returns GSAP timeline for power-off animation
 */
export function createPowerOffAnimation(
  elements: TransitionAnimationElements
): gsap.core.Timeline {
  const { character, shadow, innerGlow, outerGlow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];

  const timeline = gsap.timeline();

  // Kill any existing animations
  gsap.killTweensOf([character, shadow]);
  if (glowElements.length > 0) {
    gsap.killTweensOf(glowElements);
  }

  // Phase 1: Climb up (0.5s) - eyes stay as idle
  timeline.to(character, {
    y: -60,
    duration: 0.5,
    ease: 'power2.out',
  });

  // Phase 2: SNAP down HARD - super fast shrink to 65% (0.1s)
  timeline.to(character, {
    y: 50,
    scale: 0.65,
    duration: 0.1, // Even faster - 100ms snap
    ease: 'expo.in', // Exponential acceleration for dramatic snap
  });

  // Phase 2b: Glows follow character down (same timing, same ease)
  if (glowElements.length > 0) {
    timeline.to(
      glowElements,
      {
        y: 50,
        scale: 0.65,
        duration: 0.1,
        ease: 'expo.in',
      },
      '-=0.1' // Start at the same time as the character snap
    );
  }

  // Phase 2c: Shadow shrinks but stays on ground (no Y movement)
  // CRITICAL: Shadow shrinks to 0.65, NOT to zero!
  timeline.to(
    shadow,
    {
      xPercent: -50, // Keep centered (static, not animated)
      scaleX: 0.65,
      scaleY: 0.65,
      duration: 0.1,
      ease: 'expo.in',
    },
    '-=0.1' // Parallel with character snap
  );

  // Phase 3: Fade character to transparent IMMEDIATELY after snap (0.05s)
  timeline.to(character, {
    opacity: 0.45, // Dim logo state
    duration: 0.05, // Lightning fast - 50ms
    ease: 'power2.in',
  });

  // Phase 3b: Fade out background glows and shadow at the same time (0.06s)
  if (glowElements.length > 0) {
    timeline.to(
      glowElements,
      {
        opacity: 0,
        duration: 0.06, // Lightning fast - 60ms
        ease: 'power2.in',
      },
      '-=0.05' // Start slightly before character fade finishes
    );
  }

  timeline.to(
    shadow,
    {
      opacity: 0,
      duration: 0.06, // Lightning fast - 60ms
      ease: 'power2.in',
    },
    '-=0.06' // Parallel with glows
  );

  // CRITICAL: Freeze rotation at 0° for logo state
  timeline.set(character, { rotation: 0 }, '>');

  return timeline;
}
