'use client';

/**
 * Anty Character - EXACT Figma Implementation
 * Using Figma's exact positioning and SVG assets
 */

import type { ExpressionName } from '@/lib/anty/expressions-figma';

export interface AntyCharacterExactProps {
  expression: ExpressionName;
  size?: number;
  className?: string;
}

// SVG assets from Figma (hosted on MCP server)
const ASSETS = {
  brackets: {
    left: 'http://localhost:3845/assets/fe3a5205fb62a8e9161b270f5537b3bdf5057dec.svg',
    right: 'http://localhost:3845/assets/22f98de0a1415056141fcc08b0859ed4ff8a8c77.svg',
  },
  eyes: {
    idle: {
      left: 'http://localhost:3845/assets/dd85446ddbd9b57f96e02f1b4ef69d5a33f81f67.svg',
      right: 'http://localhost:3845/assets/dd85446ddbd9b57f96e02f1b4ef69d5a33f81f67.svg',
    },
    happy: {
      left: 'http://localhost:3845/assets/9a21e369d9b2e222ad4520d1d8eeb7fedced2d53.svg',
      right: 'http://localhost:3845/assets/926605a1ac82ddab1592f4a8e9aebd84f14d974c.svg',
    },
    wink: {
      left: 'http://localhost:3845/assets/e4fb28c484c7e6676621eb48c0b6189a3d84f2e3.svg',
      right: 'http://localhost:3845/assets/5bfe8dfcf49aa1a7e408f8c7631a84eb1228754b.svg',
    },
    sad: {
      left: 'http://localhost:3845/assets/a28573d5f02872be058be5a141c08c57c67b0bb2.svg',
      right: 'http://localhost:3845/assets/e9a9bb3c4c96b0c2d755a80c7e8320f61b1c6c7c.svg',
    },
    blink: {
      left: 'http://localhost:3845/assets/cc8990bcf95ca6510ad8c8359f6fb5ed55a0254c.svg',
      right: 'http://localhost:3845/assets/dca5a5ea39dea838ca529dbd08b68b0ca37897ba.svg',
    },
  },
} as const;

export function AntyCharacterExact({
  expression,
  size = 200,
  className = '',
}: AntyCharacterExactProps) {
  const eyes = ASSETS.eyes[expression];

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Right bracket - EXACT Figma positioning */}
      <div className="absolute inset-[13.46%_0_0_13.46%]">
        <img alt="" className="block max-w-none size-full" src={ASSETS.brackets.right} />
      </div>

      {/* Left bracket - EXACT Figma positioning */}
      <div className="absolute inset-[0_13.15%_13.15%_0]">
        <img alt="" className="block max-w-none size-full" src={ASSETS.brackets.left} />
      </div>

      {/* Left eye (EYE1) - EXACT Figma positioning */}
      <div className="absolute flex inset-[33.41%_57.36%_38.76%_31%] items-center justify-center">
        <div className="flex-none scale-y-[-100%]" style={{ height: '55.653px', width: '23.287px' }}>
          <div className="relative size-full">
            <img alt="" className="block max-w-none size-full" src={eyes.left} />
          </div>
        </div>
      </div>

      {/* Right eye (EYE2) - EXACT Figma positioning */}
      <div className="absolute flex inset-[33.41%_31.63%_38.76%_56.72%] items-center justify-center">
        <div className="flex-none scale-y-[-100%]" style={{ height: '55.653px', width: '23.287px' }}>
          <div className="relative size-full">
            <img alt="" className="block max-w-none size-full" src={eyes.right} />
          </div>
        </div>
      </div>
    </div>
  );
}
