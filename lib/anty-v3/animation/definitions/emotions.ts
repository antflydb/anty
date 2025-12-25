/**
 * Emotion Animation Definitions
 * Pure functions that create GSAP timelines for emotional expressions
 */

import gsap from 'gsap';
import { createEyeAnimation, type EyeAnimationElements } from './eye-animations';
import { EYE_SHAPES, EYE_DIMENSIONS } from './eye-shapes';
import type { EmotionType } from '../types';

export interface EmotionAnimationElements {
  character: HTMLElement;
  leftBody?: HTMLElement;
  rightBody?: HTMLElement;
  innerGlow?: HTMLElement;
  outerGlow?: HTMLElement;
  // Eye elements
  eyeLeft?: HTMLElement;
  eyeRight?: HTMLElement;
  eyeLeftPath?: SVGPathElement;
  eyeRightPath?: SVGPathElement;
  eyeLeftSvg?: SVGSVGElement;
  eyeRightSvg?: SVGSVGElement;
}

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
  const { character, leftBody, rightBody, innerGlow, outerGlow, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];

  const timeline = gsap.timeline({
    onComplete: () => {
      // Reset rotation after excited animation
      if (emotion === 'excited') {
        gsap.set(character, { rotation: 0 });
      }

      // Reset rotationY after spin animation (force to 0 for clean idle start)
      if (emotion === 'spin') {
        gsap.set(character, { rotationY: 0 });
      }

      // Reset eyes to IDLE shape after any emotion
      // This ensures eyes return to neutral state when emotion completes
      if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        const idlePath = EYE_SHAPES['IDLE'];
        const idleDimensions = EYE_DIMENSIONS['IDLE'];

        // Reset path to IDLE shape
        gsap.set([eyeLeftPath, eyeRightPath], {
          attr: { d: idlePath },
        });

        // Reset viewBox ONLY - no width/height
        // Container stays fixed at 18.63×44.52px via CSS
        gsap.set([eyeLeftSvg, eyeRightSvg], {
          attr: { viewBox: idleDimensions.viewBox },
        });

        // Reset any scaling from shocked emotion
        gsap.set([eyeLeft, eyeRight], {
          scaleX: 1,
          scaleY: 1,
        });

        // REMOVED: Container dimension reset - containers stay fixed at CSS defaults
        // REMOVED: SVG width/height reset
      }
    },
  });

  switch (emotion) {
    case 'happy': {
      // Eye animation - merge into timeline at position 0
      if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        const eyeTl = createEyeAnimation({
          leftEye: eyeLeft,
          rightEye: eyeRight,
          leftEyePath: eyeLeftPath,
          rightEyePath: eyeRightPath,
          leftEyeSvg: eyeLeftSvg,
          rightEyeSvg: eyeRightSvg,
        }, 'HAPPY', { duration: 0.2 });

        timeline.add(eyeTl, 0); // Add at start

        // Move eyes up
        timeline.to([eyeLeft, eyeRight], {
          y: -10,
          duration: 0.2,
          ease: 'power2.out',
        }, 0);

        // Reset position at end
        timeline.to([eyeLeft, eyeRight], {
          y: 0,
          duration: 0.15,
          ease: 'power2.in',
        });
      }

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
      // Add happy eyes to excited emotion
      if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        const eyeTl = createEyeAnimation({
          leftEye: eyeLeft,
          rightEye: eyeRight,
          leftEyePath: eyeLeftPath,
          rightEyePath: eyeRightPath,
          leftEyeSvg: eyeLeftSvg,
          rightEyeSvg: eyeRightSvg,
        }, 'HAPPY', { duration: 0.2 });

        timeline.add(eyeTl, 0);

        // Move eyes up
        timeline.to([eyeLeft, eyeRight], {
          y: -10,
          duration: 0.2,
          ease: 'power2.out',
        }, 0);

        // Reset eyes at the end
        timeline.to([eyeLeft, eyeRight], {
          y: 0,
          duration: 0.15,
          ease: 'power2.in',
        });
      }

      // Epic jump with 360° rotation and multi-bounce landing

      // CRITICAL: Reset rotation to 0 before starting to avoid additive rotation issues
      gsap.set(character, { rotation: 0 });

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

      // 2. Hold at apex (0.3s) - maintain 360° rotation
      timeline.to(character, {
        y: -70,
        rotation: 360,
        duration: 0.3,
        ease: 'none', // No easing for hold
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
      // Eye animation - merge into timeline at position 0
      if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        const eyeTl = createEyeAnimation({
          leftEye: eyeLeft,
          rightEye: eyeRight,
          leftEyePath: eyeLeftPath,
          rightEyePath: eyeRightPath,
          leftEyeSvg: eyeLeftSvg,
          rightEyeSvg: eyeRightSvg,
        }, 'SAD', { duration: 0.2 });

        timeline.add(eyeTl, 0); // Add at start

        // Rotate eyes: left -15deg, right -15deg + flip (after morph completes)
        timeline.to(eyeLeft, {
          rotation: -15,
          duration: 0.15,
          ease: 'power2.out',
        }, 0.2);

        timeline.to(eyeRight, {
          rotation: -15,
          scaleX: -1, // Flip horizontally
          duration: 0.15,
          ease: 'power2.out',
        }, 0.2);
      }

      // Droop down (NO scale change - keep native size)
      timeline.to(character, {
        y: 10,
        rotation: 0,
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

      // Reset eye rotations
      if (eyeLeft && eyeRight) {
        timeline.to([eyeLeft, eyeRight], {
          rotation: 0,
          scaleX: 1,
          duration: 0.4,
          ease: 'power2.in',
        }, '-=0.4');
      }

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
      // Eye animation - merge into timeline at position 0
      if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        const eyeTl = createEyeAnimation({
          leftEye: eyeLeft,
          rightEye: eyeRight,
          leftEyePath: eyeLeftPath,
          rightEyePath: eyeRightPath,
          leftEyeSvg: eyeLeftSvg,
          rightEyeSvg: eyeRightSvg,
        }, 'ANGRY', { duration: 0.2 });

        timeline.add(eyeTl, 0); // Add at start

        // Rotate eyes: left 20deg, right 20deg + flip (after morph completes)
        timeline.to(eyeLeft, {
          rotation: 20,
          duration: 0.15,
          ease: 'power2.out',
        }, 0.2);

        timeline.to(eyeRight, {
          rotation: 20,
          scaleX: -1, // Flip horizontally
          duration: 0.15,
          ease: 'power2.out',
        }, 0.2);
      }

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

      // Reset eye rotations
      if (eyeLeft && eyeRight) {
        timeline.to([eyeLeft, eyeRight], {
          rotation: 0,
          scaleX: 1,
          duration: 0.5,
          ease: 'power2.in',
        }, '-=0.5');
      }

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
      // Eye animation - scale eyes larger while keeping IDLE shape
      if (eyeLeft && eyeRight) {
        timeline.to([eyeLeft, eyeRight], {
          scaleX: 1.4,
          scaleY: 1.4,
          duration: 0.2,
          ease: 'power2.out',
        }, 0); // Add at start
      }

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

      // 6. Reset eye scale - start earlier to scale down with body descent
      if (eyeLeft && eyeRight) {
        timeline.to([eyeLeft, eyeRight], {
          scaleX: 1,
          scaleY: 1,
          duration: 0.5,
          ease: 'power2.in',
        }, '-=0.5'); // Start when character descent starts
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

      // 2. Spin 360° on Y-axis (1.1s)
      timeline.to(
        character,
        {
          rotationY: currentRotation + 360,
          duration: 1.1,
          ease: 'back.out(1.2)',
        },
        '-=0.3' // Overlaps with jump
      );

      // 3. Descend after spin (0.35s) - delayed 1.1s
      // Rotation reset handled by timeline onComplete callback (line 72-74)
      timeline.to(
        character,
        {
          y: 0,
          duration: 0.35,
          ease: 'power2.in',
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

    case 'jump': {
      // Jump animation with optional lightbulb emoji and configurable descent
      // Options: showLightbulb (default true), quickDescent (default false)

      const showLightbulb = options?.showLightbulb !== false; // Default true
      const quickDescent = options?.quickDescent === true; // Default false

      // Different jump heights based on use case
      const jumpHeight = quickDescent ? -60 : -35; // Quick jump = higher, float = lower
      const upDuration = quickDescent ? 0.3 : 0.4;
      const holdDuration = quickDescent ? 0 : 1.2; // Quick jump has no hold
      const descentDuration = quickDescent ? 0.3 : 0.5;

      // Eye animation - scale up and lift during jump
      if (eyeLeft && eyeRight) {
        timeline.to([eyeLeft, eyeRight], {
          scaleX: 1.15,
          scaleY: 1.15,
          y: -5,
          duration: upDuration,
          ease: 'power2.out',
        }, 0);

        // Hold if not quick jump
        if (holdDuration > 0) {
          timeline.to([eyeLeft, eyeRight], {
            scaleX: 1.15,
            scaleY: 1.15,
            y: -5,
            duration: holdDuration,
            ease: 'none',
          });
        }

        // Reset eyes
        timeline.to([eyeLeft, eyeRight], {
          scaleX: 1,
          scaleY: 1,
          y: 0,
          duration: descentDuration,
          ease: 'power2.in',
        });
      }

      // 1. Jump up
      timeline.to(character, {
        y: jumpHeight,
        scale: quickDescent ? 1 : 1.05,
        rotation: 0,
        duration: upDuration,
        ease: quickDescent ? 'power2.out' : 'back.out(2)',
      }, 0);

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: jumpHeight * GLOW_DISTANCE_RATIO,
            duration: upDuration,
            ease: quickDescent ? 'power2.out' : 'back.out(2)',
          },
          `-=${upDuration - GLOW_LAG_SECONDS}`
        );
      }

      // 2. Hold at peak (only if not quick jump)
      if (holdDuration > 0) {
        timeline.to(character, {
          y: jumpHeight,
          scale: 1.05,
          duration: holdDuration,
          ease: 'none',
        });

        if (glowElements.length > 0) {
          timeline.to(
            glowElements,
            {
              y: jumpHeight * GLOW_DISTANCE_RATIO,
              duration: holdDuration,
            },
            `-=${holdDuration - GLOW_LAG_SECONDS}`
          );
        }
      }

      // 3. Descend
      timeline.to(character, {
        y: 0,
        scale: 1,
        duration: descentDuration,
        ease: quickDescent ? 'power2.in' : 'elastic.out(1, 0.5)',
      });

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            y: 0,
            duration: descentDuration,
            ease: quickDescent ? 'power2.in' : 'elastic.out(1, 0.5)',
          },
          `-=${descentDuration - GLOW_LAG_SECONDS}`
        );
      }

      break;
    }

    case 'lookaround': {
      // Look left then right in sequence with rotation
      // Character tilts/rotates as if looking around

      // 1. Look left (rotate -8 degrees) with subtle movement (0.3s)
      timeline.to(character, {
        rotation: -8,
        x: -10,
        duration: 0.3,
        ease: 'power2.out',
      });

      // 2. Hold left position (0.5s)
      timeline.to(character, {
        rotation: -8,
        x: -10,
        duration: 0.5,
        ease: 'none',
      });

      // 3. Transition to right (rotate +8 degrees) (0.4s)
      timeline.to(character, {
        rotation: 8,
        x: 10,
        duration: 0.4,
        ease: 'power2.inOut',
      });

      // 4. Hold right position (0.5s)
      timeline.to(character, {
        rotation: 8,
        x: 10,
        duration: 0.5,
        ease: 'none',
      });

      // 5. Return to center (0.3s)
      timeline.to(character, {
        rotation: 0,
        x: 0,
        duration: 0.3,
        ease: 'power2.in',
      });

      break;
    }

    case 'wink': {
      // Eye animation - asymmetric wink (left eye winks, right eye stays idle)
      if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        const eyeTl = createEyeAnimation({
          leftEye: eyeLeft,
          rightEye: eyeRight,
          leftEyePath: eyeLeftPath,
          rightEyePath: eyeRightPath,
          leftEyeSvg: eyeLeftSvg,
          rightEyeSvg: eyeRightSvg,
        }, { left: 'HALF', right: 'CLOSED' }, { duration: 0.25, ease: 'power1.inOut' });

        timeline.add(eyeTl, 0); // Add at start

        // Stretch left eye (HALF) taller and top-align it
        timeline.to(eyeLeft, {
          scaleY: 1.25, // Stretch height by ~25%
          y: -5, // Move up to top-align
          duration: 0.25,
          ease: 'power1.inOut',
        }, 0);

        // Reset left eye at end
        timeline.to(eyeLeft, {
          scaleY: 1,
          y: 0,
          duration: 0.25,
          ease: 'power1.inOut',
        });
      }

      // Wink animation - character tilt
      // Just add a subtle character tilt
      timeline.to(character, {
        rotation: -3,
        y: -5,
        duration: 0.25,
        ease: 'power1.inOut',
      });
      timeline.to(character, {
        rotation: -3,
        y: -5,
        duration: 0.4,
      });
      timeline.to(character, {
        rotation: 0,
        y: 0,
        duration: 0.25,
        ease: 'power1.inOut',
      });
      break;
    }

    case 'nod': {
      // Nod animation - vertical head movement (yes/affirm)
      timeline.to(character, {
        y: 8,
        duration: 0.2,
        ease: 'power2.out',
      });
      timeline.to(character, {
        y: -4,
        duration: 0.2,
        ease: 'power2.inOut',
      });
      timeline.to(character, {
        y: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
      break;
    }

    case 'headshake': {
      // Headshake animation - horizontal head movement (no/deny)
      timeline.to(character, {
        x: -6,
        duration: 0.2,
        ease: 'power2.inOut',
      });
      timeline.to(character, {
        x: 6,
        duration: 0.2,
        ease: 'power2.inOut',
      });
      timeline.to(character, {
        x: -6,
        duration: 0.2,
        ease: 'power2.inOut',
      });
      timeline.to(character, {
        x: 0,
        duration: 0.2,
        ease: 'power2.out',
      });
      break;
    }

    case 'look-left':
    case 'look-right': {
      // Eye animation - use LOOK shape and position horizontally
      if (eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
        const eyeTl = createEyeAnimation({
          leftEye: eyeLeft,
          rightEye: eyeRight,
          leftEyePath: eyeLeftPath,
          rightEyePath: eyeRightPath,
          leftEyeSvg: eyeLeftSvg,
          rightEyeSvg: eyeRightSvg,
        }, 'LOOK', { duration: 0.2 });

        timeline.add(eyeTl, 0);

        // Position eyes horizontally
        const xOffset = emotion === 'look-left' ? -3 : 3;
        timeline.to([eyeLeft, eyeRight], {
          x: xOffset,
          duration: 0.2,
          ease: 'power2.out',
        }, 0);

        // Reset position
        timeline.to([eyeLeft, eyeRight], {
          x: 0,
          duration: 0.2,
          ease: 'power2.in',
        }, '+=0.3');
      }

      // Just keep character still or add subtle rotation
      timeline.to(character, {
        rotation: emotion === 'look-left' ? -2 : 2,
        duration: 0.25,
        ease: 'power2.out',
      });
      timeline.to(character, {
        rotation: 0,
        duration: 0.25,
        ease: 'power2.in',
      });
      break;
    }

    case 'super': {
      // Super mode transformation - pulse growth animation (Mario-style)
      // Quick pulse sequence with increasing sizes
      timeline.to(character, {
        scale: 1.15,
        rotation: 0,
        duration: 0.1,
        ease: 'power1.out',
      });
      timeline.to(character, {
        scale: 1.05,
        duration: 0.1,
        ease: 'power1.inOut',
      });
      timeline.to(character, {
        scale: 1.2,
        duration: 0.1,
        ease: 'power1.out',
      });
      timeline.to(character, {
        scale: 1.1,
        duration: 0.1,
        ease: 'power1.inOut',
      });
      timeline.to(character, {
        scale: 1.45,
        duration: 0.15,
        ease: 'back.out(2)',
      });

      // Eyes scale up with character
      if (eyeLeft && eyeRight) {
        timeline.to([eyeLeft, eyeRight], {
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 0.55,
          ease: 'back.out(2)',
        }, 0);
      }

      if (glowElements.length > 0) {
        timeline.to(
          glowElements,
          {
            scale: 1.45,
            duration: 0.55,
            ease: 'back.out(2)',
          },
          0
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
