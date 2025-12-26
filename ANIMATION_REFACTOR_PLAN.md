# Animation System Refactor Plan

## Summary

Refactor from ~3,500 lines of tangled code to ~1,200 lines of clean, professional architecture.

**Key changes:**
1. Single source of truth for idle (controller owns everything)
2. Centralized initialization (`initializeCharacter()`)
3. Declarative emotion configs (data, not code)
4. Simplified state machine (40 lines vs 254)
5. Delete overengineered systems (ElementRegistry, DebugTracker)

---

## Phase 1: Foundation (Non-Breaking)

### 1.1 Create `lib/anty-v3/animation/initialize.ts`

Single function that sets ALL animatable properties once on mount:

```typescript
export function initializeCharacter(elements: CharacterElements, state: { isOff: boolean }): void {
  // Character: x, y, scale, rotation, rotationY, opacity
  gsap.set(character, { x: 0, y: 0, scale: state.isOff ? 0.65 : 1, rotation: 0, rotationY: 0, opacity: state.isOff ? 0.45 : 1 });

  // Eyes: IDLE shape, no transforms
  gsap.set([eyeLeftPath, eyeRightPath], { attr: { d: EYE_SHAPES.IDLE } });
  gsap.set([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: EYE_DIMENSIONS.IDLE.viewBox } });
  gsap.set([eyeLeft, eyeRight], { width: 20, height: 45, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });

  // Shadow, glows...
}
```

### 1.2 Create `lib/anty-v3/animation/state.ts`

Simple 40-line state machine (replaces 254-line monster):

```typescript
export type AnimationState = 'off' | 'idle' | 'emotion' | 'transition' | 'morph';

const STATE_PRIORITY = { off: 0, idle: 1, transition: 2, morph: 2, emotion: 3 };

export class SimpleStateMachine {
  transition(to: AnimationState, force = false): boolean {
    if (!force && STATE_PRIORITY[to] < STATE_PRIORITY[this.state]) return false;
    this.state = to;
    return true;
  }
}
```

### 1.3 Create declarative emotion system

**`definitions/emotion-configs.ts`** - Emotions as DATA:

```typescript
export const EMOTION_CONFIGS: Record<EmotionType, EmotionConfig> = {
  happy: {
    id: 'happy',
    eyes: { shape: 'HAPPY', duration: 0.2, yOffset: -10.5 },
    character: [
      { props: { rotation: 10 }, duration: 0.15, ease: 'power1.inOut' },
      { props: { rotation: -10 }, duration: 0.15, ease: 'power1.inOut' },
      // ... wiggle pattern
      { props: { rotation: 0 }, duration: 0.15, ease: 'power1.inOut' },
    ],
    totalDuration: 0.9,
  },
  // ... other emotions
};
```

**`definitions/emotion-interpreter.ts`** - Generic interpreter (~100 lines):

```typescript
export function createEmotionTimeline(config: EmotionConfig, elements: CharacterElements): gsap.core.Timeline {
  const timeline = gsap.timeline({ onComplete: () => resetEyesToIdle(elements) });

  // Add eye animation
  if (config.eyes) timeline.add(createEyeAnimation(...), 0);

  // Add character phases
  for (const phase of config.character) {
    timeline.to(character, { ...phase.props, duration: phase.duration, ease: phase.ease });
  }

  return timeline;
}
```

---

## Phase 2: Controller Refactor

### 2.1 Refactor `controller.ts`

Controller becomes ONLY owner of idle:

```typescript
export class AnimationController {
  private idleTimeline: gsap.core.Timeline | null = null;

  registerElements(elements: CharacterElements): void {
    this.elements = elements;
    initializeCharacter(elements); // Call new init function
  }

  startIdle(): void {
    if (this.idleTimeline) this.killIdle();
    this.idleTimeline = createIdleTimeline(this.elements);
    this.idleTimeline.play();
  }

  playEmotion(emotion: EmotionType): void {
    this.pauseIdle();
    const config = EMOTION_CONFIGS[emotion];
    const timeline = createEmotionTimeline(config, this.elements);
    timeline.eventCallback('onComplete', () => this.resumeIdle());
    timeline.play();
  }
}
```

### 2.2 Thin down `use-animation-controller.ts`

Remove ALL direct timeline creation from hook. Hook just calls controller:

```typescript
// BEFORE: Hook created idleTimelineRef and managed timelines directly
// AFTER: Hook just tells controller what to do

useEffect(() => {
  if (options.isOff) {
    controller.playTransition('powerOff');
  } else if (wasOff) {
    controller.playTransition('wakeUp', { onComplete: () => controller.startIdle() });
  }
}, [options.isOff]);
```

---

## Phase 3: Cleanup

### Files to DELETE:
- `lib/anty-v3/animation/state-machine.ts` (254 lines) → replaced by state.ts (40 lines)
- `lib/anty-v3/animation/element-registry.ts` (217 lines) → not needed
- `lib/anty-v3/animation/debug-tracker.ts` (276 lines) → non-functional anyway

### Files to KEEP (your debug tools):
- `components/anty-v3/animation-debug-overlay.tsx` ✓
- `lib/anty-v3/animation/dev-tools.ts` ✓
- `lib/anty-v3/animation/feature-flags.ts` ✓
- All `logAnimationEvent()` calls ✓

### Legacy to clean:
- Remove magic dimensions (18.63×44.52) references
- Remove dynamic `require()` calls
- Consolidate duplicate constants
- Remove 'idea' alias handling

---

## Phase 4: Verification

Test checklist:
- [ ] All emotions work (happy, sad, angry, excited, shocked, wink, nod, etc.)
- [ ] Idle animation works (floating, breathing, blinking)
- [ ] Wake-up/power-off transitions work
- [ ] Search bar morph works
- [ ] Game mode works
- [ ] Debug overlay still works
- [ ] Console dev tools still work

---

## Final File Structure

```
lib/anty-v3/animation/
├── index.ts                    # Public exports
├── controller.ts               # Main controller (~200 lines, down from ~400)
├── use-controller.ts           # Thin React hook (~100 lines, down from ~700)
├── initialize.ts               # NEW: initializeCharacter()
├── state.ts                    # NEW: SimpleStateMachine (~40 lines)
├── types.ts                    # All types
├── constants.ts                # Keep as-is
│
├── definitions/
│   ├── emotion-config.ts       # NEW: EmotionConfig type
│   ├── emotion-configs.ts      # NEW: All emotions as data (~300 lines)
│   ├── emotion-interpreter.ts  # NEW: Generic interpreter (~100 lines)
│   ├── idle.ts                 # Simplified
│   ├── transitions.ts          # Keep (wake-up, power-off)
│   ├── morph.ts                # Keep (search animation)
│   ├── eye-shapes.ts           # Keep
│   └── eye-animations.ts       # Keep
│
└── debug/
    ├── feature-flags.ts        # Keep
    └── dev-tools.ts            # Keep
```

**Estimated reduction: ~3,500 lines → ~1,200 lines**

---

## Critical Files to Modify

1. `lib/anty-v3/animation/controller.ts` - Refactor to single idle owner
2. `lib/anty-v3/animation/use-animation-controller.ts` - Thin down, remove timeline management
3. `lib/anty-v3/animation/definitions/emotions.ts` - Replace with declarative configs
4. `components/anty-v3/anty-character-v3.tsx` - Remove inline styles blocking GSAP, fix eye naming

---

## Original Issues (from your initial question)

### Issue 1: Inline styles blocking GSAP
**Problem:** `style={{ height: '45px', width: '20px' }}` on eye containers blocks GSAP animation.
**Solution:** Remove inline dimensions. `initializeCharacter()` sets these via `gsap.set()` so they're animatable.

### Issue 2: Left/Right eye naming (viewer perspective)
**Problem:** Refs named from character perspective, animations expect viewer perspective.
**Solution:** Fix at the source in `anty-character-v3.tsx`:
- `leftEyeRef` = the eye on VIEWER's left (character's right)
- Update CSS `inset` values to match
- All animation code already expects viewer perspective, so this aligns everything

---

# APPENDIX: Original Audit

## CRITICAL: Multiple Sources of Truth

**The biggest problem:** The `useAnimationController` hook creates its own `idleTimelineRef` that exists OUTSIDE the controller. So you have:
- Controller's `startIdle()` managing one idle timeline
- Hook's `idleTimelineRef` managing a DIFFERENT idle timeline
- They can be out of sync and fight each other

**Idle timeline gets created in 3 different places:**
1. Inside wake-up animation's onComplete callback
2. In auto-start useEffect
3. In startIdle callback

Each slightly different. Sometimes registers with controller, sometimes doesn't.

---

## CRITICAL: No Centralized Initialization

There's no single "initialize all animatable properties" function. Instead:
- Inline styles set some values (height: 45px, width: 20px)
- `createIdleAnimation` does some gsap.set() calls
- `createWakeUpAnimation` does different gsap.set() calls
- Each emotion animation assumes certain starting states

**gsap.set() scattered across 5+ files with no coordination.**

---

## OVERENGINEERED: Systems That Do Almost Nothing

### ElementRegistry (217 lines)
- Has re-entrancy protection suggesting it's fighting its own complexity
- Implements priority tracking that's always hardcoded to 0
- In practice, the controller uses `force=true` to bypass all protection anyway
- Just a logging/debugging tool wrapped in complex code

### StateMachine (254 lines, 73 transition rules)
- Priority system is checked every time but `force=true` bypasses it
- State history tracking is never used
- The `force` flag is used so often it makes the state machine pointless

### DebugTracker (276 lines)
- Only enabled in development (adds bundle size to production)
- The `interceptGSAP()` function is never called - system is non-functional
- Duplicates what ElementRegistry already does

---

## LEGACY CRUFT TO DELETE

### Magic dimensions (18.63 × 44.52)
Still referenced in 4+ files:
- `idle.ts` line 79
- `emotions.ts` line 89
- `eye-animations.ts` line 194
- `constants.ts` lines 275-277

**The inline styles use 20×45. Nothing matches.**

### Dynamic require() in production code
```typescript
// idle.ts lines 70-71 - WHY?
const idlePath = require('./eye-shapes').EYE_SHAPES[idleShape];
```
These are already imported at the top. Copy-paste from legacy.

### 'idea' emotion alias
```typescript
// types.ts - hidden breaking change
if (value === 'idea') return true; // 'idea' was renamed to 'jump'
```
Type doesn't include 'idea' but guard accepts it. Confusing.

### Duplicate constants
- `GLOW_DISTANCE_RATIO` defined in 3 files
- `randomInRange()` defined in 2 files
- Idle timing: `gsap-configs.ts` uses 2.5s, `constants.ts` uses 3.7s

---

## DUPLICATED LOGIC (Copy-Paste Hell)

### Eye reset pattern - copied 3+ times
```typescript
gsap.set([eyeLeftPath, eyeRightPath], { attr: { d: idlePath } });
gsap.set([eyeLeftSvg, eyeRightSvg], { attr: { viewBox: ... } });
gsap.set([eyeLeft, eyeRight], { scaleX: 1, scaleY: 1, rotation: 0 });
```
Exists in: emotions.ts, idle.ts, transitions.ts

### Eye element check - copied 8+ times
```typescript
if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
  // same pattern
}
```

### Glow following formula - copied 15+ times
The "glows follow at 75% distance with 0.05s lag" is reimplemented for every emotion.

### Gesture code duplicated
- `emotions.ts` has nod, headshake, wink implementations
- `gestures.ts` has the SAME implementations
- Two files, same code

---

## MASSIVE FUNCTIONS

### createEmotionAnimation() - 960+ lines
Single function handling 14+ emotion types. Each emotion is a different pattern. Should be strategy pattern or separate functions.

### createSearchMorphAnimation() - 460+ lines
Heavy use of getBoundingClientRect(), multiple nested phases, magic number timing.

---

## CALLBACK HELL

```typescript
// emotions.ts lines 267-327
timeline.eventCallback('onComplete', () => {
  const duration = Date.now() - animationStartTime;
  if (this.config.enableLogging) { /* ... */ }
  if (originalOnComplete) { originalOnComplete.call(timeline); }
  this.activeTimelines.delete(animationId);
  this.elementRegistry.releaseByOwner(animationId);
  debugTracker.untrack(animationId);
  this.stateMachine.transition(AnimationState.IDLE, true);
  this.resumeIdle();
  this.processQueue();
  this.callbacks.onEmotionMotionComplete?.(emotion, animationId, duration);
  this.callbacks.onComplete?.(AnimationState.EMOTION, emotion);
  options.onComplete?.();
});
```
15 lines doing 7 different things. Not testable.

---

## MISSING ABSTRACTIONS

### No Eye State Manager
Eye state is scattered:
- Shape in `EYE_SHAPES`
- Dimensions in `EYE_DIMENSIONS`
- CSS container size in comments
- Mappings in `EMOTION_EYE_MAP`
- Offset calculations in each emotion

Should be:
```typescript
setEyeState({ shape: 'HAPPY', side: 'left' }, { duration: 0.2 });
```

### No Animation Phase Abstraction
Every emotion reimplements "apply eye animation, then character animation". Should be declarative.

---

## TEST PAGE VS PRODUCTION DIVERGED

`app/eye-animations/page.tsx`:
- Uses manual timeline creation (not controller)
- Manually applies centering offsets
- Could show different behavior than actual character

---

## WHAT'S ACTUALLY GOOD

- Ref management is correct
- No CSS/GSAP conflicts in production component
- Particle effects properly isolated
- The EMOTION_EYE_MAP centralization is the right direction
- Basic architecture (controller pattern) is sound

---

## SEVERITY SUMMARY

| Issue | Severity |
|-------|----------|
| Multiple idle timeline sources | CRITICAL |
| No centralized initialization | CRITICAL |
| Overengineered ElementRegistry/StateMachine/DebugTracker | HIGH |
| Scattered gsap.set() calls | HIGH |
| 960-line emotion function | HIGH |
| Magic dimensions mismatch | MEDIUM |
| Duplicated constants | MEDIUM |
| Duplicated eye reset/check patterns | MEDIUM |
| Dynamic require() in runtime | LOW |
| 'idea' alias | LOW |

---

## QUESTIONS FOR USER

1. Do you want to simplify the StateMachine/ElementRegistry/DebugTracker, or delete them entirely and use simpler patterns?

2. For initialization: should we create a single `initializeCharacter()` that sets ALL animatable properties, called once on mount?

3. The 960-line `createEmotionAnimation()` - should we split into per-emotion files, or use a declarative config approach?

4. Should test page use the real AnimationController, or is it intentionally simpler for testing individual eye shapes?
