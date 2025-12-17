# Anty Tamagotchi Expression System

## Overview

This directory contains the expression system for Anty, the SearchAF tamagotchi character. Anty has 15 unique expressions that morph smoothly using SVG path animations.

## Architecture

### Character Structure

The Anty character consists of 4 SVG paths:

1. **Left Bracket** (static) - The left outer bracket shape
2. **Right Bracket** (static) - The right outer bracket shape
3. **Left Eye** (morphing) - The inner left triangular shape
4. **Right Eye** (morphing) - The inner right triangular shape

### Expression System

#### Base Expressions (from Figma)
- `logo` - Default SearchAF logo state
- `idle` - Neutral, calm waiting state
- `happy` - Positive, content expression
- `sad` - Low stats, neglected state
- `wink` - Playful interaction (right eye closed)
- `blink` - Natural animation cycle (both eyes closed)

#### Derived Expressions
- `excited` - High energy after feeding/playing
- `tired` - Low energy state
- `thinking` - Processing, considering
- `confused` - Conflicting stats, needs attention
- `sick` - Critical health (< 20%)
- `proud` - Achievement unlocked
- `sleepy` - Very low energy (< 15%)
- `angry` - Neglected for too long
- `curious` - Exploring, learning

## SVG Path Extraction

### Source
All SVG paths were extracted from `/public/af-logo.svg`:

**Static Brackets:**
- Left Bracket: Path 3 (bottom-left bracket)
- Right Bracket: Path 1 (top-right bracket)

**Morphing Eyes:**
- Left Eye: Path 4 (left triangular eye)
- Right Eye: Path 2 (right triangular eye)

### Path Structure
Each eye path uses the same basic structure to ensure smooth morphing:
- Start with `M` (move to) command
- Use `C` (cubic bezier) curves for smooth shapes
- End with `Z` to close the path
- All paths maintain the same number of points for seamless transitions

## Expression Trigger Logic

### Stat-Based Triggers

The `getExpressionByStats()` helper function determines expressions based on three stats:

1. **Energy** (0-100)
2. **Happiness** (0-100)
3. **Health** (0-100)

### Priority Order (Highest to Lowest)

1. **sick** - `health < 20`
2. **sleepy** - `energy < 15`
3. **angry** - `happiness < 15` OR all stats `< 40`
4. **tired** - `energy < 30`
5. **sad** - `happiness < 30`
6. **excited** - `energy > 80` AND `happiness > 75`
7. **happy** - `happiness > 70`
8. **confused** - Conflicting stats (one high, one low)
9. **idle** - Default state

### Event-Based Triggers

Some expressions are triggered by specific events rather than stats:

- **wink** - Random animation when `happiness > 60`
- **blink** - Periodic animation during idle
- **proud** - Achievement unlocked or level up
- **thinking** - During mini-games or stat inspection
- **curious** - During tutorials or feature discovery

## Usage Example

```typescript
import { expressions, staticBrackets, getExpressionByStats, type Expression } from '@/lib/anty/expressions';

// Get expression based on stats
const currentExpression = getExpressionByStats({
  energy: 45,
  happiness: 80,
  health: 90,
});
// Returns: 'happy'

// Access SVG paths
const expressionData = expressions[currentExpression];
console.log(expressionData.leftEye);  // SVG path string
console.log(expressionData.rightEye); // SVG path string

// Static brackets (never change)
console.log(staticBrackets.leftBracket);
console.log(staticBrackets.rightBracket);
```

## Animation Guidelines

### Morphing Between Expressions

All expressions use compatible path structures, allowing smooth morphing:

```typescript
import { canMorphBetween } from '@/lib/anty/expressions';

const canMorph = canMorphBetween('idle', 'happy'); // true
```

### Recommended Animation Settings

- **Duration**: 300-500ms for state changes
- **Easing**: `ease-in-out` for natural feel
- **Blink Duration**: 150-200ms (quick)
- **Idle Blink Interval**: 3-5 seconds (random)

### SVG Animation Libraries

Compatible with:
- Framer Motion (recommended for React)
- GSAP
- anime.js
- CSS transitions (for simple morphs)

## Path Modification Notes

### Base Expressions from Figma

The 6 base expressions (`logo`, `idle`, `happy`, `sad`, `wink`, `blink`) use the exact SVG paths extracted from the SearchAF logo:

- **logo** & **idle** - Use the original logo paths unchanged
- **happy** - Eyes shifted upward for cheerful look
- **sad** - Eyes shifted downward for melancholy look
- **wink** - Right eye compressed to horizontal line
- **blink** - Both eyes compressed to horizontal lines

### Derived Expressions

The 9 new expressions were created by modifying the base paths:

1. **Position Shifts** - Moving eyes up/down (happy/sad variants)
2. **Size Adjustments** - Making eyes larger/smaller (excited/tired)
3. **Rotation** - Tilting eyes (confused/curious)
4. **Asymmetry** - Different left/right eyes (wink/thinking)
5. **Compression** - Squashing eyes (blink/sleepy)

All modifications maintain path point count and structure for smooth morphing.

## Future Enhancements

### Potential Additions

1. **Compound Expressions** - Combining expressions (e.g., "happily tired")
2. **Custom Triggers** - User-defined expression rules
3. **Expression History** - Track mood changes over time
4. **Transition Maps** - Optimized morph paths between expressions
5. **Micro-Expressions** - Subtle variations within expressions

### Animation Features

1. **Particle Effects** - Stars for excited, sweat for tired
2. **Color Shifts** - Tint changes based on mood
3. **Bounce Physics** - Character movement during expressions
4. **Sound Effects** - Audio cues for expression changes

## Technical Details

### Type Safety

All expressions are strictly typed using TypeScript:

```typescript
type Expression = 'logo' | 'idle' | 'happy' | ... // 15 total

interface ExpressionData {
  leftEye: string;
  rightEye: string;
  description?: string;
  triggers?: {
    energy?: { min?: number; max?: number };
    happiness?: { min?: number; max?: number };
    health?: { min?: number; max?: number };
  };
}
```

### Performance Considerations

- SVG paths are stored as string constants (no runtime computation)
- Expression lookup is O(1) via record access
- `getExpressionByStats()` uses early returns for efficiency
- Path strings are optimized for minimal size

### Browser Compatibility

SVG path morphing is supported in:
- Chrome/Edge 95+
- Firefox 93+
- Safari 15+

For older browsers, consider fallback to cross-fade transitions.

## Credits

- **Design**: Figma node 574-144 (SearchAF logo with expressions)
- **Extraction**: SVG paths from `/public/af-logo.svg`
- **Implementation**: Expression system with 15 unique states
