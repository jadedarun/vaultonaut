import { useState } from 'react';
import { Search } from 'lucide-react';

export default function ChunkViewer({ chunkText = '' }) {
  const [searchQuery, setSearchQuery] = useState('');

  const renderHighlightedText = (text, query) => {
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ background: 'rgba(234, 179, 8, 0.3)', color: '#fef08a', borderRadius: '0.2rem', padding: '0 0.2rem' }}>
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {/* In-chunk search filter */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Filter text within chunk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '2rem', fontSize: '0.78rem', padding: '0.35rem 0.6rem 0.35rem 2rem' }}
        />
        <Search size={12} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>

      {/* Extracted Chunk Content Box */}
      <div
        style={{
          padding: '0.9rem',
          background: 'rgba(255,255,255,0.025)',
          borderRadius: '0.5rem',
          border: '1px solid var(--glass-border)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          lineHeight: '1.55',
          whiteSpace: 'pre-wrap',
          maxHeight: '320px',
          overflowY: 'auto',
          color: '#e2e8f0'
        }}
      >
        {renderHighlightedText(chunkText, searchQuery)}
      </div>
    </div>
  );
}
