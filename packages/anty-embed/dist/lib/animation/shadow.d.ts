/**
 * Shadow Tracker - Dynamic shadow that responds to character Y position
 *
 * Instead of animating shadow in multiple disconnected places (idle, emotions, etc.),
 * this tracker continuously watches character Y position and updates shadow accordingly.
 *
 * The relationship is inverse:
 * - Higher Y (jumping up) → shadow shrinks + fades
 * - Lower Y (grounded) → shadow grows + darkens
 */
export interface ShadowTrackerConfig {
    /** Y value considered "max height" for scaling (default: 70) */
    maxHeight: number;
    /** Scale when Y = 0 (grounded) */
    groundedScaleX: number;
    groundedScaleY: number;
    /** Scale when Y = -maxHeight (at apex) */
    maxHeightScaleX: number;
    maxHeightScaleY: number;
    /** Opacity when Y = 0 (grounded) */
    groundedOpacity: number;
    /** Opacity when Y = -maxHeight (at apex) */
    maxHeightOpacity: number;
}
export interface ShadowTrackerControls {
    /** Start the tracker (adds to GSAP ticker) */
    start: () => void;
    /** Stop the tracker completely (removes from ticker) */
    stop: () => void;
    /** Pause tracking (keeps ticker but doesn't update) */
    pause: () => void;
    /** Resume tracking after pause */
    resume: () => void;
    /** Check if tracker is currently active */
    isActive: () => boolean;
    /** Force update shadow to specific state (for transitions) */
    setGrounded: () => void;
}
/**
 * Creates a shadow tracker that updates shadow based on character Y position
 *
 * @param character - The character element to track Y position from
 * @param shadow - The shadow element to update
 * @param config - Optional configuration overrides
 * @returns Controls for starting/stopping the tracker
 */
export declare function createShadowTracker(character: HTMLElement, shadow: HTMLElement, config?: Partial<ShadowTrackerConfig>): ShadowTrackerControls;
