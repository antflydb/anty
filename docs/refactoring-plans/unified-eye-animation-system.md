# Unified Eye Animation System Refactoring Plan

## Executive Summary

This plan outlines a safe, incremental approach to extract all eye animation logic from `anty-character.tsx` into a dedicated custom hook `useEyeAnimations`. The refactoring will maintain 100% backward compatibility while improving maintainability and setting the foundation for future gamification features.

## 1. Hook Interface Design

### 1.1 Hook Signature

```typescript
function useEyeAnimations({
  leftEyeRef: React.RefObject<HTMLDivElement>,
  rightEyeRef: React.RefObject<HTMLDivElement>,
  expression: ExpressionName,
  isOff: boolean,
}): {
  performBlink: () => void;
  performDoubleBlink: () => void;
  allowBlinkingRef: React.MutableRefObject<boolean>;
}
```

### 1.2 Parameters Explained

- **leftEyeRef / rightEyeRef**: The DOM refs for the eye elements that GSAP will animate
- **expression**: Current expression to determine animation behavior
- **isOff**: Special state that disables all eye animations

### 1.3 Return Values

- **performBlink**: Function to trigger a single blink animation
- **performDoubleBlink**: Function to trigger a double blink sequence
- **allowBlinkingRef**: Ref that controls whether blinking is permitted (used by spontaneous blink system)

### 1.4 Internal State Management

The hook will manage:
- Expression transition animations (shocked, idea, idle resets)
- Blink permission system based on current expression
- GSAP tween cleanup on expression changes
- All debug logging

## 2. Migration Strategy

### 2.1 Phase 1: Create Hook Structure (Low Risk)

**Action**: Create `/Users/ellis/projects/www/lib/anty/use-eye-animations.ts` with:
- Basic hook structure
- Import all necessary GSAP dependencies
- Copy debugLog utilities from component
- Define the hook interface (empty implementation initially)

**Testing**: No changes to component yet, no visual impact

**Rollback**: Simply delete the file

### 2.2 Phase 2: Extract Blink Functions (Medium Risk)

**Action**: Move `performBlink` and `performDoubleBlink` into the hook:
- Lines 461-496: `performBlink` callback
- Lines 498-550: `performDoubleBlink` callback
- Keep exact GSAP timing (scaleY: 0.05, durations: 0.1/0.15)
- Preserve all debug logging

**Component Changes**:
- Remove local blink functions
- Use hook-provided functions instead
- Pass functions to `useGSAP` dependencies

**Testing Checkpoint**:
1. Verify spontaneous blinking still works (3-10 second intervals)
2. Verify 25% chance of double blink vs 75% single blink
3. Check console logs show `[BOTH EYES] Blink starting/complete`
4. Confirm blink animations look identical (0.1s close, 0.15s open)

**Rollback**: Revert component to use local functions

### 2.3 Phase 3: Extract Blink Permission System (Medium Risk)

**Action**: Move blink permission logic into hook:
- Line 86: `allowBlinkingRef` declaration
- Lines 314-324: Expression-based blink permission updates
- Add internal `useEffect` to manage permissions

**Implementation**:
```typescript
// Inside hook
const allowBlinkingRef = useRef<boolean>(true);

useEffect(() => {
  if (expression === 'idle' && !isOff) {
    // Delay re-enabling blinking to allow eye transitions to complete
    setTimeout(() => {
      allowBlinkingRef.current = true;
    }, 300);
  } else {
    // Disable blinking for angry, sad, off, and all other expressions
    allowBlinkingRef.current = false;
  }
}, [expression, isOff]);
```

**Component Changes**:
- Remove local `allowBlinkingRef`
- Use hook-provided ref

**Testing Checkpoint**:
1. Change to `angry` expression - verify blinking stops
2. Change to `happy` expression - verify blinking stops
3. Return to `idle` - verify blinking resumes after 300ms
4. Change to `off` - verify blinking stops
5. Check `[BOTH EYES] Blink blocked - not allowed` logs when appropriate

**Rollback**: Revert to local ref management

### 2.4 Phase 4: Extract Expression Transition Animations (High Risk)

**Action**: Move all expression-specific eye animations into hook:
- Lines 326-334: Kill tweens and reset for non-shocked/idea expressions
- Lines 348-367: Shocked animation (grow to 1.4x scale)
- Lines 368-384: Reset from shocked/idea to idle
- Lines 401-430: Idea animation (move up -8px, grow 1.15x)

**Implementation Pattern**:
```typescript
// Inside hook
useEffect(() => {
  const prevExpression = prevExpressionRef.current;
  prevExpressionRef.current = expression;

  debugLog.expression(prevExpression, expression);

  // Handle expression-specific animations...
  // [Move all the complex GSAP logic here]

}, [expression, leftEyeRef, rightEyeRef]);
```

**Component Changes**:
- Remove expression animation logic from main useEffect (lines 307-439)
- Keep only expression state updates (isHappy, isAngry, isSad, isWinking, performWink call)

**Testing Checkpoint**:
1. Test each expression individually:
   - `idle` → `shocked`: Eyes grow to 1.4x in 0.1s
   - `shocked` → `idle`: Eyes shrink back to 1.0x in 0.05s
   - `idle` → `idea`: Eyes move up -8px and grow to 1.15x
   - `idea` → `idle`: Eyes return to baseline
2. Verify debug logs show correct GSAP operations
3. Check no visual glitches or flash during transitions
4. Confirm transitions respect non-GSAP expressions (happy, angry, sad, wink, off)

**Rollback**: Most critical phase - restore all expression logic to component

### 2.5 Phase 5: Consolidate and Cleanup (Low Risk)

**Action**: Final refinements:
- Add comprehensive JSDoc comments to hook
- Organize internal functions logically
- Ensure all debug logging is consistent
- Add hook-level constants for magic numbers

**Component Changes**:
- Clean up imports (remove unused GSAP refs if hook manages everything)
- Simplify component structure
- Update component comments

**Testing Checkpoint**:
1. Full regression test of all expressions
2. Verify spontaneous blinking still works
3. Check performance (no memory leaks, proper cleanup)
4. Validate console logs are still helpful

**Rollback**: Minor adjustments only

## 3. Code Organization

### 3.1 Hook File Structure

```typescript
/Users/ellis/projects/www/lib/anty/use-eye-animations.ts

// ===========================
// Section 1: Imports & Types
// ===========================
import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import type { ExpressionName } from './animation-state';

// ===========================
// Section 2: Debug Utilities
// ===========================
const debugLog = { ... };

// ===========================
// Section 3: Hook Interface
// ===========================
interface UseEyeAnimationsProps { ... }
interface UseEyeAnimationsReturn { ... }

// ===========================
// Section 4: Main Hook
// ===========================
export function useEyeAnimations({ ... }): UseEyeAnimationsReturn {

  // 4.1: Refs and state
  const allowBlinkingRef = useRef<boolean>(true);
  const prevExpressionRef = useRef<ExpressionName>('idle');

  // 4.2: Blink functions
  const performBlink = useCallback(() => { ... }, []);
  const performDoubleBlink = useCallback(() => { ... }, []);

  // 4.3: Expression-based blink permission
  useEffect(() => { ... }, [expression, isOff]);

  // 4.4: Expression transition animations
  useEffect(() => { ... }, [expression, leftEyeRef, rightEyeRef]);

  // 4.5: Return interface
  return { performBlink, performDoubleBlink, allowBlinkingRef };
}
```

### 3.2 Animation Type Organization

**Blink Animations** (simplest):
- Single blink: 0.1s close + 0.15s open
- Double blink: Two blinks with 0.1s pause

**GSAP Transform Animations** (medium complexity):
- Shocked: Scale both eyes to 1.4x
- Idea: Scale to 1.15x and translate Y to -8px
- Reset: Return to scale 1.0, y 0

**State-Based Animations** (managed by component):
- Happy: Different SVG assets (no GSAP)
- Angry: Different SVG assets (no GSAP)
- Sad: Different SVG assets (no GSAP)
- Wink: Different SVG assets + character-level animation (stays in component)
- Off: Different SVG assets (no GSAP)

### 3.3 Debug Logging Strategy

Maintain existing logging structure:
```typescript
debugLog.leftEye('action', details)   // For left eye only
debugLog.rightEye('action', details)  // For right eye only
debugLog.both('action', details)      // For both eyes
debugLog.expression(from, to)         // Expression changes
debugLog.gsap(target, action, props)  // GSAP operations
```

**Key logging points to preserve**:
- Blink start/complete
- Blink blocked (with reason)
- Expression transitions
- GSAP tween operations (to, set, kill)
- Animation start/complete for shocked and idea

## 4. Risk Mitigation

### 4.1 Potential Breaking Points

**Risk**: GSAP tweens not cleaning up properly
- **Symptom**: Eyes stuck in wrong state, conflicting animations
- **Detection**: Watch for warning logs about killed tweens
- **Prevention**: Always call `gsap.killTweensOf()` before new animations
- **Test**: Rapidly switch between shocked, idea, and idle

**Risk**: Blink permission ref out of sync
- **Symptom**: Blinking continues when it shouldn't (or vice versa)
- **Detection**: Check console logs for "Blink blocked" messages
- **Prevention**: Use ref instead of state for instant updates
- **Test**: Switch expressions rapidly, verify no blinking during non-idle

**Risk**: Expression state and GSAP transforms conflicting
- **Symptom**: Visual flash or jump when expression changes
- **Detection**: Watch for frame-by-frame transitions
- **Prevention**: Never call state setters that remount elements during GSAP animations
- **Test**: shocked and idea transitions (these use GSAP on idle eyes without state change)

**Risk**: Dependencies array causing infinite loops
- **Symptom**: Console flooded with logs, browser freezes
- **Detection**: Immediate and obvious
- **Prevention**: Carefully manage useEffect dependencies, use refs where appropriate
- **Test**: Load page and let it idle for 30 seconds

### 4.2 Testing Strategy Per Phase

**Manual Testing Checklist**:

**Phase 2 (Blink Functions)**:
- [ ] Load page, wait 3-10 seconds, verify blink occurs
- [ ] Observe 4-5 blinks, verify mix of single and double
- [ ] Check console shows blink logs with correct timing

**Phase 3 (Blink Permission)**:
- [ ] Start at idle, verify blinking occurs
- [ ] Switch to happy, verify blinking stops
- [ ] Switch to angry, verify blinking stops
- [ ] Switch to shocked, verify blinking stops
- [ ] Switch to idea, verify blinking stops
- [ ] Switch back to idle, wait 300ms, verify blinking resumes
- [ ] Check console shows "blocked" logs when appropriate

**Phase 4 (Expression Animations)**:
- [ ] idle → shocked: Smooth grow animation
- [ ] shocked → idle: Smooth shrink animation
- [ ] idle → idea: Eyes move up and grow
- [ ] idea → idle: Eyes return to baseline
- [ ] Rapid switching: No visual glitches
- [ ] Check GSAP logs show proper sequence

**Phase 5 (Full Regression)**:
- [ ] Test all 10 expressions individually
- [ ] Test all valid expression transitions
- [ ] Let page idle for 5 minutes, verify stable behavior
- [ ] Check for memory leaks in Chrome DevTools
- [ ] Verify console logs are clean and helpful

### 4.3 Rollback Procedures

**Phase 2-3 Rollback**:
- Simple Git revert
- No data loss risk

**Phase 4 Rollback** (most complex):
- Keep backup of component before Phase 4 changes
- Restore expression useEffect logic in full
- May need to manually merge if other changes occurred

**Complete Rollback**:
- Delete `/Users/ellis/projects/www/lib/anty/use-eye-animations.ts`
- Revert all changes to `anty-character.tsx`
- No migration or data issues

## 5. Success Criteria

### 5.1 Functional Requirements

- [ ] All expressions work exactly as before
- [ ] Spontaneous blinking maintains 3-10 second intervals
- [ ] 25/75% split between double and single blinks
- [ ] Blinking disabled during non-idle expressions
- [ ] 300ms delay before re-enabling blinking after returning to idle
- [ ] Shocked animation: 1.4x scale, 0.1s duration
- [ ] Idea animation: 1.15x scale, -8px Y, 0.1s duration
- [ ] Reset animations: 0.05s duration
- [ ] All debug logs still present and accurate

### 5.2 Code Quality Requirements

- [ ] Hook has comprehensive JSDoc comments
- [ ] All functions have clear names
- [ ] Magic numbers replaced with named constants
- [ ] TypeScript types are strict and accurate
- [ ] No eslint warnings
- [ ] No console errors
- [ ] Component file reduced by ~130+ lines
- [ ] Hook file is well-organized with clear sections

### 5.3 Performance Requirements

- [ ] No increase in memory usage
- [ ] GSAP tweens cleaned up properly (no leaks)
- [ ] No performance degradation in Chrome DevTools
- [ ] Smooth 60fps animations maintained
- [ ] No unnecessary re-renders (check with React DevTools)

## Critical Files

- `/Users/ellis/projects/www/lib/anty/use-eye-animations.ts` - New hook file to create (~300 lines)
- `/Users/ellis/projects/www/components/anty/anty-character.tsx` - Main component to refactor (remove ~130 lines)
- `/Users/ellis/projects/www/lib/anty/animation-state.ts` - Reference for ExpressionName type (read-only)

## Implementation Notes

**Current Code Locations to Extract:**
- Lines 461-496: `performBlink` callback
- Lines 498-550: `performDoubleBlink` callback
- Line 86: `allowBlinkingRef` declaration
- Lines 314-324: Blink permission management
- Lines 326-334: Expression change eye resets
- Lines 348-367: Shocked animation
- Lines 368-384: Reset from shocked/idea to idle
- Lines 401-430: Idea animation

**Debug Log Locations:**
- Lines 19-37: debugLog utilities (copy to hook)
- Throughout: All `debugLog.*` calls must be preserved

**Critical Patterns to Maintain:**
- Use refs instead of state for GSAP-animated properties
- Always kill tweens before starting new ones
- Maintain 50ms duration for reset animations (not instant)
- Keep expression change logging with timestamps
