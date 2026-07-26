import { Database, Filter, Layers, Sliders } from 'lucide-react';

export default function RetrievalSettings({ settings }) {
  const topK = settings?.top_k || 5;
  const threshold = settings?.similarity_threshold || 0.75;
  const embeddingModel = settings?.embedding_model || 'all-MiniLM-L6-v2';

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Database size={18} color="var(--color-arctic-1)" />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Vector Retrieval & RAG Parameters</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top-K Chunks</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{topK} Vector Chunks</div>
        </div>

        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Similarity Cutoff</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>{threshold} Cosine</div>
        </div>

        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Embedding Dimension</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>384 Dimensions</div>
        </div>
      </div>
    </div>
  );
}
