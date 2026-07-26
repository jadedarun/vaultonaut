import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import ChatHeader from './ChatHeader';
import StatusBanner from './StatusBanner';
import MessageList from './MessageList';
import EmptyState from './EmptyState';
import PromptInput from './PromptInput';
import ChatErrorBoundary from './ChatErrorBoundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ChatWindow() {
  const { messages, error, retryLoad, loading } = useAIWorkspace();

  return (
    <ChatErrorBoundary>
      <div 
        className="glass-card chat-window-container" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <ChatHeader />
        <StatusBanner />

        {error ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={36} color="#f87171" style={{ marginBottom: '0.8rem' }} />
            <h3 style={{ margin: '0 0 0.4rem 0', color: '#f87171', fontSize: '1.1rem' }}>Connection Failed</h3>
            <p style={{ margin: '0 0 1.2rem 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{error}</p>
            <button className="btn-white-solid" onClick={retryLoad} style={{ padding: '0.55rem 1.2rem', fontSize: '0.85rem' }}>
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        ) : messages.length === 0 && !loading ? (
          <EmptyState />
        ) : (
          <MessageList />
        )}

        <PromptInput />
      </div>
    </ChatErrorBoundary>
  );
}
