'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { AntyCharacterV3, ActionButtonsV3, HeartMeter, ExpressionMenu, PowerButton, FlappyGame, FPSMeter, type ButtonName, type AntyCharacterHandle, type EarnedHeart } from '@/components/anty-v3';
import { AntySearchBar } from '@/components/anty-v3/anty-search-bar';
import { AnimationDebugOverlay } from '@/components/anty-v3/animation-debug-overlay';
import { EyeDebugBoxes } from '@/components/anty-v3/eye-debug-boxes';
import { ChatPanel } from '@/components/anty-chat';
import type { ExpressionName } from '@/lib/anty-v3/animation-state';
import type { AntyStats } from '@/lib/anty-v3/stat-system';
import { USE_NEW_ANIMATION_CONTROLLER } from '@/lib/anty-v3/animation/feature-flags';

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
  const [expression, setExpressionInternal] = useState<ExpressionName>('idle');
  const [isExpressionMenuExpanded, setIsExpressionMenuExpanded] = useState(false);

  // Wrapped setExpression with logging
  const setExpression = (newExpr: ExpressionName) => {
    setExpressionInternal((prevExpression) => {
      console.log(`setExpression called: ${prevExpression} → ${newExpr} at ${Date.now()}`);
      console.trace('setExpression call stack');
      return newExpr;
    });
  };

  const [stats, setStats] = useState<AntyStats>({
    energy: 100,
    happiness: 100,
    knowledge: 50,
    indexHealth: 100,
  });
  const [earnedHearts, setEarnedHearts] = useState<EarnedHeart[]>([]);

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
  const [animationSource, setAnimationSource] = useState<string>(
    USE_NEW_ANIMATION_CONTROLLER ? 'controller' : 'legacy'
  );

  // Track expression changes and update debug sequence
  useEffect(() => {
    if (expression === 'off') {
      setCurrentAnimationSequence('OFF');
    } else if (expression === 'idle') {
      setCurrentAnimationSequence('IDLE');
    } else {
      setCurrentAnimationSequence(expression.toUpperCase());
    }
  }, [expression]);

  // Track search mode for debug overlay
  useEffect(() => {
    if (searchActive) {
      setCurrentAnimationSequence('SEARCH MODE');
    } else if (!searchActive && expression === 'idle') {
      setCurrentAnimationSequence('IDLE');
    }
  }, [searchActive, expression]);

  // Debug mode keyboard shortcut (D key) - disabled in chat/search mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Disable D key in chat or search mode
      if (isChatOpen || searchActive) return;

      if (e.key === 'd' || e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log('[DEBUG MODE]', !debugMode ? 'ENABLED' : 'DISABLED');
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
      console.log('[EXPRESSION TIMER] Cleared pending reset');
    }
  };

  // Helper function to schedule expression reset to idle
  const scheduleExpressionReset = (delayMs: number) => {
    clearExpressionReset(); // Clear any existing timeout first
    console.log(`[EXPRESSION TIMER] Scheduling reset to idle in ${delayMs}ms`);
    expressionResetTimerRef.current = setTimeout(() => {
      console.log('[EXPRESSION TIMER] Executing scheduled reset to idle');
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
  const triggerEmotionAnimation = (expr: ExpressionName, isChatOpen = false) => {
    // Memory leak fix: Add debounce to prevent animation spam
    const now = Date.now();
    const ANIMATION_COOLDOWN = 300; // ms
    if (now - lastAnimationTimeRef.current < ANIMATION_COOLDOWN) {
      console.log('[ANIMATION] Ignoring rapid trigger - cooldown active');
      return;
    }
    lastAnimationTimeRef.current = now;

    // Feature flag: Try new animation controller first
    if (USE_NEW_ANIMATION_CONTROLLER && antyRef.current?.playEmotion) {
      console.log('[ANIMATION] Using new controller for emotion:', expr);
      setAnimationSource('controller');
      const success = antyRef.current.playEmotion(expr, { isChatOpen });
      if (success) {
        // Update expression state for facial expressions
        setExpression(expr);
        console.log('[ANIMATION] New controller handled emotion successfully');
        return;
      } else {
        console.log('[ANIMATION] New controller declined, falling back to legacy GSAP');
        setAnimationSource('legacy');
      }
    } else if (USE_NEW_ANIMATION_CONTROLLER) {
      console.log('[ANIMATION] New controller enabled but playEmotion not available, using legacy');
      setAnimationSource('legacy');
    } else {
      console.log('[ANIMATION] Using legacy GSAP animation system');
      setAnimationSource('legacy');
    }

    // Legacy GSAP animation code below
    // Memory leak fix: Clear all previous animations before starting new ones
    clearExpressionReset();
    clearAllSparkles();
    clearAllAnimationTimers();

    setExpression(expr);

    if (!characterRef.current) return;

    const char = characterRef.current;

    // Kill existing animations
    gsap.killTweensOf(char);
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
    gsap.set(char, { rotation: 0, y: 0, rotationY: 0, scale: 1 });

    switch (expr) {
      case 'happy':
        gsap.to(char, {
          rotation: 10,
          duration: 0.15,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 5,
        });
        scheduleExpressionReset(1350);
        break;

      case 'excited': {
        console.log('[EXCITED CASE] Entered excited case in triggerEmotionAnimation');
        const excitedTl = gsap.timeline({
          onComplete: () => {
            gsap.set(char, { rotation: 0 });
          },
        });
        excitedTl.to(char, { y: -70, rotation: 360, duration: 0.5, ease: 'power2.out' });
        excitedTl.to(char, { y: -70, rotation: 360, duration: 0.3 });
        excitedTl.to(char, { y: 0, duration: 0.45, ease: 'power1.inOut' });
        excitedTl.to(char, { y: -25, duration: 0.18, ease: 'power2.out' });
        excitedTl.to(char, { y: 0, duration: 0.18, ease: 'power2.in' });
        excitedTl.to(char, { y: -18, duration: 0.15, ease: 'power2.out' });
        excitedTl.to(char, { y: 0, duration: 0.15, ease: 'power2.in' });

        // Glows follow with 75% distance and 0.05s lag
        const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
        const outerGlow = glowRef.current;
        if (innerGlow && outerGlow) {
          excitedTl.to([innerGlow, outerGlow], { y: -53, duration: 0.5, ease: 'power2.out' }, '-=0.45'); // 75% of -70, 0.05s lag
          excitedTl.to([innerGlow, outerGlow], { y: -53, duration: 0.3 }, '-=0.25'); // Hold at apex, 0.05s lag
          excitedTl.to([innerGlow, outerGlow], { y: 0, duration: 0.45, ease: 'power1.inOut' }, '-=0.40'); // Drop down, 0.05s lag
          excitedTl.to([innerGlow, outerGlow], { y: -19, duration: 0.18, ease: 'power2.out' }, '-=0.13'); // 75% of -25, 0.05s lag
          excitedTl.to([innerGlow, outerGlow], { y: 0, duration: 0.18, ease: 'power2.in' }, '-=0.13'); // Drop, 0.05s lag
          excitedTl.to([innerGlow, outerGlow], { y: -14, duration: 0.15, ease: 'power2.out' }, '-=0.10'); // 75% of -18, 0.05s lag
          excitedTl.to([innerGlow, outerGlow], { y: 0, duration: 0.15, ease: 'power2.in' }, '-=0.10'); // Final drop, 0.05s lag
        }

        // FIREWORKS!
        const colors = ['#FF1493', '#00CED1', '#FFD700', '#FF69B4', '#7B68EE', '#00FF7F', '#FF6347', '#FF00FF', '#00FFFF'];

        createTrackedTimeout(() => {
          // Adjust particle positions when chat is open (shift left by 192px to match Anty's position)
          const xOffset = isChatOpen ? -192 : 0;
          const burstPositions = [
            { x: window.innerWidth / 2 - 120 + xOffset, y: window.innerHeight / 2 - 220 },
            { x: window.innerWidth / 2 + 120 + xOffset, y: window.innerHeight / 2 - 200 },
            { x: window.innerWidth / 2 + xOffset, y: window.innerHeight / 2 - 260 },
          ];

          burstPositions.forEach((pos, burstIndex) => {
            createTrackedTimeout(() => {
              const burstColor = colors[Math.floor(Math.random() * colors.length)];

              // Main burst - 12 sparkles
              for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const radius = 100;
                const offsetX = Math.cos(angle) * radius;
                const offsetY = Math.sin(angle) * radius;

                const sparkle = document.createElement('div');
                sparkle.textContent = '✨';
                sparkle.style.cssText = `
                  position: fixed;
                  left: ${pos.x}px;
                  top: ${pos.y}px;
                  font-size: 40px;
                  pointer-events: none;
                  z-index: 0;
                  filter: drop-shadow(0 0 4px ${burstColor});
                  will-change: transform, opacity;
                `;
                sparkleCleanupRef.current.add(sparkle); // Track for cleanup
                document.body.appendChild(sparkle);

                gsap.to(sparkle, {
                  x: offsetX,
                  y: offsetY,
                  opacity: 0,
                  duration: 1.2,
                  ease: 'power2.out',
                  onComplete: () => {
                    sparkleCleanupRef.current.delete(sparkle);
                    if (sparkle.parentNode) {
                      document.body.removeChild(sparkle);
                    }
                  },
                });
              }

              // Secondary smaller burst - 8 sparkles
              createTrackedTimeout(() => {
                for (let i = 0; i < 8; i++) {
                  const angle = (i / 8) * Math.PI * 2 + 0.2;
                  const radius = 60;
                  const offsetX = Math.cos(angle) * radius;
                  const offsetY = Math.sin(angle) * radius;

                  const sparkle = document.createElement('div');
                  sparkle.textContent = '✨';
                  sparkle.style.cssText = `
                    position: fixed;
                    left: ${pos.x}px;
                    top: ${pos.y}px;
                    font-size: 24px;
                    pointer-events: none;
                    z-index: 0;
                    filter: drop-shadow(0 0 3px ${burstColor});
                    will-change: transform, opacity;
                  `;
                  sparkleCleanupRef.current.add(sparkle); // Track for cleanup
                  document.body.appendChild(sparkle);

                  gsap.to(sparkle, {
                    x: offsetX,
                    y: offsetY,
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out',
                    onComplete: () => {
                      sparkleCleanupRef.current.delete(sparkle);
                      if (sparkle.parentNode) {
                        document.body.removeChild(sparkle);
                      }
                    },
                  });
                }
              }, 80);
            }, burstIndex * 120);
          });
        }, 200);

        // Confetti celebration (disabled, but capability preserved)
        // if (antyRef.current?.spawnConfetti) {
        //   console.log('[EXCITED] Triggering confetti for excited emotion');
        //   createTrackedTimeout(() => {
        //     const xOffset = isChatOpen ? -192 : 0;
        //     const centerX = window.innerWidth / 2 + xOffset;
        //     const centerY = window.innerHeight / 2 - 220;

        //     console.log('[EXCITED] Calling spawnConfetti with:', { centerX, centerY });
        //     // Large confetti explosion for excited
        //     antyRef.current?.spawnConfetti?.(centerX, centerY, 40);
        //   }, 300); // Slightly delayed after jump starts
        // } else {
        //   console.warn('[EXCITED] No spawnConfetti method available');
        // }

        scheduleExpressionReset(1350);
        break;
      }

      case 'shocked': {
        const leftBody = antyRef.current?.leftBodyRef?.current;
        const rightBody = antyRef.current?.rightBodyRef?.current;

        gsap.to(char, { y: -30, duration: 0.2, ease: 'power2.out' });

        // Glows follow with 75% distance and 0.05s lag
        const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
        const outerGlow = glowRef.current;
        if (innerGlow && outerGlow) {
          gsap.to([innerGlow, outerGlow], { y: -23, duration: 0.2, ease: 'power2.out' }, '+=0.05'); // 75% of -30, 0.05s lag
        }

        if (leftBody && rightBody) {
          gsap.to(leftBody, { x: -15, y: -15, duration: 0.2, ease: 'back.out(2)' });
          gsap.to(rightBody, { x: 15, y: 15, duration: 0.2, ease: 'back.out(2)' });

          const shakeTl = gsap.timeline({ repeat: 3, yoyo: true });
          shakeTl.to(char, { rotation: 2, duration: 0.08, ease: 'power1.inOut' });

          createTrackedTimeout(() => {
            gsap.to(leftBody, { x: 0, y: 0, duration: 0.25, ease: 'elastic.out(1, 0.5)' });
            gsap.to(rightBody, { x: 0, y: 0, duration: 0.25, ease: 'elastic.out(1, 0.5)' });
          }, 1350);
        }

        createTrackedTimeout(() => {
          if (char) {
            gsap.to(char, { y: 0, rotation: 0, duration: 0.5, ease: 'power1.inOut' });
            // Glows return with lag
            const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
            const outerGlow = glowRef.current;
            if (innerGlow && outerGlow) {
              gsap.to([innerGlow, outerGlow], { y: 0, duration: 0.5, ease: 'power1.inOut', delay: 0.05 });
            }
          }
        }, 1400);
        scheduleExpressionReset(1350);
        break;
      }

      case 'sad': {
        gsap.to(char, { y: 10, scale: 0.9, duration: 0.6, ease: 'power2.out' });
        // Glows follow with 75% distance and 0.05s lag
        const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
        const outerGlow = glowRef.current;
        if (innerGlow && outerGlow) {
          gsap.to([innerGlow, outerGlow], { y: 7.5, duration: 0.6, ease: 'power2.out', delay: 0.05 });
        }
        createTrackedTimeout(() => {
          if (char) {
            gsap.to(char, { y: 0, scale: 1, duration: 0.4, ease: 'power2.in' });
            // Glows return with lag
            if (innerGlow && outerGlow) {
              gsap.to([innerGlow, outerGlow], { y: 0, duration: 0.4, ease: 'power2.in', delay: 0.05 });
            }
          }
        }, 1500);
        scheduleExpressionReset(2500);
        break;
      }

      case 'angry': {
        const angryTl = gsap.timeline();
        const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
        const outerGlow = glowRef.current;

        // Move down
        angryTl.to(char, { y: 15, duration: 0.6, ease: 'power2.out' });
        // Glows follow with 75% distance and 0.05s lag
        if (innerGlow && outerGlow) {
          angryTl.to([innerGlow, outerGlow], { y: 11.25, duration: 0.6, ease: 'power2.out' }, '-=0.55'); // 0.05s lag
        }

        // Shake horizontally 3 times
        for (let i = 0; i < 3; i++) {
          angryTl.to(char, { x: -8, duration: 0.8, ease: 'sine.inOut' });
          angryTl.to(char, { x: 8, duration: 0.8, ease: 'sine.inOut' });
        }

        // Return to center horizontally
        angryTl.to(char, { x: 0, duration: 0.4, ease: 'sine.inOut' });

        // Return to original position vertically
        angryTl.to(char, { y: 0, duration: 0.5, ease: 'power2.in' });
        if (innerGlow && outerGlow) {
          angryTl.to([innerGlow, outerGlow], { y: 0, duration: 0.5, ease: 'power2.in' }, '-=0.45'); // 0.05s lag
        }

        scheduleExpressionReset(6000);
        break;
      }

      case 'spin': {
        if (spinDescentTimerRef.current) {
          clearTimeout(spinDescentTimerRef.current);
          spinDescentTimerRef.current = null;
        }

        const currentRotation = gsap.getProperty(char, 'rotationY') as number;
        const currentY = gsap.getProperty(char, 'y') as number;

        // Get glow elements
        const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
        const outerGlow = glowRef.current;

        if (Math.abs(currentY) < 60) {
          gsap.to(char, { y: -70, duration: 0.3, ease: 'power2.out' });
          // Glows follow with 75% distance and 0.05s lag
          if (innerGlow && outerGlow) {
            gsap.to([innerGlow, outerGlow], { y: -52.5, duration: 0.3, ease: 'power2.out', delay: 0.05 });
          }
        }

        gsap.to(char, {
          rotationY: currentRotation + 720,
          duration: 1.1,
          ease: 'back.out(1.2)',
          onComplete: () => {
            const finalRotation = gsap.getProperty(char, 'rotationY') as number;
            gsap.set(char, { rotationY: finalRotation % 360 });
          },
        });

        spinDescentTimerRef.current = setTimeout(() => {
          if (char) {
            const finalRotation = gsap.getProperty(char, 'rotationY') as number;
            gsap.set(char, { rotationY: finalRotation % 360 });
            gsap.to(char, {
              y: 0,
              duration: 0.35,
              ease: 'power2.in',
              onComplete: () => {
                gsap.set(char, { rotationY: 0 });
              },
            });
            // Glows descend with lag
            if (innerGlow && outerGlow) {
              gsap.to([innerGlow, outerGlow], {
                y: 0,
                duration: 0.35,
                ease: 'power2.in',
                delay: 0.05,
              });
            }
          }
        }, 1100);
        scheduleExpressionReset(1500);
        break;
      }

      case 'nod': {
        // Nod animation (vertical yes motion)
        const leftEye = antyRef.current?.leftEyeRef?.current;
        const rightEye = antyRef.current?.rightEyeRef?.current;

        if (leftEye && rightEye) {
          gsap.killTweensOf([leftEye, rightEye]);
          gsap.set([leftEye, rightEye], { scaleY: 1, y: 0 });
        }

        gsap.set(char, {
          scale: 1,
          rotation: 0,
          y: 0,
          rotationY: 0,
          rotationX: 0,
          transformPerspective: 600,
        });

        // Create nod timeline - rotate on X axis (up/down nod)
        const nodTl = gsap.timeline();

        // First nod - tilt forward with eyes contracting upward
        nodTl.to(char, {
          rotationX: -35,
          y: 8,
          duration: 0.15,
          ease: 'power2.out',
          transformPerspective: 600,
        });
        if (leftEye && rightEye) {
          nodTl.to([leftEye, rightEye], {
            scaleY: 0.85,
            y: -4,
            duration: 0.15,
            ease: 'power2.out',
          }, '<');
        }

        // Return to center
        nodTl.to(char, {
          rotationX: 0,
          y: 0,
          duration: 0.15,
          ease: 'power2.inOut',
        });
        if (leftEye && rightEye) {
          nodTl.to([leftEye, rightEye], {
            scaleY: 1,
            y: 0,
            duration: 0.15,
            ease: 'power2.inOut',
          }, '<');
        }

        // Second nod - tilt forward
        nodTl.to(char, {
          rotationX: -35,
          y: 8,
          duration: 0.15,
          ease: 'power2.out',
        });
        if (leftEye && rightEye) {
          nodTl.to([leftEye, rightEye], {
            scaleY: 0.85,
            y: -4,
            duration: 0.15,
            ease: 'power2.out',
          }, '<');
        }

        // Return to center
        nodTl.to(char, {
          rotationX: 0,
          y: 0,
          duration: 0.15,
          ease: 'power2.inOut',
        });
        if (leftEye && rightEye) {
          nodTl.to([leftEye, rightEye], {
            scaleY: 1,
            y: 0,
            duration: 0.15,
            ease: 'power2.inOut',
          }, '<');
        }

        // Third nod - tilt forward
        nodTl.to(char, {
          rotationX: -35,
          y: 8,
          duration: 0.15,
          ease: 'power2.out',
        });
        if (leftEye && rightEye) {
          nodTl.to([leftEye, rightEye], {
            scaleY: 0.85,
            y: -4,
            duration: 0.15,
            ease: 'power2.out',
          }, '<');
        }

        // Final return to neutral
        nodTl.to(char, {
          rotationX: 0,
          y: 0,
          duration: 0.2,
          ease: 'power2.inOut',
        });
        if (leftEye && rightEye) {
          nodTl.to([leftEye, rightEye], {
            scaleY: 1,
            y: 0,
            duration: 0.2,
            ease: 'power2.inOut',
          }, '<');
        }

        scheduleExpressionReset(1350);
        break;
      }

      case 'headshake': {
        // Headshake animation (horizontal no motion)
        const leftEye = antyRef.current?.leftEyeRef?.current;
        const rightEye = antyRef.current?.rightEyeRef?.current;

        if (leftEye && rightEye) {
          gsap.killTweensOf([leftEye, rightEye]);
          gsap.set([leftEye, rightEye], { scaleY: 1, y: 0 });
        }

        gsap.set(char, {
          scale: 1,
          rotation: 0,
          y: 0,
          rotationY: 0,
          rotationX: 0,
          transformPerspective: 600,
        });

        // Create headshake timeline - rotate on Y axis (left/right shake)
        const headshakeTl = gsap.timeline();

        // Contract eyes downward for the entire shake duration
        if (leftEye && rightEye) {
          headshakeTl.to([leftEye, rightEye], {
            scaleY: 0.85,
            y: 4,
            duration: 0.18,
            ease: 'power2.out',
          }, 0);
        }

        // First shake - rotate left
        headshakeTl.to(char, {
          rotationY: -45,
          duration: 0.18,
          ease: 'power4.out',
          transformPerspective: 600,
        }, 0);

        // Snap to right
        headshakeTl.to(char, {
          rotationY: 45,
          duration: 0.2,
          ease: 'power4.inOut',
        });

        // Snap back to left
        headshakeTl.to(char, {
          rotationY: -45,
          duration: 0.2,
          ease: 'power4.inOut',
        });

        // Snap to right
        headshakeTl.to(char, {
          rotationY: 45,
          duration: 0.2,
          ease: 'power4.inOut',
        });

        // Snap back to left
        headshakeTl.to(char, {
          rotationY: -45,
          duration: 0.2,
          ease: 'power4.inOut',
        });

        // Final return to neutral
        headshakeTl.to(char, {
          rotationY: 0,
          duration: 0.22,
          ease: 'power2.inOut',
        });

        // Return eyes to normal
        if (leftEye && rightEye) {
          headshakeTl.to([leftEye, rightEye], {
            scaleY: 1,
            y: 0,
            duration: 0.22,
            ease: 'power2.inOut',
          }, '<');
        }

        scheduleExpressionReset(1400);
        break;
      }

      default:
        // For other expressions, just set them without special animations
        scheduleExpressionReset(3000);
        break;
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable all keyboard shortcuts when chat or search is open
      if (isChatOpen || searchActive) {
        return;
      }

      // Prevent default behavior for arrow keys and space
      if (['ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft') {
        setExpression('look-left');
        scheduleExpressionReset(800);
      } else if (e.key === 'ArrowRight') {
        setExpression('look-right');
        scheduleExpressionReset(800);
      } else if (e.key === ' ' || e.key === 'Space') {
        // Trigger jump animation
        if (characterRef.current && expression !== 'off') {
          const character = characterRef.current;

          // Simple jump animation
          const jumpTl = gsap.timeline();
          jumpTl.to(character, {
            y: -60,
            duration: 0.3,
            ease: 'power2.out',
          });
          jumpTl.to(character, {
            y: 0,
            duration: 0.3,
            ease: 'power2.in',
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, isChatOpen, searchActive]);

  // Click outside handler for search mode
  useEffect(() => {
    if (!searchActive) return;

    const handleClickOutside = (event: MouseEvent) => {
      const searchBarEl = searchBarRef.current;
      const target = event.target as Node;

      // Ignore if clicking on search bar or Anty brackets
      if (searchBarEl?.contains(target)) return;

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
        console.log('Search query:', searchValue);
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

      // Create the iconic pulsing growth animation
      const superTl = gsap.timeline();

      // Quick pulse sequence (like Mario's transformation)
      superTl.to(character, {
        scale: 1.15,
        duration: 0.1,
        ease: 'power1.out',
      });
      superTl.to(character, {
        scale: 1.05,
        duration: 0.1,
        ease: 'power1.inOut',
      });
      superTl.to(character, {
        scale: 1.2,
        duration: 0.1,
        ease: 'power1.out',
      });
      superTl.to(character, {
        scale: 1.1,
        duration: 0.1,
        ease: 'power1.inOut',
      });
      superTl.to(character, {
        scale: 1.45,
        duration: 0.15,
        ease: 'back.out(2)',
      });

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
        // Shrink back to normal with a bounce
        gsap.to(character, {
          scale: 1,
          duration: 0.4,
          ease: 'elastic.out(1, 0.5)',
        });
        setIsSuperMode(false);
        superModeTimerRef.current = null;

        // Reset all earned hearts when reverting to normal
        setEarnedHearts([]);
        // Clear all heart timers
        heartTimersRef.current.forEach((timer) => clearTimeout(timer));
        heartTimersRef.current.clear();
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
    setAnimationSource('manual');

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
      console.log('[SEARCH] Already morphing, ignoring');
      return;
    }

    morphingRef.current = true;
    console.log('[SEARCH] Opening search mode');
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

    console.log('[SEARCH] Elements:', {
      leftBody: !!leftBody,
      rightBody: !!rightBody,
      searchBar: !!searchBar,
      shadow: !!shadow,
      innerGlow: !!innerGlow,
      outerGlow: !!outerGlow
    });

    if (!leftBody || !rightBody || !searchBar) return;

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
    const BRACKET_SCALE = 0.14;

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

    const scaledLeftBracketSize = leftBracketSize * BRACKET_SCALE;
    const scaledRightBracketSize = rightBracketSize * BRACKET_SCALE;

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

    console.log('[MORPH] v7 - Direct from bracket positions:', {
      leftBracket: { size: leftBracketSize, scaledSize: scaledLeftBracketSize, currentCenter: { x: leftCurrentCenterX, y: leftCurrentCenterY }, targetCenter: { x: leftTargetCenterX, y: leftTargetCenterY } },
      rightBracket: { size: rightBracketSize, scaledSize: scaledRightBracketSize, currentCenter: { x: rightCurrentCenterX, y: rightCurrentCenterY }, targetCenter: { x: rightTargetCenterX, y: rightTargetCenterY } },
      transforms: { left: { x: leftTransformX, y: leftTransformY }, right: { x: rightTransformX, y: rightTransformY } }
    });

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
      scale: BRACKET_SCALE,
      scaleX: BRACKET_SCALE,
      scaleY: BRACKET_SCALE,
      rotation: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      overwrite: 'all'
    }, 0.2);

    tl.to(rightBody, {
      x: rightTransformX,
      y: rightTransformY,
      scale: BRACKET_SCALE,
      scaleX: BRACKET_SCALE,
      scaleY: BRACKET_SCALE,
      rotation: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      overwrite: 'all'
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
      console.log('[SEARCH] Already morphing, ignoring close');
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

    // Kill any ongoing animations on ALL elements to ensure clean close
    const character = leftBody.parentElement;
    if (character) {
      gsap.killTweensOf(character);
    }
    gsap.killTweensOf([leftBody, rightBody, searchBar]);

    // Set starting states for close animation
    if (leftEye) {
      gsap.killTweensOf(leftEye);
      gsap.set(leftEye, { opacity: 0 }); // Eyes start hidden (keep current y position from opening)
    }
    if (rightEye) {
      gsap.killTweensOf(rightEye);
      gsap.set(rightEye, { opacity: 0 }); // Eyes start hidden (keep current y position from opening)
    }
    if (shadow) {
      gsap.killTweensOf(shadow);
      gsap.set(shadow, { xPercent: -50, opacity: 0, scaleX: 1, scaleY: 1 }); // Shadow starts hidden
    }
    if (innerGlow) {
      gsap.killTweensOf(innerGlow);
      gsap.set(innerGlow, { opacity: 0 }); // Glows start hidden
    }
    if (outerGlow) {
      gsap.killTweensOf(outerGlow);
      gsap.set(outerGlow, { opacity: 0 }); // Glows start hidden
    }
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

      // Reset eyes to idle position if they're stuck in look-left/look-right
      if (antyRef.current?.leftEyeRef?.current && antyRef.current?.rightEyeRef?.current) {
        const leftEye = antyRef.current.leftEyeRef.current;
        const rightEye = antyRef.current.rightEyeRef.current;
        const leftPath = antyRef.current.leftEyePathRef?.current;
        const rightPath = antyRef.current.rightEyePathRef?.current;

        // Kill any ongoing eye animations
        gsap.killTweensOf([leftEye, rightEye]);
        if (leftPath && rightPath) {
          gsap.killTweensOf([leftPath, rightPath]);
        }

        // Reset eyes to idle state
        gsap.set([leftEye, rightEye], {
          height: 44.52, // IDLE_HEIGHT
          width: 18.63,  // IDLE_WIDTH
          scaleY: 1,
          scaleX: 1,
          x: 0,
          y: 0,
        });

        // Reset SVG paths to idle shape
        if (leftPath && rightPath) {
          const IDLE_PATH = "M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z";
          gsap.set([leftPath, rightPath], {
            attr: { d: IDLE_PATH }
          });
        }
      }
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
          // Only trigger happy animation when opening chat
          if (!prev) {
            setExpression('happy');
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
        // Epic feeding animation with particle burst!
        // Create a dramatic timeline
        const feedTl = gsap.timeline();

        // Quick anticipation dip
        feedTl.to(characterElement, {
          y: 5,
          scale: 0.95,
          duration: 0.15,
          ease: 'power2.in',
        });

        // Big satisfying bounce UP
        feedTl.to(characterElement, {
          y: -35,
          scale: 1.1,
          rotation: 0,
          duration: 0.4,
          ease: 'back.out(2)',
        });

        // HOLD at peak while food comes in
        feedTl.to(characterElement, {
          y: -35,
          scale: 1.1,
          duration: 1.25, // Hold for 1250ms while food arrives
        });

        // Descend and settle
        feedTl.to(characterElement, {
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });

        // SPAWN FOOD IMMEDIATELY - will arrive during hover!
        antyRef.current?.spawnFeedingParticles();

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
          setExpression('happy');
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
          morphToSearchBar();
        }
        break;
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      <FPSMeter />

      {/* Animation System Indicator - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`fixed bottom-4 left-4 px-3 py-1.5 rounded-md text-xs font-medium opacity-70 z-50 ${
          USE_NEW_ANIMATION_CONTROLLER
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-blue-100 text-blue-700 border border-blue-300'
        }`}>
          {USE_NEW_ANIMATION_CONTROLLER ? 'NEW ANIMATION SYSTEM' : 'LEGACY ANIMATION SYSTEM'}
        </div>
      )}

      {gameMode === 'idle' ? (
        <>
          <HeartMeter hearts={hearts} earnedHearts={earnedHearts} isOff={expression === 'off'} />

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
          // Clear any pending expression reset from previous states
          clearExpressionReset();

          // Handle OFF - let AnimationController handle the animation
          if (expr === 'off') {
            setExpression('off'); // Controller will trigger power-off animation via isOff state
            return;
          }

          // Handle returning from OFF - let AnimationController handle wake-up
          if (expression === 'off' && expr !== 'off') {
            // Special handling for shocked: go to idle first, then shocked
            if (expr === 'shocked') {
              setExpression('idle');
              setTimeout(() => {
                setExpression('shocked');

                // Manually trigger shocked animation
                if (characterRef.current && antyRef.current) {
                  // Kill all existing animations and reset
                  gsap.killTweensOf(characterRef.current);
                  if (antyRef.current?.leftBodyRef?.current) {
                    gsap.killTweensOf(antyRef.current.leftBodyRef.current);
                    gsap.set(antyRef.current.leftBodyRef.current, { x: 0, y: 0 });
                  }
                  if (antyRef.current?.rightBodyRef?.current) {
                    gsap.killTweensOf(antyRef.current.rightBodyRef.current);
                    gsap.set(antyRef.current.rightBodyRef.current, { x: 0, y: 0 });
                  }
                  gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

                  const leftBody = antyRef.current.leftBodyRef?.current;
                  const rightBody = antyRef.current.rightBodyRef?.current;

                  gsap.to(characterRef.current, {
                    y: -30,
                    duration: 0.2,
                    ease: 'power2.out',
                  });

                  if (leftBody && rightBody) {
                    gsap.to(leftBody, {
                      x: -15,
                      y: -15,
                      duration: 0.2,
                      ease: 'back.out(2)',
                    });
                    gsap.to(rightBody, {
                      x: 15,
                      y: 15,
                      duration: 0.2,
                      ease: 'back.out(2)',
                    });

                    const shakeTl = gsap.timeline({ repeat: 3, yoyo: true });
                    shakeTl.to(characterRef.current, {
                      rotation: 2,
                      duration: 0.08,
                      ease: 'power1.inOut',
                    });

                    setTimeout(() => {
                      gsap.to(leftBody, {
                        x: 0,
                        y: 0,
                        duration: 0.25,
                        ease: 'elastic.out(1, 0.5)',
                      });
                      gsap.to(rightBody, {
                        x: 0,
                        y: 0,
                        duration: 0.25,
                        ease: 'elastic.out(1, 0.5)',
                      });
                    }, 1350);
                  }

                  setTimeout(() => {
                    if (!characterRef.current) return;
                    gsap.to(characterRef.current, {
                      y: 0,
                      rotation: 0,
                      duration: 0.5,
                      ease: 'power1.inOut',
                    });
                  }, 1400);
                }

                scheduleExpressionReset(1350);
              }, 700);
              return;
            }

            // Special handling for excited: leap to life then trigger animation
            if (expr === 'excited') {
              setExpression(expr);

              // Manually trigger excited animation
              setTimeout(() => {
                if (!characterRef.current) return;

                // Kill all existing animations and reset
                gsap.killTweensOf(characterRef.current);
                if (antyRef.current?.leftBodyRef?.current) {
                  gsap.killTweensOf(antyRef.current.leftBodyRef.current);
                  gsap.set(antyRef.current.leftBodyRef.current, { x: 0, y: 0 });
                }
                if (antyRef.current?.rightBodyRef?.current) {
                  gsap.killTweensOf(antyRef.current.rightBodyRef.current);
                  gsap.set(antyRef.current.rightBodyRef.current, { x: 0, y: 0 });
                }
                gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

                const excitedTl = gsap.timeline({
                  onComplete: () => {
                    gsap.set(characterRef.current, { rotation: 0 });
                  }
                });

                // Jump up with 360° flip
                excitedTl.to(characterRef.current, {
                  y: -70,
                  rotation: 360,
                  duration: 0.5,
                  ease: 'power2.out',
                });

                // Hold at top briefly
                excitedTl.to(characterRef.current, {
                  y: -70,
                  rotation: 360,
                  duration: 0.3,
                });

                // Float back down faster
                excitedTl.to(characterRef.current, {
                  y: 0,
                  duration: 0.45,
                  ease: 'power1.inOut',
                });

                // First excited hop
                excitedTl.to(characterRef.current, {
                  y: -25,
                  duration: 0.18,
                  ease: 'power2.out',
                });
                excitedTl.to(characterRef.current, {
                  y: 0,
                  duration: 0.18,
                  ease: 'power2.in',
                });

                // Second excited hop
                excitedTl.to(characterRef.current, {
                  y: -18,
                  duration: 0.15,
                  ease: 'power2.out',
                });
                excitedTl.to(characterRef.current, {
                  y: 0,
                  duration: 0.15,
                  ease: 'power2.in',
                });

                // FIREWORKS!
                const colors = ['#FF1493', '#00CED1', '#FFD700', '#FF69B4', '#7B68EE', '#00FF7F', '#FF6347', '#FF00FF', '#00FFFF'];

                createTrackedTimeout(() => {
                  const burstPositions = [
                    { x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 220 },
                    { x: window.innerWidth / 2 + 120, y: window.innerHeight / 2 - 200 },
                    { x: window.innerWidth / 2, y: window.innerHeight / 2 - 260 },
                  ];

                  burstPositions.forEach((pos, burstIndex) => {
                    createTrackedTimeout(() => {
                      const burstColor = colors[Math.floor(Math.random() * colors.length)];

                      // Main burst - 12 sparkles
                      for (let i = 0; i < 12; i++) {
                        const angle = (i / 12) * Math.PI * 2;
                        const radius = 100;
                        const offsetX = Math.cos(angle) * radius;
                        const offsetY = Math.sin(angle) * radius;

                        const sparkle = document.createElement('div');
                        sparkle.textContent = '✨';
                        sparkle.style.cssText = `
                          position: fixed;
                          left: ${pos.x}px;
                          top: ${pos.y}px;
                          font-size: 40px;
                          pointer-events: none;
                          z-index: 0;
                          filter: drop-shadow(0 0 4px ${burstColor});
                          will-change: transform, opacity;
                        `;
                        sparkleCleanupRef.current.add(sparkle); // Track for cleanup
                        document.body.appendChild(sparkle);

                        gsap.to(sparkle, {
                          x: offsetX,
                          y: offsetY,
                          opacity: 0,
                          duration: 1.2,
                          ease: 'power2.out',
                          onComplete: () => {
                            sparkleCleanupRef.current.delete(sparkle);
                            if (sparkle.parentNode) {
                              document.body.removeChild(sparkle);
                            }
                          },
                        });
                      }

                      // Secondary smaller burst - 8 sparkles
                      createTrackedTimeout(() => {
                        for (let i = 0; i < 8; i++) {
                          const angle = (i / 8) * Math.PI * 2 + 0.2;
                          const radius = 60;
                          const offsetX = Math.cos(angle) * radius;
                          const offsetY = Math.sin(angle) * radius;

                          const sparkle = document.createElement('div');
                          sparkle.textContent = '✨';
                          sparkle.style.cssText = `
                            position: fixed;
                            left: ${pos.x}px;
                            top: ${pos.y}px;
                            font-size: 24px;
                            pointer-events: none;
                            z-index: 0;
                            filter: drop-shadow(0 0 3px ${burstColor});
                            will-change: transform, opacity;
                          `;
                          sparkleCleanupRef.current.add(sparkle); // Track for cleanup
                          document.body.appendChild(sparkle);

                          gsap.to(sparkle, {
                            x: offsetX,
                            y: offsetY,
                            opacity: 0,
                            duration: 1,
                            ease: 'power2.out',
                            onComplete: () => {
                              sparkleCleanupRef.current.delete(sparkle);
                              if (sparkle.parentNode) {
                                document.body.removeChild(sparkle);
                              }
                            },
                          });
                        }
                      }, 80);
                    }, burstIndex * 120);
                  });
                }, 200);

                scheduleExpressionReset(1350);
              }, 100);
              return;
            }

            // Special handling for spin: leap to life then trigger animation
            if (expr === 'spin') {
              setExpression(expr);

              // Manually trigger spin animation
              setTimeout(() => {
                if (!characterRef.current) return;

                // Clear any existing descent timer
                if (spinDescentTimerRef.current) {
                  clearTimeout(spinDescentTimerRef.current);
                  spinDescentTimerRef.current = null;
                }

                // Kill all existing animations and reset
                gsap.killTweensOf(characterRef.current);
                if (antyRef.current?.leftBodyRef?.current) {
                  gsap.killTweensOf(antyRef.current.leftBodyRef.current);
                  gsap.set(antyRef.current.leftBodyRef.current, { x: 0, y: 0 });
                }
                if (antyRef.current?.rightBodyRef?.current) {
                  gsap.killTweensOf(antyRef.current.rightBodyRef.current);
                  gsap.set(antyRef.current.rightBodyRef.current, { x: 0, y: 0 });
                }
                gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

                const currentRotation = gsap.getProperty(characterRef.current, 'rotationY') as number;
                const currentY = gsap.getProperty(characterRef.current, 'y') as number;

                // Jump to top if not already there
                if (Math.abs(currentY) < 60) {
                  gsap.to(characterRef.current, {
                    y: -70,
                    duration: 0.3,
                    ease: 'power2.out',
                  });
                }

                // Continue spinning from current rotation
                gsap.to(characterRef.current, {
                  rotationY: currentRotation + 720,
                  duration: 1.1,
                  ease: 'back.out(1.2)',
                  onComplete: () => {
                    const finalRotation = gsap.getProperty(characterRef.current, 'rotationY') as number;
                    gsap.set(characterRef.current, { rotationY: finalRotation % 360 });
                  }
                });

                // Schedule descent
                spinDescentTimerRef.current = setTimeout(() => {
                  if (characterRef.current) {
                    const finalRotation = gsap.getProperty(characterRef.current, 'rotationY') as number;
                    gsap.set(characterRef.current, { rotationY: finalRotation % 360 });

                    gsap.to(characterRef.current, {
                      y: 0,
                      duration: 0.35,
                      ease: 'power2.in',
                      onComplete: () => {
                        gsap.set(characterRef.current, { rotationY: 0 });
                      }
                    });
                  }
                }, 1100);

                scheduleExpressionReset(1500);
              }, 100);
              return;
            }

            // Special handling for happy: leap to life then trigger wiggle animation
            if (expr === 'happy') {
              setExpression(expr);

              // Manually trigger happy wiggle animation
              setTimeout(() => {
                if (!characterRef.current) return;

                // Kill all existing animations and reset
                gsap.killTweensOf(characterRef.current);
                if (antyRef.current?.leftBodyRef?.current) {
                  gsap.killTweensOf(antyRef.current.leftBodyRef.current);
                  gsap.set(antyRef.current.leftBodyRef.current, { x: 0, y: 0 });
                }
                if (antyRef.current?.rightBodyRef?.current) {
                  gsap.killTweensOf(antyRef.current.rightBodyRef.current);
                  gsap.set(antyRef.current.rightBodyRef.current, { x: 0, y: 0 });
                }
                gsap.set(characterRef.current, { rotation: 0, y: 0, rotationY: 0, scale: 1 });

                // Wiggle animation
                gsap.to(characterRef.current, {
                  rotation: 10,
                  duration: 0.15,
                  ease: 'power1.inOut',
                  yoyo: true,
                  repeat: 5,
                });

                scheduleExpressionReset(1350);
              }, 100);
              return;
            }

            // Special handling for sad: leap to life then trigger droop animation
            if (expr === 'angry') {
              setExpression(expr);

              // Manually trigger sad animation
              setTimeout(() => {
                if (!characterRef.current) return;

                // Kill all existing animations and reset
                gsap.killTweensOf(characterRef.current);
                if (antyRef.current?.leftBodyRef?.current) {
                  gsap.killTweensOf(antyRef.current.leftBodyRef.current);
                  gsap.set(antyRef.current.leftBodyRef.current, { x: 0, y: 0 });
                }
                if (antyRef.current?.rightBodyRef?.current) {
                  gsap.killTweensOf(antyRef.current.rightBodyRef.current);
                  gsap.set(antyRef.current.rightBodyRef.current, { x: 0, y: 0 });
                }
                gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

                // Create angry stern timeline
                const angryTl = gsap.timeline();

                // Drop down slowly
                angryTl.to(characterRef.current, {
                  y: 15,
                  duration: 0.6,
                  ease: 'power2.out',
                });

                // Gentle sway left and right (3 cycles)
                for (let i = 0; i < 3; i++) {
                  angryTl.to(characterRef.current, {
                    x: -8,
                    duration: 0.8,
                    ease: 'sine.inOut',
                  });
                  angryTl.to(characterRef.current, {
                    x: 8,
                    duration: 0.8,
                    ease: 'sine.inOut',
                  });
                }

                // Return to center
                angryTl.to(characterRef.current, {
                  x: 0,
                  duration: 0.4,
                  ease: 'sine.inOut',
                });

                // Rise back up
                angryTl.to(characterRef.current, {
                  y: 0,
                  duration: 0.5,
                  ease: 'power2.in',
                });

                scheduleExpressionReset(6000);
              }, 100);
              return;
            }

            // For all other expressions: leap to life then go straight to expression
            setExpression(expr);
            return; // Don't process further now
          }

          setExpression(expr);

          // Trigger body wiggle animation for happy expression
          if (expr === 'happy' && characterRef.current) {
            // Kill any existing animations and reset all transforms
            gsap.killTweensOf(characterRef.current);
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
            gsap.set(characterRef.current, { rotation: 0, y: 0, rotationY: 0, scale: 1 });

            gsap.to(characterRef.current, {
              rotation: 10,
              duration: 0.15,
              ease: 'power1.inOut',
              yoyo: true,
              repeat: 5,
            });
          }

          // Trigger flip jump animation for excited expression
          if (expr === 'excited' && characterRef.current) {
            // Kill all existing animations and reset
            gsap.killTweensOf(characterRef.current);
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
            gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

            const excitedTl = gsap.timeline({
              onComplete: () => {
                // Reset rotation invisibly after animation completes
                gsap.set(characterRef.current, { rotation: 0 });
              }
            });

            // Jump up with 360° flip
            excitedTl.to(characterRef.current, {
              y: -70,
              rotation: 360,
              duration: 0.5,
              ease: 'power2.out',
            });

            // Hold at top briefly
            excitedTl.to(characterRef.current, {
              y: -70,
              rotation: 360,
              duration: 0.3,
            });

            // Float back down faster
            excitedTl.to(characterRef.current, {
              y: 0,
              duration: 0.45,
              ease: 'power1.inOut',
            });

            // First excited hop
            excitedTl.to(characterRef.current, {
              y: -25,
              duration: 0.18,
              ease: 'power2.out',
            });
            excitedTl.to(characterRef.current, {
              y: 0,
              duration: 0.18,
              ease: 'power2.in',
            });

            // Second excited hop
            excitedTl.to(characterRef.current, {
              y: -18,
              duration: 0.15,
              ease: 'power2.out',
            });
            excitedTl.to(characterRef.current, {
              y: 0,
              duration: 0.15,
              ease: 'power2.in',
            });

            // FIREWORKS! Colorful blooming bursts - optimized for performance
            const colors = ['#FF1493', '#00CED1', '#FFD700', '#FF69B4', '#7B68EE', '#00FF7F', '#FF6347', '#FF00FF', '#00FFFF'];

            // Trigger fireworks almost immediately (0.2s in)
            createTrackedTimeout(() => {
              // Create 3 staggered firework bursts (reduced from 5 for performance)
              const burstPositions = [
                { x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 220 },
                { x: window.innerWidth / 2 + 120, y: window.innerHeight / 2 - 200 },
                { x: window.innerWidth / 2, y: window.innerHeight / 2 - 260 },
              ];

              burstPositions.forEach((pos, burstIndex) => {
                createTrackedTimeout(() => {
                  // Pick a random color for this burst
                  const burstColor = colors[Math.floor(Math.random() * colors.length)];

                  // Skip shell animation - go straight to burst for performance
                  // Main burst - 12 sparkles (reduced from 20)
                  for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const radius = 100;
                    const offsetX = Math.cos(angle) * radius;
                    const offsetY = Math.sin(angle) * radius;

                    const sparkle = document.createElement('div');
                    sparkle.textContent = '✨';
                    sparkle.style.cssText = `
                      position: fixed;
                      left: ${pos.x}px;
                      top: ${pos.y}px;
                      font-size: 40px;
                      pointer-events: none;
                      z-index: 0;
                      filter: drop-shadow(0 0 4px ${burstColor});
                      will-change: transform, opacity;
                    `;
                    sparkleCleanupRef.current.add(sparkle); // Track for cleanup
                    document.body.appendChild(sparkle);

                    gsap.to(sparkle, {
                      x: offsetX,
                      y: offsetY,
                      opacity: 0,
                      duration: 1.2,
                      ease: 'power2.out',
                      onComplete: () => {
                        sparkleCleanupRef.current.delete(sparkle);
                        if (sparkle.parentNode) {
                          document.body.removeChild(sparkle);
                        }
                      },
                    });
                  }

                  // Secondary smaller burst - 8 sparkles (reduced from 15)
                  createTrackedTimeout(() => {
                    for (let i = 0; i < 8; i++) {
                      const angle = (i / 8) * Math.PI * 2 + 0.2;
                      const radius = 60;
                      const offsetX = Math.cos(angle) * radius;
                      const offsetY = Math.sin(angle) * radius;

                      const sparkle = document.createElement('div');
                      sparkle.textContent = '✨';
                      sparkle.style.cssText = `
                        position: fixed;
                        left: ${pos.x}px;
                        top: ${pos.y}px;
                        font-size: 24px;
                        pointer-events: none;
                        z-index: 0;
                        filter: drop-shadow(0 0 3px ${burstColor});
                        will-change: transform, opacity;
                      `;
                      sparkleCleanupRef.current.add(sparkle); // Track for cleanup
                      document.body.appendChild(sparkle);

                      gsap.to(sparkle, {
                        x: offsetX,
                        y: offsetY,
                        opacity: 0,
                        duration: 1,
                        ease: 'power2.out',
                        onComplete: () => {
                          sparkleCleanupRef.current.delete(sparkle);
                          if (sparkle.parentNode) {
                            document.body.removeChild(sparkle);
                          }
                        },
                      });
                    }
                  }, 80);
                }, burstIndex * 120);
              });
            }, 200);

            // Confetti celebration (disabled, but capability preserved)
            // if (antyRef.current?.spawnConfetti) {
            //   console.log('[EXCITED MENU] Triggering confetti from expression menu');
            //   createTrackedTimeout(() => {
            //     const centerX = window.innerWidth / 2;
            //     const centerY = window.innerHeight / 2 - 220;

            //     console.log('[EXCITED MENU] Calling spawnConfetti with:', { centerX, centerY });
            //     antyRef.current?.spawnConfetti?.(centerX, centerY, 40);
            //   }, 300);
            // } else {
            //   console.warn('[EXCITED MENU] No spawnConfetti method available');
            // }
          }

          // Trigger shocked animation - MORE DRAMATIC!
          if (expr === 'shocked' && characterRef.current && antyRef.current) {
            // Kill all existing animations and reset
            gsap.killTweensOf(characterRef.current);
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
            gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

            const leftBody = antyRef.current.leftBodyRef?.current;
            const rightBody = antyRef.current.rightBodyRef?.current;

            // Character rises up HIGHER - more dramatic
            gsap.to(characterRef.current, {
              y: -30,
              duration: 0.2,
              ease: 'power2.out',
            });

            // Brackets move apart MORE - wider separation for dramatic effect
            if (leftBody && rightBody) {
              gsap.to(leftBody, {
                x: -15,
                y: -15,
                duration: 0.2,
                ease: 'back.out(2)',
              });
              gsap.to(rightBody, {
                x: 15,
                y: 15,
                duration: 0.2,
                ease: 'back.out(2)',
              });

              // Add a slight shake while shocked
              const shakeTl = gsap.timeline({ repeat: 3, yoyo: true });
              shakeTl.to(characterRef.current, {
                rotation: 2,
                duration: 0.08,
                ease: 'power1.inOut',
              });

              // Brackets STAY OPEN then snap back tightly with eyes
              setTimeout(() => {
                gsap.to(leftBody, {
                  x: 0,
                  y: 0,
                  duration: 0.25,
                  ease: 'elastic.out(1, 0.5)',
                });
                gsap.to(rightBody, {
                  x: 0,
                  y: 0,
                  duration: 0.25,
                  ease: 'elastic.out(1, 0.5)',
                });
              }, 1350);
            }

            // Character comes back down smoothly after longer hold
            setTimeout(() => {
              gsap.to(characterRef.current, {
                y: 0,
                rotation: 0,
                duration: 0.5,
                ease: 'power1.inOut',
              });
            }, 1400);
          }

          // Trigger Y-axis spin jump animation for spin expression
          if (expr === 'spin' && characterRef.current) {
            // Clear any existing descent timer (for continuous spinning)
            if (spinDescentTimerRef.current) {
              clearTimeout(spinDescentTimerRef.current);
              spinDescentTimerRef.current = null;
            }

            // Kill all existing animations and reset
            gsap.killTweensOf(characterRef.current);
            if (antyRef.current?.leftBodyRef?.current) {
              gsap.killTweensOf(antyRef.current.leftBodyRef.current);
              gsap.set(antyRef.current.leftBodyRef.current, { x: 0, y: 0 });
            }
            if (antyRef.current?.rightBodyRef?.current) {
              gsap.killTweensOf(antyRef.current.rightBodyRef.current);
              gsap.set(antyRef.current.rightBodyRef.current, { x: 0, y: 0 });
            }
            gsap.set(characterRef.current, { scale: 1, rotation: 0 });

            // Get current rotation and position
            const currentRotation = gsap.getProperty(characterRef.current, 'rotationY') as number;
            const currentY = gsap.getProperty(characterRef.current, 'y') as number;

            // Jump to top if not already there
            if (Math.abs(currentY) < 60) {
              gsap.to(characterRef.current, {
                y: -70,
                duration: 0.3,
                ease: 'power2.out',
              });
            }

            // Continue spinning from current rotation
            gsap.to(characterRef.current, {
              rotationY: currentRotation + 720,
              duration: 1.1,
              ease: 'back.out(1.2)',
              onComplete: () => {
                // Reset rotationY to keep it from getting too large
                const finalRotation = gsap.getProperty(characterRef.current, 'rotationY') as number;
                gsap.set(characterRef.current, { rotationY: finalRotation % 360 });
              }
            });

            // Schedule descent - start right as spin finishes
            spinDescentTimerRef.current = setTimeout(() => {
              if (characterRef.current) {
                // Make sure rotation is clean before descending
                const finalRotation = gsap.getProperty(characterRef.current, 'rotationY') as number;
                gsap.set(characterRef.current, { rotationY: finalRotation % 360 });

                gsap.to(characterRef.current, {
                  y: 0,
                  duration: 0.35,
                  ease: 'power2.in',
                  onComplete: () => {
                    gsap.set(characterRef.current, { rotationY: 0 });
                  }
                });
              }
            }, 1100);
          }

          // Trigger angry stern animation
          if (expr === 'angry' && characterRef.current) {
            // Kill all existing animations and reset
            gsap.killTweensOf(characterRef.current);
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
            gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

            // Create angry grumbling timeline
            const angryTl = gsap.timeline();

            // Drop down
            angryTl.to(characterRef.current, {
              y: 15,
              duration: 0.6,
              ease: 'power2.out',
            });

            // Fast jittery grumbling WHILE dropping (all at same time as drop)
            angryTl.to(characterRef.current, {
              x: 6,
              duration: 0.12,
              ease: 'power1.inOut',
            }, 0); // Start at same time as drop

            angryTl.to(characterRef.current, {
              x: -6,
              duration: 0.12,
              ease: 'power1.inOut',
            }, 0.1);

            angryTl.to(characterRef.current, {
              x: 6,
              duration: 0.12,
              ease: 'power1.inOut',
            }, 0.2);

            angryTl.to(characterRef.current, {
              x: -6,
              duration: 0.12,
              ease: 'power1.inOut',
            }, 0.3);

            angryTl.to(characterRef.current, {
              x: 6,
              duration: 0.12,
              ease: 'power1.inOut',
            }, 0.4);

            // Snap to center at bottom
            angryTl.to(characterRef.current, {
              x: 0,
              duration: 0.1,
              ease: 'power1.out',
            });

            // Stay at bottom with angry eyes
            angryTl.to(characterRef.current, {
              y: 15,
              duration: 1.5,
            });

            // Change eyes back to idle as we start rising
            angryTl.call(() => {
              setExpression('idle');
            });

            // Rise back up
            angryTl.to(characterRef.current, {
              y: 0,
              duration: 0.5,
              ease: 'power2.in',
            }, '-=0.5'); // Start rising immediately as eyes change
          }

          // Trigger sad droopy animation
          if (expr === 'sad' && characterRef.current) {
            // Kill all existing animations and reset
            gsap.killTweensOf(characterRef.current);
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
            gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

            // Create sad droopy timeline
            const sadTl = gsap.timeline();

            // Drop down gently
            sadTl.to(characterRef.current, {
              y: 18,
              duration: 0.7,
              ease: 'power2.out',
            });

            // Very gentle subtle sway (2 cycles, smaller movement)
            for (let i = 0; i < 2; i++) {
              sadTl.to(characterRef.current, {
                x: -5,
                duration: 1,
                ease: 'sine.inOut',
              });
              sadTl.to(characterRef.current, {
                x: 5,
                duration: 1,
                ease: 'sine.inOut',
              });
            }

            // Return to center slowly
            sadTl.to(characterRef.current, {
              x: 0,
              duration: 0.6,
              ease: 'sine.inOut',
            });

            // Rise back up gently
            sadTl.to(characterRef.current, {
              y: 0,
              duration: 0.6,
              ease: 'power2.in',
            });
          }

          // Trigger idea "aha!" animation
          if (expr === 'idea' && characterRef.current) {
            // Kill all existing animations and reset
            gsap.killTweensOf(characterRef.current);
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
            gsap.set(characterRef.current, { scale: 1, rotation: 0, y: 0, rotationY: 0 });

            // Create idea "aha!" timeline
            const ideaTl = gsap.timeline();

            // Jump up quickly
            ideaTl.to(characterRef.current, {
              y: -80,
              duration: 0.4,
              ease: 'power2.out',
            });

            // Spawn lightbulb emoji above Anty when in the air
            setTimeout(() => {
              const rect = characterRef.current?.getBoundingClientRect();
              if (!rect) return;

              const lightbulb = document.createElement('div');
              lightbulb.textContent = '💡';
              lightbulb.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2 - 20}px;
                top: ${rect.top - 40}px;
                font-size: 48px;
                pointer-events: none;
                z-index: 1000;
                filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
              `;
              document.body.appendChild(lightbulb);

              // Pop in
              gsap.fromTo(lightbulb,
                { scale: 0, opacity: 0, y: 20 },
                {
                  scale: 1.2,
                  opacity: 1,
                  y: 0,
                  duration: 0.3,
                  ease: 'back.out(2)',
                }
              );

              // Float and fade out
              setTimeout(() => {
                gsap.to(lightbulb, {
                  y: -30,
                  opacity: 0,
                  duration: 0.8,
                  ease: 'power2.in',
                  onComplete: () => {
                    document.body.removeChild(lightbulb);
                  },
                });
              }, 600);
            }, 300);

            // Hang in the air longer
            ideaTl.to(characterRef.current, {
              y: -80,
              duration: 1.0,
            });

            // Drop back down
            ideaTl.to(characterRef.current, {
              y: 0,
              duration: 0.4,
              ease: 'power2.in',
            });
          }

          // Trigger nod animation (vertical yes motion)
          if (expr === 'nod' && characterRef.current && antyRef.current) {
            // Kill all existing animations and reset
            gsap.killTweensOf(characterRef.current);
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
            gsap.set(characterRef.current, {
              scale: 1,
              rotation: 0,
              y: 0,
              rotationY: 0,
              rotationX: 0,
              transformPerspective: 600,
            });

            // Get eye refs
            const leftEye = antyRef.current.leftEyeRef?.current;
            const rightEye = antyRef.current.rightEyeRef?.current;

            if (leftEye && rightEye) {
              gsap.killTweensOf([leftEye, rightEye]);
              gsap.set([leftEye, rightEye], { scaleY: 1, y: 0 });
            }

            // Create nod timeline - rotate on X axis (up/down nod)
            const nodTl = gsap.timeline();

            // First nod - tilt forward with eyes contracting upward
            nodTl.to(characterRef.current, {
              rotationX: -35,
              y: 8,
              duration: 0.15,
              ease: 'power2.out',
              transformPerspective: 600,
            });
            if (leftEye && rightEye) {
              nodTl.to([leftEye, rightEye], {
                scaleY: 0.85,
                y: -4,
                duration: 0.15,
                ease: 'power2.out',
              }, '<');
            }

            // Return to center
            nodTl.to(characterRef.current, {
              rotationX: 0,
              y: 0,
              duration: 0.15,
              ease: 'power2.inOut',
            });
            if (leftEye && rightEye) {
              nodTl.to([leftEye, rightEye], {
                scaleY: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.inOut',
              }, '<');
            }

            // Second nod - tilt forward
            nodTl.to(characterRef.current, {
              rotationX: -35,
              y: 8,
              duration: 0.15,
              ease: 'power2.out',
            });
            if (leftEye && rightEye) {
              nodTl.to([leftEye, rightEye], {
                scaleY: 0.85,
                y: -4,
                duration: 0.15,
                ease: 'power2.out',
              }, '<');
            }

            // Return to center
            nodTl.to(characterRef.current, {
              rotationX: 0,
              y: 0,
              duration: 0.15,
              ease: 'power2.inOut',
            });
            if (leftEye && rightEye) {
              nodTl.to([leftEye, rightEye], {
                scaleY: 1,
                y: 0,
                duration: 0.15,
                ease: 'power2.inOut',
              }, '<');
            }

            // Third nod - tilt forward
            nodTl.to(characterRef.current, {
              rotationX: -35,
              y: 8,
              duration: 0.15,
              ease: 'power2.out',
            });
            if (leftEye && rightEye) {
              nodTl.to([leftEye, rightEye], {
                scaleY: 0.85,
                y: -4,
                duration: 0.15,
                ease: 'power2.out',
              }, '<');
            }

            // Final return to neutral
            nodTl.to(characterRef.current, {
              rotationX: 0,
              y: 0,
              duration: 0.2,
              ease: 'power2.inOut',
            });
            if (leftEye && rightEye) {
              nodTl.to([leftEye, rightEye], {
                scaleY: 1,
                y: 0,
                duration: 0.2,
                ease: 'power2.inOut',
              }, '<');
            }
          }

          // Trigger headshake animation (horizontal no motion)
          if (expr === 'headshake' && characterRef.current && antyRef.current) {
            // Kill all existing animations and reset
            gsap.killTweensOf(characterRef.current);
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
            gsap.set(characterRef.current, {
              scale: 1,
              rotation: 0,
              y: 0,
              rotationY: 0,
              rotationX: 0,
              transformPerspective: 600,
            });

            // Get eye refs
            const leftEye = antyRef.current.leftEyeRef?.current;
            const rightEye = antyRef.current.rightEyeRef?.current;

            if (leftEye && rightEye) {
              gsap.killTweensOf([leftEye, rightEye]);
              gsap.set([leftEye, rightEye], { scaleY: 1, y: 0 });
            }

            // Create headshake timeline - rotate on Y axis (left/right shake)
            const headshakeTl = gsap.timeline();

            // Contract eyes downward for the entire shake duration
            if (leftEye && rightEye) {
              headshakeTl.to([leftEye, rightEye], {
                scaleY: 0.85,
                y: 4,
                duration: 0.18,
                ease: 'power2.out',
              }, 0);
            }

            // First shake - rotate left
            headshakeTl.to(characterRef.current, {
              rotationY: -45,
              duration: 0.18,
              ease: 'power4.out',
              transformPerspective: 600,
            }, 0);

            // Snap to right
            headshakeTl.to(characterRef.current, {
              rotationY: 45,
              duration: 0.2,
              ease: 'power4.inOut',
            });

            // Snap back to left
            headshakeTl.to(characterRef.current, {
              rotationY: -45,
              duration: 0.2,
              ease: 'power4.inOut',
            });

            // Snap to right
            headshakeTl.to(characterRef.current, {
              rotationY: 45,
              duration: 0.2,
              ease: 'power4.inOut',
            });

            // Snap back to left
            headshakeTl.to(characterRef.current, {
              rotationY: -45,
              duration: 0.2,
              ease: 'power4.inOut',
            });

            // Final return to neutral
            headshakeTl.to(characterRef.current, {
              rotationY: 0,
              duration: 0.22,
              ease: 'power2.inOut',
            });

            // Return eyes to normal
            if (leftEye && rightEye) {
              headshakeTl.to([leftEye, rightEye], {
                scaleY: 1,
                y: 0,
                duration: 0.22,
                ease: 'power2.inOut',
              }, '<');
            }
          }

          // Different timeout for different expressions
          // OFF state never auto-returns to idle - user must manually change
          if (expr === 'off') {
            // Don't auto-return to idle
          } else if (expr === 'spin') {
            scheduleExpressionReset(1500);
          } else if (expr === 'angry') {
            // Angry animation handles eye change internally via timeline
            // Don't auto-return to idle
          } else if (expr === 'sad') {
            scheduleExpressionReset(5500);
          } else if (expr === 'idea') {
            scheduleExpressionReset(2300);
          } else if (expr === 'nod') {
            scheduleExpressionReset(1200);
          } else if (expr === 'headshake') {
            scheduleExpressionReset(900);
          } else if (expr === 'look-left' || expr === 'look-right') {
            // Look animations hold briefly then return to idle
            scheduleExpressionReset(800);
          } else if (expr === 'lookaround') {
            // Lookaround: deliberate left-center-right-center, then quick darting
            const sequence: { expression: ExpressionName; delay: number }[] = [
              { expression: 'look-left', delay: 0 },      // Look left
              { expression: 'idle', delay: 1000 },        // Back to center
              { expression: 'look-right', delay: 1000 },  // Look right
              { expression: 'idle', delay: 1000 },        // Back to center
              { expression: 'look-left', delay: 1000 },   // Quick left (start lowering)
              { expression: 'look-right', delay: 300 },   // Quick right (lowered)
              { expression: 'look-left', delay: 300 },    // Quick left (lowered)
              { expression: 'idle', delay: 300 },         // Return to idle (raise back up)
            ];

            let currentStep = 0;
            const executeSequence = () => {
              if (currentStep >= sequence.length) return;

              const step = sequence[currentStep];
              setTimeout(() => {
                setExpression(step.expression);

                // Lower Anty during the last three back-and-forth looks (steps 4, 5, 6)
                if (characterRef.current) {
                  if (currentStep === 4) {
                    // Start lowering on first quick look
                    gsap.to(characterRef.current, {
                      y: 15,
                      duration: 0.2,
                      ease: 'power2.out',
                    });
                  } else if (currentStep === 7) {
                    // Raise back up when returning to idle
                    gsap.to(characterRef.current, {
                      y: 0,
                      duration: 0.3,
                      ease: 'power2.out',
                    });
                  }
                }

                currentStep++;
                executeSequence();
              }, step.delay);
            };

            executeSequence();

            // Don't schedule reset - the sequence handles returning to idle
          } else {
            scheduleExpressionReset(1350);
          }
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
            const onExpression: ExpressionName = 'happy';

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
          animationSource={animationSource}
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
