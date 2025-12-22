/**
 * Transition Animation Definitions
 * Pure functions that create GSAP timelines for state transitions (wake-up, power-off)
 */

import gsap from 'gsap';

export interface TransitionAnimationElements {
  character: HTMLElement;
  shadow: HTMLElement;
  innerGlow?: HTMLElement;
  outerGlow?: HTMLElement;
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
  const { character, shadow, innerGlow, outerGlow } = elements;
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];

  const timeline = gsap.timeline();

  // Kill any existing animations on character and shadow
  gsap.killTweensOf([character, shadow]);
  if (glowElements.length > 0) {
    gsap.killTweensOf(glowElements);
  }

  // Setup - restore opacity and set will-change for GPU optimization
  gsap.set(character, {
    opacity: 1,
    scale: 0.65, // Start small
    willChange: 'transform',
  });

  // Phase 1: Jump up to apex (0.2s) - controlled rise
  timeline.to(character, {
    y: -45,
    scale: 1, // Grow to normal size
    duration: 0.2,
    ease: 'power2.out',
    force3D: true,
    onStart: () => {
      // Shadow starts at zero scale and opacity
      gsap.set(shadow, {
        xPercent: -50,
        scaleX: 0,
        scaleY: 0,
        opacity: 0,
      });
    },
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
      `-=${0.2 - GLOW_LAG_SECONDS}` // Start 0.05s after character
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
      '-=0.05' // Already lagged, maintain position
    );
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
      `-=${0.3 - GLOW_LAG_SECONDS}` // Start 0.05s after character
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
  // Single smooth animation from 0 to 1.0 scale, matching legacy system
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

  return timeline;
}

/**
 * Creates power-off animation (ON → OFF transition)
 *
 * Simple fade-out with scale down:
 * - Character scales down to 0.65
 * - Opacity fades to 0.45 (dim logo state)
 * - Shadow and glows fade out completely
 *
 * Duration: ~0.4s
 *
 * @param elements - Character, shadow, and optional glow elements
 * @returns GSAP timeline for power-off animation
 */
export function createPowerOffAnimation(
  elements: TransitionAnimationElements
): gsap.core.Timeline {
  const { character, shadow, innerGlow, outerGlow } = elements;
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];

  const timeline = gsap.timeline();

  // Kill any existing animations
  gsap.killTweensOf([character, shadow]);
  if (glowElements.length > 0) {
    gsap.killTweensOf(glowElements);
  }

  // Fade out and scale down character
  timeline.to(character, {
    opacity: 0.45, // Dim logo state
    scale: 0.65,
    duration: 0.4,
    ease: 'power2.out',
  });

  // Fade out shadow completely and shrink to zero
  timeline.to(
    shadow,
    {
      opacity: 0,
      scaleX: 0, // Shrink to zero (not 0.65)
      scaleY: 0, // Shrink to zero (not 0.65)
      duration: 0.4,
      ease: 'power2.out',
    },
    '<' // Parallel with character
  );

  // Fade out glows completely
  if (glowElements.length > 0) {
    timeline.to(
      glowElements,
      {
        opacity: 0,
        scale: 0.65,
        duration: 0.4,
        ease: 'power2.out',
      },
      '<' // Parallel with character
    );
  }

  return timeline;
}
