'use client';

import { useRef, useEffect } from 'react';

interface FlappyParallaxBackgroundProps {
  scrollPosition: number;
  width: number;
  height: number;
}

/**
 * Three-layer parallax scrolling background for FlappyAF
 * Each layer scrolls at a different speed to create depth
 */
export function FlappyParallaxBackground({
  scrollPosition,
  width,
  height,
}: FlappyParallaxBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Simple clean gradient - subtle and not distracting
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#E3F2FD');   // Very light blue top
    gradient.addColorStop(1, '#F3E5F5');   // Very light purple bottom

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Simple Mario-style clouds
    drawSimpleClouds(ctx, scrollPosition * 0.2, width, height);
  }, [scrollPosition, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/**
 * Draw continuous Mario-style cloud pattern (like classic Mario background)
 */
function drawSimpleClouds(
  ctx: CanvasRenderingContext2D,
  offset: number,
  width: number,
  height: number
) {
  // Single large row of clouds along the bottom - much more visible
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  drawContinuousCloudLine(ctx, offset, width, height * 0.80, 2.5);
}

/**
 * Draw a continuous wavy cloud line (classic Mario style)
 */
function drawContinuousCloudLine(
  ctx: CanvasRenderingContext2D,
  offset: number,
  width: number,
  y: number,
  scale: number
) {
  const bumpRadius = 35 * scale;
  const bumpSpacing = 50 * scale;
  const patternWidth = bumpSpacing * 4;

  const startX = -(offset % patternWidth);

  ctx.beginPath();

  // Start from bottom left
  ctx.moveTo(startX, y + bumpRadius * 2);

  // Draw scalloped top edge
  for (let x = startX; x < width + patternWidth; x += bumpSpacing) {
    // Create varied bump sizes for natural cloud look
    const variation = Math.sin(x * 0.1) * 0.2 + 1;
    const r = bumpRadius * variation;

    // Arc upward for cloud bump
    ctx.arc(x + bumpSpacing / 2, y, r, Math.PI, 0, false);
  }

  // Draw right edge down
  ctx.lineTo(width + patternWidth, y + bumpRadius * 2);

  // Draw bottom edge back
  ctx.lineTo(startX, y + bumpRadius * 2);

  ctx.closePath();
  ctx.fill();
}
