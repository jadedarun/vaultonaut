import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import MarkdownRenderer from './response/MarkdownRenderer';
import SourceList from './response/SourceList';
import MessageToolbar from './response/MessageToolbar';
import MessageMetadata from './response/MessageMetadata';
import { Cpu, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AssistantMessage({ message }) {
  const { retryLastPrompt, sending } = useAIWorkspace();

  const citations = message.retrieval_metadata?.citations || [];
  const isGrounded = message.grounded !== false && message.retrieval_metadata?.grounded !== false;
  const isFailed = message.status === 'failed';

  if (isFailed) {
    return (
      <div className="chat-msg system" style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.8rem', width: '100%', maxWidth: '85%' }}>
        <div 
          className="avatar" 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={16} />
        </div>

        <div 
          className="msg-bubble"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.2rem 1rem 1rem 1rem',
            padding: '1rem 1.2rem',
            color: '#fca5a5',
            fontSize: '0.9rem',
            flex: 1
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: '#f87171', fontSize: '0.95rem' }}>
            Unable to generate response
          </div>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.9rem', color: 'var(--text-secondary)' }}>
            {message.content || 'The AI service encountered a processing failure or network timeout.'}
          </div>

          <button 
            className="btn-white-solid"
            onClick={retryLastPrompt}
            disabled={sending}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem', background: '#ef4444', color: '#fff', border: 'none' }}
          >
            <RefreshCw size={13} /> Retry Prompt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-msg system" style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.85rem', width: '100%', maxWidth: '88%' }}>
      <div 
        className="avatar" 
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          color: 'var(--color-arctic-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0, 212, 255, 0.1)'
        }}
      >
        <Cpu size={18} />
      </div>

      <div 
        className="msg-bubble assistant-card"
        style={{
          background: 'rgba(255, 255, 255, 0.025)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '0.2rem 1.1rem 1.1rem 1.1rem',
          padding: '1.1rem 1.3rem',
          color: 'var(--color-arctic-1)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}
      >
        {/* Header Grounding Status & Developer Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isGrounded ? '#34d399' : '#fbbf24', fontWeight: 600, fontSize: '0.78rem' }}>
            {isGrounded ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
            {isGrounded ? 'Grounded Answer' : 'Insufficient Context'}
          </span>

          <MessageMetadata metadata={message.retrieval_metadata} />
        </div>

        {/* Markdown Formatted Body */}
        {message.content ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            The AI could not generate a response.
          </div>
        )}

        {/* Source Citation Cards */}
        <SourceList citations={citations} />

        {/* Action Toolbar */}
        <MessageToolbar textContent={message.content} onRegenerate={retryLastPrompt} />
      </div>
    </div>
  );
}
