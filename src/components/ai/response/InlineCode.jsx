export default function InlineCode({ children }) {
  return (
    <code
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '0.3rem',
        padding: '0.15rem 0.4rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.85em',
        color: 'var(--color-arctic-1)',
        wordBreak: 'break-word'
      }}
    >
      {children}
    </code>
  );
}
