# Animation Definitions

> Pure animation functions that build GSAP timelines from declarative configs.

## Files

| File | Purpose | Status |
|------|---------|--------|
| `emotions.ts` | All 14 emotion configs as data | Primary - edit this |
| `emotion-interpreter.ts` | Builds GSAP timelines from configs | Don't edit |
| `eye-shapes.ts` | SVG paths for eye morphs | Edit to change shapes |
| `eye-animations.ts` | Eye morph utilities | Don't edit |
| `idle.ts` | Float/breathe/blink animation | Working |
| `transitions.ts` | Wake-up/power-off | Working |
| `morph.ts` | Search bar transformation | Working - don't touch |

---

## emotions.ts

This is where you modify emotion behavior. Each emotion is a config object:

```typescript
export const EMOTION_CONFIGS = {
  happy: {
    id: 'happy',

    // Eye configuration
    eyes: {
      shape: 'HAPPY',         // or { left: 'HALF', right: 'CLOSED' } for asymmetric
      duration: 0.2,          // how long to morph eyes
      yOffset: -10.5,         // move eyes up (negative) or down (positive)
    },

    // Character animation phases (in sequence)
    character: [
      { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: 0 }, duration: 0.15, ease: 'power1.inOut' },
    ],

    // Optional: glow follows character
    glow: { follow: true },

    // Optional: body brackets separate (for shocked)
    body: { leftX: -15, rightX: 15, duration: 0.2 },

    totalDuration: 0.9,
  },
};
```

### Character Phase Properties

```typescript
props: {
  x?: number;        // horizontal movement (pixels)
  y?: number;        // vertical movement (pixels, negative = up)
  scale?: number;    // scale factor (1 = normal)
  rotation?: number; // Z-axis rotation (degrees)
  rotationY?: number; // Y-axis rotation (degrees, for 3D spin)
}
```

### Eye Shape Names

```
IDLE     - Default tall pill
HAPPY    - Curved bottom (smile)
SAD      - Drooping bottom
ANGRY    - Sharp angled top
CLOSED   - Horizontal line (blink)
HALF     - Half-closed
LOOK     - Shorter, wider (looking sideways)
OFF_LEFT / OFF_RIGHT - Triangular (powered off)
```

---

## eye-shapes.ts

SVG path data for each eye shape:

```typescript
export const EYE_SHAPES = {
  IDLE: 'M0 35.5C0 40.75 4.48 45 10 45C15.52 45 20 40.75 20 35.5V9.5C20 4.25 15.52 0 10 0C4.48 0 0 4.25 0 9.5V35.5Z',
  HAPPY: '...',
  // etc.
};

export const EYE_DIMENSIONS = {
  IDLE: { width: 20, height: 45, viewBox: '0 0 20 45' },
  HAPPY: { width: 20, height: 24, viewBox: '0 0 20 24' },
  // etc.
};
```

**Note:** Dimensions matter! GSAP morphs both the path AND the viewBox. If dimensions don't match, eyes will look wrong.

---

## emotion-interpreter.ts

You shouldn't need to edit this. It:
1. Takes an `EmotionConfig` from `emotions.ts`
2. Builds a GSAP timeline
3. Coordinates eyes, character movement, glows, body brackets

The same ~100 lines of code handles all 14 emotions.

---

## idle.ts

Creates the ambient float/breathe/blink animation:
- Character floats up/down
- Gentle rotation
- Shadow follows inversely
- Random blinks scheduled

---

## transitions.ts

- `createWakeUpAnimation()` - OFF → ON (jump up, pause, drop)
- `createPowerOffAnimation()` - ON → OFF (fade, scale down)

---

## morph.ts

Search bar transformation. Complex choreography:
- Character squashes
- Leaps up
- Morphs into search bar corners
- Search UI fades in

**Don't touch unless you're fixing search bugs.**

---

## Debugging Tips

### Check if emotion config is correct:
```javascript
// In browser console
console.log(EMOTION_CONFIGS.happy)
```

### Check if eye shape exists:
```javascript
console.log(EYE_SHAPES.HAPPY)
console.log(EYE_DIMENSIONS.HAPPY)
```

### Test emotion in isolation:
```javascript
antyAnimations.testEmotion('happy')
```

### Watch timeline execution:
Enable `ENABLE_ANIMATION_DEBUG_LOGS` in `feature-flags.ts`
