'use client';

/**
 * Anty V2 Page - Complete Redesign
 *
 * Features:
 * - White background (per Figma 577-193)
 * - Centered Anty character (300px)
 * - Mood hearts below character
 * - 4 circular action buttons at bottom
 * - Simplified mechanics (single mood stat, 2-hour decay)
 */

import { useState, useEffect } from 'react';
import { AntyCharacterExact } from '@/components/anty/anty-character-exact';
import { MoodDisplay } from '@/components/anty/mood-display';
import { ActionButtons } from '@/components/anty/action-buttons';
import { FacesMenu } from '@/components/anty/faces-menu';
import { executeAction, getInitialState } from '@/lib/anty/actions-v2';
import { loadState, saveState, getTimeUntilNextDecay } from '@/lib/anty/storage-v2';
import type { AntyState, ActionName, ExpressionName } from '@/lib/anty/types-v2';

export default function AntyV2Page() {
  const [state, setState] = useState<AntyState>(getInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [showFacesMenu, setShowFacesMenu] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Load state on mount
  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setState(loaded);
    }
    setIsHydrated(true);
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    saveState(state);
  }, [state, isHydrated]);

  // Handle actions
  const handleAction = (action: ActionName) => {
    if (action === 'faces') {
      setShowFacesMenu(true);
      return;
    }

    const result = executeAction(action, state);
    if (result.success) {
      setState(result.state);
      showFeedbackToast(result.message);
    }
  };

  // Handle expression selection from menu
  const handleSelectExpression = (expression: ExpressionName) => {
    setState((prev) => ({
      ...prev,
      currentExpression: expression,
      lastInteraction: new Date().toISOString(),
    }));
    showFeedbackToast(`Expression changed to ${expression}!`);
  };

  // Show feedback toast
  const showFeedbackToast = (message: string) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2500);
  };

  // Get time until next decay
  const timeUntilDecay = isHydrated
    ? getTimeUntilNextDecay(state.lastInteraction)
    : { hours: 0, minutes: 0, totalMinutes: 0 };

  // Show loading during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Anty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Feedback Toast */}
      {showFeedback && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg">
            {feedbackMessage}
          </div>
        </div>
      )}

      {/* Main Container - Centered Layout */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Anty</h1>
            <p className="text-gray-600">Your friendly SearchAF companion</p>
          </div>

          {/* Character - 300px centered */}
          <div className="flex justify-center">
            <AntyCharacterExact
              expression={state.currentExpression}
              size={300}
            />
          </div>

          {/* Mood Hearts - Below character */}
          <div className="flex flex-col items-center space-y-2">
            <MoodDisplay mood={state.mood} />
            <p className="text-sm text-gray-500">
              {state.mood === 0 && 'Anty is very sad...'}
              {state.mood === 1 && 'Anty could use some care'}
              {state.mood === 2 && 'Anty is doing okay'}
              {state.mood === 3 && 'Anty is very happy!'}
            </p>
          </div>

          {/* Action Buttons - 4 circles at bottom */}
          <div className="pt-8">
            <ActionButtons onAction={handleAction} />
          </div>

          {/* Decay Info */}
          <div className="text-center text-xs text-gray-400 pt-4">
            <p>
              Mood decays in {timeUntilDecay.hours}h {timeUntilDecay.minutes}m
            </p>
            <p className="mt-1">
              Next decay: -{state.mood > 0 ? '1' : '0'} heart
            </p>
          </div>
        </div>
      </div>

      {/* Faces Menu Modal */}
      <FacesMenu
        isOpen={showFacesMenu}
        currentExpression={state.currentExpression}
        onSelectExpression={handleSelectExpression}
        onClose={() => setShowFacesMenu(false)}
      />

      {/* Footer Info */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-400">
        <p>Created: {new Date(state.createdAt).toLocaleDateString()}</p>
        <p>Last interaction: {new Date(state.lastInteraction).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
