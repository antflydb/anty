'use client';

import { useRef, useState, useEffect } from 'react';
import {
  AntyCharacter,
  type AntyCharacterHandle,
  type EmotionType,
  DEFAULT_SEARCH_BAR_CONFIG,
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

// Helper to format a key event into a shortcut string
function formatShortcut(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.metaKey) parts.push('⌘');
  if (e.ctrlKey) parts.push('⌃');
  if (e.altKey) parts.push('⌥');
  if (e.shiftKey) parts.push('⇧');

  // Add the actual key if it's not just a modifier
  const key = e.key;
  if (!['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
    // Format special keys
    const keyMap: Record<string, string> = {
      'Enter': '↵',
      'Escape': 'Esc',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Backspace': '⌫',
      'Delete': '⌦',
      'Tab': '⇥',
      ' ': 'Space',
    };
    parts.push(keyMap[key] || key.toUpperCase());
  }

  return parts.join('');
}

// Shortcut capture component
function ShortcutCapture({
  value,
  onChange
}: {
  value: string;
  onChange: (shortcut: string) => void;
}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [tempShortcut, setTempShortcut] = useState('');

  useEffect(() => {
    if (!isCapturing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const formatted = formatShortcut(e);
      setTempShortcut(formatted);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only finalize if we have a non-modifier key
      if (tempShortcut && !['⌘', '⌃', '⌥', '⇧'].includes(tempShortcut)) {
        onChange(tempShortcut);
        setIsCapturing(false);
        setTempShortcut('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isCapturing, tempShortcut, onChange]);

  return (
    <button
      onClick={() => {
        setIsCapturing(true);
        setTempShortcut('');
      }}
      onBlur={() => {
        if (isCapturing && !tempShortcut) {
          setIsCapturing(false);
        }
      }}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        border: isCapturing ? '2px solid #8B5CF6' : '1px solid #e2e8f0',
        background: isCapturing ? 'rgba(139, 92, 246, 0.1)' : '#ffffff',
        color: '#334155',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        minWidth: '60px',
        textAlign: 'center',
        transition: 'all 0.15s',
      }}
    >
      {isCapturing ? (tempShortcut || '...') : value}
    </button>
  );
}

export default function EmbedDemoPage() {
  const antyRef = useRef<AntyCharacterHandle>(null);
  const [size, setSize] = useState(160);
  const [showShadow, setShowShadow] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [frozen, setFrozen] = useState(false);
  const [isSuperMode, setIsSuperMode] = useState(false);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<string | null>(null);

  // Search bar options
  const [barWidth, setBarWidth] = useState(DEFAULT_SEARCH_BAR_CONFIG.width);
  const [barHeight, setBarHeight] = useState(DEFAULT_SEARCH_BAR_CONFIG.height);
  const [placeholder, setPlaceholder] = useState('Ask about SearchAF...');
  const [showHotkey, setShowHotkey] = useState(true);
  const [hotkey, setHotkey] = useState('⌘K');

  // Logo mode - static logo state (OFF eyes, no shadow/glow, no animations)
  const [logoMode, setLogoMode] = useState(false);

  // Emotions enabled - triggers power off/on animation
  const [emotionsEnabled, setEmotionsEnabled] = useState(true);

  // Reset search mode when component will remount due to key change
  useEffect(() => {
    setIsSearchMode(false);
  }, [size, searchEnabled, frozen, barWidth, barHeight, showHotkey, logoMode]);

  const toggleEmotions = (enabled: boolean) => {
    setEmotionsEnabled(enabled);
    // The expression prop change will trigger power-off/wake-up animation
  };

  const playEmotion = (emotion: EmotionType) => {
    antyRef.current?.playEmotion?.(emotion);
    setLastEmotion(emotion);
  };

  const toggleSuperMode = (enabled: boolean) => {
    setIsSuperMode(enabled);
    if (enabled) {
      // Play super mode grow animation (like main page)
      antyRef.current?.playEmotion?.('super');
      antyRef.current?.setSuperMode?.(1.45);
    } else {
      // Exit super mode with shrink animation
      antyRef.current?.setSuperMode?.(null);
      const characterElement = antyRef.current?.characterRef?.current;
      if (characterElement) {
        import('gsap').then(({ default: gsap }) => {
          gsap.to(characterElement, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      }
    }
  };

  const toggleSearchMode = () => {
    if (isSearchMode) {
      antyRef.current?.morphToCharacter?.();
    } else {
      antyRef.current?.morphToSearchBar?.();
    }
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
              position: 'relative',
              padding: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
            }}
          >
            <AntyCharacter
              key={`anty-${size}-${searchEnabled}-${frozen}-${barWidth}-${barHeight}-${showHotkey}-${logoMode}`}
              ref={antyRef}
              size={size}
              expression={emotionsEnabled ? 'idle' : 'off'}
              showShadow={showShadow && !logoMode}
              showGlow={showGlow && !logoMode}
              frozen={frozen}
              isSuperMode={isSuperMode}
              logoMode={logoMode}
              searchEnabled={searchEnabled}
              searchPlaceholder={placeholder}
              searchShortcut={showHotkey ? hotkey : undefined}
              searchConfig={{
                ...DEFAULT_SEARCH_BAR_CONFIG,
                width: barWidth,
                height: barHeight,
              }}
              onSearchOpen={() => setIsSearchMode(true)}
              onSearchCloseComplete={() => setIsSearchMode(false)}
            />
            {lastEmotion && (
              <p
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '14px',
                  color: '#8B5CF6',
                  fontFamily: 'monospace',
                  margin: 0,
                }}
              >
                playEmotion(&apos;{lastEmotion}&apos;)
              </p>
            )}
          </div>

          {/* Controls */}
          <div
            style={{
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              Configuration
            </h3>

            {/* Size Control */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', color: '#64748b' }}>
                  Size: <span style={{ fontWeight: 600, color: '#334155' }}>{size}px</span>
                </label>
                {size !== 160 && (
                  <button
                    onClick={() => setSize(160)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                type="range"
                min="24"
                max="320"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${((size - 24) / (320 - 24)) * 100}%, #e2e8f0 ${((size - 24) / (320 - 24)) * 100}%, #e2e8f0 100%)`,
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: size === s ? 'none' : '1px solid #e2e8f0',
                      background: size === s ? '#8B5CF6' : '#ffffff',
                      color: size === s ? 'white' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      minWidth: '40px',
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: logoMode ? 'not-allowed' : 'pointer', opacity: logoMode ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={showShadow}
                    onChange={(e) => setShowShadow(e.target.checked)}
                    disabled={logoMode}
                    style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                  />
                  <span style={{ fontSize: '14px', color: '#334155' }}>Show Shadow</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: logoMode ? 'not-allowed' : 'pointer', opacity: logoMode ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={showGlow}
                    onChange={(e) => setShowGlow(e.target.checked)}
                    disabled={logoMode}
                    style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                  />
                  <span style={{ fontSize: '14px', color: '#334155' }}>Show Glow</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={logoMode}
                    onChange={(e) => setLogoMode(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                  />
                  <span style={{ fontSize: '14px', color: '#334155' }}>Logo Mode</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={frozen}
                    onChange={(e) => setFrozen(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                  />
                  <span style={{ fontSize: '14px', color: '#334155' }}>Frozen (no idle)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={searchEnabled}
                    onChange={(e) => setSearchEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#8B5CF6' }}
                  />
                  <span style={{ fontSize: '14px', color: '#334155' }}>Enable Search</span>
                </label>
              </div>
            </div>

            {/* Search Bar Options */}
            {searchEnabled && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px', display: 'block' }}>
                  Search Bar
                </label>

                {/* Bar Dimensions */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                      Width
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        value={barWidth}
                        onChange={(e) => setBarWidth(Number(e.target.value))}
                        min={200}
                        max={1000}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          textAlign: 'right',
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>px</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                      Height
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        value={barHeight}
                        onChange={(e) => setBarHeight(Number(e.target.value))}
                        min={40}
                        max={200}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          textAlign: 'right',
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>px</span>
                    </div>
                  </div>
                  {/* Fixed-width reset slot */}
                  <div style={{ width: '28px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(barWidth !== DEFAULT_SEARCH_BAR_CONFIG.width || barHeight !== DEFAULT_SEARCH_BAR_CONFIG.height) && (
                      <button
                        onClick={() => {
                          setBarWidth(DEFAULT_SEARCH_BAR_CONFIG.width);
                          setBarHeight(DEFAULT_SEARCH_BAR_CONFIG.height);
                        }}
                        title="Reset to default (642×70)"
                        style={{
                          padding: '4px 6px',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#64748b',
                          cursor: 'pointer',
                          fontSize: '12px',
                          lineHeight: 1,
                        }}
                      >
                        ↺
                      </button>
                    )}
                  </div>
                </div>

                {/* Placeholder Text */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Hotkey Options */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={showHotkey}
                      onChange={(e) => setShowHotkey(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#8B5CF6' }}
                    />
                    <span style={{ fontSize: '13px', color: '#334155' }}>Hotkey</span>
                  </label>
                  {showHotkey && (
                    <ShortcutCapture
                      value={hotkey}
                      onChange={setHotkey}
                    />
                  )}
                </div>
              </div>
            )}

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
                  {isSuperMode ? 'Exit Super Mode' : 'Super Mode'}
                </button>
                {searchEnabled && (
                  <button
                    onClick={toggleSearchMode}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSearchMode
                        ? '#64748b'
                        : 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {isSearchMode ? 'Close Search' : 'Open Search'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Emotions Grid */}
        <div
          style={{
            padding: '32px',
            marginBottom: '48px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: emotionsEnabled ? '20px' : '0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
              Emotions
            </h3>
            {/* Toggle switch */}
            <button
              onClick={() => toggleEmotions(!emotionsEnabled)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '13px', color: emotionsEnabled ? '#334155' : '#94a3b8' }}>
                {emotionsEnabled ? 'On' : 'Off'}
              </span>
              <div
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: emotionsEnabled ? '#8B5CF6' : '#e2e8f0',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: emotionsEnabled ? '22px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </button>
          </div>
          {emotionsEnabled && (
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
          )}
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
