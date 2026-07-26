export default function MessageDivider({ label }) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justify: 'center', 
        margin: '1.2rem 0 0.6rem 0',
        position: 'relative'
      }}
    >
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center' 
        }}
      >
        <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }} />
      </div>

      <span 
        style={{ 
          position: 'relative', 
          padding: '0.25rem 0.8rem', 
          background: '#0d1117', 
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {label}
      </span>
    </div>
  );
}
