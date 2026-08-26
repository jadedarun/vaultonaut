import { useEffect } from 'react';
import { useAIWorkspace } from '../../../context/AIWorkspaceContext';
import DocumentInfo from './DocumentInfo';
import SimilarityBadge from './SimilarityBadge';
import ConfidenceIndicator from './ConfidenceIndicator';
import ChunkViewer from './ChunkViewer';
import SourceMetadata from './SourceMetadata';
import SourceActions from './SourceActions';
import AIInsights from './AIInsights';
import DocumentGrouping from './DocumentGrouping';
import { X, Database, Eye, Network } from 'lucide-react';

export default function SourcePanel() {
  const { selectedCitation, setSelectedCitation } = useAIWorkspace();
  const isDevMode = localStorage.getItem('vaultonaut_dev_mode') === 'true' && !!sessionStorage.getItem('vaultonaut_dev_token');

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCitation) {
        setSelectedCitation(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCitation, setSelectedCitation]);

  if (!selectedCitation) return null;

  return (
    <div
      className="glass-card source-panel-container"
      style={{
        width: '360px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
        borderLeft: '1px solid var(--glass-border)'
      }}
    >
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Database size={16} color="var(--color-arctic-1)" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-arctic-1)' }}>Source Explorer</h3>
        </div>

        <button
          onClick={() => setSelectedCitation(null)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
          title="Close panel (Escape)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Document Information Header */}
      <DocumentInfo citation={selectedCitation} />

      {/* RAG Retrieval Reasoning Insights */}
      {isDevMode && <AIInsights citation={selectedCitation} />}

      {/* Similarity & Confidence Badge */}
      {isDevMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Vector Relevance
            </span>
            <ConfidenceIndicator similarityScore={selectedCitation.similarity_score} />
          </div>
          <SimilarityBadge similarityScore={selectedCitation.similarity_score} />
        </div>
      )}

      {/* Document Tree Grouping */}
      <DocumentGrouping 
        documentTitle={selectedCitation.document_title || selectedCitation.filename} 
        chunks={[selectedCitation]} 
        onSelectChunk={(c) => setSelectedCitation(c)} 
      />

      {/* Extracted Chunk Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Source Text Excerpt
        </div>
        <ChunkViewer chunkText={selectedCitation.chunk_text || selectedCitation.snippet || selectedCitation.content || 'Retrieved text chunk snippet unavailable.'} />
      </div>

      {/* Quick Action Buttons */}
      <SourceActions textToCopy={selectedCitation.chunk_text || selectedCitation.snippet || ''} />

      {/* Document Preview Placeholder */}
      <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Eye size={14} color="var(--color-arctic-1)" />
        <span>Document Preview Placeholder (PDF / DOCX Viewer)</span>
      </div>

      {/* Related Knowledge Graph Placeholder */}
      <div style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.1)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Network size={14} color="var(--color-arctic-1)" />
        <span>Related Knowledge Graph (Notes & Conversations)</span>
      </div>

      {/* Developer Mode Vector Metadata */}
      {isDevMode && <SourceMetadata citation={selectedCitation} />}
    </div>
  );
}
