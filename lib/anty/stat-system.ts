/**
 * Stat System for Anty Tamagotchi
 * Defines stat types, interfaces, and manipulation utilities
 */

// Stat value range: 0-100
export interface AntyStats {
  energy: number;
  happiness: number;
  knowledge: number;
  indexHealth: number;
}

// Configuration for stat behavior
export interface StatConfig {
  min: number;
  max: number;
  decayRates: {
    energy: number; // per minute
    happiness: number;
    knowledge: number;
    indexHealth: number;
  };
  thresholds: {
    critical: number; // < 30
    warning: number; // 30-60
    good: number; // > 60
  };
}

// Default stat configuration
export const STAT_CONFIG: StatConfig = {
  min: 0,
  max: 100,
  decayRates: {
    energy: 1 / 5, // -1 per 5 minutes
    happiness: 0.5 / 10, // -0.5 per 10 minutes
    knowledge: 0.3 / 15, // -0.3 per 15 minutes
    indexHealth: 0.8 / 20, // -0.8 per 20 minutes
  },
  thresholds: {
    critical: 30,
    warning: 60,
    good: 60,
  },
};

// Initial stat values when Anty is first created
export const INITIAL_STATS: AntyStats = {
  energy: 80,
  happiness: 75,
  knowledge: 50,
  indexHealth: 90,
};

/**
 * Clamps a stat value to the valid range (0-100)
 */
export function clampStat(value: number): number {
  return Math.max(STAT_CONFIG.min, Math.min(STAT_CONFIG.max, value));
}

/**
 * Applies stat changes to the current stats
 * Clamps all values to valid range
 */
export function applyStatChange(
  stats: AntyStats,
  changes: Partial<AntyStats>
): AntyStats {
  return {
    energy: clampStat(stats.energy + (changes.energy ?? 0)),
    happiness: clampStat(stats.happiness + (changes.happiness ?? 0)),
    knowledge: clampStat(stats.knowledge + (changes.knowledge ?? 0)),
    indexHealth: clampStat(stats.indexHealth + (changes.indexHealth ?? 0)),
  };
}

/**
 * Returns a color class based on stat value
 * Green for good (>60), yellow for warning (30-60), red for critical (<30)
 */
export function getStatColor(value: number): string {
  if (value < STAT_CONFIG.thresholds.critical) {
    return "text-red-500";
  } else if (value < STAT_CONFIG.thresholds.warning) {
    return "text-yellow-500";
  } else {
    return "text-green-500";
  }
}

/**
 * Returns a background color class based on stat value
 */
export function getStatBgColor(value: number): string {
  if (value < STAT_CONFIG.thresholds.critical) {
    return "bg-red-500";
  } else if (value < STAT_CONFIG.thresholds.warning) {
    return "bg-yellow-500";
  } else {
    return "bg-green-500";
  }
}

/**
 * Returns a descriptive label for stat value
 */
export function getStatLabel(value: number): string {
  if (value < STAT_CONFIG.thresholds.critical) {
    return "Critical";
  } else if (value < STAT_CONFIG.thresholds.warning) {
    return "Warning";
  } else {
    return "Good";
  }
}

/**
 * Checks if any stat is in critical state
 */
export function hasAnyCriticalStat(stats: AntyStats): boolean {
  return Object.values(stats).some(
    (value) => value < STAT_CONFIG.thresholds.critical
  );
}

/**
 * Gets the lowest stat value
 */
export function getLowestStat(stats: AntyStats): {
  stat: keyof AntyStats;
  value: number;
} {
  let lowestStat: keyof AntyStats = "energy";
  let lowestValue = stats.energy;

  (Object.keys(stats) as Array<keyof AntyStats>).forEach((key) => {
    if (stats[key] < lowestValue) {
      lowestStat = key;
      lowestValue = stats[key];
    }
  });

  return { stat: lowestStat, value: lowestValue };
}

/**
 * Formats stat name for display
 */
export function formatStatName(stat: keyof AntyStats): string {
  const names: Record<keyof AntyStats, string> = {
    energy: "Energy",
    happiness: "Happiness",
    knowledge: "Knowledge",
    indexHealth: "Index Health",
  };
  return names[stat];
}
