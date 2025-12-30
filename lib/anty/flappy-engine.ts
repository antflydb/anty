/**
 * FlappyAF Game Engine
 * Pure game logic with fixed timestep physics and object pooling
 * No React dependencies - designed for smooth 60fps
 */

// Virtual resolution for device independence (16:9 widescreen)
export const VIRTUAL_WIDTH = 960;
export const VIRTUAL_HEIGHT = 540;

// Fixed timestep for consistent physics across all refresh rates
export const PHYSICS_DT = 1 / 60; // 60 physics updates per second
export const MAX_FRAME_TIME = 0.25; // Prevent spiral of death

// Physics constants (tuned for 960x540 virtual resolution)
export const ENGINE_PHYSICS = {
  GRAVITY: 1600,              // pixels/sec² (feels snappy)
  FLAP_VELOCITY: -380,        // pixels/sec (upward)
  TERMINAL_VELOCITY: 550,     // pixels/sec (max fall speed)

  PLAYER_X: 150,              // Fixed horizontal position
  PLAYER_SIZE: 70,            // Hitbox size
  PLAYER_START_Y: 220,        // Starting vertical position

  SCROLL_SPEED: 220,          // pixels/sec base speed

  OBSTACLE_WIDTH: 70,
  OBSTACLE_GAP: 160,          // Gap between top and bottom
  OBSTACLE_SPACING: 280,      // Horizontal distance between obstacles
  MIN_GAP_Y: 100,
  MAX_GAP_Y: 440,

  // Expression timing
  HAPPY_DURATION: 0.15,       // seconds to show happy face after flap
} as const;

// Object pool sizes
const MAX_OBSTACLES = 10;

// Celebration colors for passed obstacles
const CELEBRATION_COLORS = [
  '#FF6B9D', // Pink
  '#4ECDC4', // Teal
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#FCBAD3', // Light Pink
  '#FFE66D', // Yellow
  '#A8DADC', // Light Blue
  '#F1C40F', // Gold
  '#3498DB', // Blue
  '#E74C3C', // Red
  '#2ECC71', // Green
];

let lastCelebrationColor = '';

function getRandomCelebrationColor(): string {
  const available = CELEBRATION_COLORS.filter(c => c !== lastCelebrationColor);
  const color = available[Math.floor(Math.random() * available.length)];
  lastCelebrationColor = color;
  return color;
}

// Obstacle in the pool
export interface PooledObstacle {
  active: boolean;
  x: number;
  gapY: number;
  passed: boolean;
  passedColor: string | null;
}

// Player state
export interface PlayerState {
  y: number;
  velocity: number;
  rotation: number;
  expression: 'idle' | 'happy';
  expressionTimer: number;  // time remaining for happy expression
}

// Full engine state
export interface EngineState {
  phase: 'ready' | 'playing' | 'game_over';
  player: PlayerState;
  obstacles: PooledObstacle[];
  scrollX: number;
  score: number;
  nextObstacleId: number;
  restartHoldTime: number;  // Time spacebar has been held (for restart)
}

/**
 * Create initial engine state with pre-allocated object pools
 */
export function createEngineState(): EngineState {
  return {
    phase: 'ready',
    player: {
      y: ENGINE_PHYSICS.PLAYER_START_Y,
      velocity: 0,
      rotation: 0,
      expression: 'idle',
      expressionTimer: 0,
    },
    obstacles: Array.from({ length: MAX_OBSTACLES }, () => ({
      active: false,
      x: 0,
      gapY: 0,
      passed: false,
      passedColor: null,
    })),
    scrollX: 0,
    score: 0,
    nextObstacleId: 0,
    restartHoldTime: 0,
  };
}

/**
 * Reset state for new game (reuses existing object pool)
 */
export function resetEngineState(state: EngineState): void {
  state.phase = 'playing';
  state.player.y = ENGINE_PHYSICS.PLAYER_START_Y;
  state.player.velocity = 0;
  state.player.rotation = 0;
  state.player.expression = 'idle';
  state.player.expressionTimer = 0;
  state.scrollX = 0;
  state.score = 0;
  state.nextObstacleId = 0;
  state.restartHoldTime = 0;
  lastCelebrationColor = '';

  // Deactivate all obstacles
  for (let i = 0; i < state.obstacles.length; i++) {
    state.obstacles[i].active = false;
    state.obstacles[i].passedColor = null;
  }

  // Spawn initial obstacles
  spawnObstacle(state, VIRTUAL_WIDTH * 0.5);
  spawnObstacle(state, VIRTUAL_WIDTH * 0.5 + ENGINE_PHYSICS.OBSTACLE_SPACING);
  spawnObstacle(state, VIRTUAL_WIDTH * 0.5 + ENGINE_PHYSICS.OBSTACLE_SPACING * 2);
}

// Hold duration required to restart (seconds)
const RESTART_HOLD_DURATION = 1.0;

/**
 * Apply flap impulse (called on key/tap DOWN)
 */
export function flap(state: EngineState): void {
  if (state.phase === 'ready') {
    resetEngineState(state);
    return;
  }

  // Game over requires hold to restart - don't restart on tap
  if (state.phase === 'game_over') {
    // Hold tracking is done in updateRestartHold
    return;
  }

  if (state.phase !== 'playing') return;

  state.player.velocity = ENGINE_PHYSICS.FLAP_VELOCITY;
  state.player.expression = 'happy';
  state.player.expressionTimer = ENGINE_PHYSICS.HAPPY_DURATION;
}

/**
 * Update restart hold timer (call every frame while holding)
 */
export function updateRestartHold(state: EngineState, dt: number, isHolding: boolean): boolean {
  if (state.phase !== 'game_over') {
    state.restartHoldTime = 0;
    return false;
  }

  if (isHolding) {
    state.restartHoldTime += dt;
    if (state.restartHoldTime >= RESTART_HOLD_DURATION) {
      resetEngineState(state);
      return true; // Restarted
    }
  } else {
    state.restartHoldTime = 0;
  }

  return false;
}

/**
 * Get restart progress (0-1)
 */
export function getRestartProgress(state: EngineState): number {
  if (state.phase !== 'game_over') return 0;
  return Math.min(state.restartHoldTime / RESTART_HOLD_DURATION, 1);
}

/**
 * Spawn an obstacle from the pool
 */
function spawnObstacle(state: EngineState, x: number): void {
  // Find inactive slot
  for (let i = 0; i < state.obstacles.length; i++) {
    if (!state.obstacles[i].active) {
      const obs = state.obstacles[i];
      obs.active = true;
      obs.x = x;
      obs.gapY = ENGINE_PHYSICS.MIN_GAP_Y +
        Math.random() * (ENGINE_PHYSICS.MAX_GAP_Y - ENGINE_PHYSICS.MIN_GAP_Y);
      obs.passed = false;
      state.nextObstacleId++;
      return;
    }
  }
}

/**
 * Get rightmost active obstacle X position
 */
function getRightmostObstacleX(state: EngineState): number {
  let maxX = 0;
  for (let i = 0; i < state.obstacles.length; i++) {
    if (state.obstacles[i].active && state.obstacles[i].x > maxX) {
      maxX = state.obstacles[i].x;
    }
  }
  return maxX;
}

/**
 * Update physics for one fixed timestep
 */
export function updatePhysics(state: EngineState, dt: number): void {
  if (state.phase !== 'playing') return;

  const player = state.player;

  // Apply gravity
  player.velocity += ENGINE_PHYSICS.GRAVITY * dt;

  // Clamp to terminal velocity
  if (player.velocity > ENGINE_PHYSICS.TERMINAL_VELOCITY) {
    player.velocity = ENGINE_PHYSICS.TERMINAL_VELOCITY;
  }

  // Update position
  player.y += player.velocity * dt;

  // Update rotation based on velocity (visual only)
  const targetRotation = (player.velocity / ENGINE_PHYSICS.TERMINAL_VELOCITY) * 45;
  player.rotation = targetRotation;

  // Update expression timer
  if (player.expressionTimer > 0) {
    player.expressionTimer -= dt;
    if (player.expressionTimer <= 0) {
      player.expression = 'idle';
      player.expressionTimer = 0;
    }
  }

  // Update scroll position
  state.scrollX += ENGINE_PHYSICS.SCROLL_SPEED * dt;

  // Update obstacles
  for (let i = 0; i < state.obstacles.length; i++) {
    const obs = state.obstacles[i];
    if (!obs.active) continue;

    // Move obstacle left
    obs.x -= ENGINE_PHYSICS.SCROLL_SPEED * dt;

    // Check if passed
    if (!obs.passed && obs.x + ENGINE_PHYSICS.OBSTACLE_WIDTH < ENGINE_PHYSICS.PLAYER_X) {
      obs.passed = true;
      obs.passedColor = getRandomCelebrationColor();
      state.score++;
    }

    // Deactivate if off screen
    if (obs.x < -ENGINE_PHYSICS.OBSTACLE_WIDTH) {
      obs.active = false;
    }
  }

  // Spawn new obstacles
  const rightmost = getRightmostObstacleX(state);
  if (rightmost < VIRTUAL_WIDTH) {
    spawnObstacle(state, rightmost + ENGINE_PHYSICS.OBSTACLE_SPACING);
  }

  // Check collisions
  checkCollisions(state);
}

/**
 * Check for collisions
 */
function checkCollisions(state: EngineState): void {
  const player = state.player;
  const px = ENGINE_PHYSICS.PLAYER_X;
  const py = player.y;
  const ps = ENGINE_PHYSICS.PLAYER_SIZE;

  // Check boundaries
  if (py < 0 || py + ps > VIRTUAL_HEIGHT) {
    state.phase = 'game_over';
    return;
  }

  // Check obstacle collisions
  for (let i = 0; i < state.obstacles.length; i++) {
    const obs = state.obstacles[i];
    if (!obs.active) continue;

    // Check if player overlaps obstacle X range
    if (px + ps > obs.x && px < obs.x + ENGINE_PHYSICS.OBSTACLE_WIDTH) {
      // Check if player is outside the gap
      const gapTop = obs.gapY - ENGINE_PHYSICS.OBSTACLE_GAP / 2;
      const gapBottom = obs.gapY + ENGINE_PHYSICS.OBSTACLE_GAP / 2;

      if (py < gapTop || py + ps > gapBottom) {
        state.phase = 'game_over';
        return;
      }
    }
  }
}

/**
 * Game loop runner with fixed timestep
 */
export class GameLoop {
  private state: EngineState;
  private accumulator = 0;
  private previousTime = 0;
  private rafId: number | null = null;
  private onRender: (state: EngineState, alpha: number) => void;
  private onStateChange: (phase: EngineState['phase'], score: number) => void;
  private getIsHolding: () => boolean;
  private lastReportedPhase: EngineState['phase'] = 'ready';
  private lastReportedScore = 0;

  constructor(
    state: EngineState,
    onRender: (state: EngineState, alpha: number) => void,
    onStateChange: (phase: EngineState['phase'], score: number) => void,
    getIsHolding: () => boolean = () => false
  ) {
    this.state = state;
    this.onRender = onRender;
    this.onStateChange = onStateChange;
    this.getIsHolding = getIsHolding;
  }

  start(): void {
    this.previousTime = performance.now();
    this.accumulator = 0;
    this.tick(this.previousTime);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (currentTime: number): void => {
    const frameTime = Math.min((currentTime - this.previousTime) / 1000, MAX_FRAME_TIME);
    this.previousTime = currentTime;
    this.accumulator += frameTime;

    // Fixed timestep physics updates
    while (this.accumulator >= PHYSICS_DT) {
      updatePhysics(this.state, PHYSICS_DT);
      // Update restart hold during game over
      updateRestartHold(this.state, PHYSICS_DT, this.getIsHolding());
      this.accumulator -= PHYSICS_DT;
    }

    // Alpha for interpolation (how far into next physics step)
    const alpha = this.accumulator / PHYSICS_DT;

    // Render
    this.onRender(this.state, alpha);

    // Report state changes to React (sparingly)
    if (this.state.phase !== this.lastReportedPhase ||
        this.state.score !== this.lastReportedScore) {
      this.lastReportedPhase = this.state.phase;
      this.lastReportedScore = this.state.score;
      this.onStateChange(this.state.phase, this.state.score);
    }

    // Continue loop
    this.rafId = requestAnimationFrame(this.tick);
  };
}
