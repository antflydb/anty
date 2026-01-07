# Changelog

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
