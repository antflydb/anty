'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createEngineState,
  flap,
  GameLoop,
  type EngineState,
} from '@/lib/anty/flappy-engine';
import { render, loadSprites } from '@/lib/anty/flappy-renderer';

interface FlappyGameProps {
  highScore: number;
  onExit: (finalScore: number, newHighScore: number) => void;
}

/**
 * FlappyAF Game - Rebuilt for Performance
 * Single canvas, single RAF loop, fixed timestep physics
 */
export function FlappyGame({ highScore: initialHighScore, onExit }: FlappyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const engineStateRef = useRef<EngineState>(createEngineState());
  const gameLoopRef = useRef<GameLoop | null>(null);
  const isHoldingRef = useRef(false);

  // Use refs instead of state - no React re-renders during gameplay!
  // (All game UI is rendered to canvas, not through React)
  const scoreRef = useRef(0);
  const highScoreRef = useRef(initialHighScore);

  // Canvas dimensions
  const [size, setSize] = useState({ width: 0, height: 0 });
  const dprRef = useRef(1);

  // Handle window resize
  useEffect(() => {
    const updateSize = () => {
      dprRef.current = window.devicePixelRatio || 1;
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Setup canvas with device pixel ratio
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;
    }
  }, [size.width, size.height]);

  // Render callback for game loop - uses cached context
  const sizeRef = useRef({ width: 0, height: 0 });
  sizeRef.current = size;

  const handleRender = useCallback((state: EngineState, alpha: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Reset transform for clean render (dpr cached to avoid DOM read every frame)
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);

    render(ctx, state, sizeRef.current.width, sizeRef.current.height, alpha);
  }, []); // No dependencies - uses refs

  // State change callback - just updates refs, no React re-renders!
  const handleStateChange = useCallback((phase: EngineState['phase'], score: number) => {
    scoreRef.current = score;
    if (phase === 'game_over' && score > highScoreRef.current) {
      highScoreRef.current = score;
    }
  }, []);

  // Initialize game loop - only recreate on actual size change
  useEffect(() => {
    if (size.width === 0) return;

    // Load sprites
    loadSprites();

    // Create game loop with hold state getter
    const loop = new GameLoop(
      engineStateRef.current,
      handleRender,
      handleStateChange,
      () => isHoldingRef.current
    );

    gameLoopRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      gameLoopRef.current = null;
    };
  }, [size.width, size.height]); // Only size changes - callbacks use refs

  // Handle flap input
  const handleFlap = useCallback(() => {
    flap(engineStateRef.current);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        isHoldingRef.current = true;
        handleFlap();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onExit(scoreRef.current, highScoreRef.current);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        isHoldingRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleFlap, onExit]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isHoldingRef.current = true;
      handleFlap();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isHoldingRef.current = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleFlap]);

  // Mouse controls (for hold-to-restart)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = () => {
      isHoldingRef.current = true;
      handleFlap();
    };

    const handleMouseUp = () => {
      isHoldingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleFlap]);

  // Loading state
  if (size.width === 0) {
    return (
      <div className="fixed inset-0 bg-sky-100 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        className="block"
        style={{ cursor: 'pointer' }}
      />

      {/* Exit button - only UI element outside canvas */}
      <button
        onClick={() => onExit(scoreRef.current, highScoreRef.current)}
        className="fixed top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors z-10"
        aria-label="Exit game"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
