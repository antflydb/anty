/**
 * Animation Constants for Anty V3
 *
 * This file is the SINGLE SOURCE OF TRUTH for all animation timings,
 * durations, scales, distances, and easing functions in the Anty character system.
 *
 * WARNING: Many of these values are carefully tuned and work in coordination.
 * Changing values marked as CRITICAL may break visual coherence.
 *
 * @module animation/constants
 */

// ============================================================================
// IDLE BREATHING ANIMATIONS
// ============================================================================

/**
 * Idle floating animation - character gently bobs up and down
 *
 * CRITICAL: This duration is synchronized with rotation animation.
 * DO NOT change without updating rotation.duration to match.
 */
export const IDLE_FLOAT = {
  /** Vertical floating distance in pixels */
  amplitude: 12,
  /** Animation duration in seconds - MUST match rotation duration */
  duration: 2.5,
  /** GSAP easing function for smooth sine wave motion */
  ease: 'sine.inOut',
} as const;

/**
 * Idle rotation animation - character gently tilts side to side
 *
 * CRITICAL: This is SYNCHRONIZED with floating animation.
 * Both animations share the same duration and ease for visual harmony.
 */
export const IDLE_ROTATION = {
  /** Maximum rotation angle in degrees (0° to 2°) */
  degrees: 2.0,
  /** Animation duration in seconds - MUST match float duration */
  duration: 2.5,
  /** GSAP easing function - MUST match float ease */
  ease: 'sine.inOut',
  /** Whether rotation is synchronized with floating */
  synchronized: true,
} as const;

/**
 * Idle breathing scale animation - character subtly expands/contracts
 *
 * This runs independently from float/rotation and is slightly slower
 * to create organic, non-mechanical movement.
 */
export const IDLE_BREATHE = {
  /** Minimum scale during breathing cycle */
  scaleMin: 1.0,
  /** Maximum scale during breathing cycle */
  scaleMax: 1.02,
  /** Animation duration in seconds */
  duration: 3,
  /** GSAP easing function */
  ease: 'sine.inOut',
} as const;

/**
 * Idle animation start delays
 *
 * Controls when idle animations begin after wake-up or other transitions.
 */
export const IDLE_DELAYS = {
  /** Delay after initial page load (seconds) */
  initialLoad: 0.2,
  /** Delay after wake-up animation completes (seconds) */
  afterWakeUp: 0.65,
} as const;

// ============================================================================
// SHADOW ANIMATION (INVERSE RELATIONSHIP)
// ============================================================================

/**
 * Shadow animations - inverse relationship with character position
 *
 * CRITICAL INVERSE RELATIONSHIP:
 * When character floats UP, shadow scales DOWN and fades.
 * When character drops DOWN, shadow scales UP and becomes more opaque.
 * Shadow position is FIXED on ground - only scale and opacity animate.
 */
export const SHADOW = {
  /** Shadow horizontal scale when character is at apex (floating up) */
  scaleXWhenUp: 0.7,
  /** Shadow vertical scale when character is at apex (floating up) */
  scaleYWhenUp: 0.55,
  /** Shadow opacity when character is at apex (floating up) */
  opacityWhenUp: 0.2,
  /** Shadow horizontal scale when character is at ground (normal) */
  scaleXWhenDown: 1.0,
  /** Shadow vertical scale when character is at ground (normal) */
  scaleYWhenDown: 1.0,
  /** Shadow opacity when character is at ground (normal) */
  opacityWhenDown: 0.7,
  /** Shadow horizontal position (xPercent) - NEVER changes */
  xPercent: -50,
  /** Animation duration matches idle float (seconds) - MUST match IDLE_FLOAT.duration */
  duration: 2.5,
  /** GSAP easing function matches idle float */
  ease: 'sine.inOut',
} as const;

// ============================================================================
// GLOW COORDINATION (75% DISTANCE + 0.05s LAG)
// ============================================================================

/**
 * Glow animation coordination formula
 *
 * CRITICAL COORDINATION FORMULA:
 * - Glows travel 75% of character's distance
 * - Glows start 0.05s AFTER character begins moving
 *
 * Example: If character jumps -70px up:
 * - Glows jump -52.5px up (-70 * 0.75)
 * - Glows start 0.05s after character
 *
 * This creates a "trailing" effect that makes the glow feel ethereal
 * and connected to the character without being rigidly attached.
 *
 * WARNING: DO NOT CHANGE these values without extensive visual testing.
 * The 75%/0.05s formula is the result of careful tuning.
 */
export const GLOW_COORDINATION = {
  /** Distance multiplier - glows travel 75% of character distance */
  distanceMultiplier: 0.75,
  /** Time lag in seconds - glows start 0.05s after character */
  lag: 0.05,
} as const;

/**
 * Glow ghostly idle movement
 *
 * Random floating movement when in idle mode (not searching, not in game).
 * Creates subtle organic motion that makes the glow feel alive.
 */
export const GLOW_GHOSTLY = {
  /** Random Y offset range in pixels */
  yRange: { min: -8, max: -16 },
  /** Random X offset range in pixels */
  xRange: { min: -6, max: 6 },
  /** Random scale range */
  scaleRange: { min: 0.98, max: 1.05 },
  /** Random opacity range */
  opacityRange: { min: 0.7, max: 1.0 },
  /** Random duration range for outward movement (seconds) */
  outwardDuration: { min: 2.2, max: 3.5 },
  /** Random duration range for return movement (seconds) */
  returnDuration: { min: 2.0, max: 3.2 },
  /** Base return values */
  returnBase: {
    yRange: { min: -2, max: 2 },
    xRange: { min: -2, max: 2 },
    scaleRange: { min: 0.95, max: 1.02 },
    opacityRange: { min: 0.8, max: 0.95 },
  },
} as const;

// ============================================================================
// EYE ANIMATIONS
// ============================================================================

/**
 * Blink animation timings
 *
 * Single blink: close (100ms) → open (150ms)
 * Double blink: close → open → pause (100ms) → close → open
 */
export const BLINK = {
  /** Duration of eye closing animation (seconds) */
  closeDuration: 0.1,
  /** Duration of eye opening animation (seconds) */
  openDuration: 0.15,
  /** Vertical scale when eyes are closed (nearly flat) */
  scaleYClosed: 0.05,
  /** GSAP easing for closing */
  closeEase: 'power2.in',
  /** GSAP easing for opening */
  openEase: 'power2.out',
} as const;

/**
 * Double blink animation timings
 *
 * Slightly faster than single blink for snappier feel.
 */
export const DOUBLE_BLINK = {
  /** Duration of eye closing animation (seconds) */
  closeDuration: 0.08,
  /** Duration of eye opening animation (seconds) */
  openDuration: 0.12,
  /** Pause between first and second blink (seconds) */
  pauseDuration: 0.1,
  /** Vertical scale when eyes are closed */
  scaleYClosed: 0.05,
  /** GSAP easing for closing */
  closeEase: 'power2.in',
  /** GSAP easing for opening */
  openEase: 'power2.out',
} as const;

/**
 * Blink permission system
 *
 * Controls when automatic blinking is allowed based on current expression.
 */
export const BLINK_PERMISSION = {
  /** Delay before re-enabling blinking after returning to idle (milliseconds) */
  reEnableDelay: 300,
} as const;

/**
 * Shocked expression - eyes grow larger
 *
 * Quick snap to shocked state when surprised or startled.
 */
export const SHOCKED_EYES = {
  /** Scale multiplier for shocked eyes (both X and Y) */
  scale: 1.4,
  /** Animation duration (seconds) */
  duration: 0.1,
  /** GSAP easing function */
  ease: 'power2.out',
} as const;

/**
 * Idea expression - eyes look up and grow slightly
 *
 * "Lightbulb moment" animation.
 */
export const IDEA_EYES = {
  /** Scale multiplier for idea eyes (both X and Y) */
  scale: 1.15,
  /** Vertical offset in pixels (negative = up) */
  yOffset: -8,
  /** Animation duration (seconds) */
  duration: 0.1,
  /** GSAP easing function */
  ease: 'power2.out',
} as const;

/**
 * Eye reset animation
 *
 * Used when returning from shocked/idea/look states back to idle.
 * Very fast to avoid visible flashing.
 */
export const EYE_RESET = {
  /** Reset animation duration (seconds) */
  duration: 0.05,
  /** GSAP easing function */
  ease: 'power2.out',
} as const;

/**
 * Look left/right animation - eyes morph and move
 *
 * Eyes morph from tall vertical pills to shorter horizontal pills
 * and move left or right with bunching effect (eyes move closer together).
 */
export const LOOK_ANIMATION = {
  /** Height of looking eye in pixels */
  height: 33,
  /** Width of looking eye in pixels */
  width: 20,
  /** Height of idle eye in pixels */
  idleHeight: 44.52,
  /** Width of idle eye in pixels */
  idleWidth: 18.63,
  /** Horizontal movement distance in pixels */
  xOffset: 12,
  /** Additional movement for bunching eyes closer together in pixels */
  bunch: 4,
  /** Animation duration (seconds) - smooth morph */
  duration: 0.25,
  /** Delay before starting cross-fade (seconds) */
  crossfadeDelay: 0.05,
  /** GSAP easing function */
  ease: 'power2.out',
} as const;

/**
 * SVG path data for eye morphing
 *
 * Used for morphing between idle and looking eye shapes.
 */
export const EYE_PATHS = {
  /** Idle eye - tall vertical pill (23.29 × 55.65) */
  IDLE: "M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z",
  /** Looking eye - shorter, wider pill (26 × 43) */
  LOOKING: "M8.24203e-05 29.9999C3.6901e-05 37.1796 5.82038 43 13.0001 42.9999C20.1798 42.9999 26 37.1796 26 30V12.9999C26 5.82023 20.1798 -1.58161e-06 13.0001 -1.58161e-06C5.82049 -1.58161e-06 0.000235718 5.82023 0.0001902 12.9999L8.24203e-05 29.9999Z",
} as const;

// ============================================================================
// EMOTION ANIMATIONS
// ============================================================================

/**
 * Excited animation - backflip jump with fireworks
 *
 * Multi-stage jump animation with particle burst.
 * Glows follow with 75% distance and 0.05s lag formula.
 */
export const EXCITED = {
  /** First jump height in pixels (negative = up) */
  jump1: -70,
  /** First jump duration (seconds) */
  jump1Duration: 0.5,
  /** First jump ease */
  jump1Ease: 'power2.out',
  /** Hold at apex duration (seconds) */
  holdDuration: 0.3,
  /** Drop duration after first jump (seconds) */
  drop1Duration: 0.45,
  /** Drop ease */
  drop1Ease: 'power1.inOut',
  /** Second jump height in pixels */
  jump2: -25,
  /** Second jump duration (seconds) */
  jump2Duration: 0.18,
  /** Third jump height in pixels */
  jump3: -18,
  /** Third jump duration (seconds) */
  jump3Duration: 0.15,
  /** Rotation during backflip (degrees) */
  rotation: 360,
  /** Rotation duration (seconds) */
  rotationDuration: 0.5,
  /** Fireworks particle count */
  fireworksCount: 40,
  /** Fireworks colors (purple theme) */
  fireworksColors: [
    '#8B5CF6', // violet-500
    '#A78BFA', // violet-400
    '#C4B5FD', // violet-300
    '#DDD6FE', // violet-200
  ],
} as const;

/**
 * Spin animation - Y-axis spin jump
 *
 * Character spins around vertical axis while jumping.
 */
export const SPIN = {
  /** Jump height in pixels (negative = up) */
  jumpHeight: -70,
  /** Jump up duration (seconds) */
  jumpUpDuration: 0.3,
  /** Jump up ease */
  jumpUpEase: 'power2.out',
  /** Rotation degrees (Y-axis) */
  rotationY: 360,
  /** Rotation duration (seconds) */
  rotationDuration: 0.7,
  /** Rotation ease */
  rotationEase: 'power1.inOut',
  /** Drop duration (seconds) */
  dropDuration: 0.35,
  /** Drop ease */
  dropEase: 'power2.in',
  /** Total animation duration before reset (milliseconds) */
  totalDuration: 4000,
} as const;

/**
 * Nod animation - vertical head bob (yes/affirm)
 *
 * Quick downward nod and return to normal.
 */
export const NOD = {
  /** Jump height in pixels (negative = up) */
  jumpHeight: -30,
  /** Jump duration (seconds) */
  jumpDuration: 0.2,
  /** Jump ease */
  jumpEase: 'power2.out',
  /** Return duration (seconds) */
  returnDuration: 0.5,
  /** Return ease */
  returnEase: 'power1.inOut',
  /** Body bracket movement in pixels */
  bodyMovement: 3,
  /** Body movement duration (seconds) */
  bodyDuration: 0.15,
  /** Body ease */
  bodyEase: 'power2.inOut',
  /** Total animation duration before reset (milliseconds) */
  totalDuration: 1400,
} as const;

/**
 * Headshake animation - horizontal head shake (no/deny)
 *
 * Shake left and right 3 times.
 */
export const HEADSHAKE = {
  /** Shake amplitude in degrees */
  rotationDegrees: 8,
  /** Single shake duration (seconds) */
  shakeDuration: 0.15,
  /** Number of shakes */
  shakeCount: 3,
  /** Shake ease */
  shakeEase: 'power2.inOut',
} as const;

/**
 * Happy animation - sustained hover with gentle sway
 *
 * Character floats slightly higher with subtle side-to-side motion.
 */
export const HAPPY = {
  /** Hover height in pixels (negative = up) */
  hoverHeight: -10,
  /** Hover duration (seconds) */
  hoverDuration: 0.4,
  /** Hover ease */
  hoverEase: 'power2.out',
} as const;

/**
 * Sad animation - droop down with scale reduction
 *
 * Character drops and shrinks slightly to convey sadness.
 */
export const SAD = {
  /** Droop distance in pixels (positive = down) */
  droopDistance: 10,
  /** Scale reduction during sadness */
  scale: 0.9,
  /** Droop duration (seconds) */
  droopDuration: 0.6,
  /** Droop ease */
  droopEase: 'power2.out',
  /** Return duration (seconds) */
  returnDuration: 0.4,
  /** Return ease */
  returnEase: 'power2.in',
  /** Total animation duration before reset (milliseconds) */
  totalDuration: 1500,
} as const;

/**
 * Angry animation - drop and shake
 *
 * Character drops down and shakes horizontally to show anger.
 */
export const ANGRY = {
  /** Drop distance in pixels (positive = down) */
  dropDistance: 15,
  /** Drop duration (seconds) */
  dropDuration: 0.6,
  /** Drop ease */
  dropEase: 'power2.out',
  /** Shake amplitude in degrees */
  shakeDegrees: 8,
  /** Single shake duration (seconds) */
  shakeDuration: 0.15,
  /** Number of shakes */
  shakeCount: 3,
  /** Shake ease */
  shakeEase: 'power2.inOut',
  /** Return duration (seconds) */
  returnDuration: 0.5,
  /** Return ease */
  returnEase: 'power2.in',
  /** Total animation duration before reset (milliseconds) */
  totalDuration: 6000,
} as const;

/**
 * Wink animation - subtle tilt and hold
 *
 * Character tilts slightly during wink expression.
 */
export const WINK = {
  /** Tilt rotation in degrees (negative = counterclockwise) */
  rotation: -3,
  /** Bounce height in pixels (negative = up) */
  bounceHeight: -5,
  /** Tilt/bounce duration (seconds) */
  tiltDuration: 0.15,
  /** Tilt ease */
  tiltEase: 'power2.out',
  /** Hold duration at wink pose (seconds) */
  holdDuration: 0.4,
  /** Return to normal duration (seconds) */
  returnDuration: 0.2,
  /** Return ease */
  returnEase: 'power2.out',
  /** Sparkle particle count */
  sparkleCount: 4,
  /** Sparkle spawn delay between particles (milliseconds) */
  sparkleDelay: 50,
  /** Right eye position offset for sparkle spawn */
  sparklePosition: {
    x: 22,
    y: -20,
  },
} as const;

// ============================================================================
// POWER ANIMATIONS (WAKE-UP & POWER-OFF)
// ============================================================================

/**
 * Wake-up animation - OFF → ON transition
 *
 * CRITICAL SEQUENCE:
 * 1. Jump up to apex (0.2s) with controlled rise
 * 2. Tiny hang at apex (0.05s) - just a breath
 * 3. Drop down faster (0.3s)
 *
 * Glows and shadow follow with coordination formulas.
 */
export const WAKE_UP = {
  /** Jump height in pixels (negative = up) */
  jumpHeight: -45,
  /** Jump up duration (seconds) */
  jumpUpDuration: 0.2,
  /** Jump up ease */
  jumpUpEase: 'power2.out',
  /** Hang at apex duration (seconds) */
  hangDuration: 0.05,
  /** Drop duration (seconds) */
  dropDuration: 0.3,
  /** Drop ease */
  dropEase: 'power2.in',
  /** Character scale during wake-up */
  scale: 1.0,
  /** Glow/shadow scale before wake-up (shrunk) */
  glowScaleBefore: 0.65,
  /** Glow/shadow scale after wake-up (normal) */
  glowScaleAfter: 1.0,
  /** Glow fade-in duration (seconds) - slower than movement */
  glowFadeDuration: 0.6,
  /** Glow fade ease */
  glowFadeEase: 'power1.in',
  /** Shadow fade-in duration (seconds) */
  shadowFadeDuration: 0.55,
  /** Shadow fade ease */
  shadowFadeEase: 'power1.in',
} as const;

/**
 * Power-off animation - ON → OFF transition
 *
 * CRITICAL SEQUENCE:
 * 1. Brief hover (150ms) - character lifts slightly
 * 2. Dramatic snap down (100ms) - FAST exponential drop
 * 3. Eyes morph to triangles (60ms) - at apex of snap
 * 4. Shadow/glows fade out (60ms) - at end of snap
 *
 * Total duration: ~600ms
 */
export const POWER_OFF = {
  /** Hover height in pixels (negative = up) */
  hoverHeight: -15,
  /** Hover duration (seconds) */
  hoverDuration: 0.15,
  /** Hover ease */
  hoverEase: 'power2.out',
  /** Snap down distance in pixels (positive = down) */
  snapDistance: 50,
  /** Snap duration (seconds) */
  snapDuration: 0.1,
  /** Snap ease - exponential for dramatic effect */
  snapEase: 'expo.in',
  /** Character scale during power-off */
  scale: 1.0,
  /** Glow/shadow scale during power-off (shrunk) */
  glowScaleOff: 0.65,
  /** Eye morph duration (seconds) */
  eyeMorphDuration: 0.06,
  /** Eye morph ease */
  eyeMorphEase: 'power2.in',
  /** Glow/shadow fade-out duration (seconds) */
  fadeOutDuration: 0.06,
  /** Fade-out ease */
  fadeOutEase: 'power2.in',
  /** Character opacity when OFF */
  opacityOff: 0.25,
  /** Eye morph delay from snap start (milliseconds) */
  eyeMorphDelay: 540,
  /** Glow/shadow fade delay from animation start (milliseconds) */
  fadeOutDelay: 600,
} as const;

// ============================================================================
// SEARCH MODE ANIMATIONS
// ============================================================================

/**
 * Search morph animation - Character → Search Bar
 *
 * Multi-step transformation with careful timing coordination.
 */
export const SEARCH_MORPH_IN = {
  /** Eyes fade out duration (seconds) */
  eyesFadeOut: 0.2,
  /** Eyes fade ease */
  eyesFadeEase: 'power2.in',
  /** Body brackets move to edges duration (seconds) */
  bracketsMoveDuration: 0.35,
  /** Body brackets move ease */
  bracketsMoveEase: 'power2.inOut',
  /** Left bracket target X position (pixels) */
  leftBracketX: -240,
  /** Right bracket target X position (pixels) */
  rightBracketX: 240,
  /** Search bar fade-in duration (seconds) */
  barFadeIn: 0.25,
  /** Search bar fade-in ease */
  barFadeEase: 'power2.out',
  /** Search bar fade-in delay from animation start (seconds) */
  barFadeDelay: 0.2,
  /** Border gradient fade-in duration (seconds) */
  borderFadeIn: 0.45,
  /** Border gradient fade-in ease */
  borderFadeEase: 'power2.out',
  /** Border gradient fade-in delay from animation start (seconds) */
  borderFadeDelay: 0.42,
  /** Placeholder fade-in duration (seconds) */
  placeholderFadeIn: 0.45,
  /** Placeholder fade-in ease */
  placeholderFadeEase: 'power2.out',
  /** Placeholder fade-in delay from animation start (seconds) */
  placeholderFadeDelay: 0.42,
  /** Placeholder blur amount during morph (pixels) */
  placeholderBlur: 8,
  /** Placeholder Y offset during morph (pixels) */
  placeholderY: -8,
  /** CMD+K indicator fade-in duration (seconds) */
  kbdFadeIn: 0.45,
  /** CMD+K indicator fade-in ease */
  kbdFadeEase: 'power2.out',
  /** CMD+K indicator fade-in delay from animation start (seconds) */
  kbdFadeDelay: 0.42,
  /** Large search glow appears delay from animation start (seconds) */
  glowAppearDelay: 0.25,
} as const;

/**
 * Search AI gradient glow animation
 *
 * Animated gradient behind search bar with breathing effect.
 */
export const SEARCH_GLOW = {
  /** Initial opacity */
  opacityInitial: 0,
  /** Final opacity after fade-in */
  opacityFinal: 1.0,
  /** Initial scale */
  scaleInitial: 0.95,
  /** Final scale after fade-in */
  scaleFinal: 1.0,
  /** Fade-in duration (seconds) */
  fadeInDuration: 0.4,
  /** Fade-in ease */
  fadeInEase: 'power2.out',
  /** Fade-in delay from search morph start (seconds) */
  fadeInDelay: 0.85,
  /** Breathing animation scale target */
  breatheScale: 1.12,
  /** Breathing animation opacity target */
  breatheOpacity: 0.7,
  /** Breathing animation duration (seconds) */
  breatheDuration: 2.0,
  /** Breathing animation ease */
  breatheEase: 'sine.inOut',
  /** Breathing animation repeat */
  breatheRepeat: -1,
  /** Breathing animation yoyo */
  breatheYoyo: true,
} as const;

/**
 * Search morph animation - Search Bar → Character
 *
 * Reverse transformation back to character state.
 */
export const SEARCH_MORPH_OUT = {
  /** Border gradient fade-out duration (seconds) */
  borderFadeOut: 0.15,
  /** Border gradient fade-out ease */
  borderFadeEase: 'power2.in',
  /** Placeholder/KBD fade-out duration (seconds) */
  uiFadeOut: 0.25,
  /** Placeholder/KBD fade-out ease */
  uiFadeEase: 'power2.in',
  /** Placeholder/KBD Y offset during morph (pixels) */
  uiY: -6,
  /** Placeholder/KBD blur during morph (pixels) */
  uiBlur: 6,
  /** Search glow crossfade duration (seconds) */
  glowCrossfade: 0.35,
  /** Search glow crossfade ease */
  glowCrossfadeEase: 'power2.inOut',
  /** Search glow scale during fade-out */
  glowScaleOut: 0.85,
  /** Search glow crossfade delay from animation start (seconds) */
  glowCrossfadeDelay: 0.15,
  /** Search bar fade-out duration (seconds) */
  barFadeOut: 0.3,
  /** Search bar fade-out ease */
  barFadeEase: 'power2.in',
  /** Search bar fade-out delay from animation start (seconds) */
  barFadeDelay: 0.15,
  /** Brackets return duration (seconds) */
  bracketsReturn: 0.35,
  /** Brackets return ease */
  bracketsReturnEase: 'power2.inOut',
  /** Brackets return delay from animation start (seconds) */
  bracketsReturnDelay: 0.3,
  /** Brackets tiny leap distance (pixels, negative = up) */
  bracketsLeap: -8,
  /** Brackets leap duration (seconds) */
  bracketsLeapDuration: 0.12,
  /** Brackets leap ease */
  bracketsLeapEase: 'power2.out',
  /** Brackets settle duration (seconds) */
  bracketsSettleDuration: 0.17,
  /** Brackets settle ease */
  bracketsSettleEase: 'power2.in',
  /** Brackets leap delay from return start (seconds) */
  bracketsLeapDelay: 0.55,
  /** Eyes fade-in duration (seconds) */
  eyesFadeIn: 0.3,
  /** Eyes fade-in ease */
  eyesFadeEase: 'power2.out',
  /** Eyes fade-in delay from animation start (seconds) */
  eyesFadeDelay: 0.67,
  /** Orb glows fade-in duration (seconds) */
  orbGlowsFadeIn: 0.4,
  /** Orb glows fade-in ease */
  orbGlowsFadeEase: 'power2.out',
  /** Orb glows fade-in delay from animation start (seconds) */
  orbGlowsFadeDelay: 0.48,
  /** Hide search glow canvas delay from animation start (seconds) */
  hideGlowDelay: 0,
  /** Total morph duration for state reset (seconds) */
  totalDuration: 0.72,
} as const;

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

/**
 * Heart particle configuration
 *
 * Used for love/feeding animations.
 */
export const PARTICLE_HEART = {
  /** Horizontal velocity range (pixels/second) */
  velocityX: { min: -30, max: 30 },
  /** Vertical velocity range (pixels/second) */
  velocityY: { min: -80, max: -120 },
  /** Particle lifetime (milliseconds) */
  lifetime: 2000,
  /** Gravity acceleration factor */
  gravity: 0.5,
  /** Opacity fade start (percentage of lifetime) */
  fadeStart: 0.6,
  /** Initial scale range */
  scaleRange: { min: 0.5, max: 0.8 },
  /** Rotation speed range (degrees/second) */
  rotationSpeed: { min: -45, max: 45 },
} as const;

/**
 * Sparkle particle configuration
 *
 * Used for wink and magic effects.
 */
export const PARTICLE_SPARKLE = {
  /** Horizontal velocity range (pixels/second) */
  velocityX: { min: -50, max: 50 },
  /** Vertical velocity range (pixels/second) */
  velocityY: { min: -60, max: -100 },
  /** Particle lifetime (milliseconds) */
  lifetime: 1500,
  /** Gravity acceleration factor */
  gravity: 0.3,
  /** Opacity fade start (percentage of lifetime) */
  fadeStart: 0.5,
  /** Initial scale range */
  scaleRange: { min: 0.5, max: 0.9 },
  /** Rotation speed range (degrees/second) */
  rotationSpeed: { min: -180, max: 180 },
} as const;

/**
 * Sweat particle configuration
 *
 * Used for stress/worry effects.
 */
export const PARTICLE_SWEAT = {
  /** Horizontal velocity range (pixels/second) */
  velocityX: { min: -20, max: 20 },
  /** Vertical velocity range (pixels/second) */
  velocityY: { min: 0, max: 20 },
  /** Particle lifetime (milliseconds) */
  lifetime: 1200,
  /** Gravity acceleration factor (positive = falls) */
  gravity: 1.5,
  /** Opacity fade start (percentage of lifetime) */
  fadeStart: 0.7,
  /** Initial scale range */
  scaleRange: { min: 0.4, max: 0.6 },
  /** Rotation speed range (degrees/second) */
  rotationSpeed: { min: 0, max: 0 },
} as const;

/**
 * ZZZ particle configuration
 *
 * Used for sleep/tired effects.
 */
export const PARTICLE_ZZZ = {
  /** Horizontal velocity range (pixels/second) */
  velocityX: { min: 10, max: 30 },
  /** Vertical velocity range (pixels/second) */
  velocityY: { min: -40, max: -60 },
  /** Particle lifetime (milliseconds) */
  lifetime: 2500,
  /** Gravity acceleration factor (negative = floats up) */
  gravity: -0.2,
  /** Opacity fade start (percentage of lifetime) */
  fadeStart: 0.7,
  /** Initial scale range */
  scaleRange: { min: 0.6, max: 0.9 },
  /** Rotation speed range (degrees/second) */
  rotationSpeed: { min: -20, max: 20 },
} as const;

/**
 * Confetti particle configuration
 *
 * Used for celebration/excited effects.
 */
export const PARTICLE_CONFETTI = {
  /** Horizontal velocity range (pixels/second) */
  velocityX: { min: -150, max: 150 },
  /** Vertical velocity range (pixels/second) */
  velocityY: { min: -300, max: -150 },
  /** Particle lifetime (milliseconds) */
  lifetime: 3000,
  /** Gravity acceleration factor (positive = falls) */
  gravity: 250,
  /** Opacity fade start (percentage of lifetime) */
  fadeStart: 0.8,
  /** Initial scale range */
  scaleRange: { min: 0.6, max: 1.2 },
  /** Rotation speed range (degrees/second) */
  rotationSpeed: { min: -360, max: 360 },
} as const;

/**
 * Love hearts animation configuration
 *
 * Purple heart SVGs radiating outward from character.
 */
export const LOVE_HEARTS = {
  /** Number of hearts to spawn */
  count: 8,
  /** Delay between each heart spawn (milliseconds) */
  spawnDelay: 80,
  /** Radiate distance range (pixels) */
  distanceRange: { min: 60, max: 100 },
  /** Initial scale */
  scaleInitial: 0.5,
  /** Final scale during radiate */
  scaleFinal: 1.0,
  /** Initial opacity */
  opacityInitial: 0,
  /** Final opacity during radiate */
  opacityFinal: 1.0,
  /** Radiate out duration (seconds) */
  radiateOutDuration: 0.4,
  /** Radiate out ease */
  radiateOutEase: 'power2.out',
  /** Fade out scale */
  fadeOutScale: 0.3,
  /** Fade out duration (seconds) */
  fadeOutDuration: 0.3,
  /** Fade out ease */
  fadeOutEase: 'power2.in',
} as const;

/**
 * Food emoji implosion configuration
 *
 * Flying emojis converging INTO Anty during feeding.
 */
export const FOOD_IMPLOSION = {
  /** Number of emoji particles */
  count: 60,
  /** Font size range (pixels) */
  fontSizeRange: { min: 32, max: 56 },
  /** Starting distance from screen center (pixels) */
  startDistanceRange: { min: 400, max: 800 },
  /** Flight duration range (seconds) */
  durationRange: { min: 0.8, max: 1.4 },
  /** Initial scale */
  scaleInitial: 0.3,
  /** Final scale range */
  scaleRange: { min: 0.8, max: 1.3 },
  /** Initial opacity */
  opacityInitial: 0,
  /** Final opacity */
  opacityFinal: 1.0,
  /** Initial rotation range (degrees) */
  rotationInitialRange: { min: -180, max: 180 },
  /** Final rotation range (degrees) */
  rotationFinalRange: { min: 180, max: 540 },
  /** Flight ease */
  flightEase: 'power2.in',
  /** Absorption fade duration (seconds) */
  absorbDuration: 0.15,
  /** Absorption ease */
  absorbEase: 'power4.in',
  /** Stagger delay between particles (seconds) */
  staggerDelay: 0.01,
  /** Available food emojis */
  emojis: ['🧁', '🍪', '🍩', '🍰', '🎂', '🍬', '🍭', '🍫', '🍓', '🍌', '🍎', '🍊', '⭐', '✨', '💖', '🌟'],
} as const;

// ============================================================================
// SPONTANEOUS BEHAVIORS
// ============================================================================

/**
 * Spontaneous behavior scheduler configuration
 *
 * Controls random blinking and looking animations when idle.
 */
export const SPONTANEOUS = {
  /** Minimum delay between behaviors (seconds) */
  minDelay: 5,
  /** Maximum delay between behaviors (seconds) */
  maxDelay: 12,
  /** Probability of double blink */
  doubleBlink: 0.2,
  /** Probability of single blink */
  singleBlink: 0.7,
  /** Probability of look left */
  lookLeft: 0.05,
  /** Probability of look right */
  lookRight: 0.05,
} as const;

// ============================================================================
// EXPRESSION TRANSITIONS
// ============================================================================

/**
 * Expression crossfade timing configuration
 *
 * Controls how quickly character morphs between different expressions.
 */
export const EXPRESSION_TRANSITION = {
  /** Instant transition - 0ms (for blink) */
  instant: 0,
  /** Fast transition - 150ms (idle → wink) */
  fast: 0.15,
  /** Normal transition - 300ms (most transitions) */
  normal: 0.3,
  /** Slow transition - 500ms (dramatic shifts like happy → angry) */
  slow: 0.5,
} as const;

/**
 * Expression transition configs with easing
 *
 * Used for crossfade animations between expressions.
 */
export const EXPRESSION_TRANSITIONS: Record<string, { duration: number; ease: string }> = {
  instant: { duration: 0, ease: 'none' },
  fast: { duration: 0.15, ease: 'power2.inOut' },
  normal: { duration: 0.3, ease: 'power2.inOut' },
  slow: { duration: 0.5, ease: 'power2.inOut' },
};

// ============================================================================
// SUPER MODE
// ============================================================================

/**
 * Super mode golden glow configuration
 *
 * Pulsing rainbow glow effect for powered-up state.
 */
export const SUPER_MODE = {
  /** Glow opacity target */
  opacity: 0.9,
  /** Glow scale target */
  scale: 1.1,
  /** Pulse duration (seconds) */
  pulseDuration: 0.8,
  /** Pulse ease */
  pulseEase: 'sine.inOut',
  /** Repeat indefinitely */
  repeat: -1,
  /** Yoyo (reverse animation) */
  yoyo: true,
  /** Glow size (pixels) */
  size: 200,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate glow Y position based on character Y position
 *
 * @param characterY - Character's current Y position
 * @returns Glow's target Y position (75% of character distance)
 */
export function calculateGlowY(characterY: number): number {
  return characterY * GLOW_COORDINATION.distanceMultiplier;
}

/**
 * Calculate glow animation delay based on character animation start time
 *
 * @param characterDelay - Character animation delay (seconds)
 * @returns Glow animation delay (character delay + lag)
 */
export function calculateGlowDelay(characterDelay: number = 0): number {
  return characterDelay + GLOW_COORDINATION.lag;
}

/**
 * Get random value within a range
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number between min and max
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Get random integer within a range
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random integer between min and max
 */
export function randomIntInRange(min: number, max: number): number {
  return Math.floor(randomInRange(min, max));
}
