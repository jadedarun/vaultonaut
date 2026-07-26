import { useState } from 'react';
import { useAIWorkspace } from '../../context/AIWorkspaceContext';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';

export default function ConversationItem({ conversation }) {
  const { activeConversationId, selectConversation, renameChat, deleteChat } = useAIWorkspace();
  const isSelected = activeConversationId === conversation.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

  const handleSaveRename = (e) => {
    e.stopPropagation();
    if (editTitle.trim() && editTitle.trim() !== conversation.title) {
      renameChat(conversation.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={() => !isEditing && selectConversation(conversation.id)}
      style={{
        padding: '0.65rem 0.85rem',
        borderRadius: '0.55rem',
        background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isSelected ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        transition: 'all 0.15s ease',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <MessageSquare size={14} color={isSelected ? 'var(--color-arctic-1)' : 'var(--text-muted)'} />
          
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveRename(e);
                if (e.key === 'Escape') handleCancelRename(e);
              }}
              autoFocus
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid var(--color-arctic-1)',
                borderRadius: '0.3rem',
                color: '#fff',
                fontSize: '0.82rem',
                padding: '0.1rem 0.4rem',
                width: '100%'
              }}
            />
          ) : (
            <span 
              style={{ 
                fontSize: '0.82rem', 
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={conversation.title}
            >
              {conversation.title}
            </span>
          )}
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          {isEditing ? (
            <>
              <button onClick={handleSaveRename} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', padding: '0.15rem' }}>
                <Check size={13} />
              </button>
              <button onClick={handleCancelRename} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.15rem' }}>
                <X size={13} />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.15rem', opacity: isSelected ? 0.9 : 0.5 }}
                title="Rename conversation"
              >
                <Edit2 size={12} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteChat(conversation.id); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.15rem', opacity: isSelected ? 0.9 : 0.5 }}
                title="Delete conversation"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span>{formatRelativeTime(conversation.updated_at || conversation.created_at)}</span>
      </div>
    </div>
  );
}
