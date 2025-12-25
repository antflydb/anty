# Anty V3 Animation Definitions

Pure declarative animation functions that convert imperative GSAP code into testable, reusable animation timelines.

## Architecture

All animations are **pure functions** that:
- Accept DOM element references and configuration options
- Return GSAP timelines
- Have no side effects
- Are unit testable
- Use constants from `gsap-configs.ts`
- Are type-safe with TypeScript

## Files

### `idle.ts`
**Continuous breathing and floating animation**

```typescript
createIdleAnimation(elements, options?)
```

- Vertical floating (up/down motion)
- Gentle rotation synchronized with float
- Breathing scale (subtle size changes)
- Shadow inversely follows character movement

**Duration:** Infinite repeat with yoyo

### `emotions.ts`
**Emotional expression animations**

```typescript
createEmotionAnimation(emotion, elements, options?)
```

**Supported emotions:**
- `happy` - Wiggling rotation (6 oscillations)
- `excited` - Epic jump with 360° rotation and multi-bounce landing
- `sad` - Droop down with scale decrease
- `angry` - Horizontal shake with downward movement (3 cycles)
- `shocked` - Jump with bracket separation and shake
- `spin` - Y-axis 720° spin with jump

**Glow coordination:** All emotions coordinate glows at 75% distance with 0.05s lag

### `gestures.ts`
**Character gestures and micro-movements**

```typescript
createGestureAnimation(gesture, elements)
```

**Supported gestures:**
- `nod` - Vertical head nod (yes motion, 3 nods)
- `headshake` - Horizontal head shake (no motion, 5 snaps)
- `wink` - Subtle tilt and bounce

**Eye coordination:** Eyes contract/expand with head movements for natural feel

### `transitions.ts`
**State transition animations**

```typescript
createWakeUpAnimation(elements)
createPowerOffAnimation(elements)
```

**Wake-up (OFF → ON):**
- Three-phase choreography
- Jump up → pause at apex → drop down
- Shadow and glows fade in
- Total duration: ~0.55s

**Power-off (ON → OFF):**
- Simple fade-out with scale down
- All elements fade to OFF state
- Total duration: ~0.4s

### `morph.ts`
**Search bar morph animations**

```typescript
createSearchMorphAnimation(direction, elements, callbacks?)
```

**Direction 'in' (character → search bar):**
1. Anticipation squash (80ms)
2. Leap up with stretch (120ms)
3. Morph out to corners (350ms)
4. Search bar fades in (250ms)
5. UI elements reveal (180-300ms)
6. Breathing animation starts

**Direction 'out' (search bar → character):**
1. UI elements fade out (150ms)
2. Search bar fades out (200ms)
3. Brackets snap back with leap (250ms)
4. Settle down (170ms)
5. Character elements fade in

### `eye-animations.ts`
**Pure eye animation functions**

```typescript
createEyeAnimation(elements, shapeSpec, config?)
createBlinkAnimation(elements, config?)
createDoubleBlinkAnimation(elements, config?)
createLookAnimation(elements, config)
createReturnFromLookAnimation(elements, config?)
```

**Eye shape morphing:**
- Morphs eye SVG paths and container dimensions
- Supports asymmetric animations (left/right different shapes)
- Used for: happy, angry, sad, wink, looking, off states

**Blink animations:**
- `createBlinkAnimation` - Single blink (0.1s close + 0.15s open)
- `createDoubleBlinkAnimation` - Two quick blinks with pause

**Look animations:**
- Eyes morph from IDLE to LOOKING shape (shorter, wider)
- Horizontal translation with bunching effect
- Supports left/right directions

**Supported eye shapes:**
- `IDLE` - Default tall vertical pill
- `LOOKING` - Shorter, wider pill (for look left/right)
- `HAPPY_LEFT` / `HAPPY_RIGHT` - Curved bottom smile
- `ANGRY_LEFT` - Sharp angled top
- `SAD_LEFT` - Drooping bottom
- `WINK_LEFT` - Closed horizontal line
- `OFF_LEFT` - Angular triangular shape

### `eye-shapes.ts`
**Eye shape definitions**

```typescript
EYE_SHAPES // SVG path data for all eye shapes
EYE_DIMENSIONS // ViewBox and dimensions for each shape
```

All eye shapes are designed to morph smoothly between states using GSAP.

## Usage Examples

### Basic Idle Animation
```typescript
import { createIdleAnimation } from './definitions';

const timeline = createIdleAnimation({
  character: characterRef.current,
  shadow: shadowRef.current,
});

// Play the animation
timeline.play();
```

### Emotion with Glows
```typescript
import { createEmotionAnimation } from './definitions';

const timeline = createEmotionAnimation('excited', {
  character: characterRef.current,
  innerGlow: innerGlowRef.current,
  outerGlow: outerGlowRef.current,
});

timeline.play();
```

### Gesture with Eyes
```typescript
import { createGestureAnimation } from './definitions';

const timeline = createGestureAnimation('nod', {
  character: characterRef.current,
  leftEye: leftEyeRef.current,
  rightEye: rightEyeRef.current,
});

timeline.play();
```

### Wake-Up Transition
```typescript
import { createWakeUpAnimation } from './definitions';

const timeline = createWakeUpAnimation({
  character: characterRef.current,
  shadow: shadowRef.current,
  innerGlow: innerGlowRef.current,
  outerGlow: outerGlowRef.current,
});

timeline.play();
```

### Search Morph
```typescript
import { createSearchMorphAnimation } from './definitions';

const timeline = createSearchMorphAnimation('in', {
  character: characterRef.current,
  leftBody: leftBodyRef.current,
  rightBody: rightBodyRef.current,
  shadow: shadowRef.current,
  searchBar: searchBarRef.current,
  // ... other elements
}, {
  onShowSearchGlow: () => console.log('Show glow'),
  onComplete: () => console.log('Morph complete'),
});

timeline.play();
```

### Eye Animations
```typescript
import {
  createEyeAnimation,
  createBlinkAnimation,
  createLookAnimation
} from './definitions';

// Morph eyes to happy shape
const happyEyes = createEyeAnimation({
  leftEyePath: leftEyePathRef.current,
  rightEyePath: rightEyePathRef.current,
  leftEyeSvg: leftEyeSvgRef.current,
  rightEyeSvg: rightEyeSvgRef.current,
}, 'HAPPY_LEFT', { duration: 0.3 });

// Asymmetric animation (wink)
const wink = createEyeAnimation({
  leftEyePath: leftEyePathRef.current,
  rightEyePath: rightEyePathRef.current,
  leftEyeSvg: leftEyeSvgRef.current,
  rightEyeSvg: rightEyeSvgRef.current,
}, { left: 'WINK_LEFT', right: 'IDLE' });

// Single blink
const blink = createBlinkAnimation({
  leftEye: leftEyeRef.current,
  rightEye: rightEyeRef.current,
});

// Look left
const lookLeft = createLookAnimation({
  leftEye: leftEyeRef.current,
  rightEye: rightEyeRef.current,
  leftEyePath: leftEyePathRef.current,
  rightEyePath: rightEyePathRef.current,
  leftEyeSvg: leftEyeSvgRef.current,
  rightEyeSvg: rightEyeSvgRef.current,
}, { direction: 'left' });

happyEyes.play();
```

## Design Principles

### 1. Pure Functions
All animation functions are pure - same inputs always produce same outputs, no side effects.

### 2. Declarative API
Animations are described by what they do, not how to do it.

### 3. Composability
Timelines can be combined, sequenced, and controlled independently.

### 4. Type Safety
Full TypeScript types for all parameters and return values.

### 5. Testability
Pure functions with predictable outputs are easy to unit test.

### 6. Single Source of Truth
All timing constants come from `gsap-configs.ts` - one place to tune all animations.

## Constants

All timing, easing, and distance values are defined in `/lib/anty-v3/gsap-configs.ts`:

- `idleAnimationConfig` - Float, rotation, breathe settings
- `interactiveAnimationConfig` - Bounce, wiggle, tilt settings
- `expressionTransitionDuration` - Transition timing by speed
- `blinkTimingConfig` - Blink intervals and durations

## Glow Coordination

Glows follow character movement with:
- **Distance ratio:** 75% of character movement
- **Lag:** 0.05s delay after character

This creates natural "follow" behavior where glows trail slightly behind.

## Timeline Control

All functions return GSAP timelines which support:

```typescript
timeline.play()      // Start animation
timeline.pause()     // Pause animation
timeline.restart()   // Restart from beginning
timeline.reverse()   // Play in reverse
timeline.kill()      // Stop and cleanup
timeline.progress(0.5) // Seek to 50%
timeline.timeScale(2)  // 2x speed
```

## Future Enhancements

- Add animation presets/variants
- Support animation chaining helpers
- Add performance profiling
- Create animation playground/demo
- Add debug visualization mode
