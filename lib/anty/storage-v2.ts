/**
 * Anty V2 - Storage and Mood Decay System
 *
 * Simplified decay mechanics:
 * - Mood decays -1 every 2 hours
 * - Mood ranges from 0 to 3 hearts
 */

import type { AntyState } from './types-v2';
import { getExpressionByMood } from './expressions-v2';

const STORAGE_KEY = 'anty-v2-state';

/**
 * Mood decay rate: -1 mood every 2 hours
 */
const DECAY_INTERVAL_HOURS = 2;
const DECAY_AMOUNT = 1;

/**
 * Calculate mood decay based on time elapsed
 */
export function calculateMoodDecay(
  currentMood: number,
  lastInteraction: string
): number {
  const lastTime = new Date(lastInteraction).getTime();
  const now = new Date().getTime();
  const hoursElapsed = (now - lastTime) / (1000 * 60 * 60);

  // Calculate how many decay intervals have passed
  const decayIntervals = Math.floor(hoursElapsed / DECAY_INTERVAL_HOURS);
  const totalDecay = decayIntervals * DECAY_AMOUNT;

  // Apply decay (min 0)
  const newMood = Math.max(currentMood - totalDecay, 0);
  return newMood;
}

/**
 * Load state from localStorage with decay applied
 */
export function loadState(): AntyState | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state: AntyState = JSON.parse(stored);

    // Apply mood decay
    const decayedMood = calculateMoodDecay(state.mood, state.lastInteraction);

    // Update expression based on decayed mood
    const updatedExpression = getExpressionByMood(decayedMood);

    return {
      ...state,
      mood: decayedMood,
      currentExpression: updatedExpression,
    };
  } catch (error) {
    console.error('Failed to load Anty state:', error);
    return null;
  }
}

/**
 * Save state to localStorage
 */
export function saveState(state: AntyState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save Anty state:', error);
  }
}

/**
 * Clear state from localStorage
 */
export function clearState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear Anty state:', error);
  }
}

/**
 * Get time until next decay
 */
export function getTimeUntilNextDecay(lastInteraction: string): {
  hours: number;
  minutes: number;
  totalMinutes: number;
} {
  const lastTime = new Date(lastInteraction).getTime();
  const now = new Date().getTime();
  const msElapsed = now - lastTime;
  const msPerDecay = DECAY_INTERVAL_HOURS * 60 * 60 * 1000;

  const msUntilNext = msPerDecay - (msElapsed % msPerDecay);
  const totalMinutes = Math.floor(msUntilNext / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { hours, minutes, totalMinutes };
}
