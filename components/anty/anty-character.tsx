'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  floatingAnimation,
  ghostlyRotation,
  eyeMorphTransition,
  performanceConfig,
  hoverMicroMovement,
} from '@/lib/anty/animation-configs';
import {
  expressions,
  staticBrackets,
  type Expression
} from '@/lib/anty/expressions';

export interface AntyCharacterProps {
  /** Current emotional expression */
  expression: Expression;
  /** Size of the character in pixels (default: 200) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to enable blink animation override */
  isBlinking?: boolean;
  /** Callback when hover state changes */
  onHoverChange?: (isHovered: boolean) => void;
}

/**
 * AntyCharacter - Animated character component with 4 composable animation layers
 *
 * Animation Layers:
 * 1. Ghostly floating (Y-axis + rotation, continuous)
 * 2. Eye morphing (SVG path transitions)
 * 3. Random blink overlay (controlled by parent via isBlinking prop)
 * 4. Hover micro-movements (optional interactive layer)
 *
 * Performance optimized with GPU acceleration and will-change hints
 */
export function AntyCharacter({
  expression,
  size = 200,
  className = '',
  isBlinking = false,
  onHoverChange,
}: AntyCharacterProps) {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  // Layer 1: Ghostly floating animation - runs continuously
  useEffect(() => {
    controls.start({
      y: [0, -floatingAnimation.amplitude, 0],
      rotate: [-ghostlyRotation.angle, ghostlyRotation.angle, -ghostlyRotation.angle],
      transition: {
        ...floatingAnimation.transition,
        repeat: Infinity,
        repeatType: 'loop',
      },
    });
  }, [controls]);

  // Layer 4: Hover micro-movements
  const handleHoverStart = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  // Determine which expression to show (blink overrides current expression)
  const currentExpression = isBlinking ? 'blink' : expression;
  const expressionData = expressions[currentExpression];

  // Calculate viewBox and stroke width based on size
  // Using actual af-logo.svg dimensions (39.28 x 39.28)
  const viewBoxSize = 40;
  const strokeWidth = Math.max(1, size / 150);

  return (
    <motion.div
      animate={controls}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={{
        width: size,
        height: size,
        willChange: performanceConfig.willChange,
      }}
      className={className}
    >
      <motion.svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          overflow: 'visible',
        }}
        // Layer 4: Hover scale and position adjustment
        animate={{
          scale: isHovered ? hoverMicroMovement.scale : 1,
          y: isHovered ? hoverMicroMovement.yOffset : 0,
        }}
        transition={hoverMicroMovement.transition}
      >
        {/* Left bracket - static decoration from af-logo.svg */}
        <path
          d={staticBrackets.leftBracket}
          fill="currentColor"
        />

        {/* Right bracket - static decoration from af-logo.svg */}
        <path
          d={staticBrackets.rightBracket}
          fill="currentColor"
        />

        {/* Left eye - Layer 2: Morphing animation */}
        <motion.path
          d={expressionData.leftEye}
          fill="currentColor"
          // Smooth morphing transition between eye states
          animate={{ d: expressionData.leftEye }}
          transition={eyeMorphTransition}
          // Performance optimization
          style={{
            vectorEffect: 'non-scaling-stroke',
          }}
        />

        {/* Right eye - Layer 2: Morphing animation */}
        <motion.path
          d={expressionData.rightEye}
          fill="currentColor"
          // Smooth morphing transition between eye states
          animate={{ d: expressionData.rightEye }}
          transition={eyeMorphTransition}
          // Performance optimization
          style={{
            vectorEffect: 'non-scaling-stroke',
          }}
        />
      </motion.svg>
    </motion.div>
  );
}
