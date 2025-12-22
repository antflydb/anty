# Animation System Migration Guide

This guide helps you safely transition from the legacy eye animation system to the new `AnimationController`.

## Overview

We've built a feature flag system that allows you to:
- Toggle between old and new animation systems
- Run both systems in parallel for validation
- Gradually migrate components
- Monitor for discrepancies

## Files

- **`feature-flags.ts`** - Master feature flags and logging utilities
- **`migration-helper.ts`** - Wrapper functions that delegate to old or new system
- **`MIGRATION_GUIDE.md`** - This file

## Quick Start

### Step 1: Initial Setup (Current State)

The feature flag is currently set to use the **legacy system**:

```typescript
// feature-flags.ts
export const USE_NEW_ANIMATION_CONTROLLER = false;
```

### Step 2: Test New System in Isolation

You can test the new system without affecting production:

```typescript
import { useAnimationController } from './animation/use-animation-controller';

// In your component
const newAnimationSystem = useAnimationController(elements, {
  enableLogging: true,
});

// Test it manually
newAnimationSystem.playEmotion('happy');
newAnimationSystem.startIdle();
```

### Step 3: Enable Validation Mode

Run both systems in parallel and compare results:

```typescript
// feature-flags.ts - already enabled in development
export const ENABLE_ANIMATION_VALIDATION = process.env.NODE_ENV === 'development';
```

```typescript
// In your component
import { createMigrationWrapper } from './animation/migration-helper';

const wrapper = createMigrationWrapper(legacyEyeAnimations, newAnimationSystem);

// This will run both systems and log discrepancies
wrapper.playExpression('happy');
```

### Step 4: Monitor Logs

Watch for validation messages in the console:

```
🎬 [LEGACY] playExpression {expression: "happy"}
✅ Validation: playExpression returned consistent values
⚠️  Animation Validation Discrepancy
    Property: playExpression state value
    Old Value: "idle"
    New Value: "neutral"
```

### Step 5: Switch to New System

Once validated, flip the feature flag:

```typescript
// feature-flags.ts
export const USE_NEW_ANIMATION_CONTROLLER = true;
```

### Step 6: Clean Up

After the new system is stable:
1. Remove legacy animation code
2. Remove migration wrapper
3. Remove feature flags
4. Update components to use new system directly

## Feature Flags Reference

### `USE_NEW_ANIMATION_CONTROLLER`

Master toggle for the animation system.
- `false` (default): Uses legacy `use-eye-animations.ts`
- `true`: Uses new `AnimationController`

```typescript
import { shouldUseNewAnimationController } from './animation/feature-flags';

if (shouldUseNewAnimationController()) {
  // Use new system
} else {
  // Use legacy system
}
```

### `ENABLE_ANIMATION_VALIDATION`

Run both systems in parallel for validation.
- Only works in development mode
- Logs discrepancies between systems

```typescript
import { shouldValidateAnimations } from './animation/feature-flags';

if (shouldValidateAnimations()) {
  // Run both systems and compare
}
```

### `ENABLE_ANIMATION_DEBUG_LOGS`

Verbose logging for debugging.
- Enabled in development by default
- Shows system startup, state changes, validation results

## Migration Helper API

### `createMigrationWrapper(legacySystem, newSystem)`

Creates a unified interface that delegates to the appropriate system.

```typescript
import { createMigrationWrapper } from './animation/migration-helper';
import { useEyeAnimations } from './use-eye-animations';
import { useAnimationController } from './animation/use-animation-controller';

// Setup both systems
const legacySystem = useEyeAnimations(refs);
const newSystem = useAnimationController(elements);

// Create wrapper
const animations = createMigrationWrapper(legacySystem, newSystem);

// Use unified API
animations.playExpression('happy');
animations.triggerBlink();
animations.resetAnimations();
```

### Available Methods

```typescript
interface MigrationAnimationSystem {
  playExpression(expression: ExpressionName, options?: AnimationOptions): boolean;
  triggerBlink(): void;
  triggerDoubleBlink(): void;
  resetAnimations(): void;
  startIdle(): void;
  pause(): void;
  resume(): void;
  getCurrentExpression(): ExpressionName | EmotionType | null;
}
```

## Expression Mapping

The old system uses `ExpressionName`, the new system uses `EmotionType`. Here's the mapping:

| Legacy Expression | New Emotion  | Notes                    |
|-------------------|--------------|--------------------------|
| `idle`            | `neutral`    | Default state            |
| `happy`           | `happy`      | Direct mapping           |
| `excited`         | `excited`    | Direct mapping           |
| `shocked`         | `surprised`  | Semantic equivalent      |
| `wink`            | `playful`    | Closest match            |
| `angry`           | `angry`      | Direct mapping           |
| `sad`             | `sad`        | Direct mapping           |
| `idea`            | `curious`    | Semantic equivalent      |
| `lookaround`      | `thinking`   | Behavior-based mapping   |
| `spin`            | -            | No direct equivalent     |
| `look-left`       | -            | Directional, not emotion |
| `look-right`      | -            | Directional, not emotion |
| `nod`             | -            | Gesture, not emotion     |
| `headshake`       | -            | Gesture, not emotion     |
| `off`             | -            | State, not emotion       |

**Note:** Some legacy expressions don't map to emotions. These require special handling or new controller features.

## Logging Examples

### System Startup

```
╔═══════════════════════════════════════════════════════════════╗
║ 🎬 Animation System Status                                    ║
╠═══════════════════════════════════════════════════════════════╣
║ Active System: LEGACY AnimationStateMachine                   ║
║ Validation:    ENABLED                                        ║
║ Debug Logs:    ENABLED                                        ║
╚═══════════════════════════════════════════════════════════════╝
```

### Animation Events

```
🎬 [LEGACY] playExpression {expression: "happy", options: {}}
🎬 [NEW] State transition: IDLE → EMOTION
🎬 [NEW] Playing emotion: happy
```

### Validation Results

```
✅ Validation: playExpression returned consistent values
✅ Validation: resetAnimations executed on both systems

⚠️  Animation Validation Discrepancy
Property: playExpression state value
Old Value: "shocked"
New Value: "surprised"
Context: { "expression": "shocked", "mappedOld": "surprised" }
```

## Troubleshooting

### Both systems produce different results

1. Check the expression mapping - old and new may use different names
2. Review timing differences - new system may have different durations
3. Check element availability - new system needs specific DOM refs
4. Look for GSAP conflicts - ensure old animations are cleaned up

### New system not working

1. Verify `isReady` is `true` - elements must be available
2. Check `getDebugInfo()` for state information
3. Enable logging: `enableLogging: true` in controller options
4. Ensure GSAP is loaded and initialized

### Validation logs are noisy

1. Disable validation: set `ENABLE_ANIMATION_VALIDATION = false`
2. Reduce debug logs: set `ENABLE_ANIMATION_DEBUG_LOGS = false`
3. Filter console for specific events

## Testing Checklist

Before flipping to the new system:

- [ ] All expressions play correctly
- [ ] Idle animation loops smoothly
- [ ] Blink animations work (if implemented)
- [ ] State transitions are smooth
- [ ] No GSAP conflicts or warnings
- [ ] Performance is acceptable (no janky animations)
- [ ] Wake-up sequence works (OFF → ON)
- [ ] Search mode transitions work
- [ ] Validation shows no critical discrepancies

## Migration Timeline

### Phase 1: Development (Current)
- ✅ Feature flags implemented
- ✅ Migration helper created
- ✅ New controller functional
- 🔄 Legacy system still in use

### Phase 2: Validation
- [ ] Enable validation mode
- [ ] Test all expressions
- [ ] Fix discrepancies
- [ ] Add missing features to new system

### Phase 3: Rollout
- [ ] Flip feature flag to new system
- [ ] Monitor for issues
- [ ] Fix bugs as they appear

### Phase 4: Cleanup
- [ ] Remove legacy code
- [ ] Remove migration wrapper
- [ ] Remove feature flags
- [ ] Update documentation

## Support

If you encounter issues during migration:
1. Check validation logs for specific discrepancies
2. Use `getDebugInfo()` to inspect controller state
3. Test expressions individually to isolate problems
4. Revert to legacy system if needed (`USE_NEW_ANIMATION_CONTROLLER = false`)
