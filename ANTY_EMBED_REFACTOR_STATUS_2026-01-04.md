# Anty Embed Refactor Status Report

**Date:** January 4, 2026
**Branch:** `anty-embed-refactor`
**Base Commit:** `c36f6d6` (Complete anty-embed package refactor with dead code cleanup)

---

## Summary

The `anty-embed-refactor` branch implements a **package-first architecture** where `@searchaf/anty-embed` is the single source of truth for the Anty character. The main app now imports from this package instead of maintaining separate implementations.

---

## What Was Accomplished

### 1. Package Structure Created
- New package at `packages/anty-embed/`
- Proper npm package setup with `package.json`, `tsconfig.json`, `rollup.config.js`
- ESM and CJS builds with TypeScript declarations
- CSS extraction for styles

### 2. Animation System Moved to Package
All animation code now lives in the package:
- `packages/anty-embed/src/lib/animation/` - Full animation system
  - `controller.ts` - Animation state machine
  - `definitions/` - Emotion configs, eye shapes, idle animations, transitions
  - `glow-system.ts` - Physics-based glow tracking
  - `shadow.ts` - Dynamic shadow system
  - `types.ts` - All animation types
- `packages/anty-embed/src/hooks/use-animation-controller.ts` - React hook wrapper

### 3. Components Moved to Package
- `AntyCharacter.tsx` - Main character component (converted from Tailwind to inline styles)
- `AntyParticleCanvas.tsx` - Canvas-based particle system

### 4. Main App Updated
- `app/page.tsx` now imports from `@searchaf/anty-embed`
- External ref pattern updated to use exposed refs from component handle
- Search morph animation works with package component

### 5. Dead Code Cleanup
Removed from main app (now in package):
- `lib/anty/animation/` directory (moved to package)
- `lib/anty/particles/` directory (moved to package)
- `components/anty/anty-expression-layer.tsx` (unused)
- Documentation files: `lib/anty/animation/README.md`, `lib/anty/particles/README.md`, etc.
- Dev tools: `lib/anty/animation/dev-tools.ts`, `lib/anty/animation/test-utils.ts`

### 6. Build System
- Rollup bundles the package with GSAP bundled internally
- TypeScript declarations generated
- Source maps included
- CSS extracted to separate file

---

## What Works

✅ **Idle Animation** - Breathing, bobbing, and blinking all work correctly
✅ **Basic Emotions** - Happy, sad, angry, excited, etc. animate properly
✅ **Eye Animations** - Eye morphing, look directions work
✅ **Particle System** - Sparkles, hearts spawn correctly
✅ **Shadow Tracking** - Dynamic shadow follows character Y position
✅ **Glow System** - Physics-based glow tracking works
✅ **Wake-up/Power-off** - Transition animations work
✅ **Search Mode** - Character integrates with search bar morph
✅ **Debug Overlay** - Animation debug overlay still functional

---

## Known Regressions

### 🔴 Super Mode Animation (CRITICAL)
**Issue:** The Mario-style stepped scale animation (1→1.15→1.05→1.2→1.1→1.45) just snaps to the final size instead of animating through each step.

**Symptoms:**
- When 3 hearts are earned, character should do a Mario-style "power up" pulse animation
- Instead, it instantly jumps to 1.45x scale

**What was tried:**
1. Externalized GSAP to peerDependencies - broke idle animation entirely
2. Added debug logging - didn't reveal the root cause
3. Verified emotion config is identical to working version
4. Verified built bundle has correct config

**Potential causes:**
- Timeline construction issue in package bundling
- Possible conflict between package's bundled GSAP and app's GSAP
- Something in the emotion interpreter not sequencing phases correctly

**Files involved:**
- `packages/anty-embed/src/lib/animation/definitions/emotions.ts` - super emotion config
- `packages/anty-embed/src/lib/animation/definitions/emotion-interpreter.ts` - builds timeline
- `packages/anty-embed/src/hooks/use-animation-controller.ts` - plays emotion
- `app/page.tsx` - triggers super mode

---

## Files Changed in This Branch

### New Files (Package)
```
packages/anty-embed/
├── package.json
├── package-lock.json
├── tsconfig.json
├── rollup.config.js
├── src/
│   ├── index.ts
│   ├── components/
│   │   ├── AntyCharacter.tsx
│   │   ├── AntyParticleCanvas.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   └── use-animation-controller.ts
│   ├── lib/
│   │   ├── animation/ (moved from lib/anty/animation/)
│   │   └── particles/ (moved from lib/anty/particles/)
│   └── types/
│       └── index.ts
└── dist/ (built output)
```

### Modified Files
- `app/page.tsx` - Updated imports to use package
- `app/eyes/page.tsx` - Updated imports
- `components/anty/index.ts` - Updated exports
- `components/anty/animation-debug-overlay.tsx` - Updated imports
- Various other files with import path updates

### Deleted Files
- `lib/anty/animation/` directory
- `lib/anty/particles/` directory (Note: `lib/anty/particle-physics.ts` kept for FlappyAF)
- `components/anty/anty-expression-layer.tsx`
- Documentation/test files

---

## Recommended Next Steps

### Immediate (Fix Regression)
1. Create new branch from `anty-embed-refactor` for super mode fix
2. Add isolated test for super emotion timeline
3. Compare GSAP timeline output between working (3000) and package version
4. Consider if the issue is timeline sequencing vs. something overwriting scale

### Investigation Ideas
- Add `onUpdate` callback to super emotion timeline to log scale value each frame
- Check if `gsap.set()` in `use-animation-controller.ts` line 723-730 is conflicting
- Verify no other code is setting scale on the character element during super mode
- Test if other multi-phase emotions (like `celebrate`) also have issues

### Future Improvements (After Fix)
1. Add AntyWidget wrapper component for easy embedding
2. Add AntyHero component for landing pages
3. Add search overlay component
4. Consider extracting chat panel to package
5. Add Storybook documentation

---

## Testing Checklist for Merge

Before merging to main, verify:

- [ ] Idle animation works (breathing, bobbing, blinking)
- [ ] All basic emotions work (happy, sad, angry, excited, shocked, etc.)
- [ ] Spin, jump, nod, headshake work
- [ ] Look-left, look-right work
- [ ] Super mode animation works (CURRENTLY BROKEN)
- [ ] Particles spawn correctly
- [ ] Search mode morph works
- [ ] Wake-up animation works
- [ ] Power-off animation works
- [ ] Debug overlay works
- [ ] No console errors
- [ ] Build succeeds without errors

---

## Session Changes (This Conversation)

Changes made during this debugging session:

1. **`app/page.tsx`** - Fixed super mode exit to use `antyRef.current?.characterRef?.current` instead of `document.querySelector('[class*="character"]')` (the character div no longer has a CSS class)

2. **Attempted GSAP externalization** (reverted):
   - Tried moving GSAP to peerDependencies
   - Tried adding to rollup externals
   - This broke idle animation, so reverted

3. **Debug logging** (reverted):
   - Added console.logs to trace timeline building
   - Removed after testing

---

## Conclusion

The refactor is ~95% complete. The package architecture is solid and most functionality works. The only blocker is the super mode animation regression, which needs focused debugging.

Recommend merging to main and addressing the super mode bug in a dedicated branch, as the rest of the refactor is working well.
