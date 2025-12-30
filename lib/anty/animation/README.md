# Anty Animation System

GSAP-based character animation with declarative emotion configs.

## Architecture

```
AntyCharacter (component)
    │ refs
    ▼
useAnimationController (hook)
    │
    ▼
AnimationController (class)
    │
    ├── EMOTION_CONFIGS (declarative data)
    │       ▼
    │   interpretEmotionConfig() → GSAP timeline
    │
    ├── createIdleAnimation() → float/breathe/blink
    │
    └── Glow/Shadow systems
```

**Key principle:** Emotions are data, not code. The interpreter builds GSAP timelines from config objects.

## File Map

```
animation/
├── controller.ts            # AnimationController class - owns all state
├── use-animation-controller.ts  # React hook wrapper
├── initialize.ts            # Initial GSAP.set() calls on mount
├── types.ts                 # EmotionType, ExpressionName, etc.
├── constants.ts             # Timing values (IDLE_FLOAT, SHADOW, etc.)
├── feature-flags.ts         # ENABLE_ANIMATION_DEBUG_LOGS
│
└── definitions/
    ├── emotions.ts          # EMOTION_CONFIGS - all 14 emotions
    ├── emotion-interpreter.ts   # Builds timelines from configs
    ├── eye-shapes.ts        # SVG paths + dimensions
    ├── eye-animations.ts    # Eye morph utilities
    ├── idle.ts              # Float/breathe/blink loops
    └── transitions.ts       # Wake-up, power-off
```

## Emotions

Defined in `definitions/emotions.ts`:

```typescript
'happy': {
  id: 'happy',
  eyes: { shape: 'HAPPY', duration: 0.2, yOffset: -10.5 },
  character: [
    { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
    { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
    // ...
  ],
  totalDuration: 0.9,
}
```

Available: `happy`, `excited`, `celebrate`, `pleased`, `smize`, `sad`, `angry`, `shocked`, `spin`, `wink`, `jump`, `idea`, `nod`, `headshake`, `look-left`, `look-right`, `super`

### Adding an emotion

1. Add to `EmotionType` in `types.ts`
2. Add config to `EMOTION_CONFIGS` in `definitions/emotions.ts`
3. Test: `antyAnimations.testEmotion('your-emotion')` in console

## Eye System

Shapes defined in `definitions/eye-shapes.ts`. Left/right are from **viewer's perspective**.

```typescript
EYE_SHAPES.IDLE   // Default tall pill
EYE_SHAPES.HAPPY  // Curved bottom
EYE_SHAPES.CLOSED // Horizontal line (blink)
EYE_SHAPES.LOOK   // Shorter, wider
```

Asymmetric animations:
```typescript
eyes: { shape: { left: 'HALF', right: 'CLOSED' } }
```

## Idle Animation

`createIdleAnimation()` returns:
- `timeline`: Float/breathe/rotation loop
- `pauseBlinks()` / `resumeBlinks()`: Spontaneous action control
- `killBlinks()`: Stop scheduler

Spontaneous actions (during idle):
- Single blink (72%), double blink (18%), look-left (5%), look-right (5%)

## Initialization

`initializeCharacter()` sets all animatable properties via `gsap.set()` on mount. GSAP must "own" properties to animate them cleanly.

## Debugging

```typescript
// feature-flags.ts
export const ENABLE_ANIMATION_DEBUG_LOGS = true;

// Console
antyAnimations.getSystemInfo()
antyAnimations.testEmotion('happy')
```

## Particles

See `lib/anty/particles/README.md`. Config in `particles/configs.ts`, physics in `particle-physics.ts`, rendering in `anty-particle-canvas.tsx`.
