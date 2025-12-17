/**
 * Anty Tamagotchi Animation Library
 * Export all animation configs, expressions, utilities, and interaction system
 */

export {
  floatingAnimation,
  ghostlyRotation,
  eyeMorphTransition,
  blinkTiming,
  hoverMicroMovement,
  performanceConfig,
  customEasing,
  getRandomBlinkInterval,
} from './animation-configs';

export {
  expressions,
  staticBrackets,
  getExpressionByStats,
  canMorphBetween,
} from './expressions';

export type { Expression, ExpressionData } from './expressions';

export {
  ACTIONS,
  executeAction,
  getActionCooldown,
  isActionReady,
  getAllActionsStatus,
  isActionError,
  getRecommendedActions,
  getActionImpact,
} from './interactions';

export type {
  ActionName,
  ActionResult,
  ActionError,
  ActionConfig,
} from './interactions';

export {
  STAT_CONFIG,
  INITIAL_STATS,
  clampStat,
  applyStatChange,
  getStatColor,
  getStatBgColor,
  getStatLabel,
  hasAnyCriticalStat,
  getLowestStat,
  formatStatName,
} from './stat-system';

export type { AntyStats, StatConfig } from './stat-system';
