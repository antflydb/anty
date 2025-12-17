'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getRandomBlinkInterval, blinkTiming } from '@/lib/anty/animation-configs';
import type { Expression } from '@/lib/anty/expressions';

export interface UseRandomBlinkOptions {
  /** Current expression of the character */
  currentExpression: Expression;
  /** Callback fired when blink starts */
  onBlinkStart?: () => void;
  /** Callback fired when blink ends */
  onBlinkEnd?: () => void;
  /** Whether to pause blinking (e.g., during user interactions) */
  pauseBlinking?: boolean;
  /** Enable/disable automatic blinking */
  enabled?: boolean;
}

export interface UseRandomBlinkReturn {
  /** Whether the character is currently blinking */
  isBlinking: boolean;
  /** Manually trigger a blink */
  triggerBlink: () => void;
  /** Reset the blink timer */
  resetTimer: () => void;
}

/**
 * useRandomBlink - Hook for managing random blink animations
 *
 * Features:
 * - Generates random intervals between blinks (3-7 seconds)
 * - Triggers 300ms blink animation (200ms down + 100ms up)
 * - Pauses during user interactions
 * - Cleans up timers on unmount
 * - Prevents overlapping blinks
 *
 * @param options - Configuration options
 * @returns Blink state and control functions
 */
export function useRandomBlink({
  currentExpression,
  onBlinkStart,
  onBlinkEnd,
  pauseBlinking = false,
  enabled = true,
}: UseRandomBlinkOptions): UseRandomBlinkReturn {
  const [isBlinking, setIsBlinking] = useState(false);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blinkAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isBlinkingRef = useRef(false);

  /**
   * Clear all active timers
   */
  const clearTimers = useCallback(() => {
    if (blinkTimerRef.current) {
      clearTimeout(blinkTimerRef.current);
      blinkTimerRef.current = null;
    }
    if (blinkAnimationTimerRef.current) {
      clearTimeout(blinkAnimationTimerRef.current);
      blinkAnimationTimerRef.current = null;
    }
  }, []);

  /**
   * Execute a single blink animation
   */
  const executeBlink = useCallback(() => {
    // Prevent overlapping blinks
    if (isBlinkingRef.current || pauseBlinking || !enabled) {
      return;
    }

    isBlinkingRef.current = true;
    setIsBlinking(true);
    onBlinkStart?.();

    // End blink after total duration
    blinkAnimationTimerRef.current = setTimeout(() => {
      setIsBlinking(false);
      isBlinkingRef.current = false;
      onBlinkEnd?.();
      blinkAnimationTimerRef.current = null;
    }, blinkTiming.totalDuration);
  }, [pauseBlinking, enabled, onBlinkStart, onBlinkEnd]);

  /**
   * Schedule the next random blink
   */
  const scheduleNextBlink = useCallback(() => {
    clearTimers();

    if (!enabled || pauseBlinking) {
      return;
    }

    const interval = getRandomBlinkInterval();
    blinkTimerRef.current = setTimeout(() => {
      executeBlink();
      // Schedule the next blink after this one completes
      setTimeout(() => {
        scheduleNextBlink();
      }, blinkTiming.totalDuration);
    }, interval);
  }, [enabled, pauseBlinking, executeBlink, clearTimers]);

  /**
   * Manually trigger a blink (useful for testing or user interactions)
   */
  const triggerBlink = useCallback(() => {
    clearTimers();
    executeBlink();
    // Reschedule next random blink
    setTimeout(() => {
      scheduleNextBlink();
    }, blinkTiming.totalDuration + getRandomBlinkInterval());
  }, [executeBlink, scheduleNextBlink, clearTimers]);

  /**
   * Reset the blink timer (useful when expression changes)
   */
  const resetTimer = useCallback(() => {
    clearTimers();
    if (enabled && !pauseBlinking) {
      scheduleNextBlink();
    }
  }, [enabled, pauseBlinking, scheduleNextBlink, clearTimers]);

  // Initialize blinking on mount and when dependencies change
  useEffect(() => {
    if (enabled && !pauseBlinking) {
      scheduleNextBlink();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      clearTimers();
    };
  }, [enabled, pauseBlinking, scheduleNextBlink, clearTimers]);

  // Pause/resume blinking when pauseBlinking changes
  useEffect(() => {
    if (pauseBlinking) {
      clearTimers();
      // If currently blinking, let it finish
      if (isBlinking) {
        // Will reschedule when pauseBlinking becomes false
      }
    } else if (enabled && !isBlinking) {
      scheduleNextBlink();
    }
  }, [pauseBlinking, enabled, isBlinking, scheduleNextBlink, clearTimers]);

  // Reset timer when expression changes (but not during a blink)
  useEffect(() => {
    if (!isBlinking && enabled && !pauseBlinking) {
      resetTimer();
    }
  }, [currentExpression]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isBlinking,
    triggerBlink,
    resetTimer,
  };
}
