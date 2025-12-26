/**
 * GSAP-specific animation configurations for Anty V3
 *
 * This file contains all GSAP timing configurations, easing functions,
 * and animation parameters for the character animation system.
 */

import type { ExpressionName } from './animation-state';

/**
 * Idle animation configurations
 * These animations run continuously in the background
 */
export const idleAnimationConfig = {
  /** Vertical floating animation */
  float: {
    amplitude: 12, // pixels
    duration: 2.5, // seconds
    ease: 'sine.inOut',
  },
  /** Gentle rotation synchronized with float */
  rotation: {
    degrees: 2, // ±degrees
    duration: 2.5, // seconds
    ease: 'sine.inOut',
  },
  /** Breathing scale animation */
  breathe: {
    scaleMin: 1.0,
    scaleMax: 1.02, // Subtle breathing
    duration: 2.5, // seconds
    ease: 'sine.inOut',
  },
} as const;

/**
 * Interactive animation configurations
 * These animations trigger in response to button clicks
 */
export const interactiveAnimationConfig = {
  /** Bounce animation (e.g., when feeding) */
  bounce: {
    height: 30, // pixels
    duration: 0.6, // seconds
    ease: 'elastic.out(1, 0.3)',
  },
  /** Wiggle rotation animation (e.g., when playing) */
  wiggle: {
    angle: 15, // degrees
    cycles: 3, // number of wiggles
    duration: 0.8, // seconds
    ease: 'elastic.out(1, 0.3)',
  },
  /** Tilt animation (e.g., when chatting) */
  tilt: {
    angle: 10, // degrees
    duration: 0.4, // seconds
    ease: 'power2.inOut',
  },
} as const;

/**
 * Button animation configuration alias
 */
export const buttonAnimationConfig = interactiveAnimationConfig;

/**
 * Expression transition timing configurations
 * Controls how quickly the character morphs between different expressions
 */
export const expressionTransitionDuration: Record<
  'instant' | 'fast' | 'normal' | 'slow',
  number
> = {
  instant: 0, // 0ms - for blink
  fast: 150, // 150ms - quick transitions (idle → wink)
  normal: 300, // 300ms - most transitions
  slow: 500, // 500ms - dramatic shifts (happy → angry)
} as const;

/**
 * Get transition duration for specific expression changes
 */
export function getExpressionTransitionDuration(
  from: ExpressionName,
  to: ExpressionName
): number {
  // Quick transitions (fast) for wink
  const quickPairs: Array<[ExpressionName, ExpressionName]> = [
    ['idle', 'wink'],
    ['happy', 'wink'],
  ];

  const isQuick = quickPairs.some(
    ([a, b]) => (from === a && to === b) || (from === b && to === a)
  );
  if (isQuick) return expressionTransitionDuration.fast;

  // Default to normal
  return expressionTransitionDuration.normal;
}

/**
 * Blink timing configuration
 * Controls the automatic blinking behavior
 */
export const blinkTimingConfig = {
  closeDuration: 100, // milliseconds - how long eye closure takes
  openDuration: 150, // milliseconds - how long eye opening takes
  minInterval: 3000, // milliseconds - minimum time between blinks
  maxInterval: 8000, // milliseconds - maximum time between blinks
} as const;

/**
 * Particle configuration
 * Defines behavior and appearance parameters for different particle types
 */
export const particleConfigs = {
  heart: {
    velocity: { x: [-30, 30], y: [-80, -120] }, // pixels per second
    lifetime: 2000, // milliseconds
    gravity: 0.5, // acceleration factor
    fadeStart: 0.6, // opacity fade starts at 60% of lifetime
    rotationSpeed: { min: -45, max: 45 }, // degrees per second
  },
  sparkle: {
    velocity: { x: [-50, 50], y: [-60, -100] },
    lifetime: 1500, // milliseconds
    gravity: 0.3,
    fadeStart: 0.5, // opacity fade starts at 50% of lifetime
    rotationSpeed: { min: -180, max: 180 }, // degrees per second
  },
  sweat: {
    velocity: { x: [-20, 20], y: [0, 20] },
    lifetime: 1200, // milliseconds
    gravity: 1.5, // falls faster
    fadeStart: 0.7,
    rotationSpeed: { min: 0, max: 0 }, // no rotation
  },
  zzz: {
    velocity: { x: [10, 30], y: [-40, -60] },
    lifetime: 2500, // milliseconds
    gravity: -0.2, // floats up slowly
    fadeStart: 0.7,
    rotationSpeed: { min: -20, max: 20 }, // degrees per second
  },
  confetti: {
    velocity: { x: [-150, 150], y: [-300, -150] },
    lifetime: 3000, // milliseconds
    gravity: 1.5, // falls with gravity
    fadeStart: 0.8,
    rotationSpeed: { min: -360, max: 360 }, // degrees per second
  },
} as const;

/**
 * Helper to get random value in range
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Helper to get random int in range
 */
export function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max));
}
