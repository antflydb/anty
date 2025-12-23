'use client';

import { useEffect, useState } from 'react';

interface AnimationDebugData {
  rotation: number;
  width: number;
  height: number;
  shadowWidth: number;
  currentSequence: string;
  timestamp: number;
}

interface AnimationDebugOverlayProps {
  characterRef: React.RefObject<HTMLDivElement>;
  shadowRef: React.RefObject<HTMLDivElement>;
  currentSequence?: string;
}

export function AnimationDebugOverlay({
  characterRef,
  shadowRef,
  currentSequence = 'IDLE',
}: AnimationDebugOverlayProps) {
  const [debugData, setDebugData] = useState<AnimationDebugData>({
    rotation: 0,
    width: 0,
    height: 0,
    shadowWidth: 0,
    currentSequence: 'IDLE',
    timestamp: Date.now(),
  });

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    let animationFrameId: number;

    const updateDebugData = () => {
      if (!characterRef.current || !shadowRef.current) {
        animationFrameId = requestAnimationFrame(updateDebugData);
        return;
      }

      const characterStyle = window.getComputedStyle(characterRef.current);
      const shadowStyle = window.getComputedStyle(shadowRef.current);

      // Parse transform matrix to get rotation
      const transform = characterStyle.transform;
      let rotation = 0;

      if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
          const values = matrix[1].split(', ');
          const a = parseFloat(values[0]);
          const b = parseFloat(values[1]);
          rotation = Math.atan2(b, a) * (180 / Math.PI);
        }
      }

      // Get dimensions
      const charRect = characterRef.current.getBoundingClientRect();
      const shadowRect = shadowRef.current.getBoundingClientRect();

      setDebugData({
        rotation: rotation,
        width: charRect.width,
        height: charRect.height,
        shadowWidth: shadowRect.width,
        currentSequence: currentSequence,
        timestamp: Date.now(),
      });

      // Blink the live indicator
      setIsLive(prev => !prev);

      animationFrameId = requestAnimationFrame(updateDebugData);
    };

    updateDebugData();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [characterRef, shadowRef, currentSequence]);

  return (
    <div className="fixed left-4 top-20 bg-black/90 text-white p-4 rounded-lg font-mono text-xs z-50 min-w-[280px] border-2 border-green-500/50">
      <div className="flex items-center justify-between mb-3 border-b border-green-400/30 pb-2">
        <span className="text-green-400 font-bold">ANIMATION DEBUG</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-green-600'}`}
            style={{ transition: 'background-color 0.05s' }}
          />
          <span className="text-green-400 text-[10px]">LIVE</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Anty Rotation:</span>
          <span className="text-yellow-300 font-bold tabular-nums">
            {debugData.rotation.toFixed(2)}°
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Anty Width:</span>
          <span className="text-yellow-300 font-bold tabular-nums">
            {debugData.width.toFixed(1)}px
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Anty Height:</span>
          <span className="text-yellow-300 font-bold tabular-nums">
            {debugData.height.toFixed(1)}px
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Shadow Width:</span>
          <span className="text-yellow-300 font-bold tabular-nums">
            {debugData.shadowWidth.toFixed(1)}px
          </span>
        </div>

        <div className="mt-3 pt-2 border-t border-green-400/30">
          <div className="text-gray-400 text-[10px] mb-1">Current Sequence:</div>
          <div className="text-green-400 font-bold text-sm break-words">
            {debugData.currentSequence}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-green-400/30">
          <div className="text-gray-500 text-[9px] tabular-nums">
            Updates: {(Date.now() - debugData.timestamp) < 100 ? '60fps' : 'active'}
          </div>
        </div>
      </div>
    </div>
  );
}
