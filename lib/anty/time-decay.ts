/**
 * Time Decay System for Anty Tamagotchi
 * Calculates stat degradation based on elapsed time
 */

import { AntyStats, STAT_CONFIG, clampStat } from "./stat-system";

// Maximum elapsed time to prevent extreme decay (7 days in minutes)
const MAX_ELAPSED_MINUTES = 7 * 24 * 60; // 10,080 minutes

// Decay rates per minute
const DECAY_RATES = {
  energy: 1 / 5, // -1 per 5 minutes = -0.2 per minute
  happiness: 0.5 / 10, // -0.5 per 10 minutes = -0.05 per minute
  knowledge: 0.3 / 15, // -0.3 per 15 minutes = -0.02 per minute
  indexHealth: 0.8 / 20, // -0.8 per 20 minutes = -0.04 per minute
};

/**
 * Calculates time decay for all stats
 * @param stats - Current stat values
 * @param minutesElapsed - Time elapsed since last interaction in minutes
 * @returns Updated stats with decay applied
 */
export function calculateTimeDecay(
  stats: AntyStats,
  minutesElapsed: number
): AntyStats {
  // Cap the elapsed time to prevent extreme decay
  const cappedMinutes = Math.min(minutesElapsed, MAX_ELAPSED_MINUTES);

  // If no time has elapsed, return stats unchanged
  if (cappedMinutes <= 0) {
    return stats;
  }

  // Calculate decay for each stat
  const decayedStats: AntyStats = {
    energy: stats.energy - DECAY_RATES.energy * cappedMinutes,
    happiness: stats.happiness - DECAY_RATES.happiness * cappedMinutes,
    knowledge: stats.knowledge - DECAY_RATES.knowledge * cappedMinutes,
    indexHealth: stats.indexHealth - DECAY_RATES.indexHealth * cappedMinutes,
  };

  // Clamp all values to 0-100 range
  return {
    energy: clampStat(decayedStats.energy),
    happiness: clampStat(decayedStats.happiness),
    knowledge: clampStat(decayedStats.knowledge),
    indexHealth: clampStat(decayedStats.indexHealth),
  };
}

/**
 * Calculates minutes elapsed between two timestamps
 * @param lastInteraction - ISO timestamp of last interaction
 * @param currentTime - ISO timestamp of current time (defaults to now)
 * @returns Minutes elapsed
 */
export function calculateMinutesElapsed(
  lastInteraction: string,
  currentTime?: string
): number {
  try {
    const lastTime = new Date(lastInteraction).getTime();
    const now = currentTime ? new Date(currentTime).getTime() : Date.now();

    // Validate timestamps
    if (isNaN(lastTime) || isNaN(now)) {
      console.warn("Invalid timestamp provided, returning 0 elapsed minutes");
      return 0;
    }

    // Calculate difference in milliseconds, then convert to minutes
    const diffMs = now - lastTime;

    // If current time is before last interaction, return 0 (prevents negative values)
    if (diffMs < 0) {
      return 0;
    }

    return diffMs / (1000 * 60);
  } catch (error) {
    console.error("Error calculating elapsed time:", error);
    return 0;
  }
}

/**
 * Gets the maximum decay time in minutes
 */
export function getMaxDecayMinutes(): number {
  return MAX_ELAPSED_MINUTES;
}

/**
 * Gets the maximum decay time in human-readable format
 */
export function getMaxDecayTime(): string {
  return "7 days";
}

/**
 * Calculates how long until a stat reaches zero (in minutes)
 * @param currentValue - Current stat value
 * @param decayRate - Decay rate per minute for this stat
 * @returns Minutes until stat reaches zero
 */
export function calculateTimeUntilZero(
  currentValue: number,
  statName: keyof AntyStats
): number {
  const rate = DECAY_RATES[statName];
  if (rate <= 0 || currentValue <= 0) {
    return 0;
  }
  return currentValue / rate;
}

/**
 * Formats minutes into a human-readable duration
 * @param minutes - Number of minutes
 * @returns Formatted string (e.g., "2h 30m", "1d 5h", "45m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return "< 1m";
  }

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = Math.floor(minutes % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 && days === 0) parts.push(`${mins}m`);

  return parts.join(" ") || "< 1m";
}

/**
 * Gets decay information for all stats
 */
export function getDecayInfo(): Record<
  keyof AntyStats,
  { ratePerMinute: number; timeToZeroFromFull: string }
> {
  return {
    energy: {
      ratePerMinute: DECAY_RATES.energy,
      timeToZeroFromFull: formatDuration(100 / DECAY_RATES.energy),
    },
    happiness: {
      ratePerMinute: DECAY_RATES.happiness,
      timeToZeroFromFull: formatDuration(100 / DECAY_RATES.happiness),
    },
    knowledge: {
      ratePerMinute: DECAY_RATES.knowledge,
      timeToZeroFromFull: formatDuration(100 / DECAY_RATES.knowledge),
    },
    indexHealth: {
      ratePerMinute: DECAY_RATES.indexHealth,
      timeToZeroFromFull: formatDuration(100 / DECAY_RATES.indexHealth),
    },
  };
}
