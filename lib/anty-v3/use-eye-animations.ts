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
// Section 1: Animation Constants
// ===========================

/**
 * SVG Path data for morphing between eye shapes
 */
const EYE_PATHS = {
  // Idle eye - tall vertical pill (23.29 × 55.65)
  IDLE: "M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z",
  // Looking eye - shorter, wider pill (26 × 43)
  LOOKING: "M8.24203e-05 29.9999C3.6901e-05 37.1796 5.82038 43 13.0001 42.9999C20.1798 42.9999 26 37.1796 26 30V12.9999C26 5.82023 20.1798 -1.58161e-06 13.0001 -1.58161e-06C5.82049 -1.58161e-06 0.000235718 5.82023 0.0001902 12.9999L8.24203e-05 29.9999Z",
} as const;

/**
 * Timing constants for eye animations
 * All durations in seconds, scales are multipliers
 */
const ANIMATION_TIMING = {
  // Blink animations
  BLINK_CLOSE_DURATION: 0.1,      // 100ms to close eyes
  BLINK_OPEN_DURATION: 0.15,      // 150ms to open eyes
  BLINK_SCALE_CLOSED: 0.05,       // Nearly flat horizontal line
  DOUBLE_BLINK_CLOSE_DURATION: 0.08,   // Slightly faster for double blink
  DOUBLE_BLINK_OPEN_DURATION: 0.12,
  DOUBLE_BLINK_PAUSE: 0.1,        // 100ms pause between blinks

  // Expression animations
  SHOCKED_SCALE: 1.4,             // Eyes grow to 1.4x
  SHOCKED_DURATION: 0.1,          // 100ms animation
  IDEA_SCALE: 1.15,               // Eyes grow to 1.15x
  IDEA_Y_OFFSET: -8,              // Eyes move up 8px
  IDEA_DURATION: 0.1,             // 100ms animation
  RESET_DURATION: 0.05,           // 50ms to reset (smooth but nearly instant)

  // Look left/right animations
  LOOK_HEIGHT: 33,                // Looking eye height (slightly bigger)
  LOOK_WIDTH: 20,                 // Looking eye width (slightly bigger)
  IDLE_HEIGHT: 44.52,             // Idle eye height
  IDLE_WIDTH: 18.63,              // Idle eye width
  LOOK_X_OFFSET: 12,              // Move eyes 12px left or right
  LOOK_BUNCH: 4,                  // Additional movement to bunch eyes closer together
  LOOK_DURATION: 0.25,            // 250ms animation for smoother morph
  LOOK_CROSSFADE_DELAY: 0.05,     // 50ms delay before starting cross-fade

  // Blink permission delays
  BLINK_RENABLE_DELAY: 300,       // 300ms delay before re-enabling blinking after returning to idle
} as const;

// ===========================
// Section 2: Debug Utilities
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
  leftEyeRef: React.RefObject<HTMLDivElement | null>;
  rightEyeRef: React.RefObject<HTMLDivElement | null>;
  leftEyePathRef: React.RefObject<SVGPathElement | null>;
  rightEyePathRef: React.RefObject<SVGPathElement | null>;
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
  leftEyePathRef,
  rightEyePathRef,
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
      scaleY: ANIMATION_TIMING.BLINK_SCALE_CLOSED,
      duration: ANIMATION_TIMING.BLINK_CLOSE_DURATION,
      ease: 'power2.in',
    });

    // Open eyes (expand back to normal)
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Back to normal
      duration: ANIMATION_TIMING.BLINK_OPEN_DURATION,
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
      scaleY: ANIMATION_TIMING.BLINK_SCALE_CLOSED,
      duration: ANIMATION_TIMING.DOUBLE_BLINK_CLOSE_DURATION,
      ease: 'power2.in',
    });
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Back to normal
      duration: ANIMATION_TIMING.DOUBLE_BLINK_OPEN_DURATION,
      ease: 'power2.out',
    });

    // Short pause between blinks
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Stay at normal
      duration: ANIMATION_TIMING.DOUBLE_BLINK_PAUSE,
    });

    // Second blink
    blinkTl.to([leftEye, rightEye], {
      scaleY: ANIMATION_TIMING.BLINK_SCALE_CLOSED,
      duration: ANIMATION_TIMING.DOUBLE_BLINK_CLOSE_DURATION,
      ease: 'power2.in',
    });
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Back to normal
      duration: ANIMATION_TIMING.DOUBLE_BLINK_OPEN_DURATION,
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
      }, ANIMATION_TIMING.BLINK_RENABLE_DELAY);
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
    // BUT: Don't kill/reset for shocked, idea, look-left, look-right, nod, or headshake, as they use GSAP transforms on the idle eyes
    if (
      expression !== 'idle' &&
      expression !== 'shocked' &&
      expression !== 'idea' &&
      expression !== 'look-left' &&
      expression !== 'look-right' &&
      expression !== 'nod' &&
      expression !== 'headshake' &&
      leftEye &&
      rightEye
    ) {
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

      debugLog.gsap('both', 'to', { scaleY: ANIMATION_TIMING.SHOCKED_SCALE, scaleX: ANIMATION_TIMING.SHOCKED_SCALE });
      // Animate eyes to shocked (grow bigger)
      gsap.to([leftEye, rightEye], {
        scaleY: ANIMATION_TIMING.SHOCKED_SCALE,
        scaleX: ANIMATION_TIMING.SHOCKED_SCALE,
        duration: ANIMATION_TIMING.SHOCKED_DURATION,
        ease: 'power2.out',
        onStart: () => debugLog.both('Shocked animation started'),
        onComplete: () => debugLog.both('Shocked animation complete'),
      });
    } else if (
      expression === 'idle' &&
      (prevExpression === 'shocked' || prevExpression === 'idea' || prevExpression === 'look-left' || prevExpression === 'look-right' || prevExpression === 'nod' || prevExpression === 'headshake') &&
      leftEye &&
      rightEye
    ) {
      // Reset when transitioning FROM shocked/idea/look-left/look-right/nod/headshake back to idle
      // Use a very short animation instead of instant set to avoid visible flashing
      const leftPath = leftEyePathRef.current;
      const rightPath = rightEyePathRef.current;

      debugLog.gsap('both', 'kill', `Resetting from ${prevExpression} to idle`);
      gsap.killTweensOf([leftEye, rightEye]);
      if (leftPath && rightPath) {
        gsap.killTweensOf([leftPath, rightPath]);
      }

      debugLog.gsap('both', 'to', { height: ANIMATION_TIMING.IDLE_HEIGHT, width: ANIMATION_TIMING.IDLE_WIDTH, scaleY: 1, scaleX: 1, x: 0, y: 0, duration: ANIMATION_TIMING.RESET_DURATION });
      gsap.to([leftEye, rightEye], {
        height: ANIMATION_TIMING.IDLE_HEIGHT,
        width: ANIMATION_TIMING.IDLE_WIDTH,
        scaleY: 1,
        scaleX: 1,
        x: 0,
        y: 0,
        duration: ANIMATION_TIMING.RESET_DURATION,
        ease: 'power2.out',
        onComplete: () => debugLog.both('Reset to idle complete'),
      });

      // Morph paths back to IDLE if coming from looking state
      if ((prevExpression === 'look-left' || prevExpression === 'look-right') && leftPath && rightPath) {
        gsap.to([leftPath, rightPath], {
          attr: { d: EYE_PATHS.IDLE },
          duration: ANIMATION_TIMING.RESET_DURATION,
          ease: 'power2.out',
        });
      }
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

      debugLog.gsap('both', 'to', { scaleY: ANIMATION_TIMING.IDEA_SCALE, scaleX: ANIMATION_TIMING.IDEA_SCALE, y: ANIMATION_TIMING.IDEA_Y_OFFSET });
      // Then apply idea transform (eyes look up and grow slightly)
      gsap.to([leftEye, rightEye], {
        scaleY: ANIMATION_TIMING.IDEA_SCALE,
        scaleX: ANIMATION_TIMING.IDEA_SCALE,
        y: ANIMATION_TIMING.IDEA_Y_OFFSET,
        duration: ANIMATION_TIMING.IDEA_DURATION,
        ease: 'power2.out',
        onStart: () => debugLog.both('Idea animation started'),
        onComplete: () => debugLog.both('Idea animation complete'),
      });
    }

    // Look left animation - morph SVG path and move left
    if (expression === 'look-left' && leftEye && rightEye) {
      const leftPath = leftEyePathRef.current;
      const rightPath = rightEyePathRef.current;

      if (!leftPath || !rightPath) return;

      debugLog.gsap('both', 'kill', 'Clearing tweens for look-left');
      gsap.killTweensOf([leftEye, rightEye, leftPath, rightPath]);

      debugLog.gsap('both', 'to', { 'path-morph': 'IDLE→LOOKING', 'left-x': -ANIMATION_TIMING.LOOK_X_OFFSET, 'right-x': -(ANIMATION_TIMING.LOOK_X_OFFSET - ANIMATION_TIMING.LOOK_BUNCH) });

      // Morph SVG paths from IDLE to LOOKING shape
      gsap.to([leftPath, rightPath], {
        attr: { d: EYE_PATHS.LOOKING },
        duration: ANIMATION_TIMING.LOOK_DURATION,
        ease: 'power2.out',
      });

      // Animate container dimensions to match looking eye size
      gsap.to([leftEye, rightEye], {
        height: ANIMATION_TIMING.LOOK_HEIGHT,
        width: ANIMATION_TIMING.LOOK_WIDTH,
        duration: ANIMATION_TIMING.LOOK_DURATION,
        ease: 'power2.out',
      });

      // Animate left eye position (full movement)
      gsap.to(leftEye, {
        x: -ANIMATION_TIMING.LOOK_X_OFFSET,
        duration: ANIMATION_TIMING.LOOK_DURATION,
        ease: 'power2.out',
        onStart: () => debugLog.leftEye('Look left animation started'),
      });

      // Animate right eye position (bunches closer - moves less left)
      gsap.to(rightEye, {
        x: -(ANIMATION_TIMING.LOOK_X_OFFSET - ANIMATION_TIMING.LOOK_BUNCH),
        duration: ANIMATION_TIMING.LOOK_DURATION,
        ease: 'power2.out',
        onStart: () => debugLog.rightEye('Look left animation started (bunched closer)'),
        onComplete: () => debugLog.both('Look left animation complete'),
      });
    }

    // Look right animation - morph SVG path and move right
    if (expression === 'look-right' && leftEye && rightEye) {
      const leftPath = leftEyePathRef.current;
      const rightPath = rightEyePathRef.current;

      if (!leftPath || !rightPath) return;

      debugLog.gsap('both', 'kill', 'Clearing tweens for look-right');
      gsap.killTweensOf([leftEye, rightEye, leftPath, rightPath]);

      debugLog.gsap('both', 'to', { 'path-morph': 'IDLE→LOOKING', 'left-x': ANIMATION_TIMING.LOOK_X_OFFSET - ANIMATION_TIMING.LOOK_BUNCH, 'right-x': ANIMATION_TIMING.LOOK_X_OFFSET });

      // Morph SVG paths from IDLE to LOOKING shape
      gsap.to([leftPath, rightPath], {
        attr: { d: EYE_PATHS.LOOKING },
        duration: ANIMATION_TIMING.LOOK_DURATION,
        ease: 'power2.out',
      });

      // Animate container dimensions to match looking eye size
      gsap.to([leftEye, rightEye], {
        height: ANIMATION_TIMING.LOOK_HEIGHT,
        width: ANIMATION_TIMING.LOOK_WIDTH,
        duration: ANIMATION_TIMING.LOOK_DURATION,
        ease: 'power2.out',
      });

      // Animate left eye position (bunches closer - moves less right)
      gsap.to(leftEye, {
        x: ANIMATION_TIMING.LOOK_X_OFFSET - ANIMATION_TIMING.LOOK_BUNCH,
        duration: ANIMATION_TIMING.LOOK_DURATION,
        ease: 'power2.out',
        onStart: () => debugLog.leftEye('Look right animation started (bunched closer)'),
      });

      // Animate right eye position (full movement)
      gsap.to(rightEye, {
        x: ANIMATION_TIMING.LOOK_X_OFFSET,
        duration: ANIMATION_TIMING.LOOK_DURATION,
        ease: 'power2.out',
        onStart: () => debugLog.rightEye('Look right animation started'),
        onComplete: () => debugLog.both('Look right animation complete'),
      });
    }
  }, [expression, leftEyeRef, rightEyeRef, leftEyePathRef, rightEyePathRef]);

  // ===========================
  // 3.5: Return Interface
  // ===========================

  return {
    performBlink,
    performDoubleBlink,
    allowBlinkingRef,
  };
}
