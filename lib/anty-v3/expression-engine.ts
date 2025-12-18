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
 * Since only 3 expressions have visual assets (idle, happy, wink),
 * we use a simplified logic:
 * 1. High happiness - happy
 * 2. Default - idle
 * 3. Wink is only triggered manually via the expression menu
 *
 * @param stats - Current character stats (all 0-100)
 * @returns The expression name to display
 */
export function selectExpressionFromStats(stats: AntyStats): ExpressionName {
  // Happy when happiness is high
  if (stats.happiness > 70) {
    return 'happy';
  }

  // Default to idle
  return 'idle';
}

/**
 * Validates that an expression name is valid.
 *
 * @param expression - Expression name to validate
 * @returns True if the expression is valid
 */
export function isValidExpression(expression: string): expression is ExpressionName {
  const validExpressions: ExpressionName[] = ['idle', 'happy', 'wink'];
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
    wink: 'Winking',
  };
  return labels[expression];
}
