'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { type ExpressionName, EXPRESSION_TRANSITIONS } from '@/lib/anty-v3/animation-state';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

interface AntyExpressionLayerProps {
  expression: ExpressionName;
  size?: number;
}

/**
 * Expression layer component that handles SVG expression rendering with GSAP crossfades
 * For now uses placeholder divs, will be replaced with actual Figma SVGs later
 */
export function AntyExpressionLayer({ expression, size = 160 }: AntyExpressionLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentExpression, setCurrentExpression] = useState<ExpressionName>(expression);
  const [previousExpression, setPreviousExpression] = useState<ExpressionName | null>(null);

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
  expression: ExpressionName;
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
function getTransitionSpeed(from: ExpressionName, to: ExpressionName): string {
  // Instant for blink
  if (to === 'blink' || from === 'blink') return 'instant';

  // Fast for quick expressions
  if (to === 'wink' || from === 'wink') return 'fast';

  // Slow for dramatic changes
  const dramaticPairs = [
    ['happy', 'angry'],
    ['excited', 'sad'],
    ['idle', 'sick'],
  ];

  const isDramatic = dramaticPairs.some(
    ([a, b]) =>
      (from === a && to === b) || (from === b && to === a)
  );

  if (isDramatic) return 'slow';

  // Normal for everything else
  return 'normal';
}

/**
 * Get placeholder colors for expression (temporary)
 * Will be replaced with actual Figma SVG assets
 */
function getExpressionPlaceholderColor(expression: ExpressionName): {
  body: string;
  eye: string;
} {
  const colorMap: Record<ExpressionName, { body: string; eye: string }> = {
    idle: { body: '#e0e0e0', eye: '#333333' },
    happy: { body: '#ffeb3b', eye: '#333333' },
    excited: { body: '#ff9800', eye: '#333333' },
    wink: { body: '#ffc107', eye: '#333333' },
    sad: { body: '#90caf9', eye: '#1976d2' },
    tired: { body: '#b0bec5', eye: '#546e7a' },
    sleepy: { body: '#9fa8da', eye: '#5c6bc0' },
    thinking: { body: '#ce93d8', eye: '#8e24aa' },
    curious: { body: '#80deea', eye: '#00838f' },
    talking: { body: '#a5d6a7', eye: '#388e3c' },
    confused: { body: '#ffcc80', eye: '#e65100' },
    angry: { body: '#ef5350', eye: '#b71c1c' },
    sick: { body: '#aed581', eye: '#558b2f' },
    proud: { body: '#ba68c8', eye: '#6a1b9a' },
    blink: { body: '#e0e0e0', eye: '#333333' },
  };

  return colorMap[expression] || colorMap.idle;
}
