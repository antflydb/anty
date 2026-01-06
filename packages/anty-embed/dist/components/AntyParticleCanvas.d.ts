import { type Particle, type ParticleType } from '../lib/particles';
interface AntyParticleCanvasProps {
    particles: Particle[];
    width?: number;
    height?: number;
    sizeScale?: number;
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
export declare const AntyParticleCanvas: import("react").ForwardRefExoticComponent<AntyParticleCanvasProps & import("react").RefAttributes<ParticleCanvasHandle>>;
export {};
