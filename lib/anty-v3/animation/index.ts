/**
 * Animation System Infrastructure
 *
 * Core animation controller with FSM pattern for Anty V3.
 * Prevents animation conflicts, manages state transitions, and ensures idle always restarts.
 */

export { AnimationController } from './controller';
export { ElementRegistry } from './element-registry';
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
