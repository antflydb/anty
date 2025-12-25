/**
 * Testing Utilities for Animation System Migration
 *
 * Provides helpers for testing and validating the animation system migration.
 * Use these in development to verify both systems work correctly.
 */

import type { EmotionType } from './types';
import type { UseAnimationControllerReturn } from './use-animation-controller';

// ===========================
// Test Suites
// ===========================

/**
 * All testable emotions (EmotionType values)
 */
export const TEST_EXPRESSIONS: Array<EmotionType | 'idle' | 'off'> = [
  'idle',
  'happy',
  'excited',
  'shocked',
  'wink',
  'angry',
  'sad',
  'jump',
  'lookaround',
];

/**
 * Emotions that can be directly tested
 */
export const MAPPED_EXPRESSIONS: Array<EmotionType | 'idle'> = [
  'idle',
  'happy',
  'excited',
  'shocked',
  'wink',
  'angry',
  'sad',
  'jump',
];

/**
 * All emotions (from actual EmotionType definition)
 */
export const TEST_EMOTIONS: EmotionType[] = [
  'happy',
  'sad',
  'angry',
  'surprised',
  'shocked',
  'confused',
  'thinking',
  'excited',
  'tired',
  'searching',
  'found',
  'error',
  'success',
  'loading',
  'celebrate',
  'spin',
];

// ===========================
// Mapping Validation
// ===========================

/**
 * @deprecated Mapping tests removed - EmotionType now used throughout
 */
export function testMappingRoundTrip(): void {
  console.warn('testMappingRoundTrip is deprecated - EmotionType now used throughout');
}

/**
 * @deprecated Mapping tests removed - EmotionType now used throughout
 */
export function showAllMappings(): void {
  console.warn('showAllMappings is deprecated - EmotionType now used throughout');
}

// ===========================
// New System Testing
// ===========================

/**
 * Test all emotions on the new animation system
 */
export async function testAllEmotions(
  controller: UseAnimationControllerReturn,
  delayMs: number = 1000
): Promise<void> {
  console.group('🎬 Testing All Emotions on New System');

  if (!controller.isReady) {
    console.error('❌ Controller not ready');
    console.groupEnd();
    return;
  }

  for (const emotion of TEST_EMOTIONS) {
    console.log(`Testing ${emotion}...`);

    const success = controller.playEmotion(emotion, { priority: 5 });

    if (success) {
      console.log(`✅ ${emotion} played successfully`);
    } else {
      console.warn(`❌ ${emotion} failed to play`);
    }

    // Wait before next emotion
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  console.log('\n✅ All emotion tests complete');
  console.groupEnd();
}

/**
 * Test state transitions
 */
export async function testStateTransitions(
  controller: UseAnimationControllerReturn
): Promise<void> {
  console.group('🔄 Testing State Transitions');

  if (!controller.isReady) {
    console.error('❌ Controller not ready');
    console.groupEnd();
    return;
  }

  const tests = [
    { from: 'IDLE', to: 'EMOTION', action: () => controller.playEmotion('happy') },
    { from: 'EMOTION', to: 'IDLE', action: () => controller.startIdle() },
    { from: 'IDLE', to: 'OFF', action: () => controller.killAll() },
  ];

  for (const test of tests) {
    console.log(`Testing ${test.from} → ${test.to}...`);

    const stateBefore = controller.getState();
    test.action();
    await new Promise(resolve => setTimeout(resolve, 100));
    const stateAfter = controller.getState();

    console.log(`  Before: ${stateBefore}`);
    console.log(`  After:  ${stateAfter}`);
    console.log('');
  }

  console.groupEnd();
}

// ===========================
// Legacy System Testing
// ===========================

/**
 * @deprecated Legacy system removed
 */
export async function testLegacyBlinks(): Promise<void> {
  console.warn('testLegacyBlinks is deprecated - legacy system removed');
}

// ===========================
// Comparison Testing
// ===========================

/**
 * @deprecated Legacy comparison removed
 */
export async function comparePerformance(): Promise<void> {
  console.warn('comparePerformance is deprecated - legacy system removed');
}

/**
 * Validate state consistency between systems
 */
export function validateStateConsistency(
  newSystem: UseAnimationControllerReturn
): void {
  console.group('🔍 Validating State Consistency');

  const state = newSystem.getState();
  const emotion = newSystem.getEmotion();
  const isIdle = newSystem.isIdle();
  const debugInfo = newSystem.getDebugInfo();

  console.log('Current State:', state);
  console.log('Current Emotion:', emotion);
  console.log('Is Idle:', isIdle);
  console.log('Debug Info:', debugInfo);

  // Validate consistency
  const issues: string[] = [];

  if (state === 'IDLE' && emotion !== null) {
    issues.push('State is IDLE but emotion is not null');
  }

  if (state === 'EMOTION' && emotion === null) {
    issues.push('State is EMOTION but emotion is null');
  }

  if (isIdle && state !== 'IDLE') {
    issues.push('isIdle() returns true but state is not IDLE');
  }

  if (issues.length === 0) {
    console.log('✅ State is consistent');
  } else {
    console.warn('⚠️  State inconsistencies found:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
  }

  console.groupEnd();
}

// ===========================
// Batch Testing
// ===========================

/**
 * Run all tests
 */
export async function runAllTests(
  _legacy: null,
  newSystem: UseAnimationControllerReturn | null
): Promise<void> {
  console.log('🚀 Running Full Test Suite\n');

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // New system tests
  if (newSystem && newSystem.isReady) {
    await testAllEmotions(newSystem, 800);
    await testStateTransitions(newSystem);
    validateStateConsistency(newSystem);
  } else {
    console.warn('⚠️  Skipping new system tests (not ready)');
  }

  console.log('\n✅ All tests complete!');
}

// ===========================
// Debug Helpers
// ===========================

/**
 * Print detailed debug information
 */
export function printDebugInfo(controller: UseAnimationControllerReturn): void {
  if (!controller.isReady) {
    console.warn('Controller not ready');
    return;
  }

  const info = controller.getDebugInfo();

  console.group('🐛 Animation Controller Debug Info');
  console.log('Debug Info:', info);
  console.groupEnd();
}

/**
 * Monitor state changes
 */
export function monitorStateChanges(controller: UseAnimationControllerReturn): () => void {
  let previousState = controller.getState();
  let previousEmotion = controller.getEmotion();

  const interval = setInterval(() => {
    const currentState = controller.getState();
    const currentEmotion = controller.getEmotion();

    if (currentState !== previousState || currentEmotion !== previousEmotion) {
      console.log(
        `🔄 State Change: ${previousState} → ${currentState}, ` +
        `Emotion: ${previousEmotion} → ${currentEmotion}`
      );

      previousState = currentState;
      previousEmotion = currentEmotion;
    }
  }, 100);

  console.log('📊 Monitoring state changes (call returned function to stop)');

  return () => {
    clearInterval(interval);
    console.log('📊 Stopped monitoring state changes');
  };
}
