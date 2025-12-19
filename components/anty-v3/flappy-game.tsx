'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useFlappyGame } from '@/hooks/anty-v3/use-flappy-game';
import { FlappyGameCanvas } from './flappy-game-canvas';
import { FlappyGameHUD } from './flappy-game-hud';
import { FlappyGameOver } from './flappy-game-over';
import { FlappyParallaxBackground } from './flappy-parallax-background';
import { FlappyAnty } from './flappy-anty';
import { GAME_PHYSICS } from '@/lib/anty-v3/game-physics';

interface FlappyGameProps {
  /** Initial high score */
  highScore: number;

  /** Callback when exiting game */
  onExit: (finalScore: number, newHighScore: number) => void;
}

/**
 * FlappyAF Game Orchestrator
 * Main game component that coordinates all subsystems
 */
export function FlappyGame({ highScore, onExit }: FlappyGameProps) {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollPositionRef = useRef(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const shakeContainerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const [antyExpression, setAntyExpression] = useState<'idle' | 'happy'>('idle');

  // Initialize canvas size
  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize game
  const {
    gameState,
    score,
    highScore: currentHighScore,
    player,
    obstacles,
    collectibles,
    config,
    flap,
    startGame,
    resetToReady,
  } = useFlappyGame({
    canvasWidth: canvasSize.width,
    canvasHeight: canvasSize.height,
    initialHighScore: highScore,
    onGameOver: (finalScore, isNewHighScore) => {
      // Trigger death animation
      handleDeath();
    },
    onDifficultyIncrease: level => {
      // Flash border and show level popup
      handleDifficultyIncrease(level);
    },
    onCollectibleCollected: (x, y, value) => {
      // Spawn collection burst
      spawnCollectionBurst(x, y);
      showScorePopup(`+${value}`, x, y);
    },
    onCollision: (x, y) => {
      // Trigger collision effects
      screenShake();
      spawnDeathBurst(x, y);
    },
  });

  // Update scroll position for parallax
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        scrollPositionRef.current += config.scrollSpeed;
        setScrollPosition(scrollPositionRef.current);
      }, 16); // ~60fps

      return () => clearInterval(interval);
    }
  }, [gameState, config.scrollSpeed]);

  // Initial setup
  useEffect(() => {
    setAntyExpression('idle');
  }, []);

  // Staggered entrance animation for classy effect
  useEffect(() => {
    if (!backgroundRef.current || !shakeContainerRef.current || !hudRef.current) return;

    // Start everything invisible
    gsap.set([backgroundRef.current, shakeContainerRef.current, hudRef.current], {
      opacity: 0,
    });

    // Staggered fade-in
    const tl = gsap.timeline({ delay: 0.1 });

    tl.to(backgroundRef.current, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    });

    tl.to(
      shakeContainerRef.current,
      {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      },
      '-=0.2'
    );

    tl.to(
      hudRef.current,
      {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      },
      '-=0.2'
    );
  }, []);

  // Keyboard controls (only active during ready/playing, not game over)
  useEffect(() => {
    if (gameState === 'game_over') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        flap();

        // Toggle jump expression - briefly show happy
        setAntyExpression('happy');
        setTimeout(() => {
          setAntyExpression('idle');
        }, 200);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap, gameState]);

  /**
   * Handle death animation
   */
  const handleDeath = () => {
    // Death animation handled visually by physics
  };

  /**
   * Handle screen shake
   */
  const screenShake = () => {
    if (!shakeContainerRef.current) return;

    gsap.to(shakeContainerRef.current, {
      x: `+=${gsap.utils.random(-10, 10)}`,
      y: `+=${gsap.utils.random(-10, 10)}`,
      duration: 0.05,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        if (shakeContainerRef.current) {
          gsap.set(shakeContainerRef.current, { x: 0, y: 0 });
        }
      },
    });
  };

  /**
   * Spawn death particle burst
   */
  const spawnDeathBurst = (x: number, y: number) => {
    // Particle effects removed for simplicity
  };

  /**
   * Spawn collection burst
   */
  const spawnCollectionBurst = (x: number, y: number) => {
    // Particle effects removed for simplicity
  };

  /**
   * Show score popup
   */
  const showScorePopup = (text: string, x: number, y: number) => {
    const popup = document.createElement('div');
    popup.textContent = text;
    popup.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: #FFD700;
      font-size: 28px;
      font-weight: bold;
      pointer-events: none;
      z-index: 1000;
      font-family: system-ui;
      transform: translateX(-50%);
    `;
    document.body.appendChild(popup);

    gsap.fromTo(
      popup,
      { y: 0, opacity: 1, scale: 0.5 },
      {
        y: -50,
        opacity: 0,
        scale: 1.5,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => popup.remove(),
      }
    );
  };

  /**
   * Show level announcement popup - BIG and OBVIOUS near bottom
   */
  const showLevelPopup = (level: number) => {
    const popup = document.createElement('div');
    popup.textContent = `LEVEL ${level}`;
    popup.style.cssText = `
      position: fixed;
      left: 50%;
      bottom: 150px;
      transform: translateX(-50%);
      color: #FFD700;
      font-size: 96px;
      font-weight: bold;
      pointer-events: none;
      z-index: 1000;
      font-family: system-ui;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5), 0 8px 16px rgba(0,0,0,0.6);
    `;
    document.body.appendChild(popup);

    gsap.fromTo(
      popup,
      { scale: 0, opacity: 0, rotation: -15 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.4,
        ease: 'back.out(2)',
      }
    );

    gsap.to(popup, {
      opacity: 0,
      scale: 0.8,
      y: -30,
      duration: 0.5,
      delay: 1.2,
      ease: 'power2.in',
      onComplete: () => popup.remove(),
    });
  };

  /**
   * Handle difficulty increase
   */
  const handleDifficultyIncrease = (level: number) => {
    if (!gameContainerRef.current) return;

    // Flash border - stronger
    gsap.fromTo(
      gameContainerRef.current,
      { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)' },
      {
        boxShadow: '0 0 80px 30px rgba(255, 215, 0, 1)',
        duration: 0.25,
        yoyo: true,
        repeat: 2,
      }
    );

    // Show BIG level popup
    showLevelPopup(level);
  };

  /**
   * Handle exit
   */
  const handleExit = () => {
    onExit(score, currentHighScore);
  };

  /**
   * Handle play again - jump directly back into gameplay
   */
  const handlePlayAgain = () => {
    startGame();
  };

  // Don't render until canvas size is initialized
  if (canvasSize.width === 0 || canvasSize.height === 0) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center" style={{ zIndex: 100 }}>
        <p className="text-2xl">Loading game...</p>
      </div>
    );
  }

  return (
    <div
      ref={gameContainerRef}
      className="fixed inset-0 bg-white overflow-hidden"
      style={{ zIndex: 100 }}
    >
      {/* Parallax Background - Static, doesn't shake */}
      <div ref={backgroundRef}>
        <FlappyParallaxBackground
          scrollPosition={scrollPosition}
          width={canvasSize.width}
          height={canvasSize.height}
        />
      </div>

      {/* Shake Container - Only game elements shake */}
      <div ref={shakeContainerRef}>
        {/* Game Canvas */}
        <FlappyGameCanvas
          width={canvasSize.width}
          height={canvasSize.height}
          player={player}
          obstacles={obstacles}
          collectibles={collectibles}
        />

        {/* Anty Character */}
        <div
          style={{
            position: 'fixed',
            left: `${GAME_PHYSICS.PLAYER_X}px`,
            top: `${player.y}px`,
            transform: `rotate(${player.rotation}deg)`,
            transformOrigin: 'center center',
            zIndex: 6,
            pointerEvents: 'none',
          }}
        >
          <FlappyAnty expression={antyExpression} size={80} />
        </div>
      </div>

      {/* HUD */}
      <div ref={hudRef}>
        <FlappyGameHUD gameState={gameState} score={score} highScore={currentHighScore} />
      </div>

      {/* Game Over Modal */}
      {gameState === 'game_over' && (
        <FlappyGameOver
          score={score}
          highScore={currentHighScore}
          isNewHighScore={score === currentHighScore && score > highScore}
          onPlayAgain={handlePlayAgain}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
