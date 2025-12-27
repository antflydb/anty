/**
 * Emotion Animation Interpreter
 *
 * Generic interpreter that builds GSAP timelines from declarative EmotionConfig.
 * This is the ONLY place where emotion animations are created from configs.
 *
 * ~100 lines replacing the 960-line createEmotionAnimation function.
 */

import gsap from 'gsap';
import type { EmotionConfig, EyeConfig, CharacterPhase, GlowConfig, BodyConfig } from '../types';
import { createEyeAnimation } from './eye-animations';
import { GLOW_CONSTANTS } from './emotions';
import { resetEyesToIdle } from '../initialize';

/**
 * Elements required for emotion animations
 */
export interface EmotionElements {
  character: HTMLElement;
  eyeLeft?: HTMLElement | null;
  eyeRight?: HTMLElement | null;
  eyeLeftPath?: SVGPathElement | null;
  eyeRightPath?: SVGPathElement | null;
  eyeLeftSvg?: SVGSVGElement | null;
  eyeRightSvg?: SVGSVGElement | null;
  innerGlow?: HTMLElement | null;
  outerGlow?: HTMLElement | null;
  leftBody?: HTMLElement | null;
  rightBody?: HTMLElement | null;
}

/**
 * Interpret an EmotionConfig and build a GSAP timeline
 *
 * @param config - Declarative emotion configuration
 * @param elements - DOM elements to animate
 * @returns GSAP timeline ready to play
 */
export function interpretEmotionConfig(
  config: EmotionConfig,
  elements: EmotionElements
): gsap.core.Timeline {
  const { character, eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg, innerGlow, outerGlow, leftBody, rightBody } = elements;
  const glowElements = [innerGlow, outerGlow].filter(Boolean) as HTMLElement[];

  const doReset = () => {
    // Reset rotation if configured
    if (config.resetRotation) {
      gsap.set(character, { rotation: 0 });
    }
    if (config.resetRotationY) {
      gsap.set(character, { rotationY: 0 });
    }

    // Reset eyes to IDLE
    resetEyesToIdle(elements);

    // Reset body brackets if they were animated
    if (config.body && leftBody && rightBody) {
      gsap.set([leftBody, rightBody], { x: 0, y: 0 });
    }
  };

  const timeline = gsap.timeline({
    paused: true, // Don't auto-play - controller will play when ready
    onComplete: () => {
      // If holdDuration is set, wait before resetting (for look animations)
      if (config.holdDuration) {
        gsap.delayedCall(config.holdDuration, doReset);
      } else {
        doReset();
      }
    },
  });

  // ===========================
  // Eye Animation
  // ===========================
  if (config.eyes && eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
    addEyeAnimation(timeline, config.eyes, elements);
  }

  // ===========================
  // Body Bracket Animation (shocked)
  // ===========================
  if (config.body && leftBody && rightBody) {
    addBodyAnimation(timeline, config.body, leftBody, rightBody);
  }

  // ===========================
  // Character Movement Phases
  // ===========================
  addCharacterPhases(timeline, config.character, character, glowElements, config.glow);

  return timeline;
}

/**
 * Add eye animation to timeline
 */
function addEyeAnimation(
  timeline: gsap.core.Timeline,
  eyeConfig: EyeConfig,
  elements: EmotionElements
): void {
  const { eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;

  if (!eyeLeft || !eyeRight || !eyeLeftPath || !eyeRightPath || !eyeLeftSvg || !eyeRightSvg) {
    return;
  }

  // Create eye morph animation
  const eyeTl = createEyeAnimation(
    {
      leftEye: eyeLeft,
      rightEye: eyeRight,
      leftEyePath: eyeLeftPath,
      rightEyePath: eyeRightPath,
      leftEyeSvg: eyeLeftSvg,
      rightEyeSvg: eyeRightSvg,
    },
    eyeConfig.shape,
    { duration: eyeConfig.duration }
  );

  const eyePosition = eyeConfig.delay ?? 0;
  timeline.add(eyeTl, eyePosition);

  // Eye position/transform animations
  if (eyeConfig.yOffset !== undefined || eyeConfig.xOffset !== undefined || eyeConfig.scale !== undefined || eyeConfig.bunch !== undefined) {
    const xOffset = eyeConfig.xOffset ?? 0;
    const bunch = eyeConfig.bunch ?? 0;

    // Left eye: moves in direction + bunches towards center
    timeline.to(eyeLeft, {
      y: eyeConfig.yOffset ?? 0,
      x: xOffset + bunch,
      scaleX: eyeConfig.scale ?? 1,
      scaleY: eyeConfig.scale ?? 1,
      duration: eyeConfig.duration,
      ease: 'power2.out',
    }, eyePosition);

    // Right eye: moves in direction - bunches towards center
    timeline.to(eyeRight, {
      y: eyeConfig.yOffset ?? 0,
      x: xOffset - bunch,
      scaleX: eyeConfig.scale ?? 1,
      scaleY: eyeConfig.scale ?? 1,
      duration: eyeConfig.duration,
      ease: 'power2.out',
    }, eyePosition);
  }

  // Eye rotations (for sad/angry) - happen during the morph, not after
  // Note: Right eye shape is already mirrored at the path level,
  // so rotation values are simply applied directly (no scaleX flip needed)
  if (eyeConfig.leftRotation !== undefined) {
    timeline.to(eyeLeft, {
      rotation: eyeConfig.leftRotation,
      duration: eyeConfig.duration,
      ease: 'power2.out',
    }, eyePosition);
  }

  if (eyeConfig.rightRotation !== undefined) {
    timeline.to(eyeRight, {
      rotation: eyeConfig.rightRotation,
      duration: eyeConfig.duration,
      ease: 'power2.out',
    }, eyePosition);
  }
}

/**
 * Add body bracket animation (shocked)
 */
function addBodyAnimation(
  timeline: gsap.core.Timeline,
  bodyConfig: BodyConfig,
  leftBody: HTMLElement,
  rightBody: HTMLElement
): void {
  const duration = bodyConfig.duration ?? 0.2;
  const ease = bodyConfig.ease ?? 'back.out(2)';

  // Separate brackets
  timeline.to(leftBody, {
    x: bodyConfig.leftX ?? 0,
    y: bodyConfig.leftY ?? 0,
    duration,
    ease,
  }, 0);

  timeline.to(rightBody, {
    x: bodyConfig.rightX ?? 0,
    y: bodyConfig.rightY ?? 0,
    duration,
    ease,
  }, 0);

  // Return brackets (after a delay based on config)
  timeline.to([leftBody, rightBody], {
    x: 0,
    y: 0,
    duration: 0.25,
    ease: 'elastic.out(1, 0.5)',
  }, '+=1.15');
}

/**
 * Add character movement phases with glow coordination
 */
function addCharacterPhases(
  timeline: gsap.core.Timeline,
  phases: CharacterPhase[],
  character: HTMLElement,
  glowElements: HTMLElement[],
  glowConfig?: GlowConfig
): void {
  const distanceRatio = glowConfig?.distanceRatio ?? GLOW_CONSTANTS.DISTANCE_RATIO;
  const lag = glowConfig?.lag ?? GLOW_CONSTANTS.LAG_SECONDS;

  let isFirstPhase = true;
  for (const phase of phases) {
    // First phase starts at 0, others sequence naturally or use explicit position
    const position = phase.position ?? (isFirstPhase ? 0 : undefined);
    isFirstPhase = false;

    // Animate character
    timeline.to(character, {
      ...phase.props,
      duration: phase.duration,
      ease: phase.ease,
    }, position);

    // Animate glows if configured to follow
    if (glowConfig?.follow && glowElements.length > 0 && phase.props.y !== undefined) {
      timeline.to(glowElements, {
        y: phase.props.y * distanceRatio,
        duration: phase.duration,
        ease: phase.ease,
      }, typeof position === 'number' ? position + lag : `-=${phase.duration - lag}`);
    }
  }
}
