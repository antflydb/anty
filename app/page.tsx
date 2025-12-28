'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { AntyCharacterV3, ActionButtonsV3, HeartMeter, ExpressionMenu, PowerButton, FlappyGame, FPSMeter, type ButtonName, type AntyCharacterHandle, type EarnedHeart } from '@/components/anty-v3';
import { AntySearchBar } from '@/components/anty-v3/anty-search-bar';
import { AnimationDebugOverlay } from '@/components/anty-v3/animation-debug-overlay';
import { EyeDebugBoxes } from '@/components/anty-v3/eye-debug-boxes';
import { SearchBarDemoMenu, getStoredSearchBarConfig } from '@/components/anty-v3/search-bar-demo-menu';
import { ChatPanel } from '@/components/anty-chat';
import type { EmotionType } from '@/lib/anty-v3/animation/types';
import { DEFAULT_SEARCH_BAR_CONFIG } from '@/lib/anty-v3/animation/types';
import type { AntyStats } from '@/lib/anty-v3/stat-system';
import { ENABLE_ANIMATION_DEBUG_LOGS } from '@/lib/anty-v3/animation/feature-flags';

export default function AntyV3() {
  // Add CSS animation for super mode hue shift
  useEffect(() => {
    if (!document.getElementById('anty-super-mode-styles')) {
      const style = document.createElement('style');
      style.id = 'anty-super-mode-styles';
      style.textContent = `
        @keyframes superModeHue {
          0% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) brightness(1.15) saturate(1.3) hue-rotate(0deg); }
          25% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) brightness(1.15) saturate(1.3) hue-rotate(10deg); }
          50% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) brightness(1.15) saturate(1.3) hue-rotate(0deg); }
          75% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) brightness(1.15) saturate(1.3) hue-rotate(-10deg); }
          100% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) brightness(1.15) saturate(1.3) hue-rotate(0deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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
  const glowRef = useRef<HTMLDivElement>(null);
  const antyRef = useRef<AntyCharacterHandle>(null);
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
  const [searchValue, setSearchValue] = useState('');
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchBorderRef = useRef<HTMLDivElement>(null);
  const searchBorderGradientRef = useRef<HTMLDivElement>(null);
  const searchPlaceholderRef = useRef<HTMLDivElement>(null);
  const searchKbdRef = useRef<HTMLDivElement>(null);
  const searchGlowRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const morphingRef = useRef<boolean>(false);

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
      const shadow = document.getElementById('anty-shadow');
      const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
      const outerGlow = glowRef.current;

      const shadowDebug = document.getElementById('debug-shadow');
      const innerGlowDebug = document.getElementById('debug-inner-glow');
      const outerGlowDebug = document.getElementById('debug-outer-glow');

      if (shadow && shadowDebug) {
        const transform = window.getComputedStyle(shadow).transform;
        shadowDebug.style.transform = transform;
        shadowDebug.style.opacity = window.getComputedStyle(shadow).opacity;
      }

      if (innerGlow && innerGlowDebug) {
        const transform = window.getComputedStyle(innerGlow).transform;
        innerGlowDebug.style.transform = transform;
        innerGlowDebug.style.opacity = window.getComputedStyle(innerGlow).opacity;
      }

      if (outerGlow && outerGlowDebug) {
        const transform = window.getComputedStyle(outerGlow).transform;
        outerGlowDebug.style.transform = transform;
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
          console.log('[WINK] Spawning sparkles');
          const canvasOffset = (160 * 5) / 2;
          // Right eye position (slightly right of center, at eye level)
          const rightEyeX = canvasOffset + 35;
          const rightEyeY = canvasOffset - 10;
          console.log('[WINK] Canvas offset:', canvasOffset, 'Right eye pos:', rightEyeX, rightEyeY);
          for (let i = 0; i < 6; i++) {
            setTimeout(() => {
              console.log('[WINK] Spawning sparkle', i, 'at', rightEyeX, rightEyeY);
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
      const searchBarEl = searchBarRef.current;
      const target = event.target as HTMLElement;

      // Ignore if clicking on search bar
      if (searchBarEl?.contains(target)) return;

      // Ignore if clicking on demo menu
      if (target.closest('[data-search-demo-menu]')) return;

      morphToCharacter();
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
        // Close chat if open
        if (isChatOpen) {
          setIsChatOpen(false);
        }
        if (searchActive) {
          morphToCharacter();
          setSearchValue(''); // Clear on exit
        } else {
          morphToSearchBar();
        }
      }
      // Command+L to toggle chat
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        event.preventDefault();
        // Close search if open
        if (searchActive) {
          morphToCharacter();
          setSearchValue('');
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
        morphToCharacter();
        setSearchValue(''); // Clear on exit
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        // Future: trigger search functionality
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchActive, searchValue]);

  // Animate the glow with ghostly, randomized movement
  useEffect(() => {
    // Only animate in idle mode when glow exists and not in search mode
    if (gameMode !== 'idle' || !glowRef.current || searchActive) return;

    const animateGhostly = () => {
      // Check if we're still in idle mode and glow still exists and not searching
      if (gameMode !== 'idle' || !glowRef.current || searchActive) return;

      // Random parameters for each animation cycle
      const randomY = gsap.utils.random(-8, -16);
      const randomX = gsap.utils.random(-3, 3);
      const randomScale = gsap.utils.random(0.98, 1.05);
      const randomOpacity = gsap.utils.random(0.7, 1);
      const randomDuration = gsap.utils.random(2.2, 3.5);

      gsap.to(glowRef.current, {
        y: randomY,
        x: randomX,
        scale: randomScale,
        opacity: randomOpacity,
        duration: randomDuration,
        ease: 'sine.inOut',
        onComplete: () => {
          // Check again before return animation
          if (gameMode !== 'idle' || !glowRef.current || searchActive) return;

          // Return to base state with different random values
          const returnDuration = gsap.utils.random(2, 3.2);
          gsap.to(glowRef.current, {
            y: gsap.utils.random(-2, 2),
            x: gsap.utils.random(-2, 2),
            scale: gsap.utils.random(0.95, 1.02),
            opacity: gsap.utils.random(0.75, 0.95),
            duration: returnDuration,
            ease: 'sine.inOut',
            onComplete: animateGhostly, // Loop with new random values
          });
        },
      });
    };

    animateGhostly();

    return () => {
      if (glowRef.current) {
        gsap.killTweensOf(glowRef.current);
      }
    };
  }, [gameMode, searchActive]);

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
    }, 3 * 60 * 1000); // 3 minutes
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

      // Confetti celebration for super mode (disabled, but capability preserved)
      // if (antyRef.current?.spawnConfetti) {
      //   const centerX = window.innerWidth / 2;
      //   const centerY = window.innerHeight / 2;
      //   console.log('[SUPER MODE] Triggering confetti:', { centerX, centerY });
      //   antyRef.current.spawnConfetti(centerX, centerY, 60); // Big celebration
      // } else {
      //   console.warn('[SUPER MODE] No spawnConfetti method available');
      // }

      // Use AnimationController for super mode transformation
      if (antyRef.current?.playEmotion) {
        antyRef.current.playEmotion('super');
        // Track super mode scale in controller (preserves scale during other emotions)
        antyRef.current.setSuperMode?.(1.45);
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
        // Clear super mode scale first
        antyRef.current?.setSuperMode?.(null);

        // Animate scale back to normal, THEN restart idle
        const characterElement = document.querySelector('[class*="character"]') as HTMLElement;
        if (characterElement) {
          gsap.to(characterElement, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
              // Return to idle AFTER scale animation completes
              // This ensures idle captures scale: 1, not 1.45
              setExpression('idle');
            }
          });
        } else {
          // Fallback if no character element
          setExpression('idle');
        }

        setIsSuperMode(false);
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
      ['.heart-meter', '.expression-menu', characterElement, '.inner-glow', glowRef.current],
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

    const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
    const outerGlow = glowRef.current;
    const shadow = document.getElementById('anty-shadow');

    // Kill any existing animations and timers
    gsap.killTweensOf([characterElement, innerGlow, outerGlow, shadow]);
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

    // 1b. Glows jump up with Anty and scale back to normal (75% distance, 0.05s lag)
    if (innerGlow && outerGlow) {
      wakeUpTl.to([innerGlow, outerGlow], {
        y: -34,  // 75% of character jump (-45 * 0.75)
        scale: 1,  // Reset from 0.65 to 1
        duration: 0.2,
        ease: 'power2.out',
      }, '-=0.15'); // Start 0.05s after character (0.2 - 0.05 = 0.15)

      // 1c. Glows hang at apex
      wakeUpTl.to([innerGlow, outerGlow], {
        y: -34,  // 75% of character position
        scale: 1,
        duration: 0.05,
        ease: 'none',
      }, '-=0.00'); // Start 0.05s after character (already accounted for)

      // 2. Glows drop with Anty (75% distance, 0.05s lag)
      wakeUpTl.to([innerGlow, outerGlow], {
        y: 0,  // Reset to original position
        scale: 1,
        duration: 0.3,
        ease: 'power2.in',
      }, '-=0.25'); // Start 0.05s after character (0.3 - 0.05 = 0.25)

      // 3. Fade glows opacity in (parallel with movement)
      wakeUpTl.to([innerGlow, outerGlow], {
        opacity: 1,
        duration: 0.6,  // Slower fade-in
        ease: 'power1.in',  // Ease in for gradual start
      }, '-=0.4'); // Start during jump
    }

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

  // Morph Anty character to search bar
  const morphToSearchBar = () => {
    // Prevent multiple simultaneous morphs
    if (morphingRef.current) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[SEARCH] Already morphing, ignoring');
      }
      return;
    }

    morphingRef.current = true;
    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log('[SEARCH] Opening search mode');
    }
    setSearchActive(true);

    const tl = gsap.timeline({
      onComplete: () => {
        morphingRef.current = false;
        searchInputRef.current?.focus();
      }
    });

    const leftBody = antyRef.current?.leftBodyRef?.current;
    const rightBody = antyRef.current?.rightBodyRef?.current;
    const leftEye = antyRef.current?.leftEyeRef?.current;
    const rightEye = antyRef.current?.rightEyeRef?.current;
    const searchBar = searchBarRef.current;
    const shadow = document.getElementById('anty-shadow');
    const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
    const outerGlow = glowRef.current;

    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log('[SEARCH] Elements:', {
        leftBody: !!leftBody,
        rightBody: !!rightBody,
        searchBar: !!searchBar,
        shadow: !!shadow,
        innerGlow: !!innerGlow,
        outerGlow: !!outerGlow
      });
    }

    if (!leftBody || !rightBody || !searchBar) return;

    // CRITICAL: Notify AnimationController BEFORE killing animations
    // This releases all elements from ElementRegistry to prevent conflicts
    if (antyRef.current?.killAll) {
      antyRef.current.killAll();
    }

    // CRITICAL: Kill ALL idle animations including character container
    const character = leftBody.parentElement; // Get character container
    if (character) {
      gsap.killTweensOf(character);
      // Reset character container transforms to default
      gsap.set(character, { x: 0, y: 0, rotation: 0, scale: 1 });
    }
    gsap.killTweensOf([leftBody, rightBody, shadow]);

    // CRITICAL: Reset bracket positions to 0 before starting
    gsap.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0 });

    // Kill any ongoing animations on eyes, glows, and shadow to prevent conflicts
    // Set everything to their starting states immediately
    if (leftEye) {
      gsap.killTweensOf(leftEye);
      gsap.set(leftEye, { opacity: 1 }); // Eyes start visible
    }
    if (rightEye) {
      gsap.killTweensOf(rightEye);
      gsap.set(rightEye, { opacity: 1 }); // Eyes start visible
    }

    // Set glows and shadow to 0 immediately (don't animate)
    if (innerGlow) {
      gsap.killTweensOf(innerGlow);
      gsap.set(innerGlow, { opacity: 0 });
    }
    if (outerGlow) {
      gsap.killTweensOf(outerGlow);
      gsap.set(outerGlow, { opacity: 0 });
    }
    if (shadow) {
      gsap.killTweensOf(shadow);
      gsap.set(shadow, { xPercent: -50, opacity: 0, scaleX: 1, scaleY: 1 });
    }

    // STEP 1: Body halves separate, scale down, move to corners
    // DYNAMIC CALCULATION: Position brackets to align outer edges with search bar corners
    const { bracketScale } = searchBarConfig;

    // CRITICAL: Set search bar to final scale (1.0) BEFORE reading position
    // Otherwise we'll read the position at scale 0.95 and calculations will be wrong
    gsap.set(searchBar, { scale: 1, opacity: 0 });

    // Get actual search bar position (at final scale)
    const searchBarRect = searchBar.getBoundingClientRect();

    // Get current bracket sizes (BEFORE scaling)
    const leftBracketRect = leftBody.getBoundingClientRect();
    const rightBracketRect = rightBody.getBoundingClientRect();

    const leftBracketSize = leftBracketRect.width;
    const rightBracketSize = rightBracketRect.width;

    const scaledLeftBracketSize = leftBracketSize * bracketScale;
    const scaledRightBracketSize = rightBracketSize * bracketScale;

    // Get CURRENT center positions of brackets (including their inset positioning)
    // These are viewport-relative positions
    const leftCurrentCenterX = leftBracketRect.left + (leftBracketRect.width / 2);
    const leftCurrentCenterY = leftBracketRect.top + (leftBracketRect.height / 2);
    const rightCurrentCenterX = rightBracketRect.left + (rightBracketRect.width / 2);
    const rightCurrentCenterY = rightBracketRect.top + (rightBracketRect.height / 2);

    // Calculate target bracket centers (so OUTER EDGES align with search bar)
    // After scaling to 0.14, the bracket will be scaledBracketSize wide
    // We want the outer edges to touch the search bar edges

    // Left bracket: outer edges at search bar's top-left
    // So center should be scaledBracketSize/2 IN from search bar edges
    const leftTargetCenterX = searchBarRect.left + (scaledLeftBracketSize / 2);
    const leftTargetCenterY = searchBarRect.top + (scaledLeftBracketSize / 2);

    // Right bracket: outer edges at search bar's bottom-right
    const rightTargetCenterX = searchBarRect.right - (scaledRightBracketSize / 2);
    const rightTargetCenterY = searchBarRect.bottom - (scaledRightBracketSize / 2);

    // GSAP transforms are ADDITIVE to current position
    // But we need to account for scale changing the effective center
    // When scale changes from 1.0 to 0.14, the center point moves
    // Calculate transforms to move the SCALED bracket center to target
    const leftTransformX = leftTargetCenterX - leftCurrentCenterX;
    const leftTransformY = leftTargetCenterY - leftCurrentCenterY;
    const rightTransformX = rightTargetCenterX - rightCurrentCenterX;
    const rightTransformY = rightTargetCenterY - rightCurrentCenterY;

    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      console.log('[MORPH] v7 - Direct from bracket positions:', {
        leftBracket: { size: leftBracketSize, scaledSize: scaledLeftBracketSize, currentCenter: { x: leftCurrentCenterX, y: leftCurrentCenterY }, targetCenter: { x: leftTargetCenterX, y: leftTargetCenterY } },
        rightBracket: { size: rightBracketSize, scaledSize: scaledRightBracketSize, currentCenter: { x: rightCurrentCenterX, y: rightCurrentCenterY }, targetCenter: { x: rightTargetCenterX, y: rightTargetCenterY } },
        transforms: { left: { x: leftTransformX, y: leftTransformY }, right: { x: rightTransformX, y: rightTransformY } }
      });
    }

    // Set z-index on character container AND brackets to ensure they're above search bar
    const characterContainer = leftBody.parentElement;
    gsap.set(characterContainer, { zIndex: 10 }); // Higher than search bar (zIndex: 2)
    gsap.set([leftBody, rightBody], {
      zIndex: 3,
      transformOrigin: '50% 50%' // Ensure scaling happens from center
    });

    // Anticipation: slight squash down (80ms)
    tl.to([leftBody, rightBody], {
      y: 5,
      scaleY: 0.92,
      scaleX: 1.08,
      duration: 0.08,
      ease: 'power2.in'
    }, 0);

    // Eyes fade out during anticipation and move up with the leap
    const fadeTargets = [leftEye, rightEye].filter(Boolean);
    if (fadeTargets.length > 0) {
      tl.to(fadeTargets, {
        opacity: 0,
        y: -18, // Move up with the leap
        duration: 0.15,
        ease: 'power1.in',
        overwrite: true
      }, 0);
    }

    // Leap up with stretch (120ms)
    tl.to([leftBody, rightBody], {
      y: -25,
      scaleY: 1.1,
      scaleX: 0.95,
      duration: 0.12,
      ease: 'power2.out'
    }, 0.08);

    // Morph out to corners while in the air (350ms)
    tl.to(leftBody, {
      x: leftTransformX,
      y: leftTransformY,
      scale: bracketScale,
      scaleX: bracketScale,
      scaleY: bracketScale,
      rotation: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      overwrite: 'auto'
    }, 0.2);

    tl.to(rightBody, {
      x: rightTransformX,
      y: rightTransformY,
      scale: bracketScale,
      scaleX: bracketScale,
      scaleY: bracketScale,
      rotation: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      overwrite: 'auto'
    }, 0.2);

    // STEP 3: Search bar fades in (250ms) - during morph
    // Note: We already set scale to 1 above for position calculation
    tl.to(searchBar, {
      opacity: 1,
      duration: 0.25,
      ease: 'power1.out'
    }, 0.2);

    // STEP 3.5: Animated gradient border fades in and starts rotating
    const searchBorderGradient = searchBorderGradientRef.current;
    if (searchBorderGradient) {
      gsap.set(searchBorderGradient, { opacity: 0 });

      tl.to(searchBorderGradient, {
        opacity: 1,
        duration: 0.3,
        ease: 'power1.out'
      }, 0.45); // Delayed to sync with bracket arrival

      // Start continuous gradient rotation (separate from timeline)
      tl.call(() => {
        const rotationAnim = { deg: 0 };
        gsap.to(rotationAnim, {
          deg: 360,
          duration: 4,
          ease: 'none',
          repeat: -1,
          onUpdate: () => {
            if (searchBorderGradient) {
              searchBorderGradient.style.background = `linear-gradient(white, white) padding-box, conic-gradient(from ${rotationAnim.deg}deg, #E5EDFF 0%, #C7D2FE 25%, #D8B4FE 50%, #C7D2FE 75%, #E5EDFF 100%) border-box`;
            }
          }
        });
      }, [], 0.75);
    }

    // STEP 3.75: Placeholder reveals with subtle blur and upward drift (180ms)
    const searchPlaceholder = searchPlaceholderRef.current;
    if (searchPlaceholder) {
      // Set initial state
      gsap.set(searchPlaceholder, {
        opacity: 0,
        filter: 'blur(6px)',
        y: 4,
      });

      tl.to(searchPlaceholder, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.18,
        ease: 'power2.out'
      }, 0.42); // Start just before border
    }

    // STEP 3.76: CMD+K indicator reveals with same animation
    const searchKbd = searchKbdRef.current;
    if (searchKbd) {
      // Set initial state
      gsap.set(searchKbd, {
        opacity: 0,
        filter: 'blur(6px)',
        y: 4,
      });

      tl.to(searchKbd, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.18,
        ease: 'power2.out'
      }, 0.42); // Same timing as placeholder
    }

    // STEP 3.77: AI gradient glow fades in
    const searchGlow = searchGlowRef.current;
    if (searchGlow) {
      gsap.set(searchGlow, { opacity: 0, scale: 0.95 });

      // Fade in
      tl.to(searchGlow, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      }, 0.45); // Sync with border

      // Start continuous breathing animation separately (not on timeline)
      tl.call(() => {
        gsap.to(searchGlow, {
          scale: 1.12,
          opacity: 0.7,
          duration: 2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }, [], 0.85);
    }

    // STEP 4: Large glow appears (mid-morph)
    tl.call(() => {
      antyRef.current?.showSearchGlow?.();
    }, [], 0.25);
  };

  // Morph search bar back to Anty character
  const morphToCharacter = () => {
    // Prevent multiple simultaneous morphs
    if (morphingRef.current) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[SEARCH] Already morphing, ignoring close');
      }
      return;
    }

    morphingRef.current = true;
    // DON'T set searchActive(false) yet - wait until animation completes
    // Otherwise idle animation will start during the morph and interfere

    const tl = gsap.timeline({
      onComplete: () => {
        morphingRef.current = false;
        // NOW set searchActive to false so idle animation can start
        setSearchActive(false);
      }
    });

    const leftBody = antyRef.current?.leftBodyRef?.current;
    const rightBody = antyRef.current?.rightBodyRef?.current;
    const leftEye = antyRef.current?.leftEyeRef?.current;
    const rightEye = antyRef.current?.rightEyeRef?.current;
    const searchBar = searchBarRef.current;
    const searchBorder = searchBorderRef.current;
    const shadow = document.getElementById('anty-shadow');
    const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
    const outerGlow = glowRef.current;

    if (!leftBody || !rightBody || !searchBar) return;

    // CRITICAL: Notify AnimationController BEFORE killing animations
    // This releases all elements from ElementRegistry to prevent conflicts
    if (antyRef.current?.killAll) {
      antyRef.current.killAll();
    }

    // Note: exitSearchMode was removed from animation controller
    // Search mode cleanup is now handled automatically by the animation system

    // Continue with search bar closing animations
    const searchBorderGradient = searchBorderGradientRef.current;
    if (searchBorderGradient) {
      gsap.killTweensOf(searchBorderGradient);
    }
    const searchPlaceholder = searchPlaceholderRef.current;
    if (searchPlaceholder) {
      gsap.killTweensOf(searchPlaceholder);
    }
    const searchKbd = searchKbdRef.current;
    if (searchKbd) {
      gsap.killTweensOf(searchKbd);
    }
    const searchGlow = searchGlowRef.current;
    if (searchGlow) {
      gsap.killTweensOf(searchGlow);
    }

    // STEP 1: Border gradient fades out (inverse of fade in) - 150ms
    if (searchBorderGradient) {
      tl.to(searchBorderGradient, {
        opacity: 0,
        duration: 0.15,
        ease: 'power1.in'
      }, 0);
    }

    // STEP 2: Placeholder and kbd blur out (inverse of blur in) - 150ms
    const textElements = [searchPlaceholder, searchKbd].filter(Boolean);
    if (textElements.length > 0) {
      tl.to(textElements, {
        opacity: 0,
        filter: 'blur(6px)',
        y: -4, // Slight upward drift (inverse of down)
        duration: 0.15,
        ease: 'power2.in'
      }, 0);
    }

    // STEP 3: Search glow crossfades with orb glows
    if (searchGlow) {
      tl.to(searchGlow, {
        opacity: 0,
        scale: 0.85,
        duration: 0.35,
        ease: 'power1.out'
      }, 0.05);
    }

    // STEP 4: Search bar container fades out - 200ms
    tl.to(searchBar, {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in'
    }, 0.15);

    // STEP 5: Hide search glow canvas effect
    tl.call(() => {
      antyRef.current?.hideSearchGlow?.();
    }, [], 0);

    // STEP 6: Halves return to center and scale up with tiny leap
    // Also clear z-index from character container
    const characterContainer = leftBody.parentElement;
    if (characterContainer) {
      gsap.set(characterContainer, { clearProps: 'zIndex' });
    }

    // Snap back to center with upward leap (250ms) - smooth snap
    tl.to([leftBody, rightBody], {
      x: 0,
      y: -25,
      scale: 1,
      scaleX: 0.95,
      scaleY: 1.1,
      duration: 0.25,
      ease: 'power2.out',
      clearProps: 'zIndex'
    }, 0.3); // Start after search bar fades

    // Settle down to rest (170ms)
    tl.to([leftBody, rightBody], {
      y: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.17,
      ease: 'power2.in'
    }, 0.55); // 0.3 + 0.25

    // Eyes fade in and move down WITH the body settle to look attached
    if (leftEye && rightEye) {
      // Set starting position at the same height as the leap
      gsap.set([leftEye, rightEye], { y: -18 });

      tl.to([leftEye, rightEye], {
        opacity: 1,
        y: 0, // Move down to normal position
        duration: 0.17, // Same duration as body settle
        ease: 'power2.in' // Same easing as body settle
      }, 0.55); // Start when body starts settling
    }

    if (shadow) {
      tl.to(shadow, {
        opacity: 0.7,
        scaleX: 1,
        scaleY: 1,
        duration: 0.22,
        ease: 'power1.out'
      }, 0.67); // After settle completes (0.55 + 0.17 = 0.72, start a bit before)
    }

    // Orb glows fade in as brackets close and settle
    const orbTargets = [innerGlow, outerGlow].filter(Boolean);
    if (orbTargets.length > 0) {
      tl.to(orbTargets, {
        opacity: 1,
        duration: 0.25,
        ease: 'power1.out'
      }, 0.6); // Start during settle phase, ramp up as brackets come together
    }

    // CRITICAL: Force final states when timeline completes to ensure idle state is correct
    tl.call(() => {
      if (leftEye) gsap.set(leftEye, { opacity: 1, y: 0 });
      if (rightEye) gsap.set(rightEye, { opacity: 1, y: 0 });
      if (shadow) gsap.set(shadow, { xPercent: -50, opacity: 0.7, scaleX: 1, scaleY: 1 });
      if (innerGlow) gsap.set(innerGlow, { opacity: 1 });
      if (outerGlow) gsap.set(outerGlow, { opacity: 1 });
      if (searchBorderGradient) gsap.set(searchBorderGradient, { opacity: 0 });
      if (searchPlaceholder) gsap.set(searchPlaceholder, { opacity: 0, filter: 'blur(0px)', y: 0 });
      if (searchKbd) gsap.set(searchKbd, { opacity: 0, filter: 'blur(0px)', y: 0 });
      if (searchGlow) gsap.set(searchGlow, { opacity: 0, scale: 1 });
      gsap.set([leftBody, rightBody], { x: 0, y: 0, scale: 1, rotation: 0, scaleX: 1, scaleY: 1 });
    }, [], 0.72); // After body settle completes (0.55 + 0.17)
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
          morphToCharacter();
          setSearchValue('');
        }
        // Toggle chat panel
        setIsChatOpen(prev => {
          // Only trigger chant (happy eyes, no wiggle) when opening chat
          if (!prev) {
            setExpression('chant');
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

        // Earn a heart and trigger pulse at happy eyes moment
        animationTimerRef.current = setTimeout(() => {
          setExpression('chant');
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
        // Close chat if open
        if (isChatOpen) {
          setIsChatOpen(false);
        }
        // Toggle search mode - if already open, close it (same as ESC)
        if (searchActive) {
          morphToCharacter();
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
                onComplete: () => morphToSearchBar(),
              });
            } else {
              morphToSearchBar();
            }
          } else {
            morphToSearchBar();
          }
        }
        break;
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      <FPSMeter />
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
                transform: isChatOpen ? 'translateX(-192px)' : 'translateX(0)', // Move left by half of chat panel width (384px/2)
              }}
            >
              {/* Floating glow behind Anty - Layer 1 (inner, more saturated) */}
              <div
                className="inner-glow absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: '80px',
                  width: '120px',
                  height: '90px',
                  borderRadius: '50%',
                  opacity: 1,
                  background: 'linear-gradient(90deg, #C5D4FF 0%, #E0C5FF 100%)',
                  filter: 'blur(25px)',
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Debug overlay for inner glow */}
              {debugMode && (
                <div
                  id="debug-inner-glow"
                  className="absolute left-1/2 pointer-events-none"
                  style={{
                    top: '80px',
                    width: '120px',
                    height: '90px',
                    borderRadius: '50%',
                    border: '3px solid cyan',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                  }}
                />
              )}

              {/* Floating glow behind Anty - Layer 2 (outer, softer) */}
              <div
                ref={glowRef}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: '80px',
                  width: '170px',
                  height: '130px',
                  borderRadius: '50%',
                  opacity: 1,
                  background: 'linear-gradient(90deg, #D5E2FF 0%, #EED5FF 100%)',
                  filter: 'blur(45px)',
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Debug overlay for outer glow */}
              {debugMode && (
                <div
                  id="debug-outer-glow"
                  className="absolute left-1/2 pointer-events-none"
                  style={{
                    top: '80px',
                    width: '170px',
                    height: '130px',
                    borderRadius: '50%',
                    border: '3px solid magenta',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                  }}
                />
              )}

              {/* Anty character in idle mode */}
              <div
                ref={characterRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  transformOrigin: 'center center',
                }}
              >
                <AntyCharacterV3
                  ref={antyRef}
                  stats={stats}
                  expression={expression}
                  isSuperMode={isSuperMode}
                  searchMode={searchActive}
                  debugMode={debugMode}
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
                <AntySearchBar
                  active={searchActive}
                  value={searchValue}
                  onChange={setSearchValue}
                  inputRef={searchInputRef}
                  barRef={searchBarRef}
                  borderRef={searchBorderRef}
                  borderGradientRef={searchBorderGradientRef}
                  placeholderRef={searchPlaceholderRef}
                  kbdRef={searchKbdRef}
                  glowRef={searchGlowRef}
                  config={searchBarConfig}
                />
              </div>

              {/* Fixed shadow - doesn't move with character */}
              <div
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
                id="anty-shadow"
              />

              {/* Debug overlay for shadow */}
              {debugMode && (
                <div
                  id="debug-shadow"
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    bottom: '0px',
                    width: '160px',
                    height: '40px',
                    border: '3px solid red',
                    borderRadius: '50%',
                    zIndex: 9999,
                  }}
                />
              )}
            </div>
          </div>

          <div
            className="action-buttons"
            style={{
              transition: 'transform 0.3s ease-out',
              transform: isChatOpen ? 'translateX(-192px)' : 'translateX(0)',
            }}
          >
            <ActionButtonsV3 onButtonClick={handleButtonClick} isOff={expression === 'off'} moodsButtonRef={moodsButtonRef} />
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

      {/* Power button - always rendered */}
      <PowerButton
        isOff={expression === 'off'}
        onToggle={() => {
          if (expression === 'off') {
            // Turn on - use happy as the default "on" expression
            const onExpression: EmotionType = 'happy';

            // Clear any pending expression reset
            clearExpressionReset();

            // Let AnimationController handle wake-up animation via isOff state change
            setExpression(onExpression);

            // Return to idle after a brief moment
            scheduleExpressionReset(1500);
          } else {
            // Turn off - let AnimationController handle animation
            clearExpressionReset();
            setExpression('off'); // Controller will trigger power-off animation via isOff state
          }
        }}
      />

      {/* Chat Panel */}
      <ChatPanel
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
          shadowRef={{ current: document.getElementById('anty-shadow') as HTMLDivElement }}
          currentSequence={currentAnimationSequence}
          randomAction={lastRandomAction}
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
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'white',
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: 0,
          display: showWhiteFade ? 'block' : 'none',
        }}
      />
    </div>
  );
}
