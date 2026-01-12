import { describe, it, expect } from 'vitest';
import {
  calculateBracketTargets,
  validateBracketPositions,
  areBracketsInBounds,
  type BracketTargets,
} from '../bracket-positions';

describe('calculateBracketTargets', () => {
  // Mock a search bar centered in viewport
  const mockSearchBarRect = {
    left: 100,
    top: 200,
    right: 500,
    bottom: 270,
    width: 400,
    height: 70,
    x: 100,
    y: 200,
    toJSON: () => ({}),
  } as DOMRect;

  // Mock brackets at center of viewport (before transform)
  const mockLeftBracketRect = {
    left: 280,
    top: 215,
    right: 320,
    bottom: 255,
    width: 40,
    height: 40,
    x: 280,
    y: 215,
    toJSON: () => ({}),
  } as DOMRect;

  const mockRightBracketRect = {
    left: 280,
    top: 215,
    right: 320,
    bottom: 255,
    width: 40,
    height: 40,
    x: 280,
    y: 215,
    toJSON: () => ({}),
  } as DOMRect;

  describe('scale compensation', () => {
    it('returns base scale when character size matches reference', () => {
      const targets = calculateBracketTargets(
        mockSearchBarRect,
        mockLeftBracketRect,
        mockRightBracketRect,
        0.14,
        160 // Reference size
      );

      expect(targets.left.scale).toBeCloseTo(0.14);
      expect(targets.right.scale).toBeCloseTo(0.14);
    });

    it('compensates scale for smaller character size', () => {
      const targets = calculateBracketTargets(
        mockSearchBarRect,
        mockLeftBracketRect,
        mockRightBracketRect,
        0.14,
        80 // Half of reference size
      );

      // Scale should be doubled to maintain visual size
      expect(targets.left.scale).toBeCloseTo(0.28);
      expect(targets.right.scale).toBeCloseTo(0.28);
    });

    it('compensates scale for larger character size', () => {
      const targets = calculateBracketTargets(
        mockSearchBarRect,
        mockLeftBracketRect,
        mockRightBracketRect,
        0.14,
        320 // Double reference size
      );

      // Scale should be halved
      expect(targets.left.scale).toBeCloseTo(0.07);
      expect(targets.right.scale).toBeCloseTo(0.07);
    });
  });

  describe('position calculations', () => {
    it('moves left bracket toward top-left corner', () => {
      const targets = calculateBracketTargets(
        mockSearchBarRect,
        mockLeftBracketRect,
        mockRightBracketRect,
        0.14,
        160
      );

      // Left bracket should move left (negative x) and up (negative y)
      // from center position toward top-left of search bar
      expect(targets.left.x).toBeLessThan(0);
      expect(targets.left.y).toBeLessThan(0);
    });

    it('moves right bracket toward bottom-right corner', () => {
      const targets = calculateBracketTargets(
        mockSearchBarRect,
        mockLeftBracketRect,
        mockRightBracketRect,
        0.14,
        160
      );

      // Right bracket should move right (positive x) and down (positive y)
      // from center position toward bottom-right of search bar
      expect(targets.right.x).toBeGreaterThan(0);
      expect(targets.right.y).toBeGreaterThan(0);
    });

    it('calculates transforms relative to bracket center', () => {
      const targets = calculateBracketTargets(
        mockSearchBarRect,
        mockLeftBracketRect,
        mockRightBracketRect,
        0.14,
        160
      );

      // The transforms should position the scaled bracket's outer edge
      // at the search bar corner
      const scaledSize = 40 * 0.14; // 5.6px
      const bracketCenter = { x: 300, y: 235 }; // Center of mock bracket

      // Left bracket target: search bar left + half scaled size
      const expectedLeftTargetX = 100 + scaledSize / 2; // ~102.8
      const expectedLeftTargetY = 200 + scaledSize / 2; // ~202.8

      expect(targets.left.x).toBeCloseTo(expectedLeftTargetX - bracketCenter.x);
      expect(targets.left.y).toBeCloseTo(expectedLeftTargetY - bracketCenter.y);
    });
  });

  describe('different search bar positions', () => {
    it('handles search bar at viewport origin', () => {
      const originSearchBar = {
        left: 0,
        top: 0,
        right: 400,
        bottom: 70,
        width: 400,
        height: 70,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      } as DOMRect;

      const targets = calculateBracketTargets(
        originSearchBar,
        mockLeftBracketRect,
        mockRightBracketRect,
        0.14,
        160
      );

      // Should still calculate valid transforms
      expect(typeof targets.left.x).toBe('number');
      expect(typeof targets.left.y).toBe('number');
      expect(typeof targets.right.x).toBe('number');
      expect(typeof targets.right.y).toBe('number');
    });

    it('handles narrow search bar (mobile)', () => {
      const narrowSearchBar = {
        left: 20,
        top: 100,
        right: 300,
        bottom: 160,
        width: 280,
        height: 60,
        x: 20,
        y: 100,
        toJSON: () => ({}),
      } as DOMRect;

      const targets = calculateBracketTargets(
        narrowSearchBar,
        mockLeftBracketRect,
        mockRightBracketRect,
        0.14,
        160
      );

      // Right bracket should be further left than with wide search bar
      // (closer to center since bar is narrower)
      expect(targets.right.x).toBeLessThan(200); // Rough sanity check
    });
  });
});

describe('validateBracketPositions', () => {
  const mockTargets: BracketTargets = {
    left: { x: -100, y: -50, scale: 0.14 },
    right: { x: 200, y: 35, scale: 0.14 },
  };

  describe('drift detection', () => {
    it('returns valid when positions match exactly', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: -100, y: -50 },
        { x: 200, y: 35 },
        2
      );

      expect(result.isValid).toBe(true);
      expect(result.leftDrift).toBe(0);
      expect(result.rightDrift).toBe(0);
      expect(result.correction).toBeUndefined();
    });

    it('returns valid when within tolerance', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: -99, y: -49 }, // ~1.4px drift
        { x: 201, y: 36 }, // ~1.4px drift
        2
      );

      expect(result.isValid).toBe(true);
      expect(result.leftDrift).toBeLessThan(2);
      expect(result.rightDrift).toBeLessThan(2);
    });

    it('returns invalid when left bracket exceeds tolerance', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: -90, y: -40 }, // ~14px drift
        { x: 200, y: 35 }, // Exact match
        2
      );

      expect(result.isValid).toBe(false);
      expect(result.leftDrift).toBeGreaterThan(2);
      expect(result.rightDrift).toBe(0);
      expect(result.correction).toBeDefined();
    });

    it('returns invalid when right bracket exceeds tolerance', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: -100, y: -50 }, // Exact match
        { x: 210, y: 45 }, // ~14px drift
        2
      );

      expect(result.isValid).toBe(false);
      expect(result.leftDrift).toBe(0);
      expect(result.rightDrift).toBeGreaterThan(2);
    });

    it('returns invalid when both brackets exceed tolerance', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: -80, y: -30 }, // Large drift
        { x: 220, y: 55 }, // Large drift
        2
      );

      expect(result.isValid).toBe(false);
      expect(result.leftDrift).toBeGreaterThan(10);
      expect(result.rightDrift).toBeGreaterThan(10);
    });
  });

  describe('tolerance values', () => {
    it('uses default tolerance of 2px', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: -98, y: -48 }, // ~2.8px drift
        { x: 200, y: 35 }
        // No tolerance specified
      );

      expect(result.isValid).toBe(false);
    });

    it('respects custom tolerance', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: -98, y: -48 }, // ~2.8px drift
        { x: 200, y: 35 },
        5 // Higher tolerance
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe('correction values', () => {
    it('provides correction targets when invalid', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: 0, y: 0 }, // Way off
        { x: 0, y: 0 },
        2
      );

      expect(result.correction).toEqual(mockTargets);
    });

    it('does not provide correction when valid', () => {
      const result = validateBracketPositions(
        mockTargets,
        { x: -100, y: -50 },
        { x: 200, y: 35 },
        2
      );

      expect(result.correction).toBeUndefined();
    });
  });
});

describe('areBracketsInBounds', () => {
  const viewportWidth = 1024;
  const viewportHeight = 768;

  it('returns true for brackets within viewport', () => {
    const targets: BracketTargets = {
      left: { x: 100, y: 100, scale: 0.14 },
      right: { x: 800, y: 500, scale: 0.14 },
    };

    expect(areBracketsInBounds(targets, viewportWidth, viewportHeight)).toBe(true);
  });

  it('returns true for brackets within margin', () => {
    const targets: BracketTargets = {
      left: { x: -50, y: -50, scale: 0.14 }, // Within 100px margin
      right: { x: 1050, y: 800, scale: 0.14 }, // Within 100px margin
    };

    expect(areBracketsInBounds(targets, viewportWidth, viewportHeight, 100)).toBe(true);
  });

  it('returns false for brackets outside margin', () => {
    const targets: BracketTargets = {
      left: { x: -200, y: 100, scale: 0.14 }, // Outside 100px margin
      right: { x: 800, y: 500, scale: 0.14 },
    };

    expect(areBracketsInBounds(targets, viewportWidth, viewportHeight, 100)).toBe(false);
  });

  it('returns false when right bracket is out of bounds', () => {
    const targets: BracketTargets = {
      left: { x: 100, y: 100, scale: 0.14 },
      right: { x: 1500, y: 500, scale: 0.14 }, // Way outside
    };

    expect(areBracketsInBounds(targets, viewportWidth, viewportHeight, 100)).toBe(false);
  });

  it('respects custom margin', () => {
    const targets: BracketTargets = {
      left: { x: -150, y: 100, scale: 0.14 },
      right: { x: 800, y: 500, scale: 0.14 },
    };

    // Out of bounds with 100px margin
    expect(areBracketsInBounds(targets, viewportWidth, viewportHeight, 100)).toBe(false);

    // In bounds with 200px margin
    expect(areBracketsInBounds(targets, viewportWidth, viewportHeight, 200)).toBe(true);
  });
});
