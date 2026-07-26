import { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

export default function CodeBlock({ language = 'text', code = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        margin: '0.8rem 0',
        borderRadius: '0.6rem',
        background: '#0d1117',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        overflow: 'hidden'
      }}
    >
      {/* Code Block Header */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '0.4rem 0.8rem',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-arctic-1)', textTransform: 'lowercase' }}>
          <Code size={12} />
          {language}
        </span>

        <button
          onClick={handleCopy}
          style={{
            background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: copied ? '#34d399' : '#ccc',
            borderRadius: '0.35rem',
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            transition: 'all 0.15s ease'
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied ✓' : 'Copy Code'}
        </button>
      </div>

      {/* Code Area */}
      <pre
        style={{
          margin: 0,
          padding: '0.9rem',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.84rem',
          lineHeight: '1.5',
          color: '#e6edf3',
          background: 'transparent'
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
