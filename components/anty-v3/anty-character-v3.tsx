'use client';

import { useRef, useState, useEffect } from 'react';
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

/**
 * Main Anty Character V3 component with GSAP animations
 * Features:
 * - Continuous idle animations (floating, rotation, breathing)
 * - Expression changes with crossfades
 * - Interactive button responses
 * - Canvas-based particle system
 */
export function AntyCharacterV3({
  expression = 'idle',
  className = '',
  size = 160,
}: AntyCharacterV3Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<ParticleCanvasHandle>(null);

  const [currentExpression, setCurrentExpression] = useState<ExpressionName>(expression);
  const [particles] = useState<Particle[]>([]);

  // Update expression when prop changes
  useEffect(() => {
    setCurrentExpression(expression);
  }, [expression]);

  // Setup idle animations using GSAP
  useGSAP(
    () => {
      const character = characterRef.current;
      if (!character) return;

      const config = DEFAULT_IDLE_CONFIG;

      // Create timeline for idle animations
      const tl = gsap.timeline({ repeat: -1 });

      // Floating animation (Y-axis)
      tl.to(
        character,
        {
          y: -config.floating.amplitude,
          duration: config.floating.duration / 2,
          ease: config.floating.ease,
        },
        0
      );
      tl.to(
        character,
        {
          y: 0,
          duration: config.floating.duration / 2,
          ease: config.floating.ease,
        },
        config.floating.duration / 2
      );

      // Synchronized rotation
      if (config.rotation.synchronized) {
        tl.to(
          character,
          {
            rotation: config.rotation.angle,
            duration: config.floating.duration / 2,
            ease: config.floating.ease,
          },
          0
        );
        tl.to(
          character,
          {
            rotation: -config.rotation.angle,
            duration: config.floating.duration / 2,
            ease: config.floating.ease,
          },
          config.floating.duration / 2
        );
      }

      // Breathing animation (scale)
      const breathingTl = gsap.timeline({ repeat: -1 });
      breathingTl.to(character, {
        scale: config.breathing.scaleMax,
        duration: config.breathing.duration / 2,
        ease: config.breathing.ease,
      });
      breathingTl.to(character, {
        scale: config.breathing.scaleMin,
        duration: config.breathing.duration / 2,
        ease: config.breathing.ease,
      });

      return () => {
        tl.kill();
        breathingTl.kill();
      };
    },
    { scope: containerRef }
  );

  // Setup spontaneous behaviors (random blinking)
  useGSAP(
    () => {
      const scheduleRandomBlink = () => {
        const delay = gsap.utils.random(3, 8); // Random delay between 3-8 seconds

        gsap.delayedCall(delay, () => {
          // Trigger blink
          performBlink();
          // Schedule next blink
          scheduleRandomBlink();
        });
      };

      scheduleRandomBlink();
    },
    { scope: containerRef }
  );

  // Blink behavior
  const performBlink = () => {
    const previousExpression = currentExpression;
    setCurrentExpression('blink');

    // Return to previous expression after 150ms
    gsap.delayedCall(0.15, () => {
      setCurrentExpression(previousExpression);
    });
  };



  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Character body with animations */}
      <div
        ref={characterRef}
        className="relative w-full h-full"
        style={{
          willChange: 'transform',
        }}
      >
        <AntyExpressionLayer expression={currentExpression} size={size} />
      </div>

      {/* Canvas overlay for particles */}
      <AntyParticleCanvas ref={canvasRef} particles={particles} width={size} height={size} />
    </div>
  );
}

// Export type for button click handler
export type { ButtonName };
