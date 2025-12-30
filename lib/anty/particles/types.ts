/**
 * Particle System Types
 *
 * Type definitions for the canvas-based particle system.
 */

/**
 * Available particle types
 */
export type ParticleType = 'heart' | 'sparkle' | 'sweat' | 'zzz' | 'confetti';

/**
 * Particle object for canvas rendering
 */
export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number; // velocity x (pixels/second)
  vy: number; // velocity y (pixels/second)
  scale: number;
  rotation: number;
  rotationSpeed: number; // degrees per second (set once at creation)
  opacity: number;
  life: number; // 0-1, decreases over time
  color?: string;
}

/**
 * Configuration for a particle type
 */
export interface ParticleConfig {
  /** Lifetime in seconds */
  lifetime: number;
  /** Gravity in pixels/s² (negative = up, positive = down) */
  gravity: number;
  /** Initial velocity ranges */
  initialVelocity: {
    x: { min: number; max: number };
    y: { min: number; max: number };
  };
  /** Initial scale range */
  initialScale: { min: number; max: number };
  /** Rotation speed range in degrees/second */
  rotationSpeed: { min: number; max: number };
  /** When opacity fade starts (0-1, fraction of lifetime) */
  fadeStart: number;
}
