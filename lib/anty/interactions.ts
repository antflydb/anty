/**
 * Interaction System for Anty Tamagotchi
 * Defines 7 actions users can perform to care for Anty
 */

import { AntyStats, applyStatChange } from "./stat-system";

// Action type definitions
export type ActionName =
  | "feed"
  | "play"
  | "rest"
  | "optimize"
  | "query"
  | "reindex"
  | "train";

// Result of executing an action
export interface ActionResult {
  stats: AntyStats;
  message: string;
  cooldownUntil: string; // ISO timestamp
}

// Error result when action cannot be executed
export interface ActionError {
  error: string;
  cooldownRemaining?: number; // seconds
}

// Configuration for each action
export interface ActionConfig {
  name: ActionName;
  label: string;
  description: string;
  statChanges: Partial<AntyStats>;
  cooldownSeconds: number;
  emoji: string;
}

// Define all 7 actions with their effects
export const ACTIONS: Record<ActionName, ActionConfig> = {
  feed: {
    name: "feed",
    label: "Feed Data",
    description: "Feed Anty fresh data to boost energy and index health",
    statChanges: {
      energy: 20,
      happiness: 10,
      indexHealth: 5,
    },
    cooldownSeconds: 8,
    emoji: "🍔",
  },
  play: {
    name: "play",
    label: "Play Query Game",
    description: "Play a fun query game to boost happiness and knowledge",
    statChanges: {
      happiness: 25,
      energy: -10,
      knowledge: 5,
    },
    cooldownSeconds: 10,
    emoji: "🎮",
  },
  rest: {
    name: "rest",
    label: "Rest",
    description: "Let Anty rest to restore energy",
    statChanges: {
      energy: 30,
      happiness: -5,
    },
    cooldownSeconds: 6,
    emoji: "😴",
  },
  optimize: {
    name: "optimize",
    label: "Optimize Index",
    description: "Optimize Anty's index for better performance",
    statChanges: {
      indexHealth: 20,
      energy: -15,
      knowledge: 10,
    },
    cooldownSeconds: 10,
    emoji: "⚡",
  },
  query: {
    name: "query",
    label: "Run Query",
    description: "Run queries to gain knowledge",
    statChanges: {
      knowledge: 15,
      energy: -5,
      indexHealth: -5,
    },
    cooldownSeconds: 5,
    emoji: "🔍",
  },
  reindex: {
    name: "reindex",
    label: "Reindex Database",
    description: "Perform a full reindex to restore index health",
    statChanges: {
      indexHealth: 30,
      energy: -20,
      happiness: -10,
    },
    cooldownSeconds: 10,
    emoji: "🔄",
  },
  train: {
    name: "train",
    label: "Train Model",
    description: "Train Anty's AI model to increase knowledge",
    statChanges: {
      knowledge: 25,
      energy: -15,
      happiness: 5,
    },
    cooldownSeconds: 8,
    emoji: "🧠",
  },
};

/**
 * Checks if an action is currently on cooldown
 * Returns the remaining cooldown time in seconds, or 0 if ready
 */
export function getActionCooldown(
  action: ActionName,
  lastActionTimes: Record<string, string>
): number {
  const lastActionTime = lastActionTimes[action];
  if (!lastActionTime) {
    return 0;
  }

  const actionConfig = ACTIONS[action];
  const lastTime = new Date(lastActionTime).getTime();
  const now = Date.now();
  const elapsed = (now - lastTime) / 1000; // Convert to seconds
  const remaining = actionConfig.cooldownSeconds - elapsed;

  return Math.max(0, Math.ceil(remaining));
}

/**
 * Checks if an action is ready to be executed (not on cooldown)
 */
export function isActionReady(
  action: ActionName,
  lastActionTimes: Record<string, string>
): boolean {
  return getActionCooldown(action, lastActionTimes) === 0;
}

/**
 * Gets a user-friendly message for an action result
 */
function getActionMessage(action: ActionName, stats: AntyStats): string {
  const messages: Record<ActionName, string[]> = {
    feed: [
      "Nom nom! Anty enjoyed that fresh data!",
      "Delicious! Anty's energy is restored!",
      "Yummy data! Anty feels recharged!",
    ],
    play: [
      "Woohoo! Anty loves playing query games!",
      "That was fun! Anty is much happier!",
      "Anty had a blast playing with you!",
    ],
    rest: [
      "Zzz... Anty is feeling refreshed!",
      "Anty woke up feeling energized!",
      "A good rest was just what Anty needed!",
    ],
    optimize: [
      "Index optimized! Anty's performance is improved!",
      "Anty's index is running smoothly now!",
      "Optimization complete! Anty feels faster!",
    ],
    query: [
      "Query executed! Anty learned something new!",
      "Anty processed that query successfully!",
      "Knowledge gained from that query!",
    ],
    reindex: [
      "Reindexing complete! Anty's index is pristine!",
      "Full reindex done! Anty's database is healthy again!",
      "Anty's index has been fully rebuilt!",
    ],
    train: [
      "Training complete! Anty is smarter now!",
      "Anty's AI model has been updated!",
      "Anty learned new patterns from training!",
    ],
  };

  const messageList = messages[action];

  // Pick a random message, or use the first one if randomization fails
  const randomIndex = Math.floor(Math.random() * messageList.length);
  return messageList[randomIndex] || messageList[0];
}

/**
 * Executes an action and returns the result
 * Handles cooldown checking and stat updates
 */
export function executeAction(
  action: ActionName,
  currentStats: AntyStats,
  lastActionTimes: Record<string, string>
): ActionResult | ActionError {
  // Check if action exists
  const actionConfig = ACTIONS[action];
  if (!actionConfig) {
    return {
      error: `Unknown action: ${action}`,
    };
  }

  // Check cooldown
  const cooldownRemaining = getActionCooldown(action, lastActionTimes);
  if (cooldownRemaining > 0) {
    return {
      error: `${actionConfig.label} is on cooldown. Wait ${cooldownRemaining}s.`,
      cooldownRemaining,
    };
  }

  // Apply stat changes
  const newStats = applyStatChange(currentStats, actionConfig.statChanges);

  // Calculate cooldown expiry
  const cooldownUntil = new Date(
    Date.now() + actionConfig.cooldownSeconds * 1000
  ).toISOString();

  // Return success result
  return {
    stats: newStats,
    message: getActionMessage(action, newStats),
    cooldownUntil,
  };
}

/**
 * Gets all actions with their current cooldown status
 * Useful for UI to show which actions are available
 */
export function getAllActionsStatus(
  lastActionTimes: Record<string, string>
): Array<{
  action: ActionName;
  config: ActionConfig;
  cooldownRemaining: number;
  isReady: boolean;
}> {
  return Object.values(ACTIONS).map((config) => ({
    action: config.name,
    config,
    cooldownRemaining: getActionCooldown(config.name, lastActionTimes),
    isReady: isActionReady(config.name, lastActionTimes),
  }));
}

/**
 * Type guard to check if result is an error
 */
export function isActionError(
  result: ActionResult | ActionError
): result is ActionError {
  return "error" in result;
}

/**
 * Gets recommended actions based on current stats
 * Returns up to 3 suggested actions to help low stats
 */
export function getRecommendedActions(stats: AntyStats): ActionName[] {
  const recommendations: ActionName[] = [];

  // Recommend based on lowest stats
  if (stats.energy < 40) {
    recommendations.push("rest");
    recommendations.push("feed");
  }
  if (stats.happiness < 40) {
    recommendations.push("play");
  }
  if (stats.indexHealth < 40) {
    recommendations.push("reindex");
    recommendations.push("optimize");
  }
  if (stats.knowledge < 40) {
    recommendations.push("train");
  }

  // Return up to 3 unique recommendations
  const uniqueRecommendations: ActionName[] = [];
  for (const action of recommendations) {
    if (!uniqueRecommendations.includes(action)) {
      uniqueRecommendations.push(action);
    }
  }
  return uniqueRecommendations.slice(0, 3);
}

/**
 * Calculates the total impact score of an action on stats
 * Positive changes are good, negative changes are bad
 */
export function getActionImpact(action: ActionName): number {
  const config = ACTIONS[action];
  return Object.values(config.statChanges).reduce((sum, value) => sum + value, 0);
}
