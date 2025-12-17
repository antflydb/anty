# Anty Animation System - Quick Start Guide

## Installation

No installation needed! The system uses the already-installed Framer Motion dependency.

## Basic Usage

### 1. Simple Static Character

```tsx
import { AntyCharacter } from '@/components/anty';

export function MyComponent() {
  return <AntyCharacter expression="happy" size={200} />;
}
```

### 2. Character with Blinking

```tsx
import { AntyCharacter } from '@/components/anty';
import { useRandomBlink } from '@/hooks/anty';

export function MyComponent() {
  const { isBlinking } = useRandomBlink({
    currentExpression: 'happy',
  });

  return (
    <AntyCharacter
      expression="happy"
      isBlinking={isBlinking}
      size={200}
    />
  );
}
```

### 3. Full Integration with Stats

```tsx
import { AntyCharacter } from '@/components/anty';
import { useRandomBlink } from '@/hooks/anty';
import { getExpressionByStats } from '@/lib/anty';

export function MyComponent({ stats }) {
  // Stats determine expression
  const expression = getExpressionByStats(stats);

  // Automatic random blinking
  const { isBlinking } = useRandomBlink({
    currentExpression: expression,
  });

  return (
    <AntyCharacter
      expression={expression}
      isBlinking={isBlinking}
      size={200}
    />
  );
}
```

### 4. Interactive Character

```tsx
import { useState } from 'react';
import { AntyCharacter } from '@/components/anty';
import { useRandomBlink } from '@/hooks/anty';
import type { Expression } from '@/lib/anty';

export function MyComponent() {
  const [expression, setExpression] = useState<Expression>('idle');
  const [pauseBlink, setPauseBlink] = useState(false);

  const { isBlinking, triggerBlink } = useRandomBlink({
    currentExpression: expression,
    pauseBlinking: pauseBlink,
  });

  return (
    <div>
      <AntyCharacter
        expression={expression}
        isBlinking={isBlinking}
        size={200}
        onHoverChange={(isHovered) => setPauseBlink(isHovered)}
      />

      <button onClick={() => setExpression('happy')}>
        Make Happy
      </button>
      <button onClick={triggerBlink}>
        Blink Now
      </button>
    </div>
  );
}
```

## Available Expressions

```typescript
type Expression =
  | 'logo'      // Default SearchAF logo
  | 'idle'      // Neutral, waiting
  | 'happy'     // Positive, content
  | 'sad'       // Low stats
  | 'excited'   // High energy
  | 'tired'     // Low energy
  | 'sleepy'    // Very tired
  | 'wink'      // Playful
  | 'blink'     // Eyes closed
  | 'thinking'  // Considering
  | 'confused'  // Mixed signals
  | 'sick'      // Unhealthy
  | 'proud'     // Achievement
  | 'angry'     // Neglected
  | 'curious';  // Exploring
```

## Props Reference

### AntyCharacter

```typescript
interface AntyCharacterProps {
  expression: Expression;        // Required: Current expression
  size?: number;                 // Optional: Size in pixels (default: 200)
  className?: string;            // Optional: CSS classes
  isBlinking?: boolean;          // Optional: Override blink state
  onHoverChange?: (isHovered: boolean) => void; // Optional: Hover callback
}
```

### useRandomBlink

```typescript
// Options
interface UseRandomBlinkOptions {
  currentExpression: Expression; // Required
  onBlinkStart?: () => void;     // Optional
  onBlinkEnd?: () => void;       // Optional
  pauseBlinking?: boolean;       // Optional: Pause auto-blink
  enabled?: boolean;             // Optional: Enable/disable (default: true)
}

// Returns
interface UseRandomBlinkReturn {
  isBlinking: boolean;           // Current blink state
  triggerBlink: () => void;      // Manually trigger blink
  resetTimer: () => void;        // Reset blink timer
}
```

## Animation Layers

Your character automatically gets **4 animation layers**:

1. **Ghostly Floating** - Continuous ethereal Y-axis movement
2. **Eye Morphing** - Smooth transitions between expressions
3. **Random Blinking** - Natural blink timing (when using the hook)
4. **Hover Effects** - Subtle interactive feedback

## Customization

### Change Character Size

```tsx
<AntyCharacter expression="happy" size={300} /> // Larger
<AntyCharacter expression="happy" size={100} /> // Smaller
```

### Control Blinking

```tsx
const { isBlinking, triggerBlink, resetTimer } = useRandomBlink({
  currentExpression: 'happy',
  pauseBlinking: isUserInteracting, // Pause during interactions
  onBlinkStart: () => console.log('Blink started!'),
  onBlinkEnd: () => console.log('Blink ended!'),
});

// Manual control
<button onClick={triggerBlink}>Force Blink</button>
<button onClick={resetTimer}>Reset Timer</button>
```

### Style with CSS

```tsx
<AntyCharacter
  expression="happy"
  className="text-blue-500 hover:text-blue-600"
/>
```

The character uses `currentColor`, so you can style it with text color utilities.

## Demo Component

Try the interactive demo:

```tsx
import { AntyDemo } from '@/components/anty/anty-demo';

// In your page
<AntyDemo />
```

This shows all 15 expressions with interactive controls.

## Common Patterns

### Expression from Stats

```tsx
const expression = getExpressionByStats({
  energy: 45,
  happiness: 80,
  health: 90,
});
// Returns: 'happy'
```

### Pause Blinking on Hover

```tsx
const [pauseBlink, setPauseBlink] = useState(false);

<AntyCharacter
  onHoverChange={(isHovered) => setPauseBlink(isHovered)}
/>
```

### Event-Based Expressions

```tsx
// Show excited when user clicks
const handleClick = () => {
  setExpression('excited');
  setTimeout(() => setExpression('idle'), 2000);
};
```

## Performance

All animations are GPU-accelerated and run at 60fps. The character:
- Uses `will-change: transform` for optimization
- Minimizes re-renders
- Cleans up timers properly
- Respects browser performance settings

## Browser Support

- Chrome/Edge 95+
- Firefox 93+
- Safari 15+
- Mobile browsers (iOS Safari 15+, Chrome Android 95+)

## Need More?

See detailed documentation:
- `/components/anty/ANIMATION_SYSTEM.md` - Full technical docs
- `/lib/anty/README.md` - Expression system details
- `/components/anty/PHASE1_AGENT2_COMPLETE.md` - Implementation details

## Quick Troubleshooting

**Character not animating?**
- Check that Framer Motion is installed: `npm list framer-motion`
- Verify component is in a client component (`'use client'`)

**Blinking not working?**
- Make sure you're using the `useRandomBlink` hook
- Pass the `isBlinking` prop to `AntyCharacter`

**Expression not changing?**
- Verify the expression name is valid (see list above)
- Check that you're passing the correct Expression type

## Example: Full Featured Component

```tsx
'use client';

import { useState } from 'react';
import { AntyCharacter, type Expression } from '@/components/anty';
import { useRandomBlink } from '@/hooks/anty';
import { getExpressionByStats } from '@/lib/anty';

export function FullAntyExample() {
  // Stats (could come from state management)
  const [stats] = useState({
    energy: 75,
    happiness: 80,
    health: 90,
  });

  // Get expression from stats
  const expression = getExpressionByStats(stats);

  // Random blinking
  const { isBlinking, triggerBlink } = useRandomBlink({
    currentExpression: expression,
    onBlinkStart: () => console.log('👀 Blink!'),
  });

  // Hover state
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AntyCharacter
        expression={expression}
        isBlinking={isBlinking}
        size={200}
        onHoverChange={setIsHovered}
        className="text-foreground"
      />

      <div className="text-sm text-muted-foreground">
        Expression: {expression}
        {isHovered && ' (hovering)'}
        {isBlinking && ' (blinking)'}
      </div>

      <button
        onClick={triggerBlink}
        className="px-4 py-2 bg-primary text-primary-foreground rounded"
      >
        Trigger Blink
      </button>
    </div>
  );
}
```

That's it! You're ready to use Anty in your app. 🎉
