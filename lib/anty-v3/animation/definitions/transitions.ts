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
 * "Blink Awake" animation (~0.5s):
 * 1. Body smoothly rises (scale 0.65→1, y 50→0, opacity 0.45→1)
 * 2. Eyes snap from OFF arrows to CLOSED partway through
 * 3. Eyes morph from CLOSED → IDLE (opening like waking up)
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

  // ============================================
  // WAKE-UP: Mirror of power-off sequence
  // ============================================
  // OFF does: climb to -60 (0.5s) → snap to 50 (0.1s) → fade
  // ON does:  snap to -60 (0.12s) → hang → settle to 0 (0.5s)
  // ============================================

  // Phase 1: POP UP - quick but readable rise to apex
  // Opacity and scale come in with the rise
  timeline.fromTo(
    character,
    {
      opacity: 0.25,
      scale: 0.65,
      y: 50,
      x: 0,
      rotation: 0,
    },
    {
      opacity: 1,
      scale: 1,
      y: -40,
      duration: 0.25,
      ease: 'power3.out', // Quick but visible rise
    }
  );

  // Phase 2: HANG at apex - brief pause to let it read
  // (timeline just continues, this is the gap before settle)

  // Phase 3: SETTLE DOWN - smooth descent to idle (mirror of the climb)
  timeline.to(
    character,
    {
      y: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      clearProps: 'willChange',
    },
    0.75 // Start after 0.5s hangtime at apex (0.25 rise + 0.5 hang)
  );

  // Shadow: starts small/faint, shrinks during rise
  timeline.fromTo(
    shadow,
    {
      xPercent: -50,
      scaleX: 0.65,
      scaleY: 0.65,
      opacity: 0,
    },
    {
      scaleX: 0.5,
      scaleY: 0.35,
      opacity: 0.3,
      duration: 0.25,
      ease: 'power3.out',
    },
    0
  );

  // Shadow: grows as character settles
  timeline.to(
    shadow,
    {
      scaleX: 1,
      scaleY: 1,
      opacity: 0.7,
      duration: 0.35,
      ease: 'power2.inOut',
    },
    0.75
  );

  // ============================================
  // EYES: Snap to IDLE, then blink-awake before settle
  // ============================================
  if (eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg && eyeLeft && eyeRight) {
    const idleDimensions = getEyeDimensions('IDLE');

    // Kill any existing eye tweens
    gsap.killTweensOf([eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg, eyeLeft, eyeRight]);

    // Start with HALF eyes (half-open) positioned higher
    const halfDimensions = getEyeDimensions('HALF');

    timeline.set(eyeLeftPath, { attr: { d: getEyeShape('HALF', 'left') } }, 0);
    timeline.set(eyeRightPath, { attr: { d: getEyeShape('HALF', 'right') } }, 0);
    timeline.set([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: halfDimensions.viewBox } }, 0);
    timeline.set([eyeLeft, eyeRight], {
      width: halfDimensions.width,
      height: halfDimensions.height,
      x: 0,
      y: -10, // Higher up
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    }, 0);

    const eyeContainers = [eyeLeft, eyeRight];

    // Morph to IDLE eyes and settle down during descent
    timeline.to(eyeLeftPath, { attr: { d: getEyeShape('IDLE', 'left') }, duration: 0.25, ease: 'power2.inOut' }, 0.75);
    timeline.to(eyeRightPath, { attr: { d: getEyeShape('IDLE', 'right') }, duration: 0.25, ease: 'power2.inOut' }, 0.75);
    timeline.to([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: idleDimensions.viewBox }, duration: 0.25, ease: 'power2.inOut' }, 0.75);
    timeline.to([eyeLeft, eyeRight], {
      width: idleDimensions.width,
      height: idleDimensions.height,
      y: 0,
      duration: 0.35,
      ease: 'power2.inOut',
    }, 0.75);
  }

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
    opacity: 0.25, // Dim logo state (lighter gray)
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
