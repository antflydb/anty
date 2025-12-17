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
import { type AntyStats } from '@/lib/anty/stat-system';
import { AntyExpressionLayer } from './anty-expression-layer';
import { AntyParticleCanvas, type ParticleCanvasHandle } from './anty-particle-canvas';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

interface AntyCharacterV3Props {
  stats: AntyStats;
  expression?: ExpressionName;
  onButtonClick?: (button: ButtonName) => void;
  className?: string;
  size?: number;
}

export interface AntyCharacterHandle {
  spawnFeedingParticles: () => void;
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
  className = '',
  size = 160,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<ParticleCanvasHandle>(null);

  const [currentExpression, setCurrentExpression] = useState<ExpressionName>(expression);
  const [particles] = useState<Particle[]>([]);
  const [isWinking, setIsWinking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);

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
    // Canvas is 2x character size and centered, so offset positions accordingly
    const canvasOffset = size / 2;
    if (canvasRef.current && canvasRef.current.spawnParticle) {
      // Spawn 3 sparkles with slight delays for staggered effect
      setTimeout(() => canvasRef.current?.spawnParticle('sparkle', canvasOffset + 110, canvasOffset + 50), 0);
      setTimeout(() => canvasRef.current?.spawnParticle('sparkle', canvasOffset + 115, canvasOffset + 55), 50);
      setTimeout(() => canvasRef.current?.spawnParticle('sparkle', canvasOffset + 105, canvasOffset + 52), 100);
    }
  }, [size]);

  // Expose particle spawning method to parent
  useImperativeHandle(ref, () => ({
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
        particle.style.fontSize = `${gsap.utils.random(20, 40)}px`;
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
  }), [size]);

  // Update expression when prop changes and trigger animations
  useEffect(() => {
    setCurrentExpression(expression);

    // Trigger wink animation when expression changes to 'wink'
    if (expression === 'wink') {
      performWink();
    }

    // Set happy eyes when expression changes to 'happy'
    if (expression === 'happy') {
      setIsHappy(true);
    } else {
      setIsHappy(false);
    }
  }, [expression, performWink]);

  // Setup idle animations using GSAP
  useGSAP(
    () => {
      const character = characterRef.current;
      const shadow = document.getElementById('anty-shadow');
      if (!character || !shadow) return;

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
    { scope: containerRef }
  );

  // Setup spontaneous behaviors (random blinking only)
  useGSAP(
    () => {
      const scheduleRandomBehavior = () => {
        const delay = gsap.utils.random(3, 10); // Random delay between 3-10 seconds

        gsap.delayedCall(delay, () => {
          const random = Math.random();

          if (random < 0.25) {
            // 25% chance of double blink
            performDoubleBlink();
          } else {
            // 75% chance of single blink
            performBlink();
          }

          // Schedule next behavior
          scheduleRandomBehavior();
        });
      };

      scheduleRandomBehavior();
    },
    { scope: containerRef }
  );

  // Blink behavior - animate eyes collapsing vertically
  const performBlink = () => {
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!leftEye || !rightEye) return;

    // Create timeline for blink animation
    const blinkTl = gsap.timeline();

    // Close eyes (collapse to horizontal line)
    blinkTl.to([leftEye, rightEye], {
      scaleY: 0.05, // Almost flat horizontal line
      duration: 0.1, // 100ms to close
      ease: 'power2.in',
    });

    // Open eyes (expand back to normal)
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1, // Back to normal
      duration: 0.15, // 150ms to open
      ease: 'power2.out',
    });
  };

  // Double blink behavior - two quick blinks in succession
  const performDoubleBlink = () => {
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!leftEye || !rightEye) return;

    // Create timeline for double blink
    const blinkTl = gsap.timeline();

    // First blink
    blinkTl.to([leftEye, rightEye], {
      scaleY: 0.05,
      duration: 0.08, // Slightly faster
      ease: 'power2.in',
    });
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1,
      duration: 0.12,
      ease: 'power2.out',
    });

    // Short pause between blinks
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1,
      duration: 0.1, // 100ms pause
    });

    // Second blink
    blinkTl.to([leftEye, rightEye], {
      scaleY: 0.05,
      duration: 0.08,
      ease: 'power2.in',
    });
    blinkTl.to([leftEye, rightEye], {
      scaleY: 1,
      duration: 0.12,
      ease: 'power2.out',
    });
  };

  // Figma asset URLs from localhost MCP server
  const img = "http://localhost:3845/assets/f61f5eee0a4c503b51eb2c596b246821745b99a8.svg";
  const img1 = "http://localhost:3845/assets/a14b6cd517de309621701f782bdf6c81889c4a43.svg";
  const img2 = "http://localhost:3845/assets/36dc1ef172b0d1bbf9cfbd7e399e8dbb0da0b3b4.svg";

  // Wink expression assets
  const winkEye = "http://localhost:3845/assets/e4fb28c484c7e6676621eb48c0b6189a3d84f2e3.svg"; // Half-closed eye
  const blinkLine = "http://localhost:3845/assets/5bfe8dfcf49aa1a7e408f8c7631a84eb1228754b.svg"; // Closed eye line

  // Happy expression assets
  const happyEyeLeft = "http://localhost:3845/assets/926605a1ac82ddab1592f4a8e9aebd84f14d974c.svg"; // Happy left eye
  const happyEyeRight = "http://localhost:3845/assets/9a21e369d9b2e222ad4520d1d8eeb7fedced2d53.svg"; // Happy right eye

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: size, height: size, overflow: 'visible' }}
    >
      {/* Canvas overlay for particles - positioned to extend beyond character */}
      <AntyParticleCanvas ref={canvasRef} particles={particles} width={size * 2} height={size * 2} />

      {/* Character body with animations */}
      <div
        ref={characterRef}
        className="relative w-full h-full"
        style={{
          willChange: 'transform',
          overflow: 'visible',
        }}
      >
        {/* Anty body layers from Figma */}
        <div className="absolute inset-[13.46%_0_0_13.46%]">
          <img alt="" className="block max-w-none size-full" src={img} />
        </div>
        <div className="absolute inset-[0_13.15%_13.15%_0]">
          <img alt="" className="block max-w-none size-full" src={img1} />
        </div>
        {/* Left eye - varies by expression */}
        {isWinking ? (
          <div className="absolute inset-[36.13%_30.45%_45.8%_55.1%]">
            <img alt="" className="block max-w-none size-full" src={blinkLine} />
          </div>
        ) : isHappy ? (
          <div className="absolute inset-[33.42%_30.45%_48.51%_55.1%]">
            <div className="absolute inset-[0_0_0.09%_0]">
              <img alt="" className="block max-w-none size-full" src={happyEyeLeft} />
            </div>
          </div>
        ) : (
          <div className="absolute flex inset-[33.41%_31.63%_38.76%_56.72%] items-center justify-center">
            <div
              ref={leftEyeRef}
              className="flex-none scale-y-[-100%]"
              style={{ height: '44.52px', width: '18.63px', transformOrigin: 'center center' }}
            >
              <div className="relative size-full">
                <img alt="" className="block max-w-none size-full" src={img2} />
              </div>
            </div>
          </div>
        )}

        {/* Right eye - varies by expression */}
        {isWinking ? (
          <div className="absolute inset-[46.07%_53.93%_45.8%_28%]">
            <img alt="" className="block max-w-none size-full" src={winkEye} />
          </div>
        ) : isHappy ? (
          <div className="absolute inset-[33.42%_55.74%_48.51%_29.81%]">
            <div className="absolute inset-[0_0_0.09%_0]">
              <img alt="" className="block max-w-none size-full" src={happyEyeRight} />
            </div>
          </div>
        ) : (
          <div className="absolute flex inset-[33.41%_57.36%_38.76%_31%] items-center justify-center">
            <div
              ref={rightEyeRef}
              className="flex-none scale-y-[-100%]"
              style={{ height: '44.52px', width: '18.63px', transformOrigin: 'center center' }}
            >
              <div className="relative size-full">
                <img alt="" className="block max-w-none size-full" src={img2} />
              </div>
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
