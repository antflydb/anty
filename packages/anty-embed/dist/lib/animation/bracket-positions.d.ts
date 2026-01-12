/**
 * Pure calculation and validation functions for bracket positioning.
 * These functions have no side effects and are fully testable.
 */
export interface BracketTargets {
    left: {
        x: number;
        y: number;
        scale: number;
    };
    right: {
        x: number;
        y: number;
        scale: number;
    };
}
export interface ValidationResult {
    isValid: boolean;
    leftDrift: number;
    rightDrift: number;
    correction?: BracketTargets;
}
/**
 * Calculate where brackets SHOULD be based on search bar position.
 * Pure function - no side effects, fully testable.
 *
 * @param searchBarRect - Bounding rect of the search bar element
 * @param leftBracketRect - Bounding rect of left bracket at scale=1, transform=0
 * @param rightBracketRect - Bounding rect of right bracket at scale=1, transform=0
 * @param bracketScale - Base scale factor from config (e.g., 0.14)
 * @param characterSize - Current character size in pixels (for scale compensation)
 * @returns Target transforms for both brackets
 */
export declare function calculateBracketTargets(searchBarRect: DOMRect, leftBracketRect: DOMRect, rightBracketRect: DOMRect, bracketScale: number, characterSize: number): BracketTargets;
/**
 * Validate current bracket positions against expected targets.
 * Returns drift amount and correction if needed.
 *
 * @param expected - The calculated target positions
 * @param currentLeftTransform - Current GSAP transform values for left bracket
 * @param currentRightTransform - Current GSAP transform values for right bracket
 * @param tolerance - Maximum allowed drift in pixels before correction needed
 * @returns Validation result with drift amounts
 */
export declare function validateBracketPositions(expected: BracketTargets, currentLeftTransform: {
    x: number;
    y: number;
}, currentRightTransform: {
    x: number;
    y: number;
}, tolerance?: number): ValidationResult;
/**
 * Check if bracket targets are within viewport bounds.
 *
 * @param targets - Calculated bracket targets
 * @param viewportWidth - Current viewport width
 * @param viewportHeight - Current viewport height
 * @param margin - Allowed margin outside viewport (pixels)
 * @returns Whether targets are within acceptable bounds
 */
export declare function areBracketsInBounds(targets: BracketTargets, viewportWidth: number, viewportHeight: number, margin?: number): boolean;
