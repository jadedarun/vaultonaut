import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import { useDocuments } from '../../context/DocumentContext';
import { Plus, BookOpen } from 'lucide-react';

export default function EmptyState() {
  const { createNewChat, sendPrompt, showToast } = useAIWorkspace();
  const { documents } = useDocuments();

  const suggestedQuestions = [
    "What key concepts are covered in my uploaded documents?",
    "Explain the system design and architecture of Vaultonaut",
    "How does document ingestion and chunking work?",
    "What are the main advantages of RAG systems?"
  ];

  const handleStarterClick = (q) => {
    if (!documents || documents.length === 0) {
      showToast("Please upload a document to the Knowledge Vault first.", "warning");
      return;
    }
    sendPrompt(q);
  };

  return (
    <div 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justify: 'center', 
        padding: '2rem 1.5rem', 
        textAlign: 'center',
        color: 'var(--text-muted)',
        overflowY: 'auto',
        maxHeight: '100%',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div 
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(0, 212, 255, 0.08)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.2rem',
          flexShrink: 0
        }}
      >
        <BookOpen size={32} color="var(--color-arctic-1)" />
      </div>

      <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--color-arctic-1)', margin: '0 0 0.4rem 0' }}>
        Start your first AI conversation
      </h3>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
        Ask questions about your uploaded documents and get grounded answers with source references.
      </p>

      <button className="btn-white-solid" onClick={createNewChat} style={{ padding: '0.65rem 1.4rem', fontWeight: 600, marginBottom: '2rem', flexShrink: 0 }}>
        <Plus size={16} /> New Conversation
      </button>

      {/* Suggested Prompt Pills */}
      <div style={{ width: '100%', maxWidth: '600px', flexShrink: 0 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Suggested Starters
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              className="btn-white-outline"
              onClick={() => handleStarterClick(q)}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', borderRadius: '1rem' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
