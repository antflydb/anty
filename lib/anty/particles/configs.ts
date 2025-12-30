/**
 * Particle Configuration
 *
 * Single source of truth for all particle type configurations.
 */

import type { ParticleType, ParticleConfig } from './types';

/**
 * Configuration for each particle type
 */
export const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
  heart: {
    lifetime: 2,
    gravity: -100, // floats up
    initialVelocity: {
      x: { min: -30, max: 30 },
      y: { min: -80, max: -120 },
    },
    initialScale: { min: 0.5, max: 0.8 },
    rotationSpeed: { min: -45, max: 45 },
    fadeStart: 0.6,
  },
  sparkle: {
    lifetime: 1.5,
    gravity: -50,
    initialVelocity: {
      x: { min: -50, max: 50 },
      y: { min: -60, max: -100 },
    },
    initialScale: { min: 0.5, max: 0.9 },
    rotationSpeed: { min: -180, max: 180 },
    fadeStart: 0.5,
  },
  sweat: {
    lifetime: 1.2,
    gravity: 150, // falls down
    initialVelocity: {
      x: { min: -20, max: 20 },
      y: { min: 0, max: 20 },
    },
    initialScale: { min: 0.4, max: 0.6 },
    rotationSpeed: { min: 0, max: 0 },
    fadeStart: 0.7,
  },
  zzz: {
    lifetime: 2.5,
    gravity: -30, // floats up slowly
    initialVelocity: {
      x: { min: 10, max: 30 },
      y: { min: -40, max: -60 },
    },
    initialScale: { min: 0.6, max: 0.9 },
    rotationSpeed: { min: -20, max: 20 },
    fadeStart: 0.7,
  },
  confetti: {
    lifetime: 3.0,
    gravity: 250, // falls with gravity
    initialVelocity: {
      x: { min: -150, max: 150 },
      y: { min: -300, max: -150 },
    },
    initialScale: { min: 0.6, max: 1.2 },
    rotationSpeed: { min: -360, max: 360 },
    fadeStart: 0.8,
  },
};
