/**
 * Example: Using the Feature Flag System and Migration Helper
 *
 * This file demonstrates how to use the feature flag system to toggle
 * between old and new animation systems in a React component.
 */

import { useRef, useEffect } from 'react';
import { useEyeAnimations } from '../use-eye-animations';
import { useAnimationController } from './use-animation-controller';
import { createMigrationWrapper, getMigrationStatus } from './migration-helper';
import { logAnimationSystemInfo } from './feature-flags';
import type { ExpressionName } from '../animation-state';

/**
 * Example component using the migration system
 */
export function ExampleAntyCharacter() {
  // DOM refs
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const eyeLeftRef = useRef<SVGPathElement>(null);
  const eyeRightRef = useRef<SVGPathElement>(null);

  // Initialize legacy system
  const legacySystem = useEyeAnimations({
    leftEyePathRef: eyeLeftRef,
    rightEyePathRef: eyeRightRef,
  });

  // Initialize new system
  const newSystem = useAnimationController(
    {
      container: containerRef.current,
      character: characterRef.current,
      shadow: shadowRef.current,
      eyeLeft: eyeLeftRef.current as unknown as HTMLElement,
      eyeRight: eyeRightRef.current as unknown as HTMLElement,
    },
    {
      enableLogging: true,
      autoStartIdle: true,
    }
  );

  // Create unified wrapper
  const animations = createMigrationWrapper(legacySystem, newSystem);

  // Log system status on mount
  useEffect(() => {
    logAnimationSystemInfo();

    // Get migration status
    const status = getMigrationStatus(newSystem);
    console.log('Migration Status:', status);
  }, []);

  // Example: Play expression when button clicked
  const handleHappyClick = () => {
    animations.playExpression('happy', { priority: 3 });
  };

  const handleBlinkClick = () => {
    animations.triggerBlink();
  };

  const handleResetClick = () => {
    animations.resetAnimations();
  };

  return (
    <div>
      <div ref={containerRef} className="relative">
        <div ref={characterRef} className="character">
          <svg>
            <path ref={eyeLeftRef} className="eye-left" />
            <path ref={eyeRightRef} className="eye-right" />
          </svg>
        </div>
        <div ref={shadowRef} className="shadow" />
      </div>

      {/* Debug controls */}
      <div className="controls">
        <button onClick={handleHappyClick}>Happy</button>
        <button onClick={handleBlinkClick}>Blink</button>
        <button onClick={handleResetClick}>Reset</button>

        {/* Show which system is active */}
        <div className="status">
          System: {newSystem.isReady ? 'NEW' : 'LEGACY'}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Direct usage without migration wrapper
 *
 * If you just want to test the new system directly
 */
export function ExampleDirectUsage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  const controller = useAnimationController(
    {
      container: containerRef.current,
      character: characterRef.current,
    },
    {
      enableLogging: true,
      autoStartIdle: true,
    }
  );

  const playHappy = () => {
    const success = controller.playEmotion('happy');
    console.log('Played happy emotion:', success);
  };

  const checkState = () => {
    console.log('Current state:', controller.getState());
    console.log('Current emotion:', controller.getEmotion());
    console.log('Is idle:', controller.isIdle());
    console.log('Debug info:', controller.getDebugInfo());
  };

  return (
    <div>
      <div ref={containerRef}>
        <div ref={characterRef}>Character</div>
      </div>

      <button onClick={playHappy}>Play Happy</button>
      <button onClick={checkState}>Check State</button>
      <button onClick={() => controller.pause()}>Pause</button>
      <button onClick={() => controller.resume()}>Resume</button>
    </div>
  );
}

/**
 * Example: Manual feature flag checking
 *
 * If you need to conditionally render based on the active system
 */
export function ExampleConditionalUsage() {
  const { shouldUseNewAnimationController } = await import('./feature-flags');

  if (shouldUseNewAnimationController()) {
    return <NewAnimationComponent />;
  } else {
    return <LegacyAnimationComponent />;
  }
}

function NewAnimationComponent() {
  // Component using new AnimationController
  return <div>Using NEW animation system</div>;
}

function LegacyAnimationComponent() {
  // Component using legacy eye animations
  return <div>Using LEGACY animation system</div>;
}

/**
 * Example: Validation testing
 *
 * Run both systems and validate results
 */
export function ExampleValidation() {
  const eyeLeftRef = useRef<SVGPathElement>(null);
  const eyeRightRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  const legacySystem = useEyeAnimations({
    leftEyePathRef: eyeLeftRef,
    rightEyePathRef: eyeRightRef,
  });

  const newSystem = useAnimationController(
    {
      container: containerRef.current,
      character: characterRef.current,
      eyeLeft: eyeLeftRef.current as unknown as HTMLElement,
      eyeRight: eyeRightRef.current as unknown as HTMLElement,
    },
    { enableLogging: true }
  );

  const testExpression = async (expression: ExpressionName) => {
    const { validateBothSystems } = await import('./migration-helper');
    validateBothSystems(expression, legacySystem, newSystem);
  };

  return (
    <div>
      <div ref={containerRef}>
        <div ref={characterRef}>
          <svg>
            <path ref={eyeLeftRef} />
            <path ref={eyeRightRef} />
          </svg>
        </div>
      </div>

      <h3>Validation Testing</h3>
      <button onClick={() => testExpression('happy')}>Test Happy</button>
      <button onClick={() => testExpression('sad')}>Test Sad</button>
      <button onClick={() => testExpression('excited')}>Test Excited</button>
      <p>Check console for validation results</p>
    </div>
  );
}
