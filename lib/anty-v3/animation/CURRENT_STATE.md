# Current Animation System State (Pre-Fix)

**Status:** DUAL SYSTEM CONFLICT
**Created:** 2025-12-23
**Purpose:** Document the "before" state for troubleshooting

## Problem Summary

Two animation systems are running simultaneously and fighting for control of the same eye elements, causing backwards blinks and glitchy animations.

## System 1: OLD `useEyeAnimations` Hook

**File:** `/lib/anty-v3/use-eye-animations.ts` (490 lines)
**Status:** ⚠️ STILL RUNNING (should have been deleted)

### Integration Points

**Import:** Line 15 in `anty-character-v3.tsx`
```typescript
import { useEyeAnimations } from '@/lib/anty-v3/use-eye-animations';
```

**Initialization:** Lines 126-133 in `anty-character-v3.tsx`
```typescript
const { performBlink, performDoubleBlink, allowBlinkingRef } = useEyeAnimations({
  leftEyeRef,
  rightEyeRef,
  leftEyePathRef,
  rightEyePathRef,
  expression,
  isOff,
});
```

**Blink Functions Exposed:**
- `performBlink()` - Single blink animation
- `performDoubleBlink()` - Double blink animation
- `allowBlinkingRef` - Permission control ref

### Animations Handled by OLD System

1. **Blink Animations** (lines 151-243)
   - Single blink: scaleY 1 → 0.05 → 1
   - Double blink: Two quick blinks with pause
   - Timing: 0.1s close, 0.15s open

2. **Expression-Based Eye Transforms** (lines 273-479)
   - `shocked`: Scale eyes to 1.4x (lines 303-320)
   - `idea`: Scale to 1.15x + move up 8px (lines 361-388)
   - `look-left`: Morph to LOOKING + move left (lines 391-433)
   - `look-right`: Morph to LOOKING + move right (lines 436-478)

3. **Blink Permission Management** (lines 253-263)
   - Enables blinking only during `idle` expression
   - Disables for all other expressions
   - 300ms delay before re-enabling

### Element Ownership (OLD System)

**Elements Controlled:**
- `leftEyeRef.current` - Left eye container
- `rightEyeRef.current` - Right eye container
- `leftEyePathRef.current` - Left eye SVG path
- `rightEyePathRef.current` - Right eye SVG path

**GSAP Operations:**
- `gsap.to()` - Blinks, shocked, idea animations
- `gsap.killTweensOf()` - Cleanup on expression change
- `gsap.set()` - Reset transforms

## System 2: NEW `useAnimationController` Hook

**File:** `/lib/anty-v3/animation/use-animation-controller.ts`
**Status:** ✅ RUNNING (feature flag: `USE_NEW_ANIMATION_CONTROLLER = true`)

### Integration Points

**Import:** Line 16 in `anty-character-v3.tsx`
```typescript
import { useAnimationController } from '@/lib/anty-v3/animation/use-animation-controller';
```

**Initialization:** Lines 142-187 in `anty-character-v3.tsx`
```typescript
const animationController = useAnimationController(
  {
    container: containerRef.current,
    character: characterRef.current,
    shadow: shadowElement,
    eyeLeft: leftEyeRef.current,
    eyeRight: rightEyeRef.current,
    eyeLeftPath: leftEyePathRef.current,
    eyeRightPath: rightEyePathRef.current,
    eyeLeftSvg: leftEyeSvgRef.current,
    eyeRightSvg: rightEyeSvgRef.current,
    leftBody: leftBodyRef.current,
    rightBody: rightBodyRef.current,
  },
  { /* config */ }
);
```

### Animations Handled by NEW System

1. **Idle Animation** (via `createIdleAnimation`)
   - Floating: y -12px with yoyo
   - Rotation: 2° gentle tilt
   - Breathing: scale 1.02x
   - Shadow: Inverse scaling/fading
   - Duration: 2.5s per cycle

2. **Emotion Animations** (via `createEmotionAnimation`)
   - `happy`: Bounce + scale + eye morph to HAPPY_LEFT/RIGHT
   - `excited`: Jump + rotation + eye morph
   - `sad`: Droop + eye morph to SAD_LEFT
   - `angry`: Shake + eye morph to ANGRY_LEFT
   - `shocked`: Quick scale + eye morph (NOT using OLD shocked transform)
   - `spin`: 360° rotation

3. **Power-Off Animation**
   - Fade to 0.45 opacity
   - Scale down with bounce
   - Eye morph to OFF_LEFT/RIGHT (triangular shapes)

4. **Search Mode Handling**
   - Pause idle when entering search
   - Restore eyes to IDLE when exiting search
   - Resume idle after restoration

### Element Ownership (NEW System)

**Elements Controlled:**
- Same eye elements as OLD system! ⚠️ CONFLICT
- Plus: character, shadow, leftBody, rightBody
- Eye operations go through `createEyeAnimation()` factory

## Dual System Conflict Points

### Conflict 1: Spontaneous Blink Scheduler

**Location:** Lines 723-779 in `anty-character-v3.tsx`

**Problem:**
```typescript
useGSAP(() => {
  const scheduleRandomBehavior = () => {
    // ... scheduling logic ...

    if (random < 0.2) {
      performDoubleBlinkRef.current(); // ← Calls OLD system!
    } else if (random < 0.9) {
      performBlinkRef.current(); // ← Calls OLD system!
    }
    // ...
  };
}, { dependencies: [] }); // ← Single scheduler created on mount
```

**Impact:**
- Spontaneous blinking uses OLD system exclusively
- NEW system has NO blinking functionality yet
- Both systems can animate eyes simultaneously

### Conflict 2: Eye Element Competition

**Elements:** `leftEyeRef`, `rightEyeRef`, `leftEyePathRef`, `rightEyePathRef`

**OLD System Access:**
- Direct GSAP operations via `gsap.to()`
- No element registry or locking
- No awareness of NEW system

**NEW System Access:**
- Operations via `createEyeAnimation()` factory
- No element registry or locking
- No awareness of OLD system

**Result:** Both systems can create competing GSAP tweens on same elements simultaneously

### Conflict 3: Expression-Based Animations

**OLD System Handles:**
- `shocked` → Scale transform (lines 303-320)
- `idea` → Scale + translate transform (lines 361-388)
- `look-left`, `look-right` → Morph + translate (lines 391-478)

**NEW System Handles:**
- `shocked` → Eye morph via `createEmotionAnimation`
- `idea` → Not implemented yet
- `look-left`, `look-right` → Not implemented yet

**Current Behavior:**
- For `shocked`: OLD system applies scale, NEW system might morph
- Result: Competing animations, undefined behavior

### Conflict 4: Blink Permission

**OLD System:**
- `allowBlinkingRef.current` controls blink permission
- Disabled during non-idle expressions
- 300ms re-enable delay

**NEW System:**
- No blink permission system yet
- No blinking functionality yet

**Problem:** When NEW system is active, there's no blinking at all (relies on OLD system's scheduler)

## Animation Flow Comparison

### Current Flow (BROKEN)

```
1. Component mounts
   ├─ OLD system initializes (useEyeAnimations)
   └─ NEW system initializes (useAnimationController)

2. Idle state
   ├─ NEW system: Floating/breathing animation
   └─ OLD system: Spontaneous blink scheduler (5-12s intervals)
       └─ Calls OLD performBlink() → scaleY animation

3. Expression changes to 'happy'
   ├─ OLD system: Disables blinking (allowBlinkingRef = false)
   └─ NEW system: Plays happy emotion animation
       └─ Morphs eyes to HAPPY_LEFT/RIGHT

4. Expression changes to 'shocked'
   ├─ OLD system: Applies scale transform (1.4x)
   └─ NEW system: Might try to morph eyes
       └─ CONFLICT: Both animating same elements!

5. Spontaneous blink triggered (during any state)
   ├─ OLD system: performBlink() → scaleY animation
   └─ NEW system: Might be morphing eyes at same time
       └─ CONFLICT: Competing tweens → backwards blink!
```

### Desired Flow (FIXED)

```
1. Component mounts
   └─ ONLY NEW system initializes (useAnimationController)

2. Idle state
   └─ NEW system: Floating/breathing + built-in blinking

3. Expression changes to 'happy'
   └─ NEW system: Plays happy emotion animation
       └─ Morphs eyes to HAPPY_LEFT/RIGHT

4. Expression changes to 'shocked'
   └─ NEW system: Plays shocked emotion animation
       └─ Morphs eyes (no competing scale transforms)

5. Spontaneous blink triggered
   └─ NEW system: Built-in blink scheduler in idle animation
       └─ No conflicts, single source of truth
```

## Element References

### Character Component Refs

**Container & Character:**
- `containerRef` - Outer wrapper
- `characterRef` - Character body wrapper

**Eyes:**
- `leftEyeRef` - Left eye container (⚠️ shared between systems)
- `rightEyeRef` - Right eye container (⚠️ shared between systems)
- `leftEyePathRef` - Left eye SVG path (⚠️ shared between systems)
- `rightEyePathRef` - Right eye SVG path (⚠️ shared between systems)
- `leftEyeSvgRef` - Left eye SVG element
- `rightEyeSvgRef` - Right eye SVG element

**Body Parts:**
- `leftBodyRef` - Left bracket body
- `rightBodyRef` - Right bracket body

**Other:**
- `shadowElement` - Shadow (via DOM query: `#anty-shadow`)

## Code Locations Summary

### Files with Dual System Integration

**Primary File:** `/components/anty-v3/anty-character-v3.tsx`
- Line 15: OLD system import
- Line 16: NEW system import
- Lines 126-133: OLD system initialization
- Lines 142-187: NEW system initialization
- Lines 542-569: NEW system emotion triggers
- Lines 710-779: OLD system spontaneous scheduler ⚠️ CONFLICT ZONE

### Animation Definition Files

**OLD System:**
- `/lib/anty-v3/use-eye-animations.ts` (490 lines) ← TO BE DELETED

**NEW System:**
- `/lib/anty-v3/animation/use-animation-controller.ts`
- `/lib/anty-v3/animation/controller.ts`
- `/lib/anty-v3/animation/definitions/idle.ts`
- `/lib/anty-v3/animation/definitions/emotions.ts`
- `/lib/anty-v3/animation/definitions/eye-animations.ts`
- `/lib/anty-v3/animation/definitions/eye-shapes.ts`

## Why This Happened

1. **Incomplete Migration**
   - Previous plan claimed "✅ IMPLEMENTATION COMPLETE"
   - OLD system was never removed
   - Spontaneous behaviors weren't migrated

2. **No Feature Flag Protection**
   - OLD blink scheduler has no feature flag
   - Always runs regardless of `USE_NEW_ANIMATION_CONTROLLER`

3. **No Element Locking**
   - Neither system uses element registry
   - No mutex or locking mechanism
   - Both can animate simultaneously

4. **Misleading Documentation**
   - MIGRATION_GUIDE.md describes non-existent validation mode
   - Claims systems can run side-by-side safely (they can't)

## Next Steps

See `/Users/ellis/.claude/plans/floating-toasting-toast.md` for the fix plan.

**Priority Actions:**
1. Delete OLD system file
2. Remove OLD imports/initialization
3. Remove spontaneous scheduler (OLD system calls)
4. Add blinking to NEW idle system
5. Test thoroughly
