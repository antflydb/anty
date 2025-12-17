'use client';

import { AntyStats, formatStatName, getStatColor, getStatBgColor } from '@/lib/anty/stat-system';

interface StatDisplayProps {
  stats: AntyStats;
}

/**
 * StatDisplay Component
 * Displays the four tamagotchi stats as labeled progress bars
 * with color-coded values based on thresholds
 */
export function StatDisplay({ stats }: StatDisplayProps) {
  return (
    <div className="space-y-3" role="region" aria-label="Anty statistics">
      {(Object.keys(stats) as Array<keyof AntyStats>).map((stat) => {
        const value = stats[stat];
        const rounded = Math.round(value);

        return (
          <div key={stat} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatStatName(stat)}
              </span>
              <span
                className={`font-bold ${getStatColor(value)} tabular-nums`}
                aria-label={`${formatStatName(stat)}: ${rounded} out of 100`}
              >
                {rounded}
              </span>
            </div>
            <div
              className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={rounded}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full transition-all duration-300 ${getStatBgColor(value)}`}
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
