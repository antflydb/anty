'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { EXPRESSION_TRANSITIONS } from '@/lib/anty-v3/animation/constants';
import type { EmotionType } from '@/lib/anty-v3/animation/types';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

interface AntyExpressionLayerProps {
  expression: EmotionType | 'idle' | 'off';
  size?: number;
}

/**
 * Expression layer component that handles SVG expression rendering with GSAP crossfades
 * For now uses placeholder divs, will be replaced with actual Figma SVGs later
 */
export function AntyExpressionLayer({ expression, size = 160 }: AntyExpressionLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentExpression, setCurrentExpression] = useState<EmotionType | 'idle' | 'off'>(expression);
  const [previousExpression, setPreviousExpression] = useState<EmotionType | 'idle' | 'off' | null>(null);

  // Handle expression changes with GSAP crossfade
  useGSAP(() => {
    if (expression === currentExpression) return;

    const container = containerRef.current;
    if (!container) return;

    // Determine transition speed
    const transitionKey = getTransitionSpeed(currentExpression, expression);
    const transition = EXPRESSION_TRANSITIONS[transitionKey];

    // Store previous expression for crossfade
    setPreviousExpression(currentExpression);

    // Crossfade animation
    const tl = gsap.timeline({
      onComplete: () => {
        setPreviousExpression(null);
        setCurrentExpression(expression);
      },
    });

    // Find old and new expression elements
    const oldElement = container.querySelector(`[data-expression="${currentExpression}"]`);
    const newElement = container.querySelector(`[data-expression="${expression}"]`);

    if (oldElement && newElement) {
      // Instant transition for blink
      if (transition.duration === 0) {
        gsap.set(oldElement, { opacity: 0 });
        gsap.set(newElement, { opacity: 1 });
        setCurrentExpression(expression);
        setPreviousExpression(null);
      } else {
        // Crossfade
        tl.to(oldElement, {
          opacity: 0,
          duration: transition.duration,
          ease: transition.ease,
        }, 0);
        tl.fromTo(
          newElement,
          { opacity: 0 },
          {
            opacity: 1,
            duration: transition.duration,
            ease: transition.ease,
          },
          0
        );
      }
    }

    return () => {
      tl.kill();
    };
  }, { dependencies: [expression], scope: containerRef });

  // Get expressions to render (current + previous during crossfade)
  const expressionsToRender = previousExpression
    ? [currentExpression, expression]
    : [currentExpression];

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {expressionsToRender.map((expr) => (
        <ExpressionAsset
          key={expr}
          expression={expr}
          size={size}
          isVisible={expr === expression}
        />
      ))}
    </div>
  );
}

/**
 * Individual expression asset renderer
 * Placeholder div with colored background for now
 * Will be replaced with actual SVG rendering
 */
function ExpressionAsset({
  expression,
  size,
  isVisible,
}: {
  expression: EmotionType | 'idle' | 'off';
  size: number;
  isVisible: boolean;
}) {
  const colors = getExpressionPlaceholderColor(expression);

  return (
    <div
      data-expression={expression}
      className="absolute inset-0 flex items-center justify-center"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Placeholder for body */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          backgroundColor: colors.body,
        }}
      />

      {/* Placeholder for left eye */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          backgroundColor: colors.eye,
          left: size * 0.3,
          top: size * 0.35,
        }}
      />

      {/* Placeholder for right eye */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          backgroundColor: colors.eye,
          right: size * 0.3,
          top: size * 0.35,
        }}
      />

      {/* Expression label for debugging */}
      <div
        className="absolute bottom-0 text-xs font-mono opacity-50"
        style={{ fontSize: size * 0.08 }}
      >
        {expression}
      </div>
    </div>
  );
}

/**
 * Determine transition speed based on expression change
 */
function getTransitionSpeed(from: EmotionType | 'idle' | 'off', to: EmotionType | 'idle' | 'off'): string {
  // Fast for quick expressions
  if (to === 'wink' || from === 'wink') return 'fast';

  // Normal for everything else
  return 'normal';
}

/**
 * Get placeholder colors for expression (temporary)
 * Will be replaced with actual Figma SVG assets
 */
function getExpressionPlaceholderColor(expression: EmotionType | 'idle' | 'off'): {
  body: string;
  eye: string;
} {
  const colorMap: Partial<Record<EmotionType | 'idle' | 'off', { body: string; eye: string }>> = {
    idle: { body: '#e0e0e0', eye: '#333333' },
    happy: { body: '#ffeb3b', eye: '#333333' },
    wink: { body: '#ffc107', eye: '#333333' },
  };

  return colorMap[expression] || colorMap.idle || { body: '#e0e0e0', eye: '#333333' };
}
