import { FileText, Sparkles, Folder, Calendar } from 'lucide-react';

export default function DocumentInfo({ citation }) {
  const title = citation.document_title || citation.filename || 'Document';
  const filename = citation.filename || 'File';
  const category = citation.category || 'General';

  return (
    <div 
      style={{
        padding: '0.9rem',
        borderRadius: '0.6rem',
        background: 'var(--input-bg)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
          <FileText size={18} color="var(--color-arctic-1)" />
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-arctic-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={title}>
            {title}
          </h4>
        </div>

        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '0.35rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
          <Sparkles size={11} /> AI Ready
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Folder size={12} /> {category}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={12} /> {filename}
        </span>
      </div>
    </div>
  );
}
