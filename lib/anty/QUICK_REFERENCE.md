# Anty Interaction System - Quick Reference

## Import

```typescript
import {
  ACTIONS,
  executeAction,
  isActionError,
  getAllActionsStatus,
  getRecommendedActions,
  type ActionName,
  type ActionResult,
  type AntyStats
} from '@/lib/anty';
```

## Execute Action

```typescript
const result = executeAction('feed', currentStats, lastActionTimes);

if (isActionError(result)) {
  // Handle error
  toast.error(result.error);
  console.log(`Wait ${result.cooldownRemaining}s`);
} else {
  // Success
  setStats(result.stats);
  toast.success(result.message);
  setLastActionTimes(prev => ({
    ...prev,
    [action]: result.cooldownUntil
  }));
}
```

## Check Action Status

```typescript
// Single action
const remaining = getActionCooldown('feed', lastActionTimes);
const ready = isActionReady('feed', lastActionTimes);

// All actions
const statuses = getAllActionsStatus(lastActionTimes);
// Returns: [{ action, config, cooldownRemaining, isReady }, ...]
```

## Get Recommendations

```typescript
const suggestions = getRecommendedActions(currentStats);
// Returns: ['rest', 'feed', 'play'] (up to 3)
```

## Actions Cheat Sheet

```
🍔 feed      → +20 energy, +10 happiness, +5 index (8s)
🎮 play      → -10 energy, +25 happiness, +5 knowledge (10s)
😴 rest      → +30 energy, -5 happiness (6s)
⚡ optimize  → -15 energy, +10 knowledge, +20 index (10s)
🔍 query     → -5 energy, +15 knowledge, -5 index (5s)
🔄 reindex   → -20 energy, -10 happiness, +30 index (10s)
🧠 train     → -15 energy, +5 happiness, +25 knowledge (8s)
```

## State Management

```typescript
// Component state
const [stats, setStats] = useState<AntyStats>(INITIAL_STATS);
const [actionTimes, setActionTimes] = useState<Record<string, string>>({});

// Persist to localStorage
useEffect(() => {
  localStorage.setItem('anty-stats', JSON.stringify(stats));
  localStorage.setItem('anty-action-times', JSON.stringify(actionTimes));
}, [stats, actionTimes]);

// Load from localStorage
useEffect(() => {
  const savedStats = localStorage.getItem('anty-stats');
  const savedTimes = localStorage.getItem('anty-action-times');
  if (savedStats) setStats(JSON.parse(savedStats));
  if (savedTimes) setActionTimes(JSON.parse(savedTimes));
}, []);
```

## UI Components Example

```tsx
function ActionButton({ action }: { action: ActionName }) {
  const config = ACTIONS[action];
  const cooldown = getActionCooldown(action, actionTimes);
  const ready = cooldown === 0;

  return (
    <button
      onClick={() => handleAction(action)}
      disabled={!ready}
      className={ready ? 'bg-blue-500' : 'bg-gray-400'}
    >
      <span className="text-2xl">{config.emoji}</span>
      <span>{config.label}</span>
      {!ready && <span className="text-xs">({cooldown}s)</span>}
    </button>
  );
}
```

## Common Patterns

### Check Before Execute
```typescript
if (isActionReady('feed', actionTimes)) {
  const result = executeAction('feed', stats, actionTimes);
  // Handle result
}
```

### Batch Status Check
```typescript
const actionStatuses = getAllActionsStatus(actionTimes);
const readyActions = actionStatuses.filter(s => s.isReady);
const busyActions = actionStatuses.filter(s => !s.isReady);
```

### Smart Recommendations UI
```typescript
const suggestions = getRecommendedActions(stats);
return (
  <div className="recommendations">
    <h3>Suggested Actions:</h3>
    {suggestions.map(action => (
      <ActionButton key={action} action={action} highlighted />
    ))}
  </div>
);
```

### Real-time Cooldown Display
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setActionTimes(prev => ({ ...prev })); // Trigger re-render
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

## TypeScript Types

```typescript
type ActionName = 'feed' | 'play' | 'rest' | 'optimize' | 'query' | 'reindex' | 'train';

interface ActionResult {
  stats: AntyStats;
  message: string;
  cooldownUntil: string;
}

interface ActionError {
  error: string;
  cooldownRemaining?: number;
}

interface ActionConfig {
  name: ActionName;
  label: string;
  description: string;
  statChanges: Partial<AntyStats>;
  cooldownSeconds: number;
  emoji: string;
}

interface AntyStats {
  energy: number;      // 0-100
  happiness: number;   // 0-100
  knowledge: number;   // 0-100
  indexHealth: number; // 0-100
}
```

## Performance Tips

1. **Memoize Action Statuses**: Use `useMemo` for `getAllActionsStatus()`
2. **Debounce Updates**: Don't update every millisecond
3. **Batch State Updates**: Combine stat and time updates
4. **Lazy Loading**: Don't render all buttons if not visible

## Testing

```typescript
import { executeAction, INITIAL_STATS } from '@/lib/anty';

test('feed action increases energy', () => {
  const result = executeAction('feed', INITIAL_STATS, {});
  expect(result.stats.energy).toBe(INITIAL_STATS.energy + 20);
});
```
