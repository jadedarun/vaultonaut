import { useState } from 'react';
import { Database } from 'lucide-react';

export default function RetrievalSettings({ settings }) {
  const [topK, setTopK] = useState(() => {
    return parseInt(localStorage.getItem('vaultonaut_top_k')) || settings?.top_k || 5;
  });
  const [threshold, setThreshold] = useState(() => {
    return parseFloat(localStorage.getItem('vaultonaut_similarity_threshold')) || settings?.similarity_threshold || 0.45;
  });

  const handleTopKChange = (val) => {
    setTopK(val);
    localStorage.setItem('vaultonaut_top_k', val.toString());
  };

  const handleThresholdChange = (val) => {
    setThreshold(val);
    localStorage.setItem('vaultonaut_similarity_threshold', val.toString());
  };

  return (
    <div style={{ padding: '1.2rem', borderRadius: '0.65rem', background: 'rgba(255, 255, 255, 0.025)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Database size={18} color="var(--color-arctic-1)" />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Vector Retrieval & RAG Parameters</h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem' }}>
        {/* Top-K Slider */}
        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Top-K Chunks</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{topK} Chunks</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="1"
            value={topK}
            onChange={(e) => handleTopKChange(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-arctic-1)', cursor: 'pointer' }}
          />
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Number of best chunks retrieved per query.</div>
        </div>

        {/* Similarity Cutoff Slider */}
        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Similarity Cutoff</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>{threshold.toFixed(2)} Cosine</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={threshold}
            onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
          />
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Minimum relevance match confidence.</div>
        </div>

        {/* Embedding Dimension (static info) */}
        <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.2rem', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Embedding Dimension</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-arctic-1)', fontFamily: 'var(--font-mono)' }}>384 Dimensions</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>sentence-transformers/all-MiniLM-L6-v2</div>
        </div>
      </div>
    </div>
  );
}
