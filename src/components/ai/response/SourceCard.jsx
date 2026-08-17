import { useAIWorkspace } from '../../../context/AIWorkspaceContext';
import { FileText, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function SourceCard({ citation }) {
  const { setSelectedCitation } = useAIWorkspace();

  const scorePct = (floatVal) => (floatVal * 100).toFixed(0);
  const similarityScore = citation.similarity_score || 0.0;
  const matchPct = scorePct(similarityScore);

  const getConfidenceBadge = (score) => {
    if (score >= 0.80) {
      return { label: 'High Confidence', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    } else if (score >= 0.75) {
      return { label: 'Medium Confidence', bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
    } else {
      return { label: 'Low Confidence', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    }
  };

  const confidence = getConfidenceBadge(similarityScore);

  return (
    <div
      onClick={() => setSelectedCitation(citation)}
      style={{
        padding: '0.6rem 0.85rem',
        borderRadius: '0.5rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
          <FileText size={14} color="var(--color-arctic-1)" />
          <span 
            style={{ 
              fontWeight: 600, 
              fontSize: '0.82rem', 
              color: 'var(--color-arctic-1)', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}
            title={citation.document_title || citation.filename}
          >
            {citation.document_title || citation.filename}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '0.3rem',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          Page {citation.page_num || citation.chunk_index + 1}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
        <span>Source Document Reference</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--color-arctic-1)' }}>
          Inspect <ExternalLink size={10} />
        </span>
      </div>
    </div>
  );
}
