/**
 * Declarative Emotion Configurations
 *
 * All emotions defined as DATA, not code.
 * Each emotion is a configuration object that the interpreter uses
 * to build GSAP timelines.
 *
 * This makes emotions:
 * 1. Easy to understand at a glance
 * 2. Easy to modify without touching animation logic
 * 3. Easy to test in isolation
 * 4. Easy to add new emotions
 */

import type { EmotionConfig } from '../types';
import type { EmotionType } from '../types';

/**
 * Glow coordination constants
 * Glows follow character at 75% distance with 0.05s lag
 */
export const GLOW_CONSTANTS = {
  DISTANCE_RATIO: 0.75,
  LAG_SECONDS: 0.05,
} as const;

/**
 * All emotion configurations
 */
export const EMOTION_CONFIGS: Partial<Record<EmotionType, EmotionConfig>> = {
  // ===========================
  // HAPPY - Wiggle rotation
  // ===========================
  happy: {
    id: 'happy',
    eyes: {
      shape: 'HAPPY',
      duration: 0.2,
      yOffset: -10,
    },
    character: [
      { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: 0 }, duration: 0.15, ease: 'power1.inOut' },
    ],
    glow: { follow: true },
    totalDuration: 0.9,
  },

  // ===========================
  // EXCITED - Epic jump with 360 spin
  // ===========================
  excited: {
    id: 'excited',
    eyes: {
      shape: 'HAPPY',
      duration: 0.2,
      yOffset: -10,
    },
    character: [
      // Jump up with 360 spin
      { props: { y: -70, rotation: 360 }, duration: 0.5, ease: 'power2.out' },
      // Hold at apex
      { props: { y: -70, rotation: 360 }, duration: 0.3, ease: 'none' },
      // Drop down
      { props: { y: 0 }, duration: 0.45, ease: 'power1.inOut' },
      // First bounce
      { props: { y: -25 }, duration: 0.18, ease: 'power2.out' },
      { props: { y: 0 }, duration: 0.18, ease: 'power2.in' },
      // Second bounce
      { props: { y: -18 }, duration: 0.15, ease: 'power2.out' },
      { props: { y: 0 }, duration: 0.15, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 1.91,
    resetRotation: true,
  },

  // ===========================
  // SAD - Droop down
  // ===========================
  sad: {
    id: 'sad',
    eyes: {
      shape: 'SAD',
      duration: 0.2,
      leftRotation: -15,
      rightRotation: 15, // Mirrored: opposite of left for proper reflection
    },
    character: [
      // Droop down (no scale change to avoid shrinking)
      { props: { y: 10, rotation: 0 }, duration: 0.6, ease: 'power2.out' },
      // Hold
      { props: { y: 10 }, duration: 0.9, ease: 'none' },
      // Return to normal
      { props: { y: 0, scale: 1 }, duration: 0.4, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 1.9,
  },

  // ===========================
  // ANGRY - Drop and shake
  // ===========================
  angry: {
    id: 'angry',
    eyes: {
      shape: 'ANGRY',
      duration: 0.2,
      leftRotation: 20,
      rightRotation: -20, // Mirrored: opposite of left for proper reflection
    },
    character: [
      // Drop down
      { props: { y: 15 }, duration: 0.6, ease: 'power2.out' },
      // Shake 3 times
      { props: { x: -8 }, duration: 0.8, ease: 'sine.inOut' },
      { props: { x: 8 }, duration: 0.8, ease: 'sine.inOut' },
      { props: { x: -8 }, duration: 0.8, ease: 'sine.inOut' },
      { props: { x: 8 }, duration: 0.8, ease: 'sine.inOut' },
      { props: { x: -8 }, duration: 0.8, ease: 'sine.inOut' },
      { props: { x: 8 }, duration: 0.8, ease: 'sine.inOut' },
      // Return to center
      { props: { x: 0 }, duration: 0.4, ease: 'sine.inOut' },
      // Return up
      { props: { y: 0 }, duration: 0.5, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 6.3,
  },

  // ===========================
  // SHOCKED - Jump with bracket separation
  // ===========================
  shocked: {
    id: 'shocked',
    eyes: {
      shape: 'IDLE', // Keep idle shape but scale up
      duration: 0.2,
      scale: 1.4,
    },
    character: [
      // Jump up
      { props: { y: -30 }, duration: 0.2, ease: 'power2.out' },
      // Hold with slight shake
      { props: { y: -30, rotation: 2 }, duration: 0.08, ease: 'power1.inOut' },
      { props: { y: -30, rotation: -2 }, duration: 0.08, ease: 'power1.inOut' },
      { props: { y: -30, rotation: 2 }, duration: 0.08, ease: 'power1.inOut' },
      { props: { y: -30, rotation: -2 }, duration: 0.08, ease: 'power1.inOut' },
      // Wait
      { props: { y: -30 }, duration: 1.15, ease: 'none' },
      // Return
      { props: { y: 0, rotation: 0 }, duration: 0.5, ease: 'power1.inOut' },
    ],
    body: {
      leftX: -15,
      leftY: -15,
      rightX: 15,
      rightY: 15,
      duration: 0.2,
      ease: 'back.out(2)',
    },
    glow: { follow: true },
    totalDuration: 2.17,
  },

  // ===========================
  // SPIN - Y-axis 360 spin with jump
  // ===========================
  spin: {
    id: 'spin',
    character: [
      // Jump up
      { props: { y: -70 }, duration: 0.3, ease: 'power2.out' },
      // Spin on Y-axis (overlaps with jump)
      { props: { rotationY: 360 }, duration: 1.1, ease: 'back.out(1.2)', position: '-=0.3' },
      // Wait then descend
      { props: { y: -70 }, duration: 0.8, ease: 'none' },
      { props: { y: 0 }, duration: 0.35, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 2.55,
    resetRotationY: true,
  },

  // ===========================
  // JUMP - Jump with optional hold
  // ===========================
  jump: {
    id: 'jump',
    eyes: {
      shape: 'IDLE',
      duration: 0.4,
      scale: 1.15,
      yOffset: -5,
    },
    character: [
      // Jump up
      { props: { y: -35, scale: 1.05, rotation: 0 }, duration: 0.4, ease: 'back.out(2)' },
      // Hold at peak
      { props: { y: -35, scale: 1.05 }, duration: 1.2, ease: 'none' },
      // Descend
      { props: { y: 0, scale: 1 }, duration: 0.5, ease: 'elastic.out(1, 0.5)' },
    ],
    glow: { follow: true },
    totalDuration: 2.1,
  },

  // ===========================
  // LOOKAROUND - Look left then right
  // ===========================
  lookaround: {
    id: 'lookaround',
    character: [
      // Look left
      { props: { rotation: -8, x: -10 }, duration: 0.3, ease: 'power2.out' },
      // Hold left
      { props: { rotation: -8, x: -10 }, duration: 0.5, ease: 'none' },
      // Transition to right
      { props: { rotation: 8, x: 10 }, duration: 0.4, ease: 'power2.inOut' },
      // Hold right
      { props: { rotation: 8, x: 10 }, duration: 0.5, ease: 'none' },
      // Return to center
      { props: { rotation: 0, x: 0 }, duration: 0.3, ease: 'power2.in' },
    ],
    totalDuration: 2.0,
  },

  // ===========================
  // WINK - Asymmetric eye wink with tilt
  // ===========================
  wink: {
    id: 'wink',
    eyes: {
      shape: { left: 'CLOSED', right: 'HALF' },
      duration: 0.25,
    },
    character: [
      // Tilt up
      { props: { rotation: -3, y: -5 }, duration: 0.25, ease: 'power1.inOut' },
      // Hold
      { props: { rotation: -3, y: -5 }, duration: 0.4, ease: 'none' },
      // Return
      { props: { rotation: 0, y: 0 }, duration: 0.25, ease: 'power1.inOut' },
    ],
    totalDuration: 0.9,
  },

  // ===========================
  // NOD - Vertical head bob (yes)
  // ===========================
  nod: {
    id: 'nod',
    character: [
      { props: { y: 8 }, duration: 0.2, ease: 'power2.out' },
      { props: { y: -4 }, duration: 0.2, ease: 'power2.inOut' },
      { props: { y: 0 }, duration: 0.2, ease: 'power2.in' },
    ],
    totalDuration: 0.6,
  },

  // ===========================
  // HEADSHAKE - Horizontal shake (no)
  // ===========================
  headshake: {
    id: 'headshake',
    character: [
      { props: { x: -6 }, duration: 0.2, ease: 'power2.inOut' },
      { props: { x: 6 }, duration: 0.2, ease: 'power2.inOut' },
      { props: { x: -6 }, duration: 0.2, ease: 'power2.inOut' },
      { props: { x: 0 }, duration: 0.2, ease: 'power2.out' },
    ],
    totalDuration: 0.8,
  },

  // ===========================
  // LOOK-LEFT - Look in direction
  // ===========================
  'look-left': {
    id: 'look-left',
    eyes: {
      shape: 'LOOK',
      duration: 0.2,
      xOffset: -3,
    },
    character: [
      { props: { rotation: -2 }, duration: 0.25, ease: 'power2.out' },
      // Hold
      { props: { rotation: -2 }, duration: 0.3, ease: 'none' },
      { props: { rotation: 0 }, duration: 0.25, ease: 'power2.in' },
    ],
    totalDuration: 0.8,
  },

  // ===========================
  // LOOK-RIGHT - Look in direction
  // ===========================
  'look-right': {
    id: 'look-right',
    eyes: {
      shape: 'LOOK',
      duration: 0.2,
      xOffset: 3,
    },
    character: [
      { props: { rotation: 2 }, duration: 0.25, ease: 'power2.out' },
      // Hold
      { props: { rotation: 2 }, duration: 0.3, ease: 'none' },
      { props: { rotation: 0 }, duration: 0.25, ease: 'power2.in' },
    ],
    totalDuration: 0.8,
  },

  // ===========================
  // SUPER - Mario-style power-up pulse
  // ===========================
  super: {
    id: 'super',
    eyes: {
      shape: 'IDLE',
      duration: 0.55,
      scale: 1.1,
    },
    character: [
      { props: { scale: 1.15, rotation: 0 }, duration: 0.1, ease: 'power1.out' },
      { props: { scale: 1.05 }, duration: 0.1, ease: 'power1.inOut' },
      { props: { scale: 1.2 }, duration: 0.1, ease: 'power1.out' },
      { props: { scale: 1.1 }, duration: 0.1, ease: 'power1.inOut' },
      { props: { scale: 1.45 }, duration: 0.15, ease: 'back.out(2)' },
    ],
    glow: { follow: true },
    totalDuration: 0.55,
  },
};

/**
 * Get emotion config by type
 */
export function getEmotionConfig(emotion: EmotionType): EmotionConfig | undefined {
  return EMOTION_CONFIGS[emotion];
}
