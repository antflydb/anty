'use client';

import { AntyCharacter } from '@anty';

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
      background: '#0a0a0a'
    }}>
      <h1 style={{ color: 'white', fontFamily: 'system-ui' }}>
        Anty Package Test
      </h1>
      <AntyCharacter
        size={160}
        expression="idle"
        showShadow={true}
        showGlow={true}
      />
      <p style={{ color: '#888', fontFamily: 'system-ui' }}>
        If you see Anty above, the import works!
      </p>
    </main>
  );
}
