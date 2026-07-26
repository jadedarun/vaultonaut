export default function UserMessage({ message }) {
  return (
    <div className="chat-msg user" style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.8rem', flexDirection: 'row-reverse' }}>
      <div 
        className="avatar" 
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          fontWeight: 700,
          flexShrink: 0
        }}
      >
        U
      </div>

      <div 
        className="msg-bubble"
        style={{
          background: 'var(--color-arctic-1)',
          color: '#000',
          fontWeight: 500,
          borderRadius: '1rem 0.2rem 1rem 1rem',
          padding: '0.8rem 1.1rem',
          maxWidth: '75%',
          fontSize: '0.92rem',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          boxShadow: '0 4px 12px rgba(0,212,255,0.15)'
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
