import { Cpu, Layers, Database } from 'lucide-react';

export default function SourceMetadata({ citation }) {
  const vectorId = citation.vector_id || 'N/A';
  const chunkIndex = citation.chunk_index !== undefined ? citation.chunk_index : 0;
  const rawScore = citation.similarity_score !== undefined ? citation.similarity_score : 0.0;

  return (
    <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Developer Vector Metadata
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Embedding Model:</span>
        <span style={{ color: 'var(--color-arctic-1)' }}>all-MiniLM-L6-v2 (384d)</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Vector ID:</span>
        <span style={{ color: 'var(--color-arctic-1)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={vectorId}>{vectorId}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Chunk Index:</span>
        <span style={{ color: 'var(--color-arctic-1)' }}>#{chunkIndex}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Cosine Score:</span>
        <span style={{ color: '#34d399' }}>{rawScore}</span>
      </div>
    </div>
  );
}
