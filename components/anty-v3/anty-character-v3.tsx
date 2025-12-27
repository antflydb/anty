'use client';

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { type ButtonName } from '@/lib/anty-v3/ui-types';
import { type Particle } from '@/lib/anty-v3/particles';
import { type AntyStats } from '@/lib/anty-v3/stat-system';
import { AntyExpressionLayer } from './anty-expression-layer';
import { AntyParticleCanvas, type ParticleCanvasHandle } from './anty-particle-canvas';
import { useAnimationController } from '@/lib/anty-v3/animation/use-animation-controller';
import { type EmotionType, type ExpressionName } from '@/lib/anty-v3/animation/types';
import {
  ENABLE_ANIMATION_DEBUG_LOGS,
  logAnimationEvent,
} from '@/lib/anty-v3/animation/feature-flags';
import { getEyeShape } from '@/lib/anty-v3/animation/definitions/eye-shapes';
import { createLookAnimation, createReturnFromLookAnimation } from '@/lib/anty-v3/animation/definitions/eye-animations';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

// Debug logging utilities for eye animations
const debugLog = {
  leftEye: (action: string, details?: any) => {
    console.log(`[LEFT EYE] ${action}`, details || '');
  },
  rightEye: (action: string, details?: any) => {
    console.log(`[RIGHT EYE] ${action}`, details || '');
  },
  both: (action: string, details?: any) => {
    console.log(`[BOTH EYES] ${action}`, details || '');
  },
  expression: (from: string, to: string) => {
    console.log(`[EXPRESSION] ${from} → ${to} at ${Date.now()}`);
  },
  gsap: (target: 'left' | 'right' | 'both', action: 'to' | 'set' | 'kill', props?: any) => {
    const targetLabel = target === 'both' ? '[BOTH EYES]' : target === 'left' ? '[LEFT EYE]' : '[RIGHT EYE]';
    console.log(`${targetLabel} GSAP.${action}`, props || '');
  }
};

interface AntyCharacterV3Props {
  stats: AntyStats;
  expression?: ExpressionName;
  onButtonClick?: (button: ButtonName) => void;
  onSpontaneousExpression?: (expression: ExpressionName) => void;
  onEmotionComplete?: (emotion: string) => void;
  className?: string;
  size?: number;
  isSuperMode?: boolean;
  searchMode?: boolean;
  debugMode?: boolean;
  onAnimationSequenceChange?: (sequence: string) => void;
  onRandomAction?: (action: string) => void;
}

export interface AntyCharacterHandle {
  spawnFeedingParticles: () => void;
  spawnSparkle?: (x: number, y: number, color?: string) => void;
  spawnLoveHearts?: () => void;
  spawnConfetti?: (x: number, y: number, count?: number) => void;
  showSearchGlow?: () => void;
  hideSearchGlow?: () => void;
  playEmotion?: (emotion: ExpressionName, options?: { isChatOpen?: boolean; showLightbulb?: boolean; quickDescent?: boolean }) => boolean;
  killAll?: () => void;
  startLook?: (direction: 'left' | 'right') => void;
  endLook?: () => void;
  leftBodyRef?: React.RefObject<HTMLDivElement | null>;
  rightBodyRef?: React.RefObject<HTMLDivElement | null>;
  leftEyeRef?: React.RefObject<HTMLDivElement | null>;
  rightEyeRef?: React.RefObject<HTMLDivElement | null>;
  leftEyePathRef?: React.RefObject<SVGPathElement | null>;
  rightEyePathRef?: React.RefObject<SVGPathElement | null>;
}

/**
 * Main Anty Character V3 component with GSAP animations
 * Features:
 * - Continuous idle animations (floating, rotation, breathing)
 * - Expression changes with crossfades
 * - Interactive button responses
 * - Canvas-based particle system
 */
export const AntyCharacterV3 = forwardRef<AntyCharacterHandle, AntyCharacterV3Props>(({
  expression = 'idle',
  onSpontaneousExpression,
  onEmotionComplete,
  className = '',
  size = 160,
  isSuperMode = false,
  searchMode = false,
  debugMode = false,
  onAnimationSequenceChange,
  onRandomAction,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftEyePathRef = useRef<SVGPathElement>(null);
  const rightEyePathRef = useRef<SVGPathElement>(null);
  const leftEyeSvgRef = useRef<SVGSVGElement>(null);
  const rightEyeSvgRef = useRef<SVGSVGElement>(null);
  const leftBodyRef = useRef<HTMLDivElement>(null);
  const rightBodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<ParticleCanvasHandle>(null);

  const [currentExpression, setCurrentExpression] = useState<ExpressionName>(expression);
  const [particles] = useState<Particle[]>([]);
  // isWinking state removed - morphing handles all expressions now

  // Performance fix: Compute expression states instead of storing in state
  const isOff = expression === 'off';

  const superGlowRef = useRef<HTMLDivElement>(null);
  const superGlowTimelineRef = useRef<gsap.core.Timeline | null>(null); // Memory leak fix

  // Force re-render when refs are populated (fixes initialization timing bug)
  const [refsReady, setRefsReady] = useState(false);
  useEffect(() => {
    if (containerRef.current && characterRef.current && !refsReady) {
      setRefsReady(true);
    }
  }, [refsReady]);

  // ============================================================================
  // NEW ANIMATION CONTROLLER
  // ============================================================================
  // Note: Shadow element is in parent (page.tsx) with id="anty-shadow"
  // We'll get it via DOM query since it's outside this component
  const shadowElement = typeof document !== 'undefined' ? document.getElementById('anty-shadow') : null;

  const animationController = useAnimationController(
    {
      container: containerRef.current,
      character: characterRef.current,
      shadow: shadowElement,
      eyeLeft: leftEyeRef.current,
      eyeRight: rightEyeRef.current,
      eyeLeftPath: leftEyePathRef.current,
      eyeRightPath: rightEyePathRef.current,
      eyeLeftSvg: leftEyeSvgRef.current,
      eyeRightSvg: rightEyeSvgRef.current,
      leftBody: leftBodyRef.current,
      rightBody: rightBodyRef.current,
    },
    {
      enableLogging: ENABLE_ANIMATION_DEBUG_LOGS,
      enableQueue: true,
      maxQueueSize: 10,
      defaultPriority: 2,
      isOff,
      searchMode,
      autoStartIdle: true,
      onStateChange: (from, to) => {
        if (ENABLE_ANIMATION_DEBUG_LOGS) {
          logAnimationEvent('State Change', { from, to });
        }
        // Update animation sequence for debug overlay
        if (onAnimationSequenceChange) {
          onAnimationSequenceChange(`CONTROLLER: ${from} → ${to}`);
        }
      },
      onAnimationSequenceChange: onAnimationSequenceChange, // Pass through to controller
      callbacks: {
        onEmotionMotionStart: (emotion) => {
          // Spawn confetti for excited animation
          if (emotion === 'excited' && canvasRef.current?.spawnParticle) {
            // Spawn confetti burst near apex (0.35s rise + brief hang)
            setTimeout(() => {
              const count = 40;
              const canvasCenterX = (size * 5) / 2;
              const canvasCenterY = (size * 5) / 2;

              for (let i = 0; i < count; i++) {
                setTimeout(() => {
                  canvasRef.current?.spawnParticle?.('confetti', canvasCenterX, canvasCenterY - 50);
                }, i * 10);
              }
            }, 550); // Near apex (0.18s squat + 0.4s rise)
          }

          // Spawn yellow sparkles from right eye during wink
          console.log('[WINK SPARKLE] onEmotionMotionStart called with emotion:', emotion);
          if (emotion === 'wink' && canvasRef.current?.spawnParticle) {
            console.log('[WINK SPARKLE] Spawning sparkles, canvasRef:', !!canvasRef.current);
            const canvasCenterX = (size * 5) / 2;
            const canvasCenterY = (size * 5) / 2;
            // Right eye position (slightly right of center, at eye level)
            const rightEyeX = canvasCenterX + 25;
            const rightEyeY = canvasCenterY - 15;

            for (let i = 0; i < 6; i++) {
              setTimeout(() => {
                const spawnX = rightEyeX + (Math.random() - 0.5) * 30;
                const spawnY = rightEyeY + (Math.random() - 0.5) * 30;
                console.log('[WINK SPARKLE] Spawning particle', i, 'at:', { spawnX, spawnY });
                canvasRef.current?.spawnParticle?.(
                  'sparkle',
                  spawnX,
                  spawnY,
                  '#FFD700' // Gold/yellow
                );
              }, 50 + i * 40);
            }
          }

          // Spawn lightbulb emoji for idea animation
          // Timing: leap up 0.25s, hold 0.5s, descend 0.25s (total 1.0s)
          if (emotion === 'idea' && containerRef.current) {
            setTimeout(() => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const lightbulb = document.createElement('div');
              lightbulb.textContent = '💡';
              lightbulb.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2 - 22}px;
                top: ${rect.top - 80}px;
                font-size: 44px;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
              `;
              document.body.appendChild(lightbulb);
              const bulbTl = gsap.timeline({ onComplete: () => lightbulb.remove() });
              // Gentle upward drift (less distance)
              bulbTl.to(lightbulb, { y: -20, duration: 0.6, ease: 'power2.out' }, 0);
              // Fade in quickly
              bulbTl.to(lightbulb, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0);
              // Fade out as he descends
              bulbTl.to(lightbulb, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0.4);
            }, 180); // Appear near apex
          }
        },
        onEmotionMotionComplete: (emotion, timelineId, duration) => {
          // Eye-only actions (look-left, look-right) are secondary animations like blinks
          // They shouldn't generate verbose logging
          const isEyeOnlyAction = emotion === 'look-left' || emotion === 'look-right';

          if (ENABLE_ANIMATION_DEBUG_LOGS && !isEyeOnlyAction) {
            logAnimationEvent('Emotion Motion Complete', { emotion, timelineId, duration });
          }
          // Notify parent that emotion animation has completed
          if (onEmotionComplete) {
            onEmotionComplete(emotion);
          }
        },
      },
    }
  );

  // Log controller initialization status
  useEffect(() => {
    if (ENABLE_ANIMATION_DEBUG_LOGS) {
      logAnimationEvent('Controller Initialization', {
        isReady: animationController.isReady,
        currentState: animationController.getState(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationController.isReady]);

  // Log when controller state changes based on props
  useEffect(() => {
    if (!ENABLE_ANIMATION_DEBUG_LOGS) return;

    logAnimationEvent('Props Changed', {
      expression,
      isOff,
      searchMode,
      controllerState: animationController.getState(),
      controllerEmotion: animationController.getEmotion(),
      isIdle: animationController.isIdle(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, isOff, searchMode]);

  // Expose particle spawning methods and refs to parent
  useImperativeHandle(ref, () => ({
    spawnSparkle: (x: number, y: number, color?: string) => {
      if (canvasRef.current && canvasRef.current.spawnParticle) {
        canvasRef.current.spawnParticle('sparkle', x, y, color);
      }
    },
    leftBodyRef,
    rightBodyRef,
    spawnLoveHearts: () => {
      const container = containerRef.current;
      if (!container) return;

      // Get Anty's position on screen
      const containerRect = container.getBoundingClientRect();
      const antyX = containerRect.left + containerRect.width / 2;
      const antyY = containerRect.top + containerRect.height / 2;

      // Spawn 8 purple heart SVGs radiating out
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 7.20312H6.08634V13.2895H0V7.20312Z" fill="#8B5CF6"/>
              <path d="M0 14.4004H6.08634V20.4867H0V14.4004Z" fill="#8B5CF6"/>
              <path d="M7.19922 7.20312H13.2856V13.2895H7.19922V7.20312Z" fill="#8B5CF6"/>
              <path d="M14.3984 7.20312H20.4848V13.2895H14.3984V7.20312Z" fill="#8B5CF6"/>
              <path d="M7.19922 0.00195312H13.2856V6.08829H7.19922V0.00195312Z" fill="#8B5CF6"/>
              <path d="M7.19922 14.4004H13.2856V20.4867H7.19922V14.4004Z" fill="#8B5CF6"/>
              <path d="M7.19922 21.6016H13.2856V27.6879H7.19922V21.6016Z" fill="#8B5CF6"/>
              <path d="M14.3984 28.8008H20.4848V34.8871H14.3984V28.8008Z" fill="#8B5CF6"/>
              <path d="M14.3984 21.6016H20.4848V27.6879H14.3984V21.6016Z" fill="#8B5CF6"/>
              <path d="M14.3984 14.4004H20.4848V20.4867H14.3984V14.4004Z" fill="#8B5CF6"/>
              <path d="M21.5996 7.20117H27.6859V13.2875H21.5996V7.20117Z" fill="#8B5CF6"/>
              <path d="M21.5996 0H27.6859V6.08634H21.5996V0Z" fill="#8B5CF6"/>
              <path d="M21.5996 14.4004H27.6859V20.4867H21.5996V14.4004Z" fill="#8B5CF6"/>
              <path d="M28.7988 14.4004H34.8852V20.4867H28.7988V14.4004Z" fill="#8B5CF6"/>
              <path d="M21.5996 21.6016H27.6859V27.6879H21.5996V21.6016Z" fill="#8B5CF6"/>
              <path d="M28.7988 7.20117H34.8852V13.2875H28.7988V7.20117Z" fill="#8B5CF6"/>
            </svg>
          `;
          heart.style.position = 'fixed';
          heart.style.left = `${antyX}px`;
          heart.style.top = `${antyY}px`;
          heart.style.pointerEvents = 'none';
          heart.style.zIndex = '1000';

          document.body.appendChild(heart);

          // Animate heart radiating outward
          const angle = (i / 8) * Math.PI * 2;
          const distance = gsap.utils.random(60, 100);

          gsap.fromTo(heart,
            {
              x: 0,
              y: 0,
              scale: 0.5,
              opacity: 0,
            },
            {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: 1,
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                // Fade out
                gsap.to(heart, {
                  opacity: 0,
                  scale: 0.3,
                  duration: 0.3,
                  ease: 'power2.in',
                  onComplete: () => heart.remove()
                });
              }
            }
          );
        }, i * 80);
      }
    },
    spawnFeedingParticles: () => {
      const container = containerRef.current;
      if (!container) return;

      // EPIC EMOJI FOOD IMPLOSION - Flying INTO Anty! 🍰➡️🐜
      const emojiFood = ['🧁', '🍪', '🍩', '🍰', '🎂', '🍬', '🍭', '🍫', '🍓', '🍌', '🍎', '🍊', '⭐', '✨', '💖', '🌟'];
      const particleCount = 60;

      // Create emoji elements starting from outside
      const particles: HTMLDivElement[] = [];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'food-confetti';
        particle.textContent = emojiFood[Math.floor(Math.random() * emojiFood.length)];
        particle.style.position = 'fixed'; // Fixed to viewport
        particle.style.fontSize = `${gsap.utils.random(32, 56)}px`;
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';

        // Start from random position OUTSIDE the viewport
        const angle = (i / particleCount) * Math.PI * 2;
        const startDistance = gsap.utils.random(400, 800); // Far outside
        const startX = window.innerWidth / 2 + Math.cos(angle) * startDistance;
        const startY = window.innerHeight / 2 + Math.sin(angle) * startDistance;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;

        document.body.appendChild(particle); // Append to body for viewport positioning
        particles.push(particle);
      }

      // Get Anty's position on screen
      const containerRect = container.getBoundingClientRect();
      const antyX = containerRect.left + containerRect.width / 2;
      const antyY = containerRect.top + containerRect.height / 2;

      // Animate with GSAP - converging INTO Anty!
      particles.forEach((particle, i) => {
        const currentX = parseFloat(particle.style.left);
        const currentY = parseFloat(particle.style.top);

        const tl = gsap.timeline({
          onComplete: () => {
            particle.remove(); // Cleanup
          }
        });

        // Fly towards Anty with a swooping curve
        tl.fromTo(particle,
          {
            x: 0,
            y: 0,
            scale: 0.3,
            opacity: 0,
            rotation: gsap.utils.random(-180, 180),
          },
          {
            duration: gsap.utils.random(0.8, 1.4), // Original speed - arrive while hovering
            x: antyX - currentX,
            y: antyY - currentY,
            rotation: gsap.utils.random(180, 540), // Continue tumbling
            scale: gsap.utils.random(0.8, 1.3),
            opacity: 1,
            ease: 'power2.in', // Smooth acceleration
          }
        );

        // Fade out as they reach Anty (being absorbed)
        tl.to(particle, {
          duration: 0.15,
          scale: 0,
          opacity: 0,
          ease: 'power4.in',
        });

        // Stagger the start times for cascading effect
        tl.delay(i * 0.01);
      });
    },
    spawnConfetti: (x: number, y: number, count = 30) => {
      console.log('[CONFETTI] Spawning confetti:', { screenX: x, screenY: y, count, hasCanvas: !!canvasRef.current });
      if (!canvasRef.current || !canvasRef.current.spawnParticle || !containerRef.current) {
        console.warn('[CONFETTI] Canvas or container ref not available');
        return;
      }

      // Convert screen coordinates to canvas-relative coordinates
      // Canvas is centered on the character with size * 5 dimensions
      const canvasWidth = size * 5;
      const canvasHeight = size * 5;
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;

      // Get character's position on screen
      const containerRect = containerRef.current.getBoundingClientRect();
      const charCenterX = containerRect.left + containerRect.width / 2;
      const charCenterY = containerRect.top + containerRect.height / 2;

      // Calculate offset from character center
      const offsetX = x - charCenterX;
      const offsetY = y - charCenterY;

      // Convert to canvas coordinates (canvas center is at character center)
      const canvasX = canvasCenterX + offsetX;
      const canvasY = canvasCenterY + offsetY;

      console.log('[CONFETTI] Converted coords:', {
        screenPos: { x, y },
        charCenter: { x: charCenterX, y: charCenterY },
        offset: { x: offsetX, y: offsetY },
        canvasPos: { x: canvasX, y: canvasY }
      });

      // Spawn burst of confetti at specified position
      for (let i = 0; i < count; i++) {
        // Stagger spawn for more natural burst
        setTimeout(() => {
          if (canvasRef.current?.spawnParticle) {
            canvasRef.current.spawnParticle('confetti', canvasX, canvasY);
          }
        }, i * 15); // 15ms stagger
      }
    },
    showSearchGlow: () => {
      if (canvasRef.current && canvasRef.current.showSearchGlow) {
        canvasRef.current.showSearchGlow();
      }
    },
    hideSearchGlow: () => {
      if (canvasRef.current && canvasRef.current.hideSearchGlow) {
        canvasRef.current.hideSearchGlow();
      }
    },
    playEmotion: (emotion: ExpressionName, options?: { isChatOpen?: boolean }) => {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        logAnimationEvent('playEmotion called via handle', { emotion, options });
      }

      // Map ExpressionName to EmotionType
      const validEmotions: Record<string, EmotionType> = {
        'happy': 'happy',
        'excited': 'excited',
        'sad': 'sad',
        'angry': 'angry',
        'shocked': 'shocked',
        'spin': 'spin',
        'wink': 'wink',
        'jump': 'jump',
        'idea': 'idea',
        'lookaround': 'lookaround',
        'nod': 'nod',
        'headshake': 'headshake',
        'look-left': 'look-left',
        'look-right': 'look-right',
        'super': 'super',
      };

      const emotionType = validEmotions[emotion];
      if (emotionType) {
        return animationController.playEmotion(emotionType, { priority: options?.isChatOpen ? 3 : 2 });
      }

      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        console.log('[AnimationController] Emotion not supported:', emotion);
      }
      return false;
    },
    // Hold-style look for keyboard (start on keydown, end on keyup)
    // Completely bypasses the emotion system - direct eye control
    startLook: (direction: 'left' | 'right') => {
      if (!leftEyeRef.current || !rightEyeRef.current || !leftEyePathRef.current || !rightEyePathRef.current || !leftEyeSvgRef.current || !rightEyeSvgRef.current) {
        return;
      }

      // Pause idle animation and blink scheduler to prevent interference
      animationController.pause();

      const lookTl = createLookAnimation(
        {
          leftEye: leftEyeRef.current,
          rightEye: rightEyeRef.current,
          leftEyePath: leftEyePathRef.current,
          rightEyePath: rightEyePathRef.current,
          leftEyeSvg: leftEyeSvgRef.current,
          rightEyeSvg: rightEyeSvgRef.current,
        },
        { direction }
      );
      lookTl.play();
    },
    endLook: () => {
      if (!leftEyeRef.current || !rightEyeRef.current || !leftEyePathRef.current || !rightEyePathRef.current || !leftEyeSvgRef.current || !rightEyeSvgRef.current) {
        return;
      }

      const returnTl = createReturnFromLookAnimation({
        leftEye: leftEyeRef.current,
        rightEye: rightEyeRef.current,
        leftEyePath: leftEyePathRef.current,
        rightEyePath: rightEyePathRef.current,
        leftEyeSvg: leftEyeSvgRef.current,
        rightEyeSvg: rightEyeSvgRef.current,
      });
      returnTl.eventCallback('onComplete', () => {
        // Resume idle animation and blink scheduler after returning to idle
        animationController.resume();
      });
      returnTl.play();
    },
    killAll: () => {
      animationController.killAll();
    },
    leftEyeRef,
    rightEyeRef,
    leftEyePathRef,
    rightEyePathRef,
  }), [size, animationController]);

  // Update expression when prop changes
  // All animations (including wink) are now handled by AnimationController
  useEffect(() => {
    setCurrentExpression(expression);
  }, [expression]);

  // Play emotion animation when expression changes (new controller only)
  // NOTE: Re-trigger blocker REMOVED - controller handles deduplication internally
  useEffect(() => {
    if (!animationController.isReady) return;
    if (isOff) return; // Don't play emotions when powered off

    // Map ExpressionName to EmotionType
    const validEmotions: Record<string, EmotionType> = {
      'happy': 'happy',
      'excited': 'excited',
      'sad': 'sad',
      'angry': 'angry',
      'shocked': 'shocked',
      'spin': 'spin',
      'wink': 'wink',
      'jump': 'jump',
      'idea': 'idea',
      'lookaround': 'lookaround',
      'nod': 'nod',
      'headshake': 'headshake',
      'look-left': 'look-left',
      'look-right': 'look-right',
    };

    const emotionType = validEmotions[expression];
    if (emotionType) {
      if (ENABLE_ANIMATION_DEBUG_LOGS) {
        logAnimationEvent('Expression changed → playEmotion', { expression, emotionType });
      }
      // Allow re-triggers - controller handles deduplication if needed
      animationController.playEmotion(emotionType, { priority: 2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, isOff]);

  // Super mode glow animation
  useEffect(() => {
    if (!superGlowRef.current) return;

    if (isSuperMode) {
      // Memory leak fix: Kill any previous timeline before creating new one
      if (superGlowTimelineRef.current) {
        superGlowTimelineRef.current.kill();
      }

      // Pulsing rainbow glow animation
      const glowTl = gsap.timeline({ repeat: -1, yoyo: true });
      glowTl.to(superGlowRef.current, {
        opacity: 0.9,
        scale: 1.1,
        duration: 0.8,
        ease: 'sine.inOut',
      });

      // Store timeline reference for cleanup
      superGlowTimelineRef.current = glowTl;
    } else {
      // Properly kill timeline and reset
      if (superGlowTimelineRef.current) {
        superGlowTimelineRef.current.kill();
        superGlowTimelineRef.current = null;
      }
      gsap.set(superGlowRef.current, { opacity: 0, scale: 1 });
    }

    // Cleanup on unmount
    return () => {
      if (superGlowTimelineRef.current) {
        superGlowTimelineRef.current.kill();
      }
    };
  }, [isSuperMode]);

  // Track current expression in a ref to avoid recreating the scheduler
  const currentExpressionRef = useRef(expression);
  useEffect(() => {
    currentExpressionRef.current = expression;
  }, [expression]);

  // Track searchMode in a ref to avoid recreating the scheduler
  const searchModeRef = useRef(searchMode);
  useEffect(() => {
    searchModeRef.current = searchMode;
  }, [searchMode]);

  // NOTE: Spontaneous blink scheduler removed - now built into idle animation in NEW system
  // Spontaneous looking behaviors (look-left, look-right) handled separately
  const onSpontaneousExpressionRef = useRef(onSpontaneousExpression);

  useEffect(() => {
    onSpontaneousExpressionRef.current = onSpontaneousExpression;
  }, [onSpontaneousExpression]);

  // Setup spontaneous look behaviors (random looking left/right)
  // IMPORTANT: Empty dependencies to ensure only ONE scheduler is ever created
  useGSAP(
    () => {
      let isActive = true;

      const scheduleRandomBehavior = () => {
        if (!isActive) return;

        const delay = gsap.utils.random(15, 30); // Random delay between 15-30 seconds (rare behaviors)

        gsap.delayedCall(delay, () => {
          if (!isActive) return;

          // Only trigger behaviors when in idle state AND not in search mode
          if (currentExpressionRef.current !== 'idle' || searchModeRef.current) {
            // If not idle or in search mode, wait another full delay period before checking again
            scheduleRandomBehavior();
            return;
          }

          const random = Math.random();

          if (random < 0.5) {
            // 50% chance of look left
            if (onSpontaneousExpressionRef.current) {
              onSpontaneousExpressionRef.current('look-left');
            }
            onRandomAction?.('LOOK LEFT');
          } else {
            // 50% chance of look right
            if (onSpontaneousExpressionRef.current) {
              onSpontaneousExpressionRef.current('look-right');
            }
            onRandomAction?.('LOOK RIGHT');
          }

          // Schedule next behavior (minimum 15 seconds from now)
          scheduleRandomBehavior();
        });
      };

      scheduleRandomBehavior();

      // Cleanup function to stop scheduling when component unmounts
      return () => {
        isActive = false;
      };
    },
    { scope: containerRef, dependencies: [] }
  );

  // Body SVG assets - bracket shapes
  const img = "/anty-v3/body-right.svg"; // Right bracket body
  const img1 = "/anty-v3/body-left.svg"; // Left bracket body

  // Eye assets removed - now using SVG morphing via AnimationController

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: size, height: size, overflow: 'visible' }}
    >
      {/* Canvas overlay for particles - positioned to extend beyond character */}
      <AntyParticleCanvas ref={canvasRef} particles={particles} width={size * 5} height={size * 5} />

      {/* Super Mode Golden Glow */}
      {isSuperMode && (
        <div
          ref={superGlowRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, rgba(255, 165, 0, 0.4) 50%, rgba(255, 215, 0, 0) 100%)',
            filter: 'blur(20px)',
            zIndex: 0,
          }}
        />
      )}

      {/* Character body with animations */}
      <div
        ref={characterRef}
        className="relative w-full h-full"
        style={{
          willChange: 'transform',
          overflow: 'visible',
          opacity: isOff ? 0.45 : 1,
          filter: isSuperMode
            ? 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 40px rgba(255, 165, 0, 0.6)) brightness(1.15) saturate(1.3)'
            : 'none',
          animation: isSuperMode ? 'superModeHue 3s linear infinite' : 'none',
        }}
      >
        {/* Anty body layers from Figma */}
        <div ref={rightBodyRef} className="absolute inset-[13.46%_0_0_13.46%]">
          <img alt="" className="block max-w-none size-full" src={img} />
        </div>
        <div ref={leftBodyRef} className="absolute inset-[0_13.15%_13.15%_0]">
          <img alt="" className="block max-w-none size-full" src={img1} />
        </div>
        {/* Left eye (VIEWER's left) - Always SVG, morphed by animation controller */}
        {/* inset-[top_right_bottom_left]: left=30.57% = positioned on viewer's LEFT */}
        <div className="absolute flex inset-[33.44%_56.93%_38.44%_30.57%] items-center justify-center">
          <div
            ref={leftEyeRef}
            className="flex-none flex items-center justify-center relative"
            style={{
              height: '45px',
              width: '20px',
              transformOrigin: 'center center',
            }}
          >
            <svg
              ref={leftEyeSvgRef}
              width="100%"
              height="100%"
              viewBox="0 0 20 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              <path
                ref={leftEyePathRef}
                d={getEyeShape('IDLE', 'left')}
                fill="#052333"
              />
            </svg>
          </div>
        </div>

        {/* Right eye (VIEWER's right) - Always SVG, morphed by animation controller */}
        {/* inset-[top_right_bottom_left]: left=56.29% = positioned on viewer's RIGHT */}
        <div className="absolute flex inset-[33.44%_31.21%_38.44%_56.29%] items-center justify-center">
          <div
            ref={rightEyeRef}
            className="flex-none flex items-center justify-center relative"
            style={{
              height: '45px',
              width: '20px',
              transformOrigin: 'center center',
            }}
          >
            <svg
              ref={rightEyeSvgRef}
              width="100%"
              height="100%"
              viewBox="0 0 20 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              <path
                ref={rightEyePathRef}
                d={getEyeShape('IDLE', 'right')}
                fill="#052333"
              />
            </svg>
          </div>
        </div>

        {/* Expression overlay (for future expression changes) */}
        {/* <AntyExpressionLayer expression={currentExpression} size={size} /> */}

        {/* Debug overlays for character body and eyes */}
        {debugMode && (
          <>
            {/* Character body debug box */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                border: '3px solid lime',
                zIndex: 9999,
              }}
            />

            {/* Left eye center tracker - Yellow plus */}
            {!isOff && (
              <>
                {/* Horizontal line */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: 'calc(33.41% + 13.915% - 1px)',
                    left: 'calc(31.63% + 5.825% - 7px)',
                    width: '12px',
                    height: '2px',
                    backgroundColor: 'yellow',
                    zIndex: 9999,
                  }}
                />
                {/* Vertical line */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: 'calc(33.41% + 13.915% - 6px)',
                    left: 'calc(31.63% + 5.825% - 2px)',
                    width: '2px',
                    height: '12px',
                    backgroundColor: 'yellow',
                    zIndex: 9999,
                  }}
                />
              </>
            )}

            {/* Right eye center tracker - Orange plus */}
            {!isOff && (
              <>
                {/* Horizontal line */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: 'calc(33.41% + 13.915% - 1px)',
                    left: 'calc(57.36% + 5.82% - 7px)',
                    width: '12px',
                    height: '2px',
                    backgroundColor: 'orange',
                    zIndex: 9999,
                  }}
                />
                {/* Vertical line */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: 'calc(33.41% + 13.915% - 6px)',
                    left: 'calc(57.36% + 5.82% - 2px)',
                    width: '2px',
                    height: '12px',
                    backgroundColor: 'orange',
                    zIndex: 9999,
                  }}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
});

AntyCharacterV3.displayName = 'AntyCharacterV3';

// Export type for button click handler
export type { ButtonName };
