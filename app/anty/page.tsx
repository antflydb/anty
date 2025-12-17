'use client';

import { useState, useEffect, useCallback } from 'react';
import { AntyCharacter } from '@/components/anty/anty-character';
import { StatDisplay } from '@/components/anty/stat-display';
import { ActionPanel } from '@/components/anty/action-panel';
import { DebugMenu } from '@/components/anty/debug-menu';
import { useRandomBlink } from '@/hooks/anty/use-random-blink';
import { useExpressionEngine } from '@/hooks/anty/use-expression-engine';
import type { ExpressionEvent } from '@/hooks/anty/use-expression-engine';
import {
  executeAction,
  isActionError,
  getRecommendedActions,
  INITIAL_STATS,
  type ActionName,
  type AntyStats,
  type Expression,
} from '@/lib/anty';
import { calculateTimeDecay, calculateMinutesElapsed } from '@/lib/anty/time-decay';

const STORAGE_KEY = 'anty-tamagotchi-state';

interface AntyState {
  stats: AntyStats;
  lastActionTimes: Record<string, string>;
  lastInteraction: string;
  createdAt: string;
}

export default function AntyPage() {
  // State management
  const [stats, setStats] = useState<AntyStats>(INITIAL_STATS);
  const [lastActionTimes, setLastActionTimes] = useState<Record<string, string>>({});
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [lastInteraction, setLastInteraction] = useState<string>(new Date().toISOString());
  const [isHydrated, setIsHydrated] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Expression engine with event-based overrides
  const { currentExpression, triggerEvent, isEventActive } = useExpressionEngine(stats);

  // Random blinking (pause during events)
  const { isBlinking } = useRandomBlink({
    currentExpression,
    pauseBlinking: isEventActive,
    enabled: true,
  });

  // Determine final expression (blinking overrides everything)
  const displayExpression: Expression = isBlinking ? 'blink' : currentExpression;

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const state: AntyState = JSON.parse(stored);

        // Apply time decay
        const minutesElapsed = calculateMinutesElapsed(state.lastInteraction);
        const decayedStats = calculateTimeDecay(state.stats, minutesElapsed);

        setStats(decayedStats);
        setLastActionTimes(state.lastActionTimes);
        setCreatedAt(state.createdAt);
        setLastInteraction(new Date().toISOString());
      } catch (error) {
        console.error('Failed to load Anty state:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;

    const state: AntyState = {
      stats,
      lastActionTimes,
      lastInteraction,
      createdAt,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [stats, lastActionTimes, lastInteraction, createdAt, isHydrated]);

  // Handle action execution
  const handleAction = useCallback((action: ActionName) => {
    const result = executeAction(action, stats, lastActionTimes);

    if (isActionError(result)) {
      // Show error feedback
      setFeedbackMessage(result.error);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }

    // Update stats
    setStats(result.stats);

    // Update cooldown tracking
    setLastActionTimes(prev => ({
      ...prev,
      [action]: result.cooldownUntil,
    }));

    // Update last interaction time
    setLastInteraction(new Date().toISOString());

    // Show success feedback
    setFeedbackMessage(result.message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);

    // Trigger appropriate expression event
    const eventMap: Record<string, ExpressionEvent | null> = {
      feed: 'feeding',
      play: 'playing',
      rest: 'resting',
      optimize: 'working',
      query: 'working',
      reindex: 'working',
      train: 'working',
    };

    const event = eventMap[action];
    if (event) {
      triggerEvent(event);
    }

    // Check for achievements (all stats above 80)
    if (
      result.stats.energy > 80 &&
      result.stats.happiness > 80 &&
      result.stats.knowledge > 80 &&
      result.stats.indexHealth > 80
    ) {
      setTimeout(() => triggerEvent('achievement'), 1000);
    }
  }, [stats, lastActionTimes, triggerEvent]);

  // Reset to initial state
  const handleReset = useCallback(() => {
    setStats(INITIAL_STATS);
    setLastActionTimes({});
    setCreatedAt(new Date().toISOString());
    setLastInteraction(new Date().toISOString());
    localStorage.removeItem(STORAGE_KEY);
    setFeedbackMessage('Anty has been reset!');
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
  }, []);

  // Debug: Set individual stat
  const handleSetStat = useCallback((stat: keyof AntyStats, value: number) => {
    setStats(prev => ({
      ...prev,
      [stat]: value,
    }));
    setLastInteraction(new Date().toISOString());
  }, []);

  // Get recommendations
  const recommendations = getRecommendedActions(stats);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading Anty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Anty Tamagotchi
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your friendly SearchAF mascot needs your care!
          </p>
        </div>

        {/* Feedback Toast */}
        {showFeedback && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-6 py-4 border-l-4 border-blue-500 max-w-md">
              <p className="text-gray-800 dark:text-gray-200 font-medium">
                {feedbackMessage}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Character */}
          <div className="lg:col-span-2 space-y-6">
            {/* Character Display */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <div className="mb-6">
                  <AntyCharacter expression={displayExpression} size={300} />
                </div>

                {/* Expression Status */}
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current Expression
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {displayExpression}
                  </div>
                  {isEventActive && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      (Event Active)
                    </div>
                  )}
                  {isBlinking && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      *blink*
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Actions
                </h2>
                {recommendations.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Recommended:</span>
                    <div className="flex gap-2">
                      {recommendations.map(action => (
                        <span
                          key={action}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <ActionPanel stats={stats} onAction={handleAction} lastActionTimes={lastActionTimes} />
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Stats
              </h2>
              <StatDisplay stats={stats} />
            </div>

            {/* Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                About Anty
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Anty is the friendly mascot of SearchAF, powered by the blazing-fast
                  Antfly vector database.
                </p>
                <p>
                  Take care of Anty by keeping all stats healthy. Stats naturally decay
                  over time, so regular interaction is key!
                </p>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-500">Created:</span>
                      <span className="font-medium">
                        {new Date(createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-500">Last Check:</span>
                      <span className="font-medium">
                        {new Date(lastInteraction).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                💡 Pro Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Feed and rest to keep energy high</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Play to boost happiness</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Train and query to increase knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Optimize and reindex for database health</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Menu (dev only) */}
      <DebugMenu
        stats={stats}
        onReset={handleReset}
        onSetStat={handleSetStat}
        lastInteraction={lastInteraction}
        createdAt={createdAt}
      />
    </div>
  );
}
