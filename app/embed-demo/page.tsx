'use client';

/**
 * Embed Demo Page - Currently Disabled
 *
 * This page will showcase the production-ready embeddable components:
 * - AntyHero: Large character for landing pages
 * - AntyWidget: Corner assistant widget
 * - AntySearchOverlay: Cmd+K style search
 * - AntyChatPanel: Standalone chat panel
 *
 * These components are planned for future development.
 */

export default function EmbedDemoPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
        padding: '40px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '16px',
          }}
        >
          🚧 Coming Soon
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '24px',
          }}
        >
          The embeddable Anty components (AntyHero, AntyWidget, AntySearchOverlay, AntyChatPanel)
          are currently under development.
        </p>
        <p
          style={{
            fontSize: '14px',
            color: '#94a3b8',
          }}
        >
          Visit <a href="/" style={{ color: '#8B5CF6', textDecoration: 'none' }}>/</a> to see the playground with the core AntyCharacter component.
        </p>
      </div>
    </div>
  );
}
