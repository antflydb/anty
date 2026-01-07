# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-06

### Added

- **AntyCharacter Component** - Main embeddable character component with ref-based API
- **Presets** - Quick setup with `hero`, `assistant`, `icon`, `logo` presets
- **18 Emotion Animations** - Full suite of expressive animations:
  - Positive emotions: happy, excited, celebrate, pleased, smize
  - Negative emotions: sad, angry, shocked
  - Actions: spin, jump, idea, wink, nod, headshake
  - Look animations: look-around, look-left, look-right, back-forth
- **Search Bar Morph** - Seamlessly morph character into a functional search bar with configurable dimensions
- **Chat Integration** - AntyChatPanel component with OpenAI integration and emotion mapping
- **Particle System** - Canvas-based particle effects including:
  - Sparkles with customizable colors
  - Confetti bursts for celebrations
  - Love heart particles
  - Feeding particle animations
- **Super Mode** - Power-up transformation with golden glow and 1.45x scale
- **Logo Mode** - Static display mode for branding use (no animations, full color eyes)
- **Power On/Off Transitions** - Animated state changes with wake-up and power-off effects
- **Idle Animation System** - Continuous floating, breathing, and occasional blink animations
- **Glow System** - Physics-based glow tracking that follows character movement
- **Shadow System** - Dynamic shadow that responds to character position
- **Keyboard Controls** - Hold `[` or `]` keys for look left/right
- **Configurable Sizing** - Scale from 24px to 320px+ with proper proportions
- **Debug Mode** - Visual overlays for animation debugging
- **TypeScript Support** - Full type definitions for all exports

### Technical Features

- Declarative emotion configuration system for easy customization
- GSAP-powered animation engine for smooth 60fps performance
- Animation controller with state machine and queue management
- Eye shape morphing with SVG path interpolation
- React 18/19 compatibility
- Tree-shakeable exports
- Unit tests for state machine (Vitest)
- Test consumer app for import verification
