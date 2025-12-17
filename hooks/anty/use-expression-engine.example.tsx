/**
 * Example Usage of useExpressionEngine Hook
 *
 * This example demonstrates how to integrate the expression engine
 * with the Anty Tamagotchi component.
 */

'use client';

import { useState } from 'react';
import { useExpressionEngine } from './use-expression-engine';
import { AntyStats } from '@/lib/anty/stat-system';

export function AntyTamagotchiExample() {
  // Example stats state (in real implementation, this would come from useAntyState)
  const [stats, setStats] = useState<AntyStats>({
    energy: 75,
    happiness: 80,
    knowledge: 60,
    indexHealth: 90,
  });

  // Use the expression engine
  const { currentExpression, triggerEvent, isEventActive } = useExpressionEngine(stats);

  // Example interaction handlers
  const handleFeed = () => {
    // Update stats
    setStats((prev) => ({
      ...prev,
      energy: Math.min(100, prev.energy + 20),
      happiness: Math.min(100, prev.happiness + 10),
    }));

    // Trigger feeding event expression
    triggerEvent('feeding');
  };

  const handlePlay = () => {
    // Update stats
    setStats((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      energy: Math.max(0, prev.energy - 10),
    }));

    // Trigger playing event expression
    triggerEvent('playing');
  };

  const handleWork = () => {
    // Update stats
    setStats((prev) => ({
      ...prev,
      knowledge: Math.min(100, prev.knowledge + 10),
      energy: Math.max(0, prev.energy - 5),
    }));

    // Trigger working event expression
    triggerEvent('working');
  };

  const handleRest = () => {
    // Update stats
    setStats((prev) => ({
      ...prev,
      energy: Math.min(100, prev.energy + 30),
    }));

    // Trigger resting event expression
    triggerEvent('resting');
  };

  const handleAchievement = () => {
    // Simulate achievement unlock
    triggerEvent('achievement');
  };

  return (
    <div className="p-8 space-y-4">
      <div className="text-2xl font-bold">Anty Tamagotchi</div>

      {/* Display current expression and event status */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <div>Current Expression: <strong>{currentExpression}</strong></div>
        <div>Event Active: <strong>{isEventActive ? 'Yes' : 'No'}</strong></div>
      </div>

      {/* Display stats */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <div className="font-bold">Stats:</div>
        <div>Energy: {stats.energy}</div>
        <div>Happiness: {stats.happiness}</div>
        <div>Knowledge: {stats.knowledge}</div>
        <div>Index Health: {stats.indexHealth}</div>
      </div>

      {/* Interaction buttons */}
      <div className="space-x-2">
        <button
          onClick={handleFeed}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Feed (Excited 1.5s)
        </button>
        <button
          onClick={handlePlay}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Play (Wink 1s)
        </button>
        <button
          onClick={handleWork}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Work (Thinking 2s)
        </button>
        <button
          onClick={handleRest}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Rest (Sleepy 3s)
        </button>
        <button
          onClick={handleAchievement}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Achievement! (Proud 2s)
        </button>
      </div>

      {/* Expression Flow Explanation */}
      <div className="bg-yellow-50 p-4 rounded-lg text-sm">
        <div className="font-bold mb-2">How it works:</div>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click an interaction button</li>
          <li>Stats update immediately</li>
          <li>Event expression shows for the specified duration</li>
          <li>After timeout, expression reverts to stat-based selection</li>
          <li>If a new event is triggered, it immediately replaces the current event</li>
        </ol>
      </div>
    </div>
  );
}

/**
 * Integration Example with Real Anty Component
 */
export function AntyIntegrationExample() {
  // In a real implementation, you would use:
  // const { stats, setStats } = useAntyState();
  // const { currentExpression, triggerEvent, isEventActive } = useExpressionEngine(stats);

  // Then in your component:
  // 1. Pass currentExpression to your AntyCharacter component for rendering
  // 2. Call triggerEvent() in your interaction handlers (feed, play, etc.)
  // 3. Use isEventActive if you need to show special UI during events

  return null; // Placeholder
}
