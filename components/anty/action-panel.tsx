'use client';

import { useState, useEffect } from 'react';
import { ACTIONS, getActionCooldown, type ActionName } from '@/lib/anty/interactions';
import type { AntyStats } from '@/lib/anty/stat-system';

interface ActionPanelProps {
  stats: AntyStats;
  onAction: (action: ActionName) => void;
  lastActionTimes?: Record<string, string>;
}

/**
 * ActionPanel Component
 * Displays a grid of action buttons for interacting with Anty
 * Handles cooldown timers and disabled states
 */
export function ActionPanel({ stats, onAction, lastActionTimes = {} }: ActionPanelProps) {
  const [, setTick] = useState(0);

  // Force re-render every second to update cooldown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCooldownRemaining = (action: ActionName): number => {
    return getActionCooldown(action, lastActionTimes);
  };

  const formatCooldown = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  const actionsList = Object.values(ACTIONS);

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
      role="group"
      aria-label="Anty actions"
    >
      {actionsList.map((action) => {
        const cooldownRemaining = getCooldownRemaining(action.name);
        const isOnCooldown = cooldownRemaining > 0;

        return (
          <button
            key={action.name}
            onClick={() => !isOnCooldown && onAction(action.name)}
            disabled={isOnCooldown}
            className={`
              relative px-4 py-3 rounded-lg font-medium text-sm
              transition-all duration-200
              ${
                isOnCooldown
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-sm hover:shadow-md'
              }
              disabled:opacity-60
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
            aria-label={`${action.label}: ${action.description}`}
            aria-disabled={isOnCooldown}
            title={action.description}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl" role="img" aria-hidden="true">
                {action.emoji}
              </span>
              <span className="text-xs font-semibold">{action.label}</span>
              {isOnCooldown && (
                <span
                  className="text-[10px] font-mono text-gray-500 dark:text-gray-400 absolute bottom-0.5"
                  aria-live="polite"
                >
                  {formatCooldown(cooldownRemaining)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
