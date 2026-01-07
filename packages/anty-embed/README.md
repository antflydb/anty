# @antflydb/anty-embed

Core animation package for Anty. Provides the `AntyCharacter` component with 18 emotions, particle effects, chat integration, and search bar morphing.

## Installation

This package is typically installed via git subtree as part of the main anty repo. See the [main repository](https://github.com/antflydb/anty) for installation instructions.

## Quick Start

```tsx
import { AntyCharacter, type AntyCharacterHandle } from '@anty';
import { useRef } from 'react';

function App() {
  const antyRef = useRef<AntyCharacterHandle>(null);

  return (
    <AntyCharacter
      ref={antyRef}
      size={160}
      expression="idle"
      showShadow={true}
    />
  );
}
```

## Dependencies

**Required peer dependencies:**
- `react` ^18.0.0 || ^19.0.0
- `react-dom` ^18.0.0 || ^19.0.0

**Optional peer dependency:**
- `openai` ^4.0.0 - Only needed if using `AntyChat` for chat integration

If you don't need chat functionality, you don't need to install openai. The package works fine without it. If you try to use `AntyChat` without openai installed, you'll get a clear error telling you to install it.

```bash
# For animations only (most users)
npm install @antflydb/anty-embed

# For animations + chat integration
npm install @antflydb/anty-embed openai
```

## Architecture

This package is built with maintainability and performance in mind:

- **Declarative emotion system** - Emotions are defined as data configs, not imperative code. An interpreter converts them to GSAP timelines at runtime. Easy to add new emotions without touching animation logic.

- **Priority-based state machine** - Clean state transitions with priority levels that determine which animations can interrupt others. Thoroughly tested with 41 unit tests.

- **GSAP-powered animations** - All animations use GSAP for smooth, performant motion. No other animation libraries.

- **Well-documented constants** - Animation timings are centralized with clear documentation. Values marked CRITICAL indicate coordinated timings that work together.

- **Dual format output** - Ships both ESM and CommonJS with source maps for debugging.

## Imperative Handle

Use a ref to control the character programmatically:

```tsx
const antyRef = useRef<AntyCharacterHandle>(null);

// Play an emotion
antyRef.current?.playEmotion('happy');

// Power off (eyes close, goes dark)
antyRef.current?.powerOff();

// Wake up (eyes open, returns to idle)
antyRef.current?.wakeUp();

// Search bar (requires searchEnabled prop)
antyRef.current?.morphToSearchBar();
antyRef.current?.morphToCharacter();  // Also triggered by ESC or click outside
```

## Bundle Size

~520KB raw / ~128KB gzipped (excluding peer dependencies)

The bundle includes GSAP and lucide-react. OpenAI is external and only loaded if you use chat features.

## Documentation

For full documentation, available emotions, props reference, and examples, see the [main repository](https://github.com/antflydb/anty).

## License

MIT
