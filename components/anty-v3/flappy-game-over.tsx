'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface FlappyGameOverProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function FlappyGameOver({
  score,
  highScore,
  isNewHighScore,
  onPlayAgain,
  onExit,
}: FlappyGameOverProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle keyboard for play again with hold mechanic
  useEffect(() => {
    const updateHoldProgress = () => {
      if (holdStartTimeRef.current) {
        const elapsed = Date.now() - holdStartTimeRef.current;
        const progress = Math.min(elapsed / 1000, 1); // 1 second
        setHoldProgress(progress);

        if (progress >= 1) {
          // Fully held - play again
          onPlayAgain();
          holdStartTimeRef.current = null;
          setHoldProgress(0);
        } else {
          animationFrameRef.current = requestAnimationFrame(updateHoldProgress);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (!holdStartTimeRef.current) {
          holdStartTimeRef.current = Date.now();
          animationFrameRef.current = requestAnimationFrame(updateHoldProgress);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        // Reset if released early
        holdStartTimeRef.current = null;
        setHoldProgress(0);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onPlayAgain, onExit]);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      {/* Content - Clean overlay style like mockup */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative text-center"
      >
        {/* NEW HIGH SCORE - Super impressive! */}
        {isNewHighScore && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
            className="mb-8"
          >
            <motion.div
              animate={{
                textShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5)',
                  '0 0 30px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.7)',
                  '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-7xl font-bold text-yellow-300"
              style={{ fontFamily: 'system-ui' }}
            >
              🏆 NEW HIGH SCORE! 🏆
            </motion.div>
          </motion.div>
        )}

        {/* Title */}
        {!isNewHighScore && (
          <div className="text-6xl font-bold text-white mb-6" style={{ fontFamily: 'system-ui', textShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
            Game Over
          </div>
        )}

        {/* Score */}
        <div className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'system-ui', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
          Score: {score}
        </div>

        {/* High Score */}
        <div className="text-xl font-bold text-white/80 mb-12" style={{ fontFamily: 'system-ui', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
          Best: {highScore}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 items-center">
          {/* Play Again Button with Hold Progress */}
          <div className="relative inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/40 overflow-hidden">
            {/* White fill progress (left to right) */}
            <div
              className="absolute inset-0 bg-white transition-all"
              style={{
                width: `${holdProgress * 100}%`,
                transition: holdProgress === 0 ? 'width 0.1s ease-out' : 'none',
              }}
            />
            {/* Text */}
            <div
              className="relative text-base font-semibold z-10"
              style={{
                fontFamily: 'system-ui',
                color: holdProgress > 0.5 ? '#000' : '#fff',
                transition: 'color 0.1s',
              }}
            >
              Hold space to play again
            </div>
          </div>

          {/* Exit Button */}
          <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/40 cursor-pointer hover:bg-white/30 transition-colors" onClick={onExit}>
            <div className="text-base font-semibold text-white" style={{ fontFamily: 'system-ui' }}>
              Esc to exit
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
