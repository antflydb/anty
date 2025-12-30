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

  // PERFORMANCE FIX: Use refs to hold mutable game state during gameplay
  // This avoids nested setState calls and allows single batched updates per frame
  const gameStateRef = useRef(gameState);
  const configRef = useRef(config);
  const playerRef = useRef(player);
  const obstaclesRef = useRef(obstacles);
  const collectiblesRef = useRef(collectibles);
  const scoreRef = useRef(score);
  const scrollPositionRef = useRef(scrollPosition);

  // Callback refs to avoid re-creating game loop
  const onCollisionRef = useRef(onCollision);
  const onDifficultyIncreaseRef = useRef(onDifficultyIncrease);
  const onCollectibleCollectedRef = useRef(onCollectibleCollected);
  const handleGameOverRef = useRef<() => void>(() => {});

  // Keep refs synced with state
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { collectiblesRef.current = collectibles; }, [collectibles]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { scrollPositionRef.current = scrollPosition; }, [scrollPosition]);
  useEffect(() => { onCollisionRef.current = onCollision; }, [onCollision]);
  useEffect(() => { onDifficultyIncreaseRef.current = onDifficultyIncrease; }, [onDifficultyIncrease]);
  useEffect(() => { onCollectibleCollectedRef.current = onCollectibleCollected; }, [onCollectibleCollected]);

  /**
   * Start the game
   * PERFORMANCE FIX: Now also initializes refs for the game loop
   */
  const startGame = useCallback(() => {
    console.log('[GAME START] Canvas dimensions:', canvasWidth, 'x', canvasHeight);
    console.log('[GAME START] Player start position:', GAME_PHYSICS.PLAYER_START_Y);

    const initialPlayer = {
      y: GAME_PHYSICS.PLAYER_START_Y,
      velocity: 0,
      rotation: 0,
    };
    const initialConfig = getDifficultyConfig(0);

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

    // Reset state
    setGameState('playing');
    setScore(0);
    setScrollPosition(0);
    setPlayer(initialPlayer);
    setObstacles(initialObstacles);
    setCollectibles([]);
    setConfig(initialConfig);
    lastCelebrationColorRef.current = undefined;

    // PERFORMANCE FIX: Initialize refs to match initial state
    // This ensures the game loop starts with correct values
    playerRef.current = initialPlayer;
    obstaclesRef.current = initialObstacles;
    collectiblesRef.current = [];
    scoreRef.current = 0;
    scrollPositionRef.current = 0;
    configRef.current = initialConfig;

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
   * PERFORMANCE FIX: Also resets refs to ensure clean state
   */
  const resetToReady = useCallback(() => {
    const initialPlayer = {
      y: GAME_PHYSICS.PLAYER_START_Y,
      velocity: 0,
      rotation: 0,
    };
    const initialConfig = getDifficultyConfig(0);

    setGameState('ready');
    setScore(0);
    setScrollPosition(0);
    setPlayer(initialPlayer);
    setObstacles([]);
    setCollectibles([]);
    setConfig(initialConfig);

    // Reset refs
    playerRef.current = initialPlayer;
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    scoreRef.current = 0;
    scrollPositionRef.current = 0;
    configRef.current = initialConfig;
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

  // Keep handleGameOverRef updated
  useEffect(() => { handleGameOverRef.current = handleGameOver; }, [handleGameOver]);

  /**
   * Game loop - runs every frame when playing
   * PERFORMANCE FIX: Completely restructured to avoid nested setState calls
   * All state is read from refs, computed, then written in a single batch
   */
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (gameStateRef.current !== 'playing') return;

      // Calculate delta time (normalized to 60fps)
      const deltaTime = Math.min(
        (currentTime - lastFrameTimeRef.current) / 1000,
        0.1 // Cap to avoid huge jumps
      );
      lastFrameTimeRef.current = currentTime;
      const dt = deltaTime * 60; // Normalize to 60fps frame time

      // ============ READ CURRENT STATE FROM REFS ============
      const currentConfig = configRef.current;
      const currentScore = scoreRef.current;

      // ============ COMPUTE NEW STATE ============
      // 1. Update scroll position
      const newScrollPosition = scrollPositionRef.current + currentConfig.scrollSpeed * dt;

      // 2. Update player physics
      const newPlayer = updatePlayerPhysics(playerRef.current, dt, canvasHeight);

      // 3. Update obstacles and collectibles positions
      let newObstacles = updateObstacles(obstaclesRef.current, currentConfig.scrollSpeed, dt);
      let newCollectibles = updateCollectibles(collectiblesRef.current, currentConfig.scrollSpeed, dt);

      // 4. Track score and config changes
      let newScore = currentScore;
      let newConfig = currentConfig;

      // 5. Spawn new obstacles if needed
      if (shouldSpawnObstacle(newObstacles, canvasWidth, currentConfig.obstacleSpacing)) {
        const newObstacle = generateObstacle(canvasWidth, currentConfig.gapHeight);

        // Maybe spawn collectible in FREE SPACE between obstacles
        if (Math.random() < GAME_PHYSICS.COLLECTIBLE_CHANCE && newObstacles.length > 0) {
          const lastObstacle = newObstacles[newObstacles.length - 1];
          const collectibleX = lastObstacle.x + GAME_PHYSICS.OBSTACLE_WIDTH +
            (newObstacle.x - (lastObstacle.x + GAME_PHYSICS.OBSTACLE_WIDTH)) / 2;
          const collectibleY = gsap.utils.random(100, canvasHeight - 100);
          newCollectibles = [...newCollectibles, generateCollectible(collectibleX, collectibleY)];
        }

        newObstacles = [...newObstacles, newObstacle];
      }

      // 6. Check obstacle collision (game over condition)
      if (checkObstacleCollision(newPlayer, newObstacles, canvasHeight)) {
        onCollisionRef.current?.(
          GAME_PHYSICS.PLAYER_X + GAME_PHYSICS.PLAYER_SIZE / 2,
          newPlayer.y + GAME_PHYSICS.PLAYER_SIZE / 2
        );
        handleGameOverRef.current();
        return; // Exit early on collision
      }

      // 7. Check passed obstacles - PERFORMANCE FIX: Use Set for O(1) lookup
      const passedIds = checkPassedObstacles(newPlayer, newObstacles);
      if (passedIds.length > 0) {
        const passedIdSet = new Set(passedIds); // O(1) lookup instead of O(n) includes()
        newScore += passedIds.length;

        // Check difficulty increase
        if (checkDifficultyIncrease(currentScore, newScore)) {
          const level = Math.floor(newScore / GAME_PHYSICS.DIFFICULTY_SCORE_INTERVAL);
          newConfig = getDifficultyConfig(newScore);
          onDifficultyIncreaseRef.current?.(level + 1);
        }

        // Mark as passed and assign celebration colors - O(1) Set lookup
        newObstacles = newObstacles.map(obs => {
          if (passedIdSet.has(obs.id)) {
            const celebrationColor = getRandomCelebrationColor(lastCelebrationColorRef.current);
            lastCelebrationColorRef.current = celebrationColor;
            return { ...obs, passed: true, passedColor: celebrationColor };
          }
          return obs;
        });
      }

      // 8. Apply magnetic pull to collectibles
      newCollectibles = applyMagneticPull(newPlayer, newCollectibles, dt);

      // 9. Check collectible collisions - PERFORMANCE FIX: Use Set for O(1) lookup
      const collectedIds = checkCollectibleCollisions(newPlayer, newCollectibles);
      if (collectedIds.length > 0) {
        const collectedIdSet = new Set(collectedIds); // O(1) lookup instead of O(n) includes()
        const collected = newCollectibles.filter(col => collectedIdSet.has(col.id));
        newScore += collected.reduce((sum, col) => sum + col.value, 0);

        // Trigger effects for each collected item
        collected.forEach(col => {
          onCollectibleCollectedRef.current?.(col.x, col.y, col.value);
        });

        // Mark as collected - O(1) Set lookup
        newCollectibles = newCollectibles.map(col =>
          collectedIdSet.has(col.id) ? { ...col, collected: true } : col
        );
      }

      // ============ UPDATE REFS (for next frame computation) ============
      scrollPositionRef.current = newScrollPosition;
      playerRef.current = newPlayer;
      obstaclesRef.current = newObstacles;
      collectiblesRef.current = newCollectibles;
      scoreRef.current = newScore;
      configRef.current = newConfig;

      // ============ SINGLE BATCHED REACT STATE UPDATE ============
      // This is the key performance fix - all state updates happen together
      // React will batch these in the same render cycle
      setScrollPosition(newScrollPosition);
      setPlayer(newPlayer);
      setObstacles(newObstacles);
      setCollectibles(newCollectibles);
      if (newScore !== currentScore) {
        setScore(newScore);
      }
      if (newConfig !== currentConfig) {
        setConfig(newConfig);
      }

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
