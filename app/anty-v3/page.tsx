'use client';

import { useState, useRef } from 'react';
import gsap from 'gsap';
import { AntyCharacterV3, ActionButtonsV3, HeartMeter, type ButtonName } from '@/components/anty-v3';
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

  const characterRef = useRef<HTMLDivElement>(null);

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
        // Cycle through expressions rapidly
        const expressions: ExpressionName[] = ['happy', 'excited', 'wink', 'thinking', 'curious'];
        let index = 0;
        const interval = setInterval(() => {
          setExpression(expressions[index]);
          index++;
          if (index >= expressions.length) {
            clearInterval(interval);
            setTimeout(() => setExpression('idle'), 500);
          }
        }, 200);
        break;

      case 'play':
        // Trigger wiggle animation + wink expression
        gsap.to(characterElement, {
          rotation: 10,
          duration: 0.15,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 5,
        });
        setExpression('wink');
        setStats((prev) => ({
          ...prev,
          happiness: Math.min(100, prev.happiness + 15),
          energy: Math.max(0, prev.energy - 10),
        }));
        setTimeout(() => setExpression('idle'), 1500);
        break;

      case 'feed':
        // Trigger bounce animation + happy expression
        gsap.to(characterElement, {
          y: -30,
          duration: 0.3,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        });
        setExpression('excited');
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

        setTimeout(() => setExpression('happy'), 1000);
        setTimeout(() => setExpression('idle'), 3000);
        break;
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      <HeartMeter hearts={hearts} />

      <div className="flex-1 flex items-center justify-center">
        <div ref={characterRef}>
          <AntyCharacterV3 stats={stats} expression={expression} />
        </div>
      </div>

      <ActionButtonsV3 onButtonClick={handleButtonClick} />
    </div>
  );
}
