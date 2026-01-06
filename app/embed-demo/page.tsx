'use client';

import { useRef, useState } from 'react';
import {
  AntyCharacter,
  type AntyCharacterHandle,
  type EmotionType,
} from '@antfly/anty-embed';

const EMOTIONS: EmotionType[] = [
  'happy',
  'celebrate',
  'excited',
  'pleased',
  'sad',
  'angry',
  'shocked',
  'wink',
  'smize',
  'idea',
  'spin',
  'jump',
  'nod',
  'headshake',
  'look-around',
  'look-left',
  'look-right',
  'back-forth',
];

const SIZES = [80, 120, 160, 200, 240];

export default function EmbedDemoPage() {
  const antyRef = useRef<AntyCharacterHandle>(null);
  const [size, setSize] = useState(160);
  const [showShadow, setShowShadow] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [isSuperMode, setIsSuperMode] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);

  const playEmotion = (emotion: EmotionType) => {
    antyRef.current?.playEmotion?.(emotion);
    setLastEmotion(emotion);
  };

  const toggleSuperMode = (enabled: boolean) => {
    setIsSuperMode(enabled);
    antyRef.current?.setSuperMode?.(enabled ? 1.45 : null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        padding: '40px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1e293b',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Main Demo Area */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '32px',
            marginBottom: '48px',
          }}
        >
          {/* Character Display */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              border: '1px solid #e2e8f0',
            }}
          >
            <AntyCharacter
              key={`anty-${size}`}
              ref={antyRef}
              size={size}
              expression="idle"
              showShadow={showShadow}
              showGlow={showGlow}
              isSuperMode={isSuperMode}
            />
            {lastEmotion && (
              <p
                style={{
                  marginTop: '24px',
                  fontSize: '14px',
                  color: '#8B5CF6',
                  fontFamily: 'monospace',
                }}
              >
                playEmotion(&apos;{lastEmotion}&apos;)
              </p>
            )}
          </div>

          {/* Controls */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              Configuration
            </h3>

            {/* Size Control */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                Size: {size}px
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: size === s ? 'none' : '1px solid #e2e8f0',
                      background: size === s ? '#8B5CF6' : '#ffffff',
                      color: size === s ? 'white' : '#64748b',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Controls */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                Options
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showShadow}
                    onChange={(e) => setShowShadow(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                  />
                  <span style={{ fontSize: '14px', color: '#334155' }}>Show Shadow</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showGlow}
                    onChange={(e) => setShowGlow(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                  />
                  <span style={{ fontSize: '14px', color: '#334155' }}>Show Glow</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div>
              <label style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                Actions
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => antyRef.current?.killAll?.()}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Reset to Idle
                </button>
                <button
                  onClick={() => toggleSuperMode(!isSuperMode)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSuperMode
                      ? '#64748b'
                      : 'linear-gradient(to right, #f59e0b, #ef4444)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  {isSuperMode ? 'Exit Super Mode' : 'Super Mode (1.45x)'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Emotions Grid */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #e2e8f0',
            marginBottom: '48px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
            Emotions
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '12px',
            }}
          >
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion}
                onClick={() => playEmotion(emotion)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: lastEmotion === emotion
                    ? 'linear-gradient(to right, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))'
                    : '#ffffff',
                  color: lastEmotion === emotion ? '#7c3aed' : '#334155',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #334155',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: '#f1f5f9' }}>
            Usage
          </h3>
          <pre
            style={{
              background: '#0f172a',
              borderRadius: '12px',
              padding: '24px',
              overflow: 'auto',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#a5b4fc',
            }}
          >
{`import { AntyCharacter, type AntyCharacterHandle } from '@antfly/anty-embed';

function App() {
  const antyRef = useRef<AntyCharacterHandle>(null);

  return (
    <AntyCharacter
      ref={antyRef}
      size={${size}}
      expression="idle"
      showShadow={${showShadow}}
      showGlow={${showGlow}}
    />
  );
}

// Trigger emotions programmatically
antyRef.current?.playEmotion('happy');
antyRef.current?.playEmotion('celebrate');

// Super mode
antyRef.current?.setSuperMode(1.45);
antyRef.current?.setSuperMode(null); // exit`}
          </pre>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '48px', color: '#94a3b8', fontSize: '14px' }}>
          <p>
            <a href="/" style={{ color: '#7c3aed', textDecoration: 'none' }}>
              ← Back to Playground
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
