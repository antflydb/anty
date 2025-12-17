# Anty Tamagotchi Interaction System

## Overview

The interaction system provides 7 actions that users can perform to care for Anty, each with specific stat changes, cooldowns, and feedback messages. This is Phase 2 Agent 1 of the Anty Tamagotchi project.

## File Location

`/Users/ellis/projects/www/lib/anty/interactions.ts`

## Features

### 1. Seven Core Actions

Each action has been carefully designed with meaningful stat impacts:

| Action | Emoji | Energy | Happiness | Knowledge | Index Health | Cooldown |
|--------|-------|--------|-----------|-----------|--------------|----------|
| Feed Data | 🍔 | +20 | +10 | 0 | +5 | 8s |
| Play Query Game | 🎮 | -10 | +25 | +5 | 0 | 10s |
| Rest | 😴 | +30 | -5 | 0 | 0 | 6s |
| Optimize Index | ⚡ | -15 | 0 | +10 | +20 | 10s |
| Run Query | 🔍 | -5 | 0 | +15 | -5 | 5s |
| Reindex Database | 🔄 | -20 | -10 | 0 | +30 | 10s |
| Train Model | 🧠 | -15 | +5 | +25 | 0 | 8s |

### 2. Cooldown System

- Each action has a configurable cooldown period (5-10 seconds)
- Prevents spam and encourages strategic gameplay
- Provides clear feedback on remaining cooldown time
- Stored as ISO timestamps for precise timing

### 3. Type Safety

Full TypeScript strict mode support:

```typescript
export type ActionName = 'feed' | 'play' | 'rest' | 'optimize' | 'query' | 'reindex' | 'train';

export interface ActionResult {
  stats: AntyStats;
  message: string;
  cooldownUntil: string;
}

export interface ActionError {
  error: string;
  cooldownRemaining?: number;
}

export interface ActionConfig {
  name: ActionName;
  label: string;
  description: string;
  statChanges: Partial<AntyStats>;
  cooldownSeconds: number;
  emoji: string;
}
```

### 4. Helper Functions

#### executeAction()
Main function to perform an action. Returns either success or error:

```typescript
const result = executeAction('feed', currentStats, lastActionTimes);

if (isActionError(result)) {
  console.error(result.error);
  console.log(`Wait ${result.cooldownRemaining}s`);
} else {
  // Update stats
  setStats(result.stats);
  // Show message
  console.log(result.message);
  // Store cooldown
  lastActionTimes['feed'] = result.cooldownUntil;
}
```

#### getActionCooldown()
Check remaining cooldown time in seconds:

```typescript
const remaining = getActionCooldown('play', lastActionTimes);
// Returns: 5 (if 5 seconds remaining), or 0 (if ready)
```

#### isActionReady()
Simple boolean check if action is available:

```typescript
if (isActionReady('feed', lastActionTimes)) {
  // Action is ready to execute
}
```

#### getAllActionsStatus()
Get status of all actions at once (useful for UI):

```typescript
const statuses = getAllActionsStatus(lastActionTimes);
// Returns array of: { action, config, cooldownRemaining, isReady }
```

#### getRecommendedActions()
Smart recommendations based on current stats:

```typescript
const recommendations = getRecommendedActions(currentStats);
// Returns up to 3 action names that would help low stats
```

#### getActionImpact()
Calculate total impact score of an action:

```typescript
const impact = getActionImpact('feed');
// Returns: 35 (20 + 10 + 5)
```

## Integration with Phase 1 Systems

### Stat System Integration

Uses `applyStatChange()` from stat-system.ts to ensure:
- All stat changes are properly clamped (0-100 range)
- Consistent behavior across the application
- Type-safe stat manipulation

```typescript
const newStats = applyStatChange(currentStats, {
  energy: 20,
  happiness: 10,
  indexHealth: 5
});
```

### Expression System Integration

Actions can trigger expression changes based on new stat values:

```typescript
const result = executeAction('play', currentStats, lastActionTimes);
if (!isActionError(result)) {
  const newExpression = getExpressionByStats(result.stats);
  // Update Anty's visual expression
}
```

## Usage Example

```typescript
import {
  executeAction,
  isActionError,
  getAllActionsStatus,
  getRecommendedActions,
  type ActionName
} from '@/lib/anty';

function AntyComponent() {
  const [stats, setStats] = useState<AntyStats>(INITIAL_STATS);
  const [actionTimes, setActionTimes] = useState<Record<string, string>>({});

  const handleAction = (action: ActionName) => {
    const result = executeAction(action, stats, actionTimes);

    if (isActionError(result)) {
      toast.error(result.error);
      return;
    }

    // Update stats
    setStats(result.stats);

    // Update cooldown tracking
    setActionTimes(prev => ({
      ...prev,
      [action]: result.cooldownUntil
    }));

    // Show success message
    toast.success(result.message);
  };

  const actionStatuses = getAllActionsStatus(actionTimes);
  const recommendations = getRecommendedActions(stats);

  return (
    <div>
      {actionStatuses.map(({ action, config, isReady, cooldownRemaining }) => (
        <button
          key={action}
          onClick={() => handleAction(action)}
          disabled={!isReady}
        >
          {config.emoji} {config.label}
          {!isReady && ` (${cooldownRemaining}s)`}
        </button>
      ))}

      {recommendations.length > 0 && (
        <div>
          Suggested: {recommendations.map(a => ACTIONS[a].emoji).join(' ')}
        </div>
      )}
    </div>
  );
}
```

## Success Criteria

✓ **TypeScript Strict Mode**: Compiles with `--strict --noEmit`
✓ **All 7 Actions Defined**: Feed, Play, Rest, Optimize, Query, Reindex, Train
✓ **Proper Stat Changes**: Each action has meaningful impact on stats
✓ **Cooldown System**: Prevents spam with 5-10s cooldowns per action
✓ **Type Safety**: Full TypeScript types for all interfaces
✓ **Integration**: Seamlessly integrates with Phase 1 stat system
✓ **Helper Functions**: Comprehensive utility functions for UI integration
✓ **Error Handling**: Clear error messages and type guards
✓ **Random Messages**: Multiple feedback messages per action
✓ **Recommendations**: Smart action suggestions based on stats

## Testing

Comprehensive test suite in `/Users/ellis/projects/www/lib/anty/__tests__/interactions.test.ts` covers:

1. All 7 actions are defined
2. Execute feed action
3. Cooldown system
4. Action ready check
5. Get all actions status
6. Recommended actions
7. Action impact calculation
8. Stat clamping (max 100)
9. All action configurations are valid

Run tests with:
```bash
npx tsx lib/anty/__tests__/interactions.test.ts
```

## Next Steps (Phase 2 Agent 2)

The next agent should build the UI components that use this interaction system:

1. Action button grid with cooldown indicators
2. Stat display bars with colors
3. Recommendation chip components
4. Animation integration with expressions
5. Toast notifications for action feedback
6. Local storage persistence for action times
