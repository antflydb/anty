/**
 * Feature Flags for Animation System
 *
 * This module controls debug logging and other animation features.
 */
/**
 * Enable verbose logging for animation system transitions.
 */
export declare const ENABLE_ANIMATION_DEBUG_LOGS: boolean;
/**
 * Log animation system startup information.
 */
export declare function logAnimationSystemInfo(): void;
/**
 * Log an animation system event (respects debug flag).
 */
export declare function logAnimationEvent(event: string, details?: Record<string, unknown>): void;
