# Anty Embed Refactor Plan: Package-First Architecture

## The Problem

We currently have **two separate Anty implementations**:

1. **Main App Anty** (`components/anty/anty-character.tsx`) - 946 lines, full animation system, battle-tested
2. **Embed Anty** (`packages/anty-embed/src/components/internal/AntyCharacterEmbed.tsx`) - simplified rewrite, different behavior

This is fundamentally broken:
- Bug fixes need to be applied twice
- Behavior will never match exactly (different animation code)
- Maintenance burden doubles
- We've already hit issues (GSAP callback hacks, shadow positioning, eye behavior differences)

## The Solution: Package-First Architecture

**The real AntyCharacter lives in the package. The main app imports from the package.**

```
packages/anty-embed/
  └── src/
      └── AntyCharacter.tsx  ← THE source of truth

app/page.tsx
  └── import { AntyCharacter } from '@searchaf/anty-embed'
```

One codebase. Fix once, works everywhere.

---

## Current Architecture Analysis

### What AntyCharacter Depends On

**External Packages (keep as-is):**
- `react` 19.1.0
- `gsap` 3.14.2
- `@gsap/react` 2.1.2

**Internal Dependencies (must move to package):**
```
components/anty/
├── anty-character.tsx          # Main component (946 lines)
├── anty-expression-layer.tsx   # Expression SVG crossfades
├── anty-particle-canvas.tsx    # Canvas particle system

lib/animation/
├── controller.ts               # Animation state machine (useAnimationController)
├── types.ts                    # EmotionType, ExpressionName, etc.
├── feature-flags.ts            # Debug logging
├── definitions/
│   ├── eye-shapes.ts           # getEyeShape, getEyeDimensions
│   ├── eye-animations.ts       # createLookAnimation, etc.
│   ├── emotion-configs.ts      # Emotion animation definitions
│   └── idle-configs.ts         # Idle animation definitions

lib/particles/
├── index.ts                    # Particle system
├── types.ts                    # Particle type definitions
└── configs.ts                  # PARTICLE_CONFIGS

types/
├── ui-types.ts                 # ButtonName
└── stat-system.ts              # AntyStats
```

### The Ref Problem

Current AntyCharacter expects refs from parent:
```tsx
// Parent creates these and passes them down
shadowRef: React.RefObject<HTMLDivElement>
innerGlowRef: React.RefObject<HTMLDivElement>
outerGlowRef: React.RefObject<HTMLDivElement>
```

The parent (page.tsx) renders these elements separately and the animation controller animates them.

**For package to be self-contained:** Shadow and glows must be INSIDE the component.

### The Tailwind Problem

AntyCharacter uses Tailwind classes:
```
relative, w-full, h-full, absolute, inset-[],
left-1/2, top-1/2, -translate-x-1/2, -translate-y-1/2,
flex, items-center, justify-center, etc.
```

**For package distribution:** Must convert to inline styles or CSS-in-JS.

---

## Refactoring Strategy

### Phase 1: Prepare the Package Structure

Create the package directory structure to receive the real code:

```
packages/anty-embed/src/
├── index.ts                    # Public exports
├── components/
│   ├── AntyCharacter.tsx       # THE main component
│   ├── AntyExpressionLayer.tsx
│   ├── AntyParticleCanvas.tsx
│   ├── AntyWidget.tsx          # High-level wrapper (corner widget)
│   ├── AntyHero.tsx            # High-level wrapper (landing page)
│   └── AntySearchOverlay.tsx   # High-level wrapper (cmd+k)
├── hooks/
│   ├── useAnimationController.ts
│   └── useWidgetShortcuts.ts
├── lib/
│   ├── animation/
│   │   ├── types.ts
│   │   ├── feature-flags.ts
│   │   └── definitions/
│   │       ├── eye-shapes.ts
│   │       ├── eye-animations.ts
│   │       ├── emotion-configs.ts
│   │       └── idle-configs.ts
│   └── particles/
│       ├── index.ts
│       ├── types.ts
│       └── configs.ts
└── types/
    └── index.ts
```

### Phase 2: Move Animation System to Package

Move these files with minimal changes:
1. `lib/animation/` → `packages/anty-embed/src/lib/animation/`
2. `lib/particles/` → `packages/anty-embed/src/lib/particles/`
3. Update import paths

**Key files:**
- `controller.ts` (useAnimationController) - the brain
- `emotion-configs.ts` - all emotion animation definitions
- `idle-configs.ts` - idle animation definitions
- `eye-shapes.ts` / `eye-animations.ts` - eye utilities

### Phase 3: Move AntyCharacter to Package

1. Copy `anty-character.tsx` → `packages/anty-embed/src/components/AntyCharacter.tsx`
2. Copy `anty-expression-layer.tsx` → `packages/anty-embed/src/components/AntyExpressionLayer.tsx`
3. Copy `anty-particle-canvas.tsx` → `packages/anty-embed/src/components/AntyParticleCanvas.tsx`

**Critical modifications:**

#### 3a. Make shadow/glow self-contained

Before (parent provides refs):
```tsx
interface AntyCharacterProps {
  shadowRef?: React.RefObject<HTMLDivElement | null>;
  innerGlowRef?: React.RefObject<HTMLDivElement | null>;
  outerGlowRef?: React.RefObject<HTMLDivElement | null>;
}
```

After (component creates internally):
```tsx
interface AntyCharacterProps {
  showShadow?: boolean;   // default: true
  showGlow?: boolean;     // default: true
}

// Inside component:
const shadowRef = useRef<HTMLDivElement>(null);
const innerGlowRef = useRef<HTMLDivElement>(null);
const outerGlowRef = useRef<HTMLDivElement>(null);

// Render shadow/glow inside component
return (
  <div className="anty-container" style={{ width: size, height: size * 1.5 }}>
    {showGlow && <div ref={innerGlowRef} style={...} />}
    {showGlow && <div ref={outerGlowRef} style={...} />}
    <div ref={characterRef} style={{ position: 'absolute', top: 0 }}>
      {/* character body, eyes, etc. */}
    </div>
    {showShadow && <div ref={shadowRef} style={{ position: 'absolute', bottom: 0 }} />}
  </div>
);
```

#### 3b. Convert Tailwind to inline styles

Create a style utilities file:
```tsx
// packages/anty-embed/src/lib/styles.ts
export const styles = {
  absolute: { position: 'absolute' as const },
  relative: { position: 'relative' as const },
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  // etc.
};

// Helper for inset
export const inset = (top: string, right: string, bottom: string, left: string) => ({
  position: 'absolute' as const,
  top, right, bottom, left,
});
```

#### 3c. Container architecture

Match working Anty proportions:
- Container: `height = size * 1.5` (e.g., 240px for 160px character)
- Character: positioned at `top: 0`
- Shadow: positioned at `bottom: 0`

### Phase 4: Update Main App to Import from Package

1. Update `app/page.tsx` imports:
```tsx
// Before
import { AntyCharacter } from '@/components/anty/anty-character';

// After
import { AntyCharacter } from '@searchaf/anty-embed';
```

2. Remove external ref management:
```tsx
// Before - parent creates refs
const shadowRef = useRef<HTMLDivElement>(null);
const innerGlowRef = useRef<HTMLDivElement>(null);

// After - component is self-contained
<AntyCharacter
  size={160}
  expression={expression}
  stats={stats}
  showShadow={true}
  showGlow={true}
/>
```

3. Adapt animation sequences that reference shadow/glow:
   - Search morph animation needs review
   - Super mode animation needs review
   - May need to expose animation controller methods

### Phase 5: Delete Duplicate Code

1. Delete old main app files:
   - `components/anty/anty-character.tsx`
   - `components/anty/anty-expression-layer.tsx`
   - `components/anty/anty-particle-canvas.tsx`
   - `lib/animation/` (moved to package)
   - `lib/particles/` (moved to package)

2. Delete embed duplicates:
   - `packages/anty-embed/src/components/internal/AntyCharacterEmbed.tsx`
   - Other simplified/duplicate code

### Phase 6: Verify Behavior

1. Test all emotions work identically
2. Test idle animations
3. Test particle effects (confetti, sparkles, hearts)
4. Test search morph (if applicable to embed)
5. Test in main app AND embed demo

---

## Risk Assessment

### High Risk Areas

1. **Search Morph Animation** - Complex sequence that animates body parts + glows + shadow. May need to expose animation controller methods or refactor the morph sequence.

2. **Parent Animation Sequences** - Feed animation, super mode, etc. are orchestrated by parent. Need to decide: move to component or keep in parent?

3. **Breaking Changes** - Main app depends on current ref-based API. Migration needs careful testing.

### Mitigation

1. **Feature flag** - Add `FEATURE_USE_PACKAGE_ANTY` flag to main app for gradual rollout
2. **Parallel testing** - Keep old code until new code is verified
3. **Snapshot tests** - Record animation sequences before/after

---

## API Design for Package

### Public Exports

```tsx
// Main character component
export { AntyCharacter, type AntyCharacterProps, type AntyCharacterHandle } from './components/AntyCharacter';

// High-level wrappers
export { AntyWidget } from './components/AntyWidget';
export { AntyHero } from './components/AntyHero';
export { AntySearchOverlay } from './components/AntySearchOverlay';

// Hooks
export { useAnimationController } from './hooks/useAnimationController';
export { useWidgetShortcuts } from './hooks/useWidgetShortcuts';

// Types
export type { EmotionType, ExpressionName, AntyStats, Particle } from './types';
```

### AntyCharacter Props (Simplified)

```tsx
interface AntyCharacterProps {
  // Core
  size?: number;              // default: 160
  expression?: ExpressionName;
  stats?: AntyStats;

  // Visual toggles
  showShadow?: boolean;       // default: true
  showGlow?: boolean;         // default: true
  showParticles?: boolean;    // default: true

  // Modes
  isSuperMode?: boolean;
  searchMode?: boolean;
  debugMode?: boolean;

  // Callbacks
  onEmotionComplete?: (emotion: string) => void;
  onSpontaneousExpression?: (expression: ExpressionName) => void;
  onAnimationSequenceChange?: (sequence: string) => void;
}
```

### AntyCharacter Handle (Exposed Methods)

```tsx
interface AntyCharacterHandle {
  // Emotions
  playEmotion: (emotion: EmotionType) => boolean;
  killAll: () => void;

  // Idle
  pauseIdle: () => void;
  resumeIdle: () => void;

  // Particles
  spawnConfetti: () => void;
  spawnSparkles: () => void;
  spawnHearts: () => void;

  // Eyes
  startLook: (direction: 'left' | 'right') => void;
  endLook: () => void;

  // Glows
  showGlows: (fadeIn?: boolean) => void;
  hideGlows: () => void;

  // Search (if needed)
  showSearchGlow?: () => void;
  hideSearchGlow?: () => void;
}
```

---

## Implementation Order

1. **Create package structure** (directories, tsconfig, package.json)
2. **Move animation system** (controller, definitions, types)
3. **Move particle system**
4. **Move AntyCharacter** (with modifications)
5. **Convert Tailwind to inline styles**
6. **Make shadow/glow self-contained**
7. **Update main app imports**
8. **Remove parent ref management**
9. **Test thoroughly**
10. **Delete old code**

---

## Questions to Resolve

1. **Search morph** - Does the embed need search morph? If not, can simplify.
2. **Stats system** - Is AntyStats needed in embed, or just for main app?
3. **Super mode** - Does embed need super mode?
4. **Parent-driven animations** - Which animations should be exposed via handle vs. internal?

---

## Success Criteria

- [ ] Single AntyCharacter implementation
- [ ] Main app imports from package
- [ ] Embed demo works identically to main app
- [ ] All animations work (emotions, idle, particles)
- [ ] No Tailwind in package (pure CSS/inline styles)
- [ ] Package is tree-shakeable
- [ ] Bundle size reasonable (<150KB gzipped)
