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
export declare const ANTY_STYLES: {
    /**
     * Full container with extra height for shadow room.
     * Use this when you need the character + shadow to fit in a container.
     */
    readonly getFullContainer: (size: number) => CSSProperties;
    /**
     * Compact container (just the character, no shadow room).
     */
    readonly getContainer: (size: number) => CSSProperties;
    /**
     * Shadow style (positioned at bottom of container).
     * @param scale - Size scale factor (size / 160)
     */
    readonly getShadow: (scale?: number) => CSSProperties;
    /**
     * Inner glow style (smaller, behind character).
     * @param scale - Size scale factor (size / 160)
     */
    readonly getInnerGlow: (scale?: number) => CSSProperties;
    /**
     * Outer glow style (larger, behind inner glow).
     * @param scale - Size scale factor (size / 160)
     */
    readonly getOuterGlow: (scale?: number) => CSSProperties;
    /**
     * Base size used for all style calculations.
     * Divide your target size by this to get the scale factor.
     */
    readonly BASE_SIZE: 160;
    /**
     * Calculate scale factor from a given size.
     * @param size - Target size in pixels
     * @returns Scale factor to pass to style helpers
     */
    readonly getScale: (size: number) => number;
};
export type AntyStyles = typeof ANTY_STYLES;
