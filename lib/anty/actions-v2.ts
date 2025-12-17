/**
 * Anty V2 - Simplified Action System
 *
 * 4 actions, each adds +1 mood (max 3)
 * - Chat: Talk with Anty
 * - Faces: Open expression menu (handled in UI)
 * - Game: Play a game
 * - Eat: Feed candy
 */

import type { AntyState, ActionResult, ActionName } from './types-v2';
import { getExpressionByMood } from './expressions-v2';

/**
 * Messages for each action
 */
const ACTION_MESSAGES: Record<ActionName, string[]> = {
  chat: [
    'Anty enjoyed the conversation!',
    'That was a nice chat!',
    'Anty feels more connected!',
  ],
  faces: [
    'Expression menu opened!',
  ],
  game: [
    'What a fun game!',
    'Anty loves playing!',
    'Game time is the best!',
  ],
  eat: [
    'Yummy candy! Anty is satisfied!',
    'Delicious! Anty wants more!',
    'Nom nom nom!',
  ],
};

/**
 * Get a random message for an action
 */
function getRandomMessage(action: ActionName): string {
  const messages = ACTION_MESSAGES[action];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Execute an action and update mood
 */
export function executeAction(
  action: ActionName,
  currentState: AntyState
): ActionResult {
  // Faces is handled in UI, not here
  if (action === 'faces') {
    return {
      success: true,
      state: currentState,
      message: getRandomMessage(action),
      mood: currentState.mood,
    };
  }

  // Calculate new mood (+1, max 3)
  const newMood = Math.min(currentState.mood + 1, 3);

  // Create updated state
  const newState: AntyState = {
    ...currentState,
    mood: newMood,
    lastInteraction: new Date().toISOString(),
    // Auto-update expression based on new mood
    currentExpression: getExpressionByMood(newMood),
  };

  return {
    success: true,
    state: newState,
    message: getRandomMessage(action),
    mood: newMood,
  };
}

/**
 * Get initial state for new Anty
 */
export function getInitialState(): AntyState {
  return {
    mood: 2, // Start with 2 hearts (idle expression)
    lastInteraction: new Date().toISOString(),
    currentExpression: 'idle',
    createdAt: new Date().toISOString(),
  };
}
