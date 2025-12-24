/**
 * Expression Engine for Anty V3
 *
 * Determines which expression to display based on character stats.
 * Ported from V1 expression logic with priority-based selection.
 */

import type { EmotionType } from './animation/types';
import type { AntyStats } from '@/lib/anty-v3/stat-system';

/**
 * Selects the appropriate expression based on current character stats.
 *
 * @param stats - Current character stats (all 0-100)
 * @returns The emotion type to display, or 'idle'/'off' for non-emotion states
 */
export function selectExpressionFromStats(stats: AntyStats): EmotionType | 'idle' {
  // Happy when happiness is high
  if (stats.happiness > 70) {
    return 'happy';
  }

  // Default to idle
  return 'idle';
}

/**
 * Validates that an expression name is a valid emotion.
 *
 * @param expression - Expression name to validate
 * @returns True if the expression is a valid emotion
 */
export function isValidExpression(expression: string): expression is EmotionType {
  const validExpressions: Array<EmotionType | 'idle'> = ['idle', 'happy', 'wink'];
  return validExpressions.includes(expression as EmotionType);
}

/**
 * Gets a descriptive label for an expression.
 *
 * @param expression - The expression/emotion name
 * @returns Human-readable label
 */
export function getExpressionLabel(expression: EmotionType | 'idle' | 'off'): string {
  const labels: Partial<Record<EmotionType | 'idle' | 'off', string>> = {
    idle: 'Idle',
    happy: 'Happy',
    wink: 'Winking',
    excited: 'Excited',
    shocked: 'Shocked',
    angry: 'Angry',
    sad: 'Sad',
    spin: 'Spinning',
    idea: 'Idea',
    nod: 'Nodding',
    headshake: 'No',
    lookaround: 'Looking Around',
    'look-left': 'Looking Left',
    'look-right': 'Looking Right',
    off: 'Off',
  };
  return labels[expression] || expression;
}
