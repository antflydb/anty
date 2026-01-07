# Anty - Embeddable Animated AI Character

Anty is an embeddable animated character widget built with React, GSAP, and TypeScript. It provides expressive animations, eye morphing, particle effects, and integrates with search bars for AI-powered interfaces.

## Project Structure

This is a monorepo with the main package at `packages/anty-embed/`:

```
packages/anty-embed/
  src/
    components/           # React components
      AntyCharacter.tsx   # Main character component with all animations
      AntySearchBar.tsx   # Integrated search bar with morph animations
      AntyParticleCanvas.tsx  # Canvas-based particle system
      AntyChatPanel.tsx   # Chat panel integration
    hooks/
      use-animation-controller.ts  # Animation state management hook
      use-search-morph.ts          # Search bar morph animation hook
    lib/
      animation/
        types.ts          # Type definitions (EmotionType, AnimationState, etc.)
        state-machine.ts  # State machine with priority-based transitions
        constants.ts      # Animation timing constants (CRITICAL tuned values)
        controller.ts     # Animation controller implementation
        definitions/
          emotions.ts     # DECLARATIVE emotion configurations
          eye-shapes.ts   # SVG paths for eye morphing
          eye-animations.ts  # Eye animation helpers
          idle.ts         # Idle breathing/floating animations
          emotion-interpreter.ts  # Builds GSAP timelines from configs
      particles/          # Particle system (confetti, sparkles, hearts)
      chat/               # Chat integration with OpenAI
    types/index.ts        # SearchBarConfig exports
```

Root level hosts a Next.js demo app and playground.

## Animation System Architecture

### Declarative Emotions

Emotions are defined as **data, not code** in `lib/animation/definitions/emotions.ts`. Each emotion is a configuration object:

```typescript
{
  id: 'happy',
  eyes: { shape: 'HAPPY', duration: 0.2, yOffset: -10 },
  character: [
    { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
    { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
    // ... more phases
  ],
  glow: { follow: true },
  totalDuration: 0.9,
}
```

The `emotion-interpreter.ts` converts these configs into GSAP timelines at runtime.

### Available Emotions (18 total)

Positive scale: `celebrate` (5), `excited` (4), `happy` (3), `pleased` (2), `smize` (1)

Negative: `sad`, `angry`, `shocked`

Gestures: `wink`, `nod`, `headshake`, `spin`, `jump`, `idea`

Eye-only: `look-around`, `look-left`, `look-right`, `back-forth`

Special: `super` (power-up pulse)

### State Machine

States: `IDLE`, `EMOTION`, `TRANSITION`, `MORPH`, `INTERACTION`, `OFF`

Priority-based interruption: Higher priority animations can interrupt lower ones.
- OFF: 0, IDLE: 1, TRANSITION/MORPH: 2, INTERACTION: 3, EMOTION: 4

### Eye Shapes

Defined in `eye-shapes.ts` with SVG paths. Shapes are stored as "left eye" versions; right eye is generated via horizontal mirroring.

Available: `IDLE`, `HAPPY`, `LOOK`, `HALF`, `CLOSED`, `ANGRY`, `SAD`, `OFF_LEFT`, `OFF_RIGHT`

### Glow Coordination

Glows follow character movement at 75% distance with 0.05s lag (see `GLOW_CONSTANTS`).

## Adding a New Emotion

1. Add the emotion name to `EmotionType` union in `lib/animation/types.ts`
2. Add the configuration to `EMOTION_CONFIGS` in `lib/animation/definitions/emotions.ts`
3. Map it in `AntyCharacter.tsx` `validEmotions` object (around line 897)
4. (Optional) Add particle effects in the `onEmotionMotionStart` callback

Example minimal emotion:
```typescript
'my-emotion': {
  id: 'my-emotion',
  eyes: { shape: 'HAPPY', duration: 0.2 },
  character: [
    { props: { y: -20 }, duration: 0.3, ease: 'power2.out' },
    { props: { y: 0 }, duration: 0.3, ease: 'power2.in' },
  ],
  totalDuration: 0.6,
}
```

## Key Files

| File | Purpose |
|------|---------|
| `packages/anty-embed/src/lib/animation/definitions/emotions.ts` | All emotion configurations |
| `packages/anty-embed/src/lib/animation/types.ts` | Type definitions |
| `packages/anty-embed/src/lib/animation/constants.ts` | Animation timing constants |
| `packages/anty-embed/src/lib/animation/state-machine.ts` | State transition logic |
| `packages/anty-embed/src/lib/animation/definitions/eye-shapes.ts` | Eye SVG paths |
| `packages/anty-embed/src/components/AntyCharacter.tsx` | Main component |
| `packages/anty-embed/src/hooks/use-animation-controller.ts` | Animation hook |

## Development

```bash
# Root: Run Next.js demo app
npm run dev

# Build the embed package
cd packages/anty-embed && npm run build

# Watch mode for package development
cd packages/anty-embed && npm run dev
```

## Technologies

- **React 18/19** with refs and imperative handles
- **GSAP** for high-performance animations
- **TypeScript** strict mode
- **Rollup** for package bundling
- **Next.js 15** for demo/playground

## Important Notes

- Animation constants in `constants.ts` are carefully tuned. Values marked CRITICAL work in coordination - changing one may require adjusting others.
- Eye shapes use consistent point ordering for smooth SVG morphing.
- The `frozen` prop disables all animations for static display.
- The `logoMode` prop shows OFF eyes at full color without shadow/glow.
- Particle effects (confetti, sparkles) are spawned via canvas in `AntyParticleCanvas`.
