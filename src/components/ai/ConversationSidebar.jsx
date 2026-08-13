import { useState } from 'react';
import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import ConversationItem from './ConversationItem';
import { Plus, Search, MessageSquare, X, GripVertical } from 'lucide-react';

export default function ConversationSidebar() {
  const { conversations, createNewChat, loading, sidebarOpen, setSidebarOpen, searchInputRef } = useAIWorkspace();
  const { sidebarWidth, startResizing } = useResizableSidebar();
  const [filterQuery, setFilterQuery] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'relative',
        width: `${sidebarWidth}px`,
        height: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className={`glass-card conversation-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem',
          height: '100%',
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn-white-solid" 
            onClick={createNewChat}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.65rem' }}
          >
            <Plus size={16} /> New Conversation
          </button>

          <button 
            className="mobile-only"
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '0.5rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Filter with Ctrl+K shortcut ref */}
        <div style={{ position: 'relative' }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search conversations (Ctrl+K)..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.2rem', fontSize: '0.8rem', padding: '0.45rem 0.6rem 0.45rem 2.2rem' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        {/* Conversation Thread List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto', flex: 1 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
            Conversations ({filteredConversations.length})
          </span>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                style={{
                  height: '42px',
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  animation: 'pulse 1.5s infinite ease-in-out'
                }} 
              />
            ))
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '2rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <MessageSquare size={24} style={{ opacity: 0.3, marginBottom: '0.4rem' }} />
              <p style={{ margin: 0 }}>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <ConversationItem key={conv.id} conversation={conv} />
            ))
          )}
        </div>
      </div>

      {/* Resize Handle for Desktop Layout */}
      <div
        onMouseDown={startResizing}
        style={{
          position: 'absolute',
          top: 0,
          right: '-8px',
          width: '8px',
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.3,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
        title="Drag to resize sidebar"
      >
        <GripVertical size={12} color="var(--color-arctic-1)" />
      </div>
    </div>
  );
}
