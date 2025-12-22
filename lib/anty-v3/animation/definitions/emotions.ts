/**
 * Emotion Animation Definitions
 * Pure functions that create GSAP timelines for emotional expressions
 */

import gsap from 'gsap';

export interface EmotionAnimationElements {
  character: HTMLElement;
  leftBody?: HTMLElement;
  rightBody?: HTMLElement;
  innerGlow?: HTMLElement;
  outerGlow?: HTMLElement;
}

export type EmotionType = 'happy' | 'excited' | 'sad' | 'angry' | 'shocked' | 'spin';

export interface EmotionAnimationOptions {
  /** Whether chat panel is open (affects particle positioning) */
  isChatOpen?: boolean;
}

/**
 * Glow lag configuration
 * Glows follow character at 75% distance with 0.05s delay
 */
const GLOW_DISTANCE_RATIO = 0.75;
const GLOW_LAG_SECONDS = 0.05;

/**
 * Creates emotion animation timeline based on emotion type
 *
 * Each emotion has unique character movement, timing, and visual effects:
 * - happy: Wiggling rotation
 * - excited: Jump with 360° rotation and fireworks
 * - sad: Droop down with scale decrease
 * - angry: Shake horizontally with downward movement
 * - shocked: Jump with bracket separation
 * - spin: Y-axis spin with jump
 *
 * Glows coordinate with character at 75% distance and 0.05s lag
 *
 * @param emotion - Type of emotion to animate
 * @param elements - Character and optional glow elements
 * @param options - Optional configuration
 * @returns GSAP timeline for the emotion animation
 */
export function createEmotionAnimation(
  emotion: EmotionType,
  elements: EmotionAnimationElements,
  options: EmotionAnimationOptions = {}
): gsap.core.Timeline {
  const { character, leftBody, rightBody, innerGlow, outerGlow } = elements;
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];

  const timeline = gsap.timeline({
    onComplete: () => {
      // Reset rotation after excited animation
      if (emotion === 'excited') {
        gsap.set(character, { rotation: 0 });
      }
    },
  });

  switch (emotion) {
    case 'happy': {
      // Wiggle animation - rotation oscillation
      timeline.to(character, {
        rotation: 10,
        duration: 0.15,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 5, // 6 wiggles total
      });
      break;
    }

    case 'excited': {
      // Epic jump with 360° rotation and multi-bounce landing

      // 1. Jump up with 360° spin (0.5s)
      timeline.to(character, {
        y: -70,
        rotation: 360,
        duration: 0.5,
        ease: 'power2.out',
      });

      // Glows follow at 75% distance with 0.05s lag
      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: -70 * GLOW_DISTANCE_RATIO, // -53px
            duration: 0.5,
            ease: 'power2.out',
          },
          `-=${0.5 - GLOW_LAG_SECONDS}` // Start 0.05s after character
        );
      }

      // 2. Hold at apex (0.3s)
      timeline.to(character, {
        y: -70,
        rotation: 360,
        duration: 0.3,
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: -70 * GLOW_DISTANCE_RATIO,
            duration: 0.3,
          },
          `-=${0.3 - GLOW_LAG_SECONDS}`
        );
      }

      // 3. Drop down (0.45s)
      timeline.to(character, {
        y: 0,
        duration: 0.45,
        ease: 'power1.inOut',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 0,
            duration: 0.45,
            ease: 'power1.inOut',
          },
          `-=${0.45 - GLOW_LAG_SECONDS}`
        );
      }

      // 4. First bounce (0.18s up, 0.18s down)
      timeline.to(character, {
        y: -25,
        duration: 0.18,
        ease: 'power2.out',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: -25 * GLOW_DISTANCE_RATIO,
            duration: 0.18,
            ease: 'power2.out',
          },
          `-=${0.18 - GLOW_LAG_SECONDS}`
        );
      }

      timeline.to(character, {
        y: 0,
        duration: 0.18,
        ease: 'power2.in',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 0,
            duration: 0.18,
            ease: 'power2.in',
          },
          `-=${0.18 - GLOW_LAG_SECONDS}`
        );
      }

      // 5. Second bounce (0.15s up, 0.15s down)
      timeline.to(character, {
        y: -18,
        duration: 0.15,
        ease: 'power2.out',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: -18 * GLOW_DISTANCE_RATIO,
            duration: 0.15,
            ease: 'power2.out',
          },
          `-=${0.15 - GLOW_LAG_SECONDS}`
        );
      }

      timeline.to(character, {
        y: 0,
        duration: 0.15,
        ease: 'power2.in',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 0,
            duration: 0.15,
            ease: 'power2.in',
          },
          `-=${0.15 - GLOW_LAG_SECONDS}`
        );
      }

      break;
    }

    case 'sad': {
      // Droop down with scale decrease
      timeline.to(character, {
        y: 10,
        scale: 0.9,
        duration: 0.6,
        ease: 'power2.out',
      });

      // Glows follow
      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 10 * GLOW_DISTANCE_RATIO, // 7.5px
            duration: 0.6,
            ease: 'power2.out',
          },
          `-=${0.6 - GLOW_LAG_SECONDS}`
        );
      }

      // Return to normal after 1.5s
      timeline.to(
        character,
        {
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power2.in',
        },
        '+=0.9' // Wait 1.5s total before return (0.6s + 0.9s)
      );

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 0,
            duration: 0.4,
            ease: 'power2.in',
          },
          `-=${0.4 - GLOW_LAG_SECONDS}`
        );
      }

      break;
    }

    case 'angry': {
      // Move down, then shake horizontally 3 times, then return

      // 1. Move down (0.6s)
      timeline.to(character, {
        y: 15,
        duration: 0.6,
        ease: 'power2.out',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 15 * GLOW_DISTANCE_RATIO, // 11.25px
            duration: 0.6,
            ease: 'power2.out',
          },
          `-=${0.6 - GLOW_LAG_SECONDS}`
        );
      }

      // 2. Horizontal shakes (3 cycles: left-right-left-right-left-right)
      for (let i = 0; i < 3; i++) {
        timeline.to(character, {
          x: -8,
          duration: 0.8,
          ease: 'sine.inOut',
        });
        timeline.to(character, {
          x: 8,
          duration: 0.8,
          ease: 'sine.inOut',
        });
      }

      // 3. Return to center horizontally (0.4s)
      timeline.to(character, {
        x: 0,
        duration: 0.4,
        ease: 'sine.inOut',
      });

      // 4. Return to original position vertically (0.5s)
      timeline.to(character, {
        y: 0,
        duration: 0.5,
        ease: 'power2.in',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 0,
            duration: 0.5,
            ease: 'power2.in',
          },
          `-=${0.5 - GLOW_LAG_SECONDS}`
        );
      }

      break;
    }

    case 'shocked': {
      // Jump with bracket separation

      // 1. Jump up (0.2s)
      timeline.to(character, {
        y: -30,
        duration: 0.2,
        ease: 'power2.out',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: -30 * GLOW_DISTANCE_RATIO, // -23px
            duration: 0.2,
            ease: 'power2.out',
          },
          `-=${0.2 - GLOW_LAG_SECONDS}`
        );
      }

      // 2. Separate brackets (if available)
      if (leftBody && rightBody) {
        timeline.to(
          leftBody,
          {
            x: -15,
            y: -15,
            duration: 0.2,
            ease: 'back.out(2)',
          },
          '-=0.2' // Parallel with jump
        );

        timeline.to(
          rightBody,
          {
            x: 15,
            y: 15,
            duration: 0.2,
            ease: 'back.out(2)',
          },
          '-=0.2' // Parallel with jump
        );

        // 3. Shake while separated (3 oscillations)
        const shakeTl = gsap.timeline({ repeat: 3, yoyo: true });
        shakeTl.to(character, {
          rotation: 2,
          duration: 0.08,
          ease: 'power1.inOut',
        });
        timeline.add(shakeTl, '-=0.2');

        // 4. Return brackets to normal (after 1.35s)
        timeline.to(
          [leftBody, rightBody],
          {
            x: 0,
            y: 0,
            duration: 0.25,
            ease: 'elastic.out(1, 0.5)',
          },
          '+=1.15' // 1.35s total wait
        );
      }

      // 5. Return character to ground (after 1.4s total)
      timeline.to(
        character,
        {
          y: 0,
          rotation: 0,
          duration: 0.5,
          ease: 'power1.inOut',
        },
        '+=1.2' // Aligned with bracket return
      );

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 0,
            duration: 0.5,
            ease: 'power1.inOut',
          },
          `-=${0.5 - GLOW_LAG_SECONDS}`
        );
      }

      break;
    }

    case 'spin': {
      // Y-axis 720° spin with jump

      const currentRotation = gsap.getProperty(character, 'rotationY') as number;
      const currentY = gsap.getProperty(character, 'y') as number;

      // 1. Jump up if not already elevated (0.3s)
      if (Math.abs(currentY) < 60) {
        timeline.to(character, {
          y: -70,
          duration: 0.3,
          ease: 'power2.out',
        });

        if (glowElements.length > 0) {
          timeline.to(
            glowElements,
            {
              y: -70 * GLOW_DISTANCE_RATIO, // -52.5px
              duration: 0.3,
              ease: 'power2.out',
            },
            `-=${0.3 - GLOW_LAG_SECONDS}`
          );
        }
      }

      // 2. Spin 720° on Y-axis (1.1s)
      timeline.to(
        character,
        {
          rotationY: currentRotation + 720,
          duration: 1.1,
          ease: 'back.out(1.2)',
          onComplete: () => {
            // Normalize rotation to 0-360 range
            const finalRotation = gsap.getProperty(character, 'rotationY') as number;
            gsap.set(character, { rotationY: finalRotation % 360 });
          },
        },
        '-=0.3' // Overlaps with jump
      );

      // 3. Descend after spin (0.35s) - delayed 1.1s
      timeline.to(
        character,
        {
          y: 0,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => {
            gsap.set(character, { rotationY: 0 });
          },
        },
        '+=0.8' // Total 1.1s from spin start
      );

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 0,
            duration: 0.35,
            ease: 'power2.in',
          },
          `-=${0.35 - GLOW_LAG_SECONDS}`
        );
      }

      break;
    }

    default: {
      // No animation for unknown emotion types
      console.warn(`Unknown emotion type: ${emotion}`);
    }
  }

  return timeline;
}
