/**
 * Gesture Animation Definitions
 * Pure functions that create GSAP timelines for character gestures (nod, headshake, wink)
 */

import gsap from 'gsap';

export interface GestureAnimationElements {
  character: HTMLElement;
  leftEye?: HTMLElement;
  rightEye?: HTMLElement;
}

export type GestureType = 'nod' | 'headshake' | 'wink';

/**
 * Creates gesture animation timeline based on gesture type
 *
 * Gestures are coordinated movements:
 * - nod: Vertical head tilt with eye contraction (yes motion)
 * - headshake: Horizontal head rotation with eye contraction (no motion)
 * - wink: Tilt with sparkle particles
 *
 * Eyes coordinate with character movement for natural feel
 *
 * @param gesture - Type of gesture to animate
 * @param elements - Character and optional eye elements
 * @returns GSAP timeline for the gesture animation
 */
export function createGestureAnimation(
  gesture: GestureType,
  elements: GestureAnimationElements
): gsap.core.Timeline {
  const { character, leftEye, rightEye } = elements;
  const eyeElements = [leftEye, rightEye].filter(Boolean) as HTMLElement[];

  const timeline = gsap.timeline();

  // Kill any existing eye animations and reset state
  if (eyeElements.length > 0) {
    gsap.killTweensOf(eyeElements);
    gsap.set(eyeElements, { scaleY: 1, y: 0 });
  }

  // Reset character transforms
  gsap.set(character, {
    scale: 1,
    rotation: 0,
    y: 0,
    rotationY: 0,
    rotationX: 0,
    transformPerspective: 600,
  });

  switch (gesture) {
    case 'nod': {
      // Three vertical nods (yes/affirmative motion)
      // Rotates on X-axis with eyes contracting upward

      for (let i = 0; i < 3; i++) {
        // Tilt forward (down)
        timeline.to(character, {
          rotationX: -35,
          y: 8,
          duration: 0.15,
          ease: 'power2.out',
          transformPerspective: 600,
        });

        // Eyes contract upward during tilt
        if (eyeElements.length > 0) {
          timeline.to(
            eyeElements,
            {
              scaleY: 0.85,
              y: -4,
              duration: 0.15,
              ease: 'power2.out',
            },
            '<' // Synchronized with character
          );
        }

        // Return to center
        const returnDuration = i === 2 ? 0.2 : 0.15; // Last return is slightly longer
        const returnEase = i === 2 ? 'power2.inOut' : 'power2.inOut';

        timeline.to(character, {
          rotationX: 0,
          y: 0,
          duration: returnDuration,
          ease: returnEase,
        });

        if (eyeElements.length > 0) {
          timeline.to(
            eyeElements,
            {
              scaleY: 1,
              y: 0,
              duration: returnDuration,
              ease: returnEase,
            },
            '<'
          );
        }
      }

      break;
    }

    case 'headshake': {
      // Horizontal head shake (no/denial motion)
      // Rotates on Y-axis with eyes contracted downward

      // Contract eyes downward for entire shake
      if (eyeElements.length > 0) {
        timeline.to(
          eyeElements,
          {
            scaleY: 0.85,
            y: 4, // Down instead of up
            duration: 0.18,
            ease: 'power2.out',
          },
          0
        );
      }

      // First shake - rotate left
      timeline.to(
        character,
        {
          rotationY: -45,
          duration: 0.18,
          ease: 'power4.out',
          transformPerspective: 600,
        },
        0
      );

      // Snap to right
      timeline.to(character, {
        rotationY: 45,
        duration: 0.2,
        ease: 'power4.inOut',
      });

      // Snap back to left
      timeline.to(character, {
        rotationY: -45,
        duration: 0.2,
        ease: 'power4.inOut',
      });

      // Snap to right
      timeline.to(character, {
        rotationY: 45,
        duration: 0.2,
        ease: 'power4.inOut',
      });

      // Snap back to left
      timeline.to(character, {
        rotationY: -45,
        duration: 0.2,
        ease: 'power4.inOut',
      });

      // Final return to neutral
      timeline.to(character, {
        rotationY: 0,
        duration: 0.22,
        ease: 'power2.inOut',
      });

      // Return eyes to normal
      if (eyeElements.length > 0) {
        timeline.to(
          eyeElements,
          {
            scaleY: 1,
            y: 0,
            duration: 0.22,
            ease: 'power2.inOut',
          },
          '<'
        );
      }

      break;
    }

    case 'wink': {
      // Subtle tilt and bounce with wink expression
      // Note: Wink expression change is handled separately by expression system

      // Subtle tilt and bounce (0.15s)
      timeline.to(character, {
        rotation: -3,
        y: -5,
        duration: 0.15,
        ease: 'power2.out',
      });

      // Hold the wink (0.4s)
      timeline.to(character, {
        rotation: -3,
        y: -5,
        duration: 0.4,
      });

      // Return to normal (0.2s)
      timeline.to(character, {
        rotation: 0,
        y: 0,
        duration: 0.2,
        ease: 'power2.out',
      });

      // Total duration: 0.75s
      break;
    }

    default: {
      console.warn(`Unknown gesture type: ${gesture}`);
    }
  }

  return timeline;
}
