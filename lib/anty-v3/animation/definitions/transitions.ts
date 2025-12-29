/**
 * Transition Animation Definitions
 * Pure functions that create GSAP timelines for state transitions (wake-up, power-off)
 */

import gsap from 'gsap';
import { createEyeAnimation } from './eye-animations';
import { getEyeShape, getEyeDimensions } from './eye-shapes';

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
  const { character, shadow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
  // NOTE: Glow animations removed - GlowSystem handles fade in via animation controller

  const timeline = gsap.timeline();

  // Kill any existing animations on character, shadow, eyes
  // NOTE: Don't kill glow tweens - GlowSystem manages glow animations
  gsap.killTweensOf([character, shadow]);
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

  // NOTE: Glow initial state removed - GlowSystem handles via snapToCharacter() and fadeIn()

  // Set eyes to IDLE instantly (no animation) with proper dimensions
  if (eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg && eyeLeft && eyeRight) {
    const idleDimensions = getEyeDimensions('IDLE');

    // Kill any existing eye tweens
    gsap.killTweensOf([eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg, eyeLeft, eyeRight]);

    // Snap paths to IDLE shape
    gsap.set(eyeLeftPath, { attr: { d: getEyeShape('IDLE', 'left') } });
    gsap.set(eyeRightPath, { attr: { d: getEyeShape('IDLE', 'right') } });

    // Update viewBox to IDLE dimensions
    gsap.set([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: idleDimensions.viewBox } });

    // Update container dimensions and reset transforms
    gsap.set([eyeLeft, eyeRight], {
      width: idleDimensions.width,
      height: idleDimensions.height,
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
  } else if (eyeLeftPath && eyeRightPath) {
    // Fallback if SVG containers not available
    gsap.set(eyeLeftPath, { attr: { d: getEyeShape('IDLE', 'left') } });
    gsap.set(eyeRightPath, { attr: { d: getEyeShape('IDLE', 'right') } });
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
  const { character, shadow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
  // NOTE: Glow animations removed - GlowSystem handles fade out via animation controller

  const timeline = gsap.timeline();

  // Kill any existing animations
  // NOTE: Don't kill glow tweens - GlowSystem manages glow animations
  gsap.killTweensOf([character, shadow]);

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

  // NOTE: Glow following removed - GlowSystem tracks character position via physics

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

  // NOTE: Glow fade-out removed - GlowSystem handles fade out via animation controller

  // Phase 3b: Fade out shadow
  timeline.to(
    shadow,
    {
      opacity: 0,
      duration: 0.06, // Lightning fast - 60ms
      ease: 'power2.in',
    },
    '-=0.05' // Start slightly before character fade finishes
  );

  // CRITICAL: Freeze rotation at 0° for logo state
  timeline.set(character, { rotation: 0 }, '>');

  // INSTANT SNAP: Set eyes to OFF/logo shape at the end
  // Using gsap.set (instant, no morphing) to avoid glitchy point flipping
  if (eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg && eyeLeft && eyeRight) {
    const offDimensions = getEyeDimensions('OFF_LEFT'); // Same for both sides

    // Kill any existing eye tweens to prevent conflicts
    gsap.killTweensOf([eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg, eyeLeft, eyeRight]);

    // Snap to OFF shapes instantly (no animation = no morphing glitches)
    timeline.set(eyeLeftPath, { attr: { d: getEyeShape('OFF_LEFT', 'left') } }, '>');
    timeline.set(eyeRightPath, { attr: { d: getEyeShape('OFF_RIGHT', 'right') } }, '<');

    // Update viewBox to match OFF dimensions
    timeline.set([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: offDimensions.viewBox } }, '<');

    // Update container dimensions and position for logo state
    // Eyes move closer together (toward center) and vertically centered
    const eyeOffsetX = 3; // px toward center
    const eyeOffsetY = 3; // px down

    timeline.set(eyeLeft, {
      width: offDimensions.width,
      height: offDimensions.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      x: eyeOffsetX,  // Move right toward center
      y: eyeOffsetY,
    }, '<');

    timeline.set(eyeRight, {
      width: offDimensions.width,
      height: offDimensions.height,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      x: -eyeOffsetX, // Move left toward center
      y: eyeOffsetY,
    }, '<');
  }

  return timeline;
}
