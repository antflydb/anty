/**
 * Anty Style Helpers
 *
 * Centralized style definitions for Anty character elements.
 * Use these to ensure consistency between the package and consuming apps.
 */

import type { CSSProperties } from 'react';

/**
 * Style helper functions for Anty character elements.
 * All measurements are based on a 160px base size.
 * Pass scale = size / 160 for proper scaling.
 */
export const ANTY_STYLES = {
  /**
   * Full container with extra height for shadow room.
   * Use this when you need the character + shadow to fit in a container.
   */
  getFullContainer: (size: number): CSSProperties => ({
    position: 'relative',
    width: size,
    height: size * 1.5, // Extra height for shadow
    overflow: 'visible',
  }),

  /**
   * Compact container (just the character, no shadow room).
   */
  getContainer: (size: number): CSSProperties => ({
    position: 'relative',
    width: size,
    height: size,
    overflow: 'visible',
  }),

  /**
   * Shadow style (positioned at bottom of container).
   * @param scale - Size scale factor (size / 160)
   */
  getShadow: (scale: number = 1): CSSProperties => ({
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: '0px',
    width: `${160 * scale}px`,
    height: `${40 * scale}px`,
    background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
    filter: `blur(${12 * scale}px)`,
    borderRadius: '50%',
    opacity: 0.7,
    pointerEvents: 'none',
  }),

  /**
   * Inner glow style (smaller, behind character).
   * @param scale - Size scale factor (size / 160)
   */
  getInnerGlow: (scale: number = 1): CSSProperties => ({
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    top: `${80 * scale}px`,
    width: `${120 * scale}px`,
    height: `${90 * scale}px`,
    borderRadius: '50%',
    background: 'linear-gradient(90deg, #C5D4FF 0%, #E0C5FF 100%)',
    filter: `blur(${25 * scale}px)`,
    pointerEvents: 'none',
  }),

  /**
   * Outer glow style (larger, behind inner glow).
   * @param scale - Size scale factor (size / 160)
   */
  getOuterGlow: (scale: number = 1): CSSProperties => ({
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    top: `${80 * scale}px`,
    width: `${170 * scale}px`,
    height: `${130 * scale}px`,
    borderRadius: '50%',
    background: 'linear-gradient(90deg, #D5E2FF 0%, #EED5FF 100%)',
    filter: `blur(${32 * scale}px)`,
    pointerEvents: 'none',
  }),

  /**
   * Base size used for all style calculations.
   * Divide your target size by this to get the scale factor.
   */
  BASE_SIZE: 160,

  /**
   * Calculate scale factor from a given size.
   * @param size - Target size in pixels
   * @returns Scale factor to pass to style helpers
   */
  getScale: (size: number): number => size / 160,
} as const;

// Type for the styles object
export type AntyStyles = typeof ANTY_STYLES;
