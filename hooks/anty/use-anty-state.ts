"use client";

/**
 * Central State Hook for Anty Tamagotchi
 * Manages complete tamagotchi state with localStorage persistence
 */

import { useState, useEffect, useCallback } from "react";
import { AntyStats, INITIAL_STATS } from "@/lib/anty/stat-system";
import { calculateTimeDecay, calculateMinutesElapsed } from "@/lib/anty/time-decay";

// Expression types (from Phase 1, Agent 1)
export type Expression =
  | "idle"
  | "happy"
  | "sad"
  | "tired"
  | "thinking"
  | "excited"
  | "sleeping"
  | "sick";

// Complete state interface
export interface AntyState {
  stats: AntyStats;
  currentExpression: Expression;
  lastInteraction: string; // ISO timestamp
  createdAt: string; // ISO timestamp
  version: number;
}

// Default initial state
const DEFAULT_STATE: AntyState = {
  stats: INITIAL_STATS,
  currentExpression: "idle",
  lastInteraction: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  version: 1,
};

// localStorage key
const STORAGE_KEY = "anty-tamagotchi-state";

/**
 * Central state management hook with localStorage persistence
 */
export function useAntyState() {
  const [state, setState] = useState<AntyState>(DEFAULT_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsedState: AntyState = JSON.parse(stored);

        // Validate version
        if (parsedState.version !== 1) {
          console.warn("Invalid state version, using default state");
          setState(DEFAULT_STATE);
          setIsHydrated(true);
          return;
        }

        // Calculate time decay
        const minutesElapsed = calculateMinutesElapsed(parsedState.lastInteraction);
        const decayedStats = calculateTimeDecay(parsedState.stats, minutesElapsed);

        // Update state with decayed stats and current timestamp
        const updatedState: AntyState = {
          ...parsedState,
          stats: decayedStats,
          lastInteraction: new Date().toISOString(),
        };

        setState(updatedState);

        // Save the updated state back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      } else {
        // No stored state, use default
        setState(DEFAULT_STATE);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      }
    } catch (error) {
      console.error("Error loading state from localStorage:", error);
      setState(DEFAULT_STATE);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save state to localStorage whenever it changes (skip initial hydration)
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving state to localStorage:", error);
    }
  }, [state, isHydrated]);

  // Update stats
  const setStats = useCallback((newStats: AntyStats | ((prev: AntyStats) => AntyStats)) => {
    setState((prev) => ({
      ...prev,
      stats: typeof newStats === "function" ? newStats(prev.stats) : newStats,
      lastInteraction: new Date().toISOString(),
    }));
  }, []);

  // Update current expression
  const setCurrentExpression = useCallback((expression: Expression) => {
    setState((prev) => ({
      ...prev,
      currentExpression: expression,
      lastInteraction: new Date().toISOString(),
    }));
  }, []);

  // Reset state (useful for testing or reset functionality)
  const resetState = useCallback(() => {
    const newState = {
      ...DEFAULT_STATE,
      createdAt: new Date().toISOString(),
      lastInteraction: new Date().toISOString(),
    };
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Error resetting state in localStorage:", error);
    }
  }, []);

  // Update last interaction time (useful for passive interactions)
  const updateLastInteraction = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lastInteraction: new Date().toISOString(),
    }));
  }, []);

  return {
    stats: state.stats,
    setStats,
    currentExpression: state.currentExpression,
    setCurrentExpression,
    lastInteraction: state.lastInteraction,
    createdAt: state.createdAt,
    isHydrated,
    resetState,
    updateLastInteraction,
  };
}

/**
 * Hook to access read-only state
 * Useful for components that only need to display state
 */
export function useAntyStateReadonly() {
  const { stats, currentExpression, lastInteraction, createdAt, isHydrated } = useAntyState();

  return {
    stats,
    currentExpression,
    lastInteraction,
    createdAt,
    isHydrated,
  };
}
