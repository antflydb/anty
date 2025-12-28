'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

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
  characterRef: React.RefObject<HTMLDivElement | null>;
  shadowRef: React.RefObject<HTMLDivElement | null>;
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

  // Draggable state for main debug panel
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Position tracker experimental feature - MUST BE DECLARED BEFORE USE IN useEffect
  const [showPositionTracker, setShowPositionTracker] = useState(true); // Default to enabled
  const [positionHistory, setPositionHistory] = useState<Array<{ x: number; y: number; shadow: number }>>([]);
  const [snapshotCards, setSnapshotCards] = useState<Array<{
    id: string;
    sequence: string;
    data: Array<{ x: number; y: number; shadow: number }>;
  }>>([]);
  const cardIdCounter = useRef(0);
  const [isHoveringSnapshots, setIsHoveringSnapshots] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentBaseSequenceRef = useRef<string>('IDLE');
  const pendingSnapshotRef = useRef(false);

  // Baseline position (0,0,0) - set when tracker starts or manually
  const [baselinePosition, setBaselinePosition] = useState<{ x: number; y: number } | null>(null);

  // Simple tracking - always record, snapshot on sequence change with timing
  const lastSequenceChangeTime = useRef<number>(Date.now());
  const MIN_SEQUENCE_DURATION = 1500; // Animations must run at least 1.5s before switching

  // Draggable state for position tracker
  // Position equidistant from right edge as debug menu is from left edge
  const mainDebugRef = useRef<HTMLDivElement>(null);
  const trackerRef = useRef<HTMLDivElement>(null);
  const [trackerPosition, setTrackerPosition] = useState(() => {
    return { x: 0, y: 80 }; // Will be positioned via CSS when not dragged
  });
  const [isTrackerDragging, setIsTrackerDragging] = useState(false);
  const [trackerDragOffset, setTrackerDragOffset] = useState({ x: 0, y: 0 });
  const [maxTrackerHeight, setMaxTrackerHeight] = useState(600);
  const [trackerWasDragged, setTrackerWasDragged] = useState(false);

  // Motion lifecycle tracking
  const [currentMotionLabel, setCurrentMotionLabel] = useState<string>('IDLE');
  const motionStartTimeRef = useRef<number>(Date.now());
  const isMotionActiveRef = useRef<boolean>(false);
  const lastProcessedMotionRef = useRef<string>(''); // Prevent duplicate processing

  // Pre-motion buffer for capturing lead-in frames
  const PRE_MOTION_BUFFER = useRef<Array<{ x: number; y: number; shadow: number }>>([]);
  const MAX_BUFFER_SIZE = 60; // ~1s at 60fps

  // Update max tracker height based on main debug panel height
  useEffect(() => {
    if (mainDebugRef.current) {
      const mainHeight = mainDebugRef.current.offsetHeight;
      setMaxTrackerHeight(mainHeight);
    }
  }, [position]); // Update when main panel position changes (which might affect height)

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

  // Expected IDLE ranges (validated visually)
  const EXPECTED_IDLE = {
    rotationMin: 0.0,
    rotationMax: 2.0,
    scaleMin: 1.0,
    scaleMax: 1.02,
    widthMin: 160.0,
    widthMax: 168.8,
    heightMin: 160.0,
    heightMax: 168.8,
    shadowMin: 143.3,
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
      // Clear localStorage and alerts on unmount (when debug mode is exited)
      localStorage.setItem('anty-debug-alerts', JSON.stringify([]));
      setAlerts([]);
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

  // Helper to get base sequence without random action suffixes or motion event prefixes
  const getBaseSequence = (seq: string) => {
    // Handle motion event messages first
    if (seq.startsWith('MOTION_START:') || seq.startsWith('MOTION_COMPLETE:')) {
      const parts = seq.split(':');
      return parts[1] || 'IDLE'; // Extract emotion name (e.g., "EXCITED")
    }

    // Normalize "CONTROLLER: Idle animation" to "IDLE"
    if (seq.includes('Idle animation') || seq.includes('idle')) {
      return 'IDLE';
    }

    // Remove random action suffixes like "+ BLINK" or "+ Look-right-random"
    // This handles both "IDLE + BLINK" and "IDLE + Look-right-random" formats
    return seq.split(' + ')[0];
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
      const shouldBeFrozen = timeSinceLastMove > 6000;

      const isOffMode = currentSequence === 'OFF' || currentSequence.includes('Power-off') || currentSequence.includes('logo');
      const isSearchMode = currentSequence.includes('SEARCH') || currentSequence.includes('search');

      if (shouldBeFrozen && !isFrozen && !isOffMode && !isSearchMode) {
        // Check if frozen alert already exists
        const hasFrozenAlert = alerts.some(a => a.type === 'frozen' && Date.now() - a.timestamp < 10000);
        if (!hasFrozenAlert) {
          addAlert('frozen', 'FROZEN DETECTED', 'No Y movement for 6+ seconds', {
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

  // Track base sequence to avoid restarting timer on random actions
  const currentBaseSequence = getBaseSequence(currentSequence);
  const [trackedBaseSequence, setTrackedBaseSequence] = useState('');

  // IDLE validation tracker - 5 second monitoring
  useEffect(() => {
    // Only run when BASE sequence changes, not when random actions are added
    if (currentBaseSequence === trackedBaseSequence) {
      return;
    }

    setTrackedBaseSequence(currentBaseSequence);

    // Clear any existing timer when sequence changes (but not for random actions)
    if (idleValidationTimer && currentBaseSequence !== 'IDLE') {
      clearTimeout(idleValidationTimer);
      setIdleValidationTimer(null);
    }

    if (currentBaseSequence === 'IDLE') {
      // Only start tracking if not already tracking (don't restart for random actions)
      if (!idleValidationTimer) {
        setIdleValidationState('tracking');

        // Set 5-second timer
        const timer = setTimeout(() => {
        // Validate using ref to get latest minMax values
        const currentMinMax = minMaxRef.current;
        const rotationTolerance = 0.15;
        const scaleTolerance = 0.002;
        const sizeTolerance = 1.5;

        const rotationValid =
          currentMinMax.rotationMin >= (EXPECTED_IDLE.rotationMin - rotationTolerance) &&
          currentMinMax.rotationMin <= (EXPECTED_IDLE.rotationMin + rotationTolerance) &&
          currentMinMax.rotationMax >= (EXPECTED_IDLE.rotationMax - rotationTolerance) &&
          currentMinMax.rotationMax <= (EXPECTED_IDLE.rotationMax + rotationTolerance);

        const scaleValid =
          currentMinMax.scaleMin >= (EXPECTED_IDLE.scaleMin - scaleTolerance) &&
          currentMinMax.scaleMin <= (EXPECTED_IDLE.scaleMin + scaleTolerance) &&
          currentMinMax.scaleMax >= (EXPECTED_IDLE.scaleMax - scaleTolerance) &&
          currentMinMax.scaleMax <= (EXPECTED_IDLE.scaleMax + scaleTolerance);

        const widthValid =
          currentMinMax.widthMin >= (EXPECTED_IDLE.widthMin - sizeTolerance) &&
          currentMinMax.widthMin <= (EXPECTED_IDLE.widthMin + sizeTolerance) &&
          currentMinMax.widthMax >= (EXPECTED_IDLE.widthMax - sizeTolerance) &&
          currentMinMax.widthMax <= (EXPECTED_IDLE.widthMax + sizeTolerance);

        const heightValid =
          currentMinMax.heightMin >= (EXPECTED_IDLE.heightMin - sizeTolerance) &&
          currentMinMax.heightMin <= (EXPECTED_IDLE.heightMin + sizeTolerance) &&
          currentMinMax.heightMax >= (EXPECTED_IDLE.heightMax - sizeTolerance) &&
          currentMinMax.heightMax <= (EXPECTED_IDLE.heightMax + sizeTolerance);

        const shadowValid =
          currentMinMax.shadowWidthMin >= (EXPECTED_IDLE.shadowMin - sizeTolerance) &&
          currentMinMax.shadowWidthMin <= (EXPECTED_IDLE.shadowMin + sizeTolerance) &&
          currentMinMax.shadowWidthMax >= (EXPECTED_IDLE.shadowMax - sizeTolerance) &&
          currentMinMax.shadowWidthMax <= (EXPECTED_IDLE.shadowMax + sizeTolerance);

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
      }
    } else {
      setIdleValidationState('none');
    }

    return () => {
      if (idleValidationTimer) {
        clearTimeout(idleValidationTimer);
      }
    };
  }, [currentBaseSequence, trackedBaseSequence]);


  // Interruption detection
  useEffect(() => {
    // Skip motion lifecycle events (these are internal, not interruptions)
    if (currentSequence.startsWith('MOTION_START:') || currentSequence.startsWith('MOTION_COMPLETE:')) {
      return;
    }

    // Normalize sequence names to detect actual sequence changes
    const normalizeForInterruption = (seq: string) => {
      const base = seq.split(' + ')[0].toUpperCase();
      // Treat all LOOKAROUND sub-sequences as "LOOKAROUND"
      if (base === 'LOOKAROUND' || base === 'LOOK-LEFT' || base === 'LOOK-RIGHT') {
        return 'LOOKAROUND';
      }
      return base;
    };

    const normalizedCurrent = normalizeForInterruption(currentSequence);
    const normalizedPrev = normalizeForInterruption(prevSequence);

    if (normalizedPrev !== normalizedCurrent) {
      const duration = Date.now() - sequenceStartTime;

      // Check if animation was interrupted (less than expected duration)
      // Most animations should run for at least 500ms
      if (duration < 500 && normalizedPrev !== 'IDLE' && normalizedCurrent !== 'IDLE') {
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

  // Motion lifecycle event handlers for position tracker
  const handleMotionStart = useCallback((label: string) => {
    if (!showPositionTracker) return;

    console.log(`[PositionTracker] Motion START: ${label}`);

    isMotionActiveRef.current = true;
    motionStartTimeRef.current = Date.now();
    setCurrentMotionLabel(label);

    // Initialize position history with buffered pre-motion frames
    // This captures lead-in motion (prefer extra IDLE on action cards)
    const bufferedStart = [...PRE_MOTION_BUFFER.current];
    setPositionHistory(bufferedStart);

    console.log(`[PositionTracker] Buffered ${bufferedStart.length} lead-in frames`);
  }, [showPositionTracker]);

  const handleMotionComplete = useCallback((label: string) => {
    if (!showPositionTracker) return;

    // Prevent duplicate processing - check if motion is already inactive
    if (!isMotionActiveRef.current) {
      console.log(`[PositionTracker] ⚠️ Skipping duplicate MOTION_COMPLETE for ${label}`);
      return;
    }

    // IMMEDIATELY mark motion as inactive to prevent race conditions
    isMotionActiveRef.current = false;

    console.log(`[PositionTracker] ✅ Motion COMPLETE: ${label}`);

    // Use a local flag to ensure we only create ONE snapshot even if setState callback fires multiple times
    let snapshotCreated = false;

    // Clear position history and capture data SYNCHRONOUSLY
    setPositionHistory(currentHistory => {
      // Guard against React calling this callback multiple times
      if (snapshotCreated) {
        console.log(`[PositionTracker] ⚠️ Skipping duplicate setState callback for ${label}`);
        return [];
      }

      console.log(`[PositionTracker] Captured ${currentHistory.length} frames for ${label}`);

      // Check if we have enough data
      if (currentHistory.length < 20) {
        console.warn(`[PositionTracker] Insufficient data for ${label}: ${currentHistory.length} frames`);
        PRE_MOTION_BUFFER.current = [];
        setCurrentMotionLabel('IDLE');
        return [];
      }

      // Mark snapshot as created BEFORE scheduling it
      snapshotCreated = true;

      // Create snapshot INSIDE this callback so we have access to currentHistory
      const cardId = `p${cardIdCounter.current++}`;
      const capturedData = [...currentHistory];

      // Schedule snapshot creation for next tick (avoids nested setState warning)
      requestAnimationFrame(() => {
        setSnapshotCards(prevCards => [
          ...prevCards,
          { id: cardId, sequence: label, data: capturedData }
        ]);
        console.log(`[PositionTracker] ✨ Created snapshot ${cardId}: ${label} (${capturedData.length} frames)`);
      });

      // Clear for next animation
      PRE_MOTION_BUFFER.current = [];
      setCurrentMotionLabel('IDLE');
      return [];
    });
  }, [showPositionTracker]);

  // Listen for motion lifecycle events from controller
  useEffect(() => {
    if (!currentSequence || !showPositionTracker) return;

    // Deduplicate - skip if we already processed this exact sequence
    if (currentSequence === lastProcessedMotionRef.current) {
      console.log('[PositionTracker] 🔄 Already processed:', currentSequence);
      return;
    }

    console.log('[PositionTracker] 📨 Received currentSequence:', currentSequence);

    // Parse motion event messages from controller
    if (currentSequence.startsWith('MOTION_START:')) {
      const label = currentSequence.replace('MOTION_START:', '');
      // Reset deduplication when new motion starts - allows new emotion to process
      lastProcessedMotionRef.current = `MOTION_START:${label}`;
      console.log('[PositionTracker] 🟢 Processing MOTION_START:', label);
      handleMotionStart(label);
    } else if (currentSequence.startsWith('MOTION_COMPLETE:')) {
      const parts = currentSequence.replace('MOTION_COMPLETE:', '').split(':');
      const label = parts[0];

      // Deduplicate based on label only (ignore duration)
      const dedupeKey = `MOTION_COMPLETE:${label}`;
      if (lastProcessedMotionRef.current === dedupeKey) {
        console.log('[PositionTracker] ⚠️ Skipping duplicate MOTION_COMPLETE for:', label);
        return;
      }

      lastProcessedMotionRef.current = dedupeKey;
      console.log('[PositionTracker] 🔴 Processing MOTION_COMPLETE:', label, 'Full sequence:', currentSequence);
      handleMotionComplete(label);
    } else {
      // Don't reset for non-motion sequences to maintain deduplication
      console.log('[PositionTracker] ℹ️ Non-motion sequence:', currentSequence);
    }
  }, [currentSequence, showPositionTracker, handleMotionStart, handleMotionComplete]);

  // Mouse handlers for main debug panel dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Mouse handlers for tracker dragging
  const handleTrackerMouseDown = (e: React.MouseEvent) => {
    // Get current position from the element if we're in default (bottom-right) mode
    if (trackerRef.current && !trackerWasDragged) {
      const rect = trackerRef.current.getBoundingClientRect();
      setTrackerPosition({ x: rect.left, y: rect.top });
    }

    setIsTrackerDragging(true);
    setTrackerWasDragged(true);
    setTrackerDragOffset({
      x: e.clientX - (trackerRef.current?.getBoundingClientRect().left || trackerPosition.x),
      y: e.clientY - (trackerRef.current?.getBoundingClientRect().top || trackerPosition.y),
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
      if (isTrackerDragging) {
        setTrackerPosition({
          x: e.clientX - trackerDragOffset.x,
          y: e.clientY - trackerDragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsTrackerDragging(false);
    };

    if (isDragging || isTrackerDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isTrackerDragging, dragOffset, trackerDragOffset]);

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

      // Update position history for tracker - NEW MOTION-EVENT-DRIVEN SYSTEM
      if (showPositionTracker) {
        // Set baseline on first run if not already set
        if (!baselinePosition) {
          setBaselinePosition({ x: centerX, y: centerY });
        }

        // Calculate deviation from baseline (0,0,0 system)
        // Y is inverted: negative deviation = moving down (higher Y), positive = moving up (lower Y)
        const deviation = baselinePosition
          ? { x: centerX - baselinePosition.x, y: baselinePosition.y - centerY, shadow: shadowRect.width }
          : { x: 0, y: 0, shadow: shadowRect.width };

        // Always accumulate data to position history
        setPositionHistory(prev => [...prev, deviation]);

        // Maintain circular pre-motion buffer (rolling window of recent frames)
        if (positionHistory.length > 0) {
          PRE_MOTION_BUFFER.current.push(deviation);

          // Keep buffer at max size (circular)
          if (PRE_MOTION_BUFFER.current.length > MAX_BUFFER_SIZE) {
            PRE_MOTION_BUFFER.current.shift();
          }
        }
      }

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
  }, [characterRef, shadowRef, currentSequence, lastY, showPositionTracker]);

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

  // Render position plot with chronological stacking (left = oldest, right = newest)
  const renderPositionPlot = (data: Array<{ x: number; y: number; shadow: number }>, width = 280, height = 80, isLive = false) => {
    if (data.length < 2) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500 text-[10px]">
          Collecting data...
        </div>
      );
    }

    // Calculate bounds for y-axis (position)
    const yValues = data.map(d => d.y);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const yRange = yMax - yMin || 1;

    // Calculate bounds for shadow (normalize to same scale as position for overlay)
    const shadowValues = data.map(d => d.shadow);
    const shadowMin = Math.min(...shadowValues);
    const shadowMax = Math.max(...shadowValues);
    const shadowRange = shadowMax - shadowMin || 1;

    // Map data to SVG coordinates
    const padding = 5;
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;

    // Always stretch data across full width so waveform is visible
    // First point at left edge, newest at right edge
    const positionPoints = data.map((d, i) => {
      const x = ((i / (data.length - 1)) * plotWidth) + padding;
      const y = ((1 - (d.y - yMin) / yRange) * plotHeight) + padding;
      return { x, y };
    });

    const shadowPoints = data.map((d, i) => {
      const x = ((i / (data.length - 1)) * plotWidth) + padding;
      // Normalize shadow to same vertical range as position
      const y = ((1 - (d.shadow - shadowMin) / shadowRange) * plotHeight) + padding;
      return { x, y };
    });

    const positionPathD = positionPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const shadowPathD = shadowPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg width={width} height={height} className="bg-black/30">
        {/* Grid lines */}
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2}
          stroke="#444" strokeWidth="1" strokeDasharray="2,2" />
        <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding}
          stroke="#444" strokeWidth="1" strokeDasharray="2,2" />

        {/* Shadow plot line (underneath) - red to match shadow debug outline */}
        <path d={shadowPathD} fill="none" stroke="red" strokeWidth="1.5" opacity="0.6" />

        {/* Position plot line - matches Anty's bounding box color (lime) */}
        <path d={positionPathD} fill="none" stroke="lime" strokeWidth="2" />

        {/* Current point */}
        {positionPoints.length > 0 && (
          <circle cx={positionPoints[positionPoints.length - 1].x} cy={positionPoints[positionPoints.length - 1].y}
            r="3" fill="lime" />
        )}
      </svg>
    );
  };

  return (
    <>
      <div
        ref={mainDebugRef}
        className="fixed bg-black/70 text-white p-4 rounded-lg font-mono text-xs z-50 w-[300px] border-2 border-green-500/50"
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Reset validation state and min/max values
                setIdleValidationState('none');
                resetMinMax();
                // Clear existing timer if any
                if (idleValidationTimer) {
                  clearTimeout(idleValidationTimer);
                  setIdleValidationTimer(null);
                }
                // Force recheck by resetting tracked sequence
                setTrackedBaseSequence('');
              }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Click to reset and recheck"
            >
              {idleValidationState === 'none' && (
                <span className="text-gray-500">—</span>
              )}
              {idleValidationState === 'tracking' && (
                <>
                  <span className="text-cyan-300">Idle</span>
                  <span className="text-yellow-300 animate-pulse">...</span>
                </>
              )}
              {idleValidationState === 'valid' && (
                <>
                  <span className="text-cyan-300">Idle</span>
                  <span className="text-green-400">✓</span>
                </>
              )}
              {idleValidationState === 'invalid' && (
                <>
                  <span className="text-cyan-300">Idle</span>
                  <span className="text-red-400">✗</span>
                </>
              )}
            </button>
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
          <div className="text-green-400 font-bold text-sm break-words max-w-full overflow-wrap-anywhere">
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPositionTracker(!showPositionTracker);
              if (showPositionTracker) {
                // Reset on close
                setPositionHistory([]);
                setSnapshotCards([]);
                cardIdCounter.current = 0;
                setTrackerWasDragged(false); // Reset to default position next time
                setBaselinePosition(null); // Reset baseline
              }
            }}
            className={`px-2 py-1 text-[10px] font-bold rounded ${
              showPositionTracker
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-600 text-white'
            } hover:opacity-80 transition-opacity`}
            title="Position Tracker"
          >
            📊
          </button>
        </div>
      </div>
      </div>

      {/* Position Tracker Panel */}
      {showPositionTracker && (
        <div
          ref={trackerRef}
          className="fixed bg-black/70 text-white rounded-lg font-mono text-xs z-50 w-[280px] border-2 border-cyan-500/50 flex flex-col"
          style={{
            left: trackerWasDragged ? `${trackerPosition.x}px` : undefined,
            top: trackerWasDragged ? `${trackerPosition.y}px` : '80px', // Align with debug panel top
            right: !trackerWasDragged ? '16px' : undefined,
            cursor: isTrackerDragging ? 'grabbing' : 'grab',
            maxHeight: `${maxTrackerHeight}px`,
          }}
        >
          {/* Header - draggable */}
          <div
            className="p-3 pb-2 border-b border-cyan-400/30 cursor-grab"
            onMouseDown={handleTrackerMouseDown}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyan-400 font-bold text-[10px]">POSITION TRACKER</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBaselinePosition({ x: debugData.x, y: debugData.y });
                  setPositionHistory([]);
                  setSnapshotCards([]);
                  cardIdCounter.current = 0;
                  currentBaseSequenceRef.current = getBaseSequence(currentSequence);
                }}
                className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-600 text-white hover:opacity-80 transition-opacity"
                title="Reset baseline to current position"
              >
                🎯 RESET
              </button>
            </div>
            <div className="text-[9px] text-gray-400">
              Deviation from baseline (Δx, Δy)
            </div>
          </div>

          {/* Scrollable content area - stack from bottom upward */}
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto flex-1 p-3 pt-2 scroll-smooth flex flex-col justify-end"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#0891b2 rgba(0,0,0,0.5)',
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsHoveringSnapshots(true)}
            onMouseLeave={() => setIsHoveringSnapshots(false)}
          >
            {/* Snapshot cards - oldest to newest, stacking upward */}
            {snapshotCards.map((card, index) => {
              // Opacity based on distance from live (last card): nearest = 60%, then 45%, 30%, 15%, 0%
              const distanceFromLive = snapshotCards.length - index;
              let opacity = 1.0; // Default full opacity when hovering
              if (!isHoveringSnapshots) {
                if (distanceFromLive === 1) opacity = 0.6; // Nearest to live
                else if (distanceFromLive === 2) opacity = 0.45;
                else if (distanceFromLive === 3) opacity = 0.3;
                else if (distanceFromLive === 4) opacity = 0.15;
                else opacity = 0; // More than 4 cards away from live
              }

              return (
                <div
                  key={card.id}
                  className="mb-2 bg-black/50 p-2 rounded border border-cyan-500/30 transition-opacity duration-200"
                  style={{ opacity }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-cyan-300 text-[9px] font-bold">{card.sequence}</span>
                    <span className="text-gray-500 text-[8px] font-mono">{card.id}</span>
                  </div>
                  <div className="w-full">
                    {renderPositionPlot(card.data, 256, 60, false)}
                  </div>
                </div>
              );
            })}

            {/* Current live plot - always at bottom */}
            <div className="bg-black/50 p-2 rounded border border-cyan-400">
              <div className="flex justify-between items-center mb-1">
                <span className="text-cyan-300 text-[9px] font-bold">{currentMotionLabel}</span>
                <span className="text-cyan-400 text-[8px]">● LIVE</span>
              </div>
              {baselinePosition && positionHistory.length > 0 && (
                <div className="text-[8px] text-gray-400 mb-1 font-mono flex gap-2">
                  <span className="inline-block w-[60px]">Δx: <span className="inline-block w-[35px] text-right">{(Math.abs(positionHistory[positionHistory.length - 1].x) < 0.05 ? 0 : positionHistory[positionHistory.length - 1].x).toFixed(1)}px</span></span>
                  <span className="inline-block w-[60px]">Δy: <span className="inline-block w-[35px] text-right">{(Math.abs(positionHistory[positionHistory.length - 1].y) < 0.05 ? 0 : positionHistory[positionHistory.length - 1].y).toFixed(1)}px</span></span>
                </div>
              )}
              <div className="w-full">
                {renderPositionPlot(positionHistory, 256, 60, true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
