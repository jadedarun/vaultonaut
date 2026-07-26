import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import { Sparkles, Plus, BookOpen, Search, FileText } from 'lucide-react';

export default function EmptyState() {
  const { createNewChat, sendPrompt } = useAIWorkspace();

  const suggestedQuestions = [
    "What key concepts are covered in my uploaded documents?",
    "Explain the system design and architecture of Vaultonaut",
    "How does document ingestion and chunking work?",
    "What are the main advantages of RAG systems?"
  ];

  return (
    <div 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justify: 'center', 
        padding: '3rem 1.5rem', 
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}
    >
      <div 
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(0, 212, 255, 0.08)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.2rem'
        }}
      >
        <Sparkles size={38} color="var(--color-arctic-1)" className="logo-icon" />
      </div>

      <h3 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#fff', margin: '0 0 0.4rem 0' }}>
        Start your first AI conversation
      </h3>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
        Ask questions about your uploaded documents. Vaultonaut retrieves precise vector chunks and uses Google Gemini to generate grounded, source-backed answers.
      </p>

      <button className="btn-white-solid" onClick={createNewChat} style={{ padding: '0.65rem 1.4rem', fontWeight: 600, marginBottom: '2rem' }}>
        <Plus size={16} /> New Conversation
      </button>

      {/* Suggested Prompt Pills */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Suggested Starters
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              className="btn-white-outline"
              onClick={() => sendPrompt(q)}
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
