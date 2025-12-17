# SVG Path Reference - Anty Character

## Source Files

### Original Logo
**File**: `/public/af-logo.svg`
**ViewBox**: `0 0 40 40`
**Fill**: `#052333` (SearchAF dark blue)

### Extracted Paths

The Anty character consists of 4 distinct SVG paths:

## Static Bracket Paths

These paths never change and form the outer square frame.

### Left Bracket (Bottom-Left)
```svg
<path d="M28.3149 6.96011H11.2167C8.86587 6.96012 6.96011 8.86587 6.9601 11.2167V28.3149L1.39945 33.8755C0.883015 34.392 0 34.0262 0 33.2958V11.2167C4.48304e-06 5.02189 5.02189 9.39218e-06 11.2167 0H33.2958C34.0262 0 34.3919 0.883017 33.8755 1.39945L28.3149 6.96011Z" />
```

**Visual Description**: L-shaped bracket forming bottom-left corner

**Key Points**:
- Starts at top-right of bracket
- Rounded corner at junction
- Extends to bottom-left
- Creates diagonal cut at corner

### Right Bracket (Top-Right)
```svg
<path d="M39.2842 28.0677C39.2842 34.2626 34.2623 39.2845 28.0674 39.2845H6.10853C5.37819 39.2845 5.01243 38.4015 5.52886 37.885L11.0896 32.3243H28.0674C30.4183 32.3243 32.324 30.4186 32.324 28.0677V11.0898L37.8847 5.5291C38.4012 5.01267 39.2842 5.37843 39.2842 6.10877V28.0677Z" />
```

**Visual Description**: L-shaped bracket forming top-right corner

**Key Points**:
- Mirrors left bracket
- Rounded corner at junction
- Extends to top-right
- Creates diagonal cut at corner

## Morphing Eye Paths

These paths change to create different expressions.

### Left Eye (Original Logo State)
```svg
<path d="M11.8783 15.1175C11.8806 14.4067 12.7401 14.0522 13.2428 14.5549L17.8625 19.1746C18.1747 19.4867 18.1747 19.9928 17.8625 20.3049L13.2134 24.9541C12.709 25.4584 11.8467 25.0996 11.8489 24.3863L11.8783 15.1175Z" />
```

**Visual Description**: Triangular shape pointing right/inward

**Coordinate Breakdown**:
- **Start**: (11.8783, 15.1175) - Top point
- **Control points**: Create curved triangular shape
- **End**: (11.8783, 15.1175) - Closes path
- **Bounding box**: ~X: 11.8-17.9, Y: 14.4-25.0

### Right Eye (Original Logo State)
```svg
<path d="M27.2721 24.5018C27.2698 25.2127 26.4103 25.5671 25.9076 25.0645L21.1775 20.3344C20.8653 20.0223 20.8653 19.5162 21.1775 19.2041L25.9377 14.4438C26.4421 13.9395 27.3044 14.2983 27.3022 15.0116L27.2721 24.5018Z" />
```

**Visual Description**: Triangular shape pointing left/inward (mirrors left eye)

**Coordinate Breakdown**:
- **Start**: (27.2721, 24.5018) - Bottom point
- **Control points**: Create curved triangular shape
- **End**: (27.2721, 24.5018) - Closes path
- **Bounding box**: ~X: 21.2-27.3, Y: 14.4-25.2

## Path Structure Analysis

### Common Pattern

All eye paths follow this structure:

```
M{x} {y}           // Move to starting point
C{cx1} {cy1}       // Cubic bezier control point 1
 {cx2} {cy2}       // Cubic bezier control point 2
 {x2} {y2}         // End point of curve
L{x3} {y3}         // Line to next point
C{cx3} {cy3}       // Another cubic bezier
 {cx4} {cy4}       // Control point 2
 {x4} {y4}         // End point
L{x5} {y5}         // Line to next point
C{cx5} {cy5}       // Final cubic bezier
 {cx6} {cy6}       // Control point 2
 {x6} {y6}         // End point
Z                  // Close path
```

### Morphing Compatibility

For smooth morphing, all expression variants maintain:

1. **Same number of path commands** (M, C, L, Z in same order)
2. **Same number of points** (coordinates change, structure stays)
3. **Similar point positions** (gradual changes, not jumps)
4. **Closed paths** (all start and end at same point)

## Expression Path Modifications

### Eye Position Modifications

| Expression | Y-Offset | Size Modifier | Special Changes |
|-----------|----------|---------------|-----------------|
| logo/idle | 0 | 1.0x | None (baseline) |
| happy | -1 to -2 | 1.1x | Eyes up, wider |
| sad | +1 to +2 | 0.9x | Eyes down, smaller |
| excited | -2 to -3 | 1.2x | Eyes up, much wider |
| tired | +1 to +2 | 0.8x | Eyes down, compressed |
| sleepy | +3 to +4 | 0.5x | Very compressed |
| blink | 0 | 0.1x (height) | Horizontal line |
| wink | 0 (left), 0 (right) | 1.0x (left), 0.1x (right) | Right eye closed |

### Horizontal Position Adjustments

| Expression | Left Eye X | Right Eye X | Purpose |
|-----------|-----------|-------------|----------|
| logo/idle | 11.9-17.9 | 21.2-27.3 | Centered |
| thinking | 11.9-17.9 | 21.2-27.3 | Same position |
| curious | 12.9-18.9 | 20.2-26.3 | Slightly offset |
| confused | 11.9-17.3 | 22.6-27.3 | Asymmetric |

### Special Shape Modifications

**Sick (Dizzy Eyes):**
- Irregular curves
- Slight rotation
- Asymmetric points

**Angry (Sharp Eyes):**
- More angular curves
- Inward-pointing tops
- Less rounded

**Proud (Confident Eyes):**
- Slightly narrowed
- Upper tilt
- Sharper top points

## Technical Specifications

### Coordinate System

```
(0,0) ───────────────────── (40,0)
  │                             │
  │    [Left Bracket]           │
  │                             │
  │  [Left Eye]   [Right Eye]   │
  │                             │
  │           [Right Bracket]   │
  │                             │
(0,40) ──────────────────── (40,40)
```

### Key Measurements

**Bracket Dimensions**:
- Thickness: ~5-6 units
- Corner radius: ~4 units
- Diagonal cut: ~6 units at 45°

**Eye Dimensions** (Normal State):
- Width: ~6 units
- Height: ~10 units
- Separation: ~3 units between eyes
- Distance from edges: ~12 units

**ViewBox Margins**:
- Top: ~6 units
- Bottom: ~7 units
- Left/Right: ~6 units

### Path Command Reference

| Command | Meaning | Usage in Anty |
|---------|---------|---------------|
| M | Move to | Start of each eye path |
| C | Cubic bezier curve | Smooth triangular curves |
| L | Line to | Sharp edges (rare) |
| Z | Close path | End of each path |
| H | Horizontal line | Not used (could optimize closed eyes) |
| V | Vertical line | Not used |

## Optimization Notes

### Path Simplification

Current paths use cubic bezier curves for smooth shapes. Potential optimizations:

1. **Closed eyes**: Could use `M x y H x2` instead of full cubic curves
2. **Sharp expressions**: Could mix `L` (line) with `C` (curve) commands
3. **Coordinate precision**: Currently ~4 decimal places, could round to 2

### File Size

Current path lengths:
- Left bracket: ~285 characters
- Right bracket: ~315 characters
- Left eye: ~185 characters
- Right eye: ~195 characters

**Total per expression**: ~980 characters
**All 15 expressions**: ~14.7 KB (uncompressed)

With gzip: ~3-4 KB

## Validation Checklist

### Path Integrity

- [ ] All paths start with `M` (move to)
- [ ] All paths end with `Z` (close path)
- [ ] No negative coordinates (except relative commands)
- [ ] All coordinates within 0-40 viewBox
- [ ] No duplicate consecutive points
- [ ] Paths wind clockwise (for consistent fills)

### Morphing Compatibility

- [ ] Same number of path commands in source and target
- [ ] Same command types in same order (M, C, L, Z match)
- [ ] Point positions change gradually (no large jumps)
- [ ] Similar path complexity (avoid simple→complex morphs)

### Visual Quality

- [ ] No self-intersecting paths
- [ ] Smooth curves (no sharp kinks)
- [ ] Symmetric expressions are truly symmetric
- [ ] Paths render correctly at all scales
- [ ] Consistent stroke/fill rendering

## SVG Export Settings (for Future Figma Exports)

If re-exporting from Figma:

1. **Format**: SVG
2. **Precision**: 4 decimal places
3. **Outline strokes**: Yes (convert to paths)
4. **Simplify strokes**: No (preserve curve detail)
5. **Flatten transforms**: Yes
6. **Use absolute coordinates**: Yes (not relative)
7. **Minify**: No (keep readable)
8. **Include ID attributes**: No
9. **Use `<path>` elements**: Yes (not polygons)

## Testing SVG Paths

### Browser Console Test

```javascript
// Test if path is valid
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path.setAttribute('d', 'M11.8783 15.1175C11.8806...');
console.log(path.getTotalLength()); // Should return number, not NaN
```

### React Component Test

```tsx
<svg viewBox="0 0 40 40" width="200" height="200">
  <path d={leftEye} fill="#052333" />
  <path d={rightEye} fill="#052333" />
</svg>
```

### Animation Test

```css
@keyframes morph {
  from { d: path("M11.8783 15.1175..."); }
  to { d: path("M11.8783 14.1175..."); }
}

.eye {
  animation: morph 1s ease-in-out infinite alternate;
}
```

Note: CSS `d` property animation requires browser support or polyfill.

## Version History

- **v1.0**: Initial extraction from af-logo.svg
- **v1.1**: Added 15 expression variants
- **v1.2**: Optimized path coordinates
- **Future**: Consider adding particle effects, color variants
