import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import { Plus, RefreshCw, Settings, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatHeader() {
  const { createNewChat, retryLoad, setSidebarOpen, activeConversation } = useAIWorkspace();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '0.8rem 1.2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <button 
          className="btn-icon-only mobile-only" 
          onClick={() => setSidebarOpen(prev => !prev)}
          style={{ display: 'none', padding: '0.4rem', border: '1px solid var(--glass-border)' }}
          title="Toggle conversation list"
        >
          <Menu size={18} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-arctic-1)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            AI Workspace
            {activeConversation && (
              <span style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                &bull; {activeConversation.title}
              </span>
            )}
          </h2>
          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Chat with your personal knowledge grounded by Google Gemini & ChromaDB.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button className="btn-white-solid" onClick={createNewChat} style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
          <Plus size={15} /> New Chat
        </button>
        
        <button className="btn-white-outline" onClick={retryLoad} title="Refresh AI Workspace" style={{ fontSize: '0.82rem', padding: '0.45rem' }}>
          <RefreshCw size={15} />
        </button>

        <button 
          className="btn-white-outline" 
          onClick={() => navigate('/settings/ai')} 
          title="AI Settings & Diagnostics" 
          style={{ fontSize: '0.82rem', padding: '0.45rem' }}
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}
