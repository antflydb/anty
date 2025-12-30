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
  // POSITIVE EMOTION SCALE (Level 5 to 1)
  // ===========================

  // ===========================
  // CELEBRATE (Level 5) - EPIC celebration with confetti
  // For: Major wins, big achievements, celebrations
  // ===========================
  celebrate: {
    id: 'celebrate',
    eyes: {
      shape: 'HAPPY',
      duration: 0.2,
      yOffset: -10,
      delay: 0.35, // Start during leap
    },
    character: [
      // Squat down (anticipation)
      { props: { y: 12 }, duration: 0.2, ease: 'power2.in' },
      // Spin up from crouch to apex
      { props: { y: -70, rotation: 360 }, duration: 0.4, ease: 'power2.out' },
      // Hang in air
      { props: { y: -70, rotation: 360 }, duration: 0.4, ease: 'none' },
      // Normal comedown with small bounce
      { props: { y: 0 }, duration: 0.3, ease: 'power2.in' },
      { props: { y: -12 }, duration: 0.12, ease: 'power2.out' },
      { props: { y: 0 }, duration: 0.1, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 1.5,
    resetRotation: true,
    // Note: Confetti is spawned separately in anty-character-v3.tsx for this emotion
  },

  // ===========================
  // EXCITED (Level 4) - Jump + spin without confetti
  // For: Good accomplishments, victories, success
  // ===========================
  excited: {
    id: 'excited',
    eyes: {
      shape: 'HAPPY',
      duration: 0.2,
      yOffset: -10,
      delay: 0.2,
    },
    character: [
      // Quick squat
      { props: { y: 8 }, duration: 0.15, ease: 'power2.in' },
      // Jump up with spin
      { props: { y: -50, rotation: 360 }, duration: 0.35, ease: 'power2.out' },
      // Brief hang
      { props: { y: -50, rotation: 360 }, duration: 0.2, ease: 'none' },
      // Come down
      { props: { y: 0 }, duration: 0.25, ease: 'power2.in' },
      // Small bounce
      { props: { y: -8 }, duration: 0.1, ease: 'power2.out' },
      { props: { y: 0 }, duration: 0.08, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 1.1,
    resetRotation: true,
  },

  // ===========================
  // HAPPY (Level 3) - Expressive wiggle
  // For: Good news, positive responses
  // (defined above)
  // ===========================

  // ===========================
  // PLEASED (Level 2) - Gentle bounce + happy eyes
  // For: Mild positive, acknowledgments, satisfaction
  // ===========================
  pleased: {
    id: 'pleased',
    eyes: {
      shape: 'HAPPY',
      duration: 0.15,
      yOffset: -8,
    },
    character: [
      // Small satisfied bounce up
      { props: { y: -18 }, duration: 0.2, ease: 'power2.out' },
      // Settle back down
      { props: { y: 0 }, duration: 0.25, ease: 'power2.in' },
      // Tiny rebound
      { props: { y: -4 }, duration: 0.1, ease: 'power1.out' },
      { props: { y: 0 }, duration: 0.1, ease: 'power1.in' },
    ],
    glow: { follow: true },
    totalDuration: 0.65,
    holdDuration: 0.4, // Hold happy eyes a bit after bounce
  },

  // CHANT (Level 1) - Happy eyes only
  // (defined at bottom of file)

  // ===========================
  // SAD - Droop down
  // ===========================
  sad: {
    id: 'sad',
    eyes: {
      shape: 'SAD',
      duration: 0.25,
      yOffset: 10, // Lower eyes
      leftRotation: -15,
      rightRotation: 15, // Mirrored: opposite of left for proper reflection
    },
    character: [
      // Drop down gently (faster)
      { props: { y: 18 }, duration: 0.5, ease: 'power2.out' },
      // Subtle slow sway starts parallel to drop (3 cycles instead of 4)
      { props: { x: -5 }, duration: 0.7, ease: 'sine.inOut', position: 0 },
      { props: { x: 5 }, duration: 0.7, ease: 'sine.inOut' },
      { props: { x: -5 }, duration: 0.7, ease: 'sine.inOut' },
      // Return to center
      { props: { x: 0 }, duration: 0.4, ease: 'sine.inOut' },
      // Rise back up gently
      { props: { y: 0 }, duration: 0.4, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 3.4,
    showTeardrop: true,
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
      { props: { y: 15 }, duration: 0.4, ease: 'power2.out' },
      // Shake 3 times
      { props: { x: -8 }, duration: 0.15, ease: 'sine.inOut' },
      { props: { x: 8 }, duration: 0.15, ease: 'sine.inOut' },
      { props: { x: -8 }, duration: 0.15, ease: 'sine.inOut' },
      { props: { x: 8 }, duration: 0.15, ease: 'sine.inOut' },
      { props: { x: -8 }, duration: 0.15, ease: 'sine.inOut' },
      { props: { x: 8 }, duration: 0.15, ease: 'sine.inOut' },
      // Hold down
      { props: { x: 0 }, duration: 0.5, ease: 'sine.inOut' },
      // Return up
      { props: { y: 0 }, duration: 0.4, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 2.2,
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
      returnPosition: 1.3, // Scale down when brackets close
      returnDuration: 0.3,
    },
    character: [
      // Jump up
      { props: { y: -30 }, duration: 0.2, ease: 'power2.out' },
      // Descend at 1.3s (parallel with bracket close)
      { props: { y: 0 }, duration: 0.3, ease: 'power2.in', position: 1.3 },
    ],
    body: {
      leftX: -15,
      leftY: -15,
      rightX: 15,
      rightY: 15,
      duration: 0.2,
      ease: 'back.out(2)',
      returnPosition: 1.3, // Close brackets parallel with descent
      returnDuration: 0.3,
      returnEase: 'power2.inOut',
    },
    glow: { follow: true },
    totalDuration: 1.6,
  },

  // ===========================
  // SPIN - Y-axis 360 spin with jump
  // ===========================
  spin: {
    id: 'spin',
    eyes: {
      shape: 'HALF',
      duration: 0.2,
      yOffset: -10,
      delay: 0.25, // Start during jump
    },
    character: [
      // Jump up
      { props: { y: -70 }, duration: 0.3, ease: 'power2.out' },
      // Double spin on Y-axis (overlaps with jump)
      { props: { rotationY: 720 }, duration: 1.1, ease: 'back.out(1.2)', position: '-=0.3' },
      // Descend (overlaps with end of spin)
      { props: { y: 0 }, duration: 0.35, ease: 'power2.in', position: '-=0.4' },
    ],
    glow: { follow: true },
    totalDuration: 1.35,
    resetRotationY: true,
  },

  // ===========================
  // JUMP - Classic Mario-style jump (space key)
  // ===========================
  jump: {
    id: 'jump',
    character: [
      // Rise up (fast launch, slow at apex)
      { props: { y: -55 }, duration: 0.3, ease: 'power2.out' },
      // Fall down (slow at apex, fast landing)
      { props: { y: 0 }, duration: 0.3, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 0.6,
  },

  // ===========================
  // IDEA - Aha moment with lightbulb
  // ===========================
  idea: {
    id: 'idea',
    eyes: {
      shape: 'IDLE',
      duration: 0.2,
      scale: 1.15,
      yOffset: -10, // Eyes lift up with jump
    },
    character: [
      // Leap up higher
      { props: { y: -45 }, duration: 0.25, ease: 'power2.out' },
      // Hold in air longer while bulb rises
      { props: { y: -45 }, duration: 1.0, ease: 'none' },
      // Come back down smoothly (no bounce)
      { props: { y: 0 }, duration: 0.25, ease: 'power2.in' },
    ],
    glow: { follow: true },
    totalDuration: 1.5,
    showLightbulb: true,
    eyeResetDuration: 0.2,
  },

  // ===========================
  // BACK-FORTH - Look left then right with "considering" eyes
  // Eyes alternate: when looking one direction, opposite eye goes half-closed
  // ===========================
  'back-forth': {
    id: 'back-forth',
    eyePhases: [
      // Slightly before arriving left (anticipate the stop)
      { position: 0.2, shape: { left: 'IDLE', right: 'HALF' }, duration: 0.06 },
      // Slightly before arriving right
      { position: 1.1, shape: { left: 'HALF', right: 'IDLE' }, duration: 0.06 },
      // Hold second squint longer, return near end
      { position: 1.9, shape: 'IDLE', duration: 0.06 },
    ],
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
      duration: 0.08, // Snap to wink quickly
      yOffset: { left: 0, right: -10 }, // Only right eye rises up
    },
    character: [
      // Tilt up (25% faster)
      { props: { rotation: -3, y: -5 }, duration: 0.19, ease: 'power1.inOut' },
      // Hold
      { props: { rotation: -3, y: -5 }, duration: 0.4, ease: 'none' },
      // Return
      { props: { rotation: 0, y: 0 }, duration: 0.25, ease: 'power1.inOut' },
    ],
    totalDuration: 0.84,
    resetIdle: false, // Subtle emotion - don't disrupt breathing
  },

  // ===========================
  // NOD - Vertical head bob (yes)
  // ===========================
  nod: {
    id: 'nod',
    character: [
      // First nod - tilt forward + dip down
      { props: { rotationX: -35, y: 8, transformPerspective: 600 }, duration: 0.15, ease: 'power2.out' },
      { props: { rotationX: 0, y: 0, transformPerspective: 600 }, duration: 0.15, ease: 'power2.inOut' },
      // Second nod
      { props: { rotationX: -35, y: 8, transformPerspective: 600 }, duration: 0.15, ease: 'power2.out' },
      { props: { rotationX: 0, y: 0, transformPerspective: 600 }, duration: 0.15, ease: 'power2.inOut' },
      // Third nod
      { props: { rotationX: -35, y: 8, transformPerspective: 600 }, duration: 0.15, ease: 'power2.out' },
      { props: { rotationX: 0, y: 0, transformPerspective: 600 }, duration: 0.15, ease: 'power2.in' },
    ],
    totalDuration: 0.9,
  },

  // ===========================
  // HEADSHAKE - Y-axis rotation shake (no)
  // ===========================
  headshake: {
    id: 'headshake',
    character: [
      // Ramping amplitude: starts smaller, builds up
      { props: { rotationY: -35, transformPerspective: 600 }, duration: 0.15, ease: 'power4.out' },
      { props: { rotationY: 40, transformPerspective: 600 }, duration: 0.18, ease: 'power4.inOut' },
      { props: { rotationY: -45, transformPerspective: 600 }, duration: 0.18, ease: 'power4.inOut' },
      { props: { rotationY: 50, transformPerspective: 600 }, duration: 0.18, ease: 'power4.inOut' },
      { props: { rotationY: -50, transformPerspective: 600 }, duration: 0.18, ease: 'power4.inOut' },
      { props: { rotationY: 0, transformPerspective: 600 }, duration: 0.2, ease: 'power2.inOut' },
    ],
    totalDuration: 1.07,
    resetRotationY: true,
  },

  // ===========================
  // LOOK-AROUND - Look left then right (eye-only)
  // Like holding [ for 1s then ] for 1s - doesn't interrupt idle
  // ===========================
  'look-around': {
    id: 'look-around',
    eyes: {
      shape: 'LOOK',
      duration: 0.15,
      xOffset: -12, // Start looking left
      bunch: 4,
    },
    eyePhases: [
      // Transition to looking right at 1.1s
      { position: 1.1, shape: 'LOOK', duration: 0.15, xOffset: 12, bunch: 4 },
      // Return to center at 2.2s
      { position: 2.2, shape: 'IDLE', duration: 0.15, xOffset: 0, bunch: 0 },
    ],
    character: [], // Eye-only, no body movement
    totalDuration: 2.35,
    preserveIdle: true, // Don't interrupt idle breathing
    resetIdle: false,
  },

  // ===========================
  // LOOK-LEFT - Eye-only look (no body movement)
  // Secondary action - doesn't interrupt main animation flow
  // ===========================
  'look-left': {
    id: 'look-left',
    eyes: {
      shape: 'LOOK',
      duration: 0.15,
      xOffset: -12,
      bunch: 4,
    },
    character: [], // Eye-only, no body movement
    totalDuration: 0.9,
    holdDuration: 0.6, // Hold before returning to idle
  },

  // ===========================
  // LOOK-RIGHT - Eye-only look (no body movement)
  // Secondary action - doesn't interrupt main animation flow
  // ===========================
  'look-right': {
    id: 'look-right',
    eyes: {
      shape: 'LOOK',
      duration: 0.15,
      xOffset: 12,
      bunch: 4,
    },
    character: [], // Eye-only, no body movement
    totalDuration: 0.9,
    holdDuration: 0.6, // Hold before returning to idle
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

  // ===========================
  // SMIZE - Eye-only happy eyes (smile with eyes)
  // No body movement - just happy eyes for ~1.5s
  // ===========================
  smize: {
    id: 'smize',
    eyes: {
      shape: 'HAPPY',
      duration: 0.2,
      yOffset: -8, // Slight lift like happy
    },
    character: [], // Eye-only, no body movement
    totalDuration: 1.5,
    holdDuration: 1.2, // Hold happy eyes before returning to idle
    resetIdle: false, // Don't restart idle from origin
    preserveIdle: true, // Keep breathing animation running during eye change
  },
};

/**
 * Get emotion config by type
 */
export function getEmotionConfig(emotion: EmotionType): EmotionConfig | undefined {
  return EMOTION_CONFIGS[emotion];
}
