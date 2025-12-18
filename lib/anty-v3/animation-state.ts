/**
 * Animation State Types for Anty V3
 * Defines types for GSAP-powered animation system
 */

import type { AntyStats } from '@/lib/anty/stat-system';

// Expression names - only expressions with visual assets
export type ExpressionName =
  | 'idle'    // Default vertical pill eyes
  | 'happy'   // Smiling eyes
  | 'excited' // Smiling eyes with flip/jump animation and fireworks
  | 'spin'    // Happy eyes with Y-axis spin jump
  | 'shocked' // Wide eyes with brackets moving apart
  | 'wink'    // Half-closed right eye + closed left eye
  | 'sad'     // Downward curved eyes with droop animation
  | 'off';    // Logo state - triangle eyes, no animations

// Button names for interactive responses
export type ButtonName = 'feed' | 'play' | 'chat' | 'moods';

// Particle types for canvas rendering
export type ParticleType = 'heart' | 'sparkle' | 'sweat' | 'zzz';

// Particle object for canvas system
export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  scale: number;
  rotation: number;
  opacity: number;
  life: number; // 0-1, decreases over time
  color?: string;
}

// Animation state for the character
export interface AnimationState {
  currentExpression: ExpressionName;
  isAnimating: boolean;
  lastInteraction?: number; // timestamp
  particles?: Particle[];
  idlePaused?: boolean;
  currentEvent?: AnimationEvent | null;
}

// Animation controls interface
export interface AnimationControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setExpression: (expression: ExpressionName) => void;
}

// Event types for animation triggers
export type AnimationEvent =
  | { type: 'button_click'; button: ButtonName }
  | { type: 'expression_change'; expression: ExpressionName }
  | { type: 'spontaneous_behavior'; behavior: 'blink' | 'stretch' | 'yawn' | 'look_around' }
  | { type: 'spawn_particle'; particle: Omit<Particle, 'id'> };

// Character animation props
export interface CharacterAnimationProps {
  stats: AntyStats;
  expression?: ExpressionName;
  onButtonClick?: (button: ButtonName) => void;
  className?: string;
}

// Expression transition config
export interface ExpressionTransition {
  duration: number; // in seconds
  ease: string;
}

// Expression transition speeds
export const EXPRESSION_TRANSITIONS: Record<string, ExpressionTransition> = {
  instant: { duration: 0, ease: 'none' },
  fast: { duration: 0.15, ease: 'power2.inOut' },
  normal: { duration: 0.3, ease: 'power2.inOut' },
  slow: { duration: 0.5, ease: 'power2.inOut' },
};

// Idle animation config
export interface IdleAnimationConfig {
  floating: {
    amplitude: number; // pixels
    duration: number; // seconds
    ease: string;
  };
  rotation: {
    angle: number; // degrees
    synchronized: boolean; // sync with floating
  };
  breathing: {
    scaleMin: number;
    scaleMax: number;
    duration: number;
    ease: string;
  };
}

export const DEFAULT_IDLE_CONFIG: IdleAnimationConfig = {
  floating: {
    amplitude: 12,
    duration: 3.7,
    ease: 'sine.inOut',
  },
  rotation: {
    angle: 2.5,
    synchronized: true,
  },
  breathing: {
    scaleMin: 0.98,
    scaleMax: 1.0,
    duration: 4,
    ease: 'sine.inOut',
  },
};

// Particle physics config
export interface ParticleConfig {
  lifetime: number; // seconds
  gravity: number;
  initialVelocity: {
    x: { min: number; max: number };
    y: { min: number; max: number };
  };
  initialScale: { min: number; max: number };
  rotationSpeed: { min: number; max: number };
  fadeStart: number; // % of lifetime when fade begins
}

export const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
  heart: {
    lifetime: 2,
    gravity: -100, // pixels/s^2 (negative = up)
    initialVelocity: {
      x: { min: -30, max: 30 },
      y: { min: -80, max: -120 },
    },
    initialScale: { min: 0.5, max: 0.8 },
    rotationSpeed: { min: -45, max: 45 }, // degrees/s
    fadeStart: 0.6,
  },
  sparkle: {
    lifetime: 1.5,
    gravity: -50,
    initialVelocity: {
      x: { min: -50, max: 50 },
      y: { min: -60, max: -100 },
    },
    initialScale: { min: 0.5, max: 0.9 },
    rotationSpeed: { min: -180, max: 180 },
    fadeStart: 0.5,
  },
  sweat: {
    lifetime: 1.2,
    gravity: 150, // positive = down
    initialVelocity: {
      x: { min: -20, max: 20 },
      y: { min: 0, max: 20 },
    },
    initialScale: { min: 0.4, max: 0.6 },
    rotationSpeed: { min: 0, max: 0 },
    fadeStart: 0.7,
  },
  zzz: {
    lifetime: 2.5,
    gravity: -30,
    initialVelocity: {
      x: { min: 10, max: 30 },
      y: { min: -40, max: -60 },
    },
    initialScale: { min: 0.6, max: 0.9 },
    rotationSpeed: { min: -20, max: 20 },
    fadeStart: 0.7,
  },
};

// Control interfaces for animation systems
export interface IdleTimelineControls {
  pause: () => void;
  resume: () => void;
  kill: () => void;
  isActive: () => boolean;
}

export interface SpontaneousBehaviorControls {
  pause: () => void;
  resume: () => void;
  kill: () => void;
}
