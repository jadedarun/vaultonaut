import { ArrowDown } from 'lucide-react';

export default function JumpToBottom({ visible, onClick }) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '2rem',
        zIndex: 50,
        background: 'rgba(0, 212, 255, 0.2)',
        border: '1px solid rgba(0, 212, 255, 0.4)',
        color: 'var(--color-arctic-1)',
        borderRadius: '2rem',
        padding: '0.4rem 0.9rem',
        fontSize: '0.78rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.35)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)'}
    >
      <span>Jump to Latest</span>
      <ArrowDown size={13} />
    </button>
  );
}
