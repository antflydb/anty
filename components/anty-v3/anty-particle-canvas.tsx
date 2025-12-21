'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { type Particle, type ParticleType, PARTICLE_CONFIGS } from '@/lib/anty-v3/animation-state';

interface AntyParticleCanvasProps {
  particles: Particle[];
  width?: number;
  height?: number;
}

export interface ParticleCanvasHandle {
  spawnParticle: (type: ParticleType, x: number, y: number, color?: string) => void;
}

/**
 * Canvas-based particle system for Anty V3
 * Uses GSAP ticker for 60fps rendering
 */
export const AntyParticleCanvas = forwardRef<ParticleCanvasHandle, AntyParticleCanvasProps>(
  ({ particles, width = 400, height = 400 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>(particles);

    // Update particles ref when prop changes
    useEffect(() => {
      particlesRef.current = particles;
    }, [particles]);

    // Expose spawn method to parent
    useImperativeHandle(ref, () => ({
      spawnParticle: (type: ParticleType, x: number, y: number, color?: string) => {
        const config = PARTICLE_CONFIGS[type];
        const timestamp = Date.now();
        const random = Math.random();
        const newParticle: Particle = {
          id: `${type}-${timestamp}-${random}`,
          type,
          x,
          y,
          vx: gsap.utils.random(config.initialVelocity.x.min, config.initialVelocity.x.max),
          vy: gsap.utils.random(config.initialVelocity.y.min, config.initialVelocity.y.max),
          scale: gsap.utils.random(config.initialScale.min, config.initialScale.max),
          rotation: 0,
          rotationSpeed: gsap.utils.random(config.rotationSpeed.min, config.rotationSpeed.max), // Performance: calc once at creation
          opacity: 1,
          life: 1,
          color: color || getParticleColor(type),
        };

        if (type === 'confetti') {
          console.log('[PARTICLE] Created confetti particle:', {
            x,
            y,
            vx: newParticle.vx,
            vy: newParticle.vy,
            color: newParticle.color,
            scale: newParticle.scale,
            opacity: newParticle.opacity,
            life: newParticle.life
          });
        }

        particlesRef.current = [...particlesRef.current, newParticle];
      },
    }));

    // Setup canvas rendering with GSAP ticker
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // High DPI canvas setup
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Render loop using GSAP ticker
      const updateParticles = (time: number, deltaTime: number) => {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        const dt = deltaTime / 1000; // Convert to seconds

        // Memory leak fix: Replace map/filter with efficient for-loop
        const alive: Particle[] = [];
        const confettiCount = particlesRef.current.filter(p => p.type === 'confetti').length;
        if (confettiCount > 0) {
          console.log('[RENDER] Processing confetti particles:', confettiCount);
        }

        for (let i = 0; i < particlesRef.current.length; i++) {
          const updated = updateParticle(particlesRef.current[i], dt);
          if (updated.life > 0) {
            alive.push(updated);
            // Draw particle immediately (single pass)
            if (updated.type === 'confetti') {
              console.log('[RENDER] Drawing confetti particle');
            }
            drawParticle(ctx, updated);
          }
        }
        particlesRef.current = alive;

        // Diagnostic logging when particle count is high (no limits yet)
        if (particlesRef.current.length > 150) {
          console.warn(`[PARTICLES] High particle count: ${particlesRef.current.length}`);
        }
      };

      // Add to GSAP ticker for 60fps updates
      gsap.ticker.add(updateParticles);

      return () => {
        gsap.ticker.remove(updateParticles);
      };
    }, [width, height]);

    return (
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none"
        style={{
          width,
          height,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  }
);

AntyParticleCanvas.displayName = 'AntyParticleCanvas';

/**
 * Update particle physics
 */
function updateParticle(particle: Particle, dt: number): Particle {
  const config = PARTICLE_CONFIGS[particle.type];

  // Update velocity with gravity
  const newVy = particle.vy + config.gravity * dt;

  // Update position
  const newX = particle.x + particle.vx * dt;
  const newY = particle.y + particle.vy * dt;

  // Update rotation using stored rotationSpeed (performance: no recalc per frame)
  const newRotation = particle.rotation + particle.rotationSpeed * dt;

  // Update life (decreases based on lifetime)
  const lifeDecay = dt / config.lifetime;
  const newLife = Math.max(0, particle.life - lifeDecay);

  // Update opacity (fade out near end of life)
  let newOpacity = particle.opacity;
  if (newLife < config.fadeStart) {
    newOpacity = newLife / config.fadeStart;
  }

  return {
    ...particle,
    x: newX,
    y: newY,
    vx: particle.vx,
    vy: newVy,
    rotation: newRotation,
    rotationSpeed: particle.rotationSpeed,
    opacity: newOpacity,
    life: newLife,
  };
}

/**
 * Draw particle on canvas (placeholder shapes for now)
 */
function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save();

  // Apply transforms
  ctx.translate(particle.x, particle.y);
  ctx.rotate((particle.rotation * Math.PI) / 180);
  ctx.scale(particle.scale, particle.scale);
  ctx.globalAlpha = particle.opacity;

  // Draw based on particle type (placeholder circles for now)
  ctx.fillStyle = particle.color || '#ff0000';

  switch (particle.type) {
    case 'heart':
      drawHeart(ctx);
      break;
    case 'sparkle':
      drawSparkle(ctx);
      break;
    case 'sweat':
      drawCircle(ctx, 8, '#87ceeb');
      break;
    case 'zzz':
      drawZzz(ctx);
      break;
    case 'confetti':
      drawConfetti(ctx, particle);
      break;
  }

  ctx.restore();
}

/**
 * Placeholder shape renderers (will be replaced with SVG assets later)
 */
function drawCircle(ctx: CanvasRenderingContext2D, radius: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D) {
  // Simple heart shape
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.arc(-5, -5, 5, 0, Math.PI * 2);
  ctx.arc(5, -5, 5, 0, Math.PI * 2);
  ctx.lineTo(0, 8);
  ctx.closePath();
  ctx.fill();
}

function drawSparkle(ctx: CanvasRenderingContext2D) {
  // Star shape - uses fillStyle already set by drawParticle
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const x = Math.cos(angle) * 10;
    const y = Math.sin(angle) * 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawZzz(ctx: CanvasRenderingContext2D) {
  // Simple Z letter
  ctx.fillStyle = '#9370db';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Z', 0, 0);
}

function drawConfetti(ctx: CanvasRenderingContext2D, particle: Particle) {
  console.log('[DRAW] Drawing confetti at:', { x: particle.x, y: particle.y, opacity: particle.opacity, life: particle.life });

  // Draw colorful rectangles/squares
  ctx.fillStyle = particle.color || '#ffd700';

  // Alternate between rectangle and square based on particle ID
  const isSquare = particle.id.charCodeAt(0) % 2 === 0;

  if (isSquare) {
    // Square confetti
    ctx.fillRect(-6, -6, 12, 12);
  } else {
    // Rectangular confetti
    ctx.fillRect(-8, -4, 16, 8);
  }
}

function getParticleColor(type: ParticleType): string {
  switch (type) {
    case 'heart':
      return '#ff69b4';
    case 'sparkle':
      return '#ffd700';
    case 'sweat':
      return '#87ceeb';
    case 'zzz':
      return '#9370db';
    case 'confetti':
      // Random from celebration palette
      const colors = ['#FF6B9D', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
                      '#FCBAD3', '#FFE66D', '#A8DADC', '#F1C40F', '#3498DB'];
      return colors[Math.floor(Math.random() * colors.length)];
    default:
      return '#ff0000';
  }
}
