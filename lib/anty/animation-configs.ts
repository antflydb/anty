/**
 * Animation configuration constants for Anty Tamagotchi character
 * Provides industry-quality animation timing and easing for organic, smooth movements
 */

// Custom easing curves for organic feel
export const customEasing = {
  // Smooth ease-in-out with slight overshoot for organic feel
  organic: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  // Gentle float movement
  float: [0.45, 0.05, 0.55, 0.95] as [number, number, number, number],
  // Natural blink motion
  blink: [0.87, 0, 0.13, 1] as [number, number, number, number],
  // Eye morphing - smooth and organic
  eyeMorph: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

/**
 * Ghostly floating animation configuration
 * Creates ethereal Y-axis sine wave movement
 */
export const floatingAnimation = {
  // Vertical movement range in pixels
  amplitude: 12,
  // Animation period in seconds
  period: 3.7,
  // Initial Y offset
  initialY: 0,
  // Easing for smooth continuous motion
  ease: customEasing.float,
  // Animation configuration for Framer Motion
  transition: {
    duration: 3.7,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: customEasing.float,
  },
};

/**
 * Synchronized rotation animation
 * Subtle rotation that syncs with floating motion
 */
export const ghostlyRotation = {
  // Rotation range in degrees
  angle: 2.5,
  // Synchronized with float period
  period: 3.7,
  // Easing matches floating
  ease: customEasing.float,
  // Animation configuration
  transition: {
    duration: 3.7,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: customEasing.float,
  },
};

/**
 * Eye morphing transition configuration
 * Spring physics for organic, lifelike eye movements
 */
export const eyeMorphTransition = {
  type: 'spring' as const,
  // Controls bounce - higher = less bounce (24-28 for smooth organic feel)
  damping: 26,
  // Controls speed - higher = faster (280-320 for responsive but not jarring)
  stiffness: 300,
  // Controls inertia - slightly higher for weightier feel
  mass: 1.2,
  // Velocity preservation for smooth transitions
  velocity: 0,
};

/**
 * Blink timing constants
 * Creates natural, organic blink animations
 */
export const blinkTiming = {
  // Time for eyes to close (milliseconds)
  downDuration: 200,
  // Time for eyes to open (milliseconds)
  upDuration: 100,
  // Total blink duration (milliseconds)
  totalDuration: 300,
  // Easing curve for blink
  ease: customEasing.blink,
  // Minimum interval between blinks (milliseconds)
  minInterval: 3000,
  // Maximum interval between blinks (milliseconds)
  maxInterval: 7000,
};

/**
 * Hover micro-movement configuration
 * Subtle interactive response to user hover
 */
export const hoverMicroMovement = {
  // Slight scale increase on hover
  scale: 1.02,
  // Gentle upward movement
  yOffset: -2,
  // Smooth transition
  transition: {
    duration: 0.3,
    ease: customEasing.organic,
  },
};

/**
 * Performance optimization settings
 */
export const performanceConfig = {
  // CSS will-change properties for GPU acceleration
  willChange: 'transform, opacity',
  // Enable hardware acceleration
  force3d: true,
  // Reduce motion for accessibility
  reduceMotion: false,
};

/**
 * Helper function to generate random blink interval
 */
export function getRandomBlinkInterval(): number {
  const range = blinkTiming.maxInterval - blinkTiming.minInterval;
  return blinkTiming.minInterval + Math.random() * range;
}
