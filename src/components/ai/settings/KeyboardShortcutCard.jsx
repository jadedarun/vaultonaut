import { Keyboard } from 'lucide-react';

export default function KeyboardShortcutCard() {
  const shortcuts = [
    { key: 'Enter', description: 'Send prompt message' },
    { key: 'Shift + Enter', description: 'Insert new line in prompt' },
    { key: 'Ctrl + Enter', description: 'Force send prompt immediately' },
    { key: 'Ctrl + K', description: 'Focus conversation search bar' },
    { key: 'Ctrl + /', description: 'Focus prompt input textarea' },
    { key: 'Escape', description: 'Cancel active streaming / Close panels / Cancel renaming' }
  ];

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Keyboard size={18} color="var(--color-arctic-1)" />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Keyboard Shortcuts Reference Guide</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
        {shortcuts.map((sc, idx) => (
          <div
            key={idx}
            style={{
              padding: '0.6rem 0.8rem',
              borderRadius: '0.4rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              fontSize: '0.82rem'
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{sc.description}</span>
            <kbd
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.3rem',
                padding: '0.15rem 0.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-arctic-1)',
                fontWeight: 600
              }}
            >
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
