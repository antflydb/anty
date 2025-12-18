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
    // Don't blink if not allowed (ref is instantly updated, unlike state)
    if (!allowBlinkingRef.current) {
      debugLog.both('Blink blocked - not allowed');
      return;
    }

    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!leftEye || !rightEye) {
      debugLog.both('Blink blocked - refs not available');
      return;
    }

    debugLog.both('Blink starting');

    // Create timeline for blink animation
    const blinkTl = gsap.timeline({
      onComplete: () => debugLog.both('Blink complete'),
    });

    // Close eyes (collapse to horizontal line)
    blinkTl.to([leftEye, rightEye], {
      scaleY: 0.05, // Almost flat horizontal line
      duration: 0.1, // 100ms to close
      ease: 'power2.in',
    });

    // Open eyes (expand back to normal)
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Back to normal
      duration: 0.15, // 150ms to open
      ease: 'power2.out',
    });
  }, [leftEyeRef, rightEyeRef]);

  /**
   * Performs a double blink animation
   * Two quick blinks in succession with a 0.1s pause between them
   */
  const performDoubleBlink = useCallback(() => {
    // Don't blink if not allowed (ref is instantly updated, unlike state)
    if (!allowBlinkingRef.current) {
      debugLog.both('Double blink blocked - not allowed');
      return;
    }

    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!leftEye || !rightEye) {
      debugLog.both('Double blink blocked - refs not available');
      return;
    }

    debugLog.both('Double blink starting');

    // Create timeline for double blink
    const blinkTl = gsap.timeline({
      onComplete: () => debugLog.both('Double blink complete'),
    });

    // First blink
    blinkTl.to([leftEye, rightEye], {
      scaleY: 0.05, // Collapse to line
      duration: 0.08, // Slightly faster
      ease: 'power2.in',
    });
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Back to normal
      duration: 0.12,
      ease: 'power2.out',
    });

    // Short pause between blinks
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Stay at normal
      duration: 0.1, // 100ms pause
    });

    // Second blink
    blinkTl.to([leftEye, rightEye], {
      scaleY: 0.05, // Collapse to line
      duration: 0.08,
      ease: 'power2.in',
    });
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Back to normal
      duration: 0.12,
      ease: 'power2.out',
    });
  }, [leftEyeRef, rightEyeRef]);

  // ===========================
  // 3.3: Expression-Based Blink Permission
  // ===========================

  /**
   * Manage blink permission based on current expression
   * Only allow blinking during idle - disable for all other expressions
   */
  useEffect(() => {
    if (expression === 'idle' && !isOff) {
      // Delay re-enabling blinking to allow eye transitions to complete
      setTimeout(() => {
        allowBlinkingRef.current = true;
      }, 300);
    } else {
      // Disable blinking for angry, sad, off, and all other expressions
      allowBlinkingRef.current = false;
    }
  }, [expression, isOff]);

  // ===========================
  // 3.4: Expression Transition Animations
  // ===========================

  /**
   * Handle expression-specific eye animations (shocked, idea, resets)
   * Uses GSAP transforms on idle eyes without triggering state re-renders
   */
  useEffect(() => {
    const prevExpression = prevExpressionRef.current;
    prevExpressionRef.current = expression;

    debugLog.expression(prevExpression, expression);

    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    // Kill any ongoing blink animations when expression changes away from idle
    // BUT: Don't kill/reset for shocked or idea, as they use GSAP transforms on the idle eyes
    if (expression !== 'idle' && expression !== 'shocked' && expression !== 'idea' && leftEye && rightEye) {
      gsap.killTweensOf([leftEye, rightEye]);
      // Reset eyes to default state immediately
      gsap.set([leftEye, rightEye], {
        scaleY: 1
      });
    }

    // Set shocked eyes when expression changes to 'shocked'
    if (expression === 'shocked' && leftEye && rightEye) {
      // Don't call setIsShocked - it causes a re-render that wipes out GSAP transforms!

      // Force shocked state immediately with GSAP to override any ongoing transitions
      debugLog.gsap('both', 'kill', 'Clearing tweens for shocked');
      gsap.killTweensOf([leftEye, rightEye]);

      debugLog.gsap('both', 'to', { scaleY: 1.4, scaleX: 1.4 });
      // Animate eyes to shocked (grow bigger)
      gsap.to([leftEye, rightEye], {
        scaleY: 1.4,
        scaleX: 1.4,
        duration: 0.1,
        ease: 'power2.out',
        onStart: () => debugLog.both('Shocked animation started'),
        onComplete: () => debugLog.both('Shocked animation complete'),
      });
    } else if (expression === 'idle' && (prevExpression === 'shocked' || prevExpression === 'idea') && leftEye && rightEye) {
      // Reset when transitioning FROM shocked/idea back to idle
      // Use a very short animation instead of instant set to avoid visible flashing
      debugLog.gsap('both', 'kill', 'Resetting from shocked/idea to idle');
      gsap.killTweensOf([leftEye, rightEye]);

      debugLog.gsap('both', 'to', { scaleY: 1, scaleX: 1, y: 0, duration: 0.05 });
      gsap.to([leftEye, rightEye], {
        scaleY: 1,
        scaleX: 1,
        y: 0,
        duration: 0.05,  // 50ms - smooth but nearly instant
        ease: 'power2.out',
        onComplete: () => debugLog.both('Reset to idle complete'),
      });
    }

    // Set idea eyes when expression changes to 'idea'
    if (expression === 'idea' && leftEye && rightEye) {
      // Don't call setIsIdea - it causes a re-render that wipes out GSAP transforms!

      // Force idea state immediately with GSAP to override any ongoing transitions
      debugLog.gsap('both', 'kill', 'Clearing tweens for idea');
      gsap.killTweensOf([leftEye, rightEye]);

      debugLog.gsap('both', 'set', { scaleY: 1, scaleX: 1, y: 0, rotation: 0 });
      // Reset to baseline first to clear any previous transforms
      gsap.set([leftEye, rightEye], {
        scaleY: 1,
        scaleX: 1,
        y: 0,
        rotation: 0,
      });

      debugLog.gsap('both', 'to', { scaleY: 1.15, scaleX: 1.15, y: -8 });
      // Then apply idea transform (eyes look up and grow slightly)
      gsap.to([leftEye, rightEye], {
        scaleY: 1.15,
        scaleX: 1.15,
        y: -8,
        duration: 0.1,
        ease: 'power2.out',
        onStart: () => debugLog.both('Idea animation started'),
        onComplete: () => debugLog.both('Idea animation complete'),
      });
    }
  }, [expression, leftEyeRef, rightEyeRef]);

  // ===========================
  // 3.5: Return Interface
  // ===========================

  return {
    performBlink,
    performDoubleBlink,
    allowBlinkingRef,
  };
}
