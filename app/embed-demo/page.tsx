'use client';

import { useState, useRef } from 'react';
import {
  AntyWidget,
  AntyHero,
  AntySearchOverlay,
  AntyChatPanel,
  useWidgetShortcuts,
  type AntyWidgetHandle,
  type AntyHeroHandle,
  type EmotionType,
  type SearchResult,
} from '../../packages/anty-embed/src';

export default function EmbedDemoPage() {
  // Widget state
  const widgetRef = useRef<AntyWidgetHandle>(null);
  const heroRef = useRef<AntyHeroHandle>(null);

  // Search overlay state
  const [searchOpen, setSearchOpen] = useState(false);

  // Standalone chat state
  const [chatOpen, setChatOpen] = useState(false);

  // Last emotion displayed
  const [lastEmotion, setLastEmotion] = useState<EmotionType | null>(null);

  // Register Cmd+K shortcut for search overlay
  useWidgetShortcuts({
    onOpen: () => setSearchOpen(true),
    onClose: () => setSearchOpen(false),
    isOpen: searchOpen,
    enableCmdK: true,
    enableEscape: true,
  });

  // Mock search function
  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    // Mock results
    if (!query.trim()) return [];

    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: `Result for "${query}"`,
        description: 'This is a sample search result from the Anty embed demo.',
      },
      {
        id: '2',
        title: 'Getting Started with SearchAF',
        description: 'Learn how to integrate SearchAF into your application.',
      },
      {
        id: '3',
        title: 'API Documentation',
        description: 'Complete reference for the SearchAF API endpoints.',
      },
    ];

    // Randomly return empty results 20% of the time
    if (Math.random() < 0.2) {
      return [];
    }

    return mockResults;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
        padding: '40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '8px',
          }}
        >
          Anty Embed Demo
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '40px',
          }}
        >
          Testing the production-ready embeddable Anty components
        </p>

        {/* Status bar */}
        {lastEmotion && (
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#166534',
              marginBottom: '32px',
            }}
          >
            Last emotion: <strong>{lastEmotion}</strong>
          </div>
        )}

        {/* Demo sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Section 1: AntyHero */}
          <section
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              overflow: 'visible',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '8px',
              }}
            >
              AntyHero Component
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '24px',
              }}
            >
              Large character for landing pages with idle animations. Click to trigger an
              emotion, hover for a reaction.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                overflow: 'visible',
              }}
            >
              <AntyHero
                ref={heroRef}
                size={200}
                idleVariants={['look-around', 'wink']}
                idleInterval={6000}
                emotionOnHover="happy"
                onActivate={() => {
                  heroRef.current?.playEmotion('celebrate');
                  heroRef.current?.spawnConfetti();
                }}
                onEmotionChange={setLastEmotion}
                showGlow={true}
                showShadow={true}
                showParticles={true}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => heroRef.current?.playEmotion('happy')}
                style={buttonStyle}
              >
                Happy
              </button>
              <button
                onClick={() => heroRef.current?.playEmotion('celebrate')}
                style={buttonStyle}
              >
                Celebrate
              </button>
              <button
                onClick={() => heroRef.current?.playEmotion('sad')}
                style={buttonStyle}
              >
                Sad
              </button>
              <button
                onClick={() => heroRef.current?.spawnConfetti()}
                style={buttonStyle}
              >
                Confetti
              </button>
              <button
                onClick={() => heroRef.current?.spawnSparkles()}
                style={buttonStyle}
              >
                Sparkles
              </button>
              <button
                onClick={() => heroRef.current?.spawnHearts()}
                style={buttonStyle}
              >
                Hearts
              </button>
            </div>
          </section>

          {/* Section 2: Search Overlay */}
          <section
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '8px',
              }}
            >
              AntySearchOverlay Component
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '24px',
              }}
            >
              Full-screen Cmd+K style search overlay. Press{' '}
              <kbd
                style={{
                  padding: '2px 6px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                Cmd+K
              </kbd>{' '}
              or click the button below.
            </p>

            <button
              onClick={() => setSearchOpen(true)}
              style={{
                ...buttonStyle,
                backgroundColor: '#8B5CF6',
                color: 'white',
              }}
            >
              Open Search Overlay
            </button>
          </section>

          {/* Section 3: Chat Panel */}
          <section
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '8px',
              }}
            >
              AntyChatPanel Component
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '24px',
              }}
            >
              Standalone chat panel with OpenAI integration and emotion detection.
            </p>

            <button
              onClick={() => setChatOpen(true)}
              style={{
                ...buttonStyle,
                backgroundColor: '#8B5CF6',
                color: 'white',
              }}
            >
              Open Chat Panel
            </button>
          </section>

          {/* Section 4: Widget Info */}
          <section
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '8px',
              }}
            >
              AntyWidget Component
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '16px',
              }}
            >
              Corner assistant widget. Look at the bottom-right corner of the screen! Click
              the character to open the chat panel.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => widgetRef.current?.playEmotion('excited')}
                style={buttonStyle}
              >
                Trigger Excited
              </button>
              <button
                onClick={() => widgetRef.current?.spawnConfetti()}
                style={buttonStyle}
              >
                Spawn Confetti
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
          }}
        >
          @searchaf/anty-embed v0.2.0
        </div>
      </div>

      {/* AntyWidget - floating in corner */}
      <AntyWidget
        ref={widgetRef}
        position="bottom-right"
        size="medium"
        expandTo="chat"
        onEmotionChange={setLastEmotion}
        showGlow={true}
        showShadow={true}
        showParticles={true}
      />

      {/* Search Overlay */}
      <AntySearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
        onResultSelect={(result) => {
          console.log('Selected:', result);
          setSearchOpen(false);
        }}
        placeholder="Search documentation..."
        onEmotionChange={setLastEmotion}
        characterSize={140}
      />

      {/* Standalone Chat Panel */}
      <AntyChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onEmotionChange={setLastEmotion}
        position="right"
      />
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#f1f5f9',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#475569',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};
