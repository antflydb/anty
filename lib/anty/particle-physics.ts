/**
 * Particle Physics for Anty V3
 *
 * Physics constants, helper functions, and particle lifecycle management
 * for the canvas-based particle system.
 */

import type { Particle } from './particles';
import { PARTICLE_CONFIGS } from './particles';

/**
 * Generates a random value within a range.
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Gets velocity range for a specific particle type.
 */
export function getVelocityRange(type: Particle['type']): {
  x: { min: number; max: number };
  y: { min: number; max: number };
} {
  const config = PARTICLE_CONFIGS[type];
  return {
    x: config.initialVelocity.x,
    y: config.initialVelocity.y,
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
  const config = PARTICLE_CONFIGS[particle.type];

  // Apply gravity to velocity (gravity is in pixels/s²)
  const gravityEffect = config.gravity * deltaTime;
  const newVy = particle.vy + gravityEffect;

  // Update position based on velocity
  const newX = particle.x + particle.vx * deltaTime;
  const newY = particle.y + particle.vy * deltaTime;

  // Decrease lifetime (lifetime is in seconds)
  const newLife = particle.life - deltaTime / config.lifetime;

  // Calculate opacity based on remaining lifetime and fadeStart threshold
  let newOpacity = particle.opacity;

  if (newLife < config.fadeStart) {
    // Fade out linearly during the fade period
    newOpacity = newLife / config.fadeStart;
  }

  // Update rotation using particle's rotation speed
  const newRotation = particle.rotation + particle.rotationSpeed * deltaTime;

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
 */
export function isParticleExpired(particle: Particle): boolean {
  return particle.life <= 0 || particle.opacity <= 0;
}

/**
 * Creates a new particle with randomized properties.
 */
export function createParticle(
  type: Particle['type'],
  position: { x: number; y: number }
): Particle {
  const config = PARTICLE_CONFIGS[type];
  const velocity = config.initialVelocity;

  return {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    x: position.x,
    y: position.y,
    vx: randomInRange(velocity.x.min, velocity.x.max),
    vy: randomInRange(velocity.y.min, velocity.y.max),
    life: 1.0,
    opacity: 1.0,
    scale: randomInRange(config.initialScale.min, config.initialScale.max),
    rotation: randomInRange(0, 360),
    rotationSpeed: randomInRange(config.rotationSpeed.min, config.rotationSpeed.max),
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
      const config = PARTICLE_CONFIGS[type];
      const velocity = config.initialVelocity;

      return {
        ...particle,
        type,
        x: position.x,
        y: position.y,
        life: 1.0,
        opacity: 1.0,
        scale: randomInRange(config.initialScale.min, config.initialScale.max),
        rotation: randomInRange(0, 360),
        rotationSpeed: randomInRange(config.rotationSpeed.min, config.rotationSpeed.max),
        vx: randomInRange(velocity.x.min, velocity.x.max),
        vy: randomInRange(velocity.y.min, velocity.y.max),
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
