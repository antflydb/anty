'use client';

import { useEffect, useState } from 'react';

interface AnimationDebugData {
  rotation: number;
  scale: number;
  width: number;
  height: number;
  shadowWidth: number;
  x: number;
  y: number;
  currentSequence: string;
  timestamp: number;
}

interface AnimationDebugOverlayProps {
  characterRef: React.RefObject<HTMLDivElement>;
  shadowRef: React.RefObject<HTMLDivElement>;
  currentSequence?: string;
  randomAction?: string;
}

export function AnimationDebugOverlay({
  characterRef,
  shadowRef,
  currentSequence = 'IDLE',
  randomAction = '',
}: AnimationDebugOverlayProps) {
  const [debugData, setDebugData] = useState<AnimationDebugData>({
    rotation: 0,
    scale: 1,
    width: 0,
    height: 0,
    shadowWidth: 0,
    x: 0,
    y: 0,
    currentSequence: 'IDLE',
    timestamp: Date.now(),
  });

  const [isLive, setIsLive] = useState(true);

  // Track min/max values
  const [minMax, setMinMax] = useState({
    rotationMin: Infinity,
    rotationMax: -Infinity,
    scaleMin: Infinity,
    scaleMax: -Infinity,
    widthMin: Infinity,
    widthMax: -Infinity,
    heightMin: Infinity,
    heightMax: -Infinity,
    shadowWidthMin: Infinity,
    shadowWidthMax: -Infinity,
    xMin: Infinity,
    xMax: -Infinity,
    yMin: Infinity,
    yMax: -Infinity,
  });

  // Logging state - persisted in localStorage
  const [isLogging, setIsLogging] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('anty-debug-logging') === 'true';
  });

  const [previousSequence, setPreviousSequence] = useState(currentSequence);

  // Log transition to localStorage
  const logTransition = (from: string, to: string, minMaxData: typeof minMax) => {
    if (!isLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      from,
      to,
      minMax: {
        rotation: `${minMaxData.rotationMin.toFixed(3)}° to ${minMaxData.rotationMax.toFixed(3)}°`,
        scale: `${minMaxData.scaleMin.toFixed(4)} to ${minMaxData.scaleMax.toFixed(4)}`,
        width: `${minMaxData.widthMin.toFixed(1)}px to ${minMaxData.widthMax.toFixed(1)}px`,
        height: `${minMaxData.heightMin.toFixed(1)}px to ${minMaxData.heightMax.toFixed(1)}px`,
        shadow: `${minMaxData.shadowWidthMin.toFixed(1)}px to ${minMaxData.shadowWidthMax.toFixed(1)}px`,
      }
    };

    const existingLogs = localStorage.getItem('anty-animation-log');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(logEntry);
    localStorage.setItem('anty-animation-log', JSON.stringify(logs));
  };

  // Reset min/max values
  const resetMinMax = () => {
    setMinMax({
      rotationMin: Infinity,
      rotationMax: -Infinity,
      scaleMin: Infinity,
      scaleMax: -Infinity,
      widthMin: Infinity,
      widthMax: -Infinity,
      heightMin: Infinity,
      heightMax: -Infinity,
      shadowWidthMin: Infinity,
      shadowWidthMax: -Infinity,
      xMin: Infinity,
      xMax: -Infinity,
      yMin: Infinity,
      yMax: -Infinity,
    });
  };

  // Detect sequence changes and log transition
  useEffect(() => {
    if (currentSequence !== previousSequence) {
      // Log the transition with min/max from previous sequence
      logTransition(previousSequence, currentSequence, minMax);

      // Reset min/max for new sequence
      resetMinMax();

      setPreviousSequence(currentSequence);
    }
  }, [currentSequence, previousSequence, minMax, isLogging]);

  // Toggle logging and persist
  const toggleLogging = () => {
    const newState = !isLogging;
    setIsLogging(newState);
    localStorage.setItem('anty-debug-logging', String(newState));

    if (newState) {
      // Clear previous logs when starting new session
      localStorage.setItem('anty-animation-log', JSON.stringify([]));
    }
  };

  // Download log file
  const downloadLog = () => {
    const logs = localStorage.getItem('anty-animation-log');
    if (!logs) return;

    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anty-animation-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let animationFrameId: number;

    const updateDebugData = () => {
      if (!characterRef.current || !shadowRef.current) {
        animationFrameId = requestAnimationFrame(updateDebugData);
        return;
      }

      // Find the actual character element that gets animated (has class "relative w-full h-full")
      const actualCharacter = characterRef.current.querySelector('.relative.w-full.h-full') as HTMLElement;
      if (!actualCharacter) {
        animationFrameId = requestAnimationFrame(updateDebugData);
        return;
      }

      const characterStyle = window.getComputedStyle(actualCharacter);
      const shadowStyle = window.getComputedStyle(shadowRef.current);

      // Parse transform matrix to get rotation
      const transform = characterStyle.transform;
      let rotation = 0;
      let scale = 1;

      if (transform && transform !== 'none') {
        const match = transform.match(/matrix\(([^)]+)\)/);
        if (match) {
          const parts = match[1].split(', ');
          const a = parseFloat(parts[0]);
          const b = parseFloat(parts[1]);
          const c = parseFloat(parts[2]);
          const d = parseFloat(parts[3]);

          // Calculate rotation from matrix
          rotation = Math.atan2(b, a) * (180 / Math.PI);

          // Calculate scale from matrix
          scale = Math.sqrt(a * a + b * b);
        }
      }

      // Get dimensions
      const charRect = actualCharacter.getBoundingClientRect();
      const shadowRect = shadowRef.current.getBoundingClientRect();

      // Calculate center point
      const centerX = charRect.left + charRect.width / 2;
      const centerY = charRect.top + charRect.height / 2;

      setDebugData({
        rotation: rotation,
        scale: scale,
        width: charRect.width,
        height: charRect.height,
        shadowWidth: shadowRect.width,
        x: centerX,
        y: centerY,
        currentSequence: currentSequence,
        timestamp: Date.now(),
      });

      // Update min/max tracking
      setMinMax(prev => ({
        rotationMin: Math.min(prev.rotationMin, rotation),
        rotationMax: Math.max(prev.rotationMax, rotation),
        scaleMin: Math.min(prev.scaleMin, scale),
        scaleMax: Math.max(prev.scaleMax, scale),
        widthMin: Math.min(prev.widthMin, charRect.width),
        widthMax: Math.max(prev.widthMax, charRect.width),
        heightMin: Math.min(prev.heightMin, charRect.height),
        heightMax: Math.max(prev.heightMax, charRect.height),
        shadowWidthMin: Math.min(prev.shadowWidthMin, shadowRect.width),
        shadowWidthMax: Math.max(prev.shadowWidthMax, shadowRect.width),
        xMin: Math.min(prev.xMin, centerX),
        xMax: Math.max(prev.xMax, centerX),
        yMin: Math.min(prev.yMin, centerY),
        yMax: Math.max(prev.yMax, centerY),
      }));

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
          <span className="text-gray-400">Rotation:</span>
          <span className={`font-bold tabular-nums ${Math.abs(debugData.rotation) > 0.1 ? 'text-orange-400' : 'text-green-400'}`}>
            {debugData.rotation.toFixed(3)}°
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Scale:</span>
          <span className="text-yellow-300 font-bold tabular-nums">
            {debugData.scale.toFixed(4)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Width:</span>
          <span className="text-blue-300 font-bold tabular-nums">
            {debugData.width.toFixed(1)}px
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Height:</span>
          <span className="text-blue-300 font-bold tabular-nums">
            {debugData.height.toFixed(1)}px
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Shadow Width:</span>
          <span className="text-purple-300 font-bold tabular-nums">
            {debugData.shadowWidth.toFixed(1)}px
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">X Position:</span>
          <span className="text-pink-300 font-bold tabular-nums">
            {debugData.x.toFixed(1)}px
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Y Position:</span>
          <span className="text-pink-300 font-bold tabular-nums">
            {debugData.y.toFixed(1)}px
          </span>
        </div>

        <div className="mt-3 pt-2 border-t border-green-400/30">
          <div className="text-gray-400 text-[10px] mb-2">MIN/MAX Tracking:</div>
          <div className="space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Rotation:</span>
              <span className="text-orange-300 tabular-nums">
                {minMax.rotationMin.toFixed(3)}° to {minMax.rotationMax.toFixed(3)}°
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Scale:</span>
              <span className="text-yellow-300 tabular-nums">
                {minMax.scaleMin.toFixed(4)} to {minMax.scaleMax.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Width:</span>
              <span className="text-blue-300 tabular-nums">
                {minMax.widthMin.toFixed(1)}px to {minMax.widthMax.toFixed(1)}px
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Height:</span>
              <span className="text-blue-300 tabular-nums">
                {minMax.heightMin.toFixed(1)}px to {minMax.heightMax.toFixed(1)}px
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shadow:</span>
              <span className="text-purple-300 tabular-nums">
                {minMax.shadowWidthMin.toFixed(1)}px to {minMax.shadowWidthMax.toFixed(1)}px
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">X Pos:</span>
              <span className="text-pink-300 tabular-nums">
                {minMax.xMin.toFixed(1)}px to {minMax.xMax.toFixed(1)}px
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Y Pos:</span>
              <span className="text-pink-300 tabular-nums">
                {minMax.yMin.toFixed(1)}px to {minMax.yMax.toFixed(1)}px
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-green-400/30">
          <div className="text-gray-400 text-[10px] mb-1">Current Sequence:</div>
          <div className="text-green-400 font-bold text-sm break-words">
            {debugData.currentSequence}
            {randomAction && (
              <span className="text-cyan-400"> + {randomAction}</span>
            )}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-green-400/30">
          <div className="text-gray-500 text-[9px] tabular-nums">
            Updates: {(Date.now() - debugData.timestamp) < 100 ? '60fps' : 'active'}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-green-400/30 flex gap-2">
          <button
            onClick={toggleLogging}
            className={`flex-1 px-2 py-1 text-[10px] font-bold rounded ${
              isLogging
                ? 'bg-red-600 text-white'
                : 'bg-green-600 text-white'
            } hover:opacity-80 transition-opacity`}
          >
            {isLogging ? '⏹ STOP LOG' : '⏺ START LOG'}
          </button>
          <button
            onClick={downloadLog}
            className="flex-1 px-2 py-1 text-[10px] font-bold rounded bg-blue-600 text-white hover:opacity-80 transition-opacity"
          >
            📥 DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  );
}
