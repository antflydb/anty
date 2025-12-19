'use client';

import { useEffect } from 'react';
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
  // Handle keyboard for play again
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        onPlayAgain();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
            Game over
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
          <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/40 cursor-pointer hover:bg-white/30 transition-colors" onClick={onPlayAgain}>
            <div className="text-base font-semibold text-white" style={{ fontFamily: 'system-ui' }}>
              Space to play again
            </div>
          </div>
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
