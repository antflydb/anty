/**
 * Unified Eye Animation System for Anty V3
 *
 * This hook manages all eye animation logic including:
 * - Blink animations (single and double)
 * - Expression-based eye transforms (shocked, idea)
 * - Blink permission system based on current expression
 * - GSAP tween cleanup and state management
 *
 * Extracted from anty-character-v3.tsx to improve maintainability
 * and set the foundation for future gamification features.
 */

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import type { ExpressionName } from './animation-state';

// ===========================
// Section 1: Debug Utilities
// ===========================

/**
 * Debug logging utilities for eye animations
 * Maintains consistent logging format across all eye animation operations
 */
const debugLog = {
  leftEye: (action: string, details?: any) => {
    console.log(`[LEFT EYE] ${action}`, details || '');
  },
  rightEye: (action: string, details?: any) => {
    console.log(`[RIGHT EYE] ${action}`, details || '');
  },
  both: (action: string, details?: any) => {
    console.log(`[BOTH EYES] ${action}`, details || '');
  },
  expression: (from: string, to: string) => {
    console.log(`[EXPRESSION] ${from} → ${to} at ${Date.now()}`);
  },
  gsap: (target: 'left' | 'right' | 'both', action: 'to' | 'set' | 'kill', props?: any) => {
    const targetLabel = target === 'both' ? '[BOTH EYES]' : target === 'left' ? '[LEFT EYE]' : '[RIGHT EYE]';
    console.log(`${targetLabel} GSAP.${action}`, props || '');
  }
};

// ===========================
// Section 2: Hook Interface
// ===========================

interface UseEyeAnimationsProps {
  leftEyeRef: React.RefObject<HTMLDivElement>;
  rightEyeRef: React.RefObject<HTMLDivElement>;
  expression: ExpressionName;
  isOff: boolean;
}

interface UseEyeAnimationsReturn {
  performBlink: () => void;
  performDoubleBlink: () => void;
  allowBlinkingRef: React.MutableRefObject<boolean>;
}

// ===========================
// Section 3: Main Hook
// ===========================

/**
 * Custom hook for managing all eye animation logic
 *
 * @param leftEyeRef - Ref to the left eye DOM element
 * @param rightEyeRef - Ref to the right eye DOM element
 * @param expression - Current expression state
 * @param isOff - Special state that disables all eye animations
 * @returns Object containing blink functions and permission ref
 */
export function useEyeAnimations({
  leftEyeRef,
  rightEyeRef,
  expression,
  isOff,
}: UseEyeAnimationsProps): UseEyeAnimationsReturn {

  // ===========================
  // 3.1: Refs and State
  // ===========================

  const allowBlinkingRef = useRef<boolean>(true);
  const prevExpressionRef = useRef<ExpressionName>('idle');

  // ===========================
  // 3.2: Blink Functions
  // ===========================

  /**
   * Performs a single blink animation
   * Eyes collapse vertically (scaleY: 0.05) then expand back to normal
   * Duration: 0.1s close + 0.15s open
   */
  const performBlink = useCallback(() => {
    // TODO: Implementation in Phase 2
  }, []);

  /**
   * Performs a double blink animation
   * Two quick blinks in succession with a 0.1s pause between them
   */
  const performDoubleBlink = useCallback(() => {
    // TODO: Implementation in Phase 2
  }, []);

  // ===========================
  // 3.3: Expression-Based Blink Permission
  // ===========================

  // TODO: Implementation in Phase 3

  // ===========================
  // 3.4: Expression Transition Animations
  // ===========================

  // TODO: Implementation in Phase 4

  // ===========================
  // 3.5: Return Interface
  // ===========================

  return {
    performBlink,
    performDoubleBlink,
    allowBlinkingRef,
  };
}
