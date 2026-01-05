'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import gsap from 'gsap';
import { type Particle, type ParticleType, PARTICLE_CONFIGS } from '../lib/particles';

interface AntyParticleCanvasProps {
  particles: Particle[];
  width?: number;
  height?: number;
}

export interface ParticleCanvasHandle {
  spawnParticle: (type: ParticleType, x: number, y: number, color?: string) => void;
  showSearchGlow: () => void;
  hideSearchGlow: () => void;
}

/**
 * Canvas-based particle system for Anty
 * Uses GSAP ticker for 60fps rendering
 */
export const AntyParticleCanvas = forwardRef<ParticleCanvasHandle, AntyParticleCanvasProps>(
  ({ particles, width = 400, height = 400 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>(particles);
    const [searchGlowActive, setSearchGlowActive] = useState(false);

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
          rotationSpeed: gsap.utils.random(config.rotationSpeed.min, config.rotationSpeed.max),
          opacity: 1,
          life: 1,
          color: color || getParticleColor(type),
        };

        particlesRef.current = [...particlesRef.current, newParticle];
      },
      showSearchGlow: () => {
        setSearchGlowActive(true);
      },
      hideSearchGlow: () => {
        setSearchGlowActive(false);
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

        // Draw search glow if active (behind particles)
        if (searchGlowActive) {
          const centerX = width / 2;
          const centerY = height / 2;
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 500);
          gradient.addColorStop(0, 'rgba(229, 237, 255, 0.5)');
          gradient.addColorStop(0.4, 'rgba(229, 237, 255, 0.3)');
          gradient.addColorStop(0.7, 'rgba(229, 237, 255, 0.15)');
          gradient.addColorStop(1, 'rgba(229, 237, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }

        // Update and draw particles
        const dt = deltaTime / 1000;

        const alive: Particle[] = [];

        for (let i = 0; i < particlesRef.current.length; i++) {
          const updated = updateParticle(particlesRef.current[i], dt);
          if (updated.life > 0) {
            alive.push(updated);
            drawParticle(ctx, updated);
          }
        }
        particlesRef.current = alive;

        if (particlesRef.current.length > 150) {
          console.warn(`[PARTICLES] High particle count: ${particlesRef.current.length}`);
        }
      };

      gsap.ticker.add(updateParticles);

      return () => {
        gsap.ticker.remove(updateParticles);
      };
    }, [width, height, searchGlowActive]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
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

  const newVy = particle.vy + config.gravity * dt;
  const newX = particle.x + particle.vx * dt;
  const newY = particle.y + particle.vy * dt;
  const newRotation = particle.rotation + particle.rotationSpeed * dt;
  const lifeDecay = dt / config.lifetime;
  const newLife = Math.max(0, particle.life - lifeDecay);

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
 * Draw particle on canvas
 */
function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.save();

  ctx.translate(particle.x, particle.y);
  ctx.rotate((particle.rotation * Math.PI) / 180);
  ctx.scale(particle.scale, particle.scale);
  ctx.globalAlpha = particle.opacity;

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

function drawCircle(ctx: CanvasRenderingContext2D, radius: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.arc(-5, -5, 5, 0, Math.PI * 2);
  ctx.arc(5, -5, 5, 0, Math.PI * 2);
  ctx.lineTo(0, 8);
  ctx.closePath();
  ctx.fill();
}

function drawSparkle(ctx: CanvasRenderingContext2D) {
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
  ctx.fillStyle = '#9370db';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Z', 0, 0);
}

function drawConfetti(ctx: CanvasRenderingContext2D, particle: Particle) {
  ctx.fillStyle = particle.color || '#ffd700';

  const isSquare = particle.id.charCodeAt(0) % 2 === 0;

  if (isSquare) {
    ctx.fillRect(-6, -6, 12, 12);
  } else {
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
      const colors = ['#FF6B9D', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
                      '#FCBAD3', '#FFE66D', '#A8DADC', '#F1C40F', '#3498DB'];
      return colors[Math.floor(Math.random() * colors.length)];
    default:
      return '#ff0000';
  }
}
