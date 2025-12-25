# Search Mode Animation Specification

**Status:** WORKING - DO NOT BREAK
**Created:** 2025-12-23
**Purpose:** Preserve current working search mode behavior

## Overview

Search mode is currently working correctly. This document captures the exact behavior to prevent regressions during the dual animation system fix.

## Entry Behavior (Command+K Trigger)

### 1. Animation Sequence
When `searchMode` prop changes from `false` → `true`:

1. **Idle Animation Paused** (line 430 in `use-animation-controller.ts`)
   ```typescript
   controllerRef.current.pauseIdle();
   ```

2. **Bracket → Bar Morph** (handled externally in `page.tsx`)
   - Character body morphs from bracket shape to horizontal bar
   - This animation is OUTSIDE the animation controller
   - Uses direct GSAP calls in parent component

### 2. Eye Behavior During Search
- Eyes remain in their current state
- No automatic eye morphing on search entry
- Eyes are NOT touched by the controller during search mode

## Exit Behavior (ESC / Close Search)

### 1. Animation Sequence
When `searchMode` prop changes from `true` → `false`:

1. **Bar → Bracket Morph** (handled externally in `page.tsx`)
   - Character body morphs back to bracket shape
   - This animation is OUTSIDE the animation controller

2. **Eye Restoration** (lines 440-469 in `use-animation-controller.ts`)
   - **Method:** Dynamic import of `createEyeAnimation`
   - **Shape:** Eyes morph to `IDLE` shape
   - **Duration:** 0.3 seconds
   - **Timing:** Happens BEFORE idle resumes

   ```typescript
   import('@/lib/anty-v3/animation/definitions/eye-animations').then(({ createEyeAnimation }) => {
     const restoreTl = createEyeAnimation(
       { leftEye, rightEye, leftEyePath, rightEyePath, leftEyeSvg, rightEyeSvg },
       'IDLE',
       { duration: 0.3 }
     );

     restoreTl.eventCallback('onComplete', () => {
       controllerRef.current?.resumeIdle();
     });

     restoreTl.play();
   });
   ```

3. **Idle Animation Resumed** (line 457)
   - Only resumes AFTER eye restoration completes
   - `controllerRef.current?.resumeIdle()`

## Elements Involved

### Character Body (Morphed Externally)
- `leftBodyRef` - Left bracket body
- `rightBodyRef` - Right bracket body
- These morph is handled by `page.tsx`, NOT the animation controller

### Eye Elements (Restored by Controller)
- `eyeLeft` - Left eye container
- `eyeRight` - Right eye container
- `eyeLeftPath` - Left eye SVG path
- `eyeRightPath` - Right eye SVG path
- `eyeLeftSvg` - Left eye SVG element
- `eyeRightSvg` - Right eye SVG element

## Timing & Synchronization

### Entry Timing
- Idle pause: **Immediate**
- Body morph: **External timing** (handled by parent)
- Eyes: **No change on entry**

### Exit Timing
- Body morph: **External timing** (handled by parent)
- Eye restoration: **0.3s duration**
- Idle resume: **After eye restoration completes**

## Known Issues (To Be Fixed)

### Issue 1: Dynamic Import Performance Hit
**Location:** `use-animation-controller.ts` line 442
**Problem:** Dynamic `import()` for core functionality causes slight delay
**Fix Plan:** Change to static import in Phase 4

### Issue 2: No Search Eye Shape
**Current:** Eyes stay in IDLE shape during search
**Desired:** Eyes could morph to a special SEARCH shape (wider/circular)
**Fix Plan:** Add `SEARCH` shape to `eye-shapes.ts` in Phase 3

### Issue 3: No Search Entry Eye Animation
**Current:** Eyes don't morph when entering search
**Desired:** Eyes could morph to SEARCH shape on entry
**Fix Plan:** Add search entry eye morphing in Phase 4

## Critical Constraints

### ⚠️ DO NOT BREAK
1. **Idle must pause** when entering search
2. **Eyes must restore to IDLE** when exiting search
3. **Idle must only resume** AFTER eye restoration completes
4. **Body morph is external** - don't touch it in controller

### ✅ Safe to Change
1. **Dynamic import** → static import (performance improvement)
2. **Eye shape on entry** - can add SEARCH morph
3. **Eye shape during search** - can use SEARCH instead of IDLE
4. **Restoration timing** - can adjust duration/easing

## Testing Checklist

After ANY changes to search mode:

- [ ] Press Cmd+K - character morphs to bar
- [ ] Character stops floating during search
- [ ] Press ESC - character morphs back to bracket
- [ ] Eyes restore to IDLE shape smoothly
- [ ] Character resumes floating AFTER eyes restore
- [ ] No visual glitches or competing animations
- [ ] No console errors about missing elements

## References

**Code Locations:**
- Search mode detection: `use-animation-controller.ts` lines 416-471
- Eye restoration logic: `use-animation-controller.ts` lines 440-469
- Idle pause/resume: `AnimationController.pauseIdle()` / `resumeIdle()`
- Eye animation factory: `eye-animations.ts` `createEyeAnimation()`

**Related Files:**
- `/app/page.tsx` - Handles bracket↔bar body morph (external)
- `/lib/anty-v3/animation/use-animation-controller.ts` - Search mode controller
- `/lib/anty-v3/animation/definitions/eye-animations.ts` - Eye morphing functions
- `/lib/anty-v3/animation/definitions/eye-shapes.ts` - Eye shape definitions
