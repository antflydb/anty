/**
 * Expression Auto-Selection Engine for Anty Tamagotchi
 *
 * This hook manages dynamic expression selection based on:
 * 1. Event-based overrides (achievements, feeding, playing, etc.)
 * 2. Temporary timed expressions that auto-revert
 * 3. Stat-based expressions as the default
 *
 * Priority: event > timed > stat-based
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Expression, getExpressionByStats } from '@/lib/anty/expressions';
import { AntyStats } from '@/lib/anty/stat-system';

/**
 * Event types that trigger temporary expression overrides
 */
export type ExpressionEvent =
  | 'achievement'  // Show 'proud' for 2 seconds
  | 'feeding'      // Show 'excited' for 1.5 seconds
  | 'playing'      // Show 'wink' for 1 second
  | 'resting'      // Show 'sleepy' for 3 seconds
  | 'working';     // Show 'thinking' for 2 seconds

/**
 * Mapping of events to their corresponding expressions and durations
 */
const EVENT_CONFIG: Record<ExpressionEvent, { expression: Expression; duration: number }> = {
  achievement: { expression: 'proud', duration: 2000 },
  feeding: { expression: 'excited', duration: 1500 },
  playing: { expression: 'wink', duration: 1000 },
  resting: { expression: 'sleepy', duration: 3000 },
  working: { expression: 'thinking', duration: 2000 },
};

/**
 * Expression Engine Hook
 *
 * Manages automatic expression selection based on stats and events
 *
 * @param stats - Current Anty stats
 * @returns Object containing current expression, event trigger function, and event status
 */
export function useExpressionEngine(stats: AntyStats) {
  // Current active event expression (if any)
  const [activeEventExpression, setActiveEventExpression] = useState<Expression | null>(null);

  // Track if an event is currently active
  const [isEventActive, setIsEventActive] = useState(false);

  // Reference to the active timeout to enable cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Triggers a temporary expression event
   * Clears any existing event and starts a new one
   */
  const triggerEvent = useCallback((event: ExpressionEvent) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const config = EVENT_CONFIG[event];

    // Set the event expression and mark event as active
    setActiveEventExpression(config.expression);
    setIsEventActive(true);

    // Schedule revert to stat-based expression
    timeoutRef.current = setTimeout(() => {
      setActiveEventExpression(null);
      setIsEventActive(false);
      timeoutRef.current = null;
    }, config.duration);
  }, []);

  /**
   * Clean up timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Determine current expression
   * Priority: event expression > stat-based expression
   */
  const currentExpression: Expression = activeEventExpression ?? getExpressionByStats(stats);

  return {
    currentExpression,
    triggerEvent,
    isEventActive,
  };
}

/**
 * Standalone function to trigger expression events (for non-hook contexts)
 * Note: This is a utility type export; actual triggering requires the hook
 */
export type TriggerExpressionEvent = (event: ExpressionEvent) => void;
