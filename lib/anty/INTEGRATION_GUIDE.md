# Anty Tamagotchi - Phase 1 Complete: Integration Guide

## Phase 1 Summary - Expression System

Phase 1 has successfully created the foundational expression type system for the Anty Tamagotchi character. This system provides 15 unique expressions with SVG path data extracted from the SearchAF logo, along with comprehensive trigger logic and documentation.

## What Was Completed

### Core Files Created

1. **`expressions.ts`** (14KB)
   - Complete TypeScript expression type system
   - All 15 expression definitions with SVG paths
   - Stat-based expression detection logic
   - Helper functions for morphing validation
   - Static bracket path definitions

2. **`README.md`** (6.5KB)
   - Architecture overview
   - Expression trigger logic
   - Usage examples
   - Animation guidelines
   - Future enhancement ideas

3. **`EXPRESSION_MAPPING.md`** (8.9KB)
   - Quick reference table
   - Expression decision tree
   - Visual emotion spectrum
   - Stat-based trigger ranges
   - Combination matrix
   - Event-driven triggers

4. **`SVG_PATH_REFERENCE.md`** (8.5KB)
   - Source file documentation
   - Extracted SVG paths with coordinates
   - Path structure analysis
   - Morphing compatibility notes
   - Technical specifications
   - Validation checklist

### Expression System Features

#### 15 Unique Expressions

**Base 6 (from Figma/Logo):**
- `logo` - Default SearchAF logo state
- `idle` - Neutral, calm waiting state
- `happy` - Positive, content expression
- `sad` - Low stats, neglected state
- `wink` - Playful interaction (right eye closed)
- `blink` - Natural animation cycle (both eyes closed)

**Derived 9:**
- `excited` - High energy after feeding/playing
- `tired` - Low energy state
- `thinking` - Processing, considering
- `confused` - Conflicting stats, needs attention
- `sick` - Critical health (indexHealth < 20%)
- `proud` - Achievement unlocked
- `sleepy` - Very low energy (< 15%)
- `angry` - Neglected for too long
- `curious` - Exploring, learning

#### SVG Path Extraction

Successfully extracted from `/public/af-logo.svg`:

- **Left Bracket** (static): Bottom-left L-shaped bracket
- **Right Bracket** (static): Top-right L-shaped bracket
- **Left Eye** (morphing): Inner left triangular shape
- **Right Eye** (morphing): Inner right triangular shape

All paths are compatible for smooth CSS/SVG morphing animations.

#### Integration with Existing System

The expression system is fully compatible with:
- `stat-system.ts` - Uses AntyStats interface (energy, happiness, knowledge, indexHealth)
- `animation-configs.ts` - Exports referenced in index.ts
- TypeScript strict mode - All types properly defined

## How to Use in Phase 2 (React Component)

### Basic Import

```typescript
import {
  expressions,
  staticBrackets,
  getExpressionByStats,
  type Expression,
  type ExpressionData,
} from '@/lib/anty/expressions';

// Or use the barrel export
import {
  expressions,
  staticBrackets,
  getExpressionByStats,
} from '@/lib/anty';
```

### React Component Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  expressions,
  staticBrackets,
  getExpressionByStats,
  eyeMorphTransition,
  type Expression,
} from '@/lib/anty';
import type { AntyStats } from '@/lib/anty/stat-system';

interface AntyCharacterProps {
  stats: AntyStats;
  size?: number;
}

export function AntyCharacter({ stats, size = 200 }: AntyCharacterProps) {
  const [expression, setExpression] = useState<Expression>('idle');

  // Update expression when stats change
  useEffect(() => {
    const newExpression = getExpressionByStats(stats);
    setExpression(newExpression);
  }, [stats]);

  const { leftEye, rightEye } = expressions[expression];

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className="anty-character"
    >
      {/* Static brackets (never change) */}
      <path
        d={staticBrackets.leftBracket}
        fill="#052333"
        className="bracket"
      />
      <path
        d={staticBrackets.rightBracket}
        fill="#052333"
        className="bracket"
      />

      {/* Morphing eyes */}
      <motion.path
        d={leftEye}
        fill="#052333"
        className="eye left-eye"
        transition={eyeMorphTransition}
      />
      <motion.path
        d={rightEye}
        fill="#052333"
        className="eye right-eye"
        transition={eyeMorphTransition}
      />
    </svg>
  );
}
```

### Advanced Animation Example

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import {
  expressions,
  staticBrackets,
  floatingAnimation,
  ghostlyRotation,
  eyeMorphTransition,
  blinkTiming,
  getRandomBlinkInterval,
} from '@/lib/anty';

export function AnimatedAnty({ stats, size = 200 }) {
  const [expression, setExpression] = useState<Expression>('idle');
  const [isBlinking, setIsBlinking] = useState(false);

  // Automatic blinking
  useEffect(() => {
    const scheduleNextBlink = () => {
      const interval = getRandomBlinkInterval();
      setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, blinkTiming.totalDuration);
      }, interval);
    };

    scheduleNextBlink();
  }, []);

  const currentExpression = isBlinking ? 'blink' : expression;
  const { leftEye, rightEye } = expressions[currentExpression];

  return (
    <motion.div
      animate={{
        y: [0, -floatingAnimation.amplitude, 0],
        rotate: [0, ghostlyRotation.angle, 0],
      }}
      transition={floatingAnimation.transition}
    >
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <path d={staticBrackets.leftBracket} fill="#052333" />
        <path d={staticBrackets.rightBracket} fill="#052333" />
        <motion.path
          d={leftEye}
          fill="#052333"
          transition={eyeMorphTransition}
        />
        <motion.path
          d={rightEye}
          fill="#052333"
          transition={eyeMorphTransition}
        />
      </svg>
    </motion.div>
  );
}
```

### Manual Expression Control

```tsx
import { expressions, staticBrackets } from '@/lib/anty';

// Force specific expression (for testing or special events)
function showExpression(expr: Expression) {
  const { leftEye, rightEye } = expressions[expr];

  return (
    <svg viewBox="0 0 40 40" width={200} height={200}>
      <path d={staticBrackets.leftBracket} fill="#052333" />
      <path d={staticBrackets.rightBracket} fill="#052333" />
      <path d={leftEye} fill="#052333" />
      <path d={rightEye} fill="#052333" />
    </svg>
  );
}

// Test all expressions
['logo', 'idle', 'happy', 'sad', 'wink', 'blink', ...].forEach(expr => {
  console.log(`Testing ${expr}:`, showExpression(expr));
});
```

## Expression Trigger Logic

### Automatic (Stat-Based)

The `getExpressionByStats()` function automatically selects expressions based on stat values:

```typescript
const stats = {
  energy: 25,
  happiness: 80,
  knowledge: 60,
  indexHealth: 90,
};

const expr = getExpressionByStats(stats);
// Returns: 'tired' (because energy < 30)
```

### Priority Order

1. `sick` - indexHealth < 20 (critical)
2. `sleepy` - energy < 15 (very low)
3. `angry` - happiness < 15 OR all stats < 40
4. `tired` - energy < 30
5. `sad` - happiness < 30
6. `excited` - energy > 80 AND happiness > 75
7. `happy` - happiness > 70
8. `confused` - conflicting stats
9. `idle` - default

### Event-Based Triggers

Some expressions should be triggered by events, not stats:

```typescript
// Achievement unlocked
function onAchievement() {
  setExpression('proud');
  setTimeout(() => {
    setExpression(getExpressionByStats(stats));
  }, 2000);
}

// Mini-game active
function onMiniGameStart() {
  setExpression('thinking');
}

// Tutorial/discovery
function onFeatureDiscovery() {
  setExpression('curious');
}

// Random wink (when happy)
function maybeWink() {
  if (stats.happiness > 60 && Math.random() < 0.1) {
    setExpression('wink');
    setTimeout(() => {
      setExpression('happy');
    }, 500);
  }
}
```

## Animation Best Practices

### Smooth Morphing

Use Framer Motion or similar library for smooth SVG path morphing:

```typescript
import { motion } from 'framer-motion';

<motion.path
  d={eyePath}
  transition={{
    type: 'spring',
    damping: 26,
    stiffness: 300,
    mass: 1.2,
  }}
/>
```

### Blink Cycle

Implement natural blinking:

```typescript
// Blink every 3-5 seconds
const blinkInterval = 3000 + Math.random() * 4000;

setInterval(() => {
  setExpression('blink');
  setTimeout(() => {
    setExpression(previousExpression);
  }, 300); // Blink duration
}, blinkInterval);
```

### Floating Animation

Add subtle floating motion:

```typescript
<motion.div
  animate={{ y: [0, -12, 0] }}
  transition={{
    duration: 3.7,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: [0.45, 0.05, 0.55, 0.95],
  }}
>
  {/* Anty SVG */}
</motion.div>
```

## File Structure Reference

```
/lib/anty/
├── expressions.ts              # Core expression system (THIS IS NEW)
├── stat-system.ts              # Stat definitions (existing)
├── animation-configs.ts        # Animation settings (existing)
├── time-decay.ts               # Stat decay logic (existing)
├── index.ts                    # Barrel exports (updated)
├── README.md                   # Architecture overview (NEW)
├── EXPRESSION_MAPPING.md       # Expression reference (NEW)
├── SVG_PATH_REFERENCE.md       # SVG technical docs (NEW)
└── INTEGRATION_GUIDE.md        # This file (NEW)
```

## Next Steps for Phase 2

### Agent 2: React Component Implementation

1. **Create AntyCharacter Component** (`/components/anty/AntyCharacter.tsx`)
   - Use expressions from this system
   - Implement SVG rendering with Framer Motion
   - Add floating and rotation animations
   - Integrate with stat system

2. **Add Blink Cycle** (`/components/anty/useBlinkCycle.tsx`)
   - Custom hook for automatic blinking
   - Random intervals (3-5 seconds)
   - Smooth blink transitions

3. **Expression Manager** (`/components/anty/useExpressionManager.tsx`)
   - Custom hook to manage expression state
   - Stat-based automatic updates
   - Event-based overrides (achievements, interactions)
   - Smooth transitions between expressions

4. **Testing Component** (`/app/anty/test/page.tsx`)
   - Grid of all 15 expressions
   - Interactive stat sliders
   - Expression preview
   - Animation testing

### Integration Checklist

- [ ] Import expressions into React component
- [ ] Set up Framer Motion for path morphing
- [ ] Implement stat-based expression updates
- [ ] Add automatic blink cycle
- [ ] Add floating animation
- [ ] Test all 15 expressions render correctly
- [ ] Test smooth morphing between expressions
- [ ] Test stat threshold triggers
- [ ] Add event-based expression overrides
- [ ] Performance optimization (GPU acceleration)

## Testing the Expression System

### Unit Tests (Recommended for Phase 3)

```typescript
import { getExpressionByStats, canMorphBetween } from '@/lib/anty/expressions';

describe('Expression System', () => {
  test('returns sick when indexHealth < 20', () => {
    expect(getExpressionByStats({
      energy: 50,
      happiness: 50,
      indexHealth: 15,
    })).toBe('sick');
  });

  test('returns sleepy when energy < 15', () => {
    expect(getExpressionByStats({
      energy: 10,
      happiness: 50,
      indexHealth: 50,
    })).toBe('sleepy');
  });

  test('returns idle by default', () => {
    expect(getExpressionByStats({
      energy: 50,
      happiness: 50,
      indexHealth: 50,
    })).toBe('idle');
  });

  test('all expressions can morph to each other', () => {
    expect(canMorphBetween('idle', 'happy')).toBe(true);
    expect(canMorphBetween('excited', 'sleepy')).toBe(true);
  });
});
```

### Visual Testing

Create a test page showing all expressions:

```tsx
import { expressions, staticBrackets } from '@/lib/anty';

export default function ExpressionTestPage() {
  return (
    <div className="grid grid-cols-5 gap-4 p-8">
      {Object.keys(expressions).map((expr) => {
        const { leftEye, rightEye } = expressions[expr as Expression];
        return (
          <div key={expr} className="text-center">
            <svg viewBox="0 0 40 40" width={120} height={120}>
              <path d={staticBrackets.leftBracket} fill="#052333" />
              <path d={staticBrackets.rightBracket} fill="#052333" />
              <path d={leftEye} fill="#052333" />
              <path d={rightEye} fill="#052333" />
            </svg>
            <p className="mt-2 font-semibold">{expr}</p>
          </div>
        );
      })}
    </div>
  );
}
```

## Performance Considerations

### Optimization Tips

1. **GPU Acceleration**: Use CSS `will-change` and `transform3d`
2. **Memoization**: Memoize expression calculations
3. **Lazy Updates**: Debounce stat changes to reduce re-renders
4. **Animation Frame**: Use `requestAnimationFrame` for smooth updates

```typescript
import { useMemo } from 'react';

const expression = useMemo(
  () => getExpressionByStats(stats),
  [stats.energy, stats.happiness, stats.indexHealth]
);
```

## Troubleshooting

### Expression Not Changing

- Check if stats are updating correctly
- Verify stat values are in 0-100 range
- Check expression priority order
- Ensure component re-renders on stat change

### Morphing Not Smooth

- Verify Framer Motion is installed
- Check transition configuration
- Ensure SVG paths are valid
- Use eyeMorphTransition from animation-configs

### Blink Cycle Issues

- Check timing intervals are reasonable
- Ensure blink expression is in expressions object
- Verify setTimeout is cleaned up properly
- Check if multiple intervals are conflicting

## Resources

### Documentation Files

- `README.md` - Architecture and usage
- `EXPRESSION_MAPPING.md` - Expression reference
- `SVG_PATH_REFERENCE.md` - Technical SVG details
- `INTEGRATION_GUIDE.md` - This file

### External References

- Framer Motion: https://www.framer.com/motion/
- SVG Path Morphing: https://css-tricks.com/svg-path-animations/
- React Spring: https://www.react-spring.dev/ (alternative to Framer Motion)

## Credits

**Phase 1 - Expression System**
- SVG Extraction: From `/public/af-logo.svg`
- Expression Design: Based on SearchAF Anty character
- Implementation: TypeScript strict mode
- Documentation: Comprehensive technical reference

**Ready for Phase 2**: React component implementation with full animation support.
