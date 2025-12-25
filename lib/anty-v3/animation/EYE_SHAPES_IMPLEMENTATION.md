# Eye Shapes - New Implementation

## ✅ Completed: All Eye Shapes Updated

All eye shapes have been redesigned in Figma with compatible path structures for smooth morphing.

### Eye Shapes Available

| Shape | Size | Usage | Structure |
|-------|------|-------|-----------|
| IDLE | 20×45 | Default eye state | M, C, C, V, C, C, L |
| HAPPY | 20×24 | Smile eyes | M, C, C, V, C, C, L |
| LOOK | 23×28 | Looking left/right | M, C, C, V, C, C, L |
| HALF | 20×24 | Half-open (wink) | M, C, C, V, C, C, L |
| CLOSED | 23×6 | Closed eyes (blink) | M, C, C, V, C, C, L |
| ANGRY | 29×14 | Angry brows | M, C, C, V, C, C, L |
| SAD | 20×10 | Sad droopy eyes | M, C, C, V, C, C, L |
| OFF_LEFT | 32.373×56.47 | Logo triangle (left) | Different structure (OK) |
| OFF_RIGHT | 31.808×55.34 | Logo triangle (right) | Different structure (OK) |

**All shapes (except OFF) use the same M, C, C, V, C, C, L structure for smooth morphing!**

## Emotion Eye Mappings

### idle
- Left: IDLE
- Right: IDLE

### happy
- Left: HAPPY
- Right: HAPPY

### wink
- Left: CLOSED
- Right: HALF

### blink
- Left: CLOSED
- Right: CLOSED

### sad
- Left: SAD (rotate -15deg)
- Right: SAD (rotate -15deg, flip horizontal)

### mad/angry
- Left: ANGRY (rotate 20deg)
- Right: ANGRY (rotate 20deg, flip horizontal)

### idea & excited
- Left: IDLE (scale 1.3x)
- Right: IDLE (scale 1.3x)

### look-left
- Left: LOOK (positioned left)
- Right: LOOK (positioned left)

### look-right
- Left: LOOK (positioned right)
- Right: LOOK (positioned right)

## Implementation Notes

### Container Size
- Eye containers should be **20px × 45px** (IDLE baseline)
- SVG uses `preserveAspectRatio="none"` to scale content to fit

### Rotation & Flipping
- **SAD**: Rotate left eye -15deg, flip+rotate right eye
- **ANGRY**: Rotate left eye 20deg, flip+rotate right eye
- Rotation happens in GSAP animation, not in SVG paths

### Scaling
- **IDEA/EXCITED**: Apply `scaleX: 1.3, scaleY: 1.3` to both eyes
- Scaling happens in GSAP animation

### OFF State
- OFF shapes use different structure (triangles)
- Don't morph to OFF - use instant switch or fade transition

## Next Steps

1. ✅ Update eye-shapes.ts with new paths
2. ✅ Update EYE_DIMENSIONS
3. ⏳ Update container CSS to 20×45px baseline
4. ⏳ Update emotions.ts to use new shape names
5. ⏳ Add rotation transforms for SAD/ANGRY
6. ⏳ Add scaling for IDEA/EXCITED
7. ⏳ Test all morphing transitions
