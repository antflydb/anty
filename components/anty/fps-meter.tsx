'use client';

import { useEffect, useRef, useState } from 'react';

export function FPSMeter() {
  const [fps, setFps] = useState(60);
  const [isVisible, setIsVisible] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const updateFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      // Update FPS every second
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(updateFPS);
    };

    animationFrameRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Keyboard toggle with tilde key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getFpsColor = () => {
    if (fps >= 55) return '#22c55e'; // Green
    if (fps >= 30) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-4 left-4 z-[9999] select-none"
      style={{
        fontFamily: 'monospace',
        fontSize: '14px',
        fontWeight: 'bold',
        color: getFpsColor(),
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '8px 12px',
        borderRadius: '4px',
      }}
    >
      {fps} FPS
    </div>
  );
}
