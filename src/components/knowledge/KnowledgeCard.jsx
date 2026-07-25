import { FileText, Star, Bookmark, Edit, Trash2, Clock, Eye } from 'lucide-react';

export default function KnowledgeCard({ item, onEdit, onDelete, onToggleFav, onTogglePin }) {
  const formattedDate = new Date(item.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '1.2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        justify: 'space-between',
        gap: '1rem',
        textAlign: 'left',
        border: item.pinned ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--glass-border)',
        background: item.pinned ? 'rgba(255, 255, 255, 0.03)' : 'var(--glass-card)',
        transition: 'all 0.2s ease'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.8rem', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', itemsCenter: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge-tag">{item.category}</span>
            {item.pinned && (
              <span className="badge-tag" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}>📌 Pinned</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              className="btn-icon-only" 
              style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
              onClick={() => onTogglePin(item.id)}
              title={item.pinned ? 'Unpin document' : 'Pin to top'}
            >
              <Bookmark size={15} color={item.pinned ? '#ffffff' : 'var(--text-muted)'} />
            </button>
            <button 
              className="btn-icon-only" 
              style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
              onClick={() => onToggleFav(item.id)}
              title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={15} color={item.favorite ? '#eab308' : 'var(--text-muted)'} fill={item.favorite ? '#eab308' : 'none'} />
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-arctic-1)', marginBottom: '0.4rem', lineHeight: '1.3' }}>
          {item.title}
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.content}
        </p>

        {item.tags && item.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
            {item.tags.map((tag, idx) => (
              <span key={idx} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span>{item.word_count || 0} words</span> &bull; <span>{item.reading_time || 1} min read</span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button 
            className="btn-icon-only" 
            style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
            onClick={() => onEdit(item)}
            title="Edit document"
          >
            <Edit size={14} color="var(--color-arctic-3)" />
          </button>
          <button 
            className="btn-icon-only" 
            style={{ padding: '0.3rem', border: 'none', background: 'transparent' }}
            onClick={() => onDelete(item)}
            title="Delete document"
          >
            <Trash2 size={14} color="#ef4444" />
          </button>
        </div>
      </div>
    </div>
  );
}
