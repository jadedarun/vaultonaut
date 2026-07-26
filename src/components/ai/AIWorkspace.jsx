import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import ConversationSidebar from './ConversationSidebar';
import ChatWindow from './ChatWindow';
import SourcePanel from './sources/SourcePanel';

export default function AIWorkspace() {
  const { selectedCitation } = useAIWorkspace();

  return (
    <div 
      className="ai-workspace-container"
      style={{
        display: 'flex',
        height: 'calc(100vh - 70px)',
        width: '100%',
        gap: '1rem',
        padding: '1rem',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <ConversationSidebar />
      <div style={{ flex: 1, height: '100%', minWidth: 0 }}>
        <ChatWindow />
      </div>
      {selectedCitation && <SourcePanel />}
    </div>
  );
}
