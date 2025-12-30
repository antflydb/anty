/**
 * FlappyAF Game Logic Hook
 * Main game state management and logic for the Flappy Bird clone
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import type {
  GameState,
  Obstacle,
  Collectible,
  PlayerState,
  GameConfig,
} from '@/lib/anty/game-state';
import {
  GAME_PHYSICS,
  getDifficultyConfig,
  updatePlayerPhysics,
  applyFlap,
  generateObstacle,
  generateCollectible,
  updateObstacles,
  updateCollectibles,
  shouldSpawnObstacle,
  checkObstacleCollision,
  checkPassedObstacles,
  checkCollectibleCollisions,
  checkDifficultyIncrease,
  applyMagneticPull,
} from '@/lib/anty/game-physics';

/**
 * Fun, pleasing color palette for passed obstacles
 */
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

/**
 * Get a random color from palette, ensuring it's different from the last color
 */
function getRandomCelebrationColor(lastColor?: string): string {
  const availableColors = lastColor
    ? CELEBRATION_COLORS.filter(c => c !== lastColor)
    : CELEBRATION_COLORS;
  return availableColors[Math.floor(Math.random() * availableColors.length)];
}

export interface UseFlappyGameOptions {
  /** Canvas width in pixels */
  canvasWidth: number;

  /** Canvas height in pixels */
  canvasHeight: number;

  /** Initial high score */
  initialHighScore: number;

  /** Callback when game over */
  onGameOver?: (score: number, isNewHighScore: boolean) => void;

  /** Callback when difficulty increases */
  onDifficultyIncrease?: (level: number) => void;

  /** Callback when collectible collected */
  onCollectibleCollected?: (x: number, y: number, value: number) => void;

  /** Callback when collision occurs */
  onCollision?: (x: number, y: number) => void;
}

export function useFlappyGame({
  canvasWidth,
  canvasHeight,
  initialHighScore,
  onGameOver,
  onDifficultyIncrease,
  onCollectibleCollected,
  onCollision,
}: UseFlappyGameOptions) {
  // Game state
  const [gameState, setGameState] = useState<GameState>('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(initialHighScore);

  // Player state
  const [player, setPlayer] = useState<PlayerState>({
    y: GAME_PHYSICS.PLAYER_START_Y,
    velocity: 0,
    rotation: 0,
  });

  // World state
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [config, setConfig] = useState<GameConfig>(getDifficultyConfig(0));
  const [scrollPosition, setScrollPosition] = useState(0); // Performance fix: moved from setInterval to RAF

  // Refs for game loop
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const lastCelebrationColorRef = useRef<string | undefined>(undefined);

  // Use refs to stabilize game loop and prevent constant recreation
  const gameStateRef = useRef(gameState);
  const configRef = useRef(config);
  const onCollisionRef = useRef(onCollision);
  const onDifficultyIncreaseRef = useRef(onDifficultyIncrease);
  const onCollectibleCollectedRef = useRef(onCollectibleCollected);

  // Keep refs synced (callbacks will update later after they're defined)
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { onCollisionRef.current = onCollision; }, [onCollision]);
  useEffect(() => { onDifficultyIncreaseRef.current = onDifficultyIncrease; }, [onDifficultyIncrease]);
  useEffect(() => { onCollectibleCollectedRef.current = onCollectibleCollected; }, [onCollectibleCollected]);

  /**
   * Start the game
   */
  const startGame = useCallback(() => {
    console.log('[GAME START] Canvas dimensions:', canvasWidth, 'x', canvasHeight);
    console.log('[GAME START] Player start position:', GAME_PHYSICS.PLAYER_START_Y);

    // Reset state
    setGameState('playing');
    setScore(0);
    setScrollPosition(0); // Performance fix: reset scroll position
    setPlayer({
      y: GAME_PHYSICS.PLAYER_START_Y,
      velocity: 0,
      rotation: 0,
    });
    setObstacles([]);
    setCollectibles([]);
    setConfig(getDifficultyConfig(0));
    lastCelebrationColorRef.current = undefined;

    // Spawn initial obstacles - start closer for immediate gameplay
    const initialObstacles: Obstacle[] = [];
    for (let i = 0; i < 3; i++) {
      initialObstacles.push(
        generateObstacle(
          canvasWidth * 0.4 + i * GAME_PHYSICS.OBSTACLE_SPACING_BASE,
          GAME_PHYSICS.OBSTACLE_GAP_HEIGHT_BASE
        )
      );
    }
    setObstacles(initialObstacles);

    lastFrameTimeRef.current = performance.now();
  }, [canvasWidth, canvasHeight]);

  /**
   * Flap (spacebar press)
   */
  const flap = useCallback(() => {
    if (gameState === 'ready') {
      startGame();
      return;
    }

    if (gameState !== 'playing') return;

    setPlayer(prev => applyFlap(prev));
  }, [gameState, startGame]);

  /**
   * Reset to ready state
   */
  const resetToReady = useCallback(() => {
    setGameState('ready');
    setScore(0);
    setScrollPosition(0); // Performance fix: reset scroll position
    setPlayer({
      y: GAME_PHYSICS.PLAYER_START_Y,
      velocity: 0,
      rotation: 0,
    });
    setObstacles([]);
    setCollectibles([]);
    setConfig(getDifficultyConfig(0));
  }, []);

  /**
   * Handle game over logic when state changes to game_over
   */
  useEffect(() => {
    if (gameState === 'game_over') {
      const isNewHighScore = score > highScore;
      if (isNewHighScore) {
        setHighScore(score);
      }
      onGameOver?.(score, isNewHighScore);
    }
  }, [gameState, score, highScore, onGameOver]);

  /**
   * Legacy handleGameOver for backward compatibility
   */
  const handleGameOver = useCallback(() => {
    setGameState('game_over');
  }, []);

  /**
   * Game loop - runs every frame when playing
   */
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (gameStateRef.current !== 'playing') return;

      // Calculate delta time (seconds)
      const deltaTime = Math.min(
        (currentTime - lastFrameTimeRef.current) / 1000,
        0.1 // Cap to avoid huge jumps
      );
      lastFrameTimeRef.current = currentTime;

      // Performance fix: Update scroll position using RAF (was setInterval)
      setScrollPosition(prev => prev + configRef.current.scrollSpeed * deltaTime * 60);

      // Update player physics
      setPlayer(prev => updatePlayerPhysics(prev, deltaTime * 60, canvasHeight));

      // Update world
      setObstacles(prev => updateObstacles(prev, configRef.current.scrollSpeed, deltaTime * 60));
      setCollectibles(prev => updateCollectibles(prev, configRef.current.scrollSpeed, deltaTime * 60));

      // Spawn new obstacles if needed
      setObstacles(prev => {
        if (shouldSpawnObstacle(prev, canvasWidth, configRef.current.obstacleSpacing)) {
          const newObstacle = generateObstacle(canvasWidth, configRef.current.gapHeight);

          // Maybe spawn collectible in FREE SPACE between obstacles (not in the gap)
          const newCollectibles: Collectible[] = [];
          if (Math.random() < GAME_PHYSICS.COLLECTIBLE_CHANCE && prev.length > 0) {
            const lastObstacle = prev[prev.length - 1];
            // Spawn in the middle of the free space between last obstacle and new obstacle
            const collectibleX = lastObstacle.x + GAME_PHYSICS.OBSTACLE_WIDTH + (newObstacle.x - (lastObstacle.x + GAME_PHYSICS.OBSTACLE_WIDTH)) / 2;
            // Random Y position in the safe flyable area
            const collectibleY = gsap.utils.random(100, canvasHeight - 100);
            newCollectibles.push(
              generateCollectible(collectibleX, collectibleY)
            );
          }

          if (newCollectibles.length > 0) {
            setCollectibles(cols => [...cols, ...newCollectibles]);
          }

          return [...prev, newObstacle];
        }
        return prev;
      });

      // Check collisions (use refs to get latest state)
      setPlayer(currentPlayer => {
        setObstacles(currentObstacles => {
          if (checkObstacleCollision(currentPlayer, currentObstacles, canvasHeight)) {
            onCollisionRef.current?.(
              GAME_PHYSICS.PLAYER_X + GAME_PHYSICS.PLAYER_SIZE / 2,
              currentPlayer.y + GAME_PHYSICS.PLAYER_SIZE / 2
            );
            handleGameOver();
          }

          // Check passed obstacles
          const passedIds = checkPassedObstacles(currentPlayer, currentObstacles);
          if (passedIds.length > 0) {
            setScore(prev => {
              const newScore = prev + passedIds.length;

              // Check difficulty increase
              if (checkDifficultyIncrease(prev, newScore)) {
                const level = Math.floor(newScore / GAME_PHYSICS.DIFFICULTY_SCORE_INTERVAL);
                setConfig(getDifficultyConfig(newScore));
                // Add 1 to level for display (start game is level 1, first announcement is level 2)
                onDifficultyIncreaseRef.current?.(level + 1);
              }

              return newScore;
            });

            // Mark as passed and assign celebration colors
            return currentObstacles.map(obs => {
              if (passedIds.includes(obs.id)) {
                const celebrationColor = getRandomCelebrationColor(lastCelebrationColorRef.current);
                lastCelebrationColorRef.current = celebrationColor;
                return { ...obs, passed: true, passedColor: celebrationColor };
              }
              return obs;
            });
          }

          return currentObstacles;
        });

        // Apply magnetic pull and check collectible collisions
        setCollectibles(currentCollectibles => {
          // First apply magnetic pull to nearby collectibles
          let magneticCollectibles = applyMagneticPull(currentPlayer, currentCollectibles, deltaTime * 60);

          // Then check for collisions
          const collectedIds = checkCollectibleCollisions(currentPlayer, magneticCollectibles);
          if (collectedIds.length > 0) {
            // Sum up the values of collected items
            const collected = magneticCollectibles.filter(col => collectedIds.includes(col.id));
            const totalPoints = collected.reduce((sum, col) => sum + col.value, 0);
            setScore(prev => prev + totalPoints);

            // Trigger effects
            collected.forEach(col => {
              onCollectibleCollectedRef.current?.(col.x, col.y, col.value);
            });

            // Mark as collected
            return magneticCollectibles.map(col =>
              collectedIds.includes(col.id) ? { ...col, collected: true } : col
            );
          }

          return magneticCollectibles;
        });

        return currentPlayer;
      });

      // Continue loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [canvasWidth, canvasHeight] // Only stable canvas dimensions - rest use refs
  );

  /**
   * Start/stop game loop based on game state
   */
  useEffect(() => {
    // Don't start game loop if canvas size isn't initialized yet
    if (canvasWidth === 0 || canvasHeight === 0) {
      return;
    }

    if (gameState === 'playing') {
      lastFrameTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop, canvasWidth, canvasHeight]);

  return {
    // State
    gameState,
    score,
    highScore,
    player,
    obstacles,
    collectibles,
    config,
    scrollPosition, // Performance fix: now managed by RAF game loop

    // Actions
    flap,
    startGame,
    resetToReady,
  };
}
