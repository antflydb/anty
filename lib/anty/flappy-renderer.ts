/**
 * FlappyAF Canvas Renderer
 * Pure rendering functions - no React, no state management
 */

import type { EngineState, PooledObstacle } from './flappy-engine';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, ENGINE_PHYSICS, getRestartProgress } from './flappy-engine';

// Sprite cache for Anty
interface SpriteCache {
  loaded: boolean;
  bodyLeft: HTMLImageElement | null;
  bodyRight: HTMLImageElement | null;
  eyeHappyLeft: HTMLImageElement | null;
  eyeHappyRight: HTMLImageElement | null;
}

const sprites: SpriteCache = {
  loaded: false,
  bodyLeft: null,
  bodyRight: null,
  eyeHappyLeft: null,
  eyeHappyRight: null,
};

/**
 * Load Anty sprites (call once at startup)
 */
export async function loadSprites(): Promise<void> {
  if (sprites.loaded) return;

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  try {
    sprites.bodyLeft = await loadImage('/anty/body-left.svg');
    sprites.bodyRight = await loadImage('/anty/body-right.svg');
    sprites.eyeHappyLeft = await loadImage('/anty/eye-happy-left.svg');
    sprites.eyeHappyRight = await loadImage('/anty/eye-happy-right.svg');
    sprites.loaded = true;
  } catch (e) {
    console.warn('Failed to load Anty sprites, using fallback', e);
  }
}

// Margin around the game frame
const FRAME_MARGIN = 24;
const FRAME_RADIUS = 16;

// Cache for scale calculations
let cachedScale: { width: number; height: number; result: { scale: number; offsetX: number; offsetY: number } } | null = null;

// Cache for background gradient
let cachedGradient: { ctx: CanvasRenderingContext2D; gradient: CanvasGradient } | null = null;


// Cache for obstacle colors (avoid parsing hex every frame)
const colorCache = new Map<string, { highlight: string; shadow: string }>();

function getCachedColors(baseColor: string): { highlight: string; shadow: string } {
  let cached = colorCache.get(baseColor);
  if (!cached) {
    cached = {
      highlight: lightenColor(baseColor, 15),
      shadow: darkenColor(baseColor, 15)
    };
    colorCache.set(baseColor, cached);
  }
  return cached;
}

/**
 * Get scale factor to fit virtual resolution in canvas with margin (cached)
 */
export function getScale(canvasWidth: number, canvasHeight: number): {
  scale: number;
  offsetX: number;
  offsetY: number;
} {
  // Return cached if dimensions match
  if (cachedScale && cachedScale.width === canvasWidth && cachedScale.height === canvasHeight) {
    return cachedScale.result;
  }

  // Account for margin on all sides
  const availableWidth = canvasWidth - FRAME_MARGIN * 2;
  const availableHeight = canvasHeight - FRAME_MARGIN * 2;

  const scaleX = availableWidth / VIRTUAL_WIDTH;
  const scaleY = availableHeight / VIRTUAL_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (canvasWidth - VIRTUAL_WIDTH * scale) / 2;
  const offsetY = (canvasHeight - VIRTUAL_HEIGHT * scale) / 2;

  const result = { scale, offsetX, offsetY };
  cachedScale = { width: canvasWidth, height: canvasHeight, result };
  return result;
}

/**
 * Render the entire game frame
 */
export function render(
  ctx: CanvasRenderingContext2D,
  state: EngineState,
  canvasWidth: number,
  canvasHeight: number,
  _alpha: number
): void {
  // Clear entire canvas with white for letterbox areas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Get scaling info
  const { scale, offsetX, offsetY } = getScale(canvasWidth, canvasHeight);

  // Apply transform for virtual resolution
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Simple rectangular clip - cheap! (the curved clip path was the perf killer)
  ctx.beginPath();
  ctx.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  ctx.clip();

  // Render in order (back to front)
  renderBackground(ctx, state.scrollX);
  renderObstacles(ctx, state.obstacles);
  renderPlayer(ctx, state.player.y, state.player.rotation, state.player.expression);

  // Render score (inside virtual resolution)
  renderScore(ctx, state.score);

  // Render game phase UI (inside virtual resolution)
  if (state.phase === 'ready') {
    renderReadyScreen(ctx);
  } else if (state.phase === 'game_over') {
    renderGameOver(ctx, state.score, getRestartProgress(state));
  }

  ctx.restore();
}

/**
 * Render scrolling background with Mario-style clouds
 */
function renderBackground(ctx: CanvasRenderingContext2D, scrollX: number): void {
  // Use cached gradient (only create once per context)
  if (!cachedGradient || cachedGradient.ctx !== ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    gradient.addColorStop(0, '#E3F2FD');
    gradient.addColorStop(1, '#F3E5F5');
    cachedGradient = { ctx, gradient };
  }
  ctx.fillStyle = cachedGradient.gradient;
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Mario-style continuous cloud line
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  drawContinuousCloudLine(ctx, scrollX * 0.06, VIRTUAL_HEIGHT * 0.85, 2.0);
}

/**
 * Draw a continuous wavy cloud line (classic Mario style)
 */
function drawContinuousCloudLine(
  ctx: CanvasRenderingContext2D,
  offset: number,
  y: number,
  scale: number
): void {
  const bumpRadius = 35 * scale;
  const bumpSpacing = 50 * scale;
  const patternWidth = bumpSpacing * 4;

  const startX = -(offset % patternWidth);

  ctx.beginPath();
  ctx.moveTo(startX - 100, VIRTUAL_HEIGHT + 50);

  for (let x = startX - 100; x < VIRTUAL_WIDTH + patternWidth + 100; x += bumpSpacing) {
    const variation = Math.sin(x * 0.1) * 0.2 + 1;
    const r = bumpRadius * variation;
    ctx.arc(x + bumpSpacing / 2, y, r, Math.PI, 0, false);
  }

  ctx.lineTo(VIRTUAL_WIDTH + patternWidth + 100, VIRTUAL_HEIGHT + 50);
  ctx.closePath();
  ctx.fill();
}

/**
 * Render all active obstacles
 */
function renderObstacles(ctx: CanvasRenderingContext2D, obstacles: PooledObstacle[]): void {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (!obs.active) continue;

    const gapTop = obs.gapY - ENGINE_PHYSICS.OBSTACLE_GAP / 2;
    const gapBottom = obs.gapY + ENGINE_PHYSICS.OBSTACLE_GAP / 2;
    const width = ENGINE_PHYSICS.OBSTACLE_WIDTH;

    // Obstacle color - dark gray, or celebration color when passed (using cache)
    const baseColor = obs.passed && obs.passedColor ? obs.passedColor : '#1a1a1a';
    const colors = getCachedColors(baseColor);
    const highlightColor = colors.highlight;
    const shadowColor = colors.shadow;

    ctx.fillStyle = baseColor;

    // Top obstacle - simple rect, no curves!
    ctx.fillRect(obs.x, 0, width, gapTop);

    // Bottom obstacle - simple rect, no curves!
    ctx.fillRect(obs.x, gapBottom, width, VIRTUAL_HEIGHT - gapBottom);

    // Highlight on left edge
    ctx.fillStyle = highlightColor;
    ctx.fillRect(obs.x, 0, 4, gapTop);
    ctx.fillRect(obs.x, gapBottom, 4, VIRTUAL_HEIGHT - gapBottom);

    // Shadow on right edge
    ctx.fillStyle = shadowColor;
    ctx.fillRect(obs.x + width - 4, 0, 4, gapTop);
    ctx.fillRect(obs.x + width - 4, gapBottom, 4, VIRTUAL_HEIGHT - gapBottom);
  }
}

/**
 * Draw rounded rectangle path
 */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Render the player (Anty)
 */
function renderPlayer(
  ctx: CanvasRenderingContext2D,
  y: number,
  rotation: number,
  expression: 'idle' | 'happy'
): void {
  const size = ENGINE_PHYSICS.PLAYER_SIZE;
  const x = ENGINE_PHYSICS.PLAYER_X;

  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-size / 2, -size / 2);

  if (sprites.loaded && sprites.bodyLeft && sprites.bodyRight) {
    // Draw Anty from sprites
    const offset = size * 0.135;
    ctx.drawImage(sprites.bodyRight, offset, offset, size * 0.865, size * 0.865);
    ctx.drawImage(sprites.bodyLeft, 0, 0, size * 0.87, size * 0.87);

    if (expression === 'happy' && sprites.eyeHappyLeft && sprites.eyeHappyRight) {
      // Happy eyes (curved lines)
      const eyeY = size * 0.33;
      const eyeW = size * 0.145;
      const eyeH = size * 0.18;
      ctx.drawImage(sprites.eyeHappyLeft, size * 0.30, eyeY, eyeW, eyeH);
      ctx.drawImage(sprites.eyeHappyRight, size * 0.555, eyeY, eyeW, eyeH);
    } else {
      // Idle eyes (capsules)
      ctx.fillStyle = '#052333';
      const eyeW = size * 0.12;
      const eyeH = size * 0.28;
      const eyeY = size * 0.33;

      // Left eye
      roundedRect(ctx, size * 0.31, eyeY, eyeW, eyeH, eyeW / 2);
      ctx.fill();

      // Right eye
      roundedRect(ctx, size * 0.57, eyeY, eyeW, eyeH, eyeW / 2);
      ctx.fill();
    }
  } else {
    // Fallback: simple circle
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#052333';
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.4, 6, 0, Math.PI * 2);
    ctx.arc(size * 0.65, size * 0.4, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Render score display (in virtual coordinates)
 */
function renderScore(
  ctx: CanvasRenderingContext2D,
  score: number
): void {
  ctx.save();
  ctx.font = 'bold 32px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fillText(String(score), VIRTUAL_WIDTH / 2 + 1, 42);
  ctx.fillStyle = '#333';
  ctx.fillText(String(score), VIRTUAL_WIDTH / 2, 40);
  ctx.restore();
}

/**
 * Render ready screen (in virtual coordinates)
 */
function renderReadyScreen(
  ctx: CanvasRenderingContext2D
): void {
  ctx.save();
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#555';
  ctx.fillText('Press Space or Tap to Start', VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 80);
  ctx.restore();
}

/**
 * Render game over screen with restart progress (in virtual coordinates)
 */
function renderGameOver(
  ctx: CanvasRenderingContext2D,
  score: number,
  restartProgress: number = 0
): void {
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  ctx.save();
  ctx.textAlign = 'center';

  // Game Over text
  ctx.font = 'bold 32px system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('Game Over', VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 - 30);

  // Score
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(`Score: ${score}`, VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 10);

  // Restart hint
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('Hold Space to Restart', VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2 + 50);

  // Restart progress bar
  const barWidth = 160;
  const barHeight = 8;
  const barX = VIRTUAL_WIDTH / 2 - barWidth / 2;
  const barY = VIRTUAL_HEIGHT / 2 + 65;

  // Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  roundedRectPath(ctx, barX, barY, barWidth, barHeight, 4);
  ctx.fill();

  // Progress fill
  if (restartProgress > 0) {
    const fillWidth = barWidth * restartProgress;
    ctx.fillStyle = '#4ECDC4';
    roundedRectPath(ctx, barX, barY, fillWidth, barHeight, 4);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Helper for rounded rect path (used by progress bar)
 */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Lighten a hex color
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 255) + Math.round((255 - ((num >> 16) & 255)) * (percent / 100)));
  const g = Math.min(255, ((num >> 8) & 255) + Math.round((255 - ((num >> 8) & 255)) * (percent / 100)));
  const b = Math.min(255, (num & 255) + Math.round((255 - (num & 255)) * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Darken a hex color
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 255) - Math.round(((num >> 16) & 255) * (percent / 100)));
  const g = Math.max(0, ((num >> 8) & 255) - Math.round(((num >> 8) & 255) * (percent / 100)));
  const b = Math.max(0, (num & 255) - Math.round((num & 255) * (percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
