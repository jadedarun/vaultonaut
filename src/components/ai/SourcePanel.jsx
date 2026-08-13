import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import { FileText, X, Sparkles, Database } from 'lucide-react';

export default function SourcePanel() {
  const { selectedCitation, setSelectedCitation } = useAIWorkspace();

  if (!selectedCitation) return null;

  return (
    <div 
      className="glass-card source-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1.2rem',
        height: '100%',
        width: '320px',
        flexShrink: 0,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.6rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileText size={16} /> Source Citation Chunk
        </h3>

        <button 
          onClick={() => setSelectedCitation(null)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
          title="Close source panel"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Document:</span>
          <span style={{ fontWeight: 600, color: '#fff' }}>{selectedCitation.document_title || selectedCitation.filename}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Filename:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{selectedCitation.filename}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Chunk Index:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-arctic-1)' }}>#{selectedCitation.chunk_index}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Similarity Match:</span>
          <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
            {(selectedCitation.similarity_score * 100).toFixed(1)}% match
          </span>
        </div>

        <div style={{ marginTop: '0.6rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
            Extracted Vector Chunk Text:
          </span>
          <div 
            style={{ 
              padding: '0.9rem', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '0.5rem', 
              border: '1px solid rgba(255,255,255,0.08)', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.8rem', 
              lineHeight: '1.5', 
              whiteSpace: 'pre-wrap',
              maxHeight: '340px',
              overflowY: 'auto'
            }}
          >
            {selectedCitation.snippet}
          </div>
        </div>
      </div>
    </div>
  );
}
