/**
 * Feature Flags for Animation System Migration
 *
 * This module controls the rollout of the new AnimationController system.
 *
 * MIGRATION INSTRUCTIONS:
 * 1. Keep USE_NEW_ANIMATION_CONTROLLER = false during initial development
 * 2. Test new system in isolation using migration-helper.ts validation
 * 3. Set to true when ready to switch over
 * 4. Monitor logs for discrepancies between old and new systems
 * 5. Remove old system once new system is fully validated
 */

/**
 * Master feature flag for the new animation controller system.
 *
 * When false: Uses legacy AnimationStateMachine
 * When true: Uses new AnimationController
 *
 * ENABLED: Animation controller bugs have been fixed.
 */
export const USE_NEW_ANIMATION_CONTROLLER = true;

/**
 * Enable validation mode where both systems run in parallel
 * and results are compared for discrepancies.
 *
 * Only works in development mode.
 */
export const ENABLE_ANIMATION_VALIDATION = process.env.NODE_ENV === 'development';

/**
 * Enable verbose logging for animation system transitions.
 */
export const ENABLE_ANIMATION_DEBUG_LOGS = process.env.NODE_ENV === 'development';

/**
 * Log animation system startup information.
 */
export function logAnimationSystemInfo(): void {
  if (!ENABLE_ANIMATION_DEBUG_LOGS) return;

  const system = USE_NEW_ANIMATION_CONTROLLER ? 'NEW AnimationController' : 'LEGACY AnimationStateMachine';
  const validation = ENABLE_ANIMATION_VALIDATION ? 'ENABLED' : 'DISABLED';

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║ 🎬 Animation System Status                                    ║
╠═══════════════════════════════════════════════════════════════╣
║ Active System: ${system.padEnd(43)} ║
║ Validation:    ${validation.padEnd(43)} ║
║ Debug Logs:    ${ENABLE_ANIMATION_DEBUG_LOGS ? 'ENABLED'.padEnd(43) : 'DISABLED'.padEnd(43)} ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

/**
 * Check if the new animation controller should be used.
 */
export function shouldUseNewAnimationController(): boolean {
  return USE_NEW_ANIMATION_CONTROLLER;
}

/**
 * Check if animation validation should run.
 */
export function shouldValidateAnimations(): boolean {
  return ENABLE_ANIMATION_VALIDATION && !USE_NEW_ANIMATION_CONTROLLER;
}

/**
 * Log an animation system event (respects debug flag).
 */
export function logAnimationEvent(event: string, details?: Record<string, unknown>): void {
  if (!ENABLE_ANIMATION_DEBUG_LOGS) return;

  const system = USE_NEW_ANIMATION_CONTROLLER ? '[NEW]' : '[LEGACY]';
  const detailsStr = details ? ` ${JSON.stringify(details)}` : '';

  console.log(`🎬 ${system} ${event}${detailsStr}`);
}

/**
 * Log a validation discrepancy between old and new systems.
 */
export function logValidationDiscrepancy(
  property: string,
  oldValue: unknown,
  newValue: unknown,
  context?: Record<string, unknown>
): void {
  console.warn(`
⚠️  Animation Validation Discrepancy
Property: ${property}
Old Value: ${JSON.stringify(oldValue)}
New Value: ${JSON.stringify(newValue)}
${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}
  `);
}

/**
 * Log successful validation between old and new systems.
 */
export function logValidationSuccess(message: string): void {
  if (!ENABLE_ANIMATION_DEBUG_LOGS) return;
  console.log(`✅ Validation: ${message}`);
}

/**
 * Type guard for feature flag state.
 */
export type AnimationSystemType = 'legacy' | 'new';

/**
 * Get the current animation system type.
 */
export function getAnimationSystemType(): AnimationSystemType {
  return USE_NEW_ANIMATION_CONTROLLER ? 'new' : 'legacy';
}
