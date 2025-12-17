'use client';

/**
 * Anty Character V2 - Correct Eye Rendering
 *
 * This component renders the Anty character with the CORRECT eye shapes
 * from Figma (rounded pills/ovals, NOT triangles).
 */

import { motion } from 'framer-motion';
import { staticBrackets, expressions } from '@/lib/anty/expressions-v2';
import type { ExpressionName, EyeShape } from '@/lib/anty/types-v2';

export interface AntyCharacterV2Props {
  /** Current expression */
  expression: ExpressionName;
  /** Size in pixels (default: 300) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Render an eye shape as SVG element
 */
function renderEye(eye: EyeShape, color: string = 'currentColor'): React.ReactElement {
  switch (eye.type) {
    case 'pill':
      // Rounded pill (ellipse)
      return (
        <ellipse
          cx={eye.x}
          cy={eye.y}
          rx={eye.width}
          ry={eye.height}
          fill={color}
        />
      );

    case 'line':
      // Horizontal line (for blink/wink)
      return (
        <rect
          x={eye.x! - eye.width! / 2}
          y={eye.y!}
          width={eye.width}
          height={eye.height}
          rx={1}
          fill={color}
        />
      );

    case 'curve-up':
    case 'curve-down':
      // Curved eye (happy/sad)
      return (
        <path
          d={eye.path}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      );

    default:
      return <></>;
  }
}

export function AntyCharacterV2({
  expression,
  size = 300,
  className = '',
}: AntyCharacterV2Props) {
  const expressionData = expressions[expression];
  const viewBoxSize = 40;

  return (
    <motion.div
      style={{
        width: size,
        height: size,
      }}
      className={className}
      // Subtle floating animation
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#1a3a52]"
      >
        {/* Left bracket - static */}
        <path d={staticBrackets.leftBracket} fill="currentColor" />

        {/* Right bracket - static */}
        <path d={staticBrackets.rightBracket} fill="currentColor" />

        {/* Left eye - morphing */}
        <motion.g
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {renderEye(expressionData.leftEye)}
        </motion.g>

        {/* Right eye - morphing */}
        <motion.g
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {renderEye(expressionData.rightEye)}
        </motion.g>
      </svg>
    </motion.div>
  );
}
