/**
 * Transition Animation Definitions
 * Pure functions that create GSAP timelines for state transitions (wake-up, power-off)
 */

import gsap from 'gsap';
import { createEyeAnimation, type EyeAnimationElements } from './eye-animations';

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
 * Three-phase choreography:
 * 1. Jump up to apex (0.2s) - controlled rise with scale from 0.65 to 1
 * 2. Tiny hang at apex (0.05s) - brief pause
 * 3. Drop down faster (0.3s) - gravity-feel descent
 *
 * Shadow grows back to full size and fades in (no Y movement - stays on ground)
 * Glows fade in and follow character at 75% distance with 0.05s lag
 *
 * Total duration: ~0.55s
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

  // Kill any existing animations on character and shadow
  gsap.killTweensOf([character, shadow]);
  if (glowElements.length > 0) {
    gsap.killTweensOf(glowElements);
  }

  // Setup - restore opacity and set will-change for GPU optimization
  // CRITICAL: Set initial states BEFORE starting timeline
  gsap.set(character, {
    opacity: 1,
    scale: 0.65, // Start small
    y: 0, // Start at ground
    willChange: 'transform',
  });

  // CRITICAL: Shadow starts at 0.65 scale (OFF state) and grows to 1.0
  gsap.set(shadow, {
    xPercent: -50,
    scaleX: 0.65, // Start at OFF state scale
    scaleY: 0.65, // Start at OFF state scale
    opacity: 0,
  });

  // Phase 1: Jump up to apex (0.2s) - controlled rise
  timeline.to(character, {
    y: -45,
    scale: 1, // Grow to normal size
    duration: 0.2,
    ease: 'power2.out',
    force3D: true,
  });

  // Glows jump up with character at 75% distance (0.05s lag)
  if (glowElements.length > 0) {
    timeline.to(
      glowElements,
      {
        y: -45 * GLOW_DISTANCE_RATIO, // -34px
        scale: 1, // Reset from 0.65 to 1
        duration: 0.2,
        ease: 'power2.out',
      },
      `-=${0.2 - GLOW_LAG_SECONDS}` // Start 0.05s after character (at 0.15)
    );
  }

  // Phase 2: Tiny hang at apex (0.05s) - just a breath
  timeline.to(character, {
    y: -45,
    scale: 1,
    duration: 0.05,
    ease: 'none',
  });

  if (glowElements.length > 0) {
    timeline.to(
      glowElements,
      {
        y: -45 * GLOW_DISTANCE_RATIO,
        scale: 1,
        duration: 0.05,
        ease: 'none',
      },
      '-=0.00' // Already lagged from previous animation
    );
  }

  // Morph eyes from OFF to IDLE
  if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
    const eyeTl = createEyeAnimation({
      leftEye: eyeLeft,
      rightEye: eyeRight,
      leftEyePath: eyeLeftPath,
      rightEyePath: eyeRightPath,
      leftEyeSvg: eyeLeftSvg,
      rightEyeSvg: eyeRightSvg,
    }, 'IDLE', { duration: 0.3 });

    timeline.add(eyeTl, 0.5); // Start after body wake begins
  }

  // Phase 3: Drop down faster (0.3s)
  timeline.to(character, {
    y: 0,
    scale: 1,
    duration: 0.3,
    ease: 'power2.in', // Faster drop with gravity feel
    force3D: true,
    clearProps: 'willChange', // Clean up GPU optimization
  });

  if (glowElements.length > 0) {
    timeline.to(
      glowElements,
      {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.in',
      },
      `-=${0.3 - GLOW_LAG_SECONDS}` // Start 0.05s after character (at 0.25)
    );

    // Fade glows opacity in (parallel with movement)
    timeline.to(
      glowElements,
      {
        opacity: 1,
        duration: 0.6, // Slower fade-in
        ease: 'power1.in', // Ease in for gradual start
      },
      '-=0.4' // Start during jump
    );
  }

  // Shadow grows back to full size and fades in (no Y movement - stays on ground)
  // Single smooth animation from 0 to 1.0 scale
  timeline.to(
    shadow,
    {
      xPercent: -50, // Keep centered (static, not animated)
      scaleX: 1, // Grow from 0 to 1
      scaleY: 1, // Grow from 0 to 1
      opacity: 0.7, // Fade from 0 to 0.7
      duration: 0.6, // Longer duration for smoother fade
      ease: 'power2.out',
    },
    '-=0.4' // Start during landing (0.4s before end)
  );

  // CRITICAL: Ensure rotation starts at 0° after wake-up for clean idle start
  timeline.set(character, { rotation: 0 }, '>');

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

  // Phase 1: Climb up (0.5s) - eyes stay as idle during this
  timeline.to(character, {
    y: -60,
    duration: 0.5,
    ease: 'power2.out',
  });

  // Morph eyes to OFF (triangle) shape
  if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
    const eyeTl = createEyeAnimation({
      leftEye: eyeLeft,
      rightEye: eyeRight,
      leftEyePath: eyeLeftPath,
      rightEyePath: eyeRightPath,
      leftEyeSvg: eyeLeftSvg,
      rightEyeSvg: eyeRightSvg,
    }, { left: 'OFF_LEFT', right: 'OFF_RIGHT' }, { duration: 0.3 });

    timeline.add(eyeTl, 0); // Start at the beginning (during climb up)
  }

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
