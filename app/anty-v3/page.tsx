'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { AntyCharacterV3, ActionButtonsV3, HeartMeter, type ButtonName, type AntyCharacterHandle, type EarnedHeart } from '@/components/anty-v3';
import type { ExpressionName } from '@/lib/anty-v3/animation-state';
import type { AntyStats } from '@/lib/anty/stat-system';

export default function AntyV3() {
  const [hearts, setHearts] = useState(3);
  const [expression, setExpression] = useState<ExpressionName>('idle');
  const [stats, setStats] = useState<AntyStats>({
    energy: 100,
    happiness: 100,
    knowledge: 50,
    indexHealth: 100,
  });
  const [earnedHearts, setEarnedHearts] = useState<EarnedHeart[]>([]);

  const characterRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const antyRef = useRef<AntyCharacterHandle>(null);
  const heartTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Animate the glow with ghostly, randomized movement
  useEffect(() => {
    if (!glowRef.current) return;

    const animateGhostly = () => {
      // Random parameters for each animation cycle
      const randomY = gsap.utils.random(-8, -16);
      const randomX = gsap.utils.random(-3, 3);
      const randomScale = gsap.utils.random(0.98, 1.05);
      const randomOpacity = gsap.utils.random(0.7, 1);
      const randomDuration = gsap.utils.random(2.2, 3.5);

      gsap.to(glowRef.current, {
        y: randomY,
        x: randomX,
        scale: randomScale,
        opacity: randomOpacity,
        duration: randomDuration,
        ease: 'sine.inOut',
        onComplete: () => {
          // Return to base state with different random values
          const returnDuration = gsap.utils.random(2, 3.2);
          gsap.to(glowRef.current, {
            y: gsap.utils.random(-2, 2),
            x: gsap.utils.random(-2, 2),
            scale: gsap.utils.random(0.95, 1.02),
            opacity: gsap.utils.random(0.75, 0.95),
            duration: returnDuration,
            ease: 'sine.inOut',
            onComplete: animateGhostly, // Loop with new random values
          });
        },
      });
    };

    animateGhostly();

    return () => {
      gsap.killTweensOf(glowRef.current);
    };
  }, []);

  // Cleanup heart timers on unmount
  useEffect(() => {
    return () => {
      heartTimersRef.current.forEach((timer) => clearTimeout(timer));
      heartTimersRef.current.clear();
    };
  }, []);

  // Function to earn a heart (turn it purple)
  const earnHeart = (index: number) => {
    // Clear any existing timer for this heart
    const existingTimer = heartTimersRef.current.get(index);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Add heart with pulsing animation
    setEarnedHearts((prev) => {
      const filtered = prev.filter((h) => h.index !== index);
      return [...filtered, { index, earnedAt: Date.now(), isPulsing: true }];
    });

    // Stop pulsing after animation completes
    setTimeout(() => {
      setEarnedHearts((prev) =>
        prev.map((h) => (h.index === index ? { ...h, isPulsing: false } : h))
      );
    }, 1200);

    // Set 10-minute timer to remove this earned heart
    const timer = setTimeout(() => {
      setEarnedHearts((prev) => prev.filter((h) => h.index !== index));
      heartTimersRef.current.delete(index);
    }, 10 * 60 * 1000); // 10 minutes

    heartTimersRef.current.set(index, timer);
  };

  const handleButtonClick = (button: ButtonName) => {
    const characterElement = characterRef.current;
    if (!characterElement) return;

    switch (button) {
      case 'chat':
        // Trigger tilt animation + thinking expression
        gsap.to(characterElement, {
          rotation: -5,
          duration: 0.3,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
        setExpression('thinking');
        setStats((prev) => ({ ...prev, knowledge: Math.min(100, prev.knowledge + 10) }));
        setTimeout(() => setExpression('idle'), 2000);
        break;

      case 'moods':
        // Trigger wink!
        setExpression('wink');
        setTimeout(() => setExpression('idle'), 750);
        break;

      case 'play':
        // Trigger wiggle animation + happy eyes
        gsap.to(characterElement, {
          rotation: 10,
          duration: 0.15,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 5,
        });
        setExpression('happy');
        setStats((prev) => ({
          ...prev,
          happiness: Math.min(100, prev.happiness + 15),
          energy: Math.max(0, prev.energy - 10),
        }));
        setTimeout(() => setExpression('idle'), 1500);
        break;

      case 'feed':
        // Epic feeding animation with particle burst!
        // Create a dramatic timeline
        const feedTl = gsap.timeline();

        // Quick anticipation dip
        feedTl.to(characterElement, {
          y: 5,
          scale: 0.95,
          duration: 0.15,
          ease: 'power2.in',
        });

        // Big satisfying bounce UP
        feedTl.to(characterElement, {
          y: -35,
          scale: 1.1,
          rotation: 0,
          duration: 0.4,
          ease: 'back.out(2)',
        });

        // HOLD at peak while food comes in
        feedTl.to(characterElement, {
          y: -35,
          scale: 1.1,
          duration: 1.25, // Hold for 1250ms while food arrives
        });

        // Descend and settle
        feedTl.to(characterElement, {
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
        });

        // Trigger excited expression immediately
        setExpression('excited');

        // SPAWN FOOD IMMEDIATELY - will arrive during hover!
        antyRef.current?.spawnFeedingParticles();

        // Update stats
        setStats((prev) => ({
          ...prev,
          energy: Math.min(100, prev.energy + 20),
          happiness: Math.min(100, prev.happiness + 10),
        }));

        // Update hearts based on energy
        const newEnergy = Math.min(100, stats.energy + 20);
        if (newEnergy >= 70) {
          setHearts(3);
        } else if (newEnergy >= 40) {
          setHearts(2);
        } else {
          setHearts(1);
        }

        // Earn a heart and trigger pulse at happy eyes moment
        setTimeout(() => {
          setExpression('happy');
          // Find first grey (not earned) heart and earn it
          const firstGreyHeart = [0, 1, 2].find(
            (index) => !earnedHearts.find((h) => h.index === index)
          );
          if (firstGreyHeart !== undefined) {
            earnHeart(firstGreyHeart);
          }
        }, 2300);
        setTimeout(() => setExpression('idle'), 4000);
        break;
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      <HeartMeter hearts={hearts} earnedHearts={earnedHearts} />

      <div className="flex-1 flex items-center justify-center pb-12 relative">
        <div style={{ position: 'relative', width: '160px', height: '240px' }}>
          {/* Floating glow behind Anty - Layer 1 (inner, more saturated) */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: '80px',
              width: '120px',
              height: '90px',
              borderRadius: '50%',
              opacity: 1,
              background: 'linear-gradient(90deg, #C5D4FF 0%, #E0C5FF 100%)',
              filter: 'blur(25px)',
              transform: 'translate(-50%, -50%)',
              transformOrigin: 'center center',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Floating glow behind Anty - Layer 2 (outer, softer) */}
          <div
            ref={glowRef}
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: '80px',
              width: '170px',
              height: '130px',
              borderRadius: '50%',
              opacity: 1,
              background: 'linear-gradient(90deg, #D5E2FF 0%, #EED5FF 100%)',
              filter: 'blur(45px)',
              transform: 'translate(-50%, -50%)',
              transformOrigin: 'center center',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div ref={characterRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
            <AntyCharacterV3 ref={antyRef} stats={stats} expression={expression} />
          </div>

          {/* Fixed shadow - doesn't move with character */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: '0px', // At bottom of container
              width: '160px',
              height: '40px',
              background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
              filter: 'blur(12px)',
              borderRadius: '50%',
              opacity: 0.7,
              transform: 'scaleX(1) scaleY(1)', // Initial state - ensures it's visible
              transformOrigin: 'center center',
              pointerEvents: 'none',
            }}
            id="anty-shadow"
          />
        </div>
      </div>

      <ActionButtonsV3 onButtonClick={handleButtonClick} />
    </div>
  );
}
