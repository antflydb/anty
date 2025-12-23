'use client';

import { useEffect, useState, useRef } from 'react';

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

interface DebugAlert {
  id: string;
  type: 'frozen' | 'mismatch' | 'interruption';
  title: string;
  message: string;
  timestamp: number;
  data?: any;
}

interface AnimationDebugOverlayProps {
  characterRef: React.RefObject<HTMLDivElement>;
  shadowRef: React.RefObject<HTMLDivElement>;
  currentSequence?: string;
  randomAction?: string;
  animationSource?: string; // 'controller' | 'legacy' | 'manual'
}

export function AnimationDebugOverlay({
  characterRef,
  shadowRef,
  currentSequence = 'IDLE',
  randomAction = '',
  animationSource = 'unknown',
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

  // Draggable state
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Frozen detection state
  const [lastY, setLastY] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());
  const [isFrozen, setIsFrozen] = useState(false);

  // Stackable alerts - persist across refreshes
  const [alerts, setAlerts] = useState<DebugAlert[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('anty-debug-alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Previous sequence for interruption detection
  const [prevSequence, setPrevSequence] = useState(currentSequence);
  const [sequenceStartTime, setSequenceStartTime] = useState(Date.now());

  // IDLE validation state
  const [idleValidationState, setIdleValidationState] = useState<'tracking' | 'valid' | 'invalid' | 'none'>('none');
  const [idleValidationTimer, setIdleValidationTimer] = useState<NodeJS.Timeout | null>(null);

  // Expected IDLE ranges from ANIMATION_VALIDATION.md
  const EXPECTED_IDLE = {
    rotationMin: 0.0,
    rotationMax: 2.0,
    scaleMin: 1.0,
    scaleMax: 1.02,
    widthMin: 160.0,
    widthMax: 168.8,
    heightMin: 160.0,
    heightMax: 168.8,
    shadowMin: 112.0,
    shadowMax: 160.0,
  };

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

  // Persist alerts to localStorage
  useEffect(() => {
    localStorage.setItem('anty-debug-alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Clear alerts when debug menu is closed (component unmounts)
  useEffect(() => {
    return () => {
      // Clear localStorage on unmount (when debug mode is exited)
      localStorage.setItem('anty-debug-alerts', JSON.stringify([]));
    };
  }, []);

  // Add alert helper
  const addAlert = (type: DebugAlert['type'], title: string, message: string, data?: any) => {
    const newAlert: DebugAlert = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      data,
    };
    setAlerts(prev => [...prev, newAlert]);

    // Log if recording
    if (isLogging) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: `ALERT_${type.toUpperCase()}`,
        title,
        message,
        data,
      };
      const existingLogs = localStorage.getItem('anty-animation-log');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      localStorage.setItem('anty-animation-log', JSON.stringify(logs));
    }
  };

  // Dismiss alert helper
  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

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

  // Reset frozen detection when entering IDLE mode from another mode
  useEffect(() => {
    if (currentSequence === 'IDLE' && prevSequence !== 'IDLE') {
      setLastMoveTime(Date.now());
      setIsFrozen(false);
    }
  }, [currentSequence, prevSequence]);

  // Frozen detection - add alert instead of state
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastMove = Date.now() - lastMoveTime;
      const shouldBeFrozen = timeSinceLastMove > 3000;

      const isOffMode = currentSequence === 'OFF' || currentSequence.includes('Power-off') || currentSequence.includes('logo');
      const isSearchMode = currentSequence.includes('SEARCH') || currentSequence.includes('search');

      if (shouldBeFrozen && !isFrozen && !isOffMode && !isSearchMode) {
        // Check if frozen alert already exists
        const hasFrozenAlert = alerts.some(a => a.type === 'frozen' && Date.now() - a.timestamp < 10000);
        if (!hasFrozenAlert) {
          addAlert('frozen', 'FROZEN DETECTED', 'No Y movement for 3+ seconds', {
            sequence: currentSequence,
            yPosition: debugData.y.toFixed(1),
          });
        }
      }

      setIsFrozen(shouldBeFrozen);
    }, 500);

    return () => clearInterval(interval);
  }, [lastMoveTime, isFrozen, currentSequence, debugData.y, alerts]);

  // Use ref to store latest minMax for validation
  const minMaxRef = useRef(minMax);
  useEffect(() => {
    minMaxRef.current = minMax;
  }, [minMax]);

  // IDLE validation tracker - 5 second monitoring
  useEffect(() => {
    // Clear any existing timer when sequence changes
    if (idleValidationTimer) {
      clearTimeout(idleValidationTimer);
      setIdleValidationTimer(null);
    }

    if (currentSequence === 'IDLE') {
      // Start tracking
      setIdleValidationState('tracking');

      // Set 5-second timer
      const timer = setTimeout(() => {
        // Validate using ref to get latest minMax values
        const currentMinMax = minMaxRef.current;
        const rotationTolerance = 0.15;
        const scaleTolerance = 0.002;
        const sizeTolerance = 1.5;

        const rotationValid =
          Math.abs(currentMinMax.rotationMin - EXPECTED_IDLE.rotationMin) <= rotationTolerance &&
          Math.abs(currentMinMax.rotationMax - EXPECTED_IDLE.rotationMax) <= rotationTolerance;

        const scaleValid =
          Math.abs(currentMinMax.scaleMin - EXPECTED_IDLE.scaleMin) <= scaleTolerance &&
          Math.abs(currentMinMax.scaleMax - EXPECTED_IDLE.scaleMax) <= scaleTolerance;

        const widthValid =
          Math.abs(currentMinMax.widthMin - EXPECTED_IDLE.widthMin) <= sizeTolerance &&
          Math.abs(currentMinMax.widthMax - EXPECTED_IDLE.widthMax) <= sizeTolerance;

        const heightValid =
          Math.abs(currentMinMax.heightMin - EXPECTED_IDLE.heightMin) <= sizeTolerance &&
          Math.abs(currentMinMax.heightMax - EXPECTED_IDLE.heightMax) <= sizeTolerance;

        const shadowValid =
          Math.abs(currentMinMax.shadowWidthMin - EXPECTED_IDLE.shadowMin) <= sizeTolerance &&
          Math.abs(currentMinMax.shadowWidthMax - EXPECTED_IDLE.shadowMax) <= sizeTolerance;

        const isValid = rotationValid && scaleValid && widthValid && heightValid && shadowValid;

        if (isValid) {
          setIdleValidationState('valid');
        } else {
          setIdleValidationState('invalid');
          // Trigger mismatch alert
          const issues: string[] = [];

          if (minMax.rotationMin < EXPECTED_IDLE.rotationMin - rotationTolerance) {
            issues.push(`Rotation min ${minMax.rotationMin.toFixed(3)}° below ${EXPECTED_IDLE.rotationMin}°`);
          }
          if (minMax.rotationMax > EXPECTED_IDLE.rotationMax + rotationTolerance) {
            issues.push(`Rotation max ${minMax.rotationMax.toFixed(3)}° exceeds ${EXPECTED_IDLE.rotationMax}°`);
          }
          if (minMax.scaleMin < EXPECTED_IDLE.scaleMin - scaleTolerance) {
            issues.push(`Scale min ${minMax.scaleMin.toFixed(4)} below ${EXPECTED_IDLE.scaleMin}`);
          }
          if (minMax.scaleMax > EXPECTED_IDLE.scaleMax + scaleTolerance) {
            issues.push(`Scale max ${minMax.scaleMax.toFixed(4)} exceeds ${EXPECTED_IDLE.scaleMax}`);
          }
          if (minMax.widthMin < EXPECTED_IDLE.widthMin - sizeTolerance) {
            issues.push(`Width min ${minMax.widthMin.toFixed(1)}px below ${EXPECTED_IDLE.widthMin}px`);
          }
          if (minMax.widthMax > EXPECTED_IDLE.widthMax + sizeTolerance) {
            issues.push(`Width max ${minMax.widthMax.toFixed(1)}px exceeds ${EXPECTED_IDLE.widthMax}px`);
          }
          if (minMax.heightMin < EXPECTED_IDLE.heightMin - sizeTolerance) {
            issues.push(`Height min ${minMax.heightMin.toFixed(1)}px below ${EXPECTED_IDLE.heightMin}px`);
          }
          if (minMax.heightMax > EXPECTED_IDLE.heightMax + sizeTolerance) {
            issues.push(`Height max ${minMax.heightMax.toFixed(1)}px exceeds ${EXPECTED_IDLE.heightMax}px`);
          }

          if (issues.length > 0) {
            const hasMismatchAlert = alerts.some(a => a.type === 'mismatch' && a.data?.sequence === 'IDLE');
            if (!hasMismatchAlert) {
              addAlert('mismatch', 'IDLE VALUES MISMATCH', issues.join('; '), {
                sequence: 'IDLE',
                expected: EXPECTED_IDLE,
                actual: minMax,
              });
            }
          }
        }
      }, 5000);

      setIdleValidationTimer(timer);
    } else {
      setIdleValidationState('none');
    }

    return () => {
      if (idleValidationTimer) {
        clearTimeout(idleValidationTimer);
      }
    };
  }, [currentSequence]);


  // Interruption detection
  useEffect(() => {
    if (prevSequence !== currentSequence) {
      const duration = Date.now() - sequenceStartTime;

      // Check if animation was interrupted (less than expected duration)
      // Most animations should run for at least 500ms
      if (duration < 500 && prevSequence !== 'IDLE' && currentSequence !== 'IDLE') {
        const hasInterruptionAlert = alerts.some(
          a => a.type === 'interruption' && Date.now() - a.timestamp < 5000
        );
        if (!hasInterruptionAlert) {
          addAlert(
            'interruption',
            'ANIMATION INTERRUPTED',
            `${prevSequence} → ${currentSequence} after only ${duration}ms`,
            {
              from: prevSequence,
              to: currentSequence,
              duration,
            }
          );
        }
      }

      setPrevSequence(currentSequence);
      setSequenceStartTime(Date.now());
    }
  }, [currentSequence, prevSequence, sequenceStartTime, alerts]);

  // Mouse handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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

      // Track Y position changes for frozen detection
      if (Math.abs(centerY - lastY) > 0.5) {
        setLastY(centerY);
        setLastMoveTime(Date.now());
      }

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
  }, [characterRef, shadowRef, currentSequence, lastY]);

  // Alert styling by type
  const getAlertStyle = (type: DebugAlert['type']) => {
    switch (type) {
      case 'frozen':
        return { bg: 'bg-red-600/80', border: 'border-red-400', icon: '⚠️' };
      case 'mismatch':
        return { bg: 'bg-orange-600/80', border: 'border-orange-400', icon: '⚡' };
      case 'interruption':
        return { bg: 'bg-yellow-600/80', border: 'border-yellow-400', icon: '⏸' };
      default:
        return { bg: 'bg-gray-600/80', border: 'border-gray-400', icon: '❗' };
    }
  };

  return (
    <div
      className="fixed bg-black/70 text-white p-4 rounded-lg font-mono text-xs z-50 min-w-[280px] border-2 border-green-500/50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between mb-3 border-b border-green-400/30 pb-2">
        <div className="flex flex-col gap-1">
          <span className="text-green-400 font-bold">ANIMATION DEBUG</span>
          <span className="text-gray-400 text-[10px]">
            Source: <span className="text-cyan-300">{animationSource}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isFrozen && (
            <span className="text-yellow-400 text-[10px] font-bold">FROZEN</span>
          )}
          <div
            className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400' : 'bg-green-600'}`}
            style={{ transition: 'background-color 0.05s' }}
          />
          <span className="text-green-400 text-[10px]">LIVE</span>
        </div>
      </div>

      {/* Stacked Alerts */}
      {alerts.length > 0 && (
        <div className="mb-3 space-y-2">
          {alerts.map(alert => {
            const style = getAlertStyle(alert.type);
            return (
              <div
                key={alert.id}
                className={`p-2 ${style.bg} border ${style.border} rounded flex items-center gap-2`}
              >
                <span className="text-xl">{style.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-white text-[10px]">{alert.title}</div>
                  <div className="text-[9px] text-white/90">{alert.message}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(alert.id);
                  }}
                  className="w-4 h-4 flex items-center justify-center text-white/60 hover:text-white transition-colors text-xs"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

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
          <div className="flex items-center justify-between text-[10px] mb-2">
            <span className="text-gray-400">MIN/MAX Tracking:</span>
            {idleValidationState !== 'none' && (
              <div className="flex items-center gap-1">
                <span className="text-cyan-300">Idle</span>
                {idleValidationState === 'tracking' && (
                  <span className="text-yellow-300 animate-pulse">...</span>
                )}
                {idleValidationState === 'valid' && (
                  <span className="text-green-400">✓</span>
                )}
                {idleValidationState === 'invalid' && (
                  <span className="text-red-400">✗</span>
                )}
              </div>
            )}
          </div>
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
            disabled={!localStorage.getItem('anty-animation-log') || localStorage.getItem('anty-animation-log') === '[]'}
            className={`flex-1 px-2 py-1 text-[10px] font-bold rounded ${
              !localStorage.getItem('anty-animation-log') || localStorage.getItem('anty-animation-log') === '[]'
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:opacity-80'
            } transition-opacity`}
          >
            📥 DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  );
}
