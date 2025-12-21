'use client';

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  type ButtonName,
  type ExpressionName,
  type Particle,
  DEFAULT_IDLE_CONFIG,
} from '@/lib/anty-v3/animation-state';
import { type AntyStats } from '@/lib/anty-v3/stat-system';
import { AntyExpressionLayer } from './anty-expression-layer';
import { AntyParticleCanvas, type ParticleCanvasHandle } from './anty-particle-canvas';
import { useEyeAnimations } from '@/lib/anty-v3/use-eye-animations';

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
  className?: string;
  size?: number;
  isSuperMode?: boolean;
  searchMode?: boolean;
}

export interface AntyCharacterHandle {
  spawnFeedingParticles: () => void;
  spawnSparkle?: (x: number, y: number, color?: string) => void;
  spawnLoveHearts?: () => void;
  spawnConfetti?: (x: number, y: number, count?: number) => void;
  showSearchGlow?: () => void;
  hideSearchGlow?: () => void;
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
  className = '',
  size = 160,
  isSuperMode = false,
  searchMode = false,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const leftEyePathRef = useRef<SVGPathElement>(null);
  const rightEyePathRef = useRef<SVGPathElement>(null);
  const leftBodyRef = useRef<HTMLDivElement>(null);
  const rightBodyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<ParticleCanvasHandle>(null);

  const [currentExpression, setCurrentExpression] = useState<ExpressionName>(expression);
  const [particles] = useState<Particle[]>([]);
  const [isWinking, setIsWinking] = useState(false);

  // Performance fix: Compute expression states instead of storing in state (reduces 5+ re-renders to 1)
  const isHappy = expression === 'happy' || expression === 'excited';
  const isAngry = expression === 'angry';
  const isSad = expression === 'sad';
  const isOff = expression === 'off';

  const superGlowRef = useRef<HTMLDivElement>(null);
  const superGlowTimelineRef = useRef<gsap.core.Timeline | null>(null); // Memory leak fix

  // Use unified eye animation system
  const { performBlink, performDoubleBlink, allowBlinkingRef } = useEyeAnimations({
    leftEyeRef,
    rightEyeRef,
    leftEyePathRef,
    rightEyePathRef,
    expression,
    isOff,
  });

  // Wink behavior - show wink expression with subtle motion and particle burst
  const performWink = useCallback(() => {
    const character = characterRef.current;
    if (!character) return;

    // Set winking state
    setIsWinking(true);

    // Create timeline for wink animation
    const winkTl = gsap.timeline({
      onComplete: () => setIsWinking(false),
    });

    // Subtle tilt and bounce
    winkTl.to(character, {
      rotation: -3,
      y: -5,
      duration: 0.15,
      ease: 'power2.out',
    });

    // Hold the wink
    winkTl.to(character, {
      rotation: -3,
      y: -5,
      duration: 0.4, // Hold for winky amount of time
    });

    // Return to normal
    winkTl.to(character, {
      rotation: 0,
      y: 0,
      duration: 0.2,
      ease: 'power2.out',
    });

    // Spawn sparkle particles from right eye (winking eye)
    // Canvas is 5x character size and centered, so offset positions accordingly
    const canvasOffset = (size * 5) / 2;
    if (canvasRef.current && canvasRef.current.spawnParticle) {
      // Spawn 4 sparkles with slight delays for staggered effect
      // Right eye is at approximately +22px from center horizontally, -20px vertically
      setTimeout(() => canvasRef.current?.spawnParticle('sparkle', canvasOffset + 22, canvasOffset - 20), 0);
      setTimeout(() => canvasRef.current?.spawnParticle('sparkle', canvasOffset + 27, canvasOffset - 15), 50);
      setTimeout(() => canvasRef.current?.spawnParticle('sparkle', canvasOffset + 17, canvasOffset - 18), 100);
      setTimeout(() => canvasRef.current?.spawnParticle('sparkle', canvasOffset + 24, canvasOffset - 22), 150);
    }
  }, [size]);

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
    leftEyeRef,
    rightEyeRef,
    leftEyePathRef,
    rightEyePathRef,
  }), [size]);

  // Update expression when prop changes and trigger state-based animations
  // Note: GSAP-based eye animations (shocked, idea) are now handled in useEyeAnimations hook
  useEffect(() => {
    setCurrentExpression(expression);

    // Trigger wink animation when expression changes to 'wink'
    if (expression === 'wink') {
      performWink();
    }
    // Performance fix: Removed 5 separate setState calls for isHappy, isAngry, isSad, isOff
    // These are now computed values, reducing re-renders from 5+ to 1
  }, [expression, performWink]);

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

  // Setup idle animations using GSAP (disabled when OFF)
  useGSAP(
    () => {
      const character = characterRef.current;
      const shadow = document.getElementById('anty-shadow');
      if (!character || !shadow) return;

      // Don't animate when OFF - kill any existing animations and reset to neutral
      if (isOff) {
        gsap.killTweensOf([character, shadow]);
        gsap.set(character, { y: 0, rotation: 0, scale: 1 });
        gsap.set(shadow, { scaleX: 0, scaleY: 0, opacity: 0 });
        return;
      }

      // Don't animate when in search mode - character is being morphed
      if (searchMode) {
        console.log('[IDLE] Disabling idle animation - search mode active');
        gsap.killTweensOf([character, shadow]);
        return;
      }

      // Smooth continuous floating with rotation and breathing
      // Using a single coordinated timeline for smoothness
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      // Character floats up
      tl.to(character, {
        y: -12, // Float up 12px
        rotation: 2, // Gentle rotation
        scale: 1.02, // Subtle breathing
        duration: 2.5, // Smooth 2.5s up
        ease: 'sine.inOut', // Very smooth sine easing
      }, 0);

      // Shadow scales down and fades when character floats up (inverse relationship)
      // Shadow stays FIXED on ground - only opacity and scale change
      tl.to(shadow, {
        scaleX: 0.7, // Shrink horizontally when character is up
        scaleY: 0.55, // Shrink vertically when character is up
        opacity: 0.2, // Fade out when character is far
        duration: 2.5,
        ease: 'sine.inOut',
      }, 0);

      return () => {
        tl.kill();
      };
    },
    { scope: containerRef, dependencies: [isOff] }
  );

  // Track current expression in a ref to avoid recreating the scheduler
  const currentExpressionRef = useRef(expression);
  useEffect(() => {
    currentExpressionRef.current = expression;
  }, [expression]);

  // Store callbacks in refs to prevent scheduler recreation
  const performBlinkRef = useRef(performBlink);
  const performDoubleBlinkRef = useRef(performDoubleBlink);
  const onSpontaneousExpressionRef = useRef(onSpontaneousExpression);

  useEffect(() => {
    performBlinkRef.current = performBlink;
    performDoubleBlinkRef.current = performDoubleBlink;
    onSpontaneousExpressionRef.current = onSpontaneousExpression;
  }, [performBlink, performDoubleBlink, onSpontaneousExpression]);

  // Setup spontaneous behaviors (random blinking and occasional looking)
  // IMPORTANT: Empty dependencies to ensure only ONE scheduler is ever created
  useGSAP(
    () => {
      let isActive = true;

      const scheduleRandomBehavior = () => {
        if (!isActive) return;

        const delay = gsap.utils.random(5, 12); // Random delay between 5-12 seconds (longer spacing)

        gsap.delayedCall(delay, () => {
          if (!isActive) return;

          // Only trigger behaviors when in idle state (check ref, not prop)
          if (currentExpressionRef.current !== 'idle') {
            // If not idle, wait another full delay period before checking again
            scheduleRandomBehavior();
            return;
          }

          const random = Math.random();

          if (random < 0.2) {
            // 20% chance of double blink
            performDoubleBlinkRef.current();
          } else if (random < 0.9) {
            // 70% chance of single blink
            performBlinkRef.current();
          } else if (random < 0.95) {
            // 5% chance of look left (rare)
            if (onSpontaneousExpressionRef.current) {
              onSpontaneousExpressionRef.current('look-left');
            }
          } else {
            // 5% chance of look right (rare)
            if (onSpontaneousExpressionRef.current) {
              onSpontaneousExpressionRef.current('look-right');
            }
          }

          // Schedule next behavior (minimum 5 seconds from now)
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

  // Local SVG assets - no network requests, instant loading
  const img = "/anty-v3/body-right.svg"; // Right bracket body
  const img1 = "/anty-v3/body-left.svg"; // Left bracket body
  const img2 = "/anty-v3/eye-idle.svg"; // IDLE eyes (vertical pills)
  const eyeLooking = "/eye-looking.svg"; // LOOKING eyes (shorter, wider pills)

  // Wink expression assets
  const winkEye = "/anty-v3/eye-wink-right.svg"; // Wink half-closed right eye
  const blinkLine = "/anty-v3/eye-wink-left.svg"; // Wink closed left eye line

  // Happy expression assets
  const happyEyeLeft = "/anty-v3/eye-happy-left.svg"; // Happy left eye
  const happyEyeRight = "/anty-v3/eye-happy-right.svg"; // Happy right eye

  // Angry expression assets
  const angryEyeLeft = "/anty-v3/eye-angry-left.svg"; // Angry left eye
  const angryEyeRight = "/anty-v3/eye-angry-right.svg"; // Angry right eye

  // Sad expression uses angry eyes flipped with scaleY(-1)

  // OFF state (logo) assets - localized
  const logoEyeLeft = "/anty-v3/eye-logo-left.svg"; // Left triangle eye (EYE2)
  const logoEyeRight = "/anty-v3/eye-logo-right.svg"; // Right triangle eye (EYE1)

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
        {/* Left eye - varies by expression */}
        {isOff ? (
          <div className="absolute inset-[33.28%_30.48%_32.74%_52.47%]">
            <div className="absolute inset-[8.5%_0.09%_8.41%_4.94%]">
              <img alt="" className="block max-w-none size-full" src={logoEyeLeft} />
            </div>
          </div>
        ) : isWinking ? (
          <div className="absolute inset-[36.13%_30.45%_45.8%_55.1%]">
            <img alt="" className="block max-w-none size-full" src={blinkLine} />
          </div>
        ) : isHappy ? (
          <div className="absolute inset-[33.42%_30.45%_48.51%_55.1%]">
            <div className="absolute inset-[0_0_0.09%_0]">
              <img alt="" className="block max-w-none size-full" src={happyEyeLeft} />
            </div>
          </div>
        ) : isAngry ? (
          <div className="absolute inset-[38%_28%_44%_50%]">
            <img alt="" className="block max-w-none size-full" src={angryEyeLeft} />
          </div>
        ) : isSad ? (
          <div className="absolute inset-[39%_30%_45%_51%]" style={{ transform: 'rotate(42deg) scale(0.85)' }}>
            <img alt="" className="block max-w-none size-full" src={angryEyeLeft} />
          </div>
        ) : (
          <div className="absolute flex inset-[33.41%_31.63%_38.76%_56.72%] items-center justify-center">
            <div
              ref={leftEyeRef}
              className="flex-none flex items-center justify-center relative"
              style={{
                height: '44.52px',
                width: '18.63px',
                transformOrigin: 'center center',
              }}
            >
              <svg
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                viewBox="0 0 26 55.6528"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <path
                  ref={leftEyePathRef}
                  d="M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z"
                  fill="#052333"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Right eye - varies by expression */}
        {isOff ? (
          <div className="absolute inset-[33.59%_53.09%_32.99%_30.15%]">
            <div className="absolute inset-[8.55%_5.03%_8.64%_0.09%]">
              <img alt="" className="block max-w-none size-full" src={logoEyeRight} />
            </div>
          </div>
        ) : isWinking ? (
          <div className="absolute inset-[46.07%_53.93%_45.8%_28%]">
            <img alt="" className="block max-w-none size-full" src={winkEye} />
          </div>
        ) : isHappy ? (
          <div className="absolute inset-[33.42%_55.74%_48.51%_29.81%]">
            <div className="absolute inset-[0_0_0.09%_0]">
              <img alt="" className="block max-w-none size-full" src={happyEyeRight} />
            </div>
          </div>
        ) : isAngry ? (
          <div className="absolute inset-[38%_50%_44%_28%]">
            <img alt="" className="block max-w-none size-full" src={angryEyeRight} />
          </div>
        ) : isSad ? (
          <div className="absolute inset-[39%_51%_45%_30%]" style={{ transform: 'rotate(-42deg) scale(0.85)' }}>
            <img alt="" className="block max-w-none size-full" src={angryEyeRight} />
          </div>
        ) : (
          <div className="absolute flex inset-[33.41%_57.36%_38.76%_31%] items-center justify-center">
            <div
              ref={rightEyeRef}
              className="flex-none flex items-center justify-center relative"
              style={{
                height: '44.52px',
                width: '18.63px',
                transformOrigin: 'center center',
              }}
            >
              <svg
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                viewBox="0 0 26 55.6528"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <path
                  ref={rightEyePathRef}
                  d="M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z"
                  fill="#052333"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Expression overlay (for future expression changes) */}
        {/* <AntyExpressionLayer expression={currentExpression} size={size} /> */}
      </div>
    </div>
  );
});

AntyCharacterV3.displayName = 'AntyCharacterV3';

// Export type for button click handler
export type { ButtonName };
