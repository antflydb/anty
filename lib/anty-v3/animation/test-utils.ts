/**
 * Testing Utilities for Animation System Migration
 *
 * Provides helpers for testing and validating the animation system migration.
 * Use these in development to verify both systems work correctly.
 */

import type { ExpressionName } from '@/lib/anty-v3/animation-state';
import type { EmotionType } from './types';
import type { UseAnimationControllerReturn } from './use-animation-controller';
import type { LegacyEyeAnimations } from './migration-helper';
import {
  mapExpressionToEmotion,
  mapEmotionToExpression,
} from './migration-helper';

// ===========================
// Test Suites
// ===========================

/**
 * All testable expressions
 */
export const TEST_EXPRESSIONS: ExpressionName[] = [
  'idle',
  'happy',
  'excited',
  'shocked',
  'wink',
  'angry',
  'sad',
  'idea',
  'lookaround',
];

/**
 * Expressions that map to emotions
 */
export const MAPPED_EXPRESSIONS: ExpressionName[] = [
  'idle',
  'happy',
  'excited',
  'shocked',
  'wink',
  'angry',
  'sad',
  'idea',
];

/**
 * All emotions
 */
export const TEST_EMOTIONS: EmotionType[] = [
  'neutral',
  'happy',
  'excited',
  'surprised',
  'playful',
  'angry',
  'sad',
  'curious',
  'thinking',
  'confident',
];

// ===========================
// Mapping Validation
// ===========================

/**
 * Test that expression → emotion → expression mapping is consistent
 */
export function testMappingRoundTrip(): void {
  console.group('🧪 Testing Expression ↔ Emotion Mapping');

  let passed = 0;
  let failed = 0;

  for (const expression of MAPPED_EXPRESSIONS) {
    const emotion = mapExpressionToEmotion(expression);
    if (!emotion) {
      console.warn(`❌ ${expression} → null (no mapping)`);
      failed++;
      continue;
    }

    const backToExpression = mapEmotionToExpression(emotion);

    if (backToExpression === expression) {
      console.log(`✅ ${expression} → ${emotion} → ${backToExpression}`);
      passed++;
    } else {
      console.warn(`⚠️  ${expression} → ${emotion} → ${backToExpression} (changed)`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  console.groupEnd();
}

/**
 * Show all expression mappings
 */
export function showAllMappings(): void {
  console.group('📋 All Expression → Emotion Mappings');

  for (const expression of TEST_EXPRESSIONS) {
    const emotion = mapExpressionToEmotion(expression);
    console.log(`${expression.padEnd(12)} → ${emotion ?? '(none)'}`);
  }

  console.groupEnd();
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
 * Test legacy system blink functionality
 */
export async function testLegacyBlinks(
  legacy: LegacyEyeAnimations,
  delayMs: number = 500
): Promise<void> {
  console.group('👁️  Testing Legacy System Blinks');

  console.log('Testing single blink...');
  legacy.triggerBlink();
  await new Promise(resolve => setTimeout(resolve, delayMs));

  console.log('Testing double blink...');
  legacy.triggerDoubleBlink();
  await new Promise(resolve => setTimeout(resolve, delayMs));

  console.log('Testing reset...');
  legacy.resetEyeAnimations();

  console.log('✅ Legacy blink tests complete');
  console.groupEnd();
}

// ===========================
// Comparison Testing
// ===========================

/**
 * Compare performance of old vs new system
 */
export async function comparePerformance(
  legacy: LegacyEyeAnimations | null,
  newSystem: UseAnimationControllerReturn | null,
  iterations: number = 10
): Promise<void> {
  console.group(`⚡ Performance Comparison (${iterations} iterations)`);

  // Test legacy system
  if (legacy) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      legacy.triggerBlink();
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    const legacyTime = performance.now() - start;
    console.log(`Legacy System: ${legacyTime.toFixed(2)}ms total, ${(legacyTime / iterations).toFixed(2)}ms avg`);
  }

  // Test new system
  if (newSystem && newSystem.isReady) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      newSystem.playEmotion('happy');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    const newTime = performance.now() - start;
    console.log(`New System:    ${newTime.toFixed(2)}ms total, ${(newTime / iterations).toFixed(2)}ms avg`);
  }

  console.groupEnd();
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
  legacy: LegacyEyeAnimations | null,
  newSystem: UseAnimationControllerReturn | null
): Promise<void> {
  console.log('🚀 Running Full Test Suite\n');

  // Mapping tests
  testMappingRoundTrip();
  showAllMappings();

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

  // Legacy system tests
  if (legacy) {
    await testLegacyBlinks(legacy, 500);
  } else {
    console.warn('⚠️  Skipping legacy system tests (not available)');
  }

  // Comparison
  if (legacy && newSystem && newSystem.isReady) {
    await comparePerformance(legacy, newSystem, 5);
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
  console.log('State:', info.state);
  console.log('Emotion:', info.emotion);
  console.log('Is Idle:', info.isIdle);
  console.log('Idle Paused:', info.idlePaused);
  console.log('Queue Length:', info.queueLength);
  console.log('Queued Items:', info.queuedItems);
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
