/**
 * Expression Engine for Anty V3
 *
 * Determines which expression to display based on character stats.
 * Ported from V1 expression logic with priority-based selection.
 */

import type { ExpressionName } from './animation-state';
import type { AntyStats } from '@/lib/anty/stat-system';

/**
 * Selects the appropriate expression based on current character stats.
 *
 * Priority order (highest to lowest):
 * 1. Critical health - sick
 * 2. Extreme fatigue - sleepy
 * 3. Neglected/angry - angry
 * 4. Low energy - tired
 * 5. Low happiness - sad
 * 6. High energy + happiness - excited
 * 7. High happiness - happy
 * 8. Conflicting stats - confused
 * 9. Default - idle
 *
 * @param stats - Current character stats (all 0-100)
 * @returns The expression name to display
 */
export function selectExpressionFromStats(stats: AntyStats): ExpressionName {
  // Priority 1: Critical health
  if (stats.indexHealth < 20) {
    return 'sick';
  }

  // Priority 2: Extreme fatigue (very low energy)
  if (stats.energy < 10) {
    return 'sleepy';
  }

  // Priority 3: Neglected/angry (low happiness and energy)
  if (stats.happiness < 15 && stats.energy < 30) {
    return 'angry';
  }

  // Also angry if just very low happiness
  if (stats.happiness < 15) {
    return 'angry';
  }

  // Priority 4: Low energy
  if (stats.energy < 30) {
    return 'tired';
  }

  // Priority 5: Low happiness
  if (stats.happiness < 30) {
    return 'sad';
  }

  // Priority 6: Excited (high energy AND high happiness)
  if (stats.energy > 80 && stats.happiness > 75) {
    return 'excited';
  }

  // Priority 7: Happy (high happiness)
  if (stats.happiness > 70) {
    return 'happy';
  }

  // Priority 8: Confused (conflicting stats)
  // High energy but low happiness, or vice versa
  if (
    (stats.energy > 70 && stats.happiness < 30) ||
    (stats.energy < 30 && stats.happiness > 70)
  ) {
    return 'confused';
  }

  // Priority 9: Default to idle
  return 'idle';
}

/**
 * Validates that an expression name is valid.
 *
 * @param expression - Expression name to validate
 * @returns True if the expression is valid
 */
export function isValidExpression(expression: string): expression is ExpressionName {
  const validExpressions: ExpressionName[] = [
    'idle',
    'happy',
    'excited',
    'wink',
    'proud',
    'tired',
    'sleepy',
    'sad',
    'thinking',
    'curious',
    'talking',
    'confused',
    'angry',
    'sick',
    'blink',
  ];
  return validExpressions.includes(expression as ExpressionName);
}

/**
 * Gets a descriptive label for an expression.
 *
 * @param expression - The expression name
 * @returns Human-readable label
 */
export function getExpressionLabel(expression: ExpressionName): string {
  const labels: Record<ExpressionName, string> = {
    idle: 'Idle',
    happy: 'Happy',
    excited: 'Excited',
    wink: 'Winking',
    proud: 'Proud',
    tired: 'Tired',
    sleepy: 'Sleepy',
    sad: 'Sad',
    thinking: 'Thinking',
    curious: 'Curious',
    talking: 'Talking',
    confused: 'Confused',
    angry: 'Angry',
    sick: 'Sick',
    blink: 'Blinking',
  };
  return labels[expression];
}
