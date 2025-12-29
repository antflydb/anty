# Resume: Portability Fixes for Anty

## Context
We identified 5 portability issues that could cause problems when Anty is used in other apps/websites.

## What's Already Done This Session
1. Fixed outer glow not animating during OFF - added `outer-glow` class to the element
2. Fixed double-gray issue during OFF - removed `opacity: isOff ? 0.45 : 1` inline style from anty-character-v3.tsx
3. Fixed glow selectors - changed from `[class*="glow"]` to `.outer-glow` in use-animation-controller.ts
4. Removed eye animations from ON/OFF transitions - eyes stay IDLE throughout
5. Fixed wake-up triggering happy emotion - now just sets 'idle' expression
6. Changed page title to "Anty v0.9"

## Remaining Portability Fixes (NOT YET STARTED)

### 1. Add Glow Refs to page.tsx
**Current:** `glowRef` exists for outer glow only
**Need:** Add `innerGlowRef` for inner glow element

```tsx
// Around line 76 in page.tsx, add:
const innerGlowRef = useRef<HTMLDivElement>(null);

// Around line 1612, add ref to inner-glow div:
<div
  ref={innerGlowRef}
  className="inner-glow absolute left-1/2 ..."
```

### 2. Pass Glow Refs to useAnimationController
**File:** `app/page.tsx` where useAnimationController is called
**Need:** Add innerGlow and outerGlow to elements param

### 3. Update use-animation-controller.ts
**Current:** Uses `document.querySelector('.inner-glow')` and `document.querySelector('.outer-glow')`
**Need:** Use `elements.innerGlow` and `elements.outerGlow` instead

All 4 occurrences are around lines 294, 361, 457, 634

### 4. Extract CHAT_PANEL_WIDTH Constant
**File:** `app/page.tsx`
**Current:**
```tsx
transform: isChatOpen ? 'translateX(-192px)' : 'translateX(0)'  // lines 1607, 1779
```
**Need:**
```tsx
const CHAT_PANEL_WIDTH = 384;
const chatOffset = CHAT_PANEL_WIDTH / 2;
// Then use `translateX(-${chatOffset}px)`
```

### 5. Move Super Mode Styles to CSS Class
**File:** `components/anty-v3/anty-character-v3.tsx` (lines 864-867)
**Current:**
```tsx
filter: isSuperMode ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) brightness(1.15) saturate(1.3)' : 'none',
animation: isSuperMode ? 'superModeHue 3s linear infinite' : 'none',
```
**Need:** Add to `app/globals.css`:
```css
.super-mode {
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) brightness(1.15) saturate(1.3);
  animation: superModeHue 3s linear infinite;
}
```
Then change component to:
```tsx
className={`relative w-full h-full ${isSuperMode ? 'super-mode' : ''}`}
```

### 6. Add Z-Index CSS Variables
**File:** `app/globals.css`
**Add:**
```css
:root {
  --anty-z-glow: 0;
  --anty-z-character: 1;
  --anty-z-debug: 9999;
}
```
Then update z-index values in page.tsx and anty-character-v3.tsx to use these variables.

## Files to Modify
- `app/page.tsx`
- `app/globals.css`
- `lib/anty-v3/animation/use-animation-controller.ts`
- `components/anty-v3/anty-character-v3.tsx`

## Uncommitted Changes from This Session
Run `git status` to see - includes:
- Exclamation emoji on shocked animation
- Debug frozen notification auto-dismiss
- Instant wake-up animation
- eyePhases system for back-forth
- Outer glow class fix
- Double-gray opacity fix
- Page title change
