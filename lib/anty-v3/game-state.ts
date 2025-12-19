/**
 * FlappyAF Game State Type Definitions
 * Type definitions for the Flappy Bird clone integrated into Anty v3
 */

/**
 * Game state machine states
 */
export type GameState = 'ready' | 'playing' | 'game_over';

/**
 * Obstacle in the game world
 * Represents a vertical pair of data stream blocks with a gap in between
 */
export interface Obstacle {
  /** Unique identifier */
  id: string;

  /** Horizontal position (pixels from left) */
  x: number;

  /** Vertical center of the gap (pixels from top) */
  gapY: number;

  /** Height of the passable gap (pixels) */
  gapHeight: number;

  /** Whether player has passed this obstacle (for scoring) */
  passed: boolean;
}

/**
 * Collectible item in the game
 */
export interface Collectible {
  /** Unique identifier */
  id: string;

  /** Horizontal position (pixels from left) */
  x: number;

  /** Vertical position (pixels from top) */
  y: number;

  /** Whether this collectible has been collected */
  collected: boolean;

  /** Type of collectible */
  type: 'sparkle' | 'snack' | 'antfly';

  /** Points value */
  value: number;
}

/**
 * Game configuration and difficulty settings
 */
export interface GameConfig {
  /** Current scroll speed (pixels per frame) */
  scrollSpeed: number;

  /** Current gap height (pixels) */
  gapHeight: number;

  /** Current spacing between obstacles (pixels) */
  obstacleSpacing: number;
}

/**
 * Player state
 */
export interface PlayerState {
  /** Vertical position (pixels from top) */
  y: number;

  /** Vertical velocity (pixels per frame, negative = up) */
  velocity: number;

  /** Visual rotation angle (degrees) */
  rotation: number;
}

/**
 * Complete game session state
 */
export interface GameSession {
  /** Current state of the game */
  state: GameState;

  /** Player state */
  player: PlayerState;

  /** Current score */
  score: number;

  /** High score (persisted) */
  highScore: number;

  /** Active obstacles */
  obstacles: Obstacle[];

  /** Active collectibles */
  collectibles: Collectible[];

  /** Game configuration */
  config: GameConfig;

  /** Timestamp of last frame (for delta time) */
  lastFrameTime: number;
}
