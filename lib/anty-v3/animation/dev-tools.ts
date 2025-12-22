/**
 * Development Tools for Animation System
 *
 * Utilities to help with development and debugging.
 * Expose these to window in development for easy console access.
 *
 * Usage:
 * ```typescript
 * // In your root component or _app.tsx
 * import { exposeDevTools } from '@/lib/anty-v3/animation/dev-tools';
 *
 * if (process.env.NODE_ENV === 'development') {
 *   exposeDevTools();
 * }
 * ```
 *
 * Then in browser console:
 * ```javascript
 * // Check which system is active
 * antyAnimations.getSystemInfo()
 *
 * // Run test suite
 * antyAnimations.runTests()
 *
 * // Test specific emotion
 * antyAnimations.testEmotion('happy')
 *
 * // Monitor state changes
 * const stop = antyAnimations.monitorState()
 * // ... later
 * stop()
 * ```
 */

import type { UseAnimationControllerReturn } from './use-animation-controller';
import type { LegacyEyeAnimations } from './migration-helper';
import {
  USE_NEW_ANIMATION_CONTROLLER,
  ENABLE_ANIMATION_VALIDATION,
  ENABLE_ANIMATION_DEBUG_LOGS,
  logAnimationSystemInfo,
  getAnimationSystemType,
} from './feature-flags';
import { getMigrationStatus } from './migration-helper';
import {
  runAllTests,
  testAllEmotions,
  testMappingRoundTrip,
  showAllMappings,
  printDebugInfo,
  monitorStateChanges,
  validateStateConsistency,
  TEST_EXPRESSIONS,
  TEST_EMOTIONS,
} from './test-utils';

// ===========================
// Global Interface
// ===========================

/**
 * Development tools interface exposed to window
 */
export interface AntyAnimationDevTools {
  // System Info
  getSystemInfo: () => SystemInfo;
  logSystemInfo: () => void;

  // Testing
  runTests: () => Promise<void>;
  testEmotion: (emotion: string) => void;
  testAllEmotions: () => Promise<void>;
  testMapping: () => void;
  showMappings: () => void;

  // Debugging
  getDebugInfo: () => unknown;
  validateState: () => void;
  monitorState: () => () => void;

  // Lists
  listExpressions: () => void;
  listEmotions: () => void;

  // Direct access
  controller: UseAnimationControllerReturn | null;
  legacy: LegacyEyeAnimations | null;

  // Version
  version: string;
}

interface SystemInfo {
  activeSystem: 'legacy' | 'new';
  featureFlags: {
    USE_NEW_ANIMATION_CONTROLLER: boolean;
    ENABLE_ANIMATION_VALIDATION: boolean;
    ENABLE_ANIMATION_DEBUG_LOGS: boolean;
  };
  controllerReady: boolean;
  migrationStatus: ReturnType<typeof getMigrationStatus>;
}

// ===========================
// Dev Tools Factory
// ===========================

let controllerInstance: UseAnimationControllerReturn | null = null;
let legacyInstance: LegacyEyeAnimations | null = null;

/**
 * Register the animation controller for dev tools access
 */
export function registerAnimationController(
  controller: UseAnimationControllerReturn
): void {
  controllerInstance = controller;
  if (typeof window !== 'undefined') {
    console.log('✅ Animation controller registered with dev tools');
  }
}

/**
 * Register the legacy animation system for dev tools access
 */
export function registerLegacyAnimations(
  legacy: LegacyEyeAnimations
): void {
  legacyInstance = legacy;
  if (typeof window !== 'undefined') {
    console.log('✅ Legacy animations registered with dev tools');
  }
}

/**
 * Create dev tools instance
 */
function createDevTools(): AntyAnimationDevTools {
  return {
    // System Info
    getSystemInfo: (): SystemInfo => {
      return {
        activeSystem: getAnimationSystemType(),
        featureFlags: {
          USE_NEW_ANIMATION_CONTROLLER,
          ENABLE_ANIMATION_VALIDATION,
          ENABLE_ANIMATION_DEBUG_LOGS,
        },
        controllerReady: controllerInstance?.isReady ?? false,
        migrationStatus: getMigrationStatus(controllerInstance),
      };
    },

    logSystemInfo: (): void => {
      logAnimationSystemInfo();
    },

    // Testing
    runTests: async (): Promise<void> => {
      if (!controllerInstance && !legacyInstance) {
        console.error('❌ No animation systems registered');
        return;
      }
      await runAllTests(legacyInstance, controllerInstance);
    },

    testEmotion: (emotion: string): void => {
      if (!controllerInstance) {
        console.error('❌ Controller not registered');
        return;
      }

      if (!controllerInstance.isReady) {
        console.error('❌ Controller not ready');
        return;
      }

      const success = controllerInstance.playEmotion(
        emotion as any,
        { priority: 5 }
      );

      if (success) {
        console.log(`✅ Played emotion: ${emotion}`);
      } else {
        console.error(`❌ Failed to play emotion: ${emotion}`);
      }
    },

    testAllEmotions: async (): Promise<void> => {
      if (!controllerInstance) {
        console.error('❌ Controller not registered');
        return;
      }
      await testAllEmotions(controllerInstance, 1000);
    },

    testMapping: (): void => {
      testMappingRoundTrip();
    },

    showMappings: (): void => {
      showAllMappings();
    },

    // Debugging
    getDebugInfo: (): unknown => {
      if (!controllerInstance) {
        return { error: 'Controller not registered' };
      }

      if (!controllerInstance.isReady) {
        return { error: 'Controller not ready' };
      }

      return controllerInstance.getDebugInfo();
    },

    validateState: (): void => {
      if (!controllerInstance) {
        console.error('❌ Controller not registered');
        return;
      }
      validateStateConsistency(controllerInstance);
    },

    monitorState: (): (() => void) => {
      if (!controllerInstance) {
        console.error('❌ Controller not registered');
        return () => {};
      }
      return monitorStateChanges(controllerInstance);
    },

    // Lists
    listExpressions: (): void => {
      console.group('📋 Available Expressions');
      TEST_EXPRESSIONS.forEach((expr, i) => {
        console.log(`${i + 1}. ${expr}`);
      });
      console.groupEnd();
    },

    listEmotions: (): void => {
      console.group('📋 Available Emotions');
      TEST_EMOTIONS.forEach((emotion, i) => {
        console.log(`${i + 1}. ${emotion}`);
      });
      console.groupEnd();
    },

    // Direct access
    controller: controllerInstance,
    legacy: legacyInstance,

    version: '1.0.0',
  };
}

// ===========================
// Window Exposure
// ===========================

/**
 * Expose dev tools to window (development only)
 */
export function exposeDevTools(): void {
  if (typeof window === 'undefined') {
    console.warn('⚠️  Cannot expose dev tools: window is undefined');
    return;
  }

  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️  Dev tools only available in development mode');
    return;
  }

  // Extend window interface
  (window as any).antyAnimations = createDevTools();

  // Log helpful message
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║ 🛠️  Anty Animation Dev Tools Loaded                          ║
╠═══════════════════════════════════════════════════════════════╣
║ Access via: window.antyAnimations                             ║
║                                                               ║
║ Quick Start:                                                  ║
║   antyAnimations.getSystemInfo()  - Show current system       ║
║   antyAnimations.runTests()       - Run all tests             ║
║   antyAnimations.testEmotion('happy')  - Test emotion         ║
║   antyAnimations.listEmotions()   - List all emotions         ║
║   antyAnimations.monitorState()   - Monitor state changes     ║
║                                                               ║
║ For full API, type: antyAnimations                            ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  // Show current system info
  logAnimationSystemInfo();
}

// ===========================
// React Hook Integration
// ===========================

/**
 * React hook to automatically register controllers with dev tools
 */
export function useDevTools(
  controller: UseAnimationControllerReturn | null,
  legacy: LegacyEyeAnimations | null = null
): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  // Register on mount/update
  if (controller) {
    registerAnimationController(controller);
  }

  if (legacy) {
    registerLegacyAnimations(legacy);
  }
}

// ===========================
// Type Augmentation for Window
// ===========================

declare global {
  interface Window {
    antyAnimations?: AntyAnimationDevTools;
  }
}
