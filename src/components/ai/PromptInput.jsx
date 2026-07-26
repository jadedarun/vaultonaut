import { useState, useRef, useEffect } from 'react';
import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import { Send, Square, Paperclip, Mic, WifiOff } from 'lucide-react';

export default function PromptInput() {
  const { sendPrompt, sending, isOnline, activeConversationId, getDraft, saveDraft, stopStreaming } = useAIWorkspace();
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Restore draft when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      const savedDraft = getDraft(activeConversationId);
      setText(savedDraft);
    }
  }, [activeConversationId, getDraft]);

  // Save draft as user types
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (activeConversationId) {
      saveDraft(activeConversationId, val);
    }
  };

  // Global Ctrl+/ keyboard shortcut to focus input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Auto-focus input on mount and when sending finishes
  useEffect(() => {
    if (!sending && isOnline) {
      textareaRef.current?.focus();
    }
  }, [sending, isOnline]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || sending || !isOnline) return;
    const promptToSend = text;
    setText('');
    if (activeConversationId) {
      saveDraft(activeConversationId, '');
    }
    sendPrompt(promptToSend);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' && !e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="chat-input-bar"
      style={{
        padding: '0.8rem 1rem',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        background: 'rgba(255,255,255,0.015)'
      }}
    >
      {/* Attachment Button Placeholder */}
      <button 
        type="button" 
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', opacity: 0.6 }}
        title="Upload attachment (Placeholder)"
      >
        <Paperclip size={18} />
      </button>

      {/* Auto-growing Textarea */}
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={
          !isOnline 
            ? 'Offline - Reconnect internet to send prompts...' 
            : 'Ask Vaultonaut AI (Enter or Ctrl+Enter to send, Shift+Enter newline)...'
        }
        disabled={sending || !isOnline}
        style={{
          flex: 1,
          background: !isOnline ? 'rgba(239,68,68,0.05)' : 'rgba(255, 255, 255, 0.03)',
          border: !isOnline ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.6rem',
          color: '#fff',
          padding: '0.65rem 0.9rem',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          resize: 'none',
          outline: 'none'
        }}
      />

      {/* Voice Button Placeholder */}
      <button 
        type="button" 
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem', opacity: 0.6 }}
        title="Voice prompt (Placeholder)"
      >
        <Mic size={18} />
      </button>

      {/* Send or Stop Generation Button */}
      {sending ? (
        <button 
          type="button" 
          onClick={stopStreaming}
          className="btn-white-solid" 
          style={{ padding: '0.65rem 1.1rem', background: '#ef4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}
          title="Stop AI generation"
        >
          <Square size={13} fill="#fff" /> Stop
        </button>
      ) : (
        <button 
          type="submit" 
          className="btn-action" 
          disabled={!isOnline || !text.trim()} 
          style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {!isOnline ? <WifiOff size={16} /> : <Send size={16} />}
        </button>
      )}
    </form>
  );
}
