# Anty Animation System

> **STATUS: Refactored & Consolidated**
> Clean architecture with single sources of truth. Some emotion animations may still need tuning (timing, eye positioning).

## Quick Reference for Debugging

### Where things are defined:

| What | Where |
|------|-------|
| All emotions (data) | `definitions/emotions.ts` |
| Eye shapes (SVG paths) | `definitions/eye-shapes.ts` |
| Emotion interpreter | `definitions/emotion-interpreter.ts` |
| Controller hook | `use-animation-controller.ts` |
| Type definitions | `types.ts` |

### To add/modify an emotion:

Edit `definitions/emotions.ts` → find the emotion → change the config. That's it.

### To debug an emotion:

1. Check `EMOTION_CONFIGS[emotionName]` in `definitions/emotions.ts`
2. Check eye shape in `EYE_SHAPES[shapeName]` in `definitions/eye-shapes.ts`
3. Run with `ENABLE_ANIMATION_DEBUG_LOGS = true` in `feature-flags.ts`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  anty-character-v3.tsx                                          │
│  - Renders DOM elements                                         │
│  - Passes refs to controller                                    │
│  - NO animation logic here                                      │
└─────────────────────────────────────────────────────────────────┘
                              │ refs
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  useAnimationController (use-animation-controller.ts)           │
│  - React hook that wraps AnimationController                    │
│  - Calls initializeCharacter() on mount                         │
│  - Thin layer: just calls controller methods                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AnimationController (controller.ts)                            │
│  - Owns ALL animation state                                     │
│  - Manages idle timeline                                        │
│  - Coordinates emotions, transitions, morphs                    │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ EMOTION_CONFIGS │ │ createIdle...   │ │ createMorph...  │
│ (emotions.ts)   │ │ (idle.ts)       │ │ (morph.ts)      │
│                 │ │                 │ │                 │
│ Declarative     │ │ Idle float/     │ │ Search bar      │
│ emotion data    │ │ breathe/blink   │ │ transformation  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  interpretEmotionConfig (emotion-interpreter.ts)                │
│  - Takes EmotionConfig data                                     │
│  - Returns GSAP timeline                                        │
│  - Generic: same code for all emotions                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
lib/anty-v3/
├── ui-types.ts               # ButtonName type (shared with components)
├── particle-physics.ts       # Particle simulation logic
│
├── particles/                # Particle system
│   ├── types.ts              # Particle, ParticleType, ParticleConfig
│   ├── configs.ts            # PARTICLE_CONFIGS (single source of truth)
│   └── index.ts              # Re-exports
│
└── animation/
    ├── README.md             # This file
    ├── types.ts              # EmotionType, ExpressionName, all animation types
    ├── controller.ts         # AnimationController class
    ├── use-animation-controller.ts  # React hook + AnimationElements interface
    ├── initialize.ts         # initializeCharacter() + resetEyesToIdle()
    ├── state-machine.ts      # StateMachine (used by controller)
    ├── constants.ts          # IDLE_*, SHADOW, EXPRESSION_TRANSITIONS
    ├── feature-flags.ts      # Debug flags
    ├── dev-tools.ts          # Console debugging tools
    ├── test-utils.ts         # Testing utilities for dev-tools
    │
    └── definitions/
        ├── emotions.ts       # All 14 emotions as declarative config
        ├── emotion-interpreter.ts # Builds GSAP timelines from configs
        ├── eye-shapes.ts     # SVG paths for eye morphs (L/R mirroring)
        ├── eye-animations.ts # Eye morph utilities
        ├── idle.ts           # Idle float/breathe/blink
        ├── transitions.ts    # Wake-up, power-off
        └── morph.ts          # Search bar transformation
```

---

## Single Sources of Truth

| Config | Location | Usage |
|--------|----------|-------|
| Idle animation timing | `animation/constants.ts` (`IDLE_FLOAT`, `IDLE_ROTATION`, etc.) | idle.ts imports these |
| Particle configs | `particles/configs.ts` (`PARTICLE_CONFIGS`) | particle-physics.ts imports |
| Expression transitions | `animation/constants.ts` (`EXPRESSION_TRANSITIONS`) | expression-layer imports |
| Eye shapes | `definitions/eye-shapes.ts` (`EYE_SHAPES`, `EYE_DIMENSIONS`) | All eye rendering |
| Emotion configs | `definitions/emotions.ts` (`EMOTION_CONFIGS`) | emotion-interpreter.ts |
| UI button names | `ui-types.ts` (`ButtonName`) | Components import this |

**CRITICAL**: Never duplicate configs. Always import from the canonical source.

---

## How Emotions Work

### 1. Emotion Config (definitions/emotions.ts)

Emotions are defined as **data**, not code:

```typescript
export const EMOTION_CONFIGS = {
  happy: {
    id: 'happy',
    eyes: {
      shape: 'HAPPY',           // Eye shape to morph to
      duration: 0.2,            // Eye morph duration
      yOffset: -10.5,           // Move eyes up (negative = up)
    },
    character: [                // Character animation phases
      { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
      // ... wiggle pattern
    ],
    totalDuration: 0.9,
  },
  // ... 13 more emotions
};
```

### 2. Interpreter (definitions/emotion-interpreter.ts)

Generic function that builds GSAP timeline from config:

```typescript
function interpretEmotionConfig(config: EmotionConfig, elements): gsap.core.Timeline {
  const timeline = gsap.timeline();

  // Add eye animation
  if (config.eyes) {
    timeline.add(createEyeAnimation(...), 0);
  }

  // Add character phases
  for (const phase of config.character) {
    timeline.to(character, { ...phase.props, duration, ease });
  }

  return timeline;
}
```

### 3. Available Emotions

| Emotion | Description | Known Issues |
|---------|-------------|--------------|
| happy | Wiggle rotation | - |
| excited | Jump + 360° spin + bounces | - |
| sad | Droop down | Eye positioning may be off |
| angry | Shake + drop | Eye rotation needs tuning |
| shocked | Jump + bracket separation | - |
| spin | Y-axis 720° spin | - |
| jump | Jump up and down | Was "idea", renamed |
| back-forth | Look left then right | - |
| wink | Asymmetric eye close + tilt | Eye may be backwards |
| nod | Vertical head bob | - |
| headshake | Horizontal head shake | - |
| look-left | Eyes look left (eye-only) | - |
| look-right | Eyes look right (eye-only) | - |
| super | Glow + float up | - |

---

## Spontaneous Actions

The idle animation includes a spontaneous action scheduler that triggers random eye-only animations during idle state. The scheduler is **paused during emotion animations** and **resumed when returning to idle**.

### How it works:

1. `createIdleAnimation` returns an `IdleAnimationResult` object:
   ```typescript
   interface IdleAnimationResult {
     timeline: gsap.core.Timeline;
     pauseBlinks: () => void;   // Kills pending timer
     resumeBlinks: () => void;  // Schedules fresh 5-12s delay
     killBlinks: () => void;    // Stops scheduler permanently
   }
   ```
2. Controller stores the controls alongside the idle timeline
3. `pauseIdle()` calls `pauseBlinks()` - kills any pending timer
4. `resumeIdle()` calls `resumeBlinks()` - schedules a fresh random delay
5. `killIdle()` calls `killBlinks()` - stops the scheduler entirely

### Current spontaneous actions (eye-only):
- **Single blink** (72%): Quick eye close and open
- **Double blink** (18%): Two quick blinks in succession
- **Look left** (5%): Eyes shift left with bunching, hold, return
- **Look right** (5%): Eyes shift right with bunching, hold, return

### Single source of truth:
- Spontaneous looks use `createLookAnimation()` from `eye-animations.ts`
- Manual look-left/look-right emotions use the same eye config (shape, xOffset, bunch)
- Both are eye-only (no body movement)

### Timing:
- Random delay between actions: 5-12 seconds
- When paused, no timers fire (clean, no wasted callbacks)
- When resumed, a fresh random delay is scheduled

---

## Eye System

### Eye Shapes (definitions/eye-shapes.ts)

```typescript
export const EYE_SHAPES = {
  IDLE: 'M... (SVG path)',      // Default tall pill
  HAPPY: 'M... (SVG path)',     // Curved bottom (smile)
  SAD: 'M... (SVG path)',       // Drooping
  ANGRY: 'M... (SVG path)',     // Sharp angled
  CLOSED: 'M... (SVG path)',    // Horizontal line (blink/wink)
  HALF: 'M... (SVG path)',      // Half-closed
  LOOK: 'M... (SVG path)',      // Shorter, wider (looking)
  // ... OFF shapes for powered-off state
};

export const EYE_DIMENSIONS = {
  IDLE: { width: 20, height: 45, viewBox: '0 0 20 45' },
  // ... each shape has dimensions
};
```

### Left/Right Convention

**IMPORTANT:** Left/right are from **VIEWER's perspective**, not character's.

- `leftEyeRef` = the eye on the LEFT side of the screen (viewer's left)
- `rightEyeRef` = the eye on the RIGHT side of the screen (viewer's right)

For asymmetric animations (like wink):
```typescript
eyes: {
  shape: { left: 'HALF', right: 'CLOSED' },  // Viewer's left=half, right=closed
}
```

---

## Particle System

Particles are managed in `lib/anty-v3/particles/`:

```typescript
// particles/configs.ts
export const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
  heart: {
    gravity: 80,       // pixels/second²
    drag: 0.98,        // velocity retention
    lifetime: 2.0,     // seconds
    fadeStart: 0.7,    // 70% through lifetime
    initialVelocity: { minX: -100, maxX: 100, minY: -250, maxY: -150 },
    rotationSpeed: { min: -180, max: 180 },
    // ...
  },
  sparkle: { /* ... */ },
  confetti: { /* ... */ },
};
```

**Key points:**
- All timing values are in **seconds** (not milliseconds)
- Physics runs at 60fps via `requestAnimationFrame`
- `anty-particle-canvas.tsx` renders the particles
- `particle-physics.ts` handles the simulation

---

## Initialization

### initializeCharacter() (initialize.ts)

Called once on mount. Sets ALL animatable properties via `gsap.set()`:

```typescript
function initializeCharacter(elements, { isOff }) {
  // Character
  gsap.set(character, { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 });

  // Eyes - IDLE shape
  gsap.set([eyeLeftPath, eyeRightPath], { attr: { d: EYE_SHAPES.IDLE } });
  gsap.set([eyeLeft, eyeRight], { width: 20, height: 45, x: 0, y: 0 });

  // Shadow, glows...
}
```

**Why this matters:** GSAP can only animate properties it "owns". If CSS or inline styles set a property, GSAP may fight with them. By setting everything via `gsap.set()` at init, GSAP owns all animatable properties.

---

## Debugging

### Enable Logging

In `feature-flags.ts`:
```typescript
export const ENABLE_ANIMATION_DEBUG_LOGS = true;
```

### Console Dev Tools

In browser console:
```javascript
antyAnimations.getSystemInfo()    // Check what's active
antyAnimations.testEmotion('happy')  // Test specific emotion
antyAnimations.showMappings()     // See emotion mappings
```

### Debug Overlay

The `<AnimationDebugOverlay>` component shows:
- Current animation sequence
- Character position over time
- Snapshot cards for each animation

---

## Known Issues & Bugs

### High Priority
- [ ] Some eye shapes may be positioned incorrectly after morph
- [ ] Wink eye may be reversed (left vs right)
- [ ] Sad/angry eye rotations need tuning

### Medium Priority
- [ ] Glow following may lag incorrectly on some emotions
- [ ] Body bracket animations (shocked) may be off

### Low Priority
- [ ] Animation timing could be more polished
- [ ] Some emotions feel "robotic" vs organic

---

## Migration History

This system was migrated from an original GSAP demo in stages:

1. **Original**: Inline GSAP code scattered throughout component
2. **First refactor**: Created AnimationController + StateMachine + ElementRegistry
3. **Overengineered**: StateMachine grew to 254 lines, ElementRegistry to 217 lines
4. **Declarative refactor**:
   - Deleted StateMachine, ElementRegistry (were mostly bypassed with `force=true`)
   - Created declarative `EMOTION_CONFIGS` system
   - Single `interpretEmotionConfig()` replaces 1,000-line switch/case
   - Removed duplicate gesture definitions
5. **Architecture cleanup**:
   - Deleted `animation-state.ts` and `gsap-configs.ts` (~380 lines of duplicate code)
   - Created `particles/` directory with single source of truth for particle configs
   - Consolidated `resetEyesToIdle()` into `initialize.ts` (was duplicated)
   - Moved `ButtonName` to `ui-types.ts`
   - Added `EXPRESSION_TRANSITIONS` to `constants.ts`
   - Removed 10 unimplemented emotions from types (prevented runtime crashes)
6. **Dead code removal** (current):
   - Deleted `expression-engine.ts` (64 lines, never used)
   - Deleted `state.ts` / `SimpleStateMachine` (79 lines, never imported)
   - Removed duplicate `AnimationElements` interface from `types.ts` (canonical version in `use-animation-controller.ts`)
   - Fixed all lint errors in animation system (0 errors, 0 warnings)

---

## Adding a New Emotion

1. Add to `EmotionType` union in `types.ts`:
   ```typescript
   export type EmotionType = 'happy' | 'sad' | ... | 'my-new-emotion';
   ```

2. Add config to `definitions/emotions.ts`:
   ```typescript
   'my-new-emotion': {
     id: 'my-new-emotion',
     eyes: { shape: 'HAPPY', duration: 0.2 },
     character: [
       { props: { y: -20 }, duration: 0.3, ease: 'power2.out' },
       { props: { y: 0 }, duration: 0.3, ease: 'power2.in' },
     ],
     totalDuration: 0.6,
   },
   ```

3. Test it:
   ```javascript
   antyAnimations.testEmotion('my-new-emotion')
   ```

---

## Files NOT to Touch (They Work)

- `state-machine.ts` - FSM for animation states (used by controller)
- `definitions/morph.ts` - Search bar transformation (complex, tested)
- `definitions/transitions.ts` - Wake-up/power-off (working)
- `definitions/eye-shapes.ts` - SVG paths for eyes (L/R mirroring works)
- `particles/configs.ts` - Particle physics configs (unless adding new types)
- `constants.ts` - Critical timing values (marked with CRITICAL comments)
- `components/anty-v3/flappy-game.tsx` - Flappy game (separate system)

## Files You CAN Edit

- `definitions/emotions.ts` - Add/modify emotion animations
- `feature-flags.ts` - Toggle debug logging
