'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
// Import Anty from the package (source of truth)
import { AntyCharacter, type AntyCharacterHandle, type EmotionType, DEFAULT_SEARCH_BAR_CONFIG, ENABLE_ANIMATION_DEBUG_LOGS, AntyChatPanel } from '@antfly/anty-embed';
// Playground-specific components (not part of the package)
import { ActionButtons, HeartMeter, ExpressionMenu, PowerButton, FlappyGame, FPSMeter, type ButtonName, type EarnedHeart } from '@/components/anty';
import { AnimationDebugOverlay } from '@/components/anty/animation-debug-overlay';
import { EyeDebugBoxes } from '@/components/anty/eye-debug-boxes';
import { SearchBarDemoMenu, getStoredSearchBarConfig } from '@/components/anty/search-bar-demo-menu';
import type { AntyStats } from '@/lib/anty/stat-system';

// Chat panel layout constants
const CHAT_PANEL_WIDTH = 384;
const CHAT_OFFSET = CHAT_PANEL_WIDTH / 2; // Character shifts left by half panel width when chat opens

// Animation timing constants
const HEART_DISPLAY_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes
const SUPER_MODE_SCALE = 1.45;

export default function Anty() {
  // Game mode state
  const [gameMode, setGameMode] = useState<'idle' | 'game'>('idle');
  const [gameHighScore, setGameHighScore] = useState(0);
  const [showWhiteFade, setShowWhiteFade] = useState(false);
  const whiteFadeRef = useRef<HTMLDivElement>(null);

  // Chat panel state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('anty-flappy-high-score');
    if (saved) setGameHighScore(parseInt(saved, 10));
  }, []);

  // Save high score when changed
  useEffect(() => {
    if (gameHighScore > 0) {
      localStorage.setItem('anty-flappy-high-score', gameHighScore.toString());
    }
  }, [gameHighScore]);

  const [hearts, setHearts] = useState(3);
  const [expression, setExpressionInternal] = useState<EmotionType | 'idle' | 'off'>('idle');
  const [isExpressionMenuExpanded, setIsExpressionMenuExpanded] = useState(false);

  const setExpression = (newExpr: EmotionType | 'idle' | 'off') => {
    setExpressionInternal(newExpr);
  };

  const [stats, setStats] = useState<AntyStats>({
    energy: 100,
    happiness: 100,
    knowledge: 50,
    indexHealth: 100,
  });
  const [earnedHearts, setEarnedHearts] = useState<EarnedHeart[]>([]);
  const [showHearts, setShowHearts] = useState(false); // Hidden until first eat
  const heartsHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const characterRef = useRef<HTMLDivElement>(null);
  const antyRef = useRef<AntyCharacterHandle>(null);
  // External shadow ref for playground (character component will use this instead of internal)
  const shadowRef = useRef<HTMLDivElement>(null);
  const moodsButtonRef = useRef<HTMLButtonElement>(null);
  const heartTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const superModeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const superModeCooldownRef = useRef<boolean>(false);
  const [isSuperMode, setIsSuperMode] = useState(false);
  const spinDescentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expressionResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memory leak fix: Track all sparkles and animation timers for cleanup
  const sparkleCleanupRef = useRef<Set<HTMLElement>>(new Set());
  const animationTimersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const lastAnimationTimeRef = useRef<number>(0);

  // Search mode state
  const [searchActive, setSearchActive] = useState(false);

  // Search bar config (loaded from sessionStorage for demo purposes)
  // Initialize with defaults to avoid hydration mismatch - sessionStorage read in useEffect
  const [searchBarConfig, setSearchBarConfig] = useState(DEFAULT_SEARCH_BAR_CONFIG);

  // Load custom config from sessionStorage after hydration
  useEffect(() => {
    const stored = getStoredSearchBarConfig();
    setSearchBarConfig(stored);
  }, []);

  // Hold-style look state
  const lookHeldRef = useRef<'left' | 'right' | null>(null);
  // Search handled by AntyCharacter internally

  // Debug mode - shows boundary boxes around all elements
  const [debugMode, setDebugMode] = useState(false);

  // Animation sequence tracking for debug overlay
  const [currentAnimationSequence, setCurrentAnimationSequence] = useState<string>('IDLE');
  const [lastRandomAction, setLastRandomAction] = useState<string>('');

  // Debug mode keyboard shortcut (D key) - disabled in chat/search mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Disable D key in chat or search mode
      if (isChatOpen || searchActive) return;

      if (e.key === 'd' || e.key === 'D') {
        setDebugMode(prev => !prev);
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
          console.log('[DEBUG MODE]', !debugMode ? 'ENABLED' : 'DISABLED');
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugMode, isChatOpen, searchActive]);

  // Sync debug boxes with element positions in real-time
  useEffect(() => {
    if (!debugMode) return;

    let animationFrameId: number;

    const updateDebugBoxes = () => {
      const shadow = antyRef.current?.shadowRef?.current;
      const innerGlow = antyRef.current?.innerGlowRef?.current;
      const outerGlow = antyRef.current?.outerGlowRef?.current;

      const shadowDebug = document.getElementById('debug-shadow');
      const innerGlowDebug = document.getElementById('debug-inner-glow');
      const outerGlowDebug = document.getElementById('debug-outer-glow');

      if (shadow && shadowDebug) {
        const transform = window.getComputedStyle(shadow).transform;
        shadowDebug.style.transform = transform;
        shadowDebug.style.opacity = window.getComputedStyle(shadow).opacity;
      }

      if (innerGlow && innerGlowDebug) {
        const rect = innerGlow.getBoundingClientRect();
        innerGlowDebug.style.left = `${rect.left}px`;
        innerGlowDebug.style.top = `${rect.top}px`;
        innerGlowDebug.style.width = `${rect.width}px`;
        innerGlowDebug.style.height = `${rect.height}px`;
        innerGlowDebug.style.opacity = window.getComputedStyle(innerGlow).opacity;
      }

      if (outerGlow && outerGlowDebug) {
        const rect = outerGlow.getBoundingClientRect();
        outerGlowDebug.style.left = `${rect.left}px`;
        outerGlowDebug.style.top = `${rect.top}px`;
        outerGlowDebug.style.width = `${rect.width}px`;
        outerGlowDebug.style.height = `${rect.height}px`;
        outerGlowDebug.style.opacity = window.getComputedStyle(outerGlow).opacity;
      }

      animationFrameId = requestAnimationFrame(updateDebugBoxes);
    };

    updateDebugBoxes();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [debugMode]);

  // Helper function to clear any pending expression reset
  const clearExpressionReset = () => {
    if (expressionResetTimerRef.current) {
      clearTimeout(expressionResetTimerRef.current);
      expressionResetTimerRef.current = null;
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[EXPRESSION TIMER] Cleared pending reset');
      }
    }
  };

  // Helper function to schedule expression reset to idle
  const scheduleExpressionReset = (delayMs: number) => {
    clearExpressionReset(); // Clear any existing timeout first
    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log(`[EXPRESSION TIMER] Scheduling reset to idle in ${delayMs}ms`);
    }
    expressionResetTimerRef.current = setTimeout(() => {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[EXPRESSION TIMER] Executing scheduled reset to idle');
      }
      setExpression('idle');
      expressionResetTimerRef.current = null;
    }, delayMs);
  };

  // Memory leak fix: Clear all sparkle DOM nodes
  const clearAllSparkles = () => {
    sparkleCleanupRef.current.forEach(el => {
      if (el.parentNode) {
        document.body.removeChild(el);
      }
    });
    sparkleCleanupRef.current.clear();
  };

  // Memory leak fix: Clear all animation timers
  const clearAllAnimationTimers = () => {
    animationTimersRef.current.forEach(timer => clearTimeout(timer));
    animationTimersRef.current.clear();
  };

  // Memory leak fix: Helper for tracked timeouts
  const createTrackedTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timer = setTimeout(() => {
      animationTimersRef.current.delete(timer);
      callback();
    }, delay);
    animationTimersRef.current.add(timer);
    return timer;
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearAllSparkles();
      clearAllAnimationTimers();
    };
  }, []);

  // Centralized emotion animation trigger - reused by chat and expression menu
  const triggerEmotionAnimation = (expr: EmotionType | 'idle' | 'off', isChatOpen = false) => {
    // Memory leak fix: Add debounce to prevent animation spam
    const now = Date.now();
    const ANIMATION_COOLDOWN = 300; // ms
    if (now - lastAnimationTimeRef.current < ANIMATION_COOLDOWN) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[ANIMATION] Ignoring rapid trigger - cooldown active');
      }
      return;
    }
    lastAnimationTimeRef.current = now;

    // Use animation controller
    if (antyRef.current?.playEmotion) {
      // Filter out non-emotion states
      if (expr === 'idle' || expr === 'off') {
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
          console.log('[ANIMATION] Skipping non-emotion state:', expr);
        }
        setExpression(expr);
        return;
      }

      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[ANIMATION] Using controller for emotion:', expr);
      }
      const success = antyRef.current.playEmotion(expr, { isChatOpen });
      if (success) {
        // Update expression state for facial expressions
        setExpression(expr);
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
          console.log('[ANIMATION] Controller handled emotion successfully');
        }

        // Spawn yellow sparkle burst from right eye during wink
        if (expr === 'wink') {
          const canvasOffset = (160 * 5) / 2;
          // Right eye position (slightly right of center, at eye level)
          const rightEyeX = canvasOffset + 35;
          const rightEyeY = canvasOffset - 10;
          for (let i = 0; i < 6; i++) {
            setTimeout(() => {
              antyRef.current?.spawnSparkle?.(
                rightEyeX + gsap.utils.random(-15, 15),
                rightEyeY + gsap.utils.random(-15, 15),
                '#FFD700' // Gold/yellow
              );
            }, 50 + i * 40);
          }
        }
      } else {
        console.warn('[ANIMATION] Controller declined emotion:', expr);
      }
    } else {
      console.warn('[ANIMATION] Controller not available for:', expr);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable all keyboard shortcuts when chat or search is open
      if (isChatOpen || searchActive) {
        return;
      }

      // Space key for simple jump
      if ((e.key === ' ' || e.key === 'Space') && !e.repeat) {
        e.preventDefault();
        if (expression !== 'off' && antyRef.current?.playEmotion) {
          antyRef.current.playEmotion('jump');
        }
      }

      // Hold-style look: [ for left, ] for right
      // Only trigger on initial keydown (not on repeat)
      if (e.key === '[' && !e.repeat && expression !== 'off') {
        if (lookHeldRef.current !== 'left') {
          lookHeldRef.current = 'left';
          antyRef.current?.startLook?.('left');
        }
      }
      if (e.key === ']' && !e.repeat && expression !== 'off') {
        if (lookHeldRef.current !== 'right') {
          lookHeldRef.current = 'right';
          antyRef.current?.startLook?.('right');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Disable keyboard shortcuts when chat or search is open
      if (isChatOpen || searchActive) {
        return;
      }

      // Release look when [ or ] is released
      if ((e.key === '[' && lookHeldRef.current === 'left') ||
          (e.key === ']' && lookHeldRef.current === 'right')) {
        lookHeldRef.current = null;
        antyRef.current?.endLook?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [expression, isChatOpen, searchActive]);

  // Click outside handler for search mode
  useEffect(() => {
    if (!searchActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Ignore if clicking inside anty container (which contains the search bar)
      if (characterRef.current?.contains(target)) return;

      // Ignore if clicking on demo menu
      if (target.closest('[data-search-demo-menu]')) return;

      antyRef.current?.morphToCharacter?.();
    };

    // Delay listener to prevent immediate closure from trigger click
    const timerId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchActive]);

  // Command+K to toggle search mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        console.log('[CMD+K] Triggered', {
          searchActive,
          hasRef: !!antyRef.current,
          hasMorphToSearchBar: typeof antyRef.current?.morphToSearchBar,
          hasMorphToCharacter: typeof antyRef.current?.morphToCharacter
        });
        // Close chat if open
        if (isChatOpen) {
          setIsChatOpen(false);
        }
        if (searchActive) {
          antyRef.current?.morphToCharacter?.();
        } else {
          antyRef.current?.morphToSearchBar?.();
        }
      }
      // Command+L to toggle chat
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        event.preventDefault();
        // Close search if open
        if (searchActive) {
          antyRef.current?.morphToCharacter?.();
        }
        setIsChatOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchActive, isChatOpen]);

  // Keyboard handlers for search mode
  useEffect(() => {
    if (!searchActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        antyRef.current?.morphToCharacter?.();
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        // Future: trigger search functionality
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchActive]);

  // NOTE: Glow animation is now handled by GlowSystem in the animation controller
  // The physics-based tracking + oscillation replaces the old random ghostly movement

  // Show hearts and start 3-minute hide timer
  const showHeartsWithTimer = useCallback(() => {
    // Show hearts
    setShowHearts(true);

    // Clear existing hide timer
    if (heartsHideTimerRef.current) {
      clearTimeout(heartsHideTimerRef.current);
    }

    // Start 3-minute timer to hide hearts
    heartsHideTimerRef.current = setTimeout(() => {
      setShowHearts(false);
      heartsHideTimerRef.current = null;
    }, HEART_DISPLAY_TIMEOUT_MS);
  }, []);

  // Cleanup heart timers on unmount
  useEffect(() => {
    return () => {
      heartTimersRef.current.forEach((timer) => clearTimeout(timer));
      heartTimersRef.current.clear();
      if (superModeTimerRef.current) {
        clearTimeout(superModeTimerRef.current);
      }
      if (expressionResetTimerRef.current) {
        clearTimeout(expressionResetTimerRef.current);
      }
      if (spinDescentTimerRef.current) {
        clearTimeout(spinDescentTimerRef.current);
      }
      if (heartsHideTimerRef.current) {
        clearTimeout(heartsHideTimerRef.current);
      }
    };
  }, []);

  // Check if all 3 hearts are earned and trigger SUPER MODE!
  useEffect(() => {
    const allHeartsEarned = earnedHearts.length === 3;

    if (allHeartsEarned && !isSuperMode && !superModeCooldownRef.current) {
      // SUPER MARIO STYLE GROWTH!!! 🍄
      const character = characterRef.current;
      if (!character) return;

      // Clear any existing super mode timer
      if (superModeTimerRef.current) {
        clearTimeout(superModeTimerRef.current);
      }

      setIsSuperMode(true);
      superModeCooldownRef.current = true; // Set cooldown to prevent re-triggering

      // Use AnimationController for super mode transformation
      if (antyRef.current?.playEmotion) {
        antyRef.current.playEmotion('super');
        // Track super mode scale in controller (preserves scale during other emotions)
        antyRef.current.setSuperMode?.(SUPER_MODE_SCALE);
      }

      // Spawn celebration sparkles during transformation
      setTimeout(() => {
        const canvasOffset = (160 * 5) / 2;
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            antyRef.current?.spawnSparkle?.(
              canvasOffset + gsap.utils.random(60, 100),
              canvasOffset + gsap.utils.random(40, 80)
            );
          }, i * 30);
        }
      }, 0);

      // Stay SUPER for 15 seconds
      superModeTimerRef.current = setTimeout(() => {
        // Clear super mode scale FIRST so any idle recreation uses baseScale = 1
        antyRef.current?.setSuperMode?.(null);

        // Kill all animations to ensure idle is recreated fresh with scale 1
        // This prevents the old idle (which may have captured scale 1.45) from interfering
        antyRef.current?.killAll?.();

        // Reset eyes to normal state (killAll may have interrupted mid-emotion with weird eye transforms)
        const leftEye = antyRef.current?.leftEyeRef?.current;
        const rightEye = antyRef.current?.rightEyeRef?.current;
        if (leftEye && rightEye) {
          gsap.set([leftEye, rightEye], {
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            x: 0,
            y: 0,
          });
        }

        // Animate scale back to normal, THEN update all state
        // CRITICAL: Use the INNER character div (where scale was applied), not the outer wrapper
        const characterElement = antyRef.current?.characterRef?.current;

        const cleanupSuperMode = () => {
          // All state updates happen AFTER animation completes
          // This prevents React re-renders from interfering with the scale animation
          setIsSuperMode(false);
          setExpression('idle');
          superModeTimerRef.current = null;

          // Reset all earned hearts when reverting to normal
          setEarnedHearts([]);
          // Clear all heart timers
          heartTimersRef.current.forEach((timer) => clearTimeout(timer));
          heartTimersRef.current.clear();

          // Hide hearts when super mode ends (until next eat)
          setShowHearts(false);
          if (heartsHideTimerRef.current) {
            clearTimeout(heartsHideTimerRef.current);
            heartsHideTimerRef.current = null;
          }
        };

        if (characterElement) {
          gsap.to(characterElement, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: cleanupSuperMode
          });
        } else {
          // Fallback if no character element
          cleanupSuperMode();
        }
      }, 15000);
    }

    // Reset cooldown when hearts are lost (less than 3)
    if (earnedHearts.length < 3 && superModeCooldownRef.current) {
      superModeCooldownRef.current = false;
    }
  }, [earnedHearts, isSuperMode]);

  // Function to earn a heart (turn it purple)
  const earnHeart = (index: number) => {
    // Clear any existing timer for this heart
    const existingTimer = heartTimersRef.current.get(index);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Add heart with pulsing animation
    setEarnedHearts((prev) => {
      const filtered = prev.filter((h) => h.index !== index);
      return [...filtered, { index, earnedAt: Date.now(), isPulsing: true }];
    });

    // Stop pulsing after animation completes
    setTimeout(() => {
      setEarnedHearts((prev) =>
        prev.map((h) => (h.index === index ? { ...h, isPulsing: false } : h))
      );
    }, 1200);

    // Set 10-minute timer to remove this earned heart
    const timer = setTimeout(() => {
      setEarnedHearts((prev) => prev.filter((h) => h.index !== index));
      heartTimersRef.current.delete(index);
    }, 10 * 60 * 1000); // 10 minutes

    heartTimersRef.current.set(index, timer);
  };

  // Update stats after game ends
  const updateStatsFromGame = (finalScore: number, newHighScore: number, isNewHighScore: boolean) => {
    const happinessGain = Math.min(30, finalScore * 2);
    const energyLoss = 15;
    const knowledgeGain = Math.floor(finalScore / 5);

    setStats(prev => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + happinessGain),
      energy: Math.max(0, prev.energy - energyLoss),
      knowledge: Math.min(100, prev.knowledge + knowledgeGain),
    }));

    // Update high score state
    if (newHighScore > gameHighScore) {
      setGameHighScore(newHighScore);
    }

    // Earn a heart for achieving a new high score!
    if (isNewHighScore && finalScore > 0) {
      const firstGrey = [0, 1, 2].find(i => !earnedHearts.find(h => h.index === i));
      if (firstGrey !== undefined) {
        // Delay heart earning until after exit animation completes
        setTimeout(() => {
          earnHeart(firstGrey);
        }, 800); // After character returns to position
      }
    }
  };

  // Enter game animation
  const enterGameAnimation = () => {
    const characterElement = characterRef.current;
    const whiteFade = whiteFadeRef.current;
    if (!characterElement || !whiteFade) return;

    // Show white fade overlay
    setShowWhiteFade(true);

    const tl = gsap.timeline();

    // 1. Cascade fade-out buttons first
    tl.to(
      '.action-buttons button',
      {
        y: 100,
        opacity: 0,
        stagger: 0.05,
        duration: 0.3,
        ease: 'power2.in',
      }
    );

    // 2. Fade out UI and character
    tl.to(
      ['.heart-meter', '.expression-menu', characterElement, antyRef.current?.innerGlowRef?.current, antyRef.current?.outerGlowRef?.current].filter(Boolean),
      {
        opacity: 0,
        duration: 0.25,
      },
      '-=0.15'
    );

    // 3. White fade in - COMPLETELY to white
    tl.fromTo(
      whiteFade,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          // Switch to game mode while screen is white
          setTimeout(() => {
            setGameMode('game');
            // Wait a bit for game to mount, then fade out white
            setTimeout(() => {
              gsap.to(whiteFade, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => setShowWhiteFade(false),
              });
            }, 200);
          }, 100);
        },
      },
      '-=0.1'
    );

    // Note: Position and scale will be set by game mode when it activates
  };

  // Exit game animation
  const exitGameAnimation = () => {
    const characterElement = characterRef.current;
    if (!characterElement) {
      setGameMode('idle');
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setGameMode('idle');
        setExpression('idle');
      },
    });

    // 1. Reset Anty position and scale
    tl.to(characterElement, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    });

    // 2. Fade in UI
    tl.to(
      ['.heart-meter', '.expression-menu'],
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.05,
      },
      '-=0.3'
    );

    // 3. Fade in buttons
    tl.to(
      '.action-buttons button',
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
      },
      '-=0.2'
    );
  };

  // Reusable wake-up animation when returning from OFF state
  const performWakeUpAnimation = () => {
    setCurrentAnimationSequence('MANUAL WAKE-UP ANIMATION (performWakeUpAnimation)');

    const characterElement = characterRef.current;
    if (!characterElement) return;

    const shadow = antyRef.current?.shadowRef?.current;

    // Kill any existing animations and timers
    // NOTE: Don't kill glow tweens - GlowSystem manages glow animations
    gsap.killTweensOf([characterElement, shadow].filter(Boolean));
    if (antyRef.current?.leftBodyRef?.current) {
      gsap.killTweensOf(antyRef.current.leftBodyRef.current);
      gsap.set(antyRef.current.leftBodyRef.current, { x: 0, y: 0 });
    }
    if (antyRef.current?.rightBodyRef?.current) {
      gsap.killTweensOf(antyRef.current.rightBodyRef.current);
      gsap.set(antyRef.current.rightBodyRef.current, { x: 0, y: 0 });
    }
    if (spinDescentTimerRef.current) {
      clearTimeout(spinDescentTimerRef.current);
      spinDescentTimerRef.current = null;
    }

    // REDESIGNED WAKE-UP ANIMATION
    const wakeUpTl = gsap.timeline();

    // Setup - restore opacity and set will-change for GPU optimization
    gsap.set(characterElement, {
      opacity: 1,
      scale: 0.65,
      willChange: 'transform',
    });

    // 1. Jump up to apex (0.2s) - controlled rise
    wakeUpTl.to(characterElement, {
      y: -45,
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
      force3D: true,
      onStart: () => {
        // Spawn sparkles during the leap up
        const canvasOffset = (160 * 5) / 2;
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            antyRef.current?.spawnSparkle?.(
              canvasOffset + gsap.utils.random(-30, 30),
              canvasOffset + gsap.utils.random(-25, 10),
              i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#87CEEB' : '#FF69B4'
            );
          }, i * 20);
        }
      },
    });

    // 2. Tiny hang at apex (0.05s) - just a breath
    wakeUpTl.to(characterElement, {
      y: -45,
      scale: 1,
      duration: 0.05,
      ease: 'none',
    });

    // 3. Drop down faster (0.3s)
    wakeUpTl.to(characterElement, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.in', // Faster drop with gravity feel
      force3D: true,
      onComplete: () => {
        gsap.set(characterElement, { willChange: 'auto' });
        setCurrentAnimationSequence('IDLE');
      },
    });

    // NOTE: Glow animation is now handled by GlowSystem in the animation controller
    // The physics-based tracking automatically follows character movement

    // Shadow grows back to full size and fades in (no Y movement - it stays on ground)
    if (shadow) {
      wakeUpTl.to(shadow, {
        xPercent: -50,  // Keep centered (static, not animated)
        scaleX: 1,  // Grow from 0.65 to 1
        scaleY: 1,  // Grow from 0.65 to 1
        opacity: 0.7,  // Fade from 0 to 0.7
        duration: 0.6,  // Longer duration for smoother fade
        ease: 'power2.out',
      }, '-=0.4'); // Start during landing
    }
  };

  const handleButtonClick = (button: ButtonName) => {
    const characterElement = characterRef.current;
    if (!characterElement) return;

    // Special handling for search button - don't reset eyes if closing search
    // Let morphToCharacter handle the animation
    const isClosingSearch = button === 'search' && searchActive;

    if (!isClosingSearch) {
      // Kill any existing animations and clear pending timers to prevent animation stacking
      gsap.killTweensOf(characterElement);
      clearExpressionReset();
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }

      // AnimationController now handles all eye state management
      // Eye resets happen automatically via emotion animations' onComplete callbacks
    }

    // If coming from OFF state, let AnimationController handle wake-up
    if (expression === 'off') {
      setExpression('idle'); // Controller will trigger wake-up animation via isOff change
    }

    switch (button) {
      case 'chat':
        // Close search if open
        if (searchActive) {
          antyRef.current?.morphToCharacter?.();
        }
        // Toggle chat panel
        setIsChatOpen(prev => {
          // Only trigger smize (happy eyes, no wiggle) when opening chat
          if (!prev) {
            setExpression('smize');
            scheduleExpressionReset(2000);
          }
          return !prev;
        });
        break;

      case 'moods':
        // Toggle expression menu
        setIsExpressionMenuExpanded(!isExpressionMenuExpanded);
        break;

      case 'play':
        // Toggle game mode
        if (gameMode === 'game') {
          // Exit game mode - trigger exit animation
          exitGameAnimation();
          return;
        }

        // Enter game mode - set expression to idle, trigger animation
        // Mode switch happens inside enterGameAnimation when white fade completes
        setExpression('idle');
        enterGameAnimation();
        break;

      case 'feed':
        // Show hearts on first eat (and reset 3-minute hide timer)
        showHeartsWithTimer();

        // Feeding animation - custom inline animation (not using jump emotion)
        // Pause idle/blinks during feed animation
        antyRef.current?.pauseIdle?.();

        // Spawn food particles immediately - will arrive during hover!
        antyRef.current?.spawnFeedingParticles();

        // Custom feed animation: moderate leap that hangs at apex while food arrives
        if (characterElement) {
          const feedTl = gsap.timeline({
            onComplete: () => {
              // Resume idle when animation finishes
              antyRef.current?.resumeIdle?.();
            }
          });
          // Moderate leap - jump up (easeout = slowing at top)
          feedTl.to(characterElement, { y: -35, duration: 0.4, ease: 'power2.out' });
          // Continue drifting up slightly while food arrives (feels like hanging)
          feedTl.to(characterElement, { y: -42, duration: 1.6, ease: 'power3.out' });
          // Come down as happy eyes start (~2.3s total)
          feedTl.to(characterElement, { y: 0, duration: 0.3, ease: 'power2.in' });
        }

        // Update stats
        setStats((prev) => ({
          ...prev,
          energy: Math.min(100, prev.energy + 20),
          happiness: Math.min(100, prev.happiness + 10),
        }));

        // Update hearts based on energy
        const newEnergy = Math.min(100, stats.energy + 20);
        if (newEnergy >= 70) {
          setHearts(3);
        } else if (newEnergy >= 40) {
          setHearts(2);
        } else {
          setHearts(1);
        }

        // At the "happy eyes" moment (2.3s into animation):
        // - Change expression to smize
        // - Earn the heart (this triggers super mode on 3rd heart)
        // - Spawn love heart particles
        animationTimerRef.current = setTimeout(() => {
          setExpression('smize');

          // Find first grey (not earned) heart and earn it
          const firstGreyHeart = [0, 1, 2].find(
            (index) => !earnedHearts.find((h) => h.index === index)
          );
          if (firstGreyHeart !== undefined) {
            earnHeart(firstGreyHeart);
          }

          // Spawn love heart particles radiating out from Anty
          antyRef.current?.spawnLoveHearts?.();
          animationTimerRef.current = null;
        }, 2300);
        scheduleExpressionReset(4000);
        break;

      case 'search':
        console.log('[SEARCH BUTTON] Clicked', {
          searchActive,
          hasRef: !!antyRef.current,
          hasMorphToSearchBar: typeof antyRef.current?.morphToSearchBar,
        });
        // Close chat if open
        if (isChatOpen) {
          setIsChatOpen(false);
        }
        // Toggle search mode - if already open, close it (same as ESC)
        if (searchActive) {
          antyRef.current?.morphToCharacter?.();
        } else {
          // If in super mode, cleanly exit first before morphing to search
          if (isSuperMode) {
            // Cancel super mode timer
            if (superModeTimerRef.current) {
              clearTimeout(superModeTimerRef.current);
              superModeTimerRef.current = null;
            }
            // Clear super mode state
            antyRef.current?.setSuperMode?.(null);
            setIsSuperMode(false);
            setEarnedHearts([]);
            heartTimersRef.current.forEach((timer) => clearTimeout(timer));
            heartTimersRef.current.clear();

            // Reset to idle baseline before search morph
            const characterElement = characterRef.current;
            if (characterElement) {
              gsap.to(characterElement, {
                scale: 1,
                rotation: 0,
                x: 0,
                y: 0,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => antyRef.current?.morphToSearchBar?.(),
              });
            } else {
              antyRef.current?.morphToSearchBar?.();
            }
          } else {
            antyRef.current?.morphToSearchBar?.();
          }
        }
        break;
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative overflow-hidden">
      {gameMode !== 'game' && <FPSMeter />}
      <SearchBarDemoMenu visible={searchActive} />

      {gameMode === 'idle' ? (
        <>
          {showHearts && <HeartMeter hearts={hearts} earnedHearts={earnedHearts} isOff={expression === 'off'} />}

          <div className="flex-1 flex items-center justify-center pb-12 relative" style={{ paddingTop: '50px' }}>
            <div
              style={{
                position: 'relative',
                width: '160px',
                height: '240px',
                transition: 'transform 0.3s ease-out',
                transform: isChatOpen ? `translateX(-${CHAT_OFFSET}px)` : 'translateX(0)',
              }}
            >
              {/* Anty character - glow is now rendered internally by AntyCharacter */}
              <div
                ref={characterRef}
                className="anty-z-character"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transformOrigin: 'center center',
                }}
              >
                <AntyCharacter
                  ref={antyRef}
                  expression={expression}
                  isSuperMode={isSuperMode}
                  debugMode={debugMode}
                  // Shadow still external for morph animation, but glow is internal
                  showShadow={false}
                  showGlow={true}
                  shadowRef={shadowRef}
                  // Search mode - now internal to AntyCharacter
                  searchEnabled={true}
                  searchPlaceholder="Ask Anty anything..."
                  searchShortcut="⌘K"
                  searchConfig={searchBarConfig}
                  onSearchOpen={() => setSearchActive(true)}
                  onSearchCloseComplete={() => setSearchActive(false)}
                  onAnimationSequenceChange={(sequence) => {
                    setCurrentAnimationSequence(sequence);
                  }}
                  onRandomAction={(action) => {
                    setLastRandomAction(action);
                    // Clear after 2 seconds
                    setTimeout(() => setLastRandomAction(''), 2000);
                  }}
                  onSpontaneousExpression={(expr) => {
                    // Only trigger spontaneous looks when in idle state
                    if (expression !== 'idle') return;

                    setExpression(expr);
                    // Reset to idle after 1 second for spontaneous looks
                    if (expr === 'look-left' || expr === 'look-right') {
                      scheduleExpressionReset(1000);
                    }
                  }}
                  onEmotionComplete={(emotion) => {
                    // Reset expression to idle when animation completes
                    if (ENABLE_ANIMATION_DEBUG_LOGS) {
                      console.log(`[page.tsx] Emotion ${emotion} → idle`);
                    }
                    setExpression('idle');
                  }}
                />
              </div>

              {/* Fixed shadow - doesn't move with character */}
              <div
                ref={shadowRef}
                id="anty-shadow"
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: '0px',
                  width: '160px',
                  height: '40px',
                  background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
                  filter: 'blur(12px)',
                  borderRadius: '50%',
                  opacity: 0.7,
                  transform: 'scaleX(1) scaleY(1)',
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                }}
              />

              {/* Debug overlay for shadow */}
              {debugMode && (
                <div
                  id="debug-shadow"
                  className="anty-z-debug absolute pointer-events-none"
                  style={{
                    left: '50%',
                    bottom: '0px',
                    width: '160px',
                    height: '40px',
                    border: '3px solid red',
                    borderRadius: '50%',
                  }}
                />
              )}

            </div>
          </div>

          {/* Debug overlays for glows - MUST be outside transformed parents for fixed positioning to work */}
          {debugMode && (
            <>
              <div
                id="debug-inner-glow"
                className="fixed pointer-events-none z-[10000]"
                style={{
                  width: '120px',
                  height: '90px',
                  border: '2px dashed #00ffff',
                  borderRadius: '50%',
                }}
              />
              <div
                id="debug-outer-glow"
                className="fixed pointer-events-none z-[10000]"
                style={{
                  width: '200px',
                  height: '150px',
                  border: '2px dashed #ff00ff',
                  borderRadius: '50%',
                }}
              />
            </>
          )}

          <div
            className="action-buttons"
            style={{
              transition: 'transform 0.3s ease-out',
              transform: isChatOpen ? `translateX(-${CHAT_OFFSET}px)` : 'translateX(0)',
            }}
          >
            <ActionButtons onButtonClick={handleButtonClick} isOff={expression === 'off'} moodsButtonRef={moodsButtonRef} />
          </div>

          <ExpressionMenu
        currentExpression={expression}
        isExpanded={isExpressionMenuExpanded}
        onClose={() => setIsExpressionMenuExpanded(false)}
        buttonRef={moodsButtonRef}
        isChatOpen={isChatOpen}
        isSearchActive={searchActive}
        onExpressionSelect={(expr) => {
          // ============================================================================
          // SIMPLIFIED EXPRESSION HANDLER - Routes everything to AnimationController
          // All emotion animations are handled by emotions.ts definitions
          // OFF/ON transitions handled by AnimationController via isOff state
          // ============================================================================

          clearExpressionReset();
          setExpression(expr);

          // AnimationController handles:
          // - All emotion animations (happy, excited, sad, angry, shocked, spin, idea, wink, nod, headshake, lookaround, look-left, look-right)
          // - Wake-up from OFF (via isOff state change)
          // - Power-off (via isOff state change)
          // - Returning to idle after animations complete
        }}
      />
        </>
      ) : (
        <>
          <FlappyGame
            highScore={gameHighScore}
            onExit={(finalScore, newHighScore) => {
              const isNewHighScore = newHighScore > gameHighScore;
              updateStatsFromGame(finalScore, newHighScore, isNewHighScore);
              exitGameAnimation();
            }}
          />
        </>
      )}

      {/* Power button - hidden during game mode */}
      {gameMode !== 'game' && (
        <PowerButton
          isOff={expression === 'off'}
          onToggle={() => {
            if (expression === 'off') {
              // Turn on - go straight to idle, let wake-up animation handle the transition
              clearExpressionReset();
              setExpression('idle');
            } else {
              // Turn off - let AnimationController handle animation
              clearExpressionReset();
              setExpression('off'); // Controller will trigger power-off animation via isOff state
            }
          }}
        />
      )}

      {/* Chat Panel */}
      <AntyChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onEmotion={(emotion) => {
          // Trigger the full emotion animation sequence with chat mode enabled
          triggerEmotionAnimation(emotion, isChatOpen);
        }}
      />

      {/* Animation Debug Overlay - LIVE real-time data */}
      {debugMode && characterRef.current && (
        <AnimationDebugOverlay
          characterRef={characterRef}
          shadowRef={shadowRef}
          innerGlowRef={antyRef.current?.innerGlowRef}
          outerGlowRef={antyRef.current?.outerGlowRef}
          currentSequence={currentAnimationSequence}
          randomAction={lastRandomAction}
          antyHandle={antyRef.current}
        />
      )}

      {/* Eye Debug Boxes - Track secondary eye element transformations */}
      {debugMode && antyRef.current?.leftEyeRef && antyRef.current?.rightEyeRef && (
        <EyeDebugBoxes
          leftEyeRef={antyRef.current.leftEyeRef as React.RefObject<HTMLDivElement>}
          rightEyeRef={antyRef.current.rightEyeRef as React.RefObject<HTMLDivElement>}
        />
      )}

      {/* White fade overlay for classy transition - always rendered */}
      <div
        ref={whiteFadeRef}
        className="anty-z-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'white',
          pointerEvents: 'none',
          opacity: 0,
          display: showWhiteFade ? 'block' : 'none',
        }}
      />
    </div>
  );
}
