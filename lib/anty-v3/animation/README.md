# Anty Animation System

> **STATUS: Work in Progress**
> Migrated from original GSAP demo. Core architecture is solid, but many emotion animations still have bugs (timing, eye positioning, etc.).

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
animation/
├── README.md                 # This file
├── types.ts                  # All TypeScript types
├── controller.ts             # AnimationController class
├── use-animation-controller.ts  # React hook
├── initialize.ts             # initializeCharacter() - sets initial GSAP state
├── state.ts                  # SimpleStateMachine (minimal)
├── constants.ts              # Timing constants, configs
├── feature-flags.ts          # Debug flags
├── dev-tools.ts              # Console debugging tools
│
└── definitions/
    ├── emotions.ts           # All 14 emotions as declarative config
    ├── emotion-interpreter.ts # Builds GSAP timelines from configs
    ├── eye-shapes.ts         # SVG path data for eye morphs
    ├── eye-animations.ts     # Eye morph utilities
    ├── idle.ts               # Idle float/breathe/blink
    ├── transitions.ts        # Wake-up, power-off
    └── morph.ts              # Search bar transformation
```

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
| lookaround | Look left then right | - |
| wink | Asymmetric eye close + tilt | Eye may be backwards |
| nod | Vertical head bob | - |
| headshake | Horizontal head shake | - |
| look-left | Eyes look left | - |
| look-right | Eyes look right | - |
| super | Glow + float up | - |

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
4. **Current refactor**:
   - Deleted StateMachine, ElementRegistry (were mostly bypassed with `force=true`)
   - Created declarative `EMOTION_CONFIGS` system
   - Single `interpretEmotionConfig()` replaces 1,000-line switch/case
   - Removed duplicate gesture definitions

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

- `morph.ts` - Search bar transformation (complex, tested)
- `transitions.ts` - Wake-up/power-off (working)
- `flappy-anty.tsx` - Flappy game (separate system)
