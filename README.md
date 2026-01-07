# Anty

Embeddable animation system with 18 emotions, chat integration, particle effects, and search bar morphing.

## Features

- **Presets** - Quick setup with `hero`, `assistant`, `icon`, `logo` presets
- **18 Expressive Emotions** - Happy, sad, angry, excited, celebrate, pleased, shocked, spin, wink, idea, jump, nod, headshake, look-around, look-left, look-right, back-forth, and smize
- **Chat Integration with OpenAI** - Built-in chat panel with emotion mapping for AI-driven responses
- **Particle Effects** - Sparkles, confetti, love hearts, and feeding particles
- **Search Bar Morph** - Seamlessly morph from character into a fully functional search bar
- **Super Mode** - Power-up transformation with golden glow effects
- **Logo Mode** - Static logo state for branding use (no animations, full color eyes)
- **Customizable Size** - Scales from tiny icons to large displays (24px to 320px+)
- **Shadow and Glow Effects** - Configurable ambient lighting effects
- **Power On/Off Transitions** - Animated state changes
- **Idle Animations** - Continuous floating, breathing, and occasional blink animations
- **Keyboard Look Controls** - Hold `[` or `]` keys to make Anty look left or right

## Installation

**1. Add as a git subtree:**

```bash
# Add anty to your project (one-time setup)
git subtree add --prefix=packages/anty https://github.com/antflydb/anty.git main --squash

# Pull updates later
git subtree pull --prefix=packages/anty https://github.com/antflydb/anty.git main --squash
```

**2. Add path alias to your `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@anty": ["./packages/anty/packages/anty-embed/src/index.ts"]
    }
  }
}
```

**3. Import and use:**

```tsx
import { AntyCharacter } from '@anty';
```

## Basic Usage

```tsx
import { useRef } from 'react';
import { AntyCharacter, type AntyCharacterHandle } from '@anty';

function App() {
  const antyRef = useRef<AntyCharacterHandle>(null);

  const handleClick = () => {
    antyRef.current?.playEmotion('happy');
  };

  return (
    <div>
      <AntyCharacter
        ref={antyRef}
        size={160}
        expression="idle"
        showShadow={true}
        showGlow={true}
      />
      <button onClick={handleClick}>Make Happy</button>
    </div>
  );
}
```

## Presets

Use presets for quick setup with sensible defaults:

```tsx
<AntyCharacter preset="hero" />        // Large (240px), with shadow & glow - for landing pages
<AntyCharacter preset="assistant" />   // Small (80px), with shadow - for chat corners
<AntyCharacter preset="icon" />        // Tiny (32px), no effects - for navbars
<AntyCharacter preset="logo" />        // Static logo mode - for branding
```

Presets can be overridden with explicit props:

```tsx
<AntyCharacter preset="assistant" size={100} />  // Uses assistant preset but with size=100
```

| Preset | Size | Shadow | Glow | Notes |
|--------|------|--------|------|-------|
| `hero` | 240 | ✓ | ✓ | Large centered display |
| `assistant` | 80 | ✓ | - | Small chat assistant |
| `icon` | 32 | - | - | Tiny, still animated |
| `logo` | - | - | - | Static, logoMode enabled |

## Available Emotions

| Emotion | Description |
|---------|-------------|
| `happy` | Wiggle rotation with happy eyes |
| `excited` | Jump with spin, no confetti |
| `celebrate` | Epic celebration with confetti burst |
| `pleased` | Gentle bounce with happy eyes |
| `smize` | Eye-only smile (smile with eyes) |
| `sad` | Drooping motion with teardrop |
| `angry` | Drop and shake animation |
| `shocked` | Jump with bracket separation and wide eyes |
| `spin` | Y-axis 360 spin with jump |
| `jump` | Classic Mario-style jump |
| `idea` | Aha moment with lightbulb emoji |
| `wink` | Asymmetric eye wink with tilt |
| `nod` | Vertical head bob (yes) |
| `headshake` | Y-axis rotation shake (no) |
| `look-around` | Look left then right (eye-only) |
| `look-left` | Eye-only look left |
| `look-right` | Eye-only look right |
| `back-forth` | Look left then right with considering eyes |

## Props

### AntyCharacterProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `'hero' \| 'assistant' \| 'icon' \| 'logo'` | - | Preset configuration (see Presets section) |
| `expression` | `ExpressionName` | `'idle'` | Current expression/emotion to display |
| `size` | `number` | `160` | Character size in pixels |
| `showShadow` | `boolean` | `true` | Whether to show shadow |
| `showGlow` | `boolean` | `true` | Whether to show glow effects |
| `frozen` | `boolean` | `false` | Freeze all animations for static display |
| `logoMode` | `boolean` | `false` | Logo mode with full color eyes, no animations |
| `isSuperMode` | `boolean` | `false` | Whether super mode is active |
| `debugMode` | `boolean` | `false` | Whether to show debug overlays |
| `searchEnabled` | `boolean` | `false` | Enable integrated search bar |
| `searchPlaceholder` | `string` | `'Search...'` | Search bar placeholder text |
| `searchShortcut` | `string` | - | Keyboard shortcut indicator (e.g., "Cmd+K") |
| `searchConfig` | `SearchBarConfig` | - | Search bar configuration |
| `onEmotionComplete` | `(emotion: string) => void` | - | Callback when emotion animation completes |
| `onSearchOpen` | `() => void` | - | Callback when morph to search starts |
| `onSearchCloseComplete` | `() => void` | - | Callback when morph back to character completes |

### AntyCharacterHandle (Ref Methods)

| Method | Description |
|--------|-------------|
| `playEmotion(emotion)` | Play an emotion animation |
| `morphToSearchBar()` | Morph character into search bar |
| `morphToCharacter()` | Morph search bar back to character |
| `setSuperMode(scale)` | Enter/exit super mode |
| `powerOff()` | Power off the character |
| `wakeUp()` | Wake up the character |
| `pauseIdle()` | Pause idle animations |
| `resumeIdle()` | Resume idle animations |
| `killAll()` | Stop all animations |
| `spawnSparkle(x, y, color)` | Spawn a sparkle particle |
| `spawnLoveHearts()` | Spawn love heart particles |
| `spawnConfetti(x, y, count)` | Spawn confetti particles |

## Search Bar Mode

```tsx
<AntyCharacter
  searchEnabled={true}
  searchPlaceholder="Ask anything..."
  searchShortcut="Cmd+K"
  searchConfig={{
    width: 642,
    height: 70,
    borderRadius: 10,
    innerRadius: 8,
    bracketScale: 0.14,
    borderWidth: 2.75,
  }}
  onSearchOpen={() => console.log('Search opened')}
  onSearchCloseComplete={() => console.log('Search closed')}
/>

// Trigger programmatically
antyRef.current?.morphToSearchBar();
antyRef.current?.morphToCharacter();
```

## Super Mode

```tsx
// Enter super mode with 1.45x scale
antyRef.current?.playEmotion('super');
antyRef.current?.setSuperMode(1.45);

// Exit super mode
antyRef.current?.setSuperMode(null);
```

## Power On/Off

```tsx
// Power off
<AntyCharacter expression="off" />

// Power on (idle)
<AntyCharacter expression="idle" />
```

## Logo Mode

For static branding use without animations:

```tsx
<AntyCharacter logoMode={true} />
```

## Development

### Run the playground

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the main playground, or [http://localhost:3000/embed](http://localhost:3000/embed) for the embed demo.

### Run tests

```bash
cd packages/anty-embed && npm test
```

### Test consumer app

A minimal test app exists at `examples/test-consumer/` to verify imports work correctly:

```bash
cd examples/test-consumer
npm install
npm run dev
```

## Technologies

- **React** - UI component library
- **GSAP** - Animation engine for smooth, performant animations
- **Framer Motion** - Declarative animations and gestures
- **TypeScript** - Type-safe development
- **OpenAI** - Chat integration with emotion mapping
- **Vitest** - Unit testing

## License

MIT
