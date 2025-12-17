/**
 * Anty Expressions - REAL Figma Paths
 *
 * These are the ACTUAL SVG paths extracted from Figma design 574-144.
 * NO made-up coordinates, NO invented shapes.
 */

export type ExpressionName = 'idle' | 'happy' | 'wink' | 'sad' | 'blink';

export interface ExpressionData {
  name: ExpressionName;
  description: string;
  leftEye: string;   // SVG path d attribute
  rightEye: string;  // SVG path d attribute
}

/**
 * Static outer bracket paths - from af-logo.svg
 * These never change across expressions
 */
export const staticBrackets = {
  leftBracket: 'M28.3149 6.96011H11.2167C8.86587 6.96012 6.96011 8.86587 6.9601 11.2167V28.3149L1.39945 33.8755C0.883015 34.392 0 34.0262 0 33.2958V11.2167C4.48304e-06 5.02189 5.02189 9.39218e-06 11.2167 0H33.2958C34.0262 0 34.3919 0.883017 33.8755 1.39945L28.3149 6.96011Z',
  rightBracket: 'M39.2842 28.0677C39.2842 34.2626 34.2623 39.2845 28.0674 39.2845H6.10853C5.37819 39.2845 5.01243 38.4015 5.52886 37.885L11.0896 32.3243H28.0674C30.4183 32.3243 32.324 30.4186 32.324 28.0677V11.0898L37.8847 5.5291C38.4012 5.01267 39.2842 5.37843 39.2842 6.10877V28.0677Z',
} as const;

/**
 * All 5 expressions with EXACT paths from Figma
 * Extracted from: https://www.figma.com/design/nu19JQ7QO9gEKVrnSaKYV0/antfly?node-id=574-144
 */
export const expressions: Record<ExpressionName, ExpressionData> = {
  /**
   * IDLE - Default expression
   * Vertical rounded pill eyes (both same)
   */
  idle: {
    name: 'idle',
    description: 'Neutral and calm',
    // Both eyes are identical vertical pills
    leftEye: 'M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z',
    rightEye: 'M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z',
  },

  /**
   * HAPPY - Joyful expression
   * Wider eyes with curved bottom (smile shape)
   */
  happy: {
    name: 'happy',
    description: 'Happy and content',
    leftEye: 'M5.20169e-10 14.4524C-6.69533e-05 6.47055 6.47051 -3.82224e-05 14.4524 1.6863e-10C22.4341 3.82222e-05 28.9046 6.47053 28.9046 14.4523V36.019C28.9046 36.0738 28.8516 36.1129 28.7996 36.0955C27.7907 35.7593 19.7353 33.1308 14.4524 33.1308C9.16943 33.1308 1.11399 35.7593 0.105151 36.0955C0.0531128 36.1129 0.000181367 36.0738 0.000180907 36.019L5.20169e-10 14.4524Z',
    rightEye: 'M5.20169e-10 14.4524C-6.69533e-05 6.47055 6.47051 -3.82224e-05 14.4524 1.6863e-10C22.4341 3.82222e-05 28.9046 6.47053 28.9046 14.4523V36.0185C28.9046 36.0735 28.8516 36.1126 28.7995 36.0951C27.7975 35.7568 19.8454 33.1308 14.4524 33.1308C9.05939 33.1308 1.10719 35.7568 0.105201 36.0951C0.0530961 36.1126 0.000181364 36.0735 0.000180902 36.0185L5.20169e-10 14.4524Z',
  },

  /**
   * WINK - Playful expression
   * Left eye horizontal pill, right eye closed/flat
   */
  wink: {
    name: 'wink',
    description: 'Playful wink',
    leftEye: 'M2.26207e-09 8.12962C-0.000104614 3.63978 3.63961 -7.74014e-06 8.12945 0L28.0013 3.42575e-05C32.491 4.19975e-05 36.1307 3.63971 36.1307 8.12945C36.1307 12.6192 32.491 16.2589 28.0012 16.2589H8.12943C3.63974 16.2589 0.000104615 12.6193 2.26207e-09 8.12962Z',
    rightEye: 'M5.17106e-10 14.4524C-6.69533e-05 6.47055 6.47051 -3.82224e-05 14.4524 1.68042e-10C22.4341 3.82222e-05 28.9046 6.47053 28.9046 14.4523V36.0507C28.9046 36.0949 28.8687 36.1308 28.8245 36.1308H0.080292C0.0360478 36.1308 0.000181544 36.0949 0.000181173 36.0507L5.17106e-10 14.4524Z',
  },

  /**
   * SAD - Unhappy expression
   * Eyes curved downward (frown shape)
   */
  sad: {
    name: 'sad',
    description: 'Sad and down',
    leftEye: 'M0.000755203 13.3875C-0.0485902 9.8226 2.32488 6.67776 5.76665 5.74768L19.4795 2.04204L30.1578 0.116821C34.6488 -0.692859 38.7566 2.81139 38.6647 7.3738L38.5405 13.5399C38.4849 16.3056 36.3552 18.5855 33.5997 18.8293L8.48961 21.0511C3.96986 21.451 0.0635565 17.9244 0.000755203 13.3875Z',
    rightEye: 'M0.000755203 13.3875C-0.0485902 9.8226 2.32488 6.67776 5.76665 5.74768L19.4795 2.04204L30.1578 0.116821C34.6488 -0.692859 38.7566 2.81139 38.6647 7.3738L38.5405 13.5399C38.4849 16.3056 36.3552 18.5855 33.5997 18.8293L8.48961 21.0511C3.96986 21.451 0.0635565 17.9244 0.000755203 13.3875Z',
  },

  /**
   * BLINK - Closed eyes
   * Both eyes as horizontal lines
   */
  blink: {
    name: 'blink',
    description: 'Blinking',
    leftEye: 'M1.65321e-09 4.50012C-6.65948e-05 2.01479 2.01467 -3.72567e-06 4.5 0L18.4999 2.09868e-05C20.9852 2.47124e-05 22.9999 2.01474 22.9999 4.50001C22.9999 6.98528 20.9852 8.99999 18.4999 8.99999H4.5C2.01476 8.99999 6.65955e-05 6.98535 1.65321e-09 4.50012Z',
    rightEye: 'M1.7991e-09 4.50012C-6.94902e-05 2.01479 2.01467 -3.57043e-06 4.5 0L19.4999 2.15489e-05C21.9852 2.51193e-05 23.9999 2.01474 23.9999 4.50001C23.9999 6.98528 21.9852 8.99999 19.4999 8.99999H12H4.5C2.01476 8.99999 6.9491e-05 6.98535 1.7991e-09 4.50012Z',
  },
};

/**
 * Get expression based on mood level (0-3 hearts)
 */
export function getExpressionByMood(mood: number): ExpressionName {
  if (mood === 0) return 'sad';
  if (mood === 3) return 'happy';
  return 'idle'; // 1-2 hearts = idle
}

/**
 * Get all expression names for Faces menu
 */
export function getAllExpressions(): ExpressionName[] {
  return ['idle', 'happy', 'wink', 'sad', 'blink'];
}
