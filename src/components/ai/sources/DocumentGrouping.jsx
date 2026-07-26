import { useState } from 'react';
import { FileText, ChevronDown, ChevronRight, Layers } from 'lucide-react';

export default function DocumentGrouping({ documentTitle = 'Document', chunks = [], onSelectChunk }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)', overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '0.6rem 0.8rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 600
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
          <FileText size={14} color="var(--color-arctic-1)" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={documentTitle}>
            {documentTitle}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{chunks.length} Chunks</span>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', background: 'rgba(0,0,0,0.1)' }}>
          {chunks.map((chunk, idx) => (
            <button
              key={idx}
              onClick={() => onSelectChunk(chunk)}
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '0.35rem 0.6rem',
                borderRadius: '0.35rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#e2e8f0',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Layers size={11} color="var(--color-arctic-1)" /> Chunk #{chunk.chunk_index || idx}
              </span>
              <span style={{ color: '#34d399', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {((chunk.similarity_score || 0) * 100).toFixed(0)}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
