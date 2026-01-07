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

## Documentation

For full documentation, available emotions, props reference, and examples, see the [main repository](https://github.com/antflydb/anty).

## License

MIT
