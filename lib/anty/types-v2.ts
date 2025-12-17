/**
 * Anty Tamagotchi V2 - Simplified Type System
 *
 * This is a complete redesign with simplified mechanics:
 * - Single stat: Mood (0-3 hearts)
 * - 5 expressions: idle (default), happy, wink, sad, blink
 * - 4 actions: Chat, Faces, Game, Eat
 */

/**
 * The 5 core expressions from Figma (574-144)
 * IMPORTANT: 'idle' is the default, NOT 'logo'
 */
export type ExpressionName = 'idle' | 'happy' | 'wink' | 'sad' | 'blink';

/**
 * The 4 user actions available
 */
export type ActionName = 'chat' | 'faces' | 'game' | 'eat';

/**
 * Simplified Anty state - just mood level
 */
export interface AntyState {
  /** Mood level: 0-3 hearts */
  mood: number;
  /** Last time the user interacted */
  lastInteraction: string;
  /** Current expression (can be manually set via Faces menu) */
  currentExpression: ExpressionName;
  /** When the state was created */
  createdAt: string;
}

/**
 * Expression data with SVG eye shapes
 */
export interface ExpressionData {
  /** Name of the expression */
  name: ExpressionName;
  /** Description for UI */
  description: string;
  /** Left eye SVG path or shape definition */
  leftEye: EyeShape;
  /** Right eye SVG path or shape definition */
  rightEye: EyeShape;
}

/**
 * Eye shape definition - supports both rounded pills and simple lines
 */
export interface EyeShape {
  /** Type of eye shape */
  type: 'pill' | 'line' | 'curve-up' | 'curve-down';
  /** For pills: width and height */
  width?: number;
  height?: number;
  /** For pills: x,y position */
  x?: number;
  y?: number;
  /** For curves: SVG path */
  path?: string;
  /** Rotation in degrees (for wink line) */
  rotation?: number;
}

/**
 * Result from performing an action
 */
export interface ActionResult {
  /** Success status */
  success: boolean;
  /** New state after action */
  state: AntyState;
  /** Message to show user */
  message: string;
  /** New mood value */
  mood: number;
}
