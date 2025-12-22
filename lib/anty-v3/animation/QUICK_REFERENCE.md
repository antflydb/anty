# Animation System Feature Flags - Quick Reference

## TL;DR

Toggle between old and new animation systems with a single constant:

```typescript
// feature-flags.ts
export const USE_NEW_ANIMATION_CONTROLLER = false; // legacy system
export const USE_NEW_ANIMATION_CONTROLLER = true;  // new system
```

## Files Created

| File | Purpose | Size |
|------|---------|------|
| `feature-flags.ts` | Master toggle + logging utilities | 4.0K |
| `migration-helper.ts` | Wrapper that delegates to old/new system | 12K |
| `test-utils.ts` | Testing and validation utilities | 9.9K |
| `dev-tools.ts` | Browser console debugging tools | 8.7K |
| `example-usage.tsx` | React component examples | 6.1K |
| `MIGRATION_GUIDE.md` | Complete migration documentation | 8.9K |
| `QUICK_REFERENCE.md` | This file | - |

## Quick Commands

### In Your Component

```typescript
import { createMigrationWrapper } from './animation/migration-helper';
import { useAnimationController } from './animation/use-animation-controller';
import { useEyeAnimations } from './use-eye-animations';

// Setup both systems
const legacy = useEyeAnimations(refs);
const newSystem = useAnimationController(elements);

// Create wrapper
const animations = createMigrationWrapper(legacy, newSystem);

// Use it
animations.playExpression('happy');
animations.triggerBlink();
```

### In Browser Console

```typescript
// First, expose dev tools in your app
import { exposeDevTools } from '@/lib/anty-v3/animation/dev-tools';
exposeDevTools(); // in development only

// Then in console:
antyAnimations.getSystemInfo()        // Which system is active?
antyAnimations.testEmotion('happy')   // Test an emotion
antyAnimations.runTests()             // Run full test suite
antyAnimations.listEmotions()         // Show all emotions
antyAnimations.monitorState()         // Watch state changes
```

## Feature Flags at a Glance

```typescript
// Master toggle - which system to use
USE_NEW_ANIMATION_CONTROLLER = false  // Default, uses legacy

// Validation - run both in parallel (dev only)
ENABLE_ANIMATION_VALIDATION = true    // Auto-enabled in dev

// Logging - verbose debug output (dev only)
ENABLE_ANIMATION_DEBUG_LOGS = true    // Auto-enabled in dev
```

## Migration Checklist

- [ ] 1. Keep `USE_NEW_ANIMATION_CONTROLLER = false`
- [ ] 2. Test new system in isolation
- [ ] 3. Enable validation, compare both systems
- [ ] 4. Fix any discrepancies
- [ ] 5. Flip to `USE_NEW_ANIMATION_CONTROLLER = true`
- [ ] 6. Monitor for issues
- [ ] 7. Clean up legacy code

## Common Tasks

### Test New System Only

```typescript
const controller = useAnimationController(elements, {
  enableLogging: true,
});

controller.playEmotion('happy');
console.log(controller.getDebugInfo());
```

### Validate Both Systems

```typescript
const wrapper = createMigrationWrapper(legacy, newSystem);
wrapper.playExpression('happy');
// Check console for validation logs
```

### Check Which System Is Active

```typescript
import { getAnimationSystemType } from './animation/feature-flags';

console.log(getAnimationSystemType()); // 'legacy' or 'new'
```

## Expression → Emotion Mapping

| Legacy Expression | New Emotion | Notes |
|-------------------|-------------|-------|
| `idle` | `neutral` | Default state |
| `happy` | `happy` | ✅ Direct match |
| `excited` | `excited` | ✅ Direct match |
| `shocked` | `surprised` | Renamed |
| `wink` | `playful` | Semantic match |
| `angry` | `angry` | ✅ Direct match |
| `sad` | `sad` | ✅ Direct match |
| `idea` | `curious` | Semantic match |
| `lookaround` | `thinking` | Behavior → emotion |
| `spin` | - | ❌ No mapping |
| `look-left` | - | ❌ No mapping |
| `look-right` | - | ❌ No mapping |
| `nod` | - | ❌ No mapping |
| `headshake` | - | ❌ No mapping |
| `off` | - | ❌ No mapping |

## Troubleshooting

### "Controller not ready"
Elements aren't available yet. Check refs are set.

### "No emotion mapping"
Expression doesn't map to emotion. See table above.

### "Both systems different results"
Check validation logs for specific discrepancies.

### How to disable validation logs?
```typescript
// feature-flags.ts
export const ENABLE_ANIMATION_VALIDATION = false;
export const ENABLE_ANIMATION_DEBUG_LOGS = false;
```

## API Reference

### Migration Wrapper

```typescript
interface MigrationAnimationSystem {
  playExpression(expression, options?): boolean
  triggerBlink(): void
  triggerDoubleBlink(): void
  resetAnimations(): void
  startIdle(): void
  pause(): void
  resume(): void
  getCurrentExpression(): ExpressionName | EmotionType | null
}
```

### Feature Flags

```typescript
shouldUseNewAnimationController(): boolean
shouldValidateAnimations(): boolean
getAnimationSystemType(): 'legacy' | 'new'
logAnimationEvent(event, details?): void
logAnimationSystemInfo(): void
```

### Dev Tools (Console)

```typescript
window.antyAnimations = {
  getSystemInfo()
  runTests()
  testEmotion(emotion)
  testAllEmotions()
  listExpressions()
  listEmotions()
  monitorState()
  getDebugInfo()
  validateState()
}
```

## Next Steps

1. Read `MIGRATION_GUIDE.md` for full details
2. Check `example-usage.tsx` for component examples
3. Use `test-utils.ts` for validation testing
4. Expose `dev-tools.ts` for console debugging

## Support

Questions? Check:
- `MIGRATION_GUIDE.md` - Comprehensive guide
- `example-usage.tsx` - Working examples
- Browser console - `antyAnimations.getSystemInfo()`
