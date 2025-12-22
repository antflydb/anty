/**
 * Migration Helper for Animation System Transition
 *
 * This module provides wrapper functions that can call either the old
 * eye animation system or the new AnimationController, enabling gradual
 * migration and validation that both systems produce equivalent results.
 *
 * USAGE:
 * 1. Import wrapper functions instead of direct animation calls
 * 2. Enable validation mode to run both systems in parallel
 * 3. Check console for discrepancies
 * 4. Once validated, flip feature flag to use new system
 * 5. Remove old system after full migration
 */

import type { RefObject } from 'react';
import type { ExpressionName } from '@/lib/anty-v3/animation-state';
import type { EmotionType, AnimationOptions, AnimationState } from './types';
import type { UseAnimationControllerReturn } from './use-animation-controller';
import {
  shouldUseNewAnimationController,
  shouldValidateAnimations,
  logAnimationEvent,
  logValidationDiscrepancy,
  logValidationSuccess,
} from './feature-flags';

// ===========================
// Type Definitions
// ===========================

/**
 * Legacy eye animation system interface
 * (based on use-eye-animations.ts)
 */
export interface LegacyEyeAnimations {
  /** Trigger a single blink */
  triggerBlink: () => void;
  /** Trigger a double blink */
  triggerDoubleBlink: () => void;
  /** Reset eye animations to default state */
  resetEyeAnimations: () => void;
}

/**
 * Combined animation system interface
 */
export interface MigrationAnimationSystem {
  /** Play an emotion/expression */
  playExpression: (expression: ExpressionName, options?: AnimationOptions) => boolean;
  /** Trigger a blink animation */
  triggerBlink: () => void;
  /** Trigger a double blink animation */
  triggerDoubleBlink: () => void;
  /** Reset animations to idle */
  resetAnimations: () => void;
  /** Start idle animation */
  startIdle: () => void;
  /** Pause animations */
  pause: () => void;
  /** Resume animations */
  resume: () => void;
  /** Get current state/expression */
  getCurrentExpression: () => ExpressionName | EmotionType | null;
}

// ===========================
// Expression Mapping
// ===========================

/**
 * Map old ExpressionName to new EmotionType
 * Note: Not all expressions have direct emotion equivalents
 */
export function mapExpressionToEmotion(expression: ExpressionName): EmotionType | null {
  const mapping: Partial<Record<ExpressionName, EmotionType>> = {
    'idle': 'neutral',
    'happy': 'happy',
    'excited': 'excited',
    'shocked': 'surprised',
    'wink': 'playful',
    'angry': 'angry',
    'sad': 'sad',
    'idea': 'curious',
    // Note: Some expressions don't map cleanly:
    // - 'spin', 'lookaround', 'look-left', 'look-right', 'nod', 'headshake', 'off'
  };

  return mapping[expression] ?? null;
}

/**
 * Map new EmotionType to old ExpressionName
 */
export function mapEmotionToExpression(emotion: EmotionType): ExpressionName {
  const mapping: Record<EmotionType, ExpressionName> = {
    'neutral': 'idle',
    'happy': 'happy',
    'excited': 'excited',
    'surprised': 'shocked',
    'playful': 'wink',
    'angry': 'angry',
    'sad': 'sad',
    'curious': 'idea',
    'thinking': 'lookaround',
    'confident': 'happy',
  };

  return mapping[emotion];
}

// ===========================
// Validation Helpers
// ===========================

/**
 * Compare results from old and new animation systems
 */
function validateAnimationResult(
  operation: string,
  oldResult: unknown,
  newResult: unknown,
  context?: Record<string, unknown>
): void {
  if (!shouldValidateAnimations()) return;

  // For boolean results, check if they match
  if (typeof oldResult === 'boolean' && typeof newResult === 'boolean') {
    if (oldResult !== newResult) {
      logValidationDiscrepancy(
        `${operation} return value`,
        oldResult,
        newResult,
        context
      );
    } else {
      logValidationSuccess(`${operation} returned consistent values`);
    }
  }

  // For expression/emotion, map and compare
  if (typeof oldResult === 'string' && typeof newResult === 'string') {
    const oldAsExpression = oldResult as ExpressionName;
    const newAsEmotion = newResult as EmotionType;
    const mappedOld = mapExpressionToEmotion(oldAsExpression);

    if (mappedOld !== newAsEmotion) {
      logValidationDiscrepancy(
        `${operation} state value`,
        oldResult,
        newResult,
        { ...context, mappedOld }
      );
    } else {
      logValidationSuccess(`${operation} state values are equivalent`);
    }
  }
}

// ===========================
// Wrapper Functions
// ===========================

/**
 * Create a migration wrapper that delegates to old or new system
 */
export function createMigrationWrapper(
  legacySystem: LegacyEyeAnimations | null,
  newSystem: UseAnimationControllerReturn | null
): MigrationAnimationSystem {
  const useNew = shouldUseNewAnimationController();
  const validate = shouldValidateAnimations();

  return {
    /**
     * Play an expression/emotion
     */
    playExpression: (expression: ExpressionName, options?: AnimationOptions): boolean => {
      logAnimationEvent('playExpression', { expression, options });

      if (useNew) {
        // Use new system
        if (!newSystem) {
          console.error('[Migration] New system not available');
          return false;
        }

        const emotion = mapExpressionToEmotion(expression);
        if (!emotion) {
          console.warn(`[Migration] Expression "${expression}" has no emotion mapping`);
          return false;
        }

        return newSystem.playEmotion(emotion, options);
      } else {
        // Use legacy system
        logAnimationEvent('Using legacy system for expression', { expression });

        // Legacy system doesn't have direct playExpression,
        // so we'd need to trigger the appropriate animation
        // This is a placeholder - actual implementation depends on legacy API
        console.warn('[Migration] Legacy system does not support playExpression directly');

        // If validating, also run new system and compare
        if (validate && newSystem) {
          const emotion = mapExpressionToEmotion(expression);
          if (emotion) {
            const newResult = newSystem.playEmotion(emotion, options);
            validateAnimationResult('playExpression', false, newResult, { expression, emotion });
          }
        }

        return false;
      }
    },

    /**
     * Trigger a blink animation
     */
    triggerBlink: (): void => {
      logAnimationEvent('triggerBlink');

      if (useNew) {
        // New system doesn't have direct blink API yet
        // This would need to be added to AnimationController
        console.warn('[Migration] New system does not support triggerBlink yet');
      } else {
        if (legacySystem) {
          legacySystem.triggerBlink();

          // If validating, note that new system doesn't support this
          if (validate) {
            console.warn('[Migration] Validation: New system does not support blink yet');
          }
        }
      }
    },

    /**
     * Trigger a double blink animation
     */
    triggerDoubleBlink: (): void => {
      logAnimationEvent('triggerDoubleBlink');

      if (useNew) {
        // New system doesn't have direct double blink API yet
        console.warn('[Migration] New system does not support triggerDoubleBlink yet');
      } else {
        if (legacySystem) {
          legacySystem.triggerDoubleBlink();

          // If validating, note that new system doesn't support this
          if (validate) {
            console.warn('[Migration] Validation: New system does not support double blink yet');
          }
        }
      }
    },

    /**
     * Reset animations to idle
     */
    resetAnimations: (): void => {
      logAnimationEvent('resetAnimations');

      if (useNew) {
        if (newSystem) {
          newSystem.killAll();
          newSystem.startIdle();
        }
      } else {
        if (legacySystem) {
          legacySystem.resetEyeAnimations();

          // If validating, also run new system
          if (validate && newSystem) {
            newSystem.killAll();
            newSystem.startIdle();
            logValidationSuccess('resetAnimations executed on both systems');
          }
        }
      }
    },

    /**
     * Start idle animation
     */
    startIdle: (): void => {
      logAnimationEvent('startIdle');

      if (useNew) {
        if (newSystem) {
          newSystem.startIdle();
        }
      } else {
        // Legacy system doesn't have explicit startIdle
        // It's handled automatically
        logAnimationEvent('Legacy system handles idle automatically');

        if (validate && newSystem) {
          newSystem.startIdle();
          logValidationSuccess('startIdle executed on new system for validation');
        }
      }
    },

    /**
     * Pause animations
     */
    pause: (): void => {
      logAnimationEvent('pause');

      if (useNew) {
        if (newSystem) {
          newSystem.pause();
        }
      } else {
        // Legacy system doesn't have pause API
        console.warn('[Migration] Legacy system does not support pause');

        if (validate && newSystem) {
          newSystem.pause();
        }
      }
    },

    /**
     * Resume animations
     */
    resume: (): void => {
      logAnimationEvent('resume');

      if (useNew) {
        if (newSystem) {
          newSystem.resume();
        }
      } else {
        // Legacy system doesn't have resume API
        console.warn('[Migration] Legacy system does not support resume');

        if (validate && newSystem) {
          newSystem.resume();
        }
      }
    },

    /**
     * Get current expression/emotion
     */
    getCurrentExpression: (): ExpressionName | EmotionType | null => {
      if (useNew) {
        if (newSystem) {
          return newSystem.getEmotion();
        }
        return null;
      } else {
        // Legacy system doesn't track current expression
        // This would need to be added or tracked externally
        console.warn('[Migration] Legacy system does not track current expression');

        if (validate && newSystem) {
          const newResult = newSystem.getEmotion();
          console.log('[Migration] Validation: New system current emotion:', newResult);
        }

        return null;
      }
    },
  };
}

// ===========================
// Migration Utilities
// ===========================

/**
 * Validate that both systems are producing similar visual results
 * This is a development-time helper
 */
export function validateBothSystems(
  testExpression: ExpressionName,
  legacySystem: LegacyEyeAnimations | null,
  newSystem: UseAnimationControllerReturn | null
): void {
  if (!shouldValidateAnimations()) {
    console.warn('[Migration] Validation is disabled - enable ENABLE_ANIMATION_VALIDATION');
    return;
  }

  console.log(`[Migration] Validating both systems with expression: ${testExpression}`);

  // Map expression to emotion
  const emotion = mapExpressionToEmotion(testExpression);

  if (!emotion) {
    console.warn(`[Migration] Cannot validate - no emotion mapping for: ${testExpression}`);
    return;
  }

  // Test new system
  if (newSystem) {
    console.log('[Migration] Testing new system...');
    const newResult = newSystem.playEmotion(emotion);
    console.log('[Migration] New system result:', newResult);
  } else {
    console.error('[Migration] New system not available');
  }

  // Note: Legacy system testing would go here
  // but it doesn't have a clean API for expression playback
  if (legacySystem) {
    console.log('[Migration] Legacy system available but no direct test API');
  }
}

/**
 * Get migration status report
 */
export function getMigrationStatus(
  newSystem: UseAnimationControllerReturn | null
): {
  usingNewSystem: boolean;
  validationEnabled: boolean;
  newSystemReady: boolean;
  debugInfo: unknown;
} {
  return {
    usingNewSystem: shouldUseNewAnimationController(),
    validationEnabled: shouldValidateAnimations(),
    newSystemReady: newSystem?.isReady ?? false,
    debugInfo: newSystem?.isReady ? newSystem.getDebugInfo() : null,
  };
}
