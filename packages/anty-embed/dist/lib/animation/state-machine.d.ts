/**
 * Animation State Machine
 *
 * Validates state transitions and enforces state transition rules.
 * Prevents invalid transitions and provides debugging information.
 */
import { AnimationState } from './types';
export declare class StateMachine {
    private currentState;
    private previousState;
    private stateHistory;
    private enableLogging;
    private maxHistorySize;
    constructor(enableLogging?: boolean);
    /**
     * Get current state
     */
    getCurrentState(): AnimationState;
    /**
     * Get previous state
     */
    getPreviousState(): AnimationState | null;
    /**
     * Check if a transition is allowed
     */
    canTransition(from: AnimationState, to: AnimationState): boolean;
    /**
     * Get priority for a state
     */
    getPriority(state: AnimationState): number;
    /**
     * Check if target state can interrupt current state based on priority
     */
    canInterrupt(targetState: AnimationState, force?: boolean): boolean;
    /**
     * Attempt to transition to a new state
     * Returns true if successful, false if invalid
     */
    transition(to: AnimationState, force?: boolean): boolean;
    /**
     * Record state change in history
     */
    private recordStateChange;
    /**
     * Get state history
     */
    getHistory(): Array<{
        state: AnimationState;
        timestamp: number;
    }>;
    /**
     * Get recent state changes (last N)
     */
    getRecentHistory(count?: number): Array<{
        state: AnimationState;
        timestamp: number;
    }>;
    /**
     * Reset state machine to idle
     */
    reset(): void;
    /**
     * Get debug info
     */
    getDebugInfo(): {
        currentState: AnimationState;
        previousState: AnimationState | null;
        currentPriority: number;
        historySize: number;
        recentHistory: Array<{
            state: AnimationState;
            timestamp: number;
            ago: string;
        }>;
    };
    /**
     * Validate transition rules (for testing)
     */
    static validateRules(): boolean;
}
