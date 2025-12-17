/**
 * Anty V2 - Expression System with Correct Eye Shapes
 *
 * Based on Figma design 574-144, these are the 5 core expressions.
 * Eyes are ROUNDED PILLS (oval shapes), NOT triangles.
 *
 * Key requirements:
 * - Default is 'idle' with vertical rounded pill eyes
 * - Eyes should be smooth ovals, not angular
 * - Bracket decorations are static (from af-logo.svg)
 */

import type { ExpressionData, ExpressionName, EyeShape } from './types-v2';

/**
 * Static outer bracket paths - these never change
 * (from original af-logo.svg)
 */
export const staticBrackets = {
  leftBracket: 'M28.3149 6.96011H11.2167C8.86587 6.96012 6.96011 8.86587 6.9601 11.2167V28.3149L1.39945 33.8755C0.883015 34.392 0 34.0262 0 33.2958V11.2167C4.48304e-06 5.02189 5.02189 9.39218e-06 11.2167 0H33.2958C34.0262 0 34.3919 0.883017 33.8755 1.39945L28.3149 6.96011Z',
  rightBracket: 'M39.2842 28.0677C39.2842 34.2626 34.2623 39.2845 28.0674 39.2845H6.10853C5.37819 39.2845 5.01243 38.4015 5.52886 37.885L11.0896 32.3243H28.0674C30.4183 32.3243 32.324 30.4186 32.324 28.0677V11.0898L37.8847 5.5291C38.4012 5.01267 39.2842 5.37843 39.2842 6.10877V28.0677Z',
} as const;

/**
 * Create a rounded pill eye shape (ellipse)
 * These are the characteristic rounded eyes from the Figma design
 */
function createPillEye(
  cx: number,
  cy: number,
  rx: number,
  ry: number
): EyeShape {
  return {
    type: 'pill',
    x: cx,
    y: cy,
    width: rx,
    height: ry,
  };
}

/**
 * Create a horizontal line eye (for blink/wink)
 */
function createLineEye(x: number, y: number, width: number): EyeShape {
  return {
    type: 'line',
    x,
    y,
    width,
    height: 2, // Thin line
  };
}

/**
 * Create curved eyes (for happy/sad expressions)
 */
function createCurvedEye(type: 'curve-up' | 'curve-down', path: string): EyeShape {
  return {
    type,
    path,
  };
}

/**
 * All 5 expressions with correct eye shapes from Figma
 */
export const expressions: Record<ExpressionName, ExpressionData> = {
  /**
   * IDLE - Default expression
   * Vertical rounded pill eyes (neutral, calm)
   */
  idle: {
    name: 'idle',
    description: 'Neutral and calm',
    // Based on Figma idle state - vertical pills
    leftEye: createPillEye(14.5, 19.7, 2.3, 5.6),
    rightEye: createPillEye(24.5, 19.7, 2.3, 5.6),
  },

  /**
   * HAPPY - Joyful expression
   * Eyes curved upward (smile shape)
   */
  happy: {
    name: 'happy',
    description: 'Happy and content',
    // Curved upward eyes (smiling)
    leftEye: createCurvedEye(
      'curve-up',
      'M12 18 Q14.5 16 17 18'
    ),
    rightEye: createCurvedEye(
      'curve-up',
      'M22 18 Q24.5 16 27 18'
    ),
  },

  /**
   * WINK - Playful expression
   * Left eye open (pill), right eye closed (line)
   */
  wink: {
    name: 'wink',
    description: 'Playful wink',
    // Left eye normal pill
    leftEye: createPillEye(14.5, 19.7, 2.3, 5.6),
    // Right eye horizontal line
    rightEye: createLineEye(22, 19.7, 6),
  },

  /**
   * SAD - Unhappy expression
   * Eyes curved downward (frown shape)
   */
  sad: {
    name: 'sad',
    description: 'Sad and down',
    // Curved downward eyes (frowning)
    leftEye: createCurvedEye(
      'curve-down',
      'M12 17 Q14.5 19 17 17'
    ),
    rightEye: createCurvedEye(
      'curve-down',
      'M22 17 Q24.5 19 27 17'
    ),
  },

  /**
   * BLINK - Closed eyes
   * Both eyes as horizontal lines
   */
  blink: {
    name: 'blink',
    description: 'Blinking',
    // Both eyes closed (horizontal lines)
    leftEye: createLineEye(12, 19.7, 6),
    rightEye: createLineEye(22, 19.7, 6),
  },
};

/**
 * Get expression based on mood level
 * Auto-selects expression unless manually overridden
 */
export function getExpressionByMood(mood: number): ExpressionName {
  if (mood === 0) return 'sad';
  if (mood === 3) return 'happy';
  return 'idle'; // 1-2 hearts = idle
}

/**
 * Helper to get all expression names for the Faces menu
 */
export function getAllExpressions(): ExpressionName[] {
  return ['idle', 'happy', 'wink', 'sad', 'blink'];
}
