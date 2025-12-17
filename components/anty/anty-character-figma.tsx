'use client';

/**
 * Anty Character - Using REAL Figma Paths
 * Eyes stay in FIXED positions and morph between expressions
 */

import { motion } from 'framer-motion';
import { staticBrackets, expressions } from '@/lib/anty/expressions-figma';
import type { ExpressionName } from '@/lib/anty/expressions-figma';

export interface AntyCharacterFigmaProps {
  expression: ExpressionName;
  size?: number;
  className?: string;
}

/**
 * Fixed eye positions - NEVER change regardless of expression
 * Eyes morph in place rather than moving around
 */
const LEFT_EYE_POS = { x: 12, y: 17 };
const RIGHT_EYE_POS = { x: 24, y: 17 };

/**
 * Render an eye with morphing animation
 */
function Eye({
  position,
  path,
  expression
}: {
  position: { x: number; y: number };
  path: string;
  expression: ExpressionName;
}) {
  // Determine viewBox and scale based on expression type
  // These come from the original Figma SVG viewBoxes
  const viewBoxData = {
    idle: { viewBox: '0 0 24 56', scale: 0.18 },
    happy: { viewBox: '0 0 29 37', scale: 0.22 },
    wink: { viewBox: '0 0 37 17', scale: 0.22 }, // This varies by eye
    sad: { viewBox: '0 0 39 22', scale: 0.2 },
    blink: { viewBox: '0 0 24 9', scale: 0.3 },
  };

  const config = viewBoxData[expression === 'wink' ? 'wink' : expression];

  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <svg
        viewBox={config.viewBox}
        width={config.scale * 40}
        height={config.scale * 40}
        overflow="visible"
        x={-config.scale * 20}
        y={-config.scale * 20}
      >
        <motion.path
          d={path}
          fill="currentColor"
          initial={false}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut'
          }}
        />
      </svg>
    </g>
  );
}

export function AntyCharacterFigma({
  expression,
  size = 300,
  className = '',
}: AntyCharacterFigmaProps) {
  const expressionData = expressions[expression];

  return (
    <div
      style={{ width: size, height: size }}
      className={className}
    >
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#1a3a52]"
      >
        {/* Left bracket - static */}
        <path
          d={staticBrackets.leftBracket}
          fill="currentColor"
        />

        {/* Right bracket - static */}
        <path
          d={staticBrackets.rightBracket}
          fill="currentColor"
        />

        {/* Left eye - morphs in place */}
        <Eye
          position={LEFT_EYE_POS}
          path={expressionData.leftEye}
          expression={expression}
        />

        {/* Right eye - morphs in place */}
        <Eye
          position={RIGHT_EYE_POS}
          path={expressionData.rightEye}
          expression={expression}
        />
      </svg>
    </div>
  );
}
