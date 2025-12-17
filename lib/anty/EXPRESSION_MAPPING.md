# Anty Expression Mapping Reference

## Quick Reference Table

| Expression | Energy Range | Happiness Range | Health Range | Special Trigger |
|-----------|-------------|----------------|--------------|----------------|
| **sick** | any | any | 0-20 | Critical health |
| **sleepy** | 0-15 | any | any | Very low energy |
| **angry** | any | 0-15 | any | Neglected/all stats < 40 |
| **tired** | 0-30 | any | any | Low energy |
| **sad** | any | 0-30 | any | Low happiness |
| **excited** | 80-100 | 75-100 | any | High energy + happiness |
| **happy** | any | 70-100 | any | High happiness |
| **confused** | mixed | mixed | any | Conflicting stats |
| **idle** | 40-70 | 40-70 | 40-70 | Default state |
| **wink** | any | 60+ | any | Random when happy |
| **blink** | any | any | any | Periodic animation |
| **proud** | any | any | any | Achievement event |
| **thinking** | any | any | any | Mini-game active |
| **curious** | any | any | any | Tutorial/discovery |
| **logo** | any | any | any | Brand state |

## Expression Decision Tree

```
START
├─ health < 20? → SICK
├─ energy < 15? → SLEEPY
├─ happiness < 15? → ANGRY
├─ all stats < 40? → ANGRY
├─ energy < 30? → TIRED
├─ happiness < 30? → SAD
├─ energy > 80 AND happiness > 75? → EXCITED
├─ happiness > 70? → HAPPY
├─ conflicting stats? → CONFUSED
└─ default → IDLE
```

## Visual Expression Guide

### Emotional Spectrum

```
POSITIVE                     NEUTRAL                     NEGATIVE
  |                            |                            |
excited ─── happy ─── proud ── idle ── thinking ── sad ─── angry
              │                 │         │         │        │
            wink             curious   confused   tired    sick
              │                                     │
            blink                                sleepy
```

### Energy-Based Expressions

```
Energy: 100 ┃ EXCITED (if happiness also high)
         90 ┃
         80 ┃
         70 ┃ HAPPY (if happiness > 70)
         60 ┃
         50 ┃ IDLE (default range)
         40 ┃
         30 ┃ TIRED (threshold)
         20 ┃
         10 ┃ SLEEPY (very low)
          0 ┃
```

### Happiness-Based Expressions

```
Happiness: 100 ┃ EXCITED (if energy also high)
            90 ┃
            80 ┃
            70 ┃ HAPPY (threshold)
            60 ┃ WINK (random chance)
            50 ┃ IDLE (default range)
            40 ┃
            30 ┃ SAD (threshold)
            20 ┃
            10 ┃ ANGRY (very low)
             0 ┃
```

### Health-Based Expressions

```
Health: 100 ┃ (other stats determine expression)
         90 ┃
         80 ┃
         70 ┃
         60 ┃
         50 ┃
         40 ┃
         30 ┃
         20 ┃ SICK (critical threshold)
         10 ┃ SICK (critical)
          0 ┃ SICK (critical)
```

## Expression Characteristics

### Eye Position Patterns

```
HAPPY/EXCITED:    ◠   ◠    (eyes up, open wide)
IDLE/LOGO:        ◡   ◡    (centered, neutral)
SAD/TIRED:        ◡   ◡    (eyes down, droopy)
                 ◡   ◡

WINK:             ◡   —    (one eye closed)
BLINK:            —   —    (both eyes closed)

THINKING:         ◡   ◠    (asymmetric)
CONFUSED:         ◠   ◡    (misaligned)

SLEEPY:           _   _    (very droopy)
ANGRY:            ◣   ◢    (sharp, angled)
```

## SVG Path Pattern Analysis

### Base Eye Shapes

**Normal Eye (logo/idle):**
- Triangular pointing inward
- Balanced proportions
- Centered vertically

**Happy Eye Variations:**
- Shifted upward by ~1-2 units
- Slightly larger
- More open appearance

**Sad Eye Variations:**
- Shifted downward by ~1-2 units
- Slightly compressed
- Droopy appearance

**Closed Eyes (blink/wink/sleepy):**
- Compressed to horizontal line
- Minimal height
- Maintains horizontal position

### Path Coordinate Ranges

Based on the 40x40 viewBox:

- **X-axis**:
  - Left eye: ~11-18
  - Right eye: ~21-27
- **Y-axis**:
  - Normal: ~15-25
  - Happy: ~13-24 (shifted up)
  - Sad: ~16-26 (shifted down)
  - Sleepy: ~18-24 (compressed)
  - Closed: ~19-20 (minimal height)

## Expression Combination Matrix

### Compatible Expression Transitions

|  | logo | idle | happy | sad | wink | blink | excited | tired | thinking | confused | sick | proud | sleepy | angry | curious |
|---|------|------|-------|-----|------|-------|---------|-------|----------|----------|------|-------|--------|-------|---------|
| **logo** | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **idle** | ✓ | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **happy** | ✓ | ✓ | - | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Note**: All expressions can morph to all other expressions smoothly due to compatible path structures.

### Recommended Transition Paths

For the smoothest animations, follow these preferred paths:

1. **idle → blink → idle** (natural blinking cycle)
2. **idle → happy → excited** (progressive happiness)
3. **idle → sad → tired → sleepy** (progressive fatigue)
4. **idle → confused → thinking** (contemplative states)
5. **any → sick** (emergency state, direct transition)
6. **happy → wink → happy** (playful animation)
7. **happy/excited → proud** (achievement celebration)

### Avoid Jarring Transitions

While all transitions work, some may feel abrupt:

- **excited → sleepy** (extreme energy change)
- **angry → happy** (sudden mood shift)
- **sick → excited** (unrealistic recovery)

**Solution**: Add intermediate states:
- excited → happy → idle → tired → sleepy
- angry → confused → idle → happy
- sick → sad → idle → happy

## Event-Driven Expression Triggers

### User Interactions

```typescript
// Feeding
stats.energy += 20;
stats.happiness += 15;
→ Check: excited? happy? idle?

// Playing
stats.happiness += 25;
stats.energy -= 10;
→ Show: wink (during), happy (after)

// Cleaning
stats.health += 20;
stats.happiness += 10;
→ Show: proud (if health was low)

// Medicine
stats.health += 40;
→ Transition: sick → sad → idle

// Neglect
stats.all -= 5 (per hour);
→ Check: sad? tired? angry? sick?
```

### Automatic Cycles

```typescript
// Idle blinking (every 3-5 seconds)
idle → blink (150ms) → idle

// Random winks (if happiness > 60)
happy → wink (500ms) → happy

// Stat decay
every 30 minutes: recheck expression
```

### Achievement Celebrations

```typescript
// Level up
current → proud (2s) → happy → idle

// Streak milestone
current → excited (2s) → happy

// Perfect care
current → proud (2s) → excited (1s) → happy
```

## Implementation Examples

### React Component Usage

```typescript
import { useState, useEffect } from 'react';
import { expressions, getExpressionByStats } from '@/lib/anty/expressions';

function AntyCharacter({ stats }) {
  const [expression, setExpression] = useState<Expression>('idle');

  useEffect(() => {
    const newExpression = getExpressionByStats(stats);
    setExpression(newExpression);
  }, [stats]);

  const { leftEye, rightEye } = expressions[expression];

  return (
    <svg viewBox="0 0 40 40">
      {/* Static brackets */}
      <path d={staticBrackets.leftBracket} />
      <path d={staticBrackets.rightBracket} />

      {/* Morphing eyes */}
      <path d={leftEye} className="transition-all duration-300" />
      <path d={rightEye} className="transition-all duration-300" />
    </svg>
  );
}
```

### Animation Timing

```typescript
// Immediate expressions (no delay)
const IMMEDIATE = ['sick', 'angry', 'sleepy'];

// Quick transitions (200ms)
const QUICK = ['blink', 'wink'];

// Normal transitions (400ms)
const NORMAL = ['happy', 'sad', 'tired', 'idle'];

// Celebratory (slower, 600ms)
const CELEBRATORY = ['excited', 'proud'];

function getTransitionDuration(expression: Expression): number {
  if (IMMEDIATE.includes(expression)) return 100;
  if (QUICK.includes(expression)) return 200;
  if (CELEBRATORY.includes(expression)) return 600;
  return 400;
}
```

## Testing Checklist

### Expression Validation

- [ ] All 15 expressions defined
- [ ] All SVG paths valid
- [ ] Left and right eyes present for each
- [ ] Path structures compatible for morphing
- [ ] TypeScript types correct

### Trigger Logic

- [ ] Critical states (sick, sleepy, angry) have highest priority
- [ ] Stat thresholds work correctly
- [ ] Default to idle when no conditions met
- [ ] Event-based triggers override stats when needed
- [ ] Conflicting stats detected properly

### Animation Quality

- [ ] Smooth morphing between all expressions
- [ ] No visual glitches during transitions
- [ ] Blink cycle feels natural
- [ ] Expression changes respond to stat updates
- [ ] Celebration animations feel rewarding

### Edge Cases

- [ ] All stats at 0
- [ ] All stats at 100
- [ ] Rapid stat changes
- [ ] Multiple triggers at once
- [ ] Expression changes during animations
