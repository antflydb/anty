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
/**
 * Idle floating animation - character gently bobs up and down
 *
 * CRITICAL: This duration is synchronized with rotation animation.
 * DO NOT change without updating rotation.duration to match.
 */
export declare const IDLE_FLOAT: {
    /** Vertical floating distance in pixels */
    readonly amplitude: 12;
    /** Animation duration in seconds - MUST match rotation duration */
    readonly duration: 2.5;
    /** GSAP easing function for smooth sine wave motion */
    readonly ease: "sine.inOut";
};
/**
 * Idle rotation animation - character gently tilts side to side
 *
 * CRITICAL: This is SYNCHRONIZED with floating animation.
 * Both animations share the same duration and ease for visual harmony.
 */
export declare const IDLE_ROTATION: {
    /** Maximum rotation angle in degrees (0° to 2°) */
    readonly degrees: 2;
    /** Animation duration in seconds - MUST match float duration */
    readonly duration: 2.5;
    /** GSAP easing function - MUST match float ease */
    readonly ease: "sine.inOut";
    /** Whether rotation is synchronized with floating */
    readonly synchronized: true;
};
/**
 * Idle breathing scale animation - character subtly expands/contracts
 *
 * This runs independently from float/rotation and is slightly slower
 * to create organic, non-mechanical movement.
 */
export declare const IDLE_BREATHE: {
    /** Minimum scale during breathing cycle */
    readonly scaleMin: 1;
    /** Maximum scale during breathing cycle */
    readonly scaleMax: 1.02;
    /** Animation duration in seconds */
    readonly duration: 3;
    /** GSAP easing function */
    readonly ease: "sine.inOut";
};
/**
 * Idle animation start delays
 *
 * Controls when idle animations begin after wake-up or other transitions.
 */
export declare const IDLE_DELAYS: {
    /** Delay after initial page load (seconds) */
    readonly initialLoad: 0.2;
    /** Delay after wake-up animation completes (seconds) */
    readonly afterWakeUp: 0.65;
};
/**
 * Shadow animations - inverse relationship with character position
 *
 * CRITICAL INVERSE RELATIONSHIP:
 * When character floats UP, shadow scales DOWN and fades.
 * When character drops DOWN, shadow scales UP and becomes more opaque.
 * Shadow position is FIXED on ground - only scale and opacity animate.
 */
export declare const SHADOW: {
    /** Shadow horizontal scale when character is at apex (floating up) */
    readonly scaleXWhenUp: 0.7;
    /** Shadow vertical scale when character is at apex (floating up) */
    readonly scaleYWhenUp: 0.55;
    /** Shadow opacity when character is at apex (floating up) */
    readonly opacityWhenUp: 0.2;
    /** Shadow horizontal scale when character is at ground (normal) */
    readonly scaleXWhenDown: 1;
    /** Shadow vertical scale when character is at ground (normal) */
    readonly scaleYWhenDown: 1;
    /** Shadow opacity when character is at ground (normal) */
    readonly opacityWhenDown: 0.7;
    /** Shadow horizontal position (xPercent) - NEVER changes */
    readonly xPercent: -50;
    /** Animation duration matches idle float (seconds) - MUST match IDLE_FLOAT.duration */
    readonly duration: 2.5;
    /** GSAP easing function matches idle float */
    readonly ease: "sine.inOut";
};
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
export declare const GLOW_COORDINATION: {
    /** Distance multiplier - glows travel 75% of character distance */
    readonly distanceMultiplier: 0.75;
    /** Time lag in seconds - glows start 0.05s after character */
    readonly lag: 0.05;
};
/**
 * Glow ghostly idle movement
 *
 * Random floating movement when in idle mode (not searching, not in game).
 * Creates subtle organic motion that makes the glow feel alive.
 */
export declare const GLOW_GHOSTLY: {
    /** Random Y offset range in pixels */
    readonly yRange: {
        readonly min: -8;
        readonly max: -16;
    };
    /** Random X offset range in pixels */
    readonly xRange: {
        readonly min: -6;
        readonly max: 6;
    };
    /** Random scale range */
    readonly scaleRange: {
        readonly min: 0.98;
        readonly max: 1.05;
    };
    /** Random opacity range */
    readonly opacityRange: {
        readonly min: 0.7;
        readonly max: 1;
    };
    /** Random duration range for outward movement (seconds) */
    readonly outwardDuration: {
        readonly min: 2.2;
        readonly max: 3.5;
    };
    /** Random duration range for return movement (seconds) */
    readonly returnDuration: {
        readonly min: 2;
        readonly max: 3.2;
    };
    /** Base return values */
    readonly returnBase: {
        readonly yRange: {
            readonly min: -2;
            readonly max: 2;
        };
        readonly xRange: {
            readonly min: -2;
            readonly max: 2;
        };
        readonly scaleRange: {
            readonly min: 0.95;
            readonly max: 1.02;
        };
        readonly opacityRange: {
            readonly min: 0.8;
            readonly max: 0.95;
        };
    };
};
/**
 * Blink animation timings
 *
 * Single blink: close (100ms) → open (150ms)
 * Double blink: close → open → pause (100ms) → close → open
 */
export declare const BLINK: {
    /** Duration of eye closing animation (seconds) */
    readonly closeDuration: 0.1;
    /** Duration of eye opening animation (seconds) */
    readonly openDuration: 0.15;
    /** Vertical scale when eyes are closed (nearly flat) */
    readonly scaleYClosed: 0.05;
    /** GSAP easing for closing */
    readonly closeEase: "power2.in";
    /** GSAP easing for opening */
    readonly openEase: "power2.out";
};
/**
 * Double blink animation timings
 *
 * Slightly faster than single blink for snappier feel.
 */
export declare const DOUBLE_BLINK: {
    /** Duration of eye closing animation (seconds) */
    readonly closeDuration: 0.08;
    /** Duration of eye opening animation (seconds) */
    readonly openDuration: 0.12;
    /** Pause between first and second blink (seconds) */
    readonly pauseDuration: 0.1;
    /** Vertical scale when eyes are closed */
    readonly scaleYClosed: 0.05;
    /** GSAP easing for closing */
    readonly closeEase: "power2.in";
    /** GSAP easing for opening */
    readonly openEase: "power2.out";
};
/**
 * Blink permission system
 *
 * Controls when automatic blinking is allowed based on current expression.
 */
export declare const BLINK_PERMISSION: {
    /** Delay before re-enabling blinking after returning to idle (milliseconds) */
    readonly reEnableDelay: 300;
};
/**
 * Shocked expression - eyes grow larger
 *
 * Quick snap to shocked state when surprised or startled.
 */
export declare const SHOCKED_EYES: {
    /** Scale multiplier for shocked eyes (both X and Y) */
    readonly scale: 1.4;
    /** Animation duration (seconds) */
    readonly duration: 0.1;
    /** GSAP easing function */
    readonly ease: "power2.out";
};
/**
 * Idea expression - eyes look up and grow slightly
 *
 * "Lightbulb moment" animation.
 */
export declare const IDEA_EYES: {
    /** Scale multiplier for idea eyes (both X and Y) */
    readonly scale: 1.15;
    /** Vertical offset in pixels (negative = up) */
    readonly yOffset: -8;
    /** Animation duration (seconds) */
    readonly duration: 0.1;
    /** GSAP easing function */
    readonly ease: "power2.out";
};
/**
 * Eye reset animation
 *
 * Used when returning from shocked/idea/look states back to idle.
 * Very fast to avoid visible flashing.
 */
export declare const EYE_RESET: {
    /** Reset animation duration (seconds) */
    readonly duration: 0.05;
    /** GSAP easing function */
    readonly ease: "power2.out";
};
/**
 * Look left/right animation - eyes morph and move
 *
 * Eyes morph from tall vertical pills to shorter horizontal pills
 * and move left or right with bunching effect (eyes move closer together).
 */
export declare const LOOK_ANIMATION: {
    /** Height of looking eye in pixels */
    readonly height: 33;
    /** Width of looking eye in pixels */
    readonly width: 20;
    /** Height of idle eye in pixels */
    readonly idleHeight: 44.52;
    /** Width of idle eye in pixels */
    readonly idleWidth: 18.63;
    /** Horizontal movement distance in pixels */
    readonly xOffset: 12;
    /** Additional movement for bunching eyes closer together in pixels */
    readonly bunch: 4;
    /** Animation duration (seconds) - smooth morph */
    readonly duration: 0.25;
    /** Delay before starting cross-fade (seconds) */
    readonly crossfadeDelay: 0.05;
    /** GSAP easing function */
    readonly ease: "power2.out";
};
/**
 * SVG path data for eye morphing
 *
 * Used for morphing between idle and looking eye shapes.
 */
export declare const EYE_PATHS: {
    /** Idle eye - tall vertical pill (23.29 × 55.65) */
    readonly IDLE: "M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z";
    /** Looking eye - shorter, wider pill (26 × 43) */
    readonly LOOKING: "M8.24203e-05 29.9999C3.6901e-05 37.1796 5.82038 43 13.0001 42.9999C20.1798 42.9999 26 37.1796 26 30V12.9999C26 5.82023 20.1798 -1.58161e-06 13.0001 -1.58161e-06C5.82049 -1.58161e-06 0.000235718 5.82023 0.0001902 12.9999L8.24203e-05 29.9999Z";
};
/**
 * Excited animation - backflip jump with fireworks
 *
 * Multi-stage jump animation with particle burst.
 * Glows follow with 75% distance and 0.05s lag formula.
 */
export declare const EXCITED: {
    /** First jump height in pixels (negative = up) */
    readonly jump1: -70;
    /** First jump duration (seconds) */
    readonly jump1Duration: 0.5;
    /** First jump ease */
    readonly jump1Ease: "power2.out";
    /** Hold at apex duration (seconds) */
    readonly holdDuration: 0.3;
    /** Drop duration after first jump (seconds) */
    readonly drop1Duration: 0.45;
    /** Drop ease */
    readonly drop1Ease: "power1.inOut";
    /** Second jump height in pixels */
    readonly jump2: -25;
    /** Second jump duration (seconds) */
    readonly jump2Duration: 0.18;
    /** Third jump height in pixels */
    readonly jump3: -18;
    /** Third jump duration (seconds) */
    readonly jump3Duration: 0.15;
    /** Rotation during backflip (degrees) */
    readonly rotation: 360;
    /** Rotation duration (seconds) */
    readonly rotationDuration: 0.5;
    /** Fireworks particle count */
    readonly fireworksCount: 40;
    /** Fireworks colors (purple theme) */
    readonly fireworksColors: readonly ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"];
};
/**
 * Spin animation - Y-axis spin jump
 *
 * Character spins around vertical axis while jumping.
 */
export declare const SPIN: {
    /** Jump height in pixels (negative = up) */
    readonly jumpHeight: -70;
    /** Jump up duration (seconds) */
    readonly jumpUpDuration: 0.3;
    /** Jump up ease */
    readonly jumpUpEase: "power2.out";
    /** Rotation degrees (Y-axis) */
    readonly rotationY: 360;
    /** Rotation duration (seconds) */
    readonly rotationDuration: 0.7;
    /** Rotation ease */
    readonly rotationEase: "power1.inOut";
    /** Drop duration (seconds) */
    readonly dropDuration: 0.35;
    /** Drop ease */
    readonly dropEase: "power2.in";
    /** Total animation duration before reset (milliseconds) */
    readonly totalDuration: 4000;
};
/**
 * Nod animation - vertical head bob (yes/affirm)
 *
 * Quick downward nod and return to normal.
 */
export declare const NOD: {
    /** Jump height in pixels (negative = up) */
    readonly jumpHeight: -30;
    /** Jump duration (seconds) */
    readonly jumpDuration: 0.2;
    /** Jump ease */
    readonly jumpEase: "power2.out";
    /** Return duration (seconds) */
    readonly returnDuration: 0.5;
    /** Return ease */
    readonly returnEase: "power1.inOut";
    /** Body bracket movement in pixels */
    readonly bodyMovement: 3;
    /** Body movement duration (seconds) */
    readonly bodyDuration: 0.15;
    /** Body ease */
    readonly bodyEase: "power2.inOut";
    /** Total animation duration before reset (milliseconds) */
    readonly totalDuration: 1400;
};
/**
 * Headshake animation - horizontal head shake (no/deny)
 *
 * Shake left and right 3 times.
 */
export declare const HEADSHAKE: {
    /** Shake amplitude in degrees */
    readonly rotationDegrees: 8;
    /** Single shake duration (seconds) */
    readonly shakeDuration: 0.15;
    /** Number of shakes */
    readonly shakeCount: 3;
    /** Shake ease */
    readonly shakeEase: "power2.inOut";
};
/**
 * Happy animation - sustained hover with gentle sway
 *
 * Character floats slightly higher with subtle side-to-side motion.
 */
export declare const HAPPY: {
    /** Hover height in pixels (negative = up) */
    readonly hoverHeight: -10;
    /** Hover duration (seconds) */
    readonly hoverDuration: 0.4;
    /** Hover ease */
    readonly hoverEase: "power2.out";
};
/**
 * Sad animation - droop down with scale reduction
 *
 * Character drops and shrinks slightly to convey sadness.
 */
export declare const SAD: {
    /** Droop distance in pixels (positive = down) */
    readonly droopDistance: 10;
    /** Scale reduction during sadness */
    readonly scale: 0.9;
    /** Droop duration (seconds) */
    readonly droopDuration: 0.6;
    /** Droop ease */
    readonly droopEase: "power2.out";
    /** Return duration (seconds) */
    readonly returnDuration: 0.4;
    /** Return ease */
    readonly returnEase: "power2.in";
    /** Total animation duration before reset (milliseconds) */
    readonly totalDuration: 1500;
};
/**
 * Angry animation - drop and shake
 *
 * Character drops down and shakes horizontally to show anger.
 */
export declare const ANGRY: {
    /** Drop distance in pixels (positive = down) */
    readonly dropDistance: 15;
    /** Drop duration (seconds) */
    readonly dropDuration: 0.6;
    /** Drop ease */
    readonly dropEase: "power2.out";
    /** Shake amplitude in degrees */
    readonly shakeDegrees: 8;
    /** Single shake duration (seconds) */
    readonly shakeDuration: 0.15;
    /** Number of shakes */
    readonly shakeCount: 3;
    /** Shake ease */
    readonly shakeEase: "power2.inOut";
    /** Return duration (seconds) */
    readonly returnDuration: 0.5;
    /** Return ease */
    readonly returnEase: "power2.in";
    /** Total animation duration before reset (milliseconds) */
    readonly totalDuration: 6000;
};
/**
 * Wink animation - subtle tilt and hold
 *
 * Character tilts slightly during wink expression.
 */
export declare const WINK: {
    /** Tilt rotation in degrees (negative = counterclockwise) */
    readonly rotation: -3;
    /** Bounce height in pixels (negative = up) */
    readonly bounceHeight: -5;
    /** Tilt/bounce duration (seconds) */
    readonly tiltDuration: 0.15;
    /** Tilt ease */
    readonly tiltEase: "power2.out";
    /** Hold duration at wink pose (seconds) */
    readonly holdDuration: 0.4;
    /** Return to normal duration (seconds) */
    readonly returnDuration: 0.2;
    /** Return ease */
    readonly returnEase: "power2.out";
    /** Sparkle particle count */
    readonly sparkleCount: 4;
    /** Sparkle spawn delay between particles (milliseconds) */
    readonly sparkleDelay: 50;
    /** Right eye position offset for sparkle spawn */
    readonly sparklePosition: {
        readonly x: 22;
        readonly y: -20;
    };
};
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
export declare const WAKE_UP: {
    /** Jump height in pixels (negative = up) */
    readonly jumpHeight: -45;
    /** Jump up duration (seconds) */
    readonly jumpUpDuration: 0.2;
    /** Jump up ease */
    readonly jumpUpEase: "power2.out";
    /** Hang at apex duration (seconds) */
    readonly hangDuration: 0.05;
    /** Drop duration (seconds) */
    readonly dropDuration: 0.3;
    /** Drop ease */
    readonly dropEase: "power2.in";
    /** Character scale during wake-up */
    readonly scale: 1;
    /** Glow/shadow scale before wake-up (shrunk) */
    readonly glowScaleBefore: 0.65;
    /** Glow/shadow scale after wake-up (normal) */
    readonly glowScaleAfter: 1;
    /** Glow fade-in duration (seconds) - slower than movement */
    readonly glowFadeDuration: 0.6;
    /** Glow fade ease */
    readonly glowFadeEase: "power1.in";
    /** Shadow fade-in duration (seconds) */
    readonly shadowFadeDuration: 0.55;
    /** Shadow fade ease */
    readonly shadowFadeEase: "power1.in";
};
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
export declare const POWER_OFF: {
    /** Hover height in pixels (negative = up) */
    readonly hoverHeight: -15;
    /** Hover duration (seconds) */
    readonly hoverDuration: 0.15;
    /** Hover ease */
    readonly hoverEase: "power2.out";
    /** Snap down distance in pixels (positive = down) */
    readonly snapDistance: 50;
    /** Snap duration (seconds) */
    readonly snapDuration: 0.1;
    /** Snap ease - exponential for dramatic effect */
    readonly snapEase: "expo.in";
    /** Character scale during power-off */
    readonly scale: 1;
    /** Glow/shadow scale during power-off (shrunk) */
    readonly glowScaleOff: 0.65;
    /** Eye morph duration (seconds) */
    readonly eyeMorphDuration: 0.06;
    /** Eye morph ease */
    readonly eyeMorphEase: "power2.in";
    /** Glow/shadow fade-out duration (seconds) */
    readonly fadeOutDuration: 0.06;
    /** Fade-out ease */
    readonly fadeOutEase: "power2.in";
    /** Character opacity when OFF */
    readonly opacityOff: 0.25;
    /** Eye morph delay from snap start (milliseconds) */
    readonly eyeMorphDelay: 540;
    /** Glow/shadow fade delay from animation start (milliseconds) */
    readonly fadeOutDelay: 600;
};
/**
 * Search morph animation - Character → Search Bar
 *
 * Multi-step transformation with careful timing coordination.
 */
export declare const SEARCH_MORPH_IN: {
    /** Eyes fade out duration (seconds) */
    readonly eyesFadeOut: 0.2;
    /** Eyes fade ease */
    readonly eyesFadeEase: "power2.in";
    /** Body brackets move to edges duration (seconds) */
    readonly bracketsMoveDuration: 0.35;
    /** Body brackets move ease */
    readonly bracketsMoveEase: "power2.inOut";
    /** Left bracket target X position (pixels) */
    readonly leftBracketX: -240;
    /** Right bracket target X position (pixels) */
    readonly rightBracketX: 240;
    /** Search bar fade-in duration (seconds) */
    readonly barFadeIn: 0.25;
    /** Search bar fade-in ease */
    readonly barFadeEase: "power2.out";
    /** Search bar fade-in delay from animation start (seconds) */
    readonly barFadeDelay: 0.2;
    /** Border gradient fade-in duration (seconds) */
    readonly borderFadeIn: 0.45;
    /** Border gradient fade-in ease */
    readonly borderFadeEase: "power2.out";
    /** Border gradient fade-in delay from animation start (seconds) */
    readonly borderFadeDelay: 0.42;
    /** Placeholder fade-in duration (seconds) */
    readonly placeholderFadeIn: 0.45;
    /** Placeholder fade-in ease */
    readonly placeholderFadeEase: "power2.out";
    /** Placeholder fade-in delay from animation start (seconds) */
    readonly placeholderFadeDelay: 0.42;
    /** Placeholder blur amount during morph (pixels) */
    readonly placeholderBlur: 8;
    /** Placeholder Y offset during morph (pixels) */
    readonly placeholderY: -8;
    /** CMD+K indicator fade-in duration (seconds) */
    readonly kbdFadeIn: 0.45;
    /** CMD+K indicator fade-in ease */
    readonly kbdFadeEase: "power2.out";
    /** CMD+K indicator fade-in delay from animation start (seconds) */
    readonly kbdFadeDelay: 0.42;
    /** Large search glow appears delay from animation start (seconds) */
    readonly glowAppearDelay: 0.25;
};
/**
 * Search AI gradient glow animation
 *
 * Animated gradient behind search bar with breathing effect.
 */
export declare const SEARCH_GLOW: {
    /** Initial opacity */
    readonly opacityInitial: 0;
    /** Final opacity after fade-in */
    readonly opacityFinal: 1;
    /** Initial scale */
    readonly scaleInitial: 0.95;
    /** Final scale after fade-in */
    readonly scaleFinal: 1;
    /** Fade-in duration (seconds) */
    readonly fadeInDuration: 0.4;
    /** Fade-in ease */
    readonly fadeInEase: "power2.out";
    /** Fade-in delay from search morph start (seconds) */
    readonly fadeInDelay: 0.85;
    /** Breathing animation scale target */
    readonly breatheScale: 1.12;
    /** Breathing animation opacity target */
    readonly breatheOpacity: 0.7;
    /** Breathing animation duration (seconds) */
    readonly breatheDuration: 2;
    /** Breathing animation ease */
    readonly breatheEase: "sine.inOut";
    /** Breathing animation repeat */
    readonly breatheRepeat: -1;
    /** Breathing animation yoyo */
    readonly breatheYoyo: true;
};
/**
 * Search morph animation - Search Bar → Character
 *
 * Reverse transformation back to character state.
 */
export declare const SEARCH_MORPH_OUT: {
    /** Border gradient fade-out duration (seconds) */
    readonly borderFadeOut: 0.15;
    /** Border gradient fade-out ease */
    readonly borderFadeEase: "power2.in";
    /** Placeholder/KBD fade-out duration (seconds) */
    readonly uiFadeOut: 0.25;
    /** Placeholder/KBD fade-out ease */
    readonly uiFadeEase: "power2.in";
    /** Placeholder/KBD Y offset during morph (pixels) */
    readonly uiY: -6;
    /** Placeholder/KBD blur during morph (pixels) */
    readonly uiBlur: 6;
    /** Search glow crossfade duration (seconds) */
    readonly glowCrossfade: 0.35;
    /** Search glow crossfade ease */
    readonly glowCrossfadeEase: "power2.inOut";
    /** Search glow scale during fade-out */
    readonly glowScaleOut: 0.85;
    /** Search glow crossfade delay from animation start (seconds) */
    readonly glowCrossfadeDelay: 0.15;
    /** Search bar fade-out duration (seconds) */
    readonly barFadeOut: 0.3;
    /** Search bar fade-out ease */
    readonly barFadeEase: "power2.in";
    /** Search bar fade-out delay from animation start (seconds) */
    readonly barFadeDelay: 0.15;
    /** Brackets return duration (seconds) */
    readonly bracketsReturn: 0.35;
    /** Brackets return ease */
    readonly bracketsReturnEase: "power2.inOut";
    /** Brackets return delay from animation start (seconds) */
    readonly bracketsReturnDelay: 0.3;
    /** Brackets tiny leap distance (pixels, negative = up) */
    readonly bracketsLeap: -8;
    /** Brackets leap duration (seconds) */
    readonly bracketsLeapDuration: 0.12;
    /** Brackets leap ease */
    readonly bracketsLeapEase: "power2.out";
    /** Brackets settle duration (seconds) */
    readonly bracketsSettleDuration: 0.17;
    /** Brackets settle ease */
    readonly bracketsSettleEase: "power2.in";
    /** Brackets leap delay from return start (seconds) */
    readonly bracketsLeapDelay: 0.55;
    /** Eyes fade-in duration (seconds) */
    readonly eyesFadeIn: 0.3;
    /** Eyes fade-in ease */
    readonly eyesFadeEase: "power2.out";
    /** Eyes fade-in delay from animation start (seconds) */
    readonly eyesFadeDelay: 0.67;
    /** Orb glows fade-in duration (seconds) */
    readonly orbGlowsFadeIn: 0.4;
    /** Orb glows fade-in ease */
    readonly orbGlowsFadeEase: "power2.out";
    /** Orb glows fade-in delay from animation start (seconds) */
    readonly orbGlowsFadeDelay: 0.48;
    /** Hide search glow canvas delay from animation start (seconds) */
    readonly hideGlowDelay: 0;
    /** Total morph duration for state reset (seconds) */
    readonly totalDuration: 0.72;
};
/**
 * Heart particle configuration
 *
 * Used for love/feeding animations.
 */
export declare const PARTICLE_HEART: {
    /** Horizontal velocity range (pixels/second) */
    readonly velocityX: {
        readonly min: -30;
        readonly max: 30;
    };
    /** Vertical velocity range (pixels/second) */
    readonly velocityY: {
        readonly min: -80;
        readonly max: -120;
    };
    /** Particle lifetime (milliseconds) */
    readonly lifetime: 2000;
    /** Gravity acceleration factor */
    readonly gravity: 0.5;
    /** Opacity fade start (percentage of lifetime) */
    readonly fadeStart: 0.6;
    /** Initial scale range */
    readonly scaleRange: {
        readonly min: 0.5;
        readonly max: 0.8;
    };
    /** Rotation speed range (degrees/second) */
    readonly rotationSpeed: {
        readonly min: -45;
        readonly max: 45;
    };
};
/**
 * Sparkle particle configuration
 *
 * Used for wink and magic effects.
 */
export declare const PARTICLE_SPARKLE: {
    /** Horizontal velocity range (pixels/second) */
    readonly velocityX: {
        readonly min: -50;
        readonly max: 50;
    };
    /** Vertical velocity range (pixels/second) */
    readonly velocityY: {
        readonly min: -60;
        readonly max: -100;
    };
    /** Particle lifetime (milliseconds) */
    readonly lifetime: 1500;
    /** Gravity acceleration factor */
    readonly gravity: 0.3;
    /** Opacity fade start (percentage of lifetime) */
    readonly fadeStart: 0.5;
    /** Initial scale range */
    readonly scaleRange: {
        readonly min: 0.5;
        readonly max: 0.9;
    };
    /** Rotation speed range (degrees/second) */
    readonly rotationSpeed: {
        readonly min: -180;
        readonly max: 180;
    };
};
/**
 * Sweat particle configuration
 *
 * Used for stress/worry effects.
 */
export declare const PARTICLE_SWEAT: {
    /** Horizontal velocity range (pixels/second) */
    readonly velocityX: {
        readonly min: -20;
        readonly max: 20;
    };
    /** Vertical velocity range (pixels/second) */
    readonly velocityY: {
        readonly min: 0;
        readonly max: 20;
    };
    /** Particle lifetime (milliseconds) */
    readonly lifetime: 1200;
    /** Gravity acceleration factor (positive = falls) */
    readonly gravity: 1.5;
    /** Opacity fade start (percentage of lifetime) */
    readonly fadeStart: 0.7;
    /** Initial scale range */
    readonly scaleRange: {
        readonly min: 0.4;
        readonly max: 0.6;
    };
    /** Rotation speed range (degrees/second) */
    readonly rotationSpeed: {
        readonly min: 0;
        readonly max: 0;
    };
};
/**
 * ZZZ particle configuration
 *
 * Used for sleep/tired effects.
 */
export declare const PARTICLE_ZZZ: {
    /** Horizontal velocity range (pixels/second) */
    readonly velocityX: {
        readonly min: 10;
        readonly max: 30;
    };
    /** Vertical velocity range (pixels/second) */
    readonly velocityY: {
        readonly min: -40;
        readonly max: -60;
    };
    /** Particle lifetime (milliseconds) */
    readonly lifetime: 2500;
    /** Gravity acceleration factor (negative = floats up) */
    readonly gravity: -0.2;
    /** Opacity fade start (percentage of lifetime) */
    readonly fadeStart: 0.7;
    /** Initial scale range */
    readonly scaleRange: {
        readonly min: 0.6;
        readonly max: 0.9;
    };
    /** Rotation speed range (degrees/second) */
    readonly rotationSpeed: {
        readonly min: -20;
        readonly max: 20;
    };
};
/**
 * Confetti particle configuration
 *
 * Used for celebration/excited effects.
 */
export declare const PARTICLE_CONFETTI: {
    /** Horizontal velocity range (pixels/second) */
    readonly velocityX: {
        readonly min: -150;
        readonly max: 150;
    };
    /** Vertical velocity range (pixels/second) */
    readonly velocityY: {
        readonly min: -300;
        readonly max: -150;
    };
    /** Particle lifetime (milliseconds) */
    readonly lifetime: 3000;
    /** Gravity acceleration factor (positive = falls) */
    readonly gravity: 250;
    /** Opacity fade start (percentage of lifetime) */
    readonly fadeStart: 0.8;
    /** Initial scale range */
    readonly scaleRange: {
        readonly min: 0.6;
        readonly max: 1.2;
    };
    /** Rotation speed range (degrees/second) */
    readonly rotationSpeed: {
        readonly min: -360;
        readonly max: 360;
    };
};
/**
 * Love hearts animation configuration
 *
 * Purple heart SVGs radiating outward from character.
 */
export declare const LOVE_HEARTS: {
    /** Number of hearts to spawn */
    readonly count: 8;
    /** Delay between each heart spawn (milliseconds) */
    readonly spawnDelay: 80;
    /** Radiate distance range (pixels) */
    readonly distanceRange: {
        readonly min: 60;
        readonly max: 100;
    };
    /** Initial scale */
    readonly scaleInitial: 0.5;
    /** Final scale during radiate */
    readonly scaleFinal: 1;
    /** Initial opacity */
    readonly opacityInitial: 0;
    /** Final opacity during radiate */
    readonly opacityFinal: 1;
    /** Radiate out duration (seconds) */
    readonly radiateOutDuration: 0.4;
    /** Radiate out ease */
    readonly radiateOutEase: "power2.out";
    /** Fade out scale */
    readonly fadeOutScale: 0.3;
    /** Fade out duration (seconds) */
    readonly fadeOutDuration: 0.3;
    /** Fade out ease */
    readonly fadeOutEase: "power2.in";
};
/**
 * Food emoji implosion configuration
 *
 * Flying emojis converging INTO Anty during feeding.
 */
export declare const FOOD_IMPLOSION: {
    /** Number of emoji particles */
    readonly count: 60;
    /** Font size range (pixels) */
    readonly fontSizeRange: {
        readonly min: 32;
        readonly max: 56;
    };
    /** Starting distance from screen center (pixels) */
    readonly startDistanceRange: {
        readonly min: 400;
        readonly max: 800;
    };
    /** Flight duration range (seconds) */
    readonly durationRange: {
        readonly min: 0.8;
        readonly max: 1.4;
    };
    /** Initial scale */
    readonly scaleInitial: 0.3;
    /** Final scale range */
    readonly scaleRange: {
        readonly min: 0.8;
        readonly max: 1.3;
    };
    /** Initial opacity */
    readonly opacityInitial: 0;
    /** Final opacity */
    readonly opacityFinal: 1;
    /** Initial rotation range (degrees) */
    readonly rotationInitialRange: {
        readonly min: -180;
        readonly max: 180;
    };
    /** Final rotation range (degrees) */
    readonly rotationFinalRange: {
        readonly min: 180;
        readonly max: 540;
    };
    /** Flight ease */
    readonly flightEase: "power2.in";
    /** Absorption fade duration (seconds) */
    readonly absorbDuration: 0.15;
    /** Absorption ease */
    readonly absorbEase: "power4.in";
    /** Stagger delay between particles (seconds) */
    readonly staggerDelay: 0.01;
    /** Available food emojis */
    readonly emojis: readonly ["🧁", "🍪", "🍩", "🍰", "🎂", "🍬", "🍭", "🍫", "🍓", "🍌", "🍎", "🍊", "⭐", "✨", "💖", "🌟"];
};
/**
 * Spontaneous behavior scheduler configuration
 *
 * Controls random blinking and looking animations when idle.
 */
export declare const SPONTANEOUS: {
    /** Minimum delay between behaviors (seconds) */
    readonly minDelay: 5;
    /** Maximum delay between behaviors (seconds) */
    readonly maxDelay: 12;
    /** Probability of double blink */
    readonly doubleBlink: 0.2;
    /** Probability of single blink */
    readonly singleBlink: 0.7;
    /** Probability of look left */
    readonly lookLeft: 0.05;
    /** Probability of look right */
    readonly lookRight: 0.05;
};
/**
 * Expression crossfade timing configuration
 *
 * Controls how quickly character morphs between different expressions.
 */
export declare const EXPRESSION_TRANSITION: {
    /** Instant transition - 0ms (for blink) */
    readonly instant: 0;
    /** Fast transition - 150ms (idle → wink) */
    readonly fast: 0.15;
    /** Normal transition - 300ms (most transitions) */
    readonly normal: 0.3;
    /** Slow transition - 500ms (dramatic shifts like happy → angry) */
    readonly slow: 0.5;
};
/**
 * Expression transition configs with easing
 *
 * Used for crossfade animations between expressions.
 */
export declare const EXPRESSION_TRANSITIONS: Record<string, {
    duration: number;
    ease: string;
}>;
/**
 * Super mode golden glow configuration
 *
 * Pulsing rainbow glow effect for powered-up state.
 */
export declare const SUPER_MODE: {
    /** Glow opacity target */
    readonly opacity: 0.9;
    /** Glow scale target */
    readonly scale: 1.1;
    /** Pulse duration (seconds) */
    readonly pulseDuration: 0.8;
    /** Pulse ease */
    readonly pulseEase: "sine.inOut";
    /** Repeat indefinitely */
    readonly repeat: -1;
    /** Yoyo (reverse animation) */
    readonly yoyo: true;
    /** Glow size (pixels) */
    readonly size: 200;
};
/**
 * Calculate glow Y position based on character Y position
 *
 * @param characterY - Character's current Y position
 * @returns Glow's target Y position (75% of character distance)
 */
export declare function calculateGlowY(characterY: number): number;
/**
 * Calculate glow animation delay based on character animation start time
 *
 * @param characterDelay - Character animation delay (seconds)
 * @returns Glow animation delay (character delay + lag)
 */
export declare function calculateGlowDelay(characterDelay?: number): number;
/**
 * Get random value within a range
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number between min and max
 */
export declare function randomInRange(min: number, max: number): number;
/**
 * Get random integer within a range
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random integer between min and max
 */
export declare function randomIntInRange(min: number, max: number): number;
