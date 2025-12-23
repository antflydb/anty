# Session Resume Instructions

## What We're Doing
Completing the new animation controller system so clicking emojis plays GSAP animations and creates position tracker cards.

## What's Done
- ✅ Fixed infinite loop in position tracker (commit 14db8ec)
- ✅ All investigation complete - refs exist, emotion definitions ready
- ✅ Motion event system infrastructure complete

## What's Left (5 Steps)
Execute these in order. Full details in plan file.

### 1. Import createEmotionAnimation
**File:** `lib/anty-v3/animation/use-animation-controller.ts`
Add at top: `import { createEmotionAnimation } from './definitions/emotions';`

### 2. Expand AnimationElements Interface  
**File:** `lib/anty-v3/animation/use-animation-controller.ts`
Add to interface: `leftBody?: HTMLElement | null;` and `rightBody?: HTMLElement | null;`

### 3. Fix playEmotion to Create Populated Timeline
**File:** `lib/anty-v3/animation/use-animation-controller.ts`
Replace line 502 `const tl = gsap.timeline();` with call to `createEmotionAnimation(emotion, elements)`

### 4. Pass Body Refs from Component
**File:** `components/anty-v3/anty-character-v3.tsx`  
Add `leftBody: leftBodyRef.current` and `rightBody: rightBodyRef.current` to elements passed to hook

### 5. Re-enable Expression → PlayEmotion
**File:** `components/anty-v3/anty-character-v3.tsx`
Add useEffect that watches expression and calls `animationController.playEmotion(emotion)`

## Full Plan Location
`/Users/ellis/.claude/plans/frolicking-sprouting-snowglobe.md`

## Current Branch
`refactor/animation-controller`

## Test After Implementation
Click emojis → should see GSAP animations + position tracker creates labeled cards
