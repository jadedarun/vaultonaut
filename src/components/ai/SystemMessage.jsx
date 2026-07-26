import { Info } from 'lucide-react';

export default function SystemMessage({ message }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '0.8rem 0' }}>
      <div 
        style={{ 
          padding: '0.4rem 0.9rem', 
          borderRadius: '1rem', 
          background: 'rgba(255, 255, 255, 0.04)', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}
      >
        <Info size={13} color="var(--color-arctic-1)" />
        <span>{message.content}</span>
      </div>
    </div>
  );
}
