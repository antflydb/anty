# Changelog

## 1.2.0 (2026-01-13)

### New Features

- **Search-only mode** - New `searchOnly` prop renders just the search bar without the character, perfect for standalone search implementations
- **Search bar debug page** - New `/search` route with visual customization panel for testing search bar configurations
- **SearchBarConfig options** - New config options for visual customization:
  - `showBrackets` - Toggle corner bracket visibility
  - `showGlow` - Toggle glow effect behind search bar
  - `borderStyle` - Choose between `'gradient'` (animated) or `'solid'` (gray) border
- **Chat auto-fresh** - Chat panel auto-opens to new conversation after 5 min idle or fresh page load
- **Editable dimension inputs** - Click dimension values in debug panel to manually enter exact pixel values

### Bug Fixes

- **Placeholder hides when typing** - Fixed placeholder text remaining visible when user types in search bar (searchOnly mode)
- **Glow stays centered on resize** - Fixed glow offset issue when search bar dimensions change (uses margin-based centering)
- **Animation stability** - Memoized searchBarRefs to prevent GSAP animations from resetting on every keystroke

## 1.1.0 (2026-01-07)

### New Features

- **"default" preset** - Added `preset="default"` for standard 160px display with shadow and glow
- **ESC key closes search** - Press Escape to close the search bar when active
- **Click outside closes search** - Click anywhere outside the component to close search bar (ignores buttons/inputs)
- **Inline SVG assets** - Body SVGs are now embedded as data URLs - no need to copy assets to `public/anty/`

### Bug Fixes

- **powerOff/wakeUp now work** - Fixed issue where `powerOff()` and `wakeUp()` methods didn't trigger animations
- **Search input clears on close** - Text no longer persists when reopening the search bar

### Breaking Changes

- **OpenAI is now an optional peer dependency** - If you use `AntyChat`, install openai separately: `npm install openai`

### Bundle Size

- Reduced from ~785KB to ~520KB (raw), ~178KB to ~128KB (gzipped)
- OpenAI SDK no longer bundled (saves ~650KB when not using chat)
- Removed framer-motion dependency

## 1.0.0

Initial release with:
- 18 emotions (happy, sad, excited, celebrate, etc.)
- Declarative animation system with GSAP
- Priority-based state machine
- Search bar morph animation
- Particle effects (confetti, sparkles, hearts)
- Chat integration with OpenAI
- Presets (hero, assistant, icon, logo)
