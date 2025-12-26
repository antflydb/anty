/**
 * Simple Animation State Machine
 *
 * Minimal state machine (~40 lines) replacing the 254-line over-engineered version.
 * Uses priority-based transitions with optional force override.
 */

/**
 * Animation states - simplified from enum to string literal type
 */
export type AnimationStateType = 'off' | 'idle' | 'emotion' | 'transition' | 'morph';

/**
 * State priorities - higher priority can interrupt lower priority
 */
const STATE_PRIORITY: Record<AnimationStateType, number> = {
  off: 0,
  idle: 1,
  transition: 2,
  morph: 2,
  emotion: 3,
};

/**
 * Simple state machine for animation control
 */
export class SimpleStateMachine {
  private state: AnimationStateType = 'idle';
  private enableLogging: boolean;

  constructor(enableLogging = false) {
    this.enableLogging = enableLogging;
  }

  /**
   * Get current state
   */
  getState(): AnimationStateType {
    return this.state;
  }

  /**
   * Check if transition is allowed based on priority
   */
  canTransition(to: AnimationStateType, force = false): boolean {
    if (force) return true;
    return STATE_PRIORITY[to] >= STATE_PRIORITY[this.state];
  }

  /**
   * Transition to a new state
   * Returns true if successful, false if blocked by priority
   */
  transition(to: AnimationStateType, force = false): boolean {
    if (!this.canTransition(to, force)) {
      if (this.enableLogging) {
        console.warn(`[SimpleStateMachine] Blocked: ${this.state} -> ${to}`);
      }
      return false;
    }

    if (this.enableLogging) {
      console.log(`[SimpleStateMachine] ${this.state} -> ${to}`);
    }

    this.state = to;
    return true;
  }

  /**
   * Reset to idle state
   */
  reset(): void {
    this.state = 'idle';
    if (this.enableLogging) {
      console.log('[SimpleStateMachine] Reset to idle');
    }
  }
}
