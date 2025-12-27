/**
 * Animation System Infrastructure
 *
 * Core animation controller with FSM pattern for Anty V3.
 * Prevents animation conflicts, manages state transitions, and ensures idle always restarts.
 *
 * REFACTORED: Removed ElementRegistry and DebugTracker - they were overengineered.
 * The controller now directly manages timelines without element locking.
 */

export { AnimationController } from './controller';
export { StateMachine } from './state-machine';

export * from './types';

// React Hook
export { useAnimationController } from './use-animation-controller';
export type { AnimationElements, UseAnimationControllerOptions, UseAnimationControllerReturn } from './use-animation-controller';

// Feature Flags
export * from './feature-flags';

// Development Tools (only import in dev)
export { exposeDevTools, registerAnimationController, useDevTools } from './dev-tools';
export type { AntyAnimationDevTools } from './dev-tools';

// Initialization
export { initializeCharacter, resetEyesToIdle, type CharacterElements, type InitializeOptions } from './initialize';
