# IDLE Animation Baseline Values
**Date:** 2025-12-22
**Test:** Fresh page load, no power on/off operations
**Sequence:** "IDLE" (green text in debug overlay)

## Observed Ranges (Fresh Load - PERFECT IDLE)

```
Rotation:     0.000° to ~1.7° (yoyo: 0 → 1.7 → 0)
Scale:        1.0000 to ~1.017 (yoyo: 1.0 → 1.017 → 1.0)
Width:        160.0px to ~167px (varies with scale)
Height:       160.0px to ~167px (varies with scale)
Shadow Width: ~116px to ~157px (inverse to character Y position)
```

## Key Observations

- **Scale oscillates: 1.0000 → 1.017 → 1.0000** (yoyo animation, NEVER exceeds ~1.017)
- **Rotation oscillates: 0.000° → ~1.7° → 0.000°** (yoyo animation)
- **Animation uses yoyo: true** so it returns to starting values
- **Sequence shows "IDLE"** (not "CONTROLLER: Idle animation")
- **This is the PERFECT baseline** - controller idle must match these exact ranges

## Critical Requirement

The new animation controller's idle animation MUST produce these EXACT observable values.
Any deviation (especially scale exceeding 1.017) indicates the controller is broken.

---

## Position Tracking Baseline System

**Updated:** 2025-12-22

### Overview

The position tracker now uses a **baseline reference system** (0,0,0) to track Anty's position deviations instead of absolute screen coordinates.

### How It Works

1. **Baseline Position**: Set when the position tracker first starts, or manually reset using the "🎯 RESET" button
2. **Deviation Tracking**: All positions are reported as Δx and Δy (deviation from baseline)
3. **Window Resize Fix**: Because we track deviations, window resizing no longer triggers false "movement" reports

### Benefits

- **Stable Reference**: Anty's position is always relative to a fixed point
- **Window Resize Immunity**: Resizing the browser window doesn't affect position tracking
- **Clear Deviation Values**: Easy to see how much Anty has moved from the baseline
- **Manual Reset**: Can reset the baseline at any time to recalibrate

### Usage

1. Open the Position Tracker (📊 button in debug panel)
2. The baseline is automatically set to Anty's current position when tracker opens
3. Click "🎯 RESET" in the tracker header to reset baseline to current position
4. Deviation values (Δx, Δy) are shown in the live plot
