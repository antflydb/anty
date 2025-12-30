/**
 * FlappyAF Game Physics Constants and Utilities
 * Physics engine for the Flappy Bird clone
 */

import gsap from 'gsap';
import type { Obstacle, Collectible, PlayerState, GameConfig } from './game-state';

/**
 * Core physics constants
 * Tuned for playability and feel
 */
export const GAME_PHYSICS = {
  // Gravity and movement
  GRAVITY: 0.5, // px/frame² - acceleration downward
  FLAP_VELOCITY: -11, // px/frame - upward velocity on flap (increased for more control)
  TERMINAL_VELOCITY: 12, // px/frame - max fall speed

  // Player dimensions and position
  PLAYER_X: 150, // Fixed horizontal position
  PLAYER_SIZE: 80, // Hitbox size (shrunken Anty)
  PLAYER_START_Y: 300, // Starting vertical position

  // World scrolling
  SCROLL_SPEED_BASE: 4, // px/frame - base scroll speed (increased for faster gameplay)

  // Obstacles
  OBSTACLE_WIDTH: 80, // Width of data stream blocks
  OBSTACLE_GAP_HEIGHT_BASE: 280, // Vertical gap height (base) - increased for better playability
  OBSTACLE_SPACING_BASE: 400, // Horizontal spacing between obstacles
  MIN_GAP_Y: 150, // Minimum gap center Y
  MAX_GAP_Y: 450, // Maximum gap center Y

  // Collectibles
  COLLECTIBLE_SIZE: 40, // Size of magnifying glass
  COLLECTIBLE_CHANCE: 0.3, // 30% chance to spawn with obstacle
  COLLECTIBLE_POINTS: 5, // Bonus points for collecting

  // Difficulty scaling
  DIFFICULTY_SCORE_INTERVAL: 10, // Increase difficulty every N points
  DIFFICULTY_SPEED_INCREMENT: 0.5, // Speed increase per level
  DIFFICULTY_GAP_DECREMENT: 10, // Gap shrink per level
  DIFFICULTY_SPACING_DECREMENT: 20, // Spacing reduction per level
  DIFFICULTY_MIN_GAP: 120, // Minimum gap height
  DIFFICULTY_MIN_SPACING: 300, // Minimum obstacle spacing

  // Visual
  ROTATION_VELOCITY_MULTIPLIER: 2, // How much velocity affects rotation
  MAX_ROTATION: 25, // Max rotation angle (degrees)
  FLAP_ROTATION_TILT: -15, // Upward tilt on flap (degrees)
} as const;

/**
 * Calculate difficulty modifiers based on current score
 */
export function getDifficultyConfig(score: number): GameConfig {
  const level = Math.floor(score / GAME_PHYSICS.DIFFICULTY_SCORE_INTERVAL);

  return {
    scrollSpeed: Math.min(
      GAME_PHYSICS.SCROLL_SPEED_BASE + level * GAME_PHYSICS.DIFFICULTY_SPEED_INCREMENT,
      10 // Cap at reasonable speed
    ),
    gapHeight: Math.max(
      GAME_PHYSICS.OBSTACLE_GAP_HEIGHT_BASE - level * GAME_PHYSICS.DIFFICULTY_GAP_DECREMENT,
      GAME_PHYSICS.DIFFICULTY_MIN_GAP
    ),
    obstacleSpacing: Math.max(
      GAME_PHYSICS.OBSTACLE_SPACING_BASE - level * GAME_PHYSICS.DIFFICULTY_SPACING_DECREMENT,
      GAME_PHYSICS.DIFFICULTY_MIN_SPACING
    ),
  };
}

/**
 * Update player physics for one frame
 */
export function updatePlayerPhysics(
  player: PlayerState,
  deltaTime: number,
  canvasHeight: number
): PlayerState {
  // Apply gravity
  const newVelocity = Math.min(
    player.velocity + GAME_PHYSICS.GRAVITY * deltaTime,
    GAME_PHYSICS.TERMINAL_VELOCITY
  );

  // Update position
  let newY = player.y + newVelocity * deltaTime;

  // Clamp to screen bounds
  newY = Math.max(0, Math.min(newY, canvasHeight - GAME_PHYSICS.PLAYER_SIZE));

  // Calculate rotation based on velocity (visual feedback)
  const rotation = gsap.utils.clamp(
    -GAME_PHYSICS.MAX_ROTATION,
    GAME_PHYSICS.MAX_ROTATION,
    newVelocity * GAME_PHYSICS.ROTATION_VELOCITY_MULTIPLIER
  );

  return {
    y: newY,
    velocity: newVelocity,
    rotation,
  };
}

/**
 * Apply flap (spacebar press) to player
 */
export function applyFlap(player: PlayerState): PlayerState {
  return {
    ...player,
    velocity: GAME_PHYSICS.FLAP_VELOCITY,
  };
}

/**
 * Generate a new obstacle at the specified X position
 */
export function generateObstacle(x: number, gapHeight: number): Obstacle {
  const gapY = gsap.utils.random(
    GAME_PHYSICS.MIN_GAP_Y,
    GAME_PHYSICS.MAX_GAP_Y
  );

  return {
    id: `obs-${Date.now()}-${Math.random()}`,
    x,
    gapY,
    gapHeight,
    passed: false,
  };
}

/**
 * Generate a collectible at the specified position
 * Types: sparkle (5pts, common), snack (10pts, rare), antfly (25pts, super rare)
 */
export function generateCollectible(x: number, y: number): Collectible {
  const rand = Math.random();

  let type: 'sparkle' | 'snack' | 'antfly';
  let value: number;

  if (rand < 0.05) {
    // 5% chance - super rare antfly logo
    type = 'antfly';
    value = 25;
  } else if (rand < 0.20) {
    // 15% chance - rare snack
    type = 'snack';
    value = 10;
  } else {
    // 80% chance - common sparkle
    type = 'sparkle';
    value = 5;
  }

  return {
    id: `col-${Date.now()}-${Math.random()}`,
    x,
    y,
    collected: false,
    type,
    value,
  };
}

/**
 * Update obstacles (scroll and cleanup)
 */
export function updateObstacles(
  obstacles: Obstacle[],
  scrollSpeed: number,
  deltaTime: number
): Obstacle[] {
  return obstacles
    .map(obs => ({
      ...obs,
      x: obs.x - scrollSpeed * deltaTime,
    }))
    .filter(obs => obs.x > -GAME_PHYSICS.OBSTACLE_WIDTH - 100); // Remove off-screen
}

/**
 * Update collectibles (scroll and cleanup)
 */
export function updateCollectibles(
  collectibles: Collectible[],
  scrollSpeed: number,
  deltaTime: number
): Collectible[] {
  return collectibles
    .map(col => ({
      ...col,
      x: col.x - scrollSpeed * deltaTime,
    }))
    .filter(col => col.x > -GAME_PHYSICS.COLLECTIBLE_SIZE - 50); // Remove off-screen
}

/**
 * Check if player should spawn a new obstacle
 */
export function shouldSpawnObstacle(
  obstacles: Obstacle[],
  canvasWidth: number,
  obstacleSpacing: number
): boolean {
  if (obstacles.length === 0) return true;

  const lastObs = obstacles[obstacles.length - 1];
  return lastObs.x < canvasWidth - obstacleSpacing;
}

/**
 * Check collision between player and obstacles
 */
export function checkObstacleCollision(
  player: PlayerState,
  obstacles: Obstacle[],
  canvasHeight: number
): boolean {
  const playerBox = {
    x: GAME_PHYSICS.PLAYER_X,
    y: player.y,
    width: GAME_PHYSICS.PLAYER_SIZE,
    height: GAME_PHYSICS.PLAYER_SIZE,
  };

  // Check screen boundaries
  if (player.y <= 0 || player.y + playerBox.height >= canvasHeight) {
    console.log('[COLLISION] Boundary collision!', {
      playerY: player.y,
      playerBottom: player.y + playerBox.height,
      canvasHeight,
      hitTop: player.y <= 0,
      hitBottom: player.y + playerBox.height >= canvasHeight
    });
    return true;
  }

  // Check obstacle collisions
  for (const obstacle of obstacles) {
    // Skip distant obstacles (optimization)
    if (
      obstacle.x + GAME_PHYSICS.OBSTACLE_WIDTH < playerBox.x - 50 ||
      obstacle.x > playerBox.x + playerBox.width + 50
    ) {
      continue;
    }

    // In X range?
    const inXRange =
      playerBox.x + playerBox.width > obstacle.x &&
      playerBox.x < obstacle.x + GAME_PHYSICS.OBSTACLE_WIDTH;

    // Outside gap Y range?
    const gapTop = obstacle.gapY - obstacle.gapHeight / 2;
    const gapBottom = obstacle.gapY + obstacle.gapHeight / 2;
    const outOfGap =
      playerBox.y < gapTop || playerBox.y + playerBox.height > gapBottom;

    if (inXRange && outOfGap) {
      return true; // COLLISION!
    }
  }

  return false;
}

/**
 * Check which obstacles the player has passed (for scoring)
 * Returns array of newly passed obstacle IDs
 */
export function checkPassedObstacles(
  player: PlayerState,
  obstacles: Obstacle[]
): string[] {
  const playerBox = {
    x: GAME_PHYSICS.PLAYER_X,
    width: GAME_PHYSICS.PLAYER_SIZE,
  };

  const newlyPassed: string[] = [];

  for (const obstacle of obstacles) {
    if (!obstacle.passed && playerBox.x > obstacle.x + GAME_PHYSICS.OBSTACLE_WIDTH) {
      newlyPassed.push(obstacle.id);
    }
  }

  return newlyPassed;
}

/**
 * Apply magnetic pull to collectibles near Anty
 */
export function applyMagneticPull(
  player: PlayerState,
  collectibles: Collectible[],
  deltaTime: number
): Collectible[] {
  const playerCenter = {
    x: GAME_PHYSICS.PLAYER_X + GAME_PHYSICS.PLAYER_SIZE / 2,
    y: player.y + GAME_PHYSICS.PLAYER_SIZE / 2,
  };

  const magnetRadius = 120; // Pull radius
  const magnetStrength = 3; // Pixels per frame

  return collectibles.map(col => {
    if (col.collected) return col;

    const dx = playerCenter.x - col.x;
    const dy = playerCenter.y - col.y;
    const distance = Math.hypot(dx, dy);

    // Within magnetic radius?
    if (distance < magnetRadius && distance > 0) {
      // Pull toward player
      const pullX = (dx / distance) * magnetStrength * deltaTime;
      const pullY = (dy / distance) * magnetStrength * deltaTime;

      return {
        ...col,
        x: col.x + pullX,
        y: col.y + pullY,
      };
    }

    return col;
  });
}

/**
 * Check collision with collectibles
 * Returns array of collected collectible IDs
 */
export function checkCollectibleCollisions(
  player: PlayerState,
  collectibles: Collectible[]
): string[] {
  const playerCenter = {
    x: GAME_PHYSICS.PLAYER_X + GAME_PHYSICS.PLAYER_SIZE / 2,
    y: player.y + GAME_PHYSICS.PLAYER_SIZE / 2,
  };

  const collected: string[] = [];
  const collectionRadius = 50; // Increased from 40 for easier collection

  for (const collectible of collectibles) {
    if (collectible.collected) continue;

    const distance = Math.hypot(
      collectible.x - playerCenter.x,
      collectible.y - playerCenter.y
    );

    if (distance < collectionRadius) {
      collected.push(collectible.id);
    }
  }

  return collected;
}

/**
 * Check if new difficulty level reached
 */
export function checkDifficultyIncrease(
  oldScore: number,
  newScore: number
): boolean {
  const oldLevel = Math.floor(oldScore / GAME_PHYSICS.DIFFICULTY_SCORE_INTERVAL);
  const newLevel = Math.floor(newScore / GAME_PHYSICS.DIFFICULTY_SCORE_INTERVAL);
  return newLevel > oldLevel;
}
