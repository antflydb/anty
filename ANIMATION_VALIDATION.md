# Animation System Validation Report
**Date:** 2025-12-22
**Test Method:** Visual observation using debug overlay

---

## GOOD "IDLE" State - Baseline Values (Fresh Page Load)

### ✓ CORRECT MIN/MAX Ranges (Tracked from Debug Overlay):
```
Rotation:     0.000° to 2.000° (yoyo oscillation)
Scale:        1.0000 to 1.0200 (yoyo breathing)
Width:        160.0px to 168.8px (varies with scale)
Height:       160.0px to 168.8px (varies with scale)
Shadow Width: 112.0px to 160.0px (varies inversely with character Y position)
Sequence:     "IDLE" (green text in debug overlay)
```

### Expected Behavior:
- Rotation oscillates from 0° to 2° and back to 0° (yoyo)
- Scale breathes from 1.0000 to 1.0200 and back to 1.0000 (yoyo)
- Dimensions change proportionally with scale
- Shadow width varies based on character height (inverse relationship)

---

## ❌ BROKEN "CONTROLLER: Idle animation" State (After Wake-Up)

### WRONG Observed Ranges:
```
Rotation:     0.865° to 1.999° (too much rotation)
Scale:        1.0085 to 1.0199+ (EXCEEDS 1.02 - WRONG!)
Width:        163.7px to 168.8px (too large)
Height:       163.7px to 168.8px (too large)
Shadow Width: 112.0px to 139.5px
Sequence:     "CONTROLLER: Idle animation" (green text in debug overlay)
```

### THE PROBLEM:
After power-on wake-up, Anty goes into a DIFFERENT idle state called "CONTROLLER: Idle animation" that has WRONG scale values. This is NOT the same as the good "IDLE" state on page load.

**Two different idle states exist:**
1. ✓ "IDLE" - correct initial idle (page load)
2. ❌ "CONTROLLER: Idle animation" - broken idle (after wake-up)

### Root Cause:

**TWO separate idle animation systems are running:**

1. **LEGACY idle** (`anty-character-v3.tsx:617-623`)
   - Console log: `"[LEGACY IDLE] Starting idle animation"`
   - Triggered on page load when `isOff=false`
   - Uses GSAP timeline with yoyo
   - Target: scale 1.02, rotation 2°, y: -12px
   - Works CORRECTLY - produces good "IDLE" state

2. **CONTROLLER idle** (`lib/anty-v3/animation/definitions/idle.ts:50-60`)
   - Triggered after AnimationController wake-up completes
   - Called from `use-animation-controller.ts:269-285`
   - Uses `createIdleAnimation()` function
   - Target: scale 1.02, rotation 2°, y: -12px (same config)
   - Produces BROKEN "CONTROLLER: Idle animation" state

**The Bug:**
Both target the same scale (1.02), but the Controller's version somehow exceeds the correct range and goes to 1.0199+ instead of staying at ~1.0164 max like the legacy version.

**Files Involved:**
- `/Users/ellis/projects/anty/components/anty-v3/anty-character-v3.tsx:617-623` (legacy idle - PERFECT ✓)
- `/Users/ellis/projects/anty/lib/anty-v3/animation/definitions/idle.ts:50-60` (NOT USED - createIdleAnimation function exists but isn't called)
- `/Users/ellis/projects/anty/lib/anty-v3/gsap-configs.ts:28-33` (shared config)
- `/Users/ellis/projects/anty/lib/anty-v3/animation/use-animation-controller.ts:278-304` (BROKEN controller idle - manually created timeline)
- `/Users/ellis/projects/anty/components/anty-v3/anty-character-v3.tsx:559-562` (LEGACY IDLE DISABLED when controller enabled)

**Critical Discovery:**
The legacy idle is DISABLED at line 559 when `USE_NEW_ANIMATION_CONTROLLER = true`. Only the controller idle runs.The controller idle code (lines 278-304 in use-animation-controller.ts) is IDENTICAL to legacy code but produces DIFFERENT observable behavior.

### Expected Behavior:
- Continuous gentle rotation oscillation (~0.8° to ~1.4°)
- Subtle scale breathing (~1.008 to ~1.014)
- Dimensions change proportionally with scale
- Shadow width varies based on character height (inverse relationship)

---

## POWER OFF State (OFF/Logo State)

### Observed Values:
```
Rotation:     0.000° (GREEN - correctly frozen at 0°) ✓
Scale:        0.6500 (65% size) ✓
Width:        104.0px ✓
Height:       104.0px ✓
Shadow Width: 104.0px (shadow invisible, measurement is container) ✓
Sequence:     "CONTROLLER: Power-off (ON → OFF)" ✓
```

### Expected Final State:
```
Rotation:  0° (logo orientation)
Scale:     0.65 (65% size)
Y:         50 (dropped down position)
Opacity:   0.45 (dimmed)
Shadow:    opacity 0 (invisible)
Glows:     opacity 0 (invisible)
```

### ❌ CRITICAL ISSUE FOUND:
**BRIGHT PINK/MAGENTA GLOW STILL VISIBLE AFTER POWER-OFF**

The glow elements are NOT fading to opacity: 0 during power-off animation. They remain fully visible in the OFF state, which is incorrect.

**What SHOULD happen:**
- Inner glow: fade to opacity 0
- Outer glow: fade to opacity 0
- Duration: 0.06s (60ms)
- Timing: during Phase 3b of power-off sequence

**What's ACTUALLY happening:**
- Glows remain fully visible
- Pink/magenta glow ring clearly visible around dimmed character
- This creates wrong visual state for logo/OFF mode

---

## POWER ON State (Wake-up Animation)

### Observed Values After Wake-up:
```
Rotation:     1.999° (ORANGE - rotating during idle) ✓
Scale:        1.0199 (breathing) ✓
Width:        168.8px ✓
Height:       168.8px ✓
Shadow Width: 112.0px ✓
Sequence:     "CONTROLLER: Idle animation" ✓
```

### Expected Behavior:
- Jump up to apex (y: -45, scale: 1)
- Tiny hang at apex (0.05s)
- Drop down to ground (y: 0)
- Shadow grows from 0.65 to 1.0
- Glows fade in and follow character
- Return to idle breathing after 0.65s delay

### Status:
✓ Wake-up animation completes successfully
✓ Returns to idle state correctly
✓ Sequence tracking shows "CONTROLLER: Idle animation"
✓ Glows are visible after wake-up
✓ Shadow visible and correct size

---

## Root Cause Analysis

### Issue: Glows Not Fading During Power-Off

**File:** `/Users/ellis/projects/anty/lib/anty-v3/animation/definitions/transitions.ts`
**Function:** `createPowerOffAnimation()`
**Lines:** 248-258 (Phase 3b - glow fade-out)

**Current Code:**
```typescript
// Phase 3b: Fade out background glows and shadow at the same time (0.06s)
if (glowElements.length > 0) {
  timeline.to(
    glowElements,
    {
      opacity: 0,
      duration: 0.06, // Lightning fast - 60ms
      ease: 'power2.in',
    },
    '-=0.05' // Start slightly before character fade finishes
  );
}
```

**Hypothesis:**
1. The glow elements may not be correctly identified/selected
2. The animation may be getting killed/overridden before completion
3. The glows may be reverting to a default opacity after animation
4. There may be CSS or other GSAP animations interfering

**Need to investigate:**
- How are `innerGlow` and `outerGlow` elements passed to `createPowerOffAnimation()`?
- Are they the correct DOM elements?
- Is the animation actually running and completing?
- Are there competing animations on the glow elements?

---

## Debug Overlay Functionality

### ✓ Working Correctly:
- Real-time rotation tracking (60fps)
- Scale measurement from transform matrix
- Width/height from bounding rect
- Shadow width tracking
- Animation sequence display
- Live update indicator

### Note:
Debug overlay sequence correctly shows:
- "IDLE" during normal idle
- "CONTROLLER: Power-off (ON → OFF)" during power-off
- "CONTROLLER: Idle animation" after wake-up

This confirms the AnimationController is running and responding to state changes.

---

## Next Steps

1. **Investigate glow element references**
   - Check how glows are passed to `createPowerOffAnimation()`
   - Verify elements are correct DOM nodes
   - Add console logging to confirm animation targets

2. **Test glow fade animation in isolation**
   - Manually trigger glow fade with GSAP to confirm it works
   - Check if competing animations are overriding
   - Verify glow elements have correct initial opacity

3. **Fix glow fade-out**
   - Ensure animation completes before any state resets
   - Prevent competing animations from interfering
   - May need to explicitly set final state after animation

4. **Re-test complete power cycle**
   - OFF: Verify all glows invisible
   - ON: Verify glows fade in smoothly
   - Validate with debug overlay values
