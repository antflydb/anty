import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StateMachine } from '../state-machine';
import { AnimationState } from '../types';

describe('StateMachine', () => {
  let stateMachine: StateMachine;

  beforeEach(() => {
    stateMachine = new StateMachine();
  });

  describe('Initial State', () => {
    it('should start in IDLE state', () => {
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should have null as previous state initially', () => {
      expect(stateMachine.getPreviousState()).toBe(null);
    });

    it('should have initial state recorded in history', () => {
      const history = stateMachine.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].state).toBe(AnimationState.IDLE);
    });
  });

  describe('Valid Transitions', () => {
    it('should allow IDLE -> EMOTION transition', () => {
      const result = stateMachine.transition(AnimationState.EMOTION);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.EMOTION);
      expect(stateMachine.getPreviousState()).toBe(AnimationState.IDLE);
    });

    it('should allow EMOTION -> IDLE transition with force flag', () => {
      stateMachine.transition(AnimationState.EMOTION);
      // IDLE has lower priority than EMOTION, so force is needed
      const result = stateMachine.transition(AnimationState.IDLE, true);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should reject EMOTION -> IDLE transition without force (priority check)', () => {
      stateMachine.transition(AnimationState.EMOTION);
      // IDLE has lower priority (1) than EMOTION (4), so this should fail
      const result = stateMachine.transition(AnimationState.IDLE);
      expect(result).toBe(false);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.EMOTION);
    });

    it('should allow IDLE -> TRANSITION transition', () => {
      const result = stateMachine.transition(AnimationState.TRANSITION);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.TRANSITION);
    });

    it('should allow IDLE -> MORPH transition', () => {
      const result = stateMachine.transition(AnimationState.MORPH);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.MORPH);
    });

    it('should allow IDLE -> INTERACTION transition', () => {
      const result = stateMachine.transition(AnimationState.INTERACTION);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.INTERACTION);
    });

    it('should allow IDLE -> OFF transition with force flag', () => {
      // OFF has lower priority (0) than IDLE (1), so force is needed
      const result = stateMachine.transition(AnimationState.OFF, true);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.OFF);
    });

    it('should reject IDLE -> OFF transition without force (priority check)', () => {
      // OFF has lower priority (0) than IDLE (1), so this should fail
      const result = stateMachine.transition(AnimationState.OFF);
      expect(result).toBe(false);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should allow OFF -> IDLE transition', () => {
      stateMachine.transition(AnimationState.OFF, true); // Force to get to OFF state
      const result = stateMachine.transition(AnimationState.IDLE);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should allow self-transitions (IDLE -> IDLE)', () => {
      const result = stateMachine.transition(AnimationState.IDLE);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should allow EMOTION -> EMOTION transition', () => {
      stateMachine.transition(AnimationState.EMOTION);
      const result = stateMachine.transition(AnimationState.EMOTION);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.EMOTION);
    });
  });

  describe('Invalid Transitions', () => {
    it('should reject EMOTION -> INTERACTION transition', () => {
      stateMachine.transition(AnimationState.EMOTION);
      const result = stateMachine.transition(AnimationState.INTERACTION);
      expect(result).toBe(false);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.EMOTION);
    });
  });

  describe('State History', () => {
    it('should track state changes in history', () => {
      stateMachine.transition(AnimationState.EMOTION);
      stateMachine.transition(AnimationState.IDLE, true); // Force needed (lower priority)
      stateMachine.transition(AnimationState.TRANSITION);

      const history = stateMachine.getHistory();
      expect(history.length).toBe(4); // Initial IDLE + 3 transitions
      expect(history[0].state).toBe(AnimationState.IDLE);
      expect(history[1].state).toBe(AnimationState.EMOTION);
      expect(history[2].state).toBe(AnimationState.IDLE);
      expect(history[3].state).toBe(AnimationState.TRANSITION);
    });

    it('should include timestamps in history', () => {
      const beforeTime = Date.now();
      stateMachine.transition(AnimationState.EMOTION);
      const afterTime = Date.now();

      const history = stateMachine.getHistory();
      const lastEntry = history[history.length - 1];
      expect(lastEntry.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(lastEntry.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should limit history size to maxHistorySize (50)', () => {
      // Make many transitions to exceed the max history size
      // Use IDLE -> EMOTION (valid) and EMOTION -> IDLE with force
      for (let i = 0; i < 60; i++) {
        if (stateMachine.getCurrentState() === AnimationState.IDLE) {
          stateMachine.transition(AnimationState.EMOTION);
        } else {
          stateMachine.transition(AnimationState.IDLE, true); // Force needed for lower priority
        }
      }

      const history = stateMachine.getHistory();
      expect(history.length).toBe(50);
    });

    it('should return recent history with getRecentHistory', () => {
      stateMachine.transition(AnimationState.EMOTION);
      stateMachine.transition(AnimationState.IDLE, true); // Force needed
      stateMachine.transition(AnimationState.TRANSITION);
      stateMachine.transition(AnimationState.IDLE, true); // Force needed

      // History: [IDLE(init), EMOTION, IDLE, TRANSITION, IDLE]
      // Last 3: [IDLE, TRANSITION, IDLE]
      const recent = stateMachine.getRecentHistory(3);
      expect(recent.length).toBe(3);
      expect(recent[0].state).toBe(AnimationState.IDLE);      // After EMOTION -> IDLE
      expect(recent[1].state).toBe(AnimationState.TRANSITION); // After IDLE -> TRANSITION
      expect(recent[2].state).toBe(AnimationState.IDLE);       // After TRANSITION -> IDLE
    });
  });

  describe('Priority-Based Interruption', () => {
    it('should allow higher priority to interrupt lower priority', () => {
      // IDLE (priority 1) -> EMOTION (priority 4) should work
      const result = stateMachine.transition(AnimationState.EMOTION);
      expect(result).toBe(true);
    });

    it('should allow equal priority to interrupt', () => {
      // Go to EMOTION first
      stateMachine.transition(AnimationState.EMOTION);
      // EMOTION (priority 4) -> EMOTION (priority 4) should work
      const result = stateMachine.transition(AnimationState.EMOTION);
      expect(result).toBe(true);
    });

    it('should reject lower priority interrupting higher priority', () => {
      // Go to EMOTION first (priority 4)
      stateMachine.transition(AnimationState.EMOTION);
      // EMOTION (priority 4) -> INTERACTION (priority 3) should fail due to priority
      // Note: This transition is explicitly disallowed in the rules (allowed: false)
      const result = stateMachine.transition(AnimationState.INTERACTION);
      expect(result).toBe(false);
    });

    it('should allow force flag to override priority check', () => {
      // Go to EMOTION first (priority 4)
      stateMachine.transition(AnimationState.EMOTION);
      // Force transition to IDLE (lower priority) should work
      const result = stateMachine.transition(AnimationState.IDLE, true);
      expect(result).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should return correct priority values for states', () => {
      expect(stateMachine.getPriority(AnimationState.OFF)).toBe(0);
      expect(stateMachine.getPriority(AnimationState.IDLE)).toBe(1);
      expect(stateMachine.getPriority(AnimationState.TRANSITION)).toBe(2);
      expect(stateMachine.getPriority(AnimationState.MORPH)).toBe(2);
      expect(stateMachine.getPriority(AnimationState.INTERACTION)).toBe(3);
      expect(stateMachine.getPriority(AnimationState.EMOTION)).toBe(4);
    });
  });

  describe('canTransition', () => {
    it('should return true for valid transitions', () => {
      expect(stateMachine.canTransition(AnimationState.IDLE, AnimationState.EMOTION)).toBe(true);
      expect(stateMachine.canTransition(AnimationState.EMOTION, AnimationState.IDLE)).toBe(true);
      expect(stateMachine.canTransition(AnimationState.OFF, AnimationState.IDLE)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(stateMachine.canTransition(AnimationState.EMOTION, AnimationState.INTERACTION)).toBe(false);
    });
  });

  describe('canInterrupt', () => {
    it('should allow interrupt when target priority is higher', () => {
      // Start in IDLE (priority 1)
      expect(stateMachine.canInterrupt(AnimationState.EMOTION)).toBe(true); // priority 4
    });

    it('should allow interrupt when target priority is equal', () => {
      // Start in IDLE (priority 1)
      expect(stateMachine.canInterrupt(AnimationState.IDLE)).toBe(true);
    });

    it('should reject interrupt when target priority is lower', () => {
      // Go to EMOTION (priority 4)
      stateMachine.transition(AnimationState.EMOTION);
      // Try to interrupt with IDLE (priority 1)
      expect(stateMachine.canInterrupt(AnimationState.IDLE)).toBe(false);
    });

    it('should allow interrupt with force flag regardless of priority', () => {
      // Go to EMOTION (priority 4)
      stateMachine.transition(AnimationState.EMOTION);
      // Force should always return true
      expect(stateMachine.canInterrupt(AnimationState.IDLE, true)).toBe(true);
      expect(stateMachine.canInterrupt(AnimationState.OFF, true)).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset state machine to IDLE', () => {
      stateMachine.transition(AnimationState.EMOTION);
      stateMachine.reset();
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should set previous state correctly after reset', () => {
      stateMachine.transition(AnimationState.EMOTION);
      stateMachine.reset();
      expect(stateMachine.getPreviousState()).toBe(AnimationState.EMOTION);
    });

    it('should record reset in history', () => {
      stateMachine.transition(AnimationState.EMOTION);
      stateMachine.reset();

      const history = stateMachine.getHistory();
      expect(history[history.length - 1].state).toBe(AnimationState.IDLE);
    });
  });

  describe('getDebugInfo', () => {
    it('should return comprehensive debug information', () => {
      stateMachine.transition(AnimationState.EMOTION);
      const debugInfo = stateMachine.getDebugInfo();

      expect(debugInfo.currentState).toBe(AnimationState.EMOTION);
      expect(debugInfo.previousState).toBe(AnimationState.IDLE);
      expect(debugInfo.currentPriority).toBe(4);
      expect(debugInfo.historySize).toBe(2);
      expect(debugInfo.recentHistory).toHaveLength(2);
    });

    it('should include time ago strings in recent history', () => {
      stateMachine.transition(AnimationState.EMOTION);
      const debugInfo = stateMachine.getDebugInfo();

      debugInfo.recentHistory.forEach(entry => {
        expect(entry.ago).toMatch(/\d+\.\d+s ago/);
      });
    });
  });

  describe('validateRules (static)', () => {
    it('should validate that all state transitions have rules defined', () => {
      // Suppress console.error during this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const isValid = StateMachine.validateRules();
      expect(isValid).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('Logging', () => {
    it('should not log when logging is disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const sm = new StateMachine(false);
      sm.transition(AnimationState.EMOTION);
      sm.transition(AnimationState.IDLE);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });

  describe('Complex State Sequences', () => {
    it('should handle typical search flow: IDLE -> MORPH -> INTERACTION -> MORPH -> IDLE', () => {
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);

      expect(stateMachine.transition(AnimationState.MORPH)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.MORPH);

      expect(stateMachine.transition(AnimationState.INTERACTION)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.INTERACTION);

      // INTERACTION (priority 3) -> MORPH (priority 2) needs force
      expect(stateMachine.transition(AnimationState.MORPH, true)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.MORPH);

      // MORPH (priority 2) -> IDLE (priority 1) needs force
      expect(stateMachine.transition(AnimationState.IDLE, true)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should handle emotion sequence: IDLE -> EMOTION -> EMOTION -> IDLE', () => {
      expect(stateMachine.transition(AnimationState.EMOTION)).toBe(true);
      expect(stateMachine.transition(AnimationState.EMOTION)).toBe(true);
      expect(stateMachine.transition(AnimationState.IDLE, true)).toBe(true); // Force needed due to priority
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should handle power cycle: IDLE -> OFF -> IDLE', () => {
      // IDLE (priority 1) -> OFF (priority 0) needs force
      expect(stateMachine.transition(AnimationState.OFF, true)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.OFF);

      expect(stateMachine.transition(AnimationState.IDLE)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(AnimationState.IDLE);
    });

    it('should demonstrate priority escalation: IDLE -> MORPH -> INTERACTION -> EMOTION', () => {
      // Each step goes to equal or higher priority, so no force needed
      expect(stateMachine.transition(AnimationState.MORPH)).toBe(true);        // 1 -> 2
      expect(stateMachine.transition(AnimationState.INTERACTION)).toBe(true);  // 2 -> 3
      expect(stateMachine.transition(AnimationState.EMOTION)).toBe(true);      // 3 -> 4
      expect(stateMachine.getCurrentState()).toBe(AnimationState.EMOTION);
    });
  });
});
