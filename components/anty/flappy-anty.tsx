'use client';

/**
 * Simplified Anty component for FlappyAF game
 * Uses the actual Anty SVG assets
 */

interface FlappyAntyProps {
  expression?: 'idle' | 'happy';
  size?: number;
}

export function FlappyAnty({ expression = 'idle', size = 80 }: FlappyAntyProps) {
  const isHappy = expression === 'happy';

  // Scale eye dimensions proportionally to size (base size is 160px)
  const scaleFactor = size / 160;
  const eyeHeight = 44.52 * scaleFactor;
  const eyeWidth = 18.63 * scaleFactor;

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {/* Right body segment (bottom layer) */}
      <div style={{ position: 'absolute', inset: '13.46% 0 0 13.46%' }}>
        <img alt="" style={{ display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="/anty/body-right.svg" />
      </div>

      {/* Left body segment (top layer) */}
      <div style={{ position: 'absolute', inset: '0 13.15% 13.15% 0' }}>
        <img alt="" style={{ display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="/anty/body-left.svg" />
      </div>

      {/* Left Eye */}
      {isHappy ? (
        <div style={{ position: 'absolute', inset: '33.42% 30.45% 48.51% 55.1%' }}>
          <div style={{ position: 'absolute', inset: '0 0 0.09% 0' }}>
            <img alt="" style={{ display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="/anty/eye-happy-left.svg" />
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', display: 'flex', inset: '33.41% 31.63% 38.76% 56.72%', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: `${eyeHeight}px`,
              width: `${eyeWidth}px`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              preserveAspectRatio="none"
              width="100%"
              height="100%"
              viewBox="0 0 26 55.6528"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              <path
                d="M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z"
                fill="#052333"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Right Eye */}
      {isHappy ? (
        <div style={{ position: 'absolute', inset: '33.37% 56.72% 48.51% 28.78%' }}>
          <div style={{ position: 'absolute', inset: '0 0 0.09% 0' }}>
            <img alt="" style={{ display: 'block', maxWidth: 'none', width: '100%', height: '100%' }} src="/anty/eye-happy-right.svg" />
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', display: 'flex', inset: '33.41% 57.36% 38.76% 31%', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: `${eyeHeight}px`,
              width: `${eyeWidth}px`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              preserveAspectRatio="none"
              width="100%"
              height="100%"
              viewBox="0 0 26 55.6528"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              <path
                d="M1.15413e-10 11.6436C-2.8214e-05 5.21301 5.21305 -5.88744e-05 11.6437 5.01528e-10C18.0742 5.88744e-05 23.2872 5.21305 23.2872 11.6436V44.0092C23.2872 50.4398 18.0742 55.6528 11.6437 55.6528C5.21315 55.6528 0.000170216 50.4398 0.000142003 44.0093L1.15413e-10 11.6436Z"
                fill="#052333"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
