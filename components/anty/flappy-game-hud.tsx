'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '@/lib/anty/game-state';

interface FlappyGameHUDProps {
  gameState: GameState;
  score: number;
  highScore: number;
}

export function FlappyGameHUD({ gameState, score, highScore }: FlappyGameHUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Current Score - Top Center during play - BIGGER AND MORE VISIBLE */}
      <AnimatePresence>
        {gameState === 'playing' && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
            className="absolute top-8 left-1/2 -translate-x-1/2"
          >
            <div className="text-5xl font-bold text-white" style={{ fontFamily: 'system-ui', textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
              {score}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High Score - Bottom Right (always visible) */}
      <AnimatePresence>
        {highScore > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-6 right-6"
          >
            <div className="text-base font-bold text-white" style={{ fontFamily: 'system-ui', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Best: {highScore}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ready Prompt - Center with dark backdrop and staggered entrance */}
      <AnimatePresence>
        {gameState === 'ready' && (
          <>
            {/* Dark backdrop like game over */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-none"
            />

            {/* Centered button with staggered fade-up */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: 'backOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
            >
              <div className="inline-block px-8 py-4 bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/40">
                <div className="text-2xl font-semibold text-white" style={{ fontFamily: 'system-ui' }}>
                  Press space to play
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
