'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { AntyCharacterV3, ActionButtonsV3, HeartMeter, ExpressionMenu, PowerButton, FlappyGame, FPSMeter, type ButtonName, type AntyCharacterHandle, type EarnedHeart } from '@/components/anty-v3';
import { ChatPanel } from '@/components/anty-chat';
import type { ExpressionName } from '@/lib/anty-v3/animation-state';
import type { AntyStats } from '@/lib/anty-v3/stat-system';

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [expression]);

  // Animate the glow with ghostly, randomized movement
  useEffect(() => {
    // Only animate in idle mode when glow exists
    if (gameMode !== 'idle' || !glowRef.current) return;

    const animateGhostly = () => {
      // Check if we're still in idle mode and glow still exists
      if (gameMode !== 'idle' || !glowRef.current) return;

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
          if (gameMode !== 'idle' || !glowRef.current) return;

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
  }, [gameMode]);

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
      },
    });

    // Fade glows back in (parallel with jump)
    if (innerGlow && outerGlow) {
      gsap.to([innerGlow, outerGlow], {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    // Shadow pops back immediately
    if (shadow) {
      gsap.set(shadow, {
        scaleX: 1,
        scaleY: 1,
        opacity: 0.7,
      });
    }
  };

  const handleButtonClick = (button: ButtonName) => {
    const characterElement = characterRef.current;
    if (!characterElement) return;

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

    // If coming from OFF state, WOOHOOO leap to life first!!!
    if (expression === 'off') {
      performWakeUpAnimation();
      setExpression('idle');
    }

    switch (button) {
      case 'chat':
        // Open chat panel
        setIsChatOpen(true);
        // Trigger happy animation when opening chat
        setExpression('happy');
        scheduleExpressionReset(2000);
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
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      <FPSMeter />
      {gameMode === 'idle' ? (
        <>
          <HeartMeter hearts={hearts} earnedHearts={earnedHearts} isOff={expression === 'off'} />

          <div className="flex-1 flex items-center justify-center pb-12 relative">
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
                className="inner-glow absolute left-1/2 -translate-x-1/2"
                style={{
                  top: '80px',
                  width: '120px',
                  height: '90px',
                  borderRadius: '50%',
                  opacity: 1,
                  background: 'linear-gradient(90deg, #C5D4FF 0%, #E0C5FF 100%)',
                  filter: 'blur(25px)',
                  transform: 'translate(-50%, -50%)',
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Floating glow behind Anty - Layer 2 (outer, softer) */}
              <div
                ref={glowRef}
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  top: '80px',
                  width: '170px',
                  height: '130px',
                  borderRadius: '50%',
                  opacity: 1,
                  background: 'linear-gradient(90deg, #D5E2FF 0%, #EED5FF 100%)',
                  filter: 'blur(45px)',
                  transform: 'translate(-50%, -50%)',
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

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
            </div>
          </div>

          <div className="action-buttons">
            <ActionButtonsV3 onButtonClick={handleButtonClick} isOff={expression === 'off'} moodsButtonRef={moodsButtonRef} />
          </div>

          <ExpressionMenu
        currentExpression={expression}
        isExpanded={isExpressionMenuExpanded}
        onClose={() => setIsExpressionMenuExpanded(false)}
        buttonRef={moodsButtonRef}
        onExpressionSelect={(expr) => {
          // Clear any pending expression reset from previous states
          clearExpressionReset();

          // Handle OFF animation manually since we need to delay expression change
          if (expr === 'off' && characterRef.current && glowRef.current) {
            const character = characterRef.current;
            const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
            const outerGlow = glowRef.current;

            // Kill any existing animations
            gsap.killTweensOf([character, innerGlow, outerGlow]);

            // Reset eyes to center position (in case they're stuck left/right)
            if (antyRef.current?.leftEyeRef?.current && antyRef.current?.rightEyeRef?.current) {
              const leftEye = antyRef.current.leftEyeRef.current;
              const rightEye = antyRef.current.rightEyeRef.current;
              const leftPath = antyRef.current.leftEyePathRef?.current;
              const rightPath = antyRef.current.rightEyePathRef?.current;

              gsap.killTweensOf([leftEye, rightEye]);
              if (leftPath && rightPath) {
                gsap.killTweensOf([leftPath, rightPath]);
              }

              // Reset to centered idle state
              gsap.set([leftEye, rightEye], {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                height: 44.52,
                width: 18.63,
              });

              // Reset SVG paths to idle shape
              if (leftPath && rightPath) {
                const IDLE_PATH = "M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z";
                gsap.set([leftPath, rightPath], { attr: { d: IDLE_PATH } });
              }
            }

            // Create OFF animation timeline
            const offTl = gsap.timeline();

            // 1. Climb up (0.5s) - eyes stay as idle during this
            offTl.to(character, {
              y: -60,
              duration: 0.5,
              ease: 'power2.out',
            });

            // 2. SNAP down HARD - super fast shrink to 65% (35% smaller)
            offTl.to(character, {
              y: 0,
              scale: 0.65,
              duration: 0.1, // Even faster - 100ms snap
              ease: 'expo.in', // Exponential acceleration for dramatic snap
            });

            // Change expression RIGHT at the very end of snap (super late)
            setTimeout(() => setExpression('off'), 590);

            // Fade character to transparent IMMEDIATELY after snap (super fast)
            setTimeout(() => {
              gsap.to(character, {
                opacity: 0.45,
                duration: 0.05, // Lightning fast - 50ms
                ease: 'power2.in',
              });
            }, 600); // Right when snap finishes

            // Fade out background glows and shadow at the same time (super fast)
            setTimeout(() => {
              const shadow = document.getElementById('anty-shadow');
              gsap.to([innerGlow, outerGlow, shadow], {
                opacity: 0,
                duration: 0.06, // Lightning fast - 60ms
                ease: 'power2.in',
              });
            }, 590); // Start right at the end of snap
            return; // Don't process further
          }

          // Handle returning from OFF with WOOHOOO leap to life!!!
          if (expression === 'off' && expr !== 'off' && characterRef.current && glowRef.current) {
            performWakeUpAnimation();

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

                setTimeout(() => {
                  const burstPositions = [
                    { x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 220 },
                    { x: window.innerWidth / 2 + 120, y: window.innerHeight / 2 - 200 },
                    { x: window.innerWidth / 2, y: window.innerHeight / 2 - 260 },
                  ];

                  burstPositions.forEach((pos, burstIndex) => {
                    setTimeout(() => {
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
                        document.body.appendChild(sparkle);

                        gsap.to(sparkle, {
                          x: offsetX,
                          y: offsetY,
                          opacity: 0,
                          duration: 1.2,
                          ease: 'power2.out',
                          onComplete: () => { document.body.removeChild(sparkle); },
                        });
                      }

                      // Secondary smaller burst - 8 sparkles
                      setTimeout(() => {
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
                          document.body.appendChild(sparkle);

                          gsap.to(sparkle, {
                            x: offsetX,
                            y: offsetY,
                            opacity: 0,
                            duration: 1,
                            ease: 'power2.out',
                            onComplete: () => { document.body.removeChild(sparkle); },
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
            setTimeout(() => {
              // Create 3 staggered firework bursts (reduced from 5 for performance)
              const burstPositions = [
                { x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 220 },
                { x: window.innerWidth / 2 + 120, y: window.innerHeight / 2 - 200 },
                { x: window.innerWidth / 2, y: window.innerHeight / 2 - 260 },
              ];

              burstPositions.forEach((pos, burstIndex) => {
                setTimeout(() => {
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
                    document.body.appendChild(sparkle);

                    gsap.to(sparkle, {
                      x: offsetX,
                      y: offsetY,
                      opacity: 0,
                      duration: 1.2,
                      ease: 'power2.out',
                      onComplete: () => { document.body.removeChild(sparkle); },
                    });
                  }

                  // Secondary smaller burst - 8 sparkles (reduced from 15)
                  setTimeout(() => {
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
                      document.body.appendChild(sparkle);

                      gsap.to(sparkle, {
                        x: offsetX,
                        y: offsetY,
                        opacity: 0,
                        duration: 1,
                        ease: 'power2.out',
                        onComplete: () => { document.body.removeChild(sparkle); },
                      });
                    }
                  }, 80);
                }, burstIndex * 120);
              });
            }, 200);
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

            // Handle returning from OFF with WOOHOOO leap to life!!!
            performWakeUpAnimation();

            setExpression(onExpression);

            // Return to idle after a brief moment
            scheduleExpressionReset(1500);
          } else {
            // Turn off
            clearExpressionReset();

            if (characterRef.current && glowRef.current) {
              const character = characterRef.current;
              const innerGlow = document.querySelector('.inner-glow') as HTMLElement;
              const outerGlow = glowRef.current;

              // Kill any existing animations
              gsap.killTweensOf([character, innerGlow, outerGlow]);

              // Reset eyes to center position (in case they're stuck left/right)
              if (antyRef.current?.leftEyeRef?.current && antyRef.current?.rightEyeRef?.current) {
                const leftEye = antyRef.current.leftEyeRef.current;
                const rightEye = antyRef.current.rightEyeRef.current;
                const leftPath = antyRef.current.leftEyePathRef?.current;
                const rightPath = antyRef.current.rightEyePathRef?.current;

                gsap.killTweensOf([leftEye, rightEye]);
                if (leftPath && rightPath) {
                  gsap.killTweensOf([leftPath, rightPath]);
                }

                // Reset to centered idle state
                gsap.set([leftEye, rightEye], {
                  x: 0,
                  y: 0,
                  scaleX: 1,
                  scaleY: 1,
                  height: 44.52,
                  width: 18.63,
                });

                // Reset SVG paths to idle shape
                if (leftPath && rightPath) {
                  const IDLE_PATH = "M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z";
                  gsap.set([leftPath, rightPath], { attr: { d: IDLE_PATH } });
                }
              }

              // Create OFF animation timeline
              const offTl = gsap.timeline();

              // 1. Climb up (0.5s) - eyes stay as idle during this
              offTl.to(character, {
                y: -60,
                duration: 0.5,
                ease: 'power2.out',
              });

              // 2. SNAP down HARD - super fast shrink to 65% (35% smaller)
              offTl.to(character, {
                y: 0,
                scale: 0.65,
                duration: 0.1, // Even faster - 100ms snap
                ease: 'expo.in', // Exponential acceleration for dramatic snap
              });

              // Change expression RIGHT at the very end of snap (super late)
              setTimeout(() => setExpression('off'), 590);

              // Fade character to transparent IMMEDIATELY after snap (super fast)
              setTimeout(() => {
                gsap.to(character, {
                  opacity: 0.45,
                  duration: 0.05, // Lightning fast - 50ms
                  ease: 'power2.in',
                });
              }, 600); // Right when snap finishes

              // Fade out background glows and shadow at the same time (super fast)
              setTimeout(() => {
                const shadow = document.getElementById('anty-shadow');
                gsap.to([innerGlow, outerGlow, shadow], {
                  opacity: 0,
                  duration: 0.06, // Lightning fast - 60ms
                  ease: 'power2.in',
                });
              }, 590); // Start right at the end of snap
            }
          }
        }}
      />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onEmotion={(emotion) => {
          // Clear any pending expression reset
          clearExpressionReset();

          // Set the emotion
          setExpression(emotion);

          // Trigger body animations for specific emotions
          if (characterRef.current) {
            const char = characterRef.current;

            // Kill existing animations
            gsap.killTweensOf(char);
            if (antyRef.current?.leftBodyRef?.current) {
              gsap.killTweensOf(antyRef.current.leftBodyRef.current);
            }
            if (antyRef.current?.rightBodyRef?.current) {
              gsap.killTweensOf(antyRef.current.rightBodyRef.current);
            }

            switch (emotion) {
              case 'happy':
                // Wiggle animation
                gsap.to(char, {
                  rotation: 10,
                  duration: 0.15,
                  ease: 'power1.inOut',
                  yoyo: true,
                  repeat: 3,
                  onComplete: () => gsap.set(char, { rotation: 0 }),
                });
                break;

              case 'excited':
                // Bounce animation
                gsap.to(char, {
                  y: -20,
                  duration: 0.2,
                  ease: 'power2.out',
                  yoyo: true,
                  repeat: 1,
                  onComplete: () => gsap.set(char, { y: 0 }),
                });
                break;

              case 'shocked':
                // Quick shake
                gsap.to(char, {
                  x: 5,
                  duration: 0.05,
                  ease: 'power1.inOut',
                  yoyo: true,
                  repeat: 5,
                  onComplete: () => gsap.set(char, { x: 0 }),
                });
                break;

              case 'sad':
                // Droop animation
                gsap.to(char, {
                  y: 10,
                  scale: 0.95,
                  duration: 0.3,
                  ease: 'power2.out',
                  onComplete: () => {
                    // Reset after droop
                    gsap.to(char, {
                      y: 0,
                      scale: 1,
                      duration: 0.3,
                      delay: 0.5,
                      ease: 'power2.out',
                    });
                  },
                });
                break;

              case 'wink':
                // Subtle tilt
                gsap.to(char, {
                  rotation: -5,
                  duration: 0.2,
                  ease: 'power2.inOut',
                  yoyo: true,
                  repeat: 1,
                  onComplete: () => gsap.set(char, { rotation: 0 }),
                });
                break;

              case 'idea':
                // Pop up animation
                gsap.to(char, {
                  y: -15,
                  scale: 1.05,
                  duration: 0.15,
                  ease: 'back.out(2)',
                  onComplete: () => {
                    gsap.to(char, {
                      y: 0,
                      scale: 1,
                      duration: 0.2,
                      ease: 'power2.inOut',
                    });
                  },
                });
                break;

              case 'spin':
                // Spin animation
                gsap.to(char, {
                  rotationY: 360,
                  duration: 0.6,
                  ease: 'power2.inOut',
                  onComplete: () => gsap.set(char, { rotationY: 0 }),
                });
                break;
            }
          }

          // Reset to idle after 3 seconds
          scheduleExpressionReset(3000);
        }}
      />

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
