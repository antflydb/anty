# Particle System

Single source of truth for particle physics configuration.

## Files

| File | Purpose |
|------|---------|
| `types.ts` | `Particle`, `ParticleType`, `ParticleConfig` interfaces |
| `configs.ts` | `PARTICLE_CONFIGS` - physics tuning for each particle type |
| `index.ts` | Re-exports |

## Usage

```typescript
import { PARTICLE_CONFIGS, type Particle, type ParticleType } from '@/lib/anty-v3/particles';
```

## Config Structure

```typescript
export const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
  heart: {
    gravity: 80,        // pixels/second² (higher = falls faster)
    drag: 0.98,         // velocity retention per frame (0.98 = 2% loss)
    lifetime: 2.0,      // seconds before removal
    fadeStart: 0.7,     // when to start fading (0.7 = at 70% of lifetime)
    initialVelocity: {  // random range for spawn velocity
      minX: -100, maxX: 100,
      minY: -250, maxY: -150,
    },
    rotationSpeed: { min: -180, max: 180 },  // degrees/second
  },
  // ...
};
```

## Key Points

- All timing values are in **seconds** (not milliseconds)
- Physics runs at 60fps via `requestAnimationFrame` in `particle-physics.ts`
- Rendering handled by `components/anty-v3/anty-particle-canvas.tsx`
- Never duplicate these configs - always import from this directory
