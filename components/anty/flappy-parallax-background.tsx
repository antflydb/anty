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
 * PERFORMANCE: Canvas setup only on dimension change, RAF for scroll updates
 */
export function FlappyParallaxBackground({
  scrollPosition,
  width,
  height,
}: FlappyParallaxBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastDimensionsRef = useRef<{ width: number; height: number; dpr: number } | null>(null);
  const scrollPositionRef = useRef(scrollPosition);

  // Keep scroll position ref updated
  scrollPositionRef.current = scrollPosition;

  // Setup canvas dimensions only when they change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const lastDims = lastDimensionsRef.current;

    // Only reconfigure if dimensions changed
    if (!lastDims || lastDims.width !== width || lastDims.height !== height || lastDims.dpr !== dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctxRef.current = ctx;
      }

      lastDimensionsRef.current = { width, height, dpr };
    }
  }, [width, height]);

  // Render loop - runs on RAF, reads scroll from ref
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || width === 0 || height === 0) return;

    let rafId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Simple clean gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#E3F2FD');
      gradient.addColorStop(1, '#F3E5F5');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw clouds using current scroll position from ref
      drawSimpleClouds(ctx, scrollPositionRef.current * 0.2, width, height);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(rafId);
  }, [width, height]); // Only restart loop on dimension change

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
