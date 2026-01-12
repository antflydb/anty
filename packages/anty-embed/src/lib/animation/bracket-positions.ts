/**
 * Pure calculation and validation functions for bracket positioning.
 * These functions have no side effects and are fully testable.
 */

export interface BracketTargets {
  left: { x: number; y: number; scale: number };
  right: { x: number; y: number; scale: number };
}

export interface ValidationResult {
  isValid: boolean;
  leftDrift: number;
  rightDrift: number;
  correction?: BracketTargets;
}

/** Reference size at which bracketScale produces the desired visual size */
const BRACKET_REFERENCE_SIZE = 160;

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
export function calculateBracketTargets(
  searchBarRect: DOMRect,
  leftBracketRect: DOMRect,
  rightBracketRect: DOMRect,
  bracketScale: number,
  characterSize: number
): BracketTargets {
  // Compensate bracket scale so brackets are always the same visual size
  // regardless of character size
  const compensatedScale = bracketScale * (BRACKET_REFERENCE_SIZE / characterSize);

  const scaledLeftSize = leftBracketRect.width * compensatedScale;
  const scaledRightSize = rightBracketRect.width * compensatedScale;

  // Target: outer edges align with search bar corners
  // Left bracket -> top-left corner
  const leftTargetX = searchBarRect.left + (scaledLeftSize / 2);
  const leftTargetY = searchBarRect.top + (scaledLeftSize / 2);

  // Right bracket -> bottom-right corner
  const rightTargetX = searchBarRect.right - (scaledRightSize / 2);
  const rightTargetY = searchBarRect.bottom - (scaledRightSize / 2);

  // Convert to transforms from bracket's original center position
  const leftCurrentX = leftBracketRect.left + (leftBracketRect.width / 2);
  const leftCurrentY = leftBracketRect.top + (leftBracketRect.height / 2);
  const rightCurrentX = rightBracketRect.left + (rightBracketRect.width / 2);
  const rightCurrentY = rightBracketRect.top + (rightBracketRect.height / 2);

  return {
    left: {
      x: leftTargetX - leftCurrentX,
      y: leftTargetY - leftCurrentY,
      scale: compensatedScale,
    },
    right: {
      x: rightTargetX - rightCurrentX,
      y: rightTargetY - rightCurrentY,
      scale: compensatedScale,
    },
  };
}

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
export function validateBracketPositions(
  expected: BracketTargets,
  currentLeftTransform: { x: number; y: number },
  currentRightTransform: { x: number; y: number },
  tolerance: number = 2
): ValidationResult {
  // Calculate Euclidean distance (drift) from expected position
  const leftDrift = Math.sqrt(
    Math.pow(expected.left.x - currentLeftTransform.x, 2) +
      Math.pow(expected.left.y - currentLeftTransform.y, 2)
  );

  const rightDrift = Math.sqrt(
    Math.pow(expected.right.x - currentRightTransform.x, 2) +
      Math.pow(expected.right.y - currentRightTransform.y, 2)
  );

  const isValid = leftDrift <= tolerance && rightDrift <= tolerance;

  return {
    isValid,
    leftDrift,
    rightDrift,
    correction: isValid ? undefined : expected,
  };
}

/**
 * Check if bracket targets are within viewport bounds.
 *
 * @param targets - Calculated bracket targets
 * @param viewportWidth - Current viewport width
 * @param viewportHeight - Current viewport height
 * @param margin - Allowed margin outside viewport (pixels)
 * @returns Whether targets are within acceptable bounds
 */
export function areBracketsInBounds(
  targets: BracketTargets,
  viewportWidth: number,
  viewportHeight: number,
  margin: number = 100
): boolean {
  const leftInBounds =
    targets.left.x >= -margin &&
    targets.left.x <= viewportWidth + margin &&
    targets.left.y >= -margin &&
    targets.left.y <= viewportHeight + margin;

  const rightInBounds =
    targets.right.x >= -margin &&
    targets.right.x <= viewportWidth + margin &&
    targets.right.y >= -margin &&
    targets.right.y <= viewportHeight + margin;

  return leftInBounds && rightInBounds;
}
