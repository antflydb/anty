/**
 * Emotion Animation Interpreter
 *
 * Generic interpreter that builds GSAP timelines from declarative EmotionConfig.
 * This is the ONLY place where emotion animations are created from configs.
 *
 * ~100 lines replacing the 960-line createEmotionAnimation function.
 */

import gsap from 'gsap';
import type { EmotionConfig, EyeConfig, EyePhase, CharacterPhase, GlowConfig, BodyConfig } from '../types';
import { createEyeAnimation } from './eye-animations';
import { resetEyesToIdle } from '../initialize';
// NOTE: GLOW_CONSTANTS removed - glow following now handled by GlowSystem

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

  // Track pending delayed reset so we can kill it on interrupt
  let pendingResetCall: gsap.core.Tween | null = null;

  const doReset = () => {
    // Reset rotation if configured
    if (config.resetRotation) {
      gsap.set(character, { rotation: 0 });
    }
    if (config.resetRotationY) {
      gsap.set(character, { rotationY: 0 });
    }

    // Reset eyes to IDLE (duration configurable per emotion)
    resetEyesToIdle(elements, config.eyeResetDuration ?? 0);

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
        pendingResetCall = gsap.delayedCall(config.holdDuration, doReset);
      } else {
        doReset();
      }
    },
    onInterrupt: () => {
      // Kill any pending delayed reset when interrupted
      if (pendingResetCall) {
        pendingResetCall.kill();
        pendingResetCall = null;
      }
      // Do immediate reset on interrupt (no delay)
      doReset();
    },
  });

  // ===========================
  // Eye Animation (static, applied once at start)
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

  // ===========================
  // Eye Phases (dynamic, per-keyframe)
  // Must be added AFTER character phases so timeline has correct duration
  // ===========================
  if (config.eyePhases && eyeLeft && eyeRight && eyeLeftPath && eyeRightPath && eyeLeftSvg && eyeRightSvg) {
    addEyePhases(timeline, config.eyePhases, elements);
  }

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
    const bunch = eyeConfig.bunch ?? 0;

    // Handle per-eye or shared offsets
    const leftYOffset = typeof eyeConfig.yOffset === 'object' ? eyeConfig.yOffset.left : (eyeConfig.yOffset ?? 0);
    const rightYOffset = typeof eyeConfig.yOffset === 'object' ? eyeConfig.yOffset.right : (eyeConfig.yOffset ?? 0);
    const leftXOffset = typeof eyeConfig.xOffset === 'object' ? eyeConfig.xOffset.left : (eyeConfig.xOffset ?? 0);
    const rightXOffset = typeof eyeConfig.xOffset === 'object' ? eyeConfig.xOffset.right : (eyeConfig.xOffset ?? 0);

    // Left eye: moves in direction + bunches towards center
    timeline.to(eyeLeft, {
      y: leftYOffset,
      x: leftXOffset + bunch,
      scaleX: eyeConfig.scale ?? 1,
      scaleY: eyeConfig.scale ?? 1,
      duration: eyeConfig.duration,
      ease: 'power2.out',
    }, eyePosition);

    // Right eye: moves in direction - bunches towards center
    timeline.to(eyeRight, {
      y: rightYOffset,
      x: rightXOffset - bunch,
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

  // Eye return animation (for shocked - scale back down)
  if (eyeConfig.returnPosition !== undefined) {
    const returnDuration = eyeConfig.returnDuration ?? 0.25;
    timeline.to([eyeLeft, eyeRight], {
      scaleX: 1,
      scaleY: 1,
      y: 0,
      x: 0,
      duration: returnDuration,
      ease: 'power2.out',
    }, eyeConfig.returnPosition);
  }
}

/**
 * Add per-phase eye animations (for dynamic eye changes during animation)
 */
function addEyePhases(
  timeline: gsap.core.Timeline,
  eyePhases: EyePhase[],
  elements: EmotionElements
): void {
  const { eyeLeft, eyeRight, eyeLeftPath, eyeRightPath, eyeLeftSvg, eyeRightSvg } = elements;

  if (!eyeLeft || !eyeRight || !eyeLeftPath || !eyeRightPath || !eyeLeftSvg || !eyeRightSvg) {
    return;
  }

  for (const phase of eyePhases) {
    const eyeTl = createEyeAnimation(
      {
        leftEye: eyeLeft,
        rightEye: eyeRight,
        leftEyePath: eyeLeftPath,
        rightEyePath: eyeRightPath,
        leftEyeSvg: eyeLeftSvg,
        rightEyeSvg: eyeRightSvg,
      },
      phase.shape,
      { duration: phase.duration }
    );

    timeline.add(eyeTl, phase.position);
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
  const returnPosition = bodyConfig.returnPosition ?? '+=1.15';
  const returnDuration = bodyConfig.returnDuration ?? 0.25;
  const returnEase = bodyConfig.returnEase ?? 'elastic.out(1, 0.5)';

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

  // Return brackets
  timeline.to([leftBody, rightBody], {
    x: 0,
    y: 0,
    duration: returnDuration,
    ease: returnEase,
  }, returnPosition);
}

/**
 * Add character movement phases
 * NOTE: Glow following is now handled by GlowSystem via physics-based tracking
 */
function addCharacterPhases(
  timeline: gsap.core.Timeline,
  phases: CharacterPhase[],
  character: HTMLElement,
  _glowElements: HTMLElement[],
  _glowConfig?: GlowConfig
): void {
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

    // NOTE: Glow following removed - GlowSystem tracks character position via physics
  }
}
