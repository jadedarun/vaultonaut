import { useState } from 'react';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';

export default function MessageToolbar({ textContent = '', onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null); // 'up' | 'down' | null

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Copy Response Button */}
      <button
        onClick={handleCopy}
        style={{
          background: copied ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
          border: 'none',
          color: copied ? '#34d399' : 'var(--text-muted)',
          fontSize: '0.75rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.35rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          transition: 'all 0.15s ease'
        }}
        title="Copy complete response text"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        <span>{copied ? 'Copied ✓' : 'Copy'}</span>
      </button>

      {/* Regenerate Placeholder */}
      <button
        onClick={onRegenerate}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.25rem 0.4rem', cursor: 'pointer', opacity: 0.7 }}
        title="Regenerate response (Placeholder)"
      >
        <RefreshCw size={13} />
      </button>

      {/* Thumbs Up Placeholder */}
      <button
        onClick={() => setLiked(liked === 'up' ? null : 'up')}
        style={{ background: 'none', border: 'none', color: liked === 'up' ? '#34d399' : 'var(--text-muted)', fontSize: '0.75rem', padding: '0.25rem 0.4rem', cursor: 'pointer', opacity: 0.7 }}
        title="Good response (Placeholder)"
      >
        <ThumbsUp size={13} />
      </button>

      {/* Thumbs Down Placeholder */}
      <button
        onClick={() => setLiked(liked === 'down' ? null : 'down')}
        style={{ background: 'none', border: 'none', color: liked === 'down' ? '#f87171' : 'var(--text-muted)', fontSize: '0.75rem', padding: '0.25rem 0.4rem', cursor: 'pointer', opacity: 0.7 }}
        title="Poor response (Placeholder)"
      >
        <ThumbsDown size={13} />
      </button>

      {/* Share Placeholder */}
      <button
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.25rem 0.4rem', cursor: 'pointer', opacity: 0.7 }}
        title="Share response (Placeholder)"
      >
        <Share2 size={13} />
      </button>
    </div>
  );
}
