'use client';

import { useRef, useEffect } from 'react';
import type { Obstacle, Collectible, PlayerState } from '@/lib/anty-v3/game-state';
import { GAME_PHYSICS } from '@/lib/anty-v3/game-physics';

interface FlappyGameCanvasProps {
  width: number;
  height: number;
  player: PlayerState;
  obstacles: Obstacle[];
  collectibles: Collectible[];
}

/**
 * Canvas renderer for FlappyAF game
 * Renders player (Anty), obstacles, and collectibles
 */
export function FlappyGameCanvas({
  width,
  height,
  player,
  obstacles,
  collectibles,
}: FlappyGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pre-render data stream pattern once
  useEffect(() => {
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = GAME_PHYSICS.OBSTACLE_WIDTH;
    patternCanvas.height = 100;
    const patternCtx = patternCanvas.getContext('2d');

    if (patternCtx) {
      drawDataPattern(patternCtx, 0, 0, GAME_PHYSICS.OBSTACLE_WIDTH, 100);
      patternCanvasRef.current = patternCanvas;
    }
  }, []);

  // Render game frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI setup
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Render obstacles
    obstacles.forEach(obstacle => {
      if (isOnScreen(obstacle.x, GAME_PHYSICS.OBSTACLE_WIDTH, width)) {
        drawObstacle(ctx, obstacle, height, patternCanvasRef.current);
      }
    });

    // Render collectibles
    collectibles.forEach(collectible => {
      if (
        !collectible.collected &&
        isOnScreen(collectible.x, GAME_PHYSICS.COLLECTIBLE_SIZE, width)
      ) {
        drawCollectible(ctx, collectible);
      }
    });

    // Note: Player (Anty) is rendered as actual component, not on canvas
  }, [width, height, obstacles, collectibles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

/**
 * Check if object is visible on screen (for render culling)
 */
function isOnScreen(x: number, width: number, canvasWidth: number): boolean {
  return x + width > 0 && x < canvasWidth;
}

/**
 * Draw obstacle (clean solid columns inspired by Flappy Bird)
 */
function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  canvasHeight: number,
  patternCanvas: HTMLCanvasElement | null
) {
  const gapTop = obstacle.gapY - obstacle.gapHeight / 2;
  const gapBottom = obstacle.gapY + obstacle.gapHeight / 2;
  const pipeWidth = GAME_PHYSICS.OBSTACLE_WIDTH;
  const cornerRadius = 8;

  // Main column color - very dark, almost black like the mockup
  const columnColor = '#1a1a1a';
  const highlightColor = '#2a2a2a';
  const shadowColor = '#0a0a0a';

  // Top column with rounded bottom corners
  ctx.fillStyle = columnColor;
  ctx.beginPath();
  ctx.moveTo(obstacle.x, 0);
  ctx.lineTo(obstacle.x + pipeWidth, 0);
  ctx.lineTo(obstacle.x + pipeWidth, gapTop - cornerRadius);
  ctx.arcTo(obstacle.x + pipeWidth, gapTop, obstacle.x + pipeWidth - cornerRadius, gapTop, cornerRadius);
  ctx.lineTo(obstacle.x + cornerRadius, gapTop);
  ctx.arcTo(obstacle.x, gapTop, obstacle.x, gapTop - cornerRadius, cornerRadius);
  ctx.lineTo(obstacle.x, 0);
  ctx.closePath();
  ctx.fill();

  // Left highlight (top column)
  ctx.fillStyle = highlightColor;
  ctx.fillRect(obstacle.x, 0, 4, gapTop - cornerRadius);

  // Right shadow (top column)
  ctx.fillStyle = shadowColor;
  ctx.fillRect(obstacle.x + pipeWidth - 4, 0, 4, gapTop - cornerRadius);

  // Bottom column with rounded top corners
  ctx.fillStyle = columnColor;
  ctx.beginPath();
  ctx.moveTo(obstacle.x, gapBottom + cornerRadius);
  ctx.arcTo(obstacle.x, gapBottom, obstacle.x + cornerRadius, gapBottom, cornerRadius);
  ctx.lineTo(obstacle.x + pipeWidth - cornerRadius, gapBottom);
  ctx.arcTo(obstacle.x + pipeWidth, gapBottom, obstacle.x + pipeWidth, gapBottom + cornerRadius, cornerRadius);
  ctx.lineTo(obstacle.x + pipeWidth, canvasHeight);
  ctx.lineTo(obstacle.x, canvasHeight);
  ctx.closePath();
  ctx.fill();

  // Left highlight (bottom column)
  ctx.fillStyle = highlightColor;
  ctx.fillRect(obstacle.x, gapBottom + cornerRadius, 4, canvasHeight - gapBottom - cornerRadius);

  // Right shadow (bottom column)
  ctx.fillStyle = shadowColor;
  ctx.fillRect(obstacle.x + pipeWidth - 4, gapBottom + cornerRadius, 4, canvasHeight - gapBottom - cornerRadius);
}

/**
 * Draw data pattern for obstacles
 */
function drawDataPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const blockSize = 8;
  const spacing = 10;

  for (let dy = 0; dy < height; dy += spacing) {
    for (let dx = 0; dx < width; dx += spacing) {
      if (Math.random() > 0.3) {
        // 70% fill rate
        ctx.fillStyle = Math.random() > 0.5 ? '#052333' : 'rgba(5, 35, 51, 0.7)';
        ctx.fillRect(x + dx, y + dy, blockSize, blockSize);
      }
    }
  }
}

/**
 * Draw collectible (sparkle, snack, or antfly logo)
 */
function drawCollectible(ctx: CanvasRenderingContext2D, collectible: Collectible) {
  const time = Date.now() / 1000;

  if (collectible.type === 'sparkle') {
    drawSparkle(ctx, collectible, time);
  } else if (collectible.type === 'snack') {
    drawSnack(ctx, collectible, time);
  } else if (collectible.type === 'antfly') {
    drawAntfly(ctx, collectible, time);
  }
}

/**
 * Draw sparkle collectible (5 points)
 */
function drawSparkle(ctx: CanvasRenderingContext2D, collectible: Collectible, time: number) {
  const scale = 1 + Math.sin(time * 4) * 0.08;
  const rotation = time * Math.PI * 0.5;

  ctx.save();
  ctx.translate(collectible.x, collectible.y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  // Main 4-point sparkle
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth = 2;

  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const x = Math.cos(angle) * 15;
    const y = Math.sin(angle) * 15;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    const innerAngle = angle + Math.PI / 4;
    ctx.lineTo(Math.cos(innerAngle) * 6, Math.sin(innerAngle) * 6);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Center glow
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF';
  ctx.fill();

  ctx.restore();
}

/**
 * Draw snack emoji (10 points)
 */
function drawSnack(ctx: CanvasRenderingContext2D, collectible: Collectible, time: number) {
  const scale = 1 + Math.sin(time * 3) * 0.1;
  const snacks = ['🍕', '🍔', '🌮', '🍩', '🍪', '🧁'];
  const snackIndex = Math.floor((collectible.x + collectible.y) / 100) % snacks.length;

  ctx.save();
  ctx.translate(collectible.x, collectible.y);
  ctx.scale(scale, scale);

  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(snacks[snackIndex], 0, 0);

  ctx.restore();
}

/**
 * Draw glowing Antfly logo (25 points)
 */
function drawAntfly(ctx: CanvasRenderingContext2D, collectible: Collectible, time: number) {
  const scale = 1 + Math.sin(time * 2) * 0.15;
  const glowIntensity = 0.5 + Math.sin(time * 3) * 0.5;

  ctx.save();
  ctx.translate(collectible.x, collectible.y);
  ctx.scale(scale, scale);

  // Glowing aura
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
  gradient.addColorStop(0, `rgba(255, 215, 0, ${glowIntensity * 0.8})`);
  gradient.addColorStop(0.5, `rgba(255, 165, 0, ${glowIntensity * 0.4})`);
  gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();

  // Logo circle
  ctx.fillStyle = '#052333';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  const innerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
  innerGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
  innerGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = innerGradient;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();

  // 'A' letter
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 22px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', 0, 1);

  ctx.restore();
}
