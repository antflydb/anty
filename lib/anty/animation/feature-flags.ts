/**
 * Feature Flags for Animation System
 *
 * This module controls debug logging and other animation features.
 */

/**
 * Enable verbose logging for animation system transitions.
 */
export const ENABLE_ANIMATION_DEBUG_LOGS = process.env.NODE_ENV === 'development';

/**
 * Log animation system startup information.
 */
export function logAnimationSystemInfo(): void {
  if (!ENABLE_ANIMATION_DEBUG_LOGS) return;

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║ 🎬 Animation System Status                                    ║
╠═══════════════════════════════════════════════════════════════╣
║ Active System: AnimationController                            ║
║ Debug Logs:    ${ENABLE_ANIMATION_DEBUG_LOGS ? 'ENABLED'.padEnd(43) : 'DISABLED'.padEnd(43)} ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

/**
 * Log an animation system event (respects debug flag).
 */
export function logAnimationEvent(event: string, details?: Record<string, unknown>): void {
  if (!ENABLE_ANIMATION_DEBUG_LOGS) return;

  const detailsStr = details ? ` ${JSON.stringify(details)}` : '';
  console.log(`🎬 [AnimationController] ${event}${detailsStr}`);
}
