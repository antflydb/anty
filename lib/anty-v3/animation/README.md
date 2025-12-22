# Animation Controller Infrastructure

Core animation system using Finite State Machine (FSM) pattern to prevent animation conflicts and ensure smooth, predictable transitions.

## Architecture

The animation system is built on three core components:

### 1. **StateMachine** (`state-machine.ts`)

Validates and manages state transitions with priority-based interruption rules.

**States:**
- `IDLE` - Default floating/breathing animation (priority: 1)
- `TRANSITION` - Transitioning between states (priority: 2)
- `MORPH` - Morphing between shapes (priority: 2)
- `INTERACTION` - User interaction responses (priority: 3)
- `EMOTION` - Emotional expressions (priority: 4)
- `OFF` - Powered off state (priority: 0)

**Key Features:**
- Priority-based interruption (higher priority can interrupt lower)
- Comprehensive transition rules validation
- State history tracking for debugging
- Prevents invalid state transitions

**Example:**
```typescript
const sm = new StateMachine(true); // enableLogging

// Try to transition
if (sm.transition(AnimationState.EMOTION)) {
  console.log('Transitioned to EMOTION');
}

// Check if can interrupt
if (sm.canInterrupt(AnimationState.INTERACTION)) {
  console.log('Can interrupt current state');
}
```

### 2. **ElementRegistry** (`element-registry.ts`)

Tracks element ownership to prevent conflicting animations on the same elements.

**Key Features:**
- Element ownership tracking
- Safe cleanup mechanisms
- Force-acquire for high priority animations
- Memory leak detection

**Example:**
```typescript
const registry = new ElementRegistry(true); // enableLogging

const timeline = gsap.timeline();
const element = document.querySelector('.anty-body');

// Acquire ownership
if (registry.acquire(element, 'animation-id', timeline)) {
  console.log('Acquired element');
}

// Release when done
registry.release(element);

// Or release all from an animation
registry.releaseByOwner('animation-id');
```

### 3. **AnimationController** (`controller.ts`)

Main orchestrator that coordinates state machine and element registry.

**Key Features:**
- Public API for animations
- Animation queueing system
- Idle animation management (always restarts)
- Lifecycle callbacks
- Debug information

**Example:**
```typescript
import { AnimationController, AnimationState } from './animation';

const controller = new AnimationController(
  {
    onStart: (state, emotion) => console.log(`Started ${state}`, emotion),
    onComplete: (state, emotion) => console.log(`Completed ${state}`, emotion),
    onStateChange: (from, to) => console.log(`${from} → ${to}`),
  },
  {
    enableLogging: true,
    enableQueue: true,
    maxQueueSize: 10,
    defaultPriority: 2,
  }
);

// Start idle animation
const idleTimeline = gsap.timeline({ repeat: -1 });
// ... configure idle animation
controller.startIdle(idleTimeline, [bodyElement, eyesElement]);

// Play emotion
const emotionTimeline = gsap.timeline();
// ... configure emotion animation
controller.playEmotion(
  'happy',
  emotionTimeline,
  [bodyElement, eyesElement],
  {
    priority: 4,
    force: false,
    onComplete: () => console.log('Emotion done'),
  }
);

// Get debug info
const debug = controller.getDebugInfo();
console.log(debug);
```

## State Transition Rules

| From | To | Allowed | Priority |
|------|----|---------| ---------|
| IDLE | EMOTION | ✅ | 4 |
| IDLE | INTERACTION | ✅ | 3 |
| EMOTION | INTERACTION | ❌ | - |
| EMOTION | EMOTION | ✅ | 4 |
| * | OFF | ✅ | 0 |

See `state-machine.ts` for complete transition matrix.

## Animation Flow

1. **Request Animation**: Call `playEmotion()` or `transitionTo()`
2. **Check Priority**: StateMachine validates if new animation can interrupt current
3. **Queue or Play**: If can't interrupt, queue the animation (if enabled)
4. **Acquire Elements**: ElementRegistry locks elements to prevent conflicts
5. **Execute Animation**: Timeline plays with lifecycle callbacks
6. **Cleanup**: Release elements, return to idle, process queue

## Idle Animation Guarantee

The controller ensures idle animation **always restarts** after any animation completes:

```typescript
// Idle completion callback automatically triggers restart
timeline.eventCallback('onComplete', () => {
  this.isIdleActive = false;
  this.callbacks.onComplete?.(AnimationState.IDLE);
  // System will restart idle based on isIdleActive flag
});
```

## Edge Cases Handled

1. **Rapid Triggers**: Queue system prevents animation pile-up
2. **Missing Elements**: Graceful degradation with warnings
3. **Memory Leaks**: Element registry validates ownership age
4. **Conflicting Animations**: Priority system ensures correct behavior
5. **Interrupted Animations**: Proper cleanup via onInterrupt callbacks

## Debugging

Enable logging to see detailed state transitions and element tracking:

```typescript
const controller = new AnimationController({}, {
  enableLogging: true,
});

// Logs will show:
// [StateMachine] Transition: IDLE → EMOTION
// [ElementRegistry] emotion-happy-123 acquired .anty-body
// [AnimationController] Play emotion: happy (priority: 4)
```

Check debug info at any time:

```typescript
const debug = controller.getDebugInfo();
console.log({
  currentState: debug.state.currentState,
  currentEmotion: debug.currentEmotion,
  queueSize: debug.queueSize,
  ownedElements: debug.elements.totalOwned,
});
```

## Type Safety

All types are exported from `types.ts`:

```typescript
import {
  AnimationState,
  EmotionType,
  AnimationCallbacks,
  AnimationOptions,
  ControllerConfig,
} from './animation/types';
```

## Memory Management

The controller provides cleanup methods:

```typescript
// Kill all animations and cleanup
controller.killAll();

// Destroy controller (call in useEffect cleanup)
controller.destroy();
```

## Testing

Validate state machine rules:

```typescript
import { StateMachine } from './animation';

const isValid = StateMachine.validateRules();
console.log('Transition rules valid:', isValid);
```

## Integration Example

```typescript
// In React component
const controllerRef = useRef<AnimationController>();

useEffect(() => {
  controllerRef.current = new AnimationController(
    {
      onStateChange: (from, to) => {
        console.log(`State: ${from} → ${to}`);
      },
    },
    { enableLogging: process.env.NODE_ENV === 'development' }
  );

  return () => {
    controllerRef.current?.destroy();
  };
}, []);

// Trigger animation
const handleClick = () => {
  const timeline = gsap.timeline();
  // ... configure animation

  controllerRef.current?.playEmotion(
    'excited',
    timeline,
    [bodyEl, eyesEl],
    { priority: 4 }
  );
};
```

## Performance

- **Lightweight**: Minimal overhead, leverages GSAP's optimized engine
- **No Memory Leaks**: Automatic cleanup and validation
- **Queue Limits**: Configurable max queue size prevents unbounded growth
- **Element Tracking**: O(1) lookup for ownership checks

## Future Enhancements

- Priority override rules for special cases
- Animation preloading/caching
- Performance metrics tracking
- Animation composition (parallel + sequential)
- Gesture-based interruption rules
