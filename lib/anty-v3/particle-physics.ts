/**
 * Particle Physics for Anty V3
 *
 * Physics constants, helper functions, and particle lifecycle management
 * for the canvas-based particle system.
 */

import type { Particle } from './animation-state';
import { particleConfigs } from './gsap-configs';

/**
 * Gravity constant applied to all particles.
 * Positive values pull particles down, negative values push them up.
 */
export const GRAVITY = 0.5;

/**
 * Generates a random value within a range.
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number between min and max
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Gets velocity range for a specific particle type.
 *
 * @param type - Particle type
 * @returns Velocity range {x: [min, max], y: [min, max]}
 */
export function getVelocityRange(type: Particle['type']): {
  x: [number, number];
  y: [number, number];
} {
  const config = particleConfigs[type];
  return {
    x: config.velocity.x as [number, number],
    y: config.velocity.y as [number, number],
  };
}

/**
 * Updates a particle's position and physics properties based on elapsed time.
 *
 * @param particle - The particle to update
 * @param deltaTime - Time elapsed since last update (in seconds)
 * @returns Updated particle object
 */
export function updateParticle(particle: Particle, deltaTime: number): Particle {
  const config = particleConfigs[particle.type];

  // Apply gravity to velocity
  const gravityEffect = config.gravity * deltaTime * 100; // Scale for visibility
  const newVy = particle.vy + gravityEffect;

  // Update position based on velocity
  const newX = particle.x + particle.vx * deltaTime;
  const newY = particle.y + particle.vy * deltaTime;

  // Decrease lifetime
  const newLife = particle.life - deltaTime / (config.lifetime / 1000);

  // Calculate opacity based on remaining lifetime and fadeStart threshold
  let newOpacity = particle.opacity;

  if (newLife < config.fadeStart) {
    // Fade out linearly during the fade period
    newOpacity = newLife / config.fadeStart;
  }

  // Update rotation (for visual variety)
  const rotationSpeed = 45; // degrees per second
  const newRotation = particle.rotation + rotationSpeed * deltaTime;

  return {
    ...particle,
    x: newX,
    y: newY,
    vx: particle.vx,
    vy: newVy,
    life: Math.max(0, newLife),
    opacity: Math.max(0, newOpacity),
    rotation: newRotation % 360,
  };
}

/**
 * Checks if a particle has expired and should be removed.
 *
 * @param particle - The particle to check
 * @returns True if the particle is expired
 */
export function isParticleExpired(particle: Particle): boolean {
  return particle.life <= 0 || particle.opacity <= 0;
}

/**
 * Creates a new particle with randomized properties.
 *
 * @param type - Type of particle to create
 * @param position - Starting position {x, y}
 * @returns New particle object
 */
export function createParticle(
  type: Particle['type'],
  position: { x: number; y: number }
): Particle {
  const config = particleConfigs[type];
  const velocityRange = getVelocityRange(type);

  return {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    x: position.x,
    y: position.y,
    vx: randomInRange(velocityRange.x[0], velocityRange.x[1]),
    vy: randomInRange(velocityRange.y[0], velocityRange.y[1]),
    life: 1.0,
    opacity: 1.0,
    scale: randomInRange(0.6, 1.0),
    rotation: randomInRange(0, 360),
  };
}

/**
 * Particle pool for efficient memory management.
 * Reuses particle objects instead of creating new ones.
 */
class ParticlePool {
  private pool: Particle[] = [];
  private maxSize = 100;

  /**
   * Returns a particle to the pool for reuse.
   */
  public release(particle: Particle): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(particle);
    }
  }

  /**
   * Gets a particle from the pool or creates a new one.
   */
  public acquire(
    type: Particle['type'],
    position: { x: number; y: number }
  ): Particle {
    const particle = this.pool.pop();

    if (particle) {
      // Reuse existing particle, reset properties
      const config = particleConfigs[type];
      const velocityRange = getVelocityRange(type);

      return {
        ...particle,
        type,
        x: position.x,
        y: position.y,
        life: 1.0,
        opacity: 1.0,
        scale: randomInRange(0.6, 1.0),
        rotation: randomInRange(0, 360),
        vx: randomInRange(velocityRange.x[0], velocityRange.x[1]),
        vy: randomInRange(velocityRange.y[0], velocityRange.y[1]),
      };
    }

    // Pool empty, create new particle
    return createParticle(type, position);
  }

  /**
   * Clears the pool.
   */
  public clear(): void {
    this.pool = [];
  }
}

/**
 * Global particle pool instance.
 */
export const particlePool = new ParticlePool();
