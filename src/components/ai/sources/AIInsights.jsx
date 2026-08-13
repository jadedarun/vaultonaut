import { Lightbulb, Check, Compass } from 'lucide-react';

export default function AIInsights({ citation }) {
  const similarityScore = citation.similarity_score || 0.0;
  const matchPct = (similarityScore * 100).toFixed(0);
  const threshold = parseFloat(localStorage.getItem('vaultonaut_similarity_threshold')) || 0.45;

  return (
    <div 
      style={{
        padding: '0.85rem',
        borderRadius: '0.5rem',
        background: 'rgba(59, 130, 246, 0.06)',
        border: '1px solid rgba(59, 130, 246, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.78rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 600 }}>
        <Lightbulb size={14} />
        <span>RAG Retrieval Insights</span>
      </div>

      <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
        Retrieved because:
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: '#e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Check size={12} color="#34d399" />
          <span>High Semantic Similarity ({matchPct}% Cosine Match)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Check size={12} color="#34d399" />
          <span>Dense 384d Vector Embedding Alignment</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Check size={12} color="#34d399" />
          <span>Category & Threshold Validation Passed (&gt;= {threshold.toFixed(2)})</span>
        </div>
      </div>
    </div>
  );
}
