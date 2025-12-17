'use client';

import { useState } from 'react';
import { AntyStats, formatStatName } from '@/lib/anty/stat-system';

interface DebugMenuProps {
  stats: AntyStats;
  onReset: () => void;
  onSetStat: (stat: keyof AntyStats, value: number) => void;
  lastInteraction?: string;
  createdAt?: string;
}

/**
 * DebugMenu Component
 * Developer tools for testing and debugging Anty
 * Only visible in development mode
 */
export function DebugMenu({
  stats,
  onReset,
  onSetStat,
  lastInteraction,
  createdAt,
}: DebugMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatTimestamp = (isoString: string | undefined): string => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getTimeSince = (isoString: string | undefined): string => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h ago`;
      if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m ago`;
      if (diffMins > 0) return `${diffMins}m ago`;
      return 'Just now';
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-750 transition-colors"
          aria-expanded={!isCollapsed}
          aria-label="Toggle debug menu"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-hidden="true">
              🔧
            </span>
            <span className="font-mono font-bold text-sm">Debug Menu</span>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-4 space-y-4">
            {/* Timestamp Info */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-400">Created:</span>
                <div className="text-right">
                  <div className="text-white">{formatTimestamp(createdAt)}</div>
                  <div className="text-gray-500">{getTimeSince(createdAt)}</div>
                </div>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-400">Last Action:</span>
                <div className="text-right">
                  <div className="text-white">{formatTimestamp(lastInteraction)}</div>
                  <div className="text-gray-500">{getTimeSince(lastInteraction)}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700" />

            {/* Stat Sliders */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Stat Override
              </div>
              {(Object.keys(stats) as Array<keyof AntyStats>).map((stat) => (
                <div key={stat} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor={`debug-${stat}`}
                      className="text-xs font-mono text-gray-300"
                    >
                      {formatStatName(stat)}
                    </label>
                    <span className="text-xs font-mono text-white font-bold tabular-nums">
                      {Math.round(stats[stat])}
                    </span>
                  </div>
                  <input
                    id={`debug-${stat}`}
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={Math.round(stats[stat])}
                    onChange={(e) => onSetStat(stat, parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    aria-label={`Set ${formatStatName(stat)} value`}
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700" />

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-mono text-sm font-bold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Reset Anty to initial state"
            >
              🔄 Reset Anty
            </button>

            {/* Current Stats Display */}
            <div className="p-3 bg-gray-800 rounded text-xs font-mono space-y-1">
              <div className="text-gray-400 font-bold mb-2">Current Stats:</div>
              {(Object.keys(stats) as Array<keyof AntyStats>).map((stat) => (
                <div key={stat} className="flex justify-between">
                  <span className="text-gray-400">{stat}:</span>
                  <span className="text-white tabular-nums">{stats[stat].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
