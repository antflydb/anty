"use client";

/**
 * Stat Decay Hook for Anty Tamagotchi
 * Auto-applies time decay on component mount
 */

import { useEffect, useRef } from "react";
import { useAntyState } from "./use-anty-state";
import { calculateTimeDecay, calculateMinutesElapsed } from "@/lib/anty/time-decay";

/**
 * Hook that automatically applies stat decay on mount
 * This should be used in the main Anty component to ensure
 * stats are updated when the user returns after time away
 */
export function useStatDecay() {
  const { stats, setStats, lastInteraction, isHydrated, updateLastInteraction } = useAntyState();
  const hasAppliedDecay = useRef(false);

  useEffect(() => {
    // Only run once after hydration
    if (!isHydrated || hasAppliedDecay.current) {
      return;
    }

    // Calculate elapsed time
    const minutesElapsed = calculateMinutesElapsed(lastInteraction);

    // Only apply decay if significant time has passed (more than 1 minute)
    if (minutesElapsed > 1) {
      const decayedStats = calculateTimeDecay(stats, minutesElapsed);
      setStats(decayedStats);

      console.log(`Applied time decay: ${minutesElapsed.toFixed(2)} minutes elapsed`);
    } else {
      // Even if no decay, update the last interaction time
      updateLastInteraction();
    }

    hasAppliedDecay.current = true;
  }, [isHydrated, stats, setStats, lastInteraction, updateLastInteraction]);

  return {
    isHydrated,
    stats,
  };
}

/**
 * Hook that provides decay information without applying it
 * Useful for displaying "time until critical" warnings
 */
export function useDecayInfo() {
  const { stats, lastInteraction, isHydrated } = useAntyState();

  if (!isHydrated) {
    return null;
  }

  const minutesSinceLastInteraction = calculateMinutesElapsed(lastInteraction);

  return {
    stats,
    minutesSinceLastInteraction,
    lastInteraction,
  };
}
