'use client';

import { useState } from 'react';
import { AntyCharacter } from './anty-character';
import type { Expression } from '@/lib/anty/expressions';
import { useRandomBlink } from '@/hooks/anty/use-random-blink';

/**
 * AntyDemo - Example component demonstrating the full animation system
 *
 * This component shows how to:
 * 1. Use AntyCharacter with different expressions
 * 2. Integrate the useRandomBlink hook
 * 3. Control blinking during user interactions
 * 4. Handle expression changes
 */
export function AntyDemo() {
  const [expression, setExpression] = useState<Expression>('idle');
  const [pauseBlinking, setPauseBlinking] = useState(false);

  // Hook integrates random blinking with the character
  const { isBlinking, triggerBlink, resetTimer } = useRandomBlink({
    currentExpression: expression,
    onBlinkStart: () => console.log('Blink started'),
    onBlinkEnd: () => console.log('Blink ended'),
    pauseBlinking,
    enabled: true,
  });

  const expressions: Expression[] = [
    'logo',
    'idle',
    'happy',
    'sad',
    'excited',
    'tired',
    'sleepy',
    'wink',
    'thinking',
    'confused',
    'sick',
    'proud',
    'angry',
    'curious'
  ];

  const handleExpressionChange = (newExpression: Expression) => {
    setExpression(newExpression);
    // Reset blink timer when expression changes for natural feel
    resetTimer();
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Anty Character Demo</h2>
        <p className="text-muted-foreground">
          Watch the character float and blink automatically
        </p>
      </div>

      {/* Main character display */}
      <div className="relative">
        <AntyCharacter
          expression={expression}
          isBlinking={isBlinking}
          size={200}
          onHoverChange={(isHovered) => {
            // Optionally pause blinking during hover
            // setPauseBlinking(isHovered);
          }}
        />
      </div>

      {/* Expression controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {expressions.map((exp) => (
            <button
              key={exp}
              onClick={() => handleExpressionChange(exp)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                expression === exp
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-accent'
              }`}
            >
              {exp.charAt(0).toUpperCase() + exp.slice(1)}
            </button>
          ))}
        </div>

        {/* Manual controls */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={triggerBlink}
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            Trigger Blink
          </button>
          <button
            onClick={() => setPauseBlinking(!pauseBlinking)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              pauseBlinking
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/80'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {pauseBlinking ? 'Resume Blinking' : 'Pause Blinking'}
          </button>
        </div>
      </div>

      {/* Status display */}
      <div className="text-sm text-muted-foreground text-center">
        <p>Current Expression: <span className="font-semibold">{expression}</span></p>
        <p>Blinking: <span className="font-semibold">{isBlinking ? 'Yes' : 'No'}</span></p>
        <p>Auto-Blink: <span className="font-semibold">{pauseBlinking ? 'Paused' : 'Active'}</span></p>
      </div>
    </div>
  );
}
