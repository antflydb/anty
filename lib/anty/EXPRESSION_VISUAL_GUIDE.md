# Anty Expression Visual Guide

This guide provides a visual ASCII representation of each expression to help developers understand what each expression should look like.

## Character Structure

```
┌─────────────────────┐
│                     │
│   [  ◡   ◡  ]      │  ← Two brackets with two eyes
│                     │
└─────────────────────┘

Components:
- Left bracket: [  (L-shape, bottom-left)
- Right bracket: ]  (L-shape, top-right)
- Left eye: ◡ (triangular, morphs)
- Right eye: ◡ (triangular, morphs)
```

## Base Expressions

### 1. Logo / Idle
```
    ┌────────┐
    │        │
[   ◡    ◡   ]
    │        │
    └────────┘

Status: Neutral, balanced
Eyes: Centered, triangular pointing inward
Use: Default brand state, calm waiting
```

### 2. Happy
```
    ┌────────┐
    │        │
[   ◠    ◠   ]
    │        │
    └────────┘

Status: Positive, content
Eyes: Shifted up, slightly wider
Use: High happiness (>70%)
Trigger: happiness > 70
```

### 3. Sad
```
    ┌────────┐
    │        │
[   ◡    ◡   ]
    │      ╲ │
    └────────┘

Status: Low stats, neglected
Eyes: Shifted down, droopy
Use: Low happiness (<30%)
Trigger: happiness < 30
```

### 4. Excited
```
    ┌────────┐
    │  ★     │
[   ◠    ◠   ]
    │        │ ★
    └────────┘

Status: High energy, thrilled
Eyes: Very wide, shifted up
Use: Just fed/played, high stats
Trigger: energy > 80 AND happiness > 75
Special: Consider adding sparkle particles
```

### 5. Wink
```
    ┌────────┐
    │        │
[   ◡    —   ]
    │        │
    └────────┘

Status: Playful interaction
Eyes: Left open, right closed
Use: Random when happy, during play
Trigger: Random when happiness > 60
Duration: 500ms
```

### 6. Blink
```
    ┌────────┐
    │        │
[   —    —   ]
    │        │
    └────────┘

Status: Natural animation
Eyes: Both closed (horizontal lines)
Use: Periodic idle animation
Cycle: Every 3-5 seconds
Duration: 300ms
```

## Derived Expressions

### 7. Tired
```
    ┌────────┐
    │        │
[   ◡    ◡   ]
    │    ╲ ╱ │
    └────────┘

Status: Low energy
Eyes: Half-closed, droopy
Use: Energy depleted
Trigger: energy < 30
Note: More droopy than sad
```

### 8. Sleepy
```
    ┌────────┐
    │     Z  │
[   _    _   ]
    │        │
    └────────┘

Status: Very low energy
Eyes: Nearly closed, minimal height
Use: Critical energy, bedtime
Trigger: energy < 15
Special: Consider adding "Z" particles
```

### 9. Thinking
```
    ┌────────┐
    │     ?  │
[   ◡    ◠   ]
    │        │
    └────────┘

Status: Processing, considering
Eyes: Asymmetric (one up, one normal)
Use: Mini-games, stat inspection
Event: Manual trigger during gameplay
```

### 10. Confused
```
    ┌────────┐
    │   ???  │
[   ◠    ◡   ]
    │╱      ╲│
    └────────┘

Status: Unclear state, conflicting
Eyes: Misaligned, different positions
Use: Mixed stats (one high, one low)
Trigger: Conflicting stat values
Example: energy=80, happiness=20
```

### 11. Sick
```
    ┌────────┐
    │  @  @  │
[   ◑    ◐   ]
    │╲      ╱│
    └────────┘

Status: Critical health
Eyes: Dizzy, swirly, unfocused
Use: Health critical
Trigger: indexHealth < 20
Special: Consider adding sweat drops
Priority: Highest (overrides other expressions)
```

### 12. Proud
```
    ┌────────┐
    │   ⭐   │
[   ◠    ◠   ]
    │        │
    └────────┘

Status: Achievement unlocked
Eyes: Confident, slightly narrowed, upward
Use: Level up, achievements
Event: Manual trigger on achievement
Duration: 2000ms celebration
```

### 13. Angry
```
    ┌────────┐
    │ ╲    ╱ │
[   ◣    ◢   ]
    │        │
    └────────┘

Status: Neglected too long
Eyes: Sharp, angular, inward-pointing
Use: Very low happiness or all stats low
Trigger: happiness < 15 OR all stats < 40
Note: Add angry "brow" effect
```

### 14. Curious
```
    ┌────────┐
    │   ?!   │
[   ◉    ◉   ]
    │        │
    └────────┘

Status: Exploring, learning
Eyes: Wide, attentive, slightly offset
Use: Tutorial, feature discovery
Event: Manual trigger during onboarding
Note: Eyes looking toward point of interest
```

## Expression Animation Flow

### State Transitions

```
IDLE STATE CYCLE:
idle → blink (300ms) → idle → wait 3-5s → repeat

HAPPY INTERACTION:
idle → happy → wink (500ms) → happy → idle

FEEDING SEQUENCE:
(any) → excited (2s) → happy → idle

NEGLECT PROGRESSION:
idle → sad → tired → angry

RECOVERY SEQUENCE:
angry → confused → sad → idle → happy

ACHIEVEMENT CELEBRATION:
(current) → proud (2s) → happy → idle

CRITICAL HEALTH:
(any) → sick (remains until health recovers)

SLEEPY TRANSITION:
tired → sleepy (remains until energy restored)
```

### Animation Timing Reference

```
INSTANT (0ms):           sick, angry (emergencies)
VERY QUICK (100-150ms):  blink
QUICK (200-300ms):       wink, close→open transitions
NORMAL (400-500ms):      happy, sad, tired, idle
SLOW (600-800ms):        excited, proud (celebrations)
VERY SLOW (1000ms+):     confused, thinking (complex states)
```

## Eye Shape Details

### Triangular (Normal)
```
  ◡
 ╱ ╲
```
Points inward, curved edges

### Wide (Happy/Excited)
```
   ◠
  ╱ ╲
```
Wider base, higher arch

### Droopy (Sad/Tired)
```
  ◡
 ╱ ╲
```
Lower position, less height

### Closed (Blink)
```
  —
```
Horizontal line, minimal height

### Half-Closed (Sleepy)
```
  _
```
Very compressed, nearly flat

### Angular (Angry)
```
  ◣
 ╱
```
Sharp angles, aggressive tilt

### Asymmetric (Thinking/Confused)
```
Left: ◡    Right: ◠
```
Different heights/positions

## Color and Effects

### Base Color
- Fill: `#052333` (SearchAF dark blue)
- Consistent across all expressions

### Particle Effects (Future Enhancement)

**Excited:**
```
    ★  ┌────────┐  ★
       │        │
  ★  [ ◠    ◠  ]   ★
       │        │
       └────────┘
```
Sparkles, stars floating around

**Sleepy:**
```
       ┌────────┐  Z
       │        │    z
     [ _    _  ]      z
       │        │
       └────────┘
```
Z's floating upward

**Sick:**
```
    💧 ┌────────┐
       │        │
     [ ◑    ◐  ]
       │        │
       └────────┘
```
Sweat drops, swirly eyes

**Angry:**
```
     ╲ ┌────────┐ ╱
       │        │
     [ ◣    ◢  ]
       │        │
       └────────┘
```
Angry "eyebrows" above brackets

## Accessibility Considerations

### ARIA Labels

```typescript
const expressionLabels: Record<Expression, string> = {
  logo: "SearchAF Anty logo",
  idle: "Anty is calm and waiting",
  happy: "Anty is happy",
  sad: "Anty is sad and needs attention",
  excited: "Anty is very excited",
  wink: "Anty is playfully winking",
  blink: "Anty is blinking",
  tired: "Anty is tired and needs rest",
  sleepy: "Anty is very sleepy",
  thinking: "Anty is thinking",
  confused: "Anty is confused",
  sick: "Anty is sick and needs care",
  proud: "Anty is proud of an achievement",
  angry: "Anty is upset from neglect",
  curious: "Anty is curious and exploring",
};

<svg aria-label={expressionLabels[expression]}>
  {/* ... */}
</svg>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .anty-character {
    animation: none;
    transition: none;
  }

  .anty-eye {
    transition: opacity 0.3s ease; /* Keep expression changes, remove morphing */
  }
}
```

## Testing Checklist

### Visual Testing

- [ ] All 15 expressions render correctly
- [ ] Static brackets remain unchanged
- [ ] Eyes morph smoothly between expressions
- [ ] No visual glitches during transitions
- [ ] Colors are consistent (#052333)

### Animation Testing

- [ ] Blink cycle feels natural (3-5s intervals)
- [ ] Expression changes are smooth (no jarring jumps)
- [ ] Floating animation is subtle and pleasant
- [ ] Rotation syncs with floating motion
- [ ] Particle effects (if added) don't obscure character

### Interaction Testing

- [ ] Stat changes trigger correct expressions
- [ ] Event-based expressions override stat-based
- [ ] Expressions revert after timed events
- [ ] Multiple rapid stat changes don't cause issues
- [ ] Edge cases (all stats 0, all stats 100) work

### Accessibility Testing

- [ ] ARIA labels are accurate
- [ ] Keyboard navigation works
- [ ] Reduced motion preference respected
- [ ] Screen readers announce expression changes
- [ ] Sufficient color contrast (if colors added)

## Implementation Example

```tsx
// Complete visual test grid
export function ExpressionGrid() {
  const expressions: Expression[] = [
    'logo', 'idle', 'happy', 'sad', 'excited',
    'wink', 'blink', 'tired', 'sleepy', 'thinking',
    'confused', 'sick', 'proud', 'angry', 'curious'
  ];

  return (
    <div className="grid grid-cols-5 gap-4 p-8 bg-gray-100">
      {expressions.map((expr) => {
        const { leftEye, rightEye } = expressions[expr];
        return (
          <div
            key={expr}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow"
          >
            <svg
              viewBox="0 0 40 40"
              className="w-24 h-24"
              aria-label={expressionLabels[expr]}
            >
              <path d={staticBrackets.leftBracket} fill="#052333" />
              <path d={staticBrackets.rightBracket} fill="#052333" />
              <path d={leftEye} fill="#052333" />
              <path d={rightEye} fill="#052333" />
            </svg>
            <p className="mt-2 text-sm font-semibold text-gray-700">
              {expr}
            </p>
            <p className="text-xs text-gray-500">
              {expressions[expr].description?.split('.')[0]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

## Quick Reference ASCII Chart

```
┌──────────┬────────────────────────────┐
│Expression│  Visual                    │
├──────────┼────────────────────────────┤
│ logo     │  [  ◡  ◡  ]  Centered     │
│ idle     │  [  ◡  ◡  ]  Neutral      │
│ happy    │  [  ◠  ◠  ]  Eyes up      │
│ sad      │  [  ◡  ◡  ]  Eyes down    │
│ excited  │  [  ◠  ◠  ]  Very wide    │
│ wink     │  [  ◡  —  ]  One closed   │
│ blink    │  [  —  —  ]  Both closed  │
│ tired    │  [  ◡  ◡  ]  Half-closed  │
│ sleepy   │  [  _  _  ]  Nearly flat  │
│ thinking │  [  ◡  ◠  ]  Asymmetric   │
│ confused │  [  ◠  ◡  ]  Misaligned   │
│ sick     │  [  ◑  ◐  ]  Dizzy        │
│ proud    │  [  ◠  ◠  ]  Confident    │
│ angry    │  [  ◣  ◢  ]  Sharp        │
│ curious  │  [  ◉  ◉  ]  Wide, offset │
└──────────┴────────────────────────────┘
```

## Notes

- All ASCII representations are approximate
- Actual SVG paths provide smooth, curved shapes
- Use this guide for quick mental reference
- See SVG_PATH_REFERENCE.md for exact coordinates
- See EXPRESSION_MAPPING.md for trigger logic
