'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  AntyCharacter,
  type AntyCharacterHandle,
  DEFAULT_SEARCH_BAR_CONFIG,
  type SearchBarConfig,
} from '@antfly/anty-embed';

// Helper to format a key event into a shortcut string
function formatShortcut(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.metaKey) parts.push('⌘');
  if (e.ctrlKey) parts.push('⌃');
  if (e.altKey) parts.push('⌥');
  if (e.shiftKey) parts.push('⇧');

  const key = e.key;
  if (!['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
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

// Editable dimension input - displays value, click to edit
function EditableNumber({
  value,
  onChange,
  min,
  max,
  suffix = 'px',
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    const parsed = parseInt(tempValue);
    if (!isNaN(parsed)) {
      // Allow values beyond slider max for manual entry, but respect min
      onChange(Math.max(min, parsed));
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setTempValue(value.toString());
            setIsEditing(false);
          }
        }}
        style={{
          width: '60px',
          padding: '2px 4px',
          fontSize: '12px',
          fontWeight: 500,
          color: '#334155',
          border: '1px solid #8B5CF6',
          borderRadius: '4px',
          outline: 'none',
          textAlign: 'right',
        }}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setTempValue(value.toString());
        setIsEditing(true);
      }}
      style={{
        background: 'none',
        border: 'none',
        padding: '2px 4px',
        fontSize: '12px',
        fontWeight: 500,
        color: '#334155',
        cursor: 'pointer',
        borderRadius: '4px',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {value}{suffix}
    </button>
  );
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

export default function SearchDebugPage() {
  const antyRef = useRef<AntyCharacterHandle>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Search bar config state
  const [width, setWidth] = useState(DEFAULT_SEARCH_BAR_CONFIG.width);
  const [height, setHeight] = useState(DEFAULT_SEARCH_BAR_CONFIG.height);
  const [showBrackets, setShowBrackets] = useState(true);
  const [showGlow, setShowGlow] = useState(true);
  const [borderStyle, setBorderStyle] = useState<'gradient' | 'solid'>('gradient');
  const [placeholder, setPlaceholder] = useState('Ask anything...');
  const [showHotkey, setShowHotkey] = useState(true);
  const [hotkey, setHotkey] = useState('⌘K');

  // Glow is only enabled when border is gradient style
  const effectiveShowGlow = showGlow && borderStyle === 'gradient';

  // Build config object
  const searchConfig: SearchBarConfig = {
    ...DEFAULT_SEARCH_BAR_CONFIG,
    width,
    height,
    showBrackets,
    showGlow: effectiveShowGlow,
    borderStyle,
  };

  // Reset to defaults
  const resetDimensions = () => {
    setWidth(DEFAULT_SEARCH_BAR_CONFIG.width);
    setHeight(DEFAULT_SEARCH_BAR_CONFIG.height);
  };

  const hasCustomDimensions = width !== DEFAULT_SEARCH_BAR_CONFIG.width || height !== DEFAULT_SEARCH_BAR_CONFIG.height;

  // Refresh search bar when config changes (avoids remount/blink)
  // Skip initial render - the searchOnly initialization handles that
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Small delay to let React re-render first
    const timer = setTimeout(() => {
      antyRef.current?.refreshSearchBar?.();
    }, 10);
    return () => clearTimeout(timer);
  }, [width, height, showBrackets, effectiveShowGlow, borderStyle, showHotkey, placeholder, hotkey]);

  // Slider gradient helper
  const sliderGradient = (value: number, min: number, max: number) => {
    const percent = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Main content - centered search bar */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          paddingBottom: panelOpen ? '240px' : '60px',
          transition: 'padding-bottom 0.3s ease',
        }}
      >
        <AntyCharacter
          ref={antyRef}
          searchOnly={true}
          searchEnabled={true}
          searchConfig={searchConfig}
          searchPlaceholder={placeholder}
          searchShortcut={showHotkey ? hotkey : undefined}
        />
      </div>

      {/* Debug Panel Toggle */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        style={{
          position: 'fixed',
          bottom: panelOpen ? 'calc(200px + 12px)' : '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 20px',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          color: '#64748b',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'bottom 0.3s ease, background 0.15s',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ transform: panelOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
          ▲
        </span>
        Options
      </button>

      {/* Debug Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: panelOpen ? '200px' : '0px',
          background: '#f8fafc',
          borderTop: panelOpen ? '1px solid #e2e8f0' : 'none',
          overflow: 'hidden',
          transition: 'height 0.3s ease',
          zIndex: 50,
        }}
      >
        <div
          style={{
            padding: '20px 32px',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {/* Horizontal layout - all options in one row */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Dimensions */}
            <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Dimensions</label>
                {hasCustomDimensions && (
                  <button
                    onClick={resetDimensions}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#64748b',
                      cursor: 'pointer',
                      fontSize: '10px',
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Width</span>
                    <EditableNumber value={width} onChange={setWidth} min={280} max={1000} />
                  </div>
                  <input
                    type="range"
                    min="280"
                    max="1000"
                    value={Math.min(width, 1000)}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: sliderGradient(Math.min(width, 1000), 280, 1000),
                      appearance: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Height</span>
                    <EditableNumber value={height} onChange={setHeight} min={40} max={400} />
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="400"
                    value={Math.min(height, 400)}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: sliderGradient(Math.min(height, 400), 40, 400),
                      appearance: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Visual */}
            <div style={{ flex: '0 0 auto' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '10px', display: 'block' }}>Visual</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={showBrackets}
                    onChange={(e) => setShowBrackets(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: '#8B5CF6' }}
                  />
                  Corners
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: borderStyle === 'solid' ? 'not-allowed' : 'pointer',
                  opacity: borderStyle === 'solid' ? 0.5 : 1,
                  fontSize: '12px',
                  color: '#334155',
                }}>
                  <input
                    type="checkbox"
                    checked={showGlow && borderStyle === 'gradient'}
                    disabled={borderStyle === 'solid'}
                    onChange={(e) => setShowGlow(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: '#8B5CF6' }}
                  />
                  Glow
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#334155' }}>Border:</span>
                  <div style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <button
                      onClick={() => setBorderStyle('gradient')}
                      style={{
                        padding: '3px 10px',
                        border: 'none',
                        background: borderStyle === 'gradient' ? '#8B5CF6' : '#ffffff',
                        color: borderStyle === 'gradient' ? '#ffffff' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}
                    >
                      Gradient
                    </button>
                    <button
                      onClick={() => setBorderStyle('solid')}
                      style={{
                        padding: '3px 10px',
                        border: 'none',
                        borderLeft: '1px solid #e2e8f0',
                        background: borderStyle === 'solid' ? '#8B5CF6' : '#ffffff',
                        color: borderStyle === 'solid' ? '#ffffff' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}
                    >
                      Solid
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: '1 1 240px', minWidth: '200px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '10px', display: 'block' }}>Content</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="Placeholder text"
                  style={{
                    flex: '1 1 140px',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    minWidth: '120px',
                  }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={showHotkey}
                    onChange={(e) => setShowHotkey(e.target.checked)}
                    style={{ width: '14px', height: '14px', accentColor: '#8B5CF6' }}
                  />
                  Hotkey
                </label>
                {showHotkey && <ShortcutCapture value={hotkey} onChange={setHotkey} />}
              </div>
            </div>
          </div>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a href="/" style={{ color: '#7c3aed', textDecoration: 'none', fontSize: '12px' }}>← Playground</a>
            <span style={{ color: '#94a3b8', margin: '0 10px' }}>|</span>
            <a href="/embed" style={{ color: '#7c3aed', textDecoration: 'none', fontSize: '12px' }}>Embed →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
